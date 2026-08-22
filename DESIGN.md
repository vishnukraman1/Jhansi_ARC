---
name: V. Kraman Studio
description: Digital monograph and interactive technical drafting atelier for an individual lead architect
colors:
  primary: "#121212"
  neutral-bg: "#F7F7F5"
  neutral-border: "#E0E0DE"
  neutral-muted: "#888888"
  accent-blueprint: "#3B82F6"
  accent-amber: "#F59E0B"
  accent-forest: "#2E3A2E"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: "normal"
  caption:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.1em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.15em"
  micro:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.5625rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.15em"
  nano:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.5rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.15em"
rounded:
  xs: "1px"
  sm: "2px"
  md: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "64px"
  3xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "24px"
---

# Design System: V. Kraman Studio

## Overview

**Creative North Star: "The Alpine Drafting Atelier"**

The interface operates with the silent confidence of a master physical architecture monograph and the technical precision of an AutoCAD/Revit drafting station. Layouts breathe with generous, disciplined whitespace. Contrast is stark and intentional—pure obsidian soot (`#121212`) set against tactile gallery off-white (`#F7F7F5`), grounded by hair-thin framing divisions (`#E0E0DE`).

Typography combines the human clarity of clean European grotesque sans-serif with the unflinching engineering rhythm of monospace technical coordinates. Motion is restrained and deliberate, mirroring the subtle shifts of daylight through a clerestory rather than kinetic digital spectacle.

**Key Characteristics:**
- Tectonic structural alignment with hair-thin 1px grid guides.
- Dual drafting canvases: high-contrast dark drafting mode vs. crisp daylight print sheet.
- Tactile material palette celebrating raw concrete, charred Shou Sugi Ban, and mass-timber.
- Zero decorative clutter; all visual weight is derived from architectural photography and vector blueprints.

## Colors

The palette is rooted in natural architectural raw materials and drafting standards.

### Primary
- **Obsidian Soot** (`#121212`): The primary grounding ink for typography, headers, dark drafting backgrounds, and monolithic CTA buttons.

### Secondary
- **Blueprint Cyan** (`#3B82F6`): Used with strict scarcity for interactive vector CAD highlights, active room zone polygons, and vector layer active states.
- **Solar Amber** (`#F59E0B`): Used exclusively for solar angle paths, thermal flywheel annotations, and climate analysis vectors.

### Neutral
- **Gallery Off-White** (`#F7F7F5`): The default warm architectural paper background.
- **Framing Grey** (`#E0E0DE`): Architectural gridlines, structural separators, and bounding card borders.
- **Drafting Muted** (`#888888`): Secondary metadata, coordinates, labels, and specification titles.

### Named Rules
**The Rarity of Blueprint Rule.** Blueprint Cyan (`#3B82F6`) is never used for general decoration or standard text. It is strictly reserved for live interactive vector geometry, active room zones, and technical hover states.

## Typography

**Display Font:** Inter (with ui-sans-serif, system-ui fallback)  
**Body Font:** Inter (with ui-sans-serif, system-ui fallback)  
**Label/Mono Font:** JetBrains Mono (with ui-monospace, SFMono-Regular fallback)

**Character:** A pairing of understated Swiss typographic minimalism and precision architectural coordinate labeling.

### Hierarchy
- **Display** (Light 300, `clamp(2.5rem, 6vw, 4.5rem)`, 1.1 line-height): Monumental project titles and philosophy statements.
- **Headline** (Regular 400 / Semibold 600, `clamp(1.75rem, 3.5vw, 2.5rem)`, 1.2 line-height): Section headers and curation titles.
- **Title** (Semibold 600, `1.25rem`, 1.3 line-height): Component cards and drawing titles.
- **Body** (Light 300, `0.875rem`, 1.6 line-height, max line length 65ch): Architectural problem/process/solution narratives and CV descriptions.
- **Caption** (Medium 500, `0.6875rem` / 11px, 0.1em tracking): Secondary metadata and subheadings.
- **Label** (Medium 500, `0.625rem` / 10px, 0.15em tracking, uppercase): System coordinates, CAD layers, specification matrix keys, and category badges.
- **Micro** (Medium 500, `0.5625rem` / 9px, 0.15em tracking, uppercase): Architectural blueprint stamps, coordinate stamps, and fine specs.
- **Nano** (Medium 500, `0.5rem` / 8px, 0.15em tracking, uppercase): CAD drawing dimension annotations and node indices.

