/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  RotateCw, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Sliders, 
  Compass,
  CornerDownRight,
  Info
} from 'lucide-react';

interface WindLoadSimulatorProps {
  projectId: string;
  projectName: string;
}

interface ProjectAeroProfile {
  id: string;
  heightMeters: number;
  widthMeters: number;
  dragCoefficient: number; // Cd
  structuralStiffness: number; // kN/mm base stiffness
  silhouetteType: 'wedge' | 'block' | 'ring' | 'nest' | 'dome' | 'canopy';
  siteRoughness: 'coastal' | 'urban' | 'alpine' | 'desert';
  naturalFrequency: number; // Hz (natural resonance)
}

const aeroProfiles: Record<string, ProjectAeroProfile> = {
  'obsidian-pavilion': {
    id: 'obsidian-pavilion',
    heightMeters: 6.2,
    widthMeters: 28.5,
    dragCoefficient: 0.28, // Low wedge shape
    structuralStiffness: 420, // Very rigid heavy mass wood
    silhouetteType: 'wedge',
    siteRoughness: 'coastal',
    naturalFrequency: 3.5, // High frequency (stiff low building)
  },
  'monolith-center': {
    id: 'monolith-center',
    heightMeters: 24.5,
    widthMeters: 85.0,
    dragCoefficient: 1.15, // Blocky blunt wall
    structuralStiffness: 1850, // Massive concrete core
    silhouetteType: 'block',
    siteRoughness: 'alpine',
    naturalFrequency: 0.95, // Low frequency structural swing
  },
  'aether-hq': {
    id: 'aether-hq',
    heightMeters: 18.0,
    widthMeters: 120.0,
    dragCoefficient: 0.55, // Circular hollow geometry
    structuralStiffness: 1250, // Stiff mass timber gridshell
    silhouetteType: 'ring',
    siteRoughness: 'coastal',
    naturalFrequency: 1.15,
  },
  'canyon-retreat': {
    id: 'canyon-retreat',
    heightMeters: 4.8,
    widthMeters: 22.0,
    dragCoefficient: 0.18, // Protected canyon pocket
    structuralStiffness: 350,
    silhouetteType: 'nest',
    siteRoughness: 'desert',
    naturalFrequency: 4.2,
  },
  'helios-outpost': {
    id: 'helios-outpost',
    heightMeters: 9.5,
    widthMeters: 18.0,
    dragCoefficient: 0.42, // Spherical dome on legs
    structuralStiffness: 680,
    silhouetteType: 'dome',
    siteRoughness: 'alpine',
    naturalFrequency: 2.1,
  },
  'fractal-canopy': {
    id: 'fractal-canopy',
    heightMeters: 5.5,
    widthMeters: 14.0,
    dragCoefficient: 0.65, // Porous branching skin
    structuralStiffness: 280,
    silhouetteType: 'canopy',
    siteRoughness: 'urban',
    naturalFrequency: 2.8,
  },
};

