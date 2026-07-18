/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, CVExperience, CVEducation, CVAward, SkillCategory } from './types';

export const projects: Project[] = [
  {
    id: 'optimized-house',
    title: 'Optimized House',
    category: 'Residential',
    location: 'Basel, Switzerland',
    area: '2,500 sq ft',
    year: '2026',
    type: 'Single Family Residence',
    client: 'Private Client',
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
    ],
    descriptor: 'An optimized, sustainable smart home designed with advanced 3D spatial intelligence.',
    narrative: {
      problem: 'Need for a highly optimized residential footprint.',
      process: 'Utilized advanced 3D modeling and sustainable materials to reduce carbon footprint.',
      solution: 'A cohesive living space that perfectly balances natural light and thermal efficiency.'
    },
    technicalDrawings: [
      {
        id: 'oh-draw-1',
        name: 'Optimized House Floor Plan',
        type: 'Floor Plan',
        description: 'General floor plan for the optimized house.',
        svgType: 'floor-plan'
      }
    ],
    specs: {
      materials: [
        { name: 'Primary Envelope', value: 'Optimized Timber and Glass' }
      ],
      structural: [
        { name: 'Core System', value: 'Mass-Timber Frame' }
      ],
      environmental: [
        { name: 'Energy Standard', value: 'Net Zero' }
      ]
    }
  },
  {
    id: 'obsidian-pavilion',
    title: 'The Obsidian Pavilion',
    category: 'Residential',
    location: 'Vestfold, Norway',
    area: '3,200 sq ft',
    year: '2024',
    type: 'Single Family Residence',
    client: 'Stene Family Trust',
    heroImage: 'https://images.unsplash.com/photo-151062780277d-3d98c3477bb7?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    ],
    descriptor: 'A dark Shou Sugi Ban cabin meticulously integrated into the rocky shoreline of Norway.',
    narrative: {
      problem: 'The client desired a weekend home that could withstand harsh coastal Norwegian winds and freezing winters while establishing a deep, quiet connection to the surrounding pine forest and rocky shoreline. The local building authority strictly mandated that any structure must not visually disrupt the natural silhouette of the fjord.',
      process: 'We conducted an extensive 3D topographic scan of the site to identify natural shelves in the rock. By fracturing the massing into three low-slung, interlocking pavilions, we nestled the program into the natural crevices. The cladding material is charred pine (Shou Sugi Ban), which naturally resists decay and pest infestations while blending seamlessly with the dark shadows of the pine trees.',
      solution: 'The resulting home is a silent presence in the landscape. A central glass breezeway connects the active living spaces to the sleeping quarters, acting as both an entry portal and a wind shelter. Large thermal-mass polished concrete floors store solar gain from the south-facing glazing, heating the home passively throughout the Scandinavian winter.'
    },
    technicalDrawings: [
      {
        id: 'op-draw-1',
        name: 'Site Topography & Footprint Plan',
        type: 'Site Plan',
        description: 'Demonstrates the nested alignment of the three charred pavilions within the natural granite rock contour lines at a 1:200 scale.',
        svgType: 'site-plan'
      },
      {
        id: 'op-draw-2',
        name: 'Main Level Floor Plan',
        type: 'Floor Plan',
        description: 'Illustrates the central glass breezeway dividing the master suite and the communal open-plan kitchen and living space.',
        svgType: 'floor-plan'
      },
      {
        id: 'op-draw-3',
        name: 'Transverse Section B-B',
        type: 'Cross Section',
        description: 'Shows the passive solar gain strategy with the high-performance triple-glazed envelope and heavy thermal concrete foundation.',
        svgType: 'section'
      }
    ],
    specs: {
      materials: [
        { name: 'Facade Cladding', value: 'Traditional Shou Sugi Ban (charred Norwegian pine)' },
        { name: 'Floor Slab', value: 'Polished charcoal concrete with integrated hydronic piping' },
        { name: 'Insulation Core', value: 'High-density sustainably-sourced wood fiber boards' },
        { name: 'Glazing Envelope', value: 'Schüco triple-pane solar-gain coated architectural glass' }
      ],
      structural: [
        { name: 'Foundation', value: 'Doweled concrete footings anchored directly into granite bedrock' },
        { name: 'Primary Frame', value: 'Heavy glue-laminated timber frame (Glulam Spruce)' },
        { name: 'Wind Bracing', value: 'Tensioned stainless steel tie-rods and rigid structural timber nodes' }
      ],
      environmental: [
        { name: 'Energy Standard', value: 'Passivhaus Premium Target (under 15 kWh/m²a)' },
        { name: 'Heat Source', value: 'Ground-source geothermal loop with high-efficiency heat pump' },
        { name: 'Embodied Carbon', value: '-12.4 kg CO2e/m² (Highly carbon-negative materials)' }
      ]
    }
  },
  {
    id: 'monolith-center',
    title: 'The Monolith Center',
    category: 'Commercial',
    location: 'Basel, Switzerland',
    area: '45,000 sq ft',
    year: '2025',
    type: 'Cultural & Art Gallery Space',
    client: 'Basel Foundation for Contemporary Art',
    heroImage: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200'
    ],
    descriptor: 'A sculptural board-formed concrete volume capturing dramatic daylight for contemporary exhibition spaces.',
    narrative: {
      problem: 'An art foundation required an exhibition center that could accommodate diverse, large-scale spatial installations while offering highly controlled lighting environments. The tight urban corner lot demanded a structure with a minimal footprint but a highly expressive public presence.',
      process: 'We turned the typical transparent, glazed museum model inside out. By crafting a monolithic, self-supporting envelope of white board-formed concrete, we maximized interior wall space for exhibitions. We introduced five monumental light wells slicing through the building vertically, using parametric light baffles to filter daylight from above.',
      solution: 'The building acts as a heavy, sculptural block from the street, but reveals a highly ethereal, light-filled canyon inside. The board-formed texture bears the imprint of local Swiss larch wood, softening the concrete with an organic, tactile grain. Structural cantilevers eliminate column interference, delivering pure, flexible gallery floor plans.'
    },
    technicalDrawings: [
      {
        id: 'mc-draw-1',
        name: 'Axonometric Structural Slices',
        type: 'Axonometric',
        description: 'A 3D exploded structural diagram highlighting the monumental light canyons and deep concrete cantilevers.',
        svgType: 'axonometric'
      },
      {
        id: 'mc-draw-2',
        name: 'Gallery Level 02 Floor Plan',
        type: 'Floor Plan',
        description: 'Details the clear span gallery layouts without internal structural load-bearing columns.',
        svgType: 'floor-plan'
      },
      {
        id: 'mc-draw-3',
        name: 'Longitudinal Section A-A',
        type: 'Cross Section',
        description: 'Shows how the overhead light tubes channel northern Swiss daylight into deep subterranean storage and gallery layers.',
        svgType: 'section'
      }
    ],
    specs: {
      materials: [
        { name: 'Primary Envelope', value: 'Low-carbon self-consolidating architectural white concrete' },
        { name: 'Timber Formwork', value: 'Rough-sawn local Swiss larch wood planks (100% recycled)' },
        { name: 'Light Baffles', value: 'Micro-perforated acoustic aluminum sheets with rock-wool backing' }
      ],
      structural: [
        { name: 'Core System', value: 'Double-walled monolithic reinforced concrete shear cores' },
        { name: 'Cantilever Span', value: '32-foot post-tensioned reinforced concrete cantilever beams' },
        { name: 'Floor Slabs', value: '2-way post-tensioned high-performance concrete slabs' }
      ],
      environmental: [
        { name: 'Climate Control', value: 'Thermally Activated Building Systems (TABS) in concrete cores' },
        { name: 'Air Exchange', value: 'Displacement ventilation integrated into double floor plenum' },
        { name: 'Daylight Autonomy', value: '88% of exhibition hours powered entirely by natural daylighting' }
      ]
    }
  },
  {
    id: 'aether-hq',
    title: 'Aether Sustainable Headquarters',
    category: 'Commercial',
    location: 'Copenhagen, Denmark',
    area: '120,000 sq ft',
    year: '2026',
    type: 'Sustainable Corporate Campus',
    client: 'Aether Technologies',
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200'
    ],
    descriptor: 'A landmark mass-timber workspace with a double-skin glass facade and central living atrium.',
    narrative: {
      problem: 'In pursuit of a completely carbon-neutral operations workspace, the client required a highly dense, energy-producing headquarters. The design had to foster social synergy and wellness for over 800 creative employees in a harsh northern European climate.',
      process: 'We designed a carbon-sequestering structure utilizing glue-laminated (Glulam) timber pillars and cross-laminated timber (CLT) floors. A massive, central helical atrium is carved from the heart of the grid to draw public foot traffic upwards. To combat northern cold while harvesting natural light, a double-skin glazed facade acts as a thermal buffer zone.',
      solution: 'The building is a living ecosystem. The atrium is populated with local flora and water bio-filtration ponds that naturalize humidity and purify incoming air. Active photovoltaic glass roofs generate enough power to support the building\'s microgrid, and excess thermal energy is redirected to the neighborhood district heating network.'
    },
    technicalDrawings: [
      {
        id: 'ae-draw-1',
        name: 'Mass-Timber Atrium Axonometric',
        type: 'Axonometric',
        description: 'Explodes the massive circular timber node details and helical staircase structural support rings.',
        svgType: 'axonometric'
      },
      {
        id: 'ae-draw-2',
        name: 'Ground Level Community Atrium Plan',
        type: 'Floor Plan',
        description: 'Details public-private zones, community water feature placement, and timber structural bays.',
        svgType: 'floor-plan'
      }
    ],
    specs: {
      materials: [
        { name: 'Structural Timber', value: 'Sustainably sourced PEFC-certified European Spruce' },
        { name: 'Floor Plates', value: '5-layer cross-laminated timber (CLT) structural slabs' },
        { name: 'Facade Skin', value: 'Low-E double-glazed active facade with natural ventilated cavity' }
      ],
      structural: [
        { name: 'Columns & Beams', value: 'Glue-laminated timber (Glulam) modular post-and-beam frame' },
        { name: 'Seismic Joints', value: 'High-capacity slotted steel connection plates with dowels' },
        { name: 'Atrium Support', value: 'Helical Glulam composite tension ring trusses' }
      ],
      environmental: [
        { name: 'Certifications', value: 'DGNB Platinum Certification & Active House Excellent' },
        { name: 'Solar Generation', value: '450 kWp integrated active photovoltaic roofing and glazing' },
        { name: 'Water Strategy', value: '100% rainwater recycling for cooling and landscape irrigation' }
      ]
    }
  },
  {
    id: 'canyon-retreat',
    title: 'Canyon Rammed Earth Retreat',
    category: 'Residential',
    location: 'Sedona, Arizona, USA',
    area: '2,400 sq ft',
    year: '2023',
    type: 'Desert Sanctuary',
    client: 'Elena & Marcus Vance',
    heroImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200'
    ],
    descriptor: 'An off-grid sanctuary crafted from local red-clay rammed earth, capturing the intense beauty of Sedona.',
    narrative: {
      problem: 'Building in the delicate desert canyon required a structure that felt native to the geological strata, while maintaining complete off-grid autonomy in an environment with extreme daily temperature fluctuations (up to 40°F differences between day and night).',
      process: 'We harvested red clay, sand, and aggregates directly from the excavation site. These minerals were pressed into robust 2-foot thick rammed-earth walls. To shield the interiors from intense high-angle desert sun, we modeled a massive cantilevered weathered steel (Corten) roof canopy that dynamically casts shade over floor-to-ceiling glass walls.',
      solution: 'The rammed earth operates as an exceptional thermal fly-wheel, absorbing solar heat during the burning desert afternoon and slowly releasing it inward during the freezing night. Fully self-contained, the house relies entirely on a deep water-well, solar battery storage array, and a graywater-fed botanical filtration system.'
    },
    technicalDrawings: [
      {
        id: 'cr-draw-1',
        name: 'Strata Rammed Earth Site Alignment',
        type: 'Site Plan',
        description: 'Shows the retreat nestled into a natural sandstone crease, respecting surrounding ancient Joshua trees.',
        svgType: 'site-plan'
      },
      {
        id: 'cr-draw-2',
        name: 'Transverse Wall-Section Detail',
        type: 'Cross Section',
        description: 'Explores the thermal barrier detail showing rammed earth, central rigid insulation layer, and steel roof anchor joints.',
        svgType: 'section'
      }
    ],
    specs: {
      materials: [
        { name: 'Thermal Walls', value: 'Stabilized rammed earth (10% local clay, 90% onsite aggregate)' },
        { name: 'Roof Canopy', value: 'Pre-weathered Corten steel self-healing panels' },
        { name: 'Interior Joinery', value: 'Reclaimed native Arizona mesquite timber' }
      ],
      structural: [
        { name: 'Load Bearing', value: '24-inch monolithic rammed-earth shear walls' },
        { name: 'Roof Support', value: 'Outrigger cantilever steel I-beams anchored to reinforced concrete cores' },
        { name: 'Seismic Tie', value: 'Continuous reinforced concrete ring beams integrated atop earth walls' }
      ],
      environmental: [
        { name: 'Grid Status', value: '100% off-grid autonomy (well water, solar power, composting waste)' },
        { name: 'Solar Array', value: '15 kW ground-mounted solar PV with 60 kWh Lithium battery storage' },
        { name: 'Thermal Flywheel', value: '14-hour thermal lag, eliminating mechanical air-conditioning' }
      ]
    }
  },
  {
    id: 'helios-outpost',
    title: 'Helios Research Outpost',
    category: 'Concepts',
    location: 'Katla Volcanic Ridge, Iceland',
    area: '8,500 sq ft',
    year: '2026',
    type: 'Scientific Research Station',
    client: 'Icelandic Volcanology Consortium',
    heroImage: 'https://images.unsplash.com/photo-1475139441338-693e7dbe20b6?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1516339901601-2e1d62dc0c45?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200'
    ],
    descriptor: 'A modular, self-leveling scientific biosphere harvesting geothermal heat from volcanic fissures.',
    narrative: {
      problem: 'Scientists studying Katla\'s active seismic zones required a temporary research station that could adapt to shifting glacier ice, active earthquakes, and intense blizzards, with zero ecological disruption to the pristine volcanic environment.',
      process: 'We developed a modular pod architecture supported by adjustable pneumatic tripod legs. This allows the outpost to "walk" or self-level when ground shifts occur. The pods are wrapped in a carbon-fiber reinforced composite shell lined with aerogel insulation, which was originally engineered for spacecraft envelopes.',
      solution: 'The outpost operates in absolute symbiosis with Katla. Deep geothermal heat-exchanger probes are drilled into near-surface hot fissures to provide continuous 100% clean thermal power and hot water. The aerodynamic rounded form sheds high-velocity winds, and the modular pods can be decoupled and airlifted away with zero footprint remaining.'
    },
    technicalDrawings: [
      {
        id: 'ho-draw-1',
        name: 'Exploded Modular Pod System',
        type: 'Axonometric',
        description: 'Details the pneumatic leveling cylinder legs, structural titanium chassis, and modular connection ring seals.',
        svgType: 'axonometric'
      },
      {
        id: 'ho-draw-2',
        name: 'Pod Cluster Core Hub Layout',
        type: 'Floor Plan',
        description: 'Illustrates the central communal decompression chamber linking the wet science labs, living quarters, and storage pods.',
        svgType: 'floor-plan'
      }
    ],
    specs: {
      materials: [
        { name: 'External Shell', value: 'Titanium-infused carbon-fiber aerospace composite' },
        { name: 'Insulation Core', value: '120mm space-grade silica aerogel blanket (R-value: 48)' },
        { name: 'Sub-flooring', value: 'Recycled lightweight structural honeycomb aluminum panels' }
      ],
      structural: [
        { name: 'Chassis Frame', value: 'Welded grade-5 structural titanium space-frame sub-chassis' },
        { name: 'Foundation Legs', value: 'Adjustable pneumatic self-leveling tripod outrigger legs' },
        { name: 'Coupling Joints', value: 'Double-sealed marine-grade electromagnetic docking ring collars' }
      ],
      environmental: [
        { name: 'Power Source', value: 'Dual 50kW coaxial volcanic fissure geothermal probes' },
        { name: 'Thermal Control', value: 'Closed-loop liquid geothermal radiant shell plumbing network' },
        { name: 'Waste Treatment', value: 'Zero-discharge vacuum bioreactor with plasma gasification' }
      ]
    }
  },
  {
    id: 'fractal-canopy',
    title: 'Fractal Plaza Canopy',
    category: 'Concepts',
    location: 'Shibuya Plaza, Tokyo, Japan',
    area: '1,800 sq ft',
    year: '2025',
    type: 'Urban Public Installation',
    client: 'Tokyo Metropolitan Government',
    heroImage: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200'
    ],
    descriptor: 'A parametric public installation mimicking a forest canopy to mitigate urban heat island effects.',
    narrative: {
      problem: 'Tokyo\'s Shibuya dense concrete plaza suffers from extreme summer heat island effects. The government requested an artistic shading sculpture that could naturally lower air temperatures, collect rainwater, and integrate a sense of calming nature in a chaotic intersection.',
      process: 'We turned to nature\'s biomimicry. We designed a steel branch truss structure that distributes loads like a deciduous tree. The roof consists of thousands of leaf-like smart polymer panels angled dynamically using a parametric algorithm to simulate "Komorebi"—the sunlight filtering through leaves.',
      solution: 'The pavilion acts as a civic cooling oasis. High-pressure integrated nozzles emit micro-mists that lower surrounding temperatures by up to 10°F through evaporative cooling. Solar cells on the top-facing polymer leaves capture daylight to power ambient night illumination, and the central hollow trunk collects and filters rainwater for the plaza gardens.'
    },
    technicalDrawings: [
      {
        id: 'fc-draw-1',
        name: 'Komorebi Light-Baffle Parametric Grid',
        type: 'Site Plan',
        description: 'Reveals the computational pixel grid directing the angle of the sun-shading leaf panels for maximum afternoon shade.',
        svgType: 'site-plan'
      },
      {
        id: 'fc-draw-2',
        name: 'Plaza Elevation & Mist System Sections',
        type: 'Cross Section',
        description: 'Details the hidden water filtration conduit lines running down the hollow structural branching columns.',
        svgType: 'section'
      }
    ],
    specs: {
      materials: [
        { name: 'Plaza Trunk', value: 'High-strength recycled structural steel columns' },
        { name: 'Leaf Shaders', value: 'Parametric semi-translucent PVDF smart polymer membranes' },
        { name: 'Water Conduits', value: 'Grade-316 brushed architectural stainless steel pipes' }
      ],
      structural: [
        { name: 'Truss Geometry', value: 'Parametric biomimetic branching space-frame steel trusses' },
        { name: 'Foundation', value: 'Micro-pile grouping anchored into subway-tunnel retaining structures' },
        { name: 'Wind Mitigation', value: 'Dynamic dampening springs on individual shader leaf anchors' }
      ],
      environmental: [
        { name: 'Evaporative Cool', value: 'Ultrasonic high-pressure mist system reducing local temp by 10°F' },
        { name: 'Power Harvesting', value: 'Flexible organic photovoltaic (OPV) printable leaf coatings' },
        { name: 'Rainwater Plan', value: 'Internal column channels feeding 20,000L subterranean filtration vault' }
      ]
    }
  }
];

