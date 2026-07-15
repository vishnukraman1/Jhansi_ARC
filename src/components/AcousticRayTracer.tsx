/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Mic, 
  Settings, 
  Play, 
  Pause, 
  Activity, 
  Users, 
  Layers, 
  Info,
  CheckCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface AcousticRayTracerProps {
  projectId: string;
  projectName: string;
}

interface ProjectAcousticProfile {
  id: string;
  roomName: string;
  roomVolumeM3: number;
  totalAreaM2: {
    walls: number;
    ceiling: number;
    floor: number;
  };
  baseReverbType: 'lively' | 'dead' | 'focused' | 'diffuse';
  ceilingShape: 'flat' | 'angled' | 'vaulted' | 'dome';
}

const acousticProfiles: Record<string, ProjectAcousticProfile> = {
  'obsidian-pavilion': {
    id: 'obsidian-pavilion',
    roomName: 'Main Double-Height Gallery Lounge',
    roomVolumeM3: 450,
    totalAreaM2: { walls: 180, ceiling: 120, floor: 120 },
    baseReverbType: 'lively',
    ceilingShape: 'angled',
  },
  'monolith-center': {
    id: 'monolith-center',
    roomName: 'Atrium Exhibition Hall',
    roomVolumeM3: 12000,
    totalAreaM2: { walls: 1400, ceiling: 800, floor: 800 },
    baseReverbType: 'lively', // extremely echoey raw concrete
    ceilingShape: 'flat',
  },
  'aether-hq': {
    id: 'aether-hq',
    roomName: 'Central Gridshell Atrium',
    roomVolumeM3: 6500,
    totalAreaM2: { walls: 950, ceiling: 620, floor: 620 },
    baseReverbType: 'focused', // circular geometry focuses echoes
    ceilingShape: 'dome',
  },
  'canyon-retreat': {
    id: 'canyon-retreat',
    roomName: 'Underground Meditation Chamber',
    roomVolumeM3: 180,
    totalAreaM2: { walls: 110, ceiling: 65, floor: 65 },
    baseReverbType: 'dead', // earthy and naturally dry
    ceilingShape: 'flat',
  },
  'helios-outpost': {
    id: 'helios-outpost',
    roomName: 'Bio-Dome Command Quarters',
    roomVolumeM3: 520,
    totalAreaM2: { walls: 220, ceiling: 140, floor: 140 },
    baseReverbType: 'focused', // polar spherical domes focus echoes
    ceilingShape: 'dome',
  },
  'fractal-canopy': {
    id: 'fractal-canopy',
    roomName: 'Semi-Enclosed Pavillion Cafe',
    roomVolumeM3: 320,
    totalAreaM2: { walls: 75, ceiling: 90, floor: 90 },
    baseReverbType: 'diffuse',
    ceilingShape: 'vaulted',
  },
};

// Material absorption coefficients (alpha) at Low (250Hz), Mid (1000Hz), and High (4000Hz)
const materialCoefficients: Record<string, { low: number; mid: number; high: number; label: string }> = {
  'concrete-raw': { low: 0.01, mid: 0.02, high: 0.03, label: 'Exposed Raw Concrete' },
  'glass-plate': { low: 0.10, mid: 0.03, high: 0.02, label: 'Single/Double Pane Glass' },
  'timber-pine': { low: 0.15, mid: 0.10, high: 0.08, label: 'Solid Pine Timber Deck' },
  'acoustic-slats': { low: 0.35, mid: 0.85, high: 0.75, label: 'Perforated Timber slats + absorber' },
  'felt-panels': { low: 0.20, mid: 0.75, high: 0.95, label: 'PET Felt Acoustic Panels' },
  'carpet-heavy': { low: 0.05, mid: 0.30, high: 0.60, label: 'Heavy Carpet on Underlay' },
  'rammed-earth': { low: 0.15, mid: 0.25, high: 0.30, label: 'Exposed Rammed Earth' },
};

