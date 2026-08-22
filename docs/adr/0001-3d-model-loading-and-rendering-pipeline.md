# 3D Model Loading and Rendering Pipeline Architecture

We decided to decouple Three.js from the initial application bundle via code-splitting with background idle preloading, compress 3D GLTF assets using Draco with local WASM decoders, implement in-place material switching to avoid WebGL context tear-downs, and employ demand-driven viewport-aware rendering.

## Context

The architectural portfolio previously loaded Three.js, DRACO decoders from an external CDN, and all heavy 3D loaders in the main JavaScript entry chunk, degrading initial page load performance. Furthermore, `ThreeModelViewer` destroyed and re-instantiated the entire WebGL scene and re-fetched the 11.5 MB model asset whenever users switched between render modes, causing significant latency and GPU overhead.

## Decision

1. **Code Splitting & Preloading**: Lazily load `ThreeModelViewer` and `CustomCADViewer` with `React.lazy()` and trigger background preloading of 3D chunks via `requestIdleCallback` after the main UI becomes interactive.
2. **Local Draco Compression**: Compress all GLTF/GLB models using Draco geometry compression and host the Draco WASM decoders locally in `/public/draco/` to eliminate external CDN dependencies and latency.
3. **In-Place Material Mutators & Model Caching**: Maintain a single persistent Three.js scene instance, swapping material shaders dynamically on existing meshes and caching parsed models in memory across project transitions.
4. **Viewport-Aware Demand Rendering**: Use `IntersectionObserver` to pause rendering when the 3D canvas is out of the viewport, cap DPR to 1.5, and render frames on-demand when user interaction occurs.

## Consequences

- Initial page load time and bundle size are drastically reduced.
- 3D model asset payloads are reduced by ~80-90%.
- Render mode toggling is instantaneous with zero WebGL scene disposal or network refetches.
- Mobile battery and GPU consumption drop significantly when viewers are idle or scrolled off-screen.
