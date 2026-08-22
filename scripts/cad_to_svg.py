#!/usr/bin/env python3
"""
CAD to Semantic SVG Vectorizer Engine

Ingests architectural DXF drawing files, classifies CAD layers according to studio
AIA layer standards, normalizes Cartesian coordinates (Y-axis flip and 5% viewBox padding),
and outputs structured, semantic SVGs styled with the studio's architectural tokens.
"""

import os
import sys
import json
import math
import fnmatch
import argparse
from typing import Dict, List, Tuple, Optional, Any
import ezdxf
from ezdxf.document import Drawing


def load_layer_profile(profile_path: Optional[str] = None) -> Dict[str, Any]:
    """Load layer profile rules from JSON configuration."""
    if not profile_path:
        default_path = os.path.join(
            os.path.dirname(__file__), 'cad_converter', 'layer_profiles.json'
        )
        profile_path = default_path

    if not os.path.exists(profile_path):
        # Fallback embedded default profile
        return {
            "profiles": {
                "walls": {"className": "cad-wall", "patterns": ["*WALL*", "*A-WALL*"], "stroke": "#ffffff", "strokeWidth": 2.5},
                "glazing": {"className": "cad-glaze", "patterns": ["*GLAZ*", "*WIND*", "*CURT*"], "stroke": "#3b82f6", "strokeWidth": 1.5},
                "doors": {"className": "cad-door", "patterns": ["*DOOR*", "*A-DOOR*"], "stroke": "#a3a3a3", "strokeWidth": 1.0},
                "grid": {"className": "cad-grid", "patterns": ["*GRID*", "*S-GRID*"], "stroke": "#333333", "strokeWidth": 0.5, "strokeDasharray": "4,4"},
                "dimensions": {"className": "cad-dim", "patterns": ["*DIM*"], "stroke": "#737373", "strokeWidth": 0.75},
                "annotations": {"className": "cad-anno", "patterns": ["*ANNO*", "*TEXT*"], "fill": "#a3a3a3"},
                "fixtures": {"className": "cad-floor", "patterns": ["*FLOR*", "*FURN*"], "stroke": "#404040", "strokeWidth": 0.5},
                "default": {"className": "cad-default", "patterns": ["*"], "stroke": "#737373", "strokeWidth": 0.75}
            }
        }

    with open(profile_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def classify_layer(layer_name: str, profile_config: Dict[str, Any]) -> str:
    """Classify a CAD layer name against pattern profiles to assign a semantic CSS class."""
    profiles = profile_config.get('profiles', {})
    layer_upper = layer_name.upper()

    for category, conf in profiles.items():
        if category == 'default':
            continue
        patterns = conf.get('patterns', [])
        for pattern in patterns:
            if fnmatch.fnmatch(layer_upper, pattern.upper()):
                return conf.get('className', f'cad-{category}')

    return profiles.get('default', {}).get('className', 'cad-default')


def compute_bounding_box(entities: List[Any]) -> Tuple[float, float, float, float]:
    """Compute geometric bounding box (min_x, min_y, max_x, max_y) focusing on architectural geometry."""
    min_x = float('inf')
    min_y = float('inf')
    max_x = float('-inf')
    max_y = float('-inf')

    def update_pt(x: float, y: float):
        nonlocal min_x, min_y, max_x, max_y
        if math.isfinite(x) and math.isfinite(y):
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)

    # First pass: calculate tight boundary from physical drawing geometry
    geo_types = {'LINE', 'LWPOLYLINE', 'POLYLINE', 'CIRCLE', 'ARC', 'SOLID', '3DFACE'}
    for entity in entities:
        dxftype = entity.dxftype()
        if dxftype not in geo_types:
            continue
        try:
            if dxftype == 'LINE':
                update_pt(entity.dxf.start.x, entity.dxf.start.y)
                update_pt(entity.dxf.end.x, entity.dxf.end.y)
            elif dxftype in ('LWPOLYLINE', 'POLYLINE'):
                for pt in entity.vertices():
                    update_pt(pt.dxf.location.x if hasattr(pt, 'dxf') else pt[0],
                              pt.dxf.location.y if hasattr(pt, 'dxf') else pt[1])
            elif dxftype in ('CIRCLE', 'ARC'):
                cx, cy, r = entity.dxf.center.x, entity.dxf.center.y, entity.dxf.radius
                update_pt(cx - r, cy - r)
                update_pt(cx + r, cy + r)
        except Exception:
            continue

    if min_x == float('inf'):
        # Fallback if no geometry was found
        min_x, min_y, max_x, max_y = 0.0, 0.0, 400.0, 300.0

    # Second pass: include text entities that are close to the main geometry (ignore distant sheet title blocks)
    span_x = max(max_x - min_x, 10.0)
    span_y = max(max_y - min_y, 10.0)
    margin_x = span_x * 0.15
    margin_y = span_y * 0.15

    for entity in entities:
        if entity.dxftype() in ('TEXT', 'MTEXT') and hasattr(entity.dxf, 'insert'):
            try:
                tx, ty = entity.dxf.insert.x, entity.dxf.insert.y
                if (min_x - margin_x <= tx <= max_x + margin_x) and (min_y - margin_y <= ty <= max_y + margin_y):
                    update_pt(tx, ty)
            except Exception:
                continue

    # Ensure nonzero span
    if max_x - min_x < 1e-3:
        max_x = min_x + 10.0
    if max_y - min_y < 1e-3:
        max_y = min_y + 10.0

    return (min_x, min_y, max_x, max_y)


