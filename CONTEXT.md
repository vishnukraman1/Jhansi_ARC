# Spatial Portfolio & Architectural Viewer

The interactive architectural portfolio and technical visualization system for showcasing sustainable residences, cultural monuments, and conceptual biospheres.

## Language

### Core Entities

**Project**:
A curated architectural work encompassing spatial narrative, physical site parameters, technical drawings, and material specifications.
_Avoid_: Case study, Portfolio item

**Spatial Model**:
An interactive 3D digital representation of an architectural work, containing structural assemblies, daylight geometry, and material finishes.
_Avoid_: 3D Asset, Mesh Container, GLTF Scene

**Technical Drawing**:
A precise 2D drafting vector representation (site plan, floor plan, transverse section, or axonometric diagram) rendered to architectural scale.
_Avoid_: Blueprint, SVG Diagram, CAD Scheme

### Visualization Systems

**Massing Study**:
A volumetric 3D exploration examining building proportions, structural frames, and tectonic envelopes under real-world lighting.
_Avoid_: 3D Preview, Blockout

**Exploded Assembly**:
The coordinate-offset translation of structural layers (roof diaphragm, glazed envelope, core columns, foundation) along designated vectors to inspect internal configurations.
_Avoid_: Exploded View, Disassembly Animation

**Daylight Analytics**:
The computational simulation of solar azimuth, altitude, and incident radiation across seasonal solstice cycles to evaluate passive solar performance.
_Avoid_: Sun Shader, Skybox Simulation, Light Tracker

**Render Mode**:
The visual presentation shader preset (Textured PBR, Plaster Clay, or Blueprint Vector Wireframe) applied dynamically to a Spatial Model.
_Avoid_: Style Filter, Material Theme

**Spatial Model Cache**:
The two-tier storage mechanism comprising IndexedDB binary caching and an in-memory LRU scene graph pool to ensure instant repeat rendering and safe memory boundaries.
_Avoid_: Asset Store, GLTF Manager

### Drafting & Ingestion

**CAD Ingestion Pipeline**:
The Python-driven conversion and normalization toolchain that parses raw architectural CAD drawings (DXF) and compiles them into semantic, theme-styled Technical Drawing vector assets with interactive layer and space metadata.
_Avoid_: DXF Converter, SVG Exporter, File Transformer

**Drawing Layer Profile**:
The rule-based mapping specification that classifies CAD layers (by AIA standards or regex patterns) into architectural semantic roles (walls, glazing, doors, fixtures, structural grid, annotations) and applies standardized line weights, dash arrays, and palette tokens.
_Avoid_: Layer Style, CSS Preset, Color Scheme
