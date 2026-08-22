import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { projects } from '../src/data.ts';
import { TechnicalDrawing } from '../src/types.ts';

describe('Technical Drawing Dynamic SVG Loading & Types', () => {
  it('should support optional svgUrl property on TechnicalDrawing interface', () => {
    const drawing: TechnicalDrawing = {
      id: 'test-draw',
      name: 'Test Floor Plan',
      type: 'Floor Plan',
      description: 'Test architectural vector floor plan',
      svgType: 'floor-plan',
      svgUrl: '/drawings/test-floor-plan.svg'
    };

    assert.equal(drawing.svgUrl, '/drawings/test-floor-plan.svg');
  });

  it('should have a sample test SVG floor plan asset in public/drawings/test-floor-plan.svg', () => {
    const samplePath = path.join(process.cwd(), 'public', 'drawings', 'test-floor-plan.svg');
    assert.ok(fs.existsSync(samplePath), 'public/drawings/test-floor-plan.svg should exist');

    const content = fs.readFileSync(samplePath, 'utf-8');
    assert.ok(content.includes('<svg'), 'Asset should contain <svg tag');
    assert.ok(content.includes('viewBox='), 'Asset should have a viewBox attribute');
    assert.ok(content.includes('cad-grid'), 'Asset should have cad-grid class');
    assert.ok(content.includes('cad-dim'), 'Asset should have cad-dim class');
    assert.ok(content.includes('cad-anno'), 'Asset should have cad-anno class');
    assert.ok(content.includes('cad-wall'), 'Asset should have cad-wall class');
  });

  it('should wire the test drawing with svgUrl in src/data.ts to a project', () => {
    const drawingWithSvgUrl = projects
      .flatMap(p => p.technicalDrawings)
      .find(d => d.svgUrl === '/drawings/test-floor-plan.svg');

    assert.ok(drawingWithSvgUrl, 'Should find at least one drawing in projects with svgUrl: /drawings/test-floor-plan.svg');
    assert.equal(drawingWithSvgUrl.svgUrl, '/drawings/test-floor-plan.svg');
  });
});
