/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Play, Pause, Compass, Layers, Eye, Sliders, Sun, Palette } from 'lucide-react';

interface ThreeModelViewerProps {
  projectId: string;
  projectName: string;
}

export default function ThreeModelViewer({ projectId, projectName }: ThreeModelViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interaction / UI States
  const [explodeFactor, setExplodeFactor] = useState(0); // 0 to 1
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraView, setCameraView] = useState<'perspective' | 'plan' | 'elevation'>('perspective');
  const [solarTime, setSolarTime] = useState(12); // 6 to 20 (AM to PM)
  const [renderMode, setRenderMode] = useState<'textured' | 'clay' | 'wireframe'>('textured');
  const [season, setSeason] = useState<'summer' | 'winter' | 'equinox'>('summer');
  const [isSolarPlaying, setIsSolarPlaying] = useState(false);

  // Ref to animate the explode factor inside the render loop dynamically
  const explodeRef = useRef(0);
  useEffect(() => {
    explodeRef.current = explodeFactor;
  }, [explodeFactor]);

  // Ref to track solarTime inside the render loop dynamically without rebuilding scene
  const solarTimeRef = useRef(12);
  useEffect(() => {
    solarTimeRef.current = solarTime;
  }, [solarTime]);

  // Ref to track season inside the render loop dynamically
  const seasonRef = useRef<'summer' | 'winter' | 'equinox'>('summer');
  useEffect(() => {
    seasonRef.current = season;
  }, [season]);

  // Automatically cycle daylight from sunrise to sunset
  useEffect(() => {
    let intervalId: any;
    if (isSolarPlaying) {
      intervalId = setInterval(() => {
        setSolarTime((prev) => {
          let next = prev + 0.1;
          if (next > 20) {
            return 6; // Loop back to sunrise
          }
          return parseFloat(next.toFixed(2));
        });
      }, 50);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSolarPlaying]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#121212'); // Sleek off-black to match our theme

    // Add subtle grid helper & architectural axes helper
    const gridHelper = new THREE.GridHelper(24, 24, '#E0E0DE', '#2C2C2B');
    // Align grid slightly below zero to prevent z-fighting
    gridHelper.position.y = -2.01;
    (gridHelper.material as THREE.Material).opacity = 0.15;
    (gridHelper.material as THREE.Material).transparent = true;
    scene.add(gridHelper);

    // --- CAMERA SETUP ---
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(8, 6, 10);
    camera.lookAt(0, 0, 0);

    // --- RENDERER SETUP ---
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('#ffffff', 1.0);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight('#ffffff', 0.25);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    // --- MATERIALS GENERATOR ---
    const createArchMaterial = (color: string, opacity = 1.0, wireframe = false) => {
      let finalColor = new THREE.Color(color);
      let finalOpacity = opacity;
      let finalRoughness = 0.4;
      let finalMetalness = color === '#A0A0A0' || color === '#E5E5E5' ? 0.3 : 0.1;
      let finalWireframe = wireframe;

      if (renderMode === 'clay') {
        // Monochromatic sculptural clay look
        if (color === '#4D8099' || color === '#66B2FF' || opacity < 1.0) {
          // Translucent plaster/glass
          finalColor.set('#D6D6D2');
          finalOpacity = 0.25;
          finalRoughness = 0.9;
          finalMetalness = 0.0;
        } else {
          // Pure matte white plaster
          finalColor.set('#F3F3F0');
          finalOpacity = 1.0;
          finalRoughness = 0.85;
          finalMetalness = 0.0;
        }
      } else if (renderMode === 'wireframe') {
        // Tech blueprint look
        if (color === '#4D8099' || color === '#66B2FF' || opacity < 1.0) {
          finalColor.set('#14B8A6');
          finalOpacity = 0.04;
          finalRoughness = 1.0;
          finalMetalness = 0.0;
        } else {
          // Semi-transparent structure
          finalColor.set('#111111');
          finalOpacity = 0.2;
          finalWireframe = true;
        }
      }

      return new THREE.MeshStandardMaterial({
        color: finalColor,
        roughness: finalRoughness,
        metalness: finalMetalness,
        transparent: opacity < 1.0 || renderMode === 'wireframe' || finalOpacity < 1.0,
        opacity: finalOpacity,
        wireframe: finalWireframe,
        side: THREE.DoubleSide,
      });
    };

    // Keep track of animated meshes
    const animatedObjects: Array<{
      mesh: THREE.Object3D;
      basePos: THREE.Vector3;
      explodeDir: THREE.Vector3;
      explodeScale: number;
    }> = [];

    // Helper to add mesh + wireframe outline for that clean drafting-look
    const addArchMesh = (
      geometry: THREE.BufferGeometry,
      color: string,
      opacity: number,
      basePos: THREE.Vector3,
      explodeDir: THREE.Vector3,
      explodeScale = 1.0,
      customRotation?: THREE.Euler
    ) => {
      const group = new THREE.Group();
      group.position.copy(basePos);
      if (customRotation) {
        group.rotation.copy(customRotation);
      }

      // 1. Solid Mesh
      const mat = createArchMaterial(color, opacity);
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // 2. Wireframe lines
      const wireframeGeom = new THREE.EdgesGeometry(geometry);
      
      let wireframeColor = opacity < 1.0 ? '#888888' : '#F7F7F5';
      let wireframeOpacity = opacity < 1.0 ? 0.4 : 0.7;

      if (renderMode === 'clay') {
        wireframeColor = '#A0A0A0';
        wireframeOpacity = 0.35;
      } else if (renderMode === 'wireframe') {
        wireframeColor = '#14B8A6'; // Glowing cyan line
        wireframeOpacity = 0.95;
      }

      const wireframeMat = new THREE.LineBasicMaterial({
        color: wireframeColor,
        transparent: true,
        opacity: wireframeOpacity,
      });
      const lines = new THREE.LineSegments(wireframeGeom, wireframeMat);
      group.add(lines);

      scene.add(group);
      animatedObjects.push({
        mesh: group,
        basePos: basePos.clone(),
        explodeDir: explodeDir.clone(),
        explodeScale,
      });

      return group;
    };

    // --- CONSTRUCT Bespoke Model based on Project ID ---
    if (projectId === 'obsidian-pavilion') {
      // Norwegian Charred Pine Cabins
      // Rock platform
      const rockGeom = new THREE.BoxGeometry(7, 0.6, 7);
      addArchMesh(rockGeom, '#2C2C2B', 1.0, new THREE.Vector3(0, -1.7, 0), new THREE.Vector3(0, -1, 0), 0.5);

      // Main low-slung cabin 1 (Communal)
      const cabin1Geom = new THREE.BoxGeometry(3.5, 1.2, 1.6);
      addArchMesh(cabin1Geom, '#1A1A1A', 1.0, new THREE.Vector3(-1.2, -0.8, -0.5), new THREE.Vector3(-1, 0, -0.5), 1.5);

      // Cabin 2 (Sleeping)
      const cabin2Geom = new THREE.BoxGeometry(2.5, 1.0, 1.5);
      addArchMesh(cabin2Geom, '#1A1A1A', 1.0, new THREE.Vector3(1.4, -0.9, 0.8), new THREE.Vector3(1, 0, 0.8), 1.5);

      // Glass Breezeway (Connecting core)
      const bridgeGeom = new THREE.BoxGeometry(1.5, 1.0, 1.0);
      addArchMesh(bridgeGeom, '#4D8099', 0.4, new THREE.Vector3(0.2, -0.9, 0.1), new THREE.Vector3(0, 1.2, 0), 1.0);

      // Abstract Pine trees
      const trunkGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.5);
      const leafGeom = new THREE.ConeGeometry(0.6, 1.8, 5);

      // Tree 1
      const t1 = new THREE.Group();
      const tr1 = new THREE.Mesh(trunkGeom, createArchMaterial('#402010'));
      tr1.position.y = -0.55;
      const lf1 = new THREE.Mesh(leafGeom, createArchMaterial('#2B3A2C'));
      lf1.position.y = 0.5;
      t1.add(tr1, lf1);
      t1.position.set(-2.8, -0.7, 2.2);
      scene.add(t1);

      // Tree 2
      const t2 = new THREE.Group();
      const tr2 = new THREE.Mesh(trunkGeom, createArchMaterial('#402010'));
      tr2.position.y = -0.55;
      const lf2 = new THREE.Mesh(leafGeom, createArchMaterial('#2B3A2C'));
      lf2.position.y = 0.5;
      t2.add(tr2, lf2);
      t2.position.set(2.8, -0.7, -2.2);
      scene.add(t2);

    } else if (projectId === 'monolith-center') {
      // Brutalist Concrete Art Space with dramatic vertical light canyons
      // Pavement Base
      const baseGeom = new THREE.BoxGeometry(6, 0.3, 6);
      addArchMesh(baseGeom, '#2C2C2B', 1.0, new THREE.Vector3(0, -1.85, 0), new THREE.Vector3(0, -1, 0), 0.4);

      // Lower entrance foyer glass box
      const foyerGeom = new THREE.BoxGeometry(4.0, 1.2, 4.0);
      addArchMesh(foyerGeom, '#4D8099', 0.3, new THREE.Vector3(0, -1.1, 0), new THREE.Vector3(0, 0, 0), 0);

      // Core Monolith Concrete Mass (Outer casing)
      const coreGeom = new THREE.BoxGeometry(4.6, 2.5, 4.6);
      addArchMesh(coreGeom, '#E5E5E5', 1.0, new THREE.Vector3(0, 0.75, 0), new THREE.Vector3(0, 1.8, 0), 1.5);

      // Monumental Light Well Block slices (represented by dark hollow slabs on top)
      const wellGeom = new THREE.BoxGeometry(0.5, 0.8, 3.8);
      addArchMesh(wellGeom, '#222222', 1.0, new THREE.Vector3(-1.2, 2.1, 0), new THREE.Vector3(-0.5, 1, 0), 2.0);
      addArchMesh(wellGeom, '#222222', 1.0, new THREE.Vector3(1.2, 2.1, 0), new THREE.Vector3(0.5, 1, 0), 2.0);

      const wellCrossGeom = new THREE.BoxGeometry(3.8, 0.8, 0.5);
      addArchMesh(wellCrossGeom, '#222222', 1.0, new THREE.Vector3(0, 2.1, 1.2), new THREE.Vector3(0, 1, 0.5), 2.0);

    } else if (projectId === 'aether-hq') {
      // Mass-Timber eco HQ with structural grid and double-skin glass facade
      // Concrete ground base
      const concreteBase = new THREE.BoxGeometry(5.2, 0.2, 5.2);
      addArchMesh(concreteBase, '#2C2C2B', 1.0, new THREE.Vector3(0, -1.9, 0), new THREE.Vector3(0, -1, 0), 0.4);

      // Internal Mass-Timber Columns (Pillars)
      const pillarGeom = new THREE.CylinderGeometry(0.08, 0.08, 3.2);
      const positions = [
        [-1.8, -1.8], [-1.8, -0.6], [-1.8, 0.6], [-1.8, 1.8],
        [-0.6, -1.8],                           [-0.6, 1.8], // central void for atrium
        [0.6, -1.8],                            [0.6, 1.8],
        [1.8, -1.8],  [1.8, -0.6],  [1.8, 0.6],  [1.8, 1.8]
      ];

      const columnsGroup = new THREE.Group();
      positions.forEach(([x, z]) => {
        const pillar = new THREE.Mesh(pillarGeom, createArchMaterial('#D2B48C')); // Warm spruce timber color
        pillar.position.set(x, 1.6, z);
        pillar.castShadow = true;
        columnsGroup.add(pillar);
      });

      // CLT Floor levels
      const floorGeom = new THREE.BoxGeometry(4.4, 0.1, 4.4);
      const f1 = new THREE.Mesh(floorGeom, createArchMaterial('#D2B48C'));
      f1.position.y = 1.0;
      const f2 = new THREE.Mesh(floorGeom, createArchMaterial('#D2B48C'));
      f2.position.y = 2.1;
      const f3 = new THREE.Mesh(floorGeom, createArchMaterial('#D2B48C'));
      f3.position.y = 3.2;
      columnsGroup.add(f1, f2, f3);

      // Move columns group to the correct base height
      columnsGroup.position.y = -1.8;
      scene.add(columnsGroup);
      animatedObjects.push({
        mesh: columnsGroup,
        basePos: new THREE.Vector3(0, -1.8, 0),
        explodeDir: new THREE.Vector3(0, -0.6, 0),
        explodeScale: 1.0,
      });

      // Helical Atrium sculpture inside the center
      const torusGeom = new THREE.TorusGeometry(0.8, 0.12, 8, 24);
      const ring1 = addArchMesh(torusGeom, '#E5E5E5', 1.0, new THREE.Vector3(0, -0.8, 0), new THREE.Vector3(0, 0, 0), 0, new THREE.Euler(Math.PI / 2, 0.2, 0));
      const ring2 = addArchMesh(torusGeom, '#E5E5E5', 1.0, new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(0, 0.2, 0), 0, new THREE.Euler(Math.PI / 2, -0.2, 0));
      const ring3 = addArchMesh(torusGeom, '#E5E5E5', 1.0, new THREE.Vector3(0, 1.3, 0), new THREE.Vector3(0, 0.4, 0), 0, new THREE.Euler(Math.PI / 2, 0.4, 0));

      // External Glass Facade Envelope
      const glassEnvelopeGeom = new THREE.BoxGeometry(4.8, 3.6, 4.8);
      addArchMesh(glassEnvelopeGeom, '#66B2FF', 0.18, new THREE.Vector3(0, -0.1, 0), new THREE.Vector3(0, 1.8, 0), 1.6);

    } else if (projectId === 'canyon-retreat') {
      // Desert Rammed Earth Retreat with Corten Steel Cantilever Roof
      // Red desert sand base
      const sandGeom = new THREE.BoxGeometry(6.5, 0.4, 6.5);
      addArchMesh(sandGeom, '#A0522D', 1.0, new THREE.Vector3(0, -1.8, 0), new THREE.Vector3(0, -1, 0), 0.4);

      // Rammed earth red clay walls (interlocking layouts)
      const earthWall1 = new THREE.BoxGeometry(3.8, 1.4, 0.4);
      addArchMesh(earthWall1, '#CD5C5C', 1.0, new THREE.Vector3(-0.6, -1.1, -1.2), new THREE.Vector3(-0.4, 0, -0.8), 1.2);

      const earthWall2 = new THREE.BoxGeometry(0.4, 1.4, 3.2);
      addArchMesh(earthWall2, '#CD5C5C', 1.0, new THREE.Vector3(-1.6, -1.1, 0.6), new THREE.Vector3(-0.8, 0, 0.4), 1.2);

      const earthWall3 = new THREE.BoxGeometry(2.8, 1.4, 0.4);
      addArchMesh(earthWall3, '#CD5C5C', 1.0, new THREE.Vector3(0.8, -1.1, 1.4), new THREE.Vector3(0.4, 0, 0.8), 1.2);

      // Large structural glass screens
      const glassScreen = new THREE.BoxGeometry(2.4, 1.4, 0.08);
      addArchMesh(glassScreen, '#4D8099', 0.25, new THREE.Vector3(0.8, -1.1, -0.2), new THREE.Vector3(0.4, 0, -0.2), 1.0);

      // Pre-weathered Corten steel canopy roof (overhanging cantilever)
      const roofGeom = new THREE.BoxGeometry(5.2, 0.15, 4.8);
      addArchMesh(roofGeom, '#8B4513', 1.0, new THREE.Vector3(-0.2, -0.2, 0.1), new THREE.Vector3(0, 2.2, 0), 1.6);

    } else if (projectId === 'helios-outpost') {
      // Volcanic glacier scientific research biome with floating modular pods on outrigger legs
      // Snowflake & Basalt field
      const basaltGeom = new THREE.BoxGeometry(6.2, 0.5, 6.2);
      addArchMesh(basaltGeom, '#1C1C1C', 1.0, new THREE.Vector3(0, -1.85, 0), new THREE.Vector3(0, -1, 0), 0.4);

      const snowFieldGeom = new THREE.BoxGeometry(5.8, 0.1, 5.8);
      addArchMesh(snowFieldGeom, '#F0F8FF', 0.9, new THREE.Vector3(0, -1.55, 0), new THREE.Vector3(0, -0.8, 0), 0.3);

      // Modular Sphere Pods
      const podGeom = new THREE.DodecahedronGeometry(0.8, 1);

      // Central Pod
      addArchMesh(podGeom, '#E5E5E5', 1.0, new THREE.Vector3(0, -0.1, 0), new THREE.Vector3(0, 1.5, 0), 1.5);

      // Side Pod Left
      addArchMesh(podGeom, '#A0A0A0', 1.0, new THREE.Vector3(-1.8, -0.4, -0.6), new THREE.Vector3(-1, 1.2, -0.6), 1.5);

      // Side Pod Right
      addArchMesh(podGeom, '#A0A0A0', 1.0, new THREE.Vector3(1.8, -0.4, 0.6), new THREE.Vector3(1, 1.2, 0.6), 1.5);

      // Coupling bridges (horizontal cylinders)
      const bridgeGeom = new THREE.CylinderGeometry(0.18, 0.18, 2.0);
      addArchMesh(bridgeGeom, '#444444', 1.0, new THREE.Vector3(-0.9, -0.3, -0.3), new THREE.Vector3(-0.5, 0.8, -0.3), 1.0, new THREE.Euler(0, 0, Math.PI / 2.3));
      addArchMesh(bridgeGeom, '#444444', 1.0, new THREE.Vector3(0.9, -0.3, 0.3), new THREE.Vector3(0.5, 0.8, 0.3), 1.0, new THREE.Euler(0, 0, -Math.PI / 2.3));

      // Adjustable tripod outrigger legs
      const legGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.6);
      const legPositions = [
        [-1.8, -1.2, -0.6],
        [1.8, -1.2, 0.6],
        [0, -0.9, 0]
      ];
      legPositions.forEach(([x, y, z], index) => {
        const legGroup = new THREE.Group();
        const leg = new THREE.Mesh(legGeom, createArchMaterial('#888888'));
        leg.castShadow = true;
        legGroup.add(leg);

        const padGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.08);
        const pad = new THREE.Mesh(padGeom, createArchMaterial('#444444'));
        pad.position.y = -0.8;
        legGroup.add(pad);

        legGroup.position.set(x, y, z);
        scene.add(legGroup);
        animatedObjects.push({
          mesh: legGroup,
          basePos: new THREE.Vector3(x, y, z),
          explodeDir: new THREE.Vector3(x * 0.2, -0.5, z * 0.2),
          explodeScale: 1.0,
        });
      });

    } else {
      // Fractal Plaza Canopy (Tokyo Shibuya Plaza)
      // Dark city plaza floor tiles
      const plazaGeom = new THREE.BoxGeometry(6.0, 0.2, 6.0);
      addArchMesh(plazaGeom, '#1E1E1E', 1.0, new THREE.Vector3(0, -1.9, 0), new THREE.Vector3(0, -1, 0), 0.4);

      // Central steel trunk (tapered)
      const trunkGeom = new THREE.CylinderGeometry(0.12, 0.35, 2.5, 8);
      addArchMesh(trunkGeom, '#708090', 1.0, new THREE.Vector3(0, -0.65, 0), new THREE.Vector3(0, -0.5, 0), 0.5);

      // Structural steel space-frame branch trusses (represented by simple radial lines/cylinders)
      const trussGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.8);
      const trussGroup = new THREE.Group();

      const branchAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
      branchAngles.forEach((angle) => {
        const branch = new THREE.Mesh(trussGeom, createArchMaterial('#475569'));
        branch.rotation.z = Math.PI / 3;
        branch.rotation.y = angle;
        branch.position.y = 0.8;
        branch.castShadow = true;
        trussGroup.add(branch);
      });
      trussGroup.position.set(0, 0, 0);
      scene.add(trussGroup);
      animatedObjects.push({
        mesh: trussGroup,
        basePos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0.4, 0),
        explodeScale: 0.8,
      });

      // Parametric green-glass leaf canopy cloud
      const leafCloudGroup = new THREE.Group();
      const leafGeom = new THREE.BoxGeometry(0.4, 0.03, 0.4);

      // Generate leaf layout points procedurally in Fibonacci dome
      const leafCount = 48;
      for (let i = 0; i < leafCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / leafCount);
        const theta = Math.sqrt(leafCount * Math.PI) * phi;

        const x = 2.4 * Math.sin(phi) * Math.cos(theta);
        const z = 2.4 * Math.sin(phi) * Math.sin(theta);
        const y = 1.0 + 1.2 * Math.cos(phi); // dome shape

        if (y > 0.6) {
          const leafMat = createArchMaterial('#14B8A6', 0.4); // translucent cyan/teal leaf
          const leaf = new THREE.Mesh(leafGeom, leafMat);
          leaf.position.set(x, y, z);
          // Angle leaves dynamically to simulate Komorebi
          leaf.rotation.set(Math.random() * 0.4, Math.random() * 0.4, angleToY(x, z));
          leaf.castShadow = true;
          leafCloudGroup.add(leaf);

          // Add simple edge outlines for drawing effect
          const edges = new THREE.EdgesGeometry(leafGeom);
          const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#E0E0DE', transparent: true, opacity: 0.3 }));
          line.position.copy(leaf.position);
          line.rotation.copy(leaf.rotation);
          leafCloudGroup.add(line);
        }
      }

      scene.add(leafCloudGroup);
      animatedObjects.push({
        mesh: leafCloudGroup,
        basePos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 2.0, 0),
        explodeScale: 1.5,
      });

      function angleToY(px: number, pz: number) {
        return Math.atan2(pz, px);
      }
    }

    // --- INTERACTIVE DRAG CAMERA CONTROLLER ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    // Spherical coordinates for custom orbital camera controls
    let theta = Math.PI / 4; // Horizontal rotation angle
    let phi = Math.PI / 3;   // Vertical angle
    let radius = 13.0;        // Camera distance

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      theta -= deltaX * 0.005;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - deltaY * 0.005));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(6.0, Math.min(22.0, radius + e.deltaY * 0.01));
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // --- RENDER LOOP ---
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Apply Explode factor dynamically based on slider state
      animatedObjects.forEach((obj) => {
        const factor = explodeRef.current * obj.explodeScale;
        obj.mesh.position.set(
          obj.basePos.x + obj.explodeDir.x * factor,
          obj.basePos.y + obj.explodeDir.y * factor,
          obj.basePos.z + obj.explodeDir.z * factor
        );
      });

      // Calculate solar position and lighting properties based on solar time and season
      const time = solarTimeRef.current;
      const currentSeason = seasonRef.current;
      const sunAngle = ((time - 6) / 14) * Math.PI; // Map 6:00 - 20:00 to 0 - Math.PI (sunrise to sunset)
      
      const distance = 16;
      
      // Calculate 3D position of the sun based on season tilt
      // In summer, sun is high overhead. In winter, sun is low-angled.
      let tiltOffset = 0.0; // Equinox
      let heightMultiplier = 0.9;
      if (currentSeason === 'summer') {
        tiltOffset = 0.25; // Tilted north
        heightMultiplier = 1.25;
      } else if (currentSeason === 'winter') {
        tiltOffset = -0.55; // Tilted south (creates long dramatic shadows)
        heightMultiplier = 0.45;
      }

      const sunX = Math.cos(sunAngle) * distance;
      const sunY = Math.sin(sunAngle) * distance * heightMultiplier;
      const sunZ = Math.sin(sunAngle) * Math.cos(tiltOffset) * 8 + Math.cos(sunAngle) * Math.sin(tiltOffset) * 4 + 2;
      
      mainLight.position.set(sunX, sunY, sunZ);

      // Determine colors and intensities dynamically
      let sunColor = new THREE.Color('#ffffff');
      let skyColor = new THREE.Color('#121212');
      let sunIntensity = 1.0;
      let ambientIntensity = 0.5;

      if (time < 8) {
        // Sunrise golden hour (6:00 - 8:00)
        const progress = (time - 6) / 2; // 0 to 1
        sunColor.lerpColors(new THREE.Color('#ff7d3b'), new THREE.Color('#ffd685'), progress);
        skyColor.lerpColors(new THREE.Color('#120a1c'), new THREE.Color('#18151f'), progress);
        sunIntensity = 0.4 + progress * 0.5;
        ambientIntensity = 0.2 + progress * 0.2;
      } else if (time >= 8 && time <= 16) {
        // Daytime full spectrum (8:00 - 16:00)
        sunColor.set('#ffffff');
        skyColor.set('#121212');
        sunIntensity = 0.9;
        ambientIntensity = 0.4;
      } else if (time > 16 && time <= 19) {
        // Sunset golden-copper twilight (16:00 - 19:00)
        const progress = (time - 16) / 3; // 0 to 1
        sunColor.lerpColors(new THREE.Color('#ffd685'), new THREE.Color('#ff3e18'), progress);
        skyColor.lerpColors(new THREE.Color('#121212'), new THREE.Color('#140b12'), progress);
        sunIntensity = 0.9 - progress * 0.5;
        ambientIntensity = 0.4 - progress * 0.15;
      } else {
        // Blue twilight dusk (19:00 - 20:00)
        const progress = (time - 19) / 1; // 0 to 1
        sunColor.lerpColors(new THREE.Color('#ff3e18'), new THREE.Color('#2c3e50'), progress);
        skyColor.lerpColors(new THREE.Color('#140b12'), new THREE.Color('#0b0e14'), progress);
        sunIntensity = 0.4 - progress * 0.3;
        ambientIntensity = 0.25 - progress * 0.15;
      }

      // Adjust intensity slightly for winter season (dimmer, cooler shadows)
      if (currentSeason === 'winter') {
        sunIntensity *= 0.75;
        ambientIntensity *= 0.85;
        if (time >= 8 && time <= 16) {
          sunColor.set('#f2f7ff'); // Ice-blue winter tint
        }
      } else if (currentSeason === 'summer') {
        sunIntensity *= 1.1;
      }

      mainLight.color.copy(sunColor);
      mainLight.intensity = sunIntensity;
      ambientLight.intensity = ambientIntensity;
      scene.background = skyColor;

      // Simple auto-rotation if enabled & user is not dragging
      if (autoRotate && !isDragging) {
        theta += 0.002;
      }

      // Convert spherical angles back to Cartesian coordinates for camera placement
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // --- HANDLE RESIZING ---
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Camera view controls API refs (for component state listeners)
    const setPresetView = (view: 'perspective' | 'plan' | 'elevation') => {
      if (view === 'perspective') {
        theta = Math.PI / 4;
        phi = Math.PI / 3;
        radius = 13.0;
      } else if (view === 'plan') {
        theta = 0;
        phi = 0.05; // tiny offset so lookAt works perfectly
        radius = 14.0;
      } else if (view === 'elevation') {
        theta = 0;
        phi = Math.PI / 2 - 0.01;
        radius = 13.0;
      }
    };
    (canvas as any).setPresetView = setPresetView;

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);

      // Recursive disposal to completely free up graphics memory
      scene.traverse((obj) => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [projectId, renderMode]);

  // Handle Preset View state changes
  const handleViewPreset = (view: 'perspective' | 'plan' | 'elevation') => {
    setCameraView(view);
    setAutoRotate(view === 'perspective'); // turn off auto rotation in ortho elevations for clarity
    if (canvasRef.current && (canvasRef.current as any).setPresetView) {
      (canvasRef.current as any).setPresetView(view);
    }
  };

  const handleReset = () => {
    setExplodeFactor(0);
    setSolarTime(12);
    setRenderMode('textured');
    handleViewPreset('perspective');
    setAutoRotate(true);
  };

  const getSolarTimeLabel = (hour: number) => {
    if (hour === 6) return '06:00 AM (Dawn Sunrise)';
    if (hour < 10) return `0${Math.floor(hour)}:00 AM (Morning Study)`;
    if (hour < 12) return `${Math.floor(hour)}:00 AM (Midday Angle)`;
    if (hour === 12) return '12:00 PM (Solar Zenith)';
    if (hour < 16) return `0${Math.floor(hour) - 12}:00 PM (Afternoon Cast)`;
    if (hour < 18) return `0${Math.floor(hour) - 12}:00 PM (Golden Hour)`;
    if (hour < 20) return `0${Math.floor(hour) - 12}:00 PM (Sunset Twilight)`;
    return '08:00 PM (Late Dusk Study)';
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // relative X between 0 and SVG width (180)
    const startX = 25;
    const endX = 155;
    const pct = Math.max(0, Math.min(1, (clickX - startX) / (endX - startX)));
    const targetHour = 6 + pct * 14;
    setSolarTime(parseFloat(targetHour.toFixed(1)));
    setIsSolarPlaying(false); // Pause auto-play when user manually overrides
  };

  const getAnalysisFeedback = () => {
    if (solarTime < 7) {
      return {
        title: "Dawn Horizon",
        comfort: "Passive Heating Phase",
        desc: "Low-angle incident radiation warming exterior load-bearing masonry walls. Louvers are fully retracted to maximize thermal gains."
      };
    }
    if (solarTime < 10) {
      return {
        title: "Optimal Morning",
        comfort: "Visual Comfort Range",
        desc: "Indirect, diffuse sunlight filling interior lightwells. Shading and thermal envelope at steady state with negligible glare risk."
      };
    }
    if (solarTime < 14) {
      return {
        title: "Solar Zenith",
        comfort: season === 'summer' ? "High Glare Risk" : "Optimal Winter Heating",
        desc: season === 'summer' 
          ? "Direct zenith radiation. Shading canopy deployed to mitigate interior cooling load and block solar gains."
          : "Steep winter sun warming the main concrete thermal core directly, providing passive radiant heat retention."
      };
    }
    if (solarTime < 17) {
      return {
        title: "Mid-Afternoon Decline",
        comfort: "Adaptive Deflection Active",
        desc: "Sinking sun angle. Louvers adjust to deflect low solar angles while preserving clear cross-ventilation lines."
      };
    }
    if (solarTime < 19) {
      return {
        title: "Golden Hour Twilight",
        comfort: "High Contrast Aesthetic",
        desc: "Dramatic low shadows extending across the site landscape. Maximum solar collector absorption before nightfall."
      };
    }
    return {
      title: "Late Dusk Study",
      comfort: "Zero Passive Gain",
      desc: "Ambient twilight. External solar systems go offline; automated indoor low-voltage LED thermal pathways engage."
    };
  };

  const sunSvgAngle = Math.PI - ((solarTime - 6) / 14) * Math.PI;
  const sunSvgX = 90 + Math.cos(sunSvgAngle) * 65;
  const sunSvgY = 75 - Math.sin(sunSvgAngle) * 65;

  const currentRadPeak = season === 'summer' ? 980 : season === 'winter' ? 520 : 750;
  const currentRadVal = Math.floor(Math.sin(sunSvgAngle) * currentRadPeak);
  const currentLuxPeak = season === 'summer' ? 112000 : season === 'winter' ? 48000 : 82000;
  const currentLuxVal = Math.floor(Math.sin(sunSvgAngle) * currentLuxPeak);

  const louverShadingPct = currentRadVal <= 200 
    ? 0 
    : Math.min(95, Math.round(((currentRadVal - 200) / (season === 'summer' ? 780 : 550)) * 95));

  return (
    <div className="bg-[#121212] text-[#F7F7F5] rounded-sm p-6 border border-[#E0E0DE]/20 shadow-2xl overflow-hidden flex flex-col h-auto min-h-[660px] lg:h-[720px] relative" id="cad-3d-viewer">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0E0DE]/20 pb-4 mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#888888] bg-[#F7F7F5]/10 px-2 py-0.5 rounded-sm">
              3D Massing Study
            </span>
            <span className="text-xs font-mono text-[#888888]">Interactive Spatial Model</span>
          </div>
          <h4 className="text-md font-sans font-medium mt-1 text-[#F7F7F5]">{projectName} (Axonometric)</h4>
        </div>

        {/* Toolbar views */}
        <div className="flex items-center gap-2 bg-[#F7F7F5]/5 p-1 rounded border border-[#E0E0DE]/10" id="view-preset-buttons">
          <button
            onClick={() => handleViewPreset('perspective')}
            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm transition cursor-pointer ${
              cameraView === 'perspective' ? 'bg-[#F7F7F5] text-[#121212]' : 'text-[#888888] hover:text-[#F7F7F5]'
            }`}
            id="btn-view-perspective"
            title="3D Perspective"
          >
            3D Orbit
          </button>
          <button
            onClick={() => handleViewPreset('plan')}
            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm transition cursor-pointer ${
              cameraView === 'plan' ? 'bg-[#F7F7F5] text-[#121212]' : 'text-[#888888] hover:text-[#F7F7F5]'
            }`}
            id="btn-view-plan"
            title="Top-Down Plan View"
          >
            Plan
          </button>
          <button
            onClick={() => handleViewPreset('elevation')}
            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm transition cursor-pointer ${
              cameraView === 'elevation' ? 'bg-[#F7F7F5] text-[#121212]' : 'text-[#888888] hover:text-[#F7F7F5]'
            }`}
            id="btn-view-elevation"
            title="Front Elevation View"
          >
            Elevation
          </button>
        </div>
      </div>

      {/* Split Layout: 3D Stage + Daylight HUD Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden" id="viewer-split-container">
        
        {/* Left Column: Main 3D Canvas stage */}
        <div 
          ref={containerRef} 
          className="lg:col-span-8 bg-[#121212] rounded-sm border border-[#E0E0DE]/20 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing h-[320px] lg:h-full"
          id="canvas-3d-container"
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Compass indicator overlay */}
          <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-1.5 bg-[#121212]/80 border border-[#E0E0DE]/10 px-2.5 py-1 rounded-sm text-[10px] font-mono text-[#888888]">
            <Compass size={12} className="animate-spin-slow" />
            <span>AXO STAGE_01</span>
          </div>

          {/* Interactive Instruction Tip overlay */}
          <div className="absolute bottom-4 left-4 pointer-events-none text-[9px] font-mono text-[#888888] bg-[#121212]/80 px-2.5 py-1 border border-[#E0E0DE]/10 rounded-sm">
            DRAG TO ORBIT  |  SCROLL TO ZOOM
          </div>
        </div>

        {/* Right Column: Daylight HUD & Solar Study Panel */}
        <div 
          className="lg:col-span-4 bg-[#181818] border border-[#E0E0DE]/10 rounded-sm p-4 flex flex-col justify-between gap-4 overflow-y-auto"
          id="solar-analytics-hud"
        >
          <div className="flex flex-col gap-4">
            {/* HUD Header */}
            <div className="border-b border-[#E0E0DE]/10 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#888888] tracking-widest uppercase">DAYLIGHT ANALYTICS</span>
              <span className="font-mono text-[8px] text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded uppercase">SOLAR_SIM_v2.0</span>
            </div>

            {/* Live Sun Path SVG Semicircle */}
            <div className="flex flex-col items-center justify-center bg-[#121212] p-2 rounded border border-[#E0E0DE]/5 relative">
              <svg 
                width="100%" 
                height="85" 
                viewBox="0 0 180 90" 
                className="cursor-crosshair select-none"
                onClick={handleSvgClick}
                id="solar-arc-svg"
              >
                {/* Semicircle sun trajectory path */}
                <path 
                  d="M 25 75 A 65 65 0 0 1 155 75" 
                  fill="none" 
                  stroke="#E0E0DE" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 3" 
                  className="opacity-25" 
                />
                {/* Horizon baseline */}
                <line x1="10" y1="75" x2="170" y2="75" stroke="#E0E0DE" strokeWidth="1" className="opacity-20" />
                
                {/* Sunrise tick */}
                <circle cx="25" cy="75" r="2" fill="#888888" className="opacity-60" />
                <text x="25" y="86" fontSize="7" fill="#888888" textAnchor="middle" className="font-mono uppercase select-none opacity-60">SR 6AM</text>
                
                {/* Sunset tick */}
                <circle cx="155" cy="75" r="2" fill="#888888" className="opacity-60" />
                <text x="155" y="86" fontSize="7" fill="#888888" textAnchor="middle" className="font-mono uppercase select-none opacity-60">SS 8PM</text>

                {/* Solar Zenith (Noon) label */}
                <text x="90" y="20" fontSize="7" fill="#888888" textAnchor="middle" className="font-mono uppercase select-none opacity-40">ZENITH 12PM</text>

                {/* Glowing yellow sun indicator circle */}
                <g>
                  <circle 
                    cx={Math.max(10, Math.min(170, sunSvgX))} 
                    cy={sunSvgY} 
                    r="12" 
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="1" 
                    className="opacity-15 animate-pulse" 
                  />
                  <circle 
                    cx={Math.max(10, Math.min(170, sunSvgX))} 
                    cy={sunSvgY} 
                    r="6" 
                    fill="#F59E0B" 
                    className="shadow-lg filter drop-shadow-[0_0_6px_rgba(245,158,11,0.9)] transition-all duration-100" 
                  />
                </g>
              </svg>
              <span className="text-[8px] font-mono text-[#888888] absolute bottom-0.5 uppercase">CLICK ARC TO POSITION SUN</span>
            </div>

            {/* Season & Solar Play Selector */}
            <div className="grid grid-cols-2 gap-2">
              {/* Season Button set */}
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-mono text-[#888888] uppercase tracking-wider">SEASON STUDY:</span>
                <div className="flex items-center bg-[#121212] p-0.5 rounded border border-[#E0E0DE]/10" id="season-selector">
                  {(['summer', 'equinox', 'winter'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeason(s)}
                      className={`flex-1 py-1 text-[8px] font-mono uppercase tracking-tight rounded-sm transition cursor-pointer text-center ${
                        season === s ? 'bg-[#F7F7F5] text-[#121212] font-semibold' : 'text-[#888888] hover:text-[#F7F7F5]'
                      }`}
                      title={`${s.charAt(0).toUpperCase() + s.slice(1)} Solstice Shadows`}
                    >
                      {s.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solar play button */}
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-mono text-[#888888] uppercase tracking-wider">DAYLIGHT PATH:</span>
                <button
                  onClick={() => setIsSolarPlaying(!isSolarPlaying)}
                  className={`w-full py-1.5 rounded-sm text-[8px] font-mono transition-colors cursor-pointer border flex items-center justify-center gap-1 uppercase ${
                    isSolarPlaying 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse' 
                      : 'bg-transparent text-[#888888] border-[#E0E0DE]/10 hover:text-[#F7F7F5] hover:border-[#E0E0DE]/20'
                  }`}
                  id="btn-play-solar-path"
                  title={isSolarPlaying ? 'Pause Daylight Progression' : 'Play Daylight Progression'}
                >
                  {isSolarPlaying ? <Pause size={10} /> : <Play size={10} />}
                  <span>{isSolarPlaying ? 'CYCLE ACTIVE' : 'PLAY CYCLE'}</span>
                </button>
              </div>
            </div>

            {/* real-time numerical values matrix */}
            <div className="grid grid-cols-2 gap-2 bg-[#121212] p-2.5 rounded border border-[#E0E0DE]/5 font-mono text-[9px]">
              <div className="flex flex-col border-r border-[#E0E0DE]/10 pr-2">
                <span className="text-[#888888] text-[8px] uppercase">SUN AZIMUTH:</span>
                <span className="text-[#F7F7F5] font-semibold mt-0.5">{Math.round(90 + ((solarTime - 6) / 14) * 180)}° {solarTime < 12 ? 'E' : 'W'}</span>
              </div>
              <div className="flex flex-col pl-2">
                <span className="text-[#888888] text-[8px] uppercase">SUN ALTITUDE:</span>
                <span className="text-[#F7F7F5] font-semibold mt-0.5">
                  {Math.round(Math.max(0, Math.sin(sunSvgAngle) * (season === 'summer' ? 82 : season === 'winter' ? 32 : 56)))}°
                </span>
              </div>
              <div className="flex flex-col border-r border-[#E0E0DE]/10 pr-2 pt-1.5 border-t border-[#E0E0DE]/10">
                <span className="text-[#888888] text-[8px] uppercase">RAD. EXPOSURE:</span>
                <span className="text-amber-400 font-semibold mt-0.5">
                  {currentRadVal} W/m²
                </span>
              </div>
              <div className="flex flex-col pl-2 pt-1.5 border-t border-[#E0E0DE]/10">
                <span className="text-[#888888] text-[8px] uppercase">FACADE LUX:</span>
                <span className="text-[#F7F7F5] font-semibold mt-0.5">
                  {currentLuxVal.toLocaleString()} lx
                </span>
              </div>
            </div>

            {/* Louver Shading deployment */}
            <div className="bg-[#121212] p-2.5 rounded border border-[#E0E0DE]/5 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[8px] font-mono">
                <span className="text-[#888888] uppercase">LOUVER SHADING DEPLOYMENT:</span>
                <span className="text-emerald-400 font-semibold">
                  {louverShadingPct === 0 ? '0% (RETRACTED)' : `${louverShadingPct}% (DEPLOYED)`}
                </span>
              </div>
              <div className="w-full bg-[#E0E0DE]/10 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${louverShadingPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Narrative Synthesis */}
          <div className="border-t border-[#E0E0DE]/10 pt-2 flex flex-col gap-1 font-mono">
            <div className="flex items-center gap-1 text-[8px] text-[#888888] uppercase">
              <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
              <span>ENVIRONMENTAL SYNTHESIS:</span>
            </div>
            <div className="bg-[#121212]/50 p-2 rounded border border-[#E0E0DE]/5 flex flex-col gap-0.5">
              <span className="text-amber-500 text-[9px] uppercase font-bold">{getAnalysisFeedback().title} \ {getAnalysisFeedback().comfort}</span>
              <p className="text-[8px] text-[#888888] leading-normal">{getAnalysisFeedback().desc}</p>
            </div>
          </div>

        </div>

      </div>

      {/* Controls Dashboard panel */}
      <div className="mt-4 border-t border-[#E0E0DE]/20 pt-4 flex flex-col gap-4">
        
        {/* Row 1: Parameter Sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Explode factor slider */}
          <div className="flex items-center gap-3 bg-[#F7F7F5]/5 p-2 rounded border border-[#E0E0DE]/10">
            <div className="flex items-center gap-1.5 text-[#888888] shrink-0">
              <Sliders size={13} />
              <span className="text-[10px] font-mono tracking-wider uppercase">Assembly Explode:</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodeFactor}
              onChange={(e) => {
                setExplodeFactor(parseFloat(e.target.value));
                if (parseFloat(e.target.value) > 0) {
                  setAutoRotate(false); // Pause rotation on user interactive explosion
                }
              }}
              className="flex-1 accent-[#F7F7F5] bg-[#E0E0DE]/20 h-1.5 rounded-full outline-none cursor-pointer"
              id="explode-slider"
            />
            <span className="font-mono text-xs text-[#888888] w-8 text-right">{Math.round(explodeFactor * 100)}%</span>
          </div>

          {/* Solar Path Solar Slider */}
          <div className="flex items-center gap-3 bg-[#F7F7F5]/5 p-2 rounded border border-[#E0E0DE]/10">
            <div className="flex items-center gap-1.5 text-[#888888] shrink-0">
              <Sun size={13} className="text-amber-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider uppercase">Solar Study:</span>
            </div>
            <input
              type="range"
              min="6"
              max="20"
              step="0.1"
              value={solarTime}
              onChange={(e) => {
                setSolarTime(parseFloat(e.target.value));
                setAutoRotate(false); // Pause rotation so they can study the solar angles
              }}
              className="flex-1 accent-[#f59e0b] bg-[#E0E0DE]/20 h-1.5 rounded-full outline-none cursor-pointer"
              id="solar-slider"
            />
            <span className="font-mono text-[10px] text-[#888888] w-36 text-right truncate">
              {getSolarTimeLabel(solarTime)}
            </span>
          </div>
        </div>

        {/* Row 2: Styles, Rotation and reset actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E0E0DE]/10 pt-3">
          
          {/* Aesthetic Rendering styles */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[#888888] mr-1">
              <Palette size={13} />
              <span className="text-[10px] font-mono tracking-wider uppercase">Render Style:</span>
            </div>
            <div className="flex items-center gap-1 bg-[#F7F7F5]/5 p-0.5 rounded border border-[#E0E0DE]/10" id="render-mode-controls">
              <button
                onClick={() => setRenderMode('textured')}
                className={`px-2 py-1 text-[9px] font-mono uppercase tracking-wider rounded-sm transition cursor-pointer ${
                  renderMode === 'textured' ? 'bg-[#F7F7F5] text-[#121212]' : 'text-[#888888] hover:text-[#F7F7F5]'
                }`}
                id="btn-mode-textured"
                title="Procedural Material Shaders"
              >
                Textured
              </button>
              <button
                onClick={() => setRenderMode('clay')}
                className={`px-2 py-1 text-[9px] font-mono uppercase tracking-wider rounded-sm transition cursor-pointer ${
                  renderMode === 'clay' ? 'bg-[#F7F7F5] text-[#121212]' : 'text-[#888888] hover:text-[#F7F7F5]'
                }`}
                id="btn-mode-clay"
                title="Plaster Clay Study"
              >
                Clay
              </button>
              <button
                onClick={() => setRenderMode('wireframe')}
                className={`px-2 py-1 text-[9px] font-mono uppercase tracking-wider rounded-sm transition cursor-pointer ${
                  renderMode === 'wireframe' ? 'bg-[#F7F7F5] text-[#121212]' : 'text-[#888888] hover:text-[#F7F7F5]'
                }`}
                id="btn-mode-wireframe"
                title="Technical Wireframe Blueprint"
              >
                Blueprint
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono transition-colors cursor-pointer border ${
                autoRotate 
                  ? 'bg-[#F7F7F5] text-[#121212] border-[#E0E0DE]' 
                  : 'bg-transparent text-[#888888] border-[#E0E0DE]/20 hover:text-[#F7F7F5]'
              }`}
              id="btn-toggle-rotation"
              title={autoRotate ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
            >
              {autoRotate ? <Pause size={12} /> : <Play size={12} />}
              <span>AUTO ROTATE</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono bg-transparent text-[#888888] border border-[#E0E0DE]/20 hover:text-[#F7F7F5] hover:border-[#E0E0DE] transition cursor-pointer"
              id="btn-reset-viewer"
              title="Reset Model State"
            >
              <RotateCcw size={12} />
              <span>RESET</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
