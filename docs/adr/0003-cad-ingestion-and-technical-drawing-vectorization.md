# CAD Ingestion and Technical Drawing Vectorization Architecture

We decided to implement an offline Python-based CAD Ingestion Pipeline using `ezdxf` with rule-based Drawing Layer Profiles, coordinate normalization (Cartesian Y-flip to screen SVG viewBox), semantic CSS class styling with architectural theme tokens, and dynamic SVG asset loading in `TechnicalDrawingViewer`.

## Context

Architectural projects require rendering precise 2D Technical Drawings (floor plans, site plans, transverse sections) matching the studio's minimalist high-contrast aesthetic (deep charcoal `#121212` drafting canvas, high-weight `#ffffff` structural walls, electric blue `#3b82f6` glazing, thin `#a3a3a3` doors, dashed `#737373` structural grids). Previously, drawings were either hardcoded SVG mockups or parsed at runtime using a limited browser-side JS parser that struggled with complex CAD blocks, dimensions, and layer styling.

## Decision

1. **Python-Powered Offline Compilation (`ezdxf`)**:
   - Ingest native DXF drawing files using a dedicated CLI utility (`scripts/cad_to_svg.py`).
   - Recursively decompose block references (`INSERT`) and convert CAD dimension entities into clean vector lines and ticks.
   - Sanitize CAD typography into uppercase studio monospaced text elements (`font-mono`).

2. **Rule-Based Drawing Layer Profile**:
   - Map CAD layers via AIA standards and regex pattern matching (`*WALL*`, `*GLAZ*`, `*DOOR*`, `*FURN*`, `*GRID*`, `*ANNO*`, `*HATCH*`) defined in `scripts/cad_converter/layer_profiles.json`.
   - Apply canonical architectural line weights (`0.5px` to `2.5px`), stroke colors, and dash patterns.

3. **Coordinate Normalization & Aspect-Ratio Fitting**:
   - Invert CAD Y-axis coordinates to standard SVG coordinate space.
   - Compute the true geometric bounding box across all active entities, adding proportional margins (5%) to generate a responsive `viewBox`.

4. **Semantic CSS-Themed SVGs with Dynamic Frontend Loading**:
   - Output structured SVG graphics with semantic classes (`cad-wall`, `cad-glaze`, `cad-door`, `cad-grid`, `cad-anno`) and data attributes (`data-layer`, `data-space`).
   - Store generated SVGs under `/public/drawings/{project_id}/`.
   - Enhance `TechnicalDrawingViewer` and `src/data.ts` to support external SVG URLs while preserving interactive layer toggling (Grid, Dimensions, Annotations), room highlighting, and zoom/pan controls.

## Consequences

- Architects can export DXF files directly from AutoCAD, Revit, Rhino, or ArchiCAD and convert them with one command to match studio aesthetic standards.
- Browser bundle size remains lightweight with no heavy runtime CAD parsers or math engines needed for production drawing displays.
- Full interactive control (zooming, panning, grid toggling, room inspection) is retained in the frontend.
- Technical Drawings seamlessly support both dark drafting and light presentation modes via CSS variables.