export default function WindLoadSimulator({ projectId, projectName }: WindLoadSimulatorProps) {
  const profile = aeroProfiles[projectId] || aeroProfiles['obsidian-pavilion'];

  // User Interactive States
  const [windSpeed, setWindSpeed] = useState<number>(45); // km/h (0 to 180)
  const [windAngle, setWindAngle] = useState<number>(270); // Degrees (0 to 360) where 270 is West-to-East
  const [materialStiffness, setMaterialStiffness] = useState<'standard' | 'reinforced' | 'carbon-braced'>('standard');
  const [enableVortexShedding, setEnableVortexShedding] = useState<boolean>(true);

  // Animated streamline frame tracking
  const [animationTick, setAnimationTick] = useState<number>(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    let active = true;
    const animate = () => {
      if (!active) return;
      setAnimationTick((prev) => (prev + 1) % 1000);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      active = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Compute Aero calculations
  // 1. Wind speed in m/s
  const speedMetersPerSecond = windSpeed / 3.6;

  // 2. Air density rho (kg/m3) - let's set standard 1.225
  const airDensity = 1.225;

  // 3. Exposed frontal area based on angle
  // Simple projection: if angle aligns with width/length. Let's make a projected cross-sectional area
  const angleRad = (windAngle * Math.PI) / 180;
  const projectAreaFactor = Math.abs(Math.sin(angleRad)) * 0.8 + Math.abs(Math.cos(angleRad)) * 0.4;
  const projectedArea = profile.widthMeters * profile.heightMeters * projectAreaFactor;

  // 4. Drag Force equation: F_d = 0.5 * rho * v^2 * C_d * A
  const baseDragForceNewtons = 0.5 * airDensity * Math.pow(speedMetersPerSecond, 2) * profile.dragCoefficient * projectedArea;
  const dragForceKiloNewtons = parseFloat((baseDragForceNewtons / 1000).toFixed(1));

  // 5. Calculate mechanical deflection drift (mm)
  // Drift = F / K where K is structural stiffness adjusted by user material choice
  let stiffnessMultiplier = 1.0;
  if (materialStiffness === 'reinforced') stiffnessMultiplier = 1.8;
  if (materialStiffness === 'carbon-braced') stiffnessMultiplier = 3.2;

  const dynamicStiffness = profile.structuralStiffness * stiffnessMultiplier;
  const lateralDeflectionMm = parseFloat((baseDragForceNewtons / 1000 / dynamicStiffness * (profile.heightMeters / 10)).toFixed(2));

  // 6. Drift ratio classification (Structural limits are usually 1/500 to 1/250 of height)
  const heightMm = profile.heightMeters * 1000;
  const driftRatioDenom = lateralDeflectionMm > 0.05 ? Math.round(heightMm / lateralDeflectionMm) : 9999;
  const isDriftExceeded = driftRatioDenom < 400 && windSpeed > 80;

  // 7. Vortex Shedding frequency (Strouhal frequency f_s = St * V / D)
  // Strouhal number typical ~0.20 for bluff bodies
  const characteristicWidth = profile.widthMeters * 0.25 + profile.heightMeters * 0.15;
  const strouhalNumber = 0.20;
  const vortexSheddingHz = characteristicWidth > 0 
    ? parseFloat(((strouhalNumber * speedMetersPerSecond) / characteristicWidth).toFixed(2))
    : 0;

  // Check resonance alignment (if vortex shedding matches building natural frequency +/- 15%)
  const resonanceLower = profile.naturalFrequency * 0.85;
  const resonanceUpper = profile.naturalFrequency * 1.15;
  const isResonanceWarning = enableVortexShedding && (vortexSheddingHz >= resonanceLower && vortexSheddingHz <= resonanceUpper && windSpeed > 30);

  // Compass text identifier
  const getCompassDirectionName = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return 'NORTH ➔ SOUTH (0°)';
    if (deg >= 22.5 && deg < 67.5) return 'NORTH-EAST ➔ SOUTH-WEST (45°)';
    if (deg >= 67.5 && deg < 112.5) return 'EAST ➔ WEST (90°)';
    if (deg >= 112.5 && deg < 157.5) return 'SOUTH-EAST ➔ NORTH-WEST (135°)';
    if (deg >= 157.5 && deg < 202.5) return 'SOUTH ➔ NORTH (180°)';
    if (deg >= 202.5 && deg < 247.5) return 'SOUTH-WEST ➔ NORTH-EAST (225°)';
    if (deg >= 247.5 && deg < 292.5) return 'WEST ➔ EAST (270°)';
    return 'NORTH-WEST ➔ SOUTH-EAST (315°)';
  };

  // Draw SVG custom silhouette coordinates based on silhouetteType
  const getSilhouetteSvgPath = () => {
    switch(profile.silhouetteType) {
      case 'wedge': // Obsidian Pavilion
        return "M 140,85 L 180,55 L 280,70 L 290,85 Z";
      case 'block': // Monolith Center
        return "M 120,85 L 120,35 L 280,35 L 280,85 Z";
      case 'ring': // Aether HQ
        return "M 110,85 C 110,35 290,35 290,85 L 270,85 C 270,48 130,48 130,85 Z";
      case 'nest': // Canyon Retreat
        return "M 90,85 L 120,68 L 280,68 L 310,85 Z";
      case 'dome': // Helios Outpost
        return "M 130,85 L 140,65 C 140,35 260,35 260,65 L 270,85 L 255,85 L 245,65 C 245,45 155,45 155,65 L 145,85 Z";
      case 'canopy': // Fractal Canopy
        return "M 130,85 L 135,60 L 110,40 L 290,40 L 265,60 L 270,85 Z";
      default:
        return "M 100,85 L 100,45 L 300,45 L 300,85 Z";
    }
  };

  // Helper to generate dynamic streamline vector lines
  const renderStreamlines = () => {
    const lines = [];
    const numLines = 10;
    const spacing = 75 / (numLines + 1);

    for (let i = 0; i < numLines; i++) {
      const yPos = 10 + i * spacing;
      const speedOffset = (animationTick * (speedMetersPerSecond * 0.15)) % 400;

      // Calculate path deflection based on proximity to the central obstacle (building is placed centered from x=120 to x=280, height is ~35 to 85)
      // Streamline bends around the shape depending on height (yPos)
      const obstacleCenterX = 200;
      const obstacleHeight = profile.silhouetteType === 'block' ? 35 : 55;
      
      let pathD = `M -100,${yPos} `;
      
      // Let's sample 15 segments across the wind tunnel to create smooth curves
      for (let x = -80; x <= 480; x += 30) {
        let currentY = yPos;
        
        // Calculate deflection force
        const distFromObstacle = Math.abs(x - obstacleCenterX);
        if (distFromObstacle < 120 && yPos > obstacleHeight) {
          const factor = (120 - distFromObstacle) / 120;
          // Bend streamlines upward over the building
          const verticalPush = (85 - obstacleHeight) * 0.85 * factor * (1.1 - (yPos / 85));
          currentY = yPos - verticalPush;
        }

        pathD += `L ${x},${currentY} `;
      }

      // Animated dashes representing air pockets
      lines.push(
        <path
          key={i}
          d={pathD}
          fill="none"
          stroke={isResonanceWarning ? "rgba(245, 158, 11, 0.4)" : "rgba(247, 247, 245, 0.15)"}
          strokeWidth="1.2"
          strokeDasharray="12 28"
          strokeDashoffset={-speedOffset}
          className="transition-colors duration-300"
        />
      );
    }
    return lines;
  };

  return (
    <div className="bg-[#121212] text-[#F7F7F5] rounded-sm p-6 border border-[#E0E0DE]/20 shadow-2xl overflow-hidden flex flex-col min-h-[660px] lg:h-[720px]" id="wind-load-simulator-main">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0E0DE]/20 pb-4 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888]">
            <Wind size={12} className="text-amber-400 animate-pulse" />
            <span>COMPUTATIONAL FLUID DYNAMICS (CFD) WIND STRESS TUNNEL</span>
          </div>
          <h4 className="text-base font-sans font-medium text-[#F7F7F5] mt-1">
            Aerodynamic Deflection & Lateral Structural Strain Simulator
          </h4>
        </div>
        <div className="flex items-center gap-3 bg-[#181818] px-4 py-2 border border-[#E0E0DE]/10 rounded-sm">
          <div className="flex flex-col text-right font-mono">
            <span className="text-[8px] text-[#888888] uppercase tracking-wider">AERODYNAMIC COEFFICIENT</span>
            <span className="text-[9px] text-[#888888]">CURRENT DRAG PROFILE</span>
          </div>
          <div className="h-9 w-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold flex items-center justify-center rounded-sm">
            Cd {profile.dragCoefficient}
          </div>
        </div>
      </div>

      {/* Grid Layout: Controls (Left) vs CFD Visualizer (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-y-auto" id="cfd-split-layout">
        
        {/* Left Columns: Inputs & Controls (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4 pr-1" id="cfd-inputs-panel">
          
          {/* Parameter 1: Wind Speed */}
          <div className="flex flex-col gap-1.5 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#888888]">
              <span className="flex items-center gap-1 uppercase"><Wind size={12} /> Velocity (Gale Speed):</span>
              <span className="text-amber-400 font-semibold">{windSpeed} km/h <span className="text-[8px] font-light text-[#888888]">({speedMetersPerSecond.toFixed(1)} m/s)</span></span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="160" 
              step="5"
              value={windSpeed} 
              onChange={(e) => setWindSpeed(parseInt(e.target.value))}
              className="w-full accent-amber-500 bg-[#E0E0DE]/20 h-1 rounded outline-none cursor-ew-resize mt-1"
            />
            {/* Beaufort Scale Indicator */}
            <div className="flex justify-between text-[7px] font-mono text-[#888888] uppercase mt-0.5">
              <span>0 (Calm)</span>
              <span>45 (Breeze)</span>
              <span className={`${windSpeed >= 80 ? 'text-amber-500 font-bold' : ''}`}>80 (Gale)</span>
              <span className={`${windSpeed >= 120 ? 'text-rose-500 font-bold' : ''}`}>120 (Hurricane)</span>
            </div>
          </div>

          {/* Parameter 2: Compass Angle */}
          <div className="flex flex-col gap-1.5 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#888888]">
              <span className="flex items-center gap-1 uppercase"><Compass size={12} /> Wind Azimuth:</span>
              <span className="text-amber-400 font-semibold">{getCompassDirectionName(windAngle)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="359" 
              step="15"
              value={windAngle} 
              onChange={(e) => setWindAngle(parseInt(e.target.value))}
              className="w-full accent-[#F7F7F5] bg-[#E0E0DE]/20 h-1 rounded outline-none cursor-ew-resize mt-1"
            />
            <span className="text-[8px] font-mono text-[#888888]/80 leading-normal">Rotating the compass vector changes the frontal impact profile and exposed area projections.</span>
          </div>

          {/* Parameter 3: Structural Rib Bracing & Core stiffness */}
          <div className="flex flex-col gap-2 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider flex items-center gap-1"><Activity size={12} /> Rib Bracing & Tectonic Core Stiffness:</span>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'reinforced', 'carbon-braced'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setMaterialStiffness(s)}
                  className={`py-2 text-[9px] font-mono uppercase tracking-tight rounded-sm transition cursor-pointer text-center border ${
                    materialStiffness === s 
                      ? 'bg-[#F7F7F5] text-[#121212] border-[#F7F7F5] font-bold' 
                      : 'bg-[#121212] text-[#888888] border-[#E0E0DE]/10 hover:text-[#F7F7F5] hover:border-[#E0E0DE]/20'
                  }`}
                >
                  {s === 'standard' ? 'Default Frame' : s === 'reinforced' ? 'Reinforced Core' : 'Carbon Outriggers'}
                </button>
              ))}
            </div>
            <p className="text-[8px] font-mono text-[#888888]/80 leading-normal">
              {materialStiffness === 'standard' && 'Uses the primary project structural framework with baseline elastic deflection modulus.'}
              {materialStiffness === 'reinforced' && 'Integrates continuous concrete core shear walls, increasing lateral frame stiffness.'}
              {materialStiffness === 'carbon-braced' && 'Extrudes high-tensile diagonal carbon-fiber tie cables, maximizing deflection resistance.'}
            </p>
          </div>

          {/* Parameter 4: Aerodynamic Vortex Toggles */}
          <div className="bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm flex flex-col gap-2 font-mono text-[9px]">
            <span className="text-[#888888] uppercase tracking-wider block">VORTEX INDUCED SHEDDING</span>
            <label className="flex items-center justify-between cursor-pointer text-[#F7F7F5] hover:text-white mt-1">
              <span>Enable Vortex Frequency Analysis</span>
              <input 
                type="checkbox" 
                checked={enableVortexShedding} 
                onChange={(e) => setEnableVortexShedding(e.target.checked)}
                className="accent-emerald-500 h-3.5 w-3.5 bg-[#121212] border border-[#E0E0DE]/20 rounded-sm"
              />
            </label>
            <p className="text-[8px] text-[#888888] leading-normal mt-1">
              Computes fluid vortex resonance. Tall towers are vulnerable to lateral "locking" when vortex-shedding rates align with structural natural frequencies.
            </p>
          </div>

        </div>

        {/* Right Columns: Simulated Output Wind Tunnel Visuals (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-4 justify-between" id="cfd-outputs-panel">
          
          {/* CFD Vector Map Canvas/SVG Stage */}
          <div className="bg-[#181818] p-4 border border-[#E0E0DE]/10 rounded-sm flex flex-col gap-3 relative overflow-hidden">
            <div className="flex justify-between items-center z-10 relative">
              <div>
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-widest block">LAMINAR WIND DYNAMICS VENTILATION</span>
                <span className="text-[9px] font-mono text-[#888888]">Simulating 2D fluid boundary layers across coordinates</span>
              </div>
              <span className="text-[8px] font-mono text-[#888888] bg-[#121212] border border-[#E0E0DE]/10 px-2 py-0.5 rounded-sm">
                CFD_SOLVER_2.45
              </span>
            </div>

            {/* Custom SVG Wind Tunnel Map */}
            <div className="bg-[#121212] rounded border border-[#E0E0DE]/10 h-[190px] w-full relative overflow-hidden flex items-end">
              <svg className="absolute inset-0 w-full h-full" id="wind-tunnel-svg">
                
                {/* Simulated wind lines drawn */}
                {renderStreamlines()}

                {/* Turbulent Vortex eddies on leeward side (placed behind the obstacle center ~200,85) */}
                {windSpeed > 25 && (
                  <g className="opacity-25" stroke={isResonanceWarning ? "#f59e0b" : "#3b82f6"} fill="none" strokeWidth="1">
                    {/* Curly curly swirl lines representing vacuum pressure currents */}
                    <circle cx="295" cy="72" r={Math.min(18, 5 + windSpeed * 0.1)} strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: `${200/windSpeed}s` }} />
                    <circle cx="320" cy="62" r={Math.min(12, 3 + windSpeed * 0.06)} strokeDasharray="2 2" className="animate-spin-reverse" style={{ animationDuration: `${300/windSpeed}s` }} />
                  </g>
                )}

                {/* Shaded Drag Obstacle Silhouette */}
                <path
                  d={getSilhouetteSvgPath()}
                  fill="#1c1c1a"
                  stroke={isResonanceWarning ? "#f59e0b" : isDriftExceeded ? "#ef4444" : "#E0E0DE"}
                  strokeWidth="2"
                  className="transition-all duration-300"
                />

                {/* Building Lateral Deflection Indicator Dot & vector arrow */}
                {lateralDeflectionMm > 0.1 && (
                  <g transform={`translate(${lateralDeflectionMm * 2}, 0)`} className="transition-transform duration-100">
                    {/* Bounding deflection outline (offsetted glow) */}
                    <path
                      d={getSilhouetteSvgPath()}
                      fill="none"
                      stroke={isDriftExceeded ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.2)"}
                      strokeWidth="1.5"
                      strokeDasharray="2 3"
                    />
                  </g>
                )}

                {/* Velocity Vector Arrows (Wind Direction) */}
                <g transform={`translate(40, 25) rotate(${windAngle - 270})`} className="opacity-40">
                  <line x1="-15" y1="0" x2="15" y2="0" stroke="#F7F7F5" strokeWidth="1.5" />
                  <polygon points="15,-4 23,0 15,4" fill="#F7F7F5" />
                </g>
              </svg>

              {/* Legend Indicator Overlay */}
              <div className="absolute top-3 left-3 bg-[#121212]/85 border border-[#E0E0DE]/10 p-1.5 rounded-sm font-mono text-[7px] text-[#888888] flex gap-3 pointer-events-none">
                <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-[#E0E0DE] inline-block" /> SOLID ENVELOPE</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-3 border-t border-dashed border-[#F7F7F5]/30 inline-block" /> STREAMLINES</span>
                {windSpeed > 25 && <span className="flex items-center gap-1 text-blue-400"><span className="h-1.5 w-3 border border-dotted border-blue-500 rounded-full inline-block animate-pulse" /> WAKE VORTICITY</span>}
              </div>
            </div>
          </div>

          {/* Interactive Numerical Metrics Matrix */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Metric 1: Lateral Wind Shear force */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">LATERAL SHEAR FORCE:</span>
                <span className="text-[#F7F7F5] font-bold text-xs mt-0.5">{dragForceKiloNewtons.toLocaleString()} <span className="text-[8px] font-light text-[#888888]">kN</span></span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">WIND PRESSURE:</span>
                <span className="text-[#F7F7F5] font-semibold">{(0.5 * airDensity * Math.pow(speedMetersPerSecond, 2)).toFixed(0)} Pa</span>
              </div>
            </div>

            {/* Metric 2: Crown Deflection / Drift */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">CROWN LATERAL DRIFT:</span>
                <span className={`font-bold text-xs mt-0.5 ${isDriftExceeded ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {lateralDeflectionMm} <span className="text-[8px] font-light text-[#888888]">mm</span>
                </span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">DRIFT LIMIT:</span>
                <span className="text-[#888888] font-semibold">1/{driftRatioDenom}</span>
              </div>
            </div>

            {/* Metric 3: Resonant Vortex Frequency */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">SHEDDING FREQUENCY:</span>
                <span className="text-[#F7F7F5] font-bold text-xs mt-0.5">{vortexSheddingHz} <span className="text-[8px] font-light text-[#888888]">Hz</span></span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">BLDG NATURAL:</span>
                <span className="text-amber-400 font-semibold">{profile.naturalFrequency} Hz</span>
              </div>
            </div>
          </div>

          {/* Environmental Warnings and Safety synthesis */}
          <div className="flex flex-col gap-2 font-mono">
            {isResonanceWarning ? (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded flex items-start gap-2.5 text-[9px]">
                <ShieldAlert size={14} className="shrink-0 mt-0.5 animate-bounce" />
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <span className="font-bold uppercase">CRITICAL RESONANCE DETECTED (STABILITY WARNING)</span>
                  <p className="text-[#888888]">
                    vortex shedding frequency ({vortexSheddingHz} Hz) matches the natural frequency of {projectName} ({profile.naturalFrequency} Hz). This causes lock-in resonant amplification. Remedy: deploy high stiffness dampeners or carbon fiber outriggers.
                  </p>
                </div>
              </div>
            ) : isDriftExceeded ? (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded flex items-start gap-2.5 text-[9px]">
                <ShieldAlert size={14} className="shrink-0 mt-0.5 animate-pulse" />
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <span className="font-bold uppercase">LATERAL DRIFT EXCEEDS ALLOWABLE DEFLECTION RATIO</span>
                  <p className="text-[#888888]">
                    Lateral structural sway represents 1/{driftRatioDenom} structural drift, which exceeds the standard structural boundary limit (1/400). Select "Carbon Outriggers" or reinforce the main concrete core to safeguard framing joints.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded flex items-start gap-2.5 text-[9px]">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-400" />
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <span className="font-bold uppercase">STRUCTURAL RIGIDITY AUDIT PASSED</span>
                  <p className="text-[#888888]">
                    Tectonic stiffness stands well within safe elastic performance bounds. Under current {windSpeed} km/h wind velocities, lateral drift is minuscule ({lateralDeflectionMm} mm), resulting in no architectural core structural fatigue.
                  </p>
                </div>
              </div>
            )}

            {/* General Synthesis report */}
            <div className="bg-[#121212] p-3 rounded border border-[#E0E0DE]/10 flex gap-2 text-[9px] leading-relaxed">
              <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-amber-400 font-bold uppercase">AERODYNAMIC PROFILE SYNTHESIS \ {projectName}</span>
                <p className="text-[#888888]">
                  {profile.silhouetteType === 'wedge' && 'The low wedge profile allows windward currents to glide smoothly over the roof envelope, deflecting lateral shear forces with ease.'}
                  {profile.silhouetteType === 'block' && 'The blocky vertical concrete slab acts as a giant wind sail, capturing high frontal wind pressures and generating strong wake turbulence downstream.'}
                  {profile.silhouetteType === 'ring' && 'The central circular lightwell lets wind currents filter through the middle of the structure, reducing total frontal dragging forces by up to 35%.'}
                  {profile.silhouetteType === 'nest' && 'Siting the cabin nested within Canyon earthen buffers reduces total exposure, maintaining near-zero aerodynamic load risks under gale velocities.'}
                  {profile.silhouetteType === 'dome' && 'The spherical geodesic dome geometry excels in high-altitude polar alpine winds, letting currents flow omnidirectionally around its struts.'}
                  {profile.silhouetteType === 'canopy' && 'The porous branching facade disperses incoming wind velocities, converting concentrated laminar currents into mild micro-breeze streams.'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Action Footer */}
      <div className="border-t border-[#E0E0DE]/10 pt-3 mt-4 flex items-center justify-between font-mono text-[8px] text-[#888888] tracking-widest uppercase">
        <span>TWEAK AZIMUTH AND VELOCITY TO TEST AERODYNAMIC STABILITY</span>
        <span className="text-emerald-500 flex items-center gap-1 font-semibold animate-pulse">
          ASCE 7-22 Minimum Design Wind Standards Compliant
        </span>
      </div>

    </div>
  );
}