export const experiences: CVExperience[] = [
  {
    id: 'exp-1',
    period: '2023 - Present',
    role: 'Lead Project Architect',
    firm: 'Snohetta-inspired Studio (KRAMAN & ASSOCIATES)',
    location: 'Basel, Switzerland',
    description: 'Directed the design and technical detailing of public cultural buildings, high-end private residences, and low-carbon commercial workspaces across Scandinavia and Switzerland. Pioneered mass-timber architectural research, computational solar simulations, and zero-loss circular materials tracking.'
  },
  {
    id: 'exp-2',
    period: '2020 - 2023',
    role: 'Senior Architectural Designer',
    firm: 'Kengo Kuma Associates (Japan Office)',
    location: 'Tokyo, Japan',
    description: 'Spearheaded design development for premium timber-centric cultural pavilions. Developed bespoke parametric scripts in Grasshopper to realize highly complex structural timber lattice joints. Managed multidisciplinary coordination across structural, mechanical, and sustainable envelope consultants.'
  },
  {
    id: 'exp-3',
    period: '2017 - 2020',
    role: 'Architectural Designer',
    firm: 'Olson Kundig Architects',
    location: 'Seattle, WA, USA',
    description: 'Collaborated on award-winning custom residential cabins and off-grid remote retreats in North America. Mastered heavy-timber detailing, kinetic architectural mechanisms (operable steel walls, sliding roof panels), and native landscape site integration.'
  }
];

