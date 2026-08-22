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
    """Compute geometric bounding box (min_x, min_y, max_x, max_y) across entities."""
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

    for entity in entities:
        dxftype = entity.dxftype()
        try:
            if dxftype == 'LINE':
                update_pt(entity.dxf.start.x, entity.dxf.start.y)
                update_pt(entity.dxf.end.x, entity.dxf.end.y)
            elif dxftype in ('LWPOLYLINE', 'POLYLINE'):
                for pt in entity.vertices():
                    update_pt(pt.dxf.location.x if hasattr(pt, 'dxf') else pt[0],
                              pt.dxf.location.y if hasattr(pt, 'dxf') else pt[1])
            elif dxftype == 'CIRCLE':
                cx, cy, r = entity.dxf.center.x, entity.dxf.center.y, entity.dxf.radius
                update_pt(cx - r, cy - r)
                update_pt(cx + r, cy + r)
            elif dxftype == 'ARC':
                cx, cy, r = entity.dxf.center.x, entity.dxf.center.y, entity.dxf.radius
                update_pt(cx - r, cy - r)
                update_pt(cx + r, cy + r)
            elif dxftype in ('TEXT', 'MTEXT'):
                if hasattr(entity.dxf, 'insert'):
                    update_pt(entity.dxf.insert.x, entity.dxf.insert.y)
        except Exception:
            continue

    if min_x == float('inf'):
        return (0.0, 0.0, 400.0, 300.0)

    # Ensure nonzero span
    if max_x - min_x < 1e-3:
        max_x = min_x + 10.0
    if max_y - min_y < 1e-3:
        max_y = min_y + 10.0

    return (min_x, min_y, max_x, max_y)


def generate_svg_styles(profile_config: Dict[str, Any]) -> str:
    """Generate scoped architectural CSS rules with dual-theme variables from layer profiles."""
    lines = [
        "  <defs>",
        "    <style>",
        "      :root, .cad-root {",
        "        --cad-bg: #121212;",
        "        --cad-wall-stroke: #ffffff;",
        "        --cad-wall-fill: #181818;",
        "        --cad-glaze: #3b82f6;",
        "        --cad-door: #a3a3a3;",
        "        --cad-grid: #333333;",
        "        --cad-dim: #737373;",
        "        --cad-anno: #a3a3a3;",
        "        --cad-floor: #404040;",
        "        --cad-default: #737373;",
        "      }",
        "      .cad-light {",
        "        --cad-bg: #F7F7F5;",
        "        --cad-wall-stroke: #121212;",
        "        --cad-wall-fill: #E8E8E6;",
        "        --cad-glaze: #2563eb;",
        "        --cad-door: #4b5563;",
        "        --cad-grid: #d1d5db;",
        "        --cad-dim: #4b5563;",
        "        --cad-anno: #1f2937;",
        "        --cad-floor: #6b7280;",
        "        --cad-default: #4b5563;",
        "      }",
        "      .cad-root { background-color: var(--cad-bg); font-family: monospace; }",
        "      .cad-wall { stroke: var(--cad-wall-stroke); stroke-width: 2.0px; fill: var(--cad-wall-fill); stroke-linejoin: round; stroke-linecap: round; }",
        "      .cad-wall-inner { stroke: var(--cad-wall-stroke); stroke-width: 1.5px; fill: var(--cad-wall-fill); stroke-linejoin: round; stroke-linecap: round; }",
        "      .cad-glaze { stroke: var(--cad-glaze); stroke-width: 1.5px; fill: none; stroke-linecap: round; }",
        "      .cad-door { stroke: var(--cad-door); stroke-width: 1.0px; fill: none; stroke-linecap: round; }",
        "      .cad-grid { stroke: var(--cad-grid); stroke-width: 0.5px; stroke-dasharray: 4,4; fill: none; }",
        "      .cad-dim { stroke: var(--cad-dim); stroke-width: 0.75px; fill: var(--cad-dim); font-size: 8px; }",
        "      .cad-anno { fill: var(--cad-anno); stroke: none; font-size: 9px; font-family: monospace; }",
        "      .cad-floor { stroke: var(--cad-floor); stroke-width: 0.75px; fill: none; stroke-linejoin: round; stroke-linecap: round; }",
        "      .cad-default { stroke: var(--cad-default); stroke-width: 0.75px; fill: none; }",
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
            text = entity.dxf.text.strip().replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            return f'<text x="{x:.3f}" y="{y:.3f}">{text}</text>'

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

    min_x, min_y, max_x, max_y = compute_bounding_box(entities)

    width = max_x - min_x
    height = max_y - min_y
    pad_x = width * 0.05
    pad_y = height * 0.05

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