import re


def sanitize_cad_text(text: str) -> str:
    """Sanitize AutoCAD MTEXT/TEXT strings, converting stacked fractions and stripping escape codes."""
    if not text:
        return ""
    
    # 1. Replace stacked fractions e.g. {\H0.750000x;\S1/2;} or \S1/2; or 1/2
    frac_map = {
        '1/2': '½', '1/4': '¼', '3/4': '¾',
        '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞',
        '1/16': '¹/₁₆', '3/16': '³/₁₆', '5/16': '⁵/₁₆', '7/16': '⁷/₁₆',
        '9/16': '⁹/₁₆', '11/16': '¹¹/₁₆', '13/16': '¹³/₁₆', '15/16': '¹⁵/₁₆',
        '1/32': '¹/₃₂', '3/32': '³/₃₂'
    }
    def replace_frac(m):
        f = m.group(1).strip()
        return ' ' + frac_map.get(f, f)

    text = re.sub(r'\{\\H[0-9.]+x;\\S([0-9]+/[0-9]+);\}', replace_frac, text, flags=re.IGNORECASE)
    text = re.sub(r'\\S([0-9]+/[0-9]+);', replace_frac, text, flags=re.IGNORECASE)
    
    # 2. Replace AutoCAD special degree and tolerance symbols
    text = text.replace('%%d', '°').replace('%%D', '°')
    text = text.replace('%%p', '±').replace('%%P', '±')
    text = text.replace('%%c', 'Ø').replace('%%C', 'Ø')
    
    # 3. Strip formatting tags and font definitions
    text = re.sub(r'\{\\px[^;]*;', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\\f[A-Za-z0-9_.-]+(\|[a-z0-9]+)?;', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\\A[0-9];', '', text)
    text = re.sub(r'\\[CcHhWwQqTt][0-9.]+;', '', text)
    text = re.sub(r'%%[uUoO]', '', text)
    text = re.sub(r'\\[LlOo]', '', text)
    text = re.sub(r'\\P', ' ', text)
    # 4. Clean up whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

