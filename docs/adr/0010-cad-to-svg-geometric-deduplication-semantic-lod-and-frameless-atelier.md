# CAD-to-SVG Geometric Deduplication, Semantic LOD & Frameless Atelier Redesign

We decided to implement geometric line deduplication, a 3-tier semantic Level-of-Detail (LOD) zoom engine, a strict 4-tier AIA/ISO architectural line-weight standard, and an edge-to-edge frameless atelier interface with a floating frosted glass dock.

## Context

Converting raw AutoCAD (.dxf / .dwg) drawings directly to SVG often causes visual clutter: overlapping collinear line segments from xref blocks, dense hatch patterns, flat line weights across all layers, and a crowded viewer container with multiple headers, toolbars, and chips. To achieve publication-grade architectural clarity, the drawing must be simplified geometrically at conversion time, styled with rigorous architectural contrast, and navigated with dynamic level-of-detail zoom scaling inside a frameless canvas.

## Decision

1. **Geometric Line Deduplication & Solid Wall Envelope (Python Engine)**:
   - In `scripts/cad_to_svg.py`, merge collinear and overlapping segments, eliminate redundant hatch lines, and render perimeter structural walls with solid poche weight.
   - Clean duplicate text nodes and cap font scales to eliminate typographic crowding.

2. **3-Tier Dynamic Semantic Level-of-Detail (LOD)**:
   - **Tier 1 (Macro Overview, Zoom < 120%)**: Emphasizes cut structural walls, building envelope, glazing, and room titles. Secondary fixture lines and dimension strings are hidden or deeply recessed.
   - **Tier 2 (Spatial Focus, Zoom 120% – 200%)**: Door swings, millwork, and room dimensions smoothly bloom into focus.
   - **Tier 3 (Technical Inspection, Zoom > 200%)**: Complete centerline dimension strings, wall opening tolerances, and engineering callouts fade in with precision.

3. **4-Tier AIA / ISO Architectural Line-Weight Standard**:
   - **Tier 1 (Cut Structural Walls)**: `2.8px`, `#ffffff` (Dark) / `#0f172a` (Light).
   - **Tier 2 (Glazing & Envelopes)**: `1.6px`, `#38bdf8` (Dark) / `#0284c7` (Light).
   - **Tier 3 (Partitions & Door Swings)**: `0.8px` dotted silver, 60% opacity.
   - **Tier 4 (Dimension Strings & Grids)**: `0.5px` steel slate, 40% resting opacity with hover isolation.

4. **Frameless Atelier Canvas & Floating Frosted Glass HUD**:
   - Remove rigid enclosing headers and borders, letting the vector drawing fill the workspace edge-to-edge.
   - Consolidate all controls (Zoom, Presentation vs Blueprint, Measure Caliper, Theme) into a single floating frosted glass dock at the bottom center.

## Consequences

- The floor plan renders with serene, gallery-grade clarity on initial load.
- Zooming in smoothly unveils progressive technical details without overwhelming the viewer.
- The interface feels expansive, immersive, and refined.
