/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Clock, 
  Calendar, 
  Compass, 
  Eye, 
  Activity, 
  Sliders, 
  CornerDownRight, 
  Info,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  CloudSun
} from 'lucide-react';

interface SolarShadowSimulatorProps {
  projectId: string;
  projectName: string;
}

interface ProjectSolarProfile {
  id: string;
  latitude: number; // Degrees
  locationName: string;
  facadeOrientation: 'South' | 'North' | 'East' | 'West';
  windowHeightMeters: number;
  baseOverhangMeters: number;
}

const solarProfiles: Record<string, ProjectSolarProfile> = {
  'obsidian-pavilion': {
    id: 'obsidian-pavilion',
    latitude: 60.39, // Bergen, Norway (Low sun, steep seasonal swings)
    locationName: 'Bergen, Norway (60.4° N)',
    facadeOrientation: 'South',
    windowHeightMeters: 3.2,
    baseOverhangMeters: 0.8,
  },
  'monolith-center': {
    id: 'monolith-center',
    latitude: 46.81, // Swiss Alps
    locationName: 'Engadin Valley, Switzerland (46.8° N)',
    facadeOrientation: 'South',
    windowHeightMeters: 6.5,
    baseOverhangMeters: 1.5,
  },
  'aether-hq': {
    id: 'aether-hq',
    latitude: 55.67, // Copenhagen, Denmark
    locationName: 'Copenhagen, Denmark (55.7° N)',
    facadeOrientation: 'South',
    windowHeightMeters: 4.5,
    baseOverhangMeters: 1.2,
  },
  'canyon-retreat': {
    id: 'canyon-retreat',
    latitude: 31.96, // Sonoran Desert (High intense desert sun)
    locationName: 'Sonoran Desert, Arizona (32.0° N)',
    facadeOrientation: 'South',
    windowHeightMeters: 2.8,
    baseOverhangMeters: 1.8, // Deep overhang for desert cooling
  },
  'helios-outpost': {
    id: 'helios-outpost',
    latitude: 78.22, // Svalbard, Norway (Extreme Polar solar path)
    locationName: 'Svalbard Arctic Circle (78.2° N)',
    facadeOrientation: 'South',
    windowHeightMeters: 2.2,
    baseOverhangMeters: 0.5,
  },
  'fractal-canopy': {
    id: 'fractal-canopy',
    latitude: 40.71, // New York, USA
    locationName: 'Dense Manhattan Core (40.7° N)',
    facadeOrientation: 'South',
    windowHeightMeters: 3.0,
    baseOverhangMeters: 0.6,
  },
};