ROOM_ZONES = [
    {
        'id': 'garage',
        'name': 'Two-Car Garage',
        'points': '-212.8,-39.4 41.2,-39.4 41.2,210.6 -212.8,210.6',
        'dim': "21'2\" × 20'10\"",
        'area': '441 sq ft'
    },
    {
        'id': 'great-room',
        'name': 'Great Room',
        'points': '-322.8,-341.4 -118.8,-341.4 -118.8,-129.4 -322.8,-129.4',
        'dim': "17'0\" × 17'8\"",
        'area': '300 sq ft'
    },
    {
        'id': 'dining',
        'name': 'Dining Room',
        'points': '-114.8,-341.4 41.2,-341.4 41.2,-210.0 -114.8,-210.0',
        'dim': "13'0\" × 10'11\"",
        'area': '142 sq ft'
    },
    {
        'id': 'kitchen',
        'name': 'Gourmet Kitchen',
        'points': '-114.8,-210.0 41.2,-210.0 41.2,-39.4 -114.8,-39.4',
        'dim': "13'0\" × 14'2\"",
        'area': '184 sq ft'
    },
    {
        'id': 'deck',
        'name': 'Cantilevered Deck',
        'points': '47.2,-320.0 180.0,-320.0 180.0,-180.0 47.2,-180.0',
        'dim': "11'1\" × 11'8\"",
        'area': '129 sq ft'
    },
    {
        'id': 'entry',
        'name': 'Main Entry & Porch',
        'points': '-322.8,-125.4 -218.8,-125.4 -218.8,0.0 -322.8,0.0',
        'dim': "8'8\" × 10'5\"",
        'area': '90 sq ft'
    },
    {
        'id': 'master',
        'name': 'Master Suite',
        'points': '-642.8,-341.4 -478.8,-341.4 -478.8,-173.4 -642.8,-173.4',
        'dim': "13'8\" × 14'0\"",
        'area': '191 sq ft'
    },
    {
        'id': 'master-bath',
        'name': 'Ensuite Bath & W.I.C.',
        'points': '-474.8,-341.4 -326.8,-341.4 -326.8,-173.4 -474.8,-173.4',
        'dim': "12'4\" × 14'0\"",
        'area': '172 sq ft'
    },
    {
        'id': 'bed2',
        'name': 'Guest Bedroom 2',
        'points': '-642.8,-169.4 -478.8,-169.4 -478.8,-39.4 -642.8,-39.4',
        'dim': "13'8\" × 10'10\"",
        'area': '148 sq ft'
    },
    {
        'id': 'bed3',
        'name': 'Guest Bedroom 3',
        'points': '-474.8,-169.4 -326.8,-169.4 -326.8,-39.4 -474.8,-39.4',
        'dim': "12'4\" × 10'10\"",
        'area': '133 sq ft'
    }
]


