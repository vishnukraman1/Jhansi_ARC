# Architectural SVG Poche, Embedded Room Badges & 1-Click Camera Focus

We decided to upgrade the vector SVG floor plan rendering with architectural wall poche fill, embedded luminous room badges, distinctive material line weights, and a frictionless 1-click room camera auto-focus interaction.

## Context

Raw CAD vector exports often produce thin, wireframe double-lines with microscopic text that require intense manual zooming and panning to decipher. In architectural portfolio presentations, drawings should be immediately legible at full zoom-out, with clear structural wall hierarchy, prominent programmatic room identifiers, and intuitive 1-click spatial navigation.

## Decision

1. **Architectural Wall Poche & Structural Depth**:
   - Apply solid high-contrast wall poche styling (`2.4px` stroke, crisp `#ffffff` dark mode / `#0f172a` light mode) to outer structural envelopes and partition walls.
   - Maintain clean interior room cavities with subtle poche washes on selection.

2. **Embedded Luminous Room Badges**:
   - Embed prominent, high-legibility SVG room badge plates with room index, title, and square footage (e.g., `01. MASTER SUITE · 191 SQ FT`, `02. GREAT ROOM · 300 SQ FT`) directly within each room cavity in the SVG.
   - Design badge typography with high-contrast monospace fonts and frosted pill backplates so they are crystal clear at any zoom level.

3. **Material Layer Highlighting**:
   - **Window Openings / Glazing**: Vibrant electric cyan (`#38bdf8`) with high visibility.
   - **Door Swings**: Smooth dotted silver (`#cbd5e1`) 90° arc strokes.
   - **Plumbing & Millwork Fixtures**: Clean slate (`#64748b`) so they accent without overwhelming the structural walls.

4. **1-Click Room Camera Auto-Focus & Persistent Spec Card**:
   - Clicking any room zone or badge directly animates the viewport camera to frame that room centrally with a smooth ease.
   - Activates an electric cyan perimeter highlight ring on the room.
   - Displays a persistent architectural details card (`Dimensions`, `Enclosed Area`, `Key Features`) with a quick `[✕ Reset View]` button.

## Consequences

- The floor plan is immediately readable at first glance without squinting or manual zooming.
- Clients and portfolio visitors can explore every room effortlessly with a single click.