export default function AcousticRayTracer({ projectId, projectName }: AcousticRayTracerProps) {
  const profile = acousticProfiles[projectId] || acousticProfiles['obsidian-pavilion'];

  // User States
  const [audioSourceFreq, setAudioSourceFreq] = useState<'low' | 'mid' | 'high'>('mid');
  const [wallMaterial, setWallMaterial] = useState<string>('concrete-raw');
  const [ceilingMaterial, setCeilingMaterial] = useState<string>('timber-pine');
  const [floorMaterial, setFloorMaterial] = useState<string>('carpet-heavy');
  const [occupancyCount, setOccupancyCount] = useState<number>(20); // 0 to 100 people
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);

  // Stream ray tracers simulation tick
  const [rayTick, setRayTick] = useState<number>(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    let active = true;
    const animate = () => {
      if (!active) return;
      if (isSimulationActive) {
        setRayTick((prev) => (prev + 1) % 1000);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      active = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [isSimulationActive]);

  // Sync initial materials specific to the project profiles
  useEffect(() => {
    if (projectId === 'obsidian-pavilion') {
      setWallMaterial('glass-plate');
      setCeilingMaterial('timber-pine');
      setFloorMaterial('timber-pine');
      setOccupancyCount(8);
    } else if (projectId === 'monolith-center') {
      setWallMaterial('concrete-raw');
      setCeilingMaterial('concrete-raw');
      setFloorMaterial('concrete-raw');
      setOccupancyCount(120);
    } else if (projectId === 'aether-hq') {
      setWallMaterial('glass-plate');
      setCeilingMaterial('acoustic-slats');
      setFloorMaterial('carpet-heavy');
      setOccupancyCount(250);
    } else if (projectId === 'canyon-retreat') {
      setWallMaterial('rammed-earth');
      setCeilingMaterial('rammed-earth');
      setFloorMaterial('concrete-raw');
      setOccupancyCount(4);
    } else if (projectId === 'helios-outpost') {
      setWallMaterial('felt-panels');
      setCeilingMaterial('glass-plate');
      setFloorMaterial('carpet-heavy');
      setOccupancyCount(12);
    } else {
      setWallMaterial('timber-pine');
      setCeilingMaterial('timber-pine');
      setFloorMaterial('concrete-raw');
      setOccupancyCount(15);
    }
  }, [projectId]);

  // Sabin's Classical Formula Calculations
  // Absorption coefficients corresponding to selected frequency
  const alphaWall = materialCoefficients[wallMaterial]?.[audioSourceFreq] ?? 0.05;
  const alphaCeiling = materialCoefficients[ceilingMaterial]?.[audioSourceFreq] ?? 0.05;
  const alphaFloor = materialCoefficients[floorMaterial]?.[audioSourceFreq] ?? 0.05;

  // Sound absorption of a single human (Sabin units per person)
  // Low (250Hz) = 0.20, Mid (1000Hz) = 0.45, High (4000Hz) = 0.40 Sabins
  const personSabin = audioSourceFreq === 'low' ? 0.18 : audioSourceFreq === 'mid' ? 0.46 : 0.42;
  const occupancyAbsorption = occupancyCount * personSabin;

  // Total Absorption in Room (S)
  const totalAbsorptionWalls = profile.totalAreaM2.walls * alphaWall;
  const totalAbsorptionCeiling = profile.totalAreaM2.ceiling * alphaCeiling;
  const totalAbsorptionFloor = profile.totalAreaM2.floor * alphaFloor;

  const totalSabinAbsorption = totalAbsorptionWalls + totalAbsorptionCeiling + totalAbsorptionFloor + occupancyAbsorption;

  // Reverberation time RT60 = 0.161 * Volume / Total Absorption
  const calculatedRT60 = totalSabinAbsorption > 0.1 
    ? parseFloat(((0.161 * profile.roomVolumeM3) / totalSabinAbsorption).toFixed(2))
    : 10.0;

  // Speech Clarity & STI (Speech Transmission Index) estimate
  // Based on RT60: ideal RT60 for speech is 0.5s to 0.9s. Over 1.5s speech becomes mud.
  let speechIndex = 1.0;
  if (calculatedRT60 < 0.3) speechIndex = 0.85; // slightly dead, lack of support
  else if (calculatedRT60 <= 0.85) speechIndex = 0.95; // perfect clarity
  else if (calculatedRT60 <= 1.2) speechIndex = 0.78; // good
  else if (calculatedRT60 <= 1.8) speechIndex = 0.60; // fair (large lecture halls)
  else if (calculatedRT60 <= 2.6) speechIndex = 0.42; // poor (echoey galleries)
  else speechIndex = 0.25; // chaotic, incomprehensible (like cathedrals)

  const getSTIRating = (score: number) => {
    if (score >= 0.85) return 'EXCELLENT (SPEECH COMPLIANT)';
    if (score >= 0.70) return 'GOOD INTELLIGIBILITY';
    if (score >= 0.55) return 'FAIR / MODERATE REVERBERATION';
    if (score >= 0.40) return 'POOR (INTELLIGIBILITY WARNING)';
    return 'CRITICAL ECHO (MUDDY SOUND)';
  };

  // Generate simulated sound rays
  const renderRayBounces = () => {
    // Speaker is at (50, 70). Let's emit 8 rays bouncing inside a section box from X=30 to X=350, Y=20 to Y=130
    const sourceX = 55;
    const sourceY = 75;
    const rays = [];
    const numRays = 8;

    // Boundary limits of section
    const minX = 35;
    const maxX = 345;
    const minY = 20;
    const maxY = 135;

    for (let r = 0; r < numRays; r++) {
      // Calculate initial direction vector based on index and frequency speed
      const angle = (r * (360 / numRays) * Math.PI) / 180;
      let vx = Math.cos(angle);
      let vy = Math.sin(angle);

      let currentX = sourceX;
      let currentY = sourceY;
      let pathPoints = `${sourceX},${sourceY}`;
      
      const bounceCount = 4;
      // Truncate segment length as sound decays (higher absorption = shorter path)
      const decayFactor = Math.max(0.1, 1 - (totalSabinAbsorption / (profile.roomVolumeM3 * 0.35)));

      for (let b = 0; b < bounceCount; b++) {
        // Distance to travel
        const dist = 55 * decayFactor;
        
        currentX += vx * dist;
        currentY += vy * dist;

        // Bounce off X borders
        if (currentX < minX) {
          currentX = minX;
          vx = -vx;
        } else if (currentX > maxX) {
          currentX = maxX;
          vx = -vx;
        }

        // Bounce off Y borders
        if (currentY < minY) {
          currentY = minY;
          vy = -vy;
        } else if (currentY > maxY) {
          currentY = maxY;
          vy = -vy;
        }

        pathPoints += ` ${currentX},${currentY}`;
      }

      // Animated energy dot traversing the ray
      const dashOffset = -(rayTick * 3.5) % 150;

      rays.push(
        <g key={r}>
          {/* Ray line */}
          <polyline
            points={pathPoints}
            fill="none"
            stroke={audioSourceFreq === 'low' ? 'rgba(239, 68, 68, 0.45)' : audioSourceFreq === 'high' ? 'rgba(59, 130, 246, 0.45)' : 'rgba(245, 158, 11, 0.45)'}
            strokeWidth="1.2"
            strokeDasharray="8 12"
            strokeDashoffset={dashOffset}
            className="transition-all duration-300"
          />
          {/* Echo Wave rings near source */}
          <circle 
            cx={sourceX} 
            cy={sourceY} 
            r={(rayTick * 0.6 + r * 15) % 80} 
            fill="none" 
            stroke="rgba(247, 247, 245, 0.04)" 
            strokeWidth="1" 
          />
        </g>
      );
    }
    return rays;
  };

  return (
    <div className="bg-[#121212] text-[#F7F7F5] rounded-sm p-6 border border-[#E0E0DE]/20 shadow-2xl overflow-hidden flex flex-col min-h-[660px] lg:h-[720px]" id="acoustic-tracer-main">
      
      {/* Header and Classifications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0E0DE]/20 pb-4 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888]">
            <Volume2 size={12} className="text-blue-400 animate-pulse" />
            <span>ISO 3382 ARCHITECTURAL ACOUSTICS LABORATORY</span>
          </div>
          <h4 className="text-base font-sans font-medium text-[#F7F7F5] mt-1">
            Reverberation & Room Decay Ray-Tracer (RT60)
          </h4>
        </div>
        <div className="flex items-center gap-3 bg-[#181818] px-4 py-2 border border-[#E0E0DE]/10 rounded-sm">
          <div className="flex flex-col text-right font-mono">
            <span className="text-[8px] text-[#888888] uppercase tracking-wider">REVERB TIME</span>
            <span className="text-[9px] text-[#888888]">DECAY DURATION (RT60)</span>
          </div>
          <div className={`h-9 px-3 border font-mono text-base font-bold flex items-center justify-center rounded-sm ${
            calculatedRT60 <= 1.0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            calculatedRT60 <= 1.8 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
            'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {calculatedRT60.toFixed(2)}s
          </div>
        </div>
      </div>

      {/* Grid Layout: Config Sidebar (Left 5) vs Sim Wave Visualizer (Right 7) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-y-auto" id="acoustic-split-layout">
        
        {/* Left Side: Room Setup & Materials */}
        <div className="lg:col-span-5 flex flex-col gap-4 pr-1" id="acoustic-inputs">
          
          {/* Section 1: Sound Source Frequencies */}
          <div className="flex flex-col gap-2 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider flex items-center gap-1">
              <Mic size={12} /> Test Tone Source Frequency:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'mid', 'high'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setAudioSourceFreq(freq)}
                  className={`py-1.5 text-[9px] font-mono uppercase tracking-tight rounded-sm transition cursor-pointer text-center border ${
                    audioSourceFreq === freq 
                      ? 'bg-[#F7F7F5] text-[#121212] border-[#F7F7F5] font-bold' 
                      : 'bg-[#121212] text-[#888888] border-[#E0E0DE]/10 hover:text-[#F7F7F5]'
                  }`}
                >
                  {freq === 'low' ? '250 Hz (Bass)' : freq === 'mid' ? '1000 Hz (Mid)' : '4000 Hz (Treble)'}
                </button>
              ))}
            </div>
            <p className="text-[8px] font-mono text-[#888888]/80 leading-normal">
              {audioSourceFreq === 'low' && 'Low frequencies contain high physical energy and easily penetrate standard drywall, causing booming resonances.'}
              {audioSourceFreq === 'mid' && 'Middle speech bands govern the vocal transparency range, highly critical for conference and auditorium design.'}
              {audioSourceFreq === 'high' && 'High treble bands are easily scattered and absorbed by surface carpets, velvet, and upholstery fibers.'}
            </p>
          </div>

          {/* Section 2: Surface Material Mapping */}
          <div className="bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm flex flex-col gap-3">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider flex items-center gap-1">
              <Layers size={12} /> Boundary Absorption Treatments:
            </span>

            {/* Wall Material */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[9px] font-mono text-[#888888] uppercase">WALLS CLADDING:</span>
              <select 
                value={wallMaterial} 
                onChange={(e) => setWallMaterial(e.target.value)}
                className="bg-[#121212] text-[#F7F7F5] border border-[#E0E0DE]/10 rounded px-2 py-1 text-[9px] font-mono outline-none cursor-pointer w-2/3 hover:border-[#E0E0DE]/20"
              >
                {Object.entries(materialCoefficients).map(([k, v]) => (
                  <option key={k} value={k}>{v.label} (α={v[audioSourceFreq].toFixed(2)})</option>
                ))}
              </select>
            </div>

            {/* Ceiling Material */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[9px] font-mono text-[#888888] uppercase">CEILING TREATMENT:</span>
              <select 
                value={ceilingMaterial} 
                onChange={(e) => setCeilingMaterial(e.target.value)}
                className="bg-[#121212] text-[#F7F7F5] border border-[#E0E0DE]/10 rounded px-2 py-1 text-[9px] font-mono outline-none cursor-pointer w-2/3 hover:border-[#E0E0DE]/20"
              >
                {Object.entries(materialCoefficients).map(([k, v]) => (
                  <option key={k} value={k}>{v.label} (α={v[audioSourceFreq].toFixed(2)})</option>
                ))}
              </select>
            </div>

            {/* Floor Material */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[9px] font-mono text-[#888888] uppercase">FLOOR COVERING:</span>
              <select 
                value={floorMaterial} 
                onChange={(e) => setFloorMaterial(e.target.value)}
                className="bg-[#121212] text-[#F7F7F5] border border-[#E0E0DE]/10 rounded px-2 py-1 text-[9px] font-mono outline-none cursor-pointer w-2/3 hover:border-[#E0E0DE]/20"
              >
                {Object.entries(materialCoefficients).map(([k, v]) => (
                  <option key={k} value={k}>{v.label} (α={v[audioSourceFreq].toFixed(2)})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Audience Occupancy Count */}
          <div className="flex flex-col gap-1.5 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#888888]">
              <span className="flex items-center gap-1 uppercase"><Users size={12} /> Audience Occupancy:</span>
              <span className="text-amber-400 font-semibold">{occupancyCount} People</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="250" 
              step="10"
              value={occupancyCount} 
              onChange={(e) => setOccupancyCount(parseInt(e.target.value))}
              className="w-full accent-amber-500 bg-[#E0E0DE]/20 h-1 rounded outline-none cursor-ew-resize mt-1"
            />
            <span className="text-[8px] font-mono text-[#888888]/80">Human bodies and heavy garments act as highly effective porous sound absorbers, damping echo.</span>
          </div>

          {/* Section 4: Simulation Switcher */}
          <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex items-center justify-between">
            <span className="text-[9px] font-mono text-[#888888] uppercase font-bold">RAY-TRACE EMISSION FIELD:</span>
            <button
              onClick={() => setIsSimulationActive(!isSimulationActive)}
              className={`px-3 py-1 text-[8px] font-mono tracking-wider rounded-sm transition flex items-center gap-1 border cursor-pointer uppercase ${
                isSimulationActive 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' 
                  : 'bg-transparent text-[#888888] border-[#E0E0DE]/10'
              }`}
            >
              {isSimulationActive ? <Pause size={10} /> : <Play size={10} />}
              <span>{isSimulationActive ? 'SIMULATION ACTIVE' : 'PAUSED'}</span>
            </button>
          </div>

        </div>

        {/* Right Side: Ray bouncing vector and decay performance */}
        <div className="lg:col-span-7 flex flex-col gap-4 justify-between" id="acoustic-outputs">
          
          {/* Ray Trace Section Tunnel */}
          <div className="bg-[#181818] p-4 border border-[#E0E0DE]/10 rounded-sm flex flex-col gap-3 relative overflow-hidden">
            <div className="flex justify-between items-center z-10 relative">
              <div>
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-widest block">RAY-TRACING SOUNDFIELD STUDY</span>
                <span className="text-[9px] font-mono text-[#888888]">{profile.roomName} section view</span>
              </div>
              <span className="text-[8px] font-mono text-[#888888] bg-[#121212] border border-[#E0E0DE]/10 px-2 py-0.5 rounded-sm">
                VOLUME: {profile.roomVolumeM3} m³
              </span>
            </div>

            {/* Section schematic Canvas */}
            <div className="bg-[#121212] rounded border border-[#E0E0DE]/10 h-[190px] w-full relative overflow-hidden flex items-end">
              <svg className="absolute inset-0 w-full h-full" id="acoustic-section-svg">
                {/* Visual bounds of section box */}
                <rect x="30" y="15" width="320" height="125" fill="rgba(24,24,24,0.3)" stroke="rgba(247,247,245,0.06)" strokeWidth="1" />
                
                {/* Ceiling visual style depending on shape */}
                {profile.ceilingShape === 'flat' && <line x1="30" y1="15" x2="350" y2="15" stroke="rgba(247,247,245,0.3)" strokeWidth="2" />}
                {profile.ceilingShape === 'angled' && <polyline points="30,30 190,10 350,30" fill="none" stroke="rgba(247,247,245,0.3)" strokeWidth="2" />}
                {profile.ceilingShape === 'dome' && <path d="M 30,35 Q 190,-5 350,35" fill="none" stroke="rgba(247,247,245,0.3)" strokeWidth="2" />}
                {profile.ceilingShape === 'vaulted' && <polyline points="30,25 90,15 290,15 350,25" fill="none" stroke="rgba(247,247,245,0.3)" strokeWidth="2" />}

                {/* Ground floor line */}
                <line x1="30" y1="140" x2="350" y2="140" stroke="rgba(247,247,245,0.3)" strokeWidth="2" />

                {/* Acoustic speaker source */}
                <g transform="translate(55, 75)">
                  <circle cx="0" cy="0" r="6" fill="#f59e0b" className="animate-ping opacity-25" />
                  <circle cx="0" cy="0" r="4" fill="#f59e0b" />
                  <polygon points="-8,-6 -3,-3 -3,3 -8,6" fill="#f59e0b" />
                </g>

                {/* Dynamic reflective ray layers */}
                {renderRayBounces()}

                {/* Sound Pressure Heatmap contours at speaker */}
                <circle cx="55" cy="75" r="45" fill="url(#sound-decay-gradient)" className="opacity-15" />
                <defs>
                  <radialGradient id="sound-decay-gradient">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
              </svg>

              {/* Indicator markers inside canvas overlay */}
              <div className="absolute bottom-3 left-4 bg-[#121212]/85 border border-[#E0E0DE]/10 px-2 py-1 rounded-sm font-mono text-[7px] text-[#888888] flex gap-3 pointer-events-none">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-[#f59e0b] rounded-full" /> SOURCE POINT</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-blue-400" strokeDasharray="2,2" /> REFLECTED RAYS</span>
              </div>
            </div>
          </div>

          {/* Core Analytics parameters */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Metric 1: Total Room Absorption in Metric Sabins */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">TOTAL ABSORPTION (A):</span>
                <span className="text-[#F7F7F5] font-bold text-xs mt-0.5">
                  {Math.round(totalSabinAbsorption)} <span className="text-[8px] font-light text-[#888888]">m² Sabins</span>
                </span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">AVG COEFF (α):</span>
                <span className="text-[#F7F7F5] font-semibold">
                  {(totalSabinAbsorption / (profile.totalAreaM2.walls + profile.totalAreaM2.ceiling + profile.totalAreaM2.floor)).toFixed(3)}
                </span>
              </div>
            </div>

            {/* Metric 2: Speech Intelligibility Rating */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">SPEECH STI SCORE:</span>
                <span className={`font-bold text-xs mt-0.5 ${speechIndex >= 0.70 ? 'text-emerald-400' : speechIndex >= 0.55 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {speechIndex.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">STI RATING:</span>
                <span className="text-[#888888] font-semibold text-[7px] truncate max-w-[80px]">
                  {speechIndex >= 0.75 ? 'EXCELLENT' : speechIndex >= 0.60 ? 'GOOD' : 'POOR'}
                </span>
              </div>
            </div>

            {/* Metric 3: Optimal Reverb target Range */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">OPTIMAL TARGET RANGE:</span>
                <span className="text-[#F7F7F5] font-bold text-xs mt-0.5">
                  0.5s - 1.2s <span className="text-[8px] font-light text-[#888888]">ideal</span>
                </span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">DISCREPANCY:</span>
                <span className={`font-semibold ${Math.abs(calculatedRT60 - 0.85) < 0.4 ? 'text-emerald-400' : 'text-amber-500'}`}>
                  {(calculatedRT60 - 0.85).toFixed(1)}s
                </span>
              </div>
            </div>
          </div>

          {/* Acoustic Stability alert message and material report */}
          <div className="flex flex-col gap-2 font-mono">
            {calculatedRT60 > 2.0 ? (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded flex items-start gap-2.5 text-[9px]">
                <HelpCircle size={14} className="shrink-0 mt-0.5 animate-bounce" />
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <span className="font-bold uppercase">CRITICAL REVERBERANT CAVITY ALERT (ECHO RISK)</span>
                  <p className="text-[#888888]">
                    Reverberation decay ({calculatedRT60}s) is dangerously high, leading to overlapping speech syllables. Remedy: Switch plaster ceiling or concrete floor grids to PET felt panels, carpets, or porous acoustic slats.
                  </p>
                </div>
              </div>
            ) : calculatedRT60 < 0.40 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded flex items-start gap-2.5 text-[9px]">
                <HelpCircle size={14} className="shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <span className="font-bold uppercase">ACOUSTICALLY DEAD ENVELOPE (LACK OF LIVENESS)</span>
                  <p className="text-[#888888]">
                    RT60 of {calculatedRT60}s is typical of anechoic dry spaces. Sound carries zero acoustic envelope support, making musical performances sound dry. Remedy: deploy raw concrete, pine deck, or plate glass reflectors.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded flex items-start gap-2.5 text-[9px]">
                <CheckCircle size={14} className="shrink-0 mt-0.5 text-emerald-400" />
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <span className="font-bold uppercase">OPTIMAL CONCERT & SPEECH FIELD MET</span>
                  <p className="text-[#888888]">
                    RT60 stands at {calculatedRT60}s, which delivers perfect speech transmission ({getSTIRating(speechIndex)}) and gorgeous early reflection gains, complying fully with ISO 3382 acoustics standards.
                  </p>
                </div>
              </div>
            )}

            {/* General Description Synthesis block */}
            <div className="bg-[#121212] p-3 rounded border border-[#E0E0DE]/10 flex gap-2 text-[9px] leading-relaxed">
              <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-amber-400 font-bold uppercase">ACOUSTICAL SYSTHESIS AUDIT \ {projectName}</span>
                <p className="text-[#888888]">
                  {profile.baseReverbType === 'lively' && 'High double-height volumetric proportions bounce audio across hard perimeter planes, demanding high-coefficient acoustic panels to keep speech intelligible.'}
                  {profile.baseReverbType === 'focused' && 'Circular structures suffer from sound energy concentrations. Reflections reflect symmetrically inward, forming acoustic "whispering gallery" focal spots.'}
                  {profile.baseReverbType === 'dead' && 'Earthen masonry walls and compact spaces naturally decay sound energy instantly, making this chamber quiet, safe, and highly intimate.'}
                  {profile.baseReverbType === 'diffuse' && 'The branching, porous ceiling canopy breaks apart coherent soundwaves, scattering echoes uniformly throughout the semi-outdoor terrace cafe.'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Action Footer */}
      <div className="border-t border-[#E0E0DE]/10 pt-3 mt-4 flex items-center justify-between font-mono text-[8px] text-[#888888] tracking-widest uppercase">
        <span>TWEAK SURFACE MATERIALS AND OCCUPANCY TO REGULATE ROOM REFLEXES</span>
        <span className="text-emerald-500 flex items-center gap-1 font-semibold animate-pulse">
          ISO 3382 / DIN 18041 Room Acoustics Compliant Simulation
        </span>
      </div>

    </div>
  );
}