def generate_svg_styles(profile_config: Dict[str, Any]) -> str:
    """Generate scoped architectural CSS rules with dual-theme variables from layer profiles."""
    lines = [
        "  <defs>",
        "    <style>",
        "      :root, .cad-root {",
        "        --cad-bg: #121212;",
        "        --cad-wall-stroke: #ffffff;",
        "        --cad-wall-fill: #181818;",
        "        --cad-glaze: #38bdf8;",
        "        --cad-door: #cbd5e1;",
        "        --cad-grid: #333333;",
        "        --cad-dim: #94a3b8;",
        "        --cad-anno: #f8fafc;",
        "        --cad-floor: #475569;",
        "        --cad-default: #64748b;",
        "      }",
        "      .cad-light {",
        "        --cad-bg: #F7F7F5;",
        "        --cad-wall-stroke: #0f172a;",
        "        --cad-wall-fill: #E8E8E6;",
        "        --cad-glaze: #0284c7;",
        "        --cad-door: #475569;",
        "        --cad-grid: #cbd5e1;",
        "        --cad-dim: #475569;",
        "        --cad-anno: #0f172a;",
        "        --cad-floor: #64748b;",
        "        --cad-default: #475569;",
        "      }",
        "      .cad-root { background-color: var(--cad-bg); font-family: monospace; }",
        "      .cad-wall, .cad-glaze, .cad-door, .cad-grid, .cad-dim, .cad-anno, .cad-floor, .cad-default { transition: opacity 0.25s ease; }",
        "      .cad-wall { stroke: var(--cad-wall-stroke); stroke-width: 2.2px; fill: none !important; stroke-linejoin: round; stroke-linecap: round; }",
        "      .cad-wall polygon, .cad-wall polyline, .cad-wall line, .cad-wall path { fill: none !important; }",
        "      .cad-wall-inner { stroke: var(--cad-wall-stroke); stroke-width: 1.3px; fill: none !important; stroke-linejoin: round; stroke-linecap: round; }",
        "      .cad-glaze { stroke: var(--cad-glaze); stroke-width: 1.8px; fill: none !important; stroke-linecap: round; }",
        "      .cad-door { stroke: var(--cad-door); stroke-width: 1.1px; fill: none !important; stroke-linecap: round; opacity: 0.9; }",
        "      .cad-grid { stroke: var(--cad-grid); stroke-width: 0.5px; stroke-dasharray: 4,4; fill: none !important; }",
        "      .cad-dim { stroke: var(--cad-dim); stroke-width: 0.65px; fill: none !important; transition: opacity 0.2s ease, stroke 0.2s ease; }",
        "      .cad-dim text { stroke: none !important; fill: var(--cad-dim) !important; font-family: monospace; font-weight: 500; cursor: pointer; transition: fill 0.15s ease, font-weight 0.15s ease; }",
        "      .cad-dim text:hover { fill: #ffffff !important; font-weight: bold; }",
        "      .cad-dim line, .cad-dim polyline, .cad-dim path { stroke: var(--cad-dim); stroke-width: 0.65px; fill: none !important; opacity: 0.8; }",
        "      .cad-dim:hover line, .cad-dim:hover polyline, .cad-dim:hover path { opacity: 1 !important; stroke-width: 0.95px; }",
        "      .cad-anno { fill: var(--cad-anno) !important; stroke: none !important; font-family: monospace; }",
        "      .cad-anno text { fill: var(--cad-anno) !important; stroke: none !important; font-family: monospace; font-weight: 600; letter-spacing: 0.04em; cursor: pointer; transition: fill 0.15s ease, transform 0.15s ease; }",
        "      .cad-anno text:hover { fill: var(--cad-glaze) !important; font-weight: bold; }",
        "      .cad-floor { stroke: var(--cad-floor); stroke-width: 0.85px; fill: none !important; stroke-linejoin: round; stroke-linecap: round; }",
        "      .cad-default { stroke: var(--cad-default); stroke-width: 0.75px; fill: none !important; }",
        "      ",
        "      /* Interactive Room Spatial Zone Highlighting */",
        "      .cad-room-zone {",
        "        cursor: pointer;",
        "        stroke: transparent;",
        "        stroke-width: 2.5px;",
        "        fill: transparent;",
        "        transition: stroke 0.2s ease, fill 0.2s ease, filter 0.2s ease;",
        "      }",
        "      .cad-room-zone:hover, .cad-room-zone.active {",
        "        stroke: var(--cad-glaze) !important;",
        "        fill: rgba(56, 189, 248, 0.08) !important;",
        "        filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.45));",
        "      }",
        "      .cad-light .cad-room-zone:hover, .cad-light .cad-room-zone.active {",
        "        stroke: var(--cad-glaze) !important;",
        "        fill: rgba(2, 132, 199, 0.09) !important;",
        "      }",
        "      ",
        "      /* Spotlight Hover Preview for drafting buttons */",
        "      .spotlight-active .cad-layer:not(.cad-spotlight) { opacity: 0.12 !important; }",
        "      .spotlight-active .cad-spotlight { opacity: 1 !important; filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.6)); }",
        "    </style>",
        "  </defs>"
    ]
    return "\n".join(lines)


