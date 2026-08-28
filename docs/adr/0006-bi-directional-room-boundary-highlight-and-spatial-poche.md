# Bi-directional Room Boundary Highlight & Spatial Poche

We decided to implement interactive room boundary highlighting with studio blue accent borders (`#3b82f6` / `#2563eb`), 6% translucent ambient floor poche scrims, and bi-directional trigger synchronization between room cavities and text labels.

## Context

CAD floor plans comprise dense structural lines and room tags. While room text tooltips inform users of spatial data, users also want immediate visual clarity on where each room begins and ends. When hovering over either a room name or entering a room's physical zone, the room perimeter should illuminate in high-contrast architectural blue with an ambient floor wash.

## Decision

1. **Precision Studio Cyan/Blue Accent (`#3b82f6` / `#2563eb`)**:
   - The active room's perimeter boundary highlights with a `2.5px` stroke in Electric Architectural Blue (`#3b82f6` in Dark Drafting mode, `#2563eb` in Light Print Sheet mode) and a soft ambient glow (`filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.45))`).

2. **Ambient Spatial Poche (6% Translucent Scrim)**:
   - Hovered room zones receive a soft `6%` opacity tinted floor infill (`rgba(59, 130, 246, 0.06)` in dark mode, `rgba(37, 99, 235, 0.08)` in light mode), clearly defining the room cavity while leaving interior millwork, door swings, and fixtures 100% visible.

3. **Bi-directional Spatial Interaction**:
   - Moving the cursor anywhere inside a room's physical polygon activates the border highlight, illuminates the room label, and renders the Spatial Inspection HUD tooltip.
   - Hovering the text label directly similarly illuminates the physical room perimeter.

## Consequences

- Architectural portfolio viewers can effortlessly explore floor plan zones by gliding the cursor across the drawing.
- Eliminates ambiguity regarding room boundaries, closets, and circulation corridors while adhering strictly to high-taste architectural drafting principles.
