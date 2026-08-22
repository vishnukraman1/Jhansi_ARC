import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

describe('CAD Layer Profile & Python Vectorizer Integration', () => {
  it('layer_profiles.json defines standard studio layer mappings', () => {
    const profilePath = path.join(process.cwd(), 'scripts', 'cad_converter', 'layer_profiles.json');
    assert.ok(fs.existsSync(profilePath), 'layer_profiles.json should exist');

    const profileData = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    assert.ok(profileData.profiles, 'Profile should have profiles object');
    assert.equal(profileData.profiles.walls.className, 'cad-wall');
    assert.equal(profileData.profiles.glazing.className, 'cad-glaze');
    assert.equal(profileData.profiles.doors.className, 'cad-door');
    assert.equal(profileData.profiles.grid.className, 'cad-grid');
    assert.equal(profileData.profiles.dimensions.className, 'cad-dim');
    assert.equal(profileData.profiles.annotations.className, 'cad-anno');
  });

  it('runs cad_to_svg.py and converts test DXF to styled semantic SVG with padding and classes', () => {
    const fixturesDir = path.join(process.cwd(), 'test', 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    const dxfFixture = path.join(fixturesDir, 'studio_floor_plan.dxf');
    const svgOutput = path.join(process.cwd(), 'public', 'drawings', 'studio_floor_plan.svg');

    const pythonScript = `
import ezdxf
from scripts.cad_to_svg import convert_dxf_to_svg

doc = ezdxf.new('R2010')
msp = doc.modelspace()
doc.layers.new('A-WALL', dxfattribs={'color': 7})
doc.layers.new('A-GLAZ', dxfattribs={'color': 5})
doc.layers.new('A-DOOR', dxfattribs={'color': 8})
doc.layers.new('S-GRID', dxfattribs={'color': 9})
doc.layers.new('A-ANNO', dxfattribs={'color': 7})

msp.add_lwpolyline([(0, 0), (200, 0), (200, 120), (0, 120), (0, 0)], dxfattribs={'layer': 'A-WALL'})
msp.add_line((40, 0), (160, 0), dxfattribs={'layer': 'A-GLAZ'})
msp.add_arc((100, 0), radius=20, start_angle=0, end_angle=90, dxfattribs={'layer': 'A-DOOR'})
msp.add_line((0, 60), (200, 60), dxfattribs={'layer': 'S-GRID'})
msp.add_text('LIVING AREA', dxfattribs={'layer': 'A-ANNO', 'insert': (80, 50)})

doc.saveas(r'''${dxfFixture}''')
convert_dxf_to_svg(r'''${dxfFixture}''', r'''${svgOutput}''')
`;

    execFileSync('python', ['-c', pythonScript], { stdio: 'inherit' });

    assert.ok(fs.existsSync(svgOutput), 'Output SVG should exist');
    const svgText = fs.readFileSync(svgOutput, 'utf-8');

    assert.ok(svgText.includes('<svg'), 'SVG should have root <svg element');
    assert.ok(svgText.includes('viewBox='), 'SVG should have viewBox');
    assert.ok(svgText.includes('class="cad-wall"'), 'SVG should contain cad-wall layer');
    assert.ok(svgText.includes('class="cad-glaze"'), 'SVG should contain cad-glaze layer');
    assert.ok(svgText.includes('class="cad-door"'), 'SVG should contain cad-door layer');
    assert.ok(svgText.includes('class="cad-grid"'), 'SVG should contain cad-grid layer');
    assert.ok(svgText.includes('class="cad-anno"'), 'SVG should contain cad-anno layer');
  });
});