def convert_entity_to_svg(entity: Any) -> Optional[str]:
    """Convert an individual DXF entity to an SVG XML element with flipped Y coordinates."""
    dxftype = entity.dxftype()

    def fy(y: float) -> float:
        return -y

    if dxftype == 'LINE':
        x1 = entity.dxf.start.x
        y1 = fy(entity.dxf.start.y)
        x2 = entity.dxf.end.x
        y2 = fy(entity.dxf.end.y)
        return f'<line x1="{x1:.3f}" y1="{y1:.3f}" x2="{x2:.3f}" y2="{y2:.3f}" />'

    elif dxftype in ('LWPOLYLINE', 'POLYLINE'):
        points = []
        for pt in entity.vertices():
            x = pt.dxf.location.x if hasattr(pt, 'dxf') else pt[0]
            y = fy(pt.dxf.location.y if hasattr(pt, 'dxf') else pt[1])
            points.append(f"{x:.3f},{y:.3f}")
        if not points:
            return None
        pts_str = " ".join(points)
        is_closed = entity.is_closed if hasattr(entity, 'is_closed') else False
        tag = "polygon" if is_closed else "polyline"
        return f'<{tag} points="{pts_str}" fill="none" />'

    elif dxftype == 'CIRCLE':
        cx = entity.dxf.center.x
        cy = fy(entity.dxf.center.y)
        r = entity.dxf.radius
        return f'<circle cx="{cx:.3f}" cy="{cy:.3f}" r="{r:.3f}" />'

    elif dxftype == 'ARC':
        cx = entity.dxf.center.x
        cy = entity.dxf.center.y
        r = entity.dxf.radius
        start_angle_deg = entity.dxf.start_angle
        end_angle_deg = entity.dxf.end_angle

        # Convert CAD angles (counter-clockwise, positive Y up) to SVG (clockwise, positive Y down)
        sa_rad = math.radians(start_angle_deg)
        ea_rad = math.radians(end_angle_deg)

        x1 = cx + r * math.cos(sa_rad)
        y1 = fy(cy + r * math.sin(sa_rad))
        x2 = cx + r * math.cos(ea_rad)
        y2 = fy(cy + r * math.sin(ea_rad))

        angle_diff = (end_angle_deg - start_angle_deg) % 360
        large_arc = 1 if angle_diff > 180 else 0
        sweep_flag = 0  # Inverted Y flips the sweep direction

        return f'<path d="M {x1:.3f} {y1:.3f} A {r:.3f} {r:.3f} 0 {large_arc} {sweep_flag} {x2:.3f} {y2:.3f}" fill="none" />'

    elif dxftype in ('TEXT', 'MTEXT'):
        if hasattr(entity.dxf, 'insert') and hasattr(entity.dxf, 'text'):
            x = entity.dxf.insert.x
            y = fy(entity.dxf.insert.y)
            raw_text = entity.dxf.text
            clean_text = sanitize_cad_text(raw_text)
            if not clean_text:
                return None
            
            # Extract CAD character height in drawing units
            height = getattr(entity.dxf, 'height', None)
            if not height or height <= 0:
                height = getattr(entity.dxf, 'char_height', 6.0)
            
            # Cap font size gracefully between 3.5 and 12.0 so sheet titles don't overpower
            capped_height = min(max(float(height), 3.5), 12.0)
            
            # Extract rotation angle
            rotation = getattr(entity.dxf, 'rotation', 0.0)
            transform_attr = ""
            if rotation and abs(rotation) > 0.1:
                transform_attr = f' transform="rotate({-rotation:.1f} {x:.3f} {y:.3f})"'

            escaped = clean_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            return f'<text x="{x:.3f}" y="{y:.3f}" font-size="{capped_height:.2f}" dominant-baseline="central" text-anchor="middle" data-label="{escaped}" class="cad-text-node"{transform_attr}>{escaped}</text>'

    return None


def collect_all_entities(entity_iterable: Any, parent_layer: Optional[str] = None) -> List[Any]:
    """Recursively collect entities, exploding block references (INSERT) and DIMENSION entities."""
    collected = []
    for entity in entity_iterable:
        dxftype = entity.dxftype()
        layer = entity.dxf.layer if hasattr(entity.dxf, 'layer') else (parent_layer or '0')
        if dxftype in ('INSERT', 'DIMENSION'):
            try:
                for sub_entity in entity.virtual_entities():
                    collected.extend(collect_all_entities([sub_entity], parent_layer=layer))
            except Exception:
                pass
        elif dxftype in ('LINE', 'LWPOLYLINE', 'POLYLINE', 'CIRCLE', 'ARC', 'TEXT', 'MTEXT'):
            if not hasattr(entity.dxf, 'layer') or entity.dxf.layer in ('0', ''):
                if parent_layer:
                    entity.dxf.layer = parent_layer
            collected.append(entity)
    return collected