### Named Rules
**The Monospace Discipline Rule.** All numbers, geographic coordinates, dimensions, scale ratios, dates, and technical specifications must be rendered in JetBrains Mono.

## Layout

A disciplined 12-column architectural grid governs all page structures. Maximum container width is constrained to `1280px` (`max-w-7xl`) with generous responsive gutter padding (`px-6 sm:px-8 lg:px-12`). Vertical pacing alternates between expansive `96px` (`py-24`) breathing sections and dense `16px` specification matrices.

## Elevation & Depth

Surfaces are intentionally flat and grounded. Depth is communicated through structural layering, border boundaries, and tactile tone-on-tone contrast rather than heavy drop shadows.

### Shadow Vocabulary
- **Drafting Glass Float** (`0 20px 25px -5px rgba(0, 0, 0, 0.5)`): Reserved exclusively for the floating 2D CAD canvas container and 3D WebGL viewport in dark mode.
- **Room Zone Hover Badge** (`0 10px 15px -3px rgba(0, 0, 0, 0.4)`): Micro-elevation for real-time dimension HUDs floating over blueprint geometry.

### Named Rules
**The Flat-By-Default Rule.** All project cards, narrative panels, and navigation elements are completely flat at rest, defined by a 1px `#E0E0DE` structural border.

## Shapes

Form geometry is angular, sharp, and architectural.
- Corner radiuses are restrained to micro-bevels (`2px` / `rounded-sm`) or pure right angles (`0px`).
- Heavy circular radiuses are strictly avoided except for technical compass markers and grid callout bubbles.

## Components

### Buttons
- **Shape:** Sharp micro-radius (`2px` / `rounded-sm`).
- **Primary:** Obsidian background (`#121212`), Off-White text (`#F7F7F5`), monospace uppercase tracking (`0.15em`), padding (`12px 24px`).
- **Hover / Focus:** Invert to `#888888` or `#E0E0DE` with subtle translation (`translate-x-1` on arrows).

### Cards / Containers
- **Corner Style:** `2px` radius (`rounded-sm`).
- **Background:** Gallery Off-White (`#F7F7F5`) with 1px border (`#E0E0DE`).
- **Padding:** `24px` to `32px`.

### 2D Vector Workbench
- **Canvas:** Dual-mode viewport (Drafting `#121212` vs Print Sheet `#F7F7F5`).
- **HUD Micro-Badge:** Floating spatial inspector with room title, dimension string, and square footage.
- **Layer Controls:** Toggle buttons for Grid, Dimensions, and Annotations with hover spotlight filter.

### 3D Massing Study Engine
- **Viewport:** WebGL Three.js canvas with orbit controls, exploded layer slider, and material presets.

## Do's and Don'ts

### Do:
- **Do** maintain strict visual alignment with the 12-column grid and 1px framing borders.
- **Do** display real technical dimensions in imperial/metric architectural formats (e.g. `13'8" × 14'0"` or `12.50m`).
- **Do** preserve the stark contrast between pure obsidian `#121212` and gallery off-white `#F7F7F5`.
- **Do** keep narratives structured into Problem, Process, and Solution.

### Don't:
- **Don't** introduce colorful decorative gradients, saturated buttons, or bubbly pill-shaped UI components.
- **Don't** use generic stock placeholder copy; preserve rich architectural terminology (mass-timber, thermal flywheel, board-formed concrete).
- **Don't** allow line lengths in architectural narratives to exceed `75ch`.
- **Don't** use standard sans-serif for numbers, coordinates, or matrix labels; always use JetBrains Mono.
