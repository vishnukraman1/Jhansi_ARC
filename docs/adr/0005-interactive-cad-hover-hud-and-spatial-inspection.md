# Interactive CAD Hover HUD & Spatial Inspection

We decided to implement an interactive spatial inspection engine for vector technical drawings, featuring room metadata HUD tooltips, dimension spotlight isolation, and layer button hover previews.

## Context

CAD floor plans contain dense spatial and geometric information (room dimensions, casework, wall perimeters, and multi-tier dimension strings). In static SVG viewing, users must manually locate text and trace crowded dimension lines. Introducing context-aware hover interactions provides tactile discovery without adding permanent visual clutter.

## Decision

1. **Interactive Room Spatial HUD**:
   - Room annotations (`.cad-anno text`) receive pointer discovery states. Hovering over a room name (e.g. `MASTER`, `GREAT ROOM`, `KITCHEN`, `2 CAR GARAGE`, `DECK`) highlights the label in electric blue (`#3b82f6`) and triggers an architectural HUD tooltip displaying verified room dimensions and spatial notes.

2. **Dimension String Spotlight Isolation**:
   - Hovering over a dimension line or measurement callout (`.cad-dim text`) isolates the active dimension string by boosting its contrast to `#ffffff` and stroke thickness to `1.0px`, while softly reducing peripheral dimension lines to 35% opacity.

3. **Layer Button Spotlight Preview**:
   - Hovering over the bottom drafting layer buttons (`Grid.dwg`, `Dimensions.dwg`, `Labels.dwg`) applies a dynamic `.cad-layer-spotlight` class to illuminate that specific layer on the SVG canvas while gracefully dimming other layers, offering an instant preview before toggling.

4. **Retained CAD Grab & Pan Controls**:
   - Maintained clean hand grab/grabbing cursor navigation for frictionless 2D translation and zoom scaling without intrusive crosshair grids blocking room readability.

## Consequences

- Architectural portfolio visitors and clients can discover room square footages, dimensions, and structural layers through natural cursor exploration.
- Drafting drawings remain clean and minimalist in their baseline state, revealing rich technical metadata on demand.
