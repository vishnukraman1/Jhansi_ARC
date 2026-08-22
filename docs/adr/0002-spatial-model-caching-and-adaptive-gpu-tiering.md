# Spatial Model Caching and Adaptive GPU Tiering

We decided to implement a two-tier caching architecture (IndexedDB for binary assets and an in-memory LRU pool for Three.js scenes) combined with client-side adaptive GPU tiering and an architectural blueprint skeleton loading state.

## Context

When users browse through multiple architectural projects in the portfolio, re-downloading and re-parsing 3D geometry over slow or mobile connections degrades the user experience. Additionally, mobile devices with constrained GPUs experience thermal throttling and frame drops when rendering high-resolution shadow maps and unfiltered PCF soft shadows.

## Decision

1. **Two-Tier Model Caching**:
   - **Disk Layer (IndexedDB)**: Cache Draco-compressed GLB binary blobs locally in `IndexedDB`. Subsequent requests retrieve the binary directly from storage with zero network traffic.
   - **Memory Layer (LRU Cache)**: Retain up to 3 parsed Three.js object hierarchies in an in-memory cache, automatically disposing geometries and textures when exceeding capacity to prevent mobile browser memory pressure.
2. **CAD Blueprint Skeleton Loader**:
   - Render a themed vector crosshair, drafting grid, and numerical percentage readout during initial chunk or asset download.
3. **Adaptive GPU Tiering**:
   - Detect mobile or touch-capable devices and lower shadow map resolution to 512×512 without soft filters, while reserving 2048×2048 PCF soft shadows and high-bias lighting for desktop GPUs.

## Consequences

- Repeat visits to project 3D models load instantly without network dependencies.
- Memory usage is strictly bounded on mobile devices.
- Framerate remains steady at 60fps across mobile and desktop hardware tiers.