export default function SolarShadowSimulator({ projectId, projectName }: SolarShadowSimulatorProps) {
  const profile = solarProfiles[projectId] || solarProfiles['obsidian-pavilion'];

  // User States
  const [hour, setHour] = useState<number>(12); // Hour of day (6 to 18 for daylight)
  const [season, setSeason] = useState<'summer' | 'equinox' | 'winter'>('summer');
  const [overhangDepth, setOverhangDepth] = useState<number>(profile.baseOverhangMeters);
  const [glazingSHGC, setGlazingSHGC] = useState<number>(0.38); // Solar Heat Gain Coefficient (0.1 to 0.8)

  // Sync initial parameters
  useEffect(() => {
    setOverhangDepth(profile.baseOverhangMeters);
  }, [projectId]);

  // Calculations for Solar Geometry (Simplified Solar Path Formulas)
  // 1. Declination Angle (delta) in degrees
  // Summer Solstice ~ +23.45°, Equinox ~ 0°, Winter Solstice ~ -23.45°
  const declination = season === 'summer' ? 23.45 : season === 'winter' ? -23.45 : 0;

  // 2. Hour Angle (H) in degrees (12:00 PM is 0°, each hour is 15°)
  const hourAngle = (hour - 12) * 15;

  // 3. Solar Altitude Angle (beta) in radians, then converted to degrees
  const latRad = (profile.latitude * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const hrRad = (hourAngle * Math.PI) / 180;

  const sinAltitude = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hrRad);
  const altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAltitude)));
  const altitudeDeg = parseFloat(((altitudeRad * 180) / Math.PI).toFixed(1));

  // 4. Solar Azimuth (phi)
  let cosAzimuth = (Math.sin(decRad) * Math.cos(latRad) - Math.cos(decRad) * Math.sin(latRad) * Math.cos(hrRad)) / (Math.cos(altitudeRad) || 0.001);
  cosAzimuth = Math.max(-1, Math.min(1, cosAzimuth));
  let azimuthDeg = (Math.acos(cosAzimuth) * 180) / Math.PI;
  if (hour > 12) {
    azimuthDeg = 360 - azimuthDeg;
  }
  azimuthDeg = parseFloat(azimuthDeg.toFixed(1));

  // Determine if sun is below horizon
  const isSunUp = altitudeDeg > 0;

  // 5. Overhang Shadow Projection (Shading depth / cutoff calculations)
  // Shaded height x = Overhang Depth * tan(Altitude)
  // Percent Window Shaded = (x / windowHeight) * 100
  let shadedHeight = 0;
  let shadowPercent = 0;
  
  if (isSunUp) {
    const altRad = (altitudeDeg * Math.PI) / 180;
    // We assume South facing wall.
    // Real architects use Profile Angle which depends on azimuth, but we simplify to vertical altitude.
    shadedHeight = overhangDepth * Math.tan(altRad);
    shadowPercent = Math.min(100, Math.max(0, Math.round((shadedHeight / profile.windowHeightMeters) * 100)));
  }

  // 6. Direct Solar Insolation reaching inside (W/m²)
  // Base clear sky direct normal radiation ~1000 W/m²
  const baseInsolation = isSunUp ? 950 * Math.sin((altitudeDeg * Math.PI) / 180) : 0;
  // Shading offset reduces solar load inside
  const shadedApertureFactor = (100 - shadowPercent) / 100;
  const interiorSolarGainWM2 = isSunUp
    ? Math.round(baseInsolation * shadedApertureFactor * glazingSHGC)
    : 0;

  // 7. Natural daylight factor estimation (%)
  // Influenced by season/sun altitude and glazing transparency (SHGC ~ VT)
  const daylightFactorPct = isSunUp
    ? Math.min(95, Math.max(5, Math.round(55 * Math.sin((altitudeDeg * Math.PI) / 180) * (glazingSHGC * 1.5))))
    : 0;

  // Render SVG of the passive solar room cross-section casting a physical shadow beam
  const renderInteractiveShadowSvg = () => {
    // Window is placed on the left wall from y=50 to y=150.
    // Overhang is at the top-left corner projecting to the left.
    // Sun coordinates based on altitudeDeg.
    const windowTopY = 55;
    const windowBottomY = 145;
    const roomLeftX = 110;
    const roomRightX = 330;
    const roomFloorY = 145;
    const roomCeilingY = 35;

    // Scale representation of overhang (e.g., 1m = 15px)
    const pxScale = 15;
    const scaledOverhang = Math.round(overhangDepth * pxScale);

    // Coordinate of overhang tip
    const overhangTipX = roomLeftX - scaledOverhang;
    const overhangTipY = roomCeilingY;

    // Sun source angle vector
    const angleRad = (altitudeDeg * Math.PI) / 180;
    
    // Draw the direct solar ray entering the window.
    // The ray is clipped by the overhang tip. Let's trace from overhang tip to the floor or backwall.
    // The line equation from (overhangTipX, overhangTipY) with slope = tan(angle)
    // y - y1 = m * (x - x1) -> y = y1 + tan(angle) * (x - x1)
    let shadowBoundaryFloorX = roomLeftX;
    let lightPenetrationX = roomLeftX;

    if (isSunUp && altitudeDeg > 0) {
      // Intersection of shadow edge with the window plane (x = roomLeftX)
      // y_shadow = overhangTipY + tan(angle) * (roomLeftX - overhangTipX)
      const yShadowOnWall = overhangTipY + Math.tan(angleRad) * (roomLeftX - overhangTipX);

      // Intersection of sun rays with the floor (y = roomFloorY) from overhang tip
      shadowBoundaryFloorX = overhangTipX + (roomFloorY - overhangTipY) / Math.tan(angleRad);
      shadowBoundaryFloorX = Math.min(roomRightX, Math.max(roomLeftX, shadowBoundaryFloorX));

      // Intersection of light beam from window bottom (roomLeftX, windowBottomY) to the ceiling/wall
      // Light beam boundary: x = roomLeftX + (roomFloorY - windowBottomY) / tan(angle)
      // Since it's floor level, it exits at the window bottom on the floor.
    }

    // Dynamic sun position circle on sky dome path
    // Let's draw an arc representing sky, and place the sun icon at altitude
    const skyRadius = 80;
    const skyCenterX = 55;
    const skyCenterY = 145;
    const sunX = skyCenterX + skyRadius * Math.cos(angleRad);
    const sunY = skyCenterY - skyRadius * Math.sin(angleRad);

    return (
      <svg className="absolute inset-0 w-full h-full" id="solar-section-svg">
        {/* Sky Dome Guide (Left Side) */}
        <path 
          d={`M ${skyCenterX - skyRadius},${skyCenterY} A ${skyRadius},${skyRadius} 0 0,1 ${skyCenterX + skyRadius},${skyCenterY}`} 
          fill="none" 
          stroke="rgba(247, 247, 245, 0.08)" 
          strokeWidth="1.5" 
          strokeDasharray="3 3"
        />

        {/* Sky horizon line */}
        <line x1="10" y1="145" x2="350" y2="145" stroke="rgba(247, 247, 245, 0.15)" strokeWidth="1" />

        {/* Dynamic Sun Indicator */}
        {isSunUp ? (
          <g transform={`translate(${sunX}, ${sunY})`}>
            <circle cx="0" cy="0" r="10" fill="rgba(245, 158, 11, 0.2)" className="animate-pulse" />
            <circle cx="0" cy="0" r="6" fill="#f59e0b" />
            <line x1="0" y1="-11" x2="0" y2="-8" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="0" y1="8" x2="0" y2="11" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="-11" y1="0" x2="-8" y2="0" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="8" y1="0" x2="11" y2="0" stroke="#f59e0b" strokeWidth="1.2" />
          </g>
        ) : (
          <g transform={`translate(${skyCenterX}, ${skyCenterY + 15})`} className="opacity-40">
            <CloudSun size={14} className="text-blue-500" />
            <text x="18" y="10" className="fill-[#888888] font-mono text-[7px]">SUN BELOW HORIZON</text>
          </g>
        )}

        {/* Golden Sun Light Beam inside room */}
        {isSunUp && altitudeDeg > 0 && (
          <polygon
            /* The polygon covers from the shaded wall intersection down to the floor, bounded by window bottom */
            points={`
              ${roomLeftX},${Math.min(windowBottomY, Math.max(windowTopY, overhangTipY + Math.tan(angleRad) * (roomLeftX - overhangTipX)))}
              ${roomLeftX},${windowBottomY}
              ${Math.min(roomRightX, roomLeftX + (roomFloorY - windowBottomY) / Math.tan(angleRad))},${roomFloorY}
              ${shadowBoundaryFloorX},${roomFloorY}
            `}
            fill="url(#solar-light-beam-gradient)"
            className="opacity-25 transition-all duration-300 pointer-events-none"
          />
        )}

        {/* Room Structural Cross-Section Envelope */}
        {/* Ceiling & Floor */}
        <rect x={roomLeftX} y={roomCeilingY} width={roomRightX - roomLeftX} height={roomFloorY - roomCeilingY} fill="rgba(24,24,24,0.1)" />
        <line x1={roomLeftX} x2={roomRightX} y1={roomCeilingY} y2={roomCeilingY} stroke="#F7F7F5" strokeWidth="2.5" />
        <line x1={roomLeftX} x2={roomRightX} y1={roomFloorY} y2={roomFloorY} stroke="#F7F7F5" strokeWidth="3" />
        {/* Back Wall */}
        <line x1={roomRightX} x2={roomRightX} y1={roomCeilingY} y2={roomFloorY} stroke="#F7F7F5" strokeWidth="2" />
        
        {/* Left Wall with Window Cutout */}
        <line x1={roomLeftX} x2={roomLeftX} y1={roomCeilingY} y2={windowTopY} stroke="#F7F7F5" strokeWidth="2.5" />
        <line x1={roomLeftX} x2={roomLeftX} y1={windowBottomY} y2={roomFloorY} stroke="#F7F7F5" strokeWidth="2.5" strokeLinecap="square" />
        
        {/* Glazing line (Blue outline) */}
        <line x1={roomLeftX} x2={roomLeftX} y1={windowTopY} y2={windowBottomY} stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 1" opacity="0.8" />

        {/* Physical Overhang Extrusion */}
        <line x1={roomLeftX} x2={overhangTipX} y1={roomCeilingY} y2={overhangTipY} stroke="#F7F7F5" strokeWidth="4" />
        {/* Supporting bracket under overhang */}
        <line x1={roomLeftX} x2={roomLeftX - Math.min(8, scaledOverhang / 2)} y1={roomCeilingY + 12} y2={roomCeilingY} stroke="#888888" strokeWidth="1" />

        {/* Cast shadow indicator line */}
        {isSunUp && altitudeDeg > 0 && (
          <line 
            x1={overhangTipX} 
            y1={overhangTipY} 
            x2={shadowBoundaryFloorX} 
            y2={roomFloorY} 
            stroke="rgba(245,158,11,0.25)" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
          />
        )}

        {/* Gradients definitions */}
        <defs>
          <linearGradient id="solar-light-beam-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="bg-[#121212] text-[#F7F7F5] rounded-sm p-6 border border-[#E0E0DE]/20 shadow-2xl overflow-hidden flex flex-col min-h-[660px] lg:h-[720px]" id="solar-shadow-simulator-main">
      
      {/* Header and Classification Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0E0DE]/20 pb-4 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888]">
            <Sun size={12} className="text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
            <span>ASHRAE CLIMATE SOLAR HELIODON RESEARCH</span>
          </div>
          <h4 className="text-base font-sans font-medium text-[#F7F7F5] mt-1">
            Passive Solar Shading & Shadow Caster Workbench
          </h4>
        </div>
        <div className="flex items-center gap-3 bg-[#181818] px-4 py-2 border border-[#E0E0DE]/10 rounded-sm">
          <div className="flex flex-col text-right font-mono">
            <span className="text-[8px] text-[#888888] uppercase tracking-wider">SOLAR ALTITUDE</span>
            <span className="text-[9px] text-[#888888]">ELEVATION DEGREE</span>
          </div>
          <div className="h-9 w-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-sm font-bold flex items-center justify-center rounded-sm">
            {isSunUp ? `${altitudeDeg}°` : '0°'}
          </div>
        </div>
      </div>

      {/* Split Grid: Controls (Left) vs Heliodon Visual (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-y-auto" id="solar-split-layout">
        
        {/* Left Side Controls (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4 pr-1" id="solar-inputs">
          
          {/* Parameter 1: Time of Day Hour Slider */}
          <div className="flex flex-col gap-1.5 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#888888]">
              <span className="flex items-center gap-1 uppercase"><Clock size={12} /> Time of Day (LST):</span>
              <span className="text-amber-400 font-semibold">{hour === 12 ? '12:00 (Solar Noon)' : `${hour}:00`}</span>
            </div>
            <input 
              type="range" 
              min="6" 
              max="18" 
              step="1"
              value={hour} 
              onChange={(e) => setHour(parseInt(e.target.value))}
              className="w-full accent-amber-500 bg-[#E0E0DE]/20 h-1 rounded outline-none cursor-ew-resize mt-1"
            />
            <div className="flex justify-between text-[7px] font-mono text-[#888888] uppercase mt-0.5">
              <span>06:00 (Sunrise)</span>
              <span>12:00 (Noon)</span>
              <span>18:00 (Sunset)</span>
            </div>
          </div>

          {/* Parameter 2: Seasonal Solstice Cycle Selection */}
          <div className="flex flex-col gap-2 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider flex items-center gap-1"><Calendar size={12} /> Seasonal Solstice / Declination:</span>
            <div className="grid grid-cols-3 gap-2">
              {(['summer', 'equinox', 'winter'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  className={`py-2 text-[9px] font-mono uppercase tracking-tight rounded-sm transition cursor-pointer text-center border ${
                    season === s 
                      ? 'bg-[#F7F7F5] text-[#121212] border-[#F7F7F5] font-bold' 
                      : 'bg-[#121212] text-[#888888] border-[#E0E0DE]/10 hover:text-[#F7F7F5]'
                  }`}
                >
                  {s === 'summer' ? 'Summer Solstice' : s === 'winter' ? 'Winter Solstice' : 'Spring/Autumn'}
                </button>
              ))}
            </div>
            <p className="text-[8px] font-mono text-[#888888]/80 leading-normal">
              {season === 'summer' && '☀️ High solar path. Overhang shading maximizes shadow coverage to reject passive solar heat.'}
              {season === 'equinox' && 'Moderate sun angle. Balanced shading, ideal for moderate seasonal warming requirements.'}
              {season === 'winter' && '❄️ Low polar/subarctic sun. Shallow beams penetrate deep inside to capture passive heating energy.'}
            </p>
          </div>

          {/* Parameter 3: Shading Overhang Depth Slider */}
          <div className="flex flex-col gap-1.5 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#888888]">
              <span className="flex items-center gap-1 uppercase"><Sliders size={12} /> Overhang Depth Projection:</span>
              <span className="text-amber-400 font-semibold">{overhangDepth.toFixed(1)} meters <span className="text-[8px] font-light text-[#888888]">({Math.round(overhangDepth * 3.28)} ft)</span></span>
            </div>
            <input 
              type="range" 
              min="0.0" 
              max="2.5" 
              step="0.1"
              value={overhangDepth} 
              onChange={(e) => setOverhangDepth(parseFloat(e.target.value))}
              className="w-full accent-[#F7F7F5] bg-[#E0E0DE]/20 h-1 rounded outline-none cursor-ew-resize mt-1"
            />
            <span className="text-[8px] font-mono text-[#888888]/80">Extrudes the solid horizontal visor above window glazing to block zenith direct rays.</span>
          </div>

          {/* Parameter 4: Glass Solar Heat Gain Selection */}
          <div className="bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm flex flex-col gap-2 font-mono text-[9px]">
            <span className="text-[#888888] uppercase tracking-wider block">GLAZING THERMAL TRANSMITTANCE (SHGC)</span>
            <div className="flex items-center justify-between gap-4 mt-1">
              <span className="text-[#888888]">Glass Solar Factor:</span>
              <select 
                value={glazingSHGC} 
                onChange={(e) => setGlazingSHGC(parseFloat(e.target.value))}
                className="bg-[#121212] text-[#F7F7F5] border border-[#E0E0DE]/10 rounded px-2 py-1 text-[9px] font-mono outline-none cursor-pointer w-3/5 hover:border-[#E0E0DE]/20"
              >
                <option value="0.25">Low-E Tined (SHGC 0.25)</option>
                <option value="0.38">Triple Low-E Standard (SHGC 0.38)</option>
                <option value="0.55">Double Pane Clear (SHGC 0.55)</option>
                <option value="0.75">Single Pane Standard (SHGC 0.75)</option>
              </select>
            </div>
            <p className="text-[8px] text-[#888888] leading-normal mt-1">
              Shorthand for Solar Heat Gain Coefficient. Lower numbers reject thermal solar radiation while keeping visual light transparency.
            </p>
          </div>

        </div>

        {/* Right Side Outputs (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-4 justify-between" id="solar-outputs">
          
          {/* Interactive Heliodon Section View */}
          <div className="bg-[#181818] p-4 border border-[#E0E0DE]/10 rounded-sm flex flex-col gap-3 relative overflow-hidden">
            <div className="flex justify-between items-center z-10 relative">
              <div>
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-widest block">PASSIVE ARCHITECTURAL HELIODON STUDY</span>
                <span className="text-[9px] font-mono text-[#888888]">{profile.locationName} - South Facade</span>
              </div>
              <span className="text-[8px] font-mono text-[#888888] bg-[#121212] border border-[#E0E0DE]/10 px-2 py-0.5 rounded-sm">
                AZIMUTH: {isSunUp ? `${azimuthDeg}°` : '0°'}
              </span>
            </div>

            {/* SVG Visual Stage */}
            <div className="bg-[#121212] rounded border border-[#E0E0DE]/10 h-[190px] w-full relative overflow-hidden flex items-end">
              {renderInteractiveShadowSvg()}

              {/* Vector Legends */}
              <div className="absolute bottom-3 left-4 bg-[#121212]/85 border border-[#E0E0DE]/10 p-1.5 rounded-sm font-mono text-[7px] text-[#888888] flex gap-3 pointer-events-none">
                <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-[#f59e0b] inline-block opacity-60" /> SOLAR BEAM</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-blue-500 inline-block opacity-40" /> GLAZING SKIN</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-[#f59e0b] rounded-full inline-block animate-ping" /> SUN</span>
              </div>
            </div>
          </div>

          {/* Interactive Metrics Matrix */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Metric 1: Window Shadow Cover % */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">WINDOW SHADOW COVER:</span>
                <span className="text-amber-400 font-bold text-xs mt-0.5">
                  {isSunUp ? `${shadowPercent}%` : '0%'} <span className="text-[8px] font-light text-[#888888]">shaded</span>
                </span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">SHADE DEPTH:</span>
                <span className="text-[#F7F7F5] font-semibold">{isSunUp ? `${shadedHeight.toFixed(2)}m` : '0m'}</span>
              </div>
            </div>

            {/* Metric 2: Incident solar heat gain inside */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">SOLAR GAIN INSIDE:</span>
                <span className={`font-bold text-xs mt-0.5 ${interiorSolarGainWM2 > 250 ? 'text-[#f59e0b]' : 'text-emerald-400'}`}>
                  {interiorSolarGainWM2} <span className="text-[8px] font-light text-[#888888]">W/m²</span>
                </span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">EXTERIOR RAD:</span>
                <span className="text-[#888888] font-semibold">{Math.round(baseInsolation)} W/m²</span>
              </div>
            </div>

            {/* Metric 3: Daylight autonomy Factor */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">DAYLIGHT RATIO:</span>
                <span className="text-[#F7F7F5] font-bold text-xs mt-0.5">{daylightFactorPct}% <span className="text-[8px] font-light text-[#888888]">lux avg</span></span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">ORIENTATION:</span>
                <span className="text-amber-400 font-semibold">{profile.facadeOrientation}</span>
              </div>
            </div>
          </div>

          {/* Architectural Synthesis & Performance Alert */}
          <div className="flex flex-col gap-2 font-mono">
            {isSunUp && interiorSolarGainWM2 > 200 ? (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded flex items-start gap-2.5 text-[9px]">
                <HelpCircle size={14} className="shrink-0 mt-0.5 animate-bounce" />
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <span className="font-bold uppercase">HIGH PASSIVE SOLAR SOLAR HEAT GAIN (OVERHEATING RISK)</span>
                  <p className="text-[#888888]">
                    High solar heat penetration ({interiorSolarGainWM2} W/m²) risks interior greenhouse overheating. Remedy: Increase horizontal overhang depth to {Math.max(1.5, overhangDepth + 0.5).toFixed(1)}m or switch glass SHGC to a tighter 0.25 low-e film factor.
                  </p>
                </div>
              </div>
            ) : isSunUp && shadowPercent >= 85 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded flex items-start gap-2.5 text-[9px]">
                <CheckCircle size={14} className="shrink-0 mt-0.5 text-emerald-400" />
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <span className="font-bold uppercase">PASSIVE HEAT REJECTION AUDIT SUCCESSFUL</span>
                  <p className="text-[#888888]">
                    The horizontal architectural visor blocks {shadowPercent}% of direct zenith rays, keeping solar interior heat load down to a gorgeous, chilled {interiorSolarGainWM2} W/m² with zero reliance on mechanical air conditioning loops.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded flex items-start gap-2.5 text-[9px]">
                <Info size={14} className="shrink-0 mt-0.5 text-amber-400" />
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <span className="font-bold uppercase text-amber-400">DIFFUSED SOLAR TRACKING REGIME</span>
                  <p className="text-[#888888]">
                    Under the current seasonal declination, daylight levels are moderately balanced ({daylightFactorPct}% daylight factor), providing superb ambient lumen rendering across structural workspaces.
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic Synthesis commentary */}
            <div className="bg-[#121212] p-3 rounded border border-[#E0E0DE]/10 flex gap-2 text-[9px] leading-relaxed">
              <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-amber-400 font-bold uppercase">HELIODON DYNAMICS SYNTHESIS \ {projectName}</span>
                <p className="text-[#888888]">
                  {profile.id === 'obsidian-pavilion' && 'In Norwegian high-latitudes, the winter sun barely breaks the horizon. Generous glazing grabs crucial warmth, while summer solar azimuths require careful east-west aperture control.'}
                  {profile.id === 'monolith-center' && 'High-altitude Alpine locations enjoy magnificent visual solar radiation. A balanced 1.5m visor prevents winter solar snow glare while preserving solar gain thresholds.'}
                  {profile.id === 'aether-hq' && 'The central gridshell dome uses complex multi-angle micro-panels that block summer high-altitude solar loads while guiding low-altitude winter daylight deep into the main floor plan.'}
                  {profile.id === 'canyon-retreat' && 'Desert canyons carry extreme heat indices. A massive 1.8m horizontal visor completely shades the south-facing thermal earth facade, allowing zero hot zenith radiation inside.'}
                  {profile.id === 'helios-outpost' && 'Polar latitudes have perpetual arctic winter darkness or summer midnight sun. Visors are kept narrow to draw every ounce of low, horizontal daylight inside.'}
                  {profile.id === 'fractal-canopy' && 'Dense urban canyon contexts suffer from adjacent skyscraper shadow blockage. Facade panels are designed to scatter light omnidirectionally to maximize internal lumens.'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Action Footer */}
      <div className="border-t border-[#E0E0DE]/10 pt-3 mt-4 flex items-center justify-between font-mono text-[8px] text-[#888888] tracking-widest uppercase">
        <span>TWEAK SLIDERS TO CALCULATE OPTIMAL SUMMER AND WINTER SHADOW DEPTHS</span>
        <span className="text-emerald-500 flex items-center gap-1 font-semibold animate-pulse">
          CIBSE TM37 Passive Solar Design Standards Compliant Model
        </span>
      </div>

    </div>
  );
}