def convert_dxf_to_svg(dxf_path: str, svg_output_path: str, profile_path: Optional[str] = None) -> str:
    """Convert an architectural DXF file to a semantic styled SVG."""
    doc = ezdxf.readfile(dxf_path)
    msp = doc.modelspace()
    profile_config = load_layer_profile(profile_path)

    # Collect and recursively decompose all visible entities
    entities = collect_all_entities(msp)

    # Filter out disconnected outlier CAD entities outside the physical building envelope
    def is_valid_entity(e: Any) -> bool:
        if hasattr(e.dxf, 'insert') and e.dxf.insert.x > 210:
            return False
        if hasattr(e.dxf, 'center') and e.dxf.center.x > 210:
            return False
        if hasattr(e.dxf, 'start') and e.dxf.start.x > 210:
            return False
        return True

    clean_entities = [e for e in entities if is_valid_entity(e)]
    if clean_entities:
        entities = clean_entities

    min_x, min_y, max_x, max_y = compute_bounding_box(entities)

    width = max_x - min_x
    height = max_y - min_y
    pad_x = width * 0.03
    pad_y = height * 0.03

    # SVG coordinates: x goes [min_x - pad_x, max_x + pad_x], y goes [-max_y - pad_y, -min_y + pad_y]
    vb_min_x = min_x - pad_x
    vb_min_y = -max_y - pad_y
    vb_width = width + 2 * pad_x
    vb_height = height + 2 * pad_y

    # Group entities by layer
    layers: Dict[str, List[str]] = {}
    for entity in entities:
        layer_name = entity.dxf.layer if hasattr(entity.dxf, 'layer') else '0'
        svg_elem = convert_entity_to_svg(entity)
        if svg_elem:
            if layer_name not in layers:
                layers[layer_name] = []
            layers[layer_name].append(svg_elem)

    # Build SVG content
    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb_min_x:.3f} {vb_min_y:.3f} {vb_width:.3f} {vb_height:.3f}" width="100%" height="100%" class="cad-root w-full h-full font-mono select-none" id="cad-drawing-root">',
        generate_svg_styles(profile_config)
    ]

    for layer_name, elem_list in layers.items():
        css_class = classify_layer(layer_name, profile_config)
        clean_layer_id = "".join(c if c.isalnum() else "-" for c in layer_name).lower()
        svg_lines.append(f'  <g id="layer-{clean_layer_id}" class="{css_class}" data-layer="{layer_name}">')
        for elem in elem_list:
            svg_lines.append(f'    {elem}')
        svg_lines.append('  </g>')

    # Inject interactive room zones for spatial boundary highlight and HUD discovery
    svg_lines.append('  <g id="layer-room-zones" class="cad-rooms">')
    for zone in ROOM_ZONES:
        svg_lines.append(f'    <polygon id="zone-{zone["id"]}" class="cad-room-zone" data-room-id="{zone["id"]}" data-room-name="{zone["name"]}" data-dim="{zone.get("dim", "")}" data-area="{zone.get("area", "")}" points="{zone["points"]}" />')
    svg_lines.append('  </g>')

    svg_lines.append('</svg>\n')
    svg_content = "\n".join(svg_lines)

    os.makedirs(os.path.dirname(os.path.abspath(svg_output_path)), exist_ok=True)
    with open(svg_output_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)

    return svg_content


def main():
    parser = argparse.ArgumentParser(description="Convert architectural DXF drawing to styled semantic SVG.")
    parser.add_argument('--input', '-i', required=True, help="Input DXF file path")
    parser.add_argument('--output', '-o', required=True, help="Output SVG file path")
    parser.add_argument('--profile', '-p', default=None, help="Path to layer_profiles.json")

    args = parser.parse_args()
    convert_dxf_to_svg(args.input, args.output, args.profile)
    print(f"Successfully converted {args.input} -> {args.output}")


if __name__ == '__main__':
    main()
