# Architectural CAD Viewer Interactive Workspace & Dual-Theme Poche Presentation

We decided to implement an interactive drag-to-pan/wheel-zoom drafting canvas in `TechnicalDrawingViewer`, solid architectural wall poche fills, subtle Swiss monospace dimension styling, and dual-mode presentation (Dark Drafting vs. Light Print Sheet) using CSS theme tokens.

## Context

Architectural technical drawings require high visual fidelity, seamless spatial navigation (panning across large multi-room floor plans and zooming into fine dimension strings), and presentation versatility for both dark drafting environments and client-facing white presentation sheets. Previously, converted SVGs used static outline strokes without poche fills, navigation was limited to fixed step buttons, and the viewer was locked strictly to a dark background.

## Decision

1. **Solid Architectural Wall Poche**:
   - Apply a 2.0px stroke with solid dark charcoal (`#181818`) / light charcoal infill (`.cad-wall`) to give structural hierarchy and massing contrast.
   - Style casework, furniture, and plumbing fixtures with thin secondary weights (`0.75px`).

2. **Direct Mouse Drag-to-Pan & Wheel-Zoom Canvas**:
   - Implement interactive CAD navigation directly inside `TechnicalDrawingViewer.tsx`:
     - Mouse pointer drag for smooth 2D translation (panning).
     - Wheel event listener for granular zoom scaling (50% to 300%).
     - Double-click / reset toolbar action for instant 100% recalibration.

3. **Subtle Swiss Monospace Dimensions & Annotations**:
   - Restrain dimension strings (`.cad-dim`) to `#737373` with delicate tick marks and monospaced measurement callouts (`#888888`), preventing dimension text from overwhelming architectural geometry.

4. **Dual Canvas Presentation Modes (Dark Drafting / Light Print Sheet)**:
   - Provide an instant toolbar toggle between:
     - **Dark Drafting Mode** (`#121212` background, `#ffffff` wall strokes, `#3b82f6` glazing, `#737373` dimensions).
     - **Light Print Sheet Mode** (`#F7F7F5` warm paper background, `#121212` charcoal wall strokes, `#2563eb` glazing, `#525252` dimensions).
   - Driven entirely via dynamic scoped CSS custom properties (`--cad-bg`, `--cad-wall`, `--cad-glaze`, `--cad-dim`, `--cad-anno`).

## Consequences

- Architects and clients can fluidly explore dense CAD drawings using familiar pan/zoom gestures.
- Floor plans render with clear structural hierarchy and authentic architectural weight.
- Technical drawings can be previewed in both digital drafting and physical print sheet aesthetics with zero asset duplication.
