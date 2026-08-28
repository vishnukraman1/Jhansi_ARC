# Flagship CAD Canvas Framing, Luminous Typography & Interactive Caliper

We decided to implement heroic floor plan framing with outlier pruning, luminous 3-tier architectural typography hierarchy, interactive room quick-jump navigation ribbon, and a precision CAD measurement caliper tool.

## Context

While CAD vector ingestion successfully captures raw lines, the raw DXF contains orphan survey entities outside the primary building envelope (e.g. detached casework markers at `x > 210`) that expand the SVG viewBox, creating asymmetrical margins and shrinking the house. Additionally, room labels require high contrast for effortless legibility, and architectural clients benefit from spatial quick-jump navigation and on-canvas measurement verification.

## Decision

1. **Heroic Canvas Framing & Outlier Pruning**:
   - Filter out disconnected outlier CAD entities outside the physical building envelope.
   - Recalculate tight geometric viewBox bounds with 3% architectural border padding.
   - Calibrate default initial canvas zoom to 100% with automatic viewport centering.

2. **Luminous 3-Tier Architectural Hierarchy**:
   - **Tier 1 (Room Labels)**: Crisp luminous white/silver (`#f8fafc`), semi-bold, with `0.05em` tracking for instant readability without zooming.
   - **Tier 2 (Glazing & Door Swings)**: Electric cyan/azure (`#38bdf8`) for windows and silver (`#cbd5e1`) for door swing arcs.
   - **Tier 3 (Dimensions & Construction Notes)**: Precision steel slate (`#94a3b8`, `0.65px`) with high contrast.

3. **Interactive Room Quick-Jump Navigation Ribbon**:
   - A minimalist horizontal ribbon of interactive room chips (`[Great Room]`, `[Master Suite]`, `[Kitchen]`, `[Garage]`, `[Deck]`, `[Bedrooms]`).
   - Clicking any chip smoothly translates and zooms the canvas camera to frame that specific space with a soft electric blue spotlight ring.

4. **Precision CAD Caliper / Measure Tool**:
   - An on-canvas measurement caliper tool (`[📏 Measure]`).
   - Allows users to click two points on the drawing to calculate and display real-world architectural distance in feet and fractional inches (e.g., `24'-6 ½"`).

## Consequences

- The floor plan fills the workspace heroically on initial load with zero stray floating markers.
- Spatial navigation and architectural dimension verification become interactive and delightful for presentation.
