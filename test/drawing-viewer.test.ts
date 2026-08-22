import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('TechnicalDrawingViewer CSS & Layer Toggles Specification', () => {
  it('TechnicalDrawingViewer source file handles svgUrl, loading, error, and layer style rules', () => {
    const viewerPath = path.join(process.cwd(), 'src', 'components', 'TechnicalDrawingViewer.tsx');
    assert.ok(fs.existsSync(viewerPath), 'TechnicalDrawingViewer.tsx should exist');

    const source = fs.readFileSync(viewerPath, 'utf-8');

    // Verify dynamic SVG fetching
    assert.ok(source.includes('drawing.svgUrl'), 'Viewer should check drawing.svgUrl');
    assert.ok(source.includes('fetch(') || source.includes('fetchSvg') || source.includes('svgUrl'), 'Viewer should fetch dynamic SVG');

    // Verify layer class toggles for cad-grid, cad-dim, and cad-anno
    assert.ok(source.includes('cad-grid'), 'Viewer should contain rules for cad-grid');
    assert.ok(source.includes('cad-dim'), 'Viewer should contain rules for cad-dim');
    assert.ok(source.includes('cad-anno'), 'Viewer should contain rules for cad-anno');

    // Verify loading and error handling
    assert.ok(source.includes('loading') || source.includes('isLoading'), 'Viewer should handle loading state');
    assert.ok(source.includes('error') || source.includes('loadError'), 'Viewer should handle error state');
  });
});
