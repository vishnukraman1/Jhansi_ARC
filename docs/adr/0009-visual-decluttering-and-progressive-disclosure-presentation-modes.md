# Visual Decluttering, Progressive Disclosure & Dual Presentation Modes

We decided to establish a serene, gallery-grade presentation view as the default canvas state, filtering out dense contractor micro-text, replacing heavy badge boxes with clean floating typography, and providing a unified 2-mode switcher (`[🏛️ Presentation]` | `[📐 Technical Blueprint]`).

## Context

When opening architectural drawings, visitors and clients are often overwhelmed by dense CAD visual noise—simultaneous display of 50+ dimension strings, construction grid lines, and microscopic contractor material specifications (e.g., drywall fastener schedules, insulation codes). In high-end architectural studios, initial presentations prioritize spatial flow, structural clarity, and programmatic hierarchy, progressively disclosing technical construction data on demand.

## Decision

1. **Serene Presentation Mode by Default**:
   - On initial page load, technical dimension strings and construction grid lines are hidden by default (`showDimensions: false`, `showGrid: false`).
   - The default canvas renders pure structural mass, glowing cyan glazing, door swings, and elegant room names.

2. **Smart Typographic Decluttering**:
   - Filter out microscopic contractor notes (`GYP. BD.`, `INSULATION`, `FIRE RATED`, `TRUSS`) from the primary presentation view, eliminating interior visual clutter.
   - Retain programmatic room titles and major architectural identifiers.

3. **Floating Room Typography with Hover Bloom**:
   - Replace bulky opaque rectangular room boxes with airy, elegant floating monospace typography placed directly in room cavities.
   - Hovering or clicking any room blooms the full dimensional and area specifications with an electric cyan spotlight.

4. **Unified 2-Mode Master Switcher**:
   - Add a prominent 2-mode segmented control in the toolbar:
     - `🏛️ Presentation`: Pure structural architecture (zero clutter, presentation-ready).
     - `📐 Technical Blueprint`: Full dimension strings, structural grid, and detailed construction callouts.
   - Retain individual layer toggles in a discreet secondary menu for granular drafting inspection.

## Consequences

- The floor plan opens in a clean, elegant, and visually stunning architectural state.
- Technical dimensions and contractor notes remain fully accessible with a single click without cluttering the initial portfolio impression.
