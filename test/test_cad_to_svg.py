import os
import json
import unittest
import ezdxf
from scripts.cad_to_svg import convert_dxf_to_svg, classify_layer, compute_bounding_box, load_layer_profile

class TestCadToSvg(unittest.TestCase):
    def setUp(self):
        self.fixtures_dir = os.path.join(os.path.dirname(__file__), 'fixtures')
        os.makedirs(self.fixtures_dir, exist_ok=True)
        self.dxf_path = os.path.join(self.fixtures_dir, 'test_plan.dxf')
        self.svg_path = os.path.join(self.fixtures_dir, 'test_output.svg')
        
        # Create a synthetic DXF with various layers and entities
        doc = ezdxf.new('R2010')
        msp = doc.modelspace()
        
        # Add layers
        doc.layers.new('A-WALL-EXTR', dxfattribs={'color': 7})
        doc.layers.new('A-GLAZ', dxfattribs={'color': 5})
        doc.layers.new('A-DOOR', dxfattribs={'color': 8})
        doc.layers.new('S-GRID', dxfattribs={'color': 9})
        doc.layers.new('A-ANNO-TEXT', dxfattribs={'color': 7})
        
        # Add entities
        msp.add_line((0, 0), (100, 0), dxfattribs={'layer': 'A-WALL-EXTR'})
        msp.add_line((100, 0), (100, 50), dxfattribs={'layer': 'A-WALL-EXTR'})
        msp.add_lwpolyline([(0, 0), (0, 50), (100, 50)], dxfattribs={'layer': 'A-WALL-EXTR'})
        msp.add_line((20, 50), (40, 50), dxfattribs={'layer': 'A-GLAZ'})
        msp.add_arc((30, 0), radius=10, start_angle=0, end_angle=90, dxfattribs={'layer': 'A-DOOR'})
        msp.add_circle((50, 25), radius=5, dxfattribs={'layer': 'S-GRID'})
        
        doc.saveas(self.dxf_path)

    def test_layer_profiles_json_exists_and_valid(self):
        profiles = load_layer_profile()
        self.assertIn('profiles', profiles)
        self.assertIn('walls', profiles['profiles'])
        self.assertIn('glazing', profiles['profiles'])
        self.assertIn('doors', profiles['profiles'])
        self.assertIn('grid', profiles['profiles'])

    def test_classify_layer(self):
        profiles = load_layer_profile()
        self.assertEqual(classify_layer('A-WALL-EXTR', profiles), 'cad-wall')
        self.assertEqual(classify_layer('A-GLAZ-CURT', profiles), 'cad-glaze')
        self.assertEqual(classify_layer('A-DOOR-SWNG', profiles), 'cad-door')
        self.assertEqual(classify_layer('S-GRID-COLS', profiles), 'cad-grid')

    def test_convert_dxf_to_svg(self):
        convert_dxf_to_svg(self.dxf_path, self.svg_path)
        self.assertTrue(os.path.exists(self.svg_path))
        
        with open(self.svg_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        self.assertIn('<svg', content)
        self.assertIn('viewBox=', content)
        self.assertIn('cad-wall', content)
        self.assertIn('cad-glaze', content)
        self.assertIn('cad-door', content)
        self.assertIn('cad-grid', content)

    def tearDown(self):
        if os.path.exists(self.svg_path):
            os.remove(self.svg_path)
        if os.path.exists(self.dxf_path):
            os.remove(self.dxf_path)

if __name__ == '__main__':
    unittest.main()