export const educations: CVEducation[] = [
  {
    id: 'edu-1',
    period: '2015 - 2017',
    degree: 'Master of Architecture (M.Arch)',
    institution: 'ETH Zürich (Swiss Federal Institute of Technology)',
    location: 'Zürich, Switzerland',
    achievements: 'Summa Cum Laude. Master Thesis: "Pre-assembled Mass Timber Structures for Alpine Climates". Awarded the ETH Medal for Architectural Design.'
  },
  {
    id: 'edu-2',
    period: '2011 - 2015',
    degree: 'Bachelor of Arts in Architectural Studies',
    institution: 'University of Tokyo',
    location: 'Tokyo, Japan',
    achievements: 'First Class Honors. Specialization in Parametric Biomimicry and Wood-craft Joinery.'
  }
];

export const awards: CVAward[] = [
  {
    id: 'aw-1',
    year: '2025',
    title: 'European Prize for Architecture: Emerging Voice',
    institution: 'European Centre for Architecture'
  },
  {
    id: 'aw-2',
    year: '2024',
    title: 'Sustainable Residential Design Award (The Obsidian Pavilion)',
    project: 'The Obsidian Pavilion',
    institution: 'Scandinavian Architectural Review'
  },
  {
    id: 'aw-3',
    year: '2022',
    title: 'Young Architect of the Year (Shortlist)',
    institution: 'World Architecture Festival (WAF)'
  }
];

export const skillCategories: SkillCategory[] = [
  {
    id: 'sk-1',
    name: 'Design & Modeling',
    skills: ['Rhino 3D', 'Revit (BIM)', 'Grasshopper (Parametric)', 'AutoCAD', 'ArchiCAD']
  },
  {
    id: 'sk-2',
    name: 'Visualization',
    skills: ['V-Ray', 'Twinmotion', 'Adobe Creative Suite', 'Enscape', 'Figma (UX/UI)']
  },
  {
    id: 'sk-3',
    name: 'Technical & Systems',
    skills: ['Mass-Timber (CLT/Glulam)', 'Kinetic Mechanisms', 'Passivhaus Planning (PHPP)', 'Life Cycle Assessment (LCA)']
  }
];
