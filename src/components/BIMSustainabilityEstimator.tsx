/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  DollarSign, 
  Zap, 
  Thermometer, 
  Sun, 
  Activity, 
  Scale, 
  Hammer, 
  Info,
  Layers,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Award
} from 'lucide-react';

interface BIMSustainabilityEstimatorProps {
  projectId: string;
  projectName: string;
  baseArea: string; // e.g., "3,200 sq ft"
}

// Map project ID to physical attributes and constants
const projectBaseProfiles: Record<string, {
  defaultArea: number; // in sq ft
  climate: string;
  baseCarbonRating: number; // kg CO2e / sq ft
  baseCostPerSqFt: number; // USD
  localInsolation: number; // kWh/m²/year solar potential
  heatingLoadBase: number; // kWh/m²/year
  daylightBase: number; // %
}> = {
  'obsidian-pavilion': {
    defaultArea: 3200,
    climate: 'Norwegian Maritime / Subarctic',
    baseCarbonRating: -12.4, // negative due to extensive timber
    baseCostPerSqFt: 340,
    localInsolation: 850,
    heatingLoadBase: 45,
    daylightBase: 78,
  },
  'monolith-center': {
    defaultArea: 45000,
    climate: 'Central European / Alpine Föhn',
    baseCarbonRating: 145.0, // high concrete base
    baseCostPerSqFt: 480,
    localInsolation: 1100,
    heatingLoadBase: 62,
    daylightBase: 88,
  },
  'aether-hq': {
    defaultArea: 120000,
    climate: 'Scandinavian Temperate Coastal',
    baseCarbonRating: -8.5, // negative mass timber CLT
    baseCostPerSqFt: 410,
    localInsolation: 950,
    heatingLoadBase: 38,
    daylightBase: 84,
  },
  'canyon-retreat': {
    defaultArea: 2400,
    climate: 'Sonoran Desert / Semiarid',
    baseCarbonRating: -25.0, // excellent rammed earth carbon
    baseCostPerSqFt: 380,
    localInsolation: 2200, // very high solar
    heatingLoadBase: 12, // cooling dominated
    daylightBase: 94,
  },
  'helios-outpost': {
    defaultArea: 8500,
    climate: 'Volcanic Alpine / Polar Icecap',
    baseCarbonRating: 85.0, // specialized composite materials
    baseCostPerSqFt: 1250, // extremely expensive remote outpost
    localInsolation: 650,
    heatingLoadBase: 140, // massive thermal requirements
    daylightBase: 65,
  },
  'fractal-canopy': {
    defaultArea: 1800,
    climate: 'Dense Urban Heat-Island / humid temperate',
    baseCarbonRating: 35.0,
    baseCostPerSqFt: 220,
    localInsolation: 1250,
    heatingLoadBase: 5,
    daylightBase: 95,
  },
};

export default function BIMSustainabilityEstimator({ projectId, projectName, baseArea }: BIMSustainabilityEstimatorProps) {
  const profile = projectBaseProfiles[projectId] || projectBaseProfiles['obsidian-pavilion'];

  // State parameters configured by the user
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1.0);
  const [frameType, setFrameType] = useState<'timber' | 'steel' | 'concrete'>('timber');
  const [envelopeType, setEnvelopeType] = useState<'shou-sugi' | 'rammed-earth' | 'composite' | 'double-glass'>('shou-sugi');
  const [glazingGrade, setGlazingGrade] = useState<'double' | 'triple-low-e'>('triple-low-e');
  const [solarCoverage, setSolarCoverage] = useState<number>(45); // 0% to 100% of roof area

  // Synchronize initial selections to better align with the default properties of specific projects
  useEffect(() => {
    if (projectId === 'monolith-center') {
      setFrameType('concrete');
      setEnvelopeType('composite');
      setGlazingGrade('triple-low-e');
      setSolarCoverage(20);
    } else if (projectId === 'canyon-retreat') {
      setFrameType('timber');
      setEnvelopeType('rammed-earth');
      setGlazingGrade('double');
      setSolarCoverage(80);
    } else if (projectId === 'helios-outpost') {
      setFrameType('steel');
      setEnvelopeType('composite');
      setGlazingGrade('triple-low-e');
      setSolarCoverage(30);
    } else if (projectId === 'fractal-canopy') {
      setFrameType('steel');
      setEnvelopeType('double-glass');
      setGlazingGrade('double');
      setSolarCoverage(90);
    } else {
      setFrameType('timber');
      setEnvelopeType('shou-sugi');
      setGlazingGrade('triple-low-e');
      setSolarCoverage(50);
    }
    setScaleMultiplier(1.0);
  }, [projectId]);

  // Derived dimensions
  const activeArea = Math.round(profile.defaultArea * scaleMultiplier);

  // Carbon Impact Coefficient Calculations (in kg CO2e per sq ft)
  let frameCarbonFactor = 0;
  if (frameType === 'timber') frameCarbonFactor = -45; // Negative (carbon sequestration)
  else if (frameType === 'steel') frameCarbonFactor = 65; // Moderate carbon
  else if (frameType === 'concrete') frameCarbonFactor = 125; // High carbon

  let envelopeCarbonFactor = 0;
  if (envelopeType === 'shou-sugi') envelopeCarbonFactor = -25; // Charred wood absorbs CO2
  else if (envelopeType === 'rammed-earth') envelopeCarbonFactor = -35; // Local materials minimal transport
  else if (envelopeType === 'composite') envelopeCarbonFactor = 15;
  else if (envelopeType === 'double-glass') envelopeCarbonFactor = 45; // heavy processing

  let glazingCarbonFactor = glazingGrade === 'double' ? 10 : 22;

  // Solar offset calculations: each 10% solar coverage offsets -5 kg CO2e per sq ft of building footprint
  const solarCarbonFactor = -(solarCoverage / 10) * 5.5;

  const calculatedCarbonPerSqFt = frameCarbonFactor + envelopeCarbonFactor + glazingCarbonFactor + solarCarbonFactor;
  const totalCarbonImpactTons = Math.round((calculatedCarbonPerSqFt * activeArea) / 1000);

  // Cost Estimation ($ per sq ft)
  let frameCostFactor = 0;
  if (frameType === 'timber') frameCostFactor = profile.baseCostPerSqFt * 1.05; // Timber is slightly premium
  else if (frameType === 'steel') frameCostFactor = profile.baseCostPerSqFt * 1.15; // Steel structure
  else if (frameType === 'concrete') frameCostFactor = profile.baseCostPerSqFt * 0.95; // Concrete standard casting

  let envelopeCostFactor = 0;
  if (envelopeType === 'shou-sugi') envelopeCostFactor = 45;
  if (envelopeType === 'rammed-earth') envelopeCostFactor = 55;
  if (envelopeType === 'composite') envelopeCostFactor = 25;
  if (envelopeType === 'double-glass') envelopeCostFactor = 95; // High end glazed curtain

  const glazingCostFactor = glazingGrade === 'double' ? 20 : 45;
  const solarCostFactor = (solarCoverage / 10) * 12; // $12 per % per sq ft

  const calculatedCostPerSqFt = Math.round(frameCostFactor + envelopeCostFactor + glazingCostFactor + solarCostFactor);
  const totalProjectCost = calculatedCostPerSqFt * activeArea;

  // Environmental Performance Gauges
  // R-Value (Thermal Resistance) calculation: 
  let baseRValue = 12;
  if (envelopeType === 'shou-sugi') baseRValue += 24; // solid wood + wood fiber
  if (envelopeType === 'rammed-earth') baseRValue += 28; // massive thick earth walls
  if (envelopeType === 'composite') baseRValue += 18; // standard cavity insulated
  if (envelopeType === 'double-glass') baseRValue += 4; // poor thermal barrier

  if (glazingGrade === 'triple-low-e') baseRValue += 8;
  else baseRValue += 3;

  const totalEnvelopeRValue = baseRValue;

  // Annual Solar Power Generation (in MWh/year)
  const rooftopAreaSqFt = activeArea * 0.45; // Assume roof is 45% of total indoor area
  const actualSolarAreaSqFt = rooftopAreaSqFt * (solarCoverage / 100);
  const actualSolarAreaSqM = actualSolarAreaSqFt / 10.764;
  // Panel efficiency ~21%
  const annualGenerationMWh = Math.round((actualSolarAreaSqM * profile.localInsolation * 0.21 * 0.85) / 1000);

  // Daylight autonomy percentage
  let baseDaylight = profile.daylightBase;
  if (envelopeType === 'double-glass') baseDaylight += 12;
  if (envelopeType === 'rammed-earth') baseDaylight -= 8; // deeper shadow boxes, smaller apertures
  const calculatedDaylightAutonomy = Math.min(98, Math.max(45, baseDaylight));

  // Eco Efficiency Rating Letter (A+ through F) based on R-value, carbon and solar offset
  let ratingLetter = 'B';
  const score = totalEnvelopeRValue * 1.5 + (calculatedCarbonPerSqFt < 0 ? Math.abs(calculatedCarbonPerSqFt) : -calculatedCarbonPerSqFt) * 0.5 + (annualGenerationMWh > 10 ? 15 : 0);
  if (score > 60) ratingLetter = 'A+';
  else if (score > 40) ratingLetter = 'A';
  else if (score > 25) ratingLetter = 'B+';
  else if (score > 10) ratingLetter = 'B';
  else if (score > -10) ratingLetter = 'C';
  else ratingLetter = 'D';

  // Industry Standard comparison baseline carbon (typically 85kg CO2e/sq ft for traditional concrete & brick)
  const industryBaselineTons = Math.round((85 * activeArea) / 1000);
  const carbonSavingsPct = industryBaselineTons > 0 
    ? Math.round(((industryBaselineTons - totalCarbonImpactTons) / industryBaselineTons) * 100) 
    : 0;

  return (
    <div className="bg-[#121212] text-[#F7F7F5] rounded-sm p-6 border border-[#E0E0DE]/20 shadow-2xl overflow-hidden flex flex-col min-h-[660px] lg:h-[720px]" id="bim-parametric-calculator">
      
      {/* Header and Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0E0DE]/20 pb-4 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888]">
            <Activity size={12} className="text-emerald-500 animate-pulse" />
            <span>PARAMETRIC LIFE CYCLE ASSESSMENT (LCA)</span>
          </div>
          <h4 className="text-base font-sans font-medium text-[#F7F7F5] mt-1">
            BIM Simulation Workbench & Carbon Forecaster
          </h4>
        </div>
        <div className="flex items-center gap-3 bg-[#181818] px-4 py-2 border border-[#E0E0DE]/10 rounded-sm">
          <div className="flex flex-col text-right font-mono">
            <span className="text-[8px] text-[#888888] uppercase tracking-wider">ECO PERFORMANCE</span>
            <span className="text-[9px] text-[#888888]">PHPP CLASSIFICATION</span>
          </div>
          <div className="h-9 w-9 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-lg font-bold flex items-center justify-center rounded-sm">
            {ratingLetter}
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Inputs, Right Analytics Output */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-y-auto" id="bim-split-layout">
        
        {/* Left Parameter Inputs (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-5 pr-1" id="bim-inputs-panel">
          
          {/* Parameter 1: Structural Scale Slider */}
          <div className="flex flex-col gap-1.5 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#888888]">
              <span className="flex items-center gap-1 uppercase"><Scale size={12} /> Spatial Scale Factor:</span>
              <span className="text-amber-400 font-semibold">{scaleMultiplier.toFixed(2)}x ({(activeArea).toLocaleString()} sq ft)</span>
            </div>
            <input 
              type="range" 
              min="0.75" 
              max="1.50" 
              step="0.05"
              value={scaleMultiplier} 
              onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-[#E0E0DE]/20 h-1 rounded outline-none cursor-ew-resize mt-1"
            />
            <span className="text-[8px] font-mono text-[#888888]/80">Adjusts building massing footprint, foundation depth, and material volume requirements.</span>
          </div>

          {/* Parameter 2: Framing Systems Selection */}
          <div className="flex flex-col gap-2 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider flex items-center gap-1"><Hammer size={12} /> Primary Structural Frame:</span>
            <div className="grid grid-cols-3 gap-2">
              {(['timber', 'steel', 'concrete'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFrameType(t)}
                  className={`py-2 text-[9px] font-mono uppercase tracking-tight rounded-sm transition cursor-pointer text-center border ${
                    frameType === t 
                      ? 'bg-[#F7F7F5] text-[#121212] border-[#F7F7F5] font-bold' 
                      : 'bg-[#121212] text-[#888888] border-[#E0E0DE]/10 hover:text-[#F7F7F5] hover:border-[#E0E0DE]/20'
                  }`}
                >
                  {t === 'timber' ? 'Mass Timber' : t === 'steel' ? 'Recycled Steel' : 'Concrete Slab'}
                </button>
              ))}
            </div>
            <p className="text-[8px] font-mono text-[#888888]/80 leading-normal">
              {frameType === 'timber' && '⭐ Carbon Sequestration: Glulam and CLT frame captures carbon, yielding negative offset.'}
              {frameType === 'steel' && 'High rigidity and wide spans, but demands higher structural smelting embodied carbon.'}
              {frameType === 'concrete' && 'Heavy thermal mass but extreme concrete kiln baking calcination carbon release.'}
            </p>
          </div>

          {/* Parameter 3: Envelope Cladding Selection */}
          <div className="flex flex-col gap-2 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider flex items-center gap-1"><Layers size={12} /> Outer Envelope Skin:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEnvelopeType('shou-sugi')}
                className={`py-2 text-[9px] font-mono uppercase tracking-tight rounded-sm transition cursor-pointer text-center border ${
                  envelopeType === 'shou-sugi' 
                    ? 'bg-[#F7F7F5] text-[#121212] border-[#F7F7F5] font-bold' 
                    : 'bg-[#121212] text-[#888888] border-[#E0E0DE]/10 hover:text-[#F7F7F5] hover:border-[#E0E0DE]/20'
                }`}
              >
                Charred Wood
              </button>
              <button
                onClick={() => setEnvelopeType('rammed-earth')}
                className={`py-2 text-[9px] font-mono uppercase tracking-tight rounded-sm transition cursor-pointer text-center border ${
                  envelopeType === 'rammed-earth' 
                    ? 'bg-[#F7F7F5] text-[#121212] border-[#F7F7F5] font-bold' 
                    : 'bg-[#121212] text-[#888888] border-[#E0E0DE]/10 hover:text-[#F7F7F5] hover:border-[#E0E0DE]/20'
                }`}
              >
                Rammed Earth
              </button>
              <button
                onClick={() => setEnvelopeType('composite')}
                className={`py-2 text-[9px] font-mono uppercase tracking-tight rounded-sm transition cursor-pointer text-center border ${
                  envelopeType === 'composite' 
                    ? 'bg-[#F7F7F5] text-[#121212] border-[#F7F7F5] font-bold' 
                    : 'bg-[#121212] text-[#888888] border-[#E0E0DE]/10 hover:text-[#F7F7F5] hover:border-[#E0E0DE]/20'
                }`}
              >
                Fiber Composite
              </button>
              <button
                onClick={() => setEnvelopeType('double-glass')}
                className={`py-2 text-[9px] font-mono uppercase tracking-tight rounded-sm transition cursor-pointer text-center border ${
                  envelopeType === 'double-glass' 
                    ? 'bg-[#F7F7F5] text-[#121212] border-[#F7F7F5] font-bold' 
                    : 'bg-[#121212] text-[#888888] border-[#E0E0DE]/10 hover:text-[#F7F7F5] hover:border-[#E0E0DE]/20'
                }`}
              >
                Glazed Skin
              </button>
            </div>
            <span className="text-[8px] font-mono text-[#888888]/80 leading-normal">
              {envelopeType === 'shou-sugi' && 'Shou Sugi Ban charred wood cladding offers outstanding moisture barrier and natural insulation.'}
              {envelopeType === 'rammed-earth' && 'Earth pressed on site has virtually zero transport emissions and creates high-lag cooling walls.'}
              {envelopeType === 'composite' && 'Lightweight, modern insulated panels with moderate cost but standard polymer synthetic core.'}
              {envelopeType === 'double-glass' && 'Stunning visual transparency, optimizes daylight, but degrades R-value thermal capacity.'}
            </span>
          </div>

          {/* Parameter 4: Glazing & Solar Integration */}
          <div className="grid grid-cols-2 gap-3 bg-[#181818] p-3.5 border border-[#E0E0DE]/10 rounded-sm">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider flex items-center gap-1"><Thermometer size={12} /> GLAZING GRADE:</span>
              <select 
                value={glazingGrade} 
                onChange={(e) => setGlazingGrade(e.target.value as 'double' | 'triple-low-e')}
                className="bg-[#121212] text-[#F7F7F5] border border-[#E0E0DE]/10 rounded px-2 py-1 text-[9px] font-mono outline-none cursor-pointer hover:border-[#E0E0DE]/20"
              >
                <option value="double">Double-Pane Standard</option>
                <option value="triple-low-e">Triple-Pane Low-E</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider flex items-center gap-1"><Sun size={12} /> PV SOLAR ROOF:</span>
              <div className="flex items-center justify-between text-[9px] font-mono">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="10"
                  value={solarCoverage} 
                  onChange={(e) => setSolarCoverage(parseInt(e.target.value))}
                  className="w-2/3 accent-emerald-500 bg-[#E0E0DE]/10 h-1 rounded outline-none cursor-ew-resize"
                />
                <span className="text-[#F7F7F5] font-semibold">{solarCoverage}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Analytics Outputs (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-4 justify-between" id="bim-outputs-panel">
          
          {/* Main Embodied Carbon Graph Dashboard */}
          <div className="bg-[#181818] p-4 border border-[#E0E0DE]/10 rounded-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-widest block">EMBODIED & LIFETIME CARBON RATING</span>
                <span className="text-[9px] font-mono text-[#888888]">Calculated net lifecycle CO₂e load</span>
              </div>
              <div className="text-right">
                <span className={`text-base font-mono font-bold ${totalCarbonImpactTons <= 0 ? 'text-emerald-400' : 'text-amber-500'}`}>
                  {totalCarbonImpactTons <= 0 ? `${totalCarbonImpactTons} t` : `+${totalCarbonImpactTons} t`}
                </span>
                <span className="text-[8px] font-mono text-[#888888] block">CO₂e TOTAL FOOTPRINT</span>
              </div>
            </div>

            {/* Custom Responsive SVG Embodied Carbon Chart */}
            <div className="bg-[#121212] p-3 rounded border border-[#E0E0DE]/5 relative h-[140px] flex flex-col justify-end">
              
              {/* Grid Lines */}
              <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none opacity-10 px-10">
                <div className="border-b border-[#E0E0DE] w-full text-[8px] font-mono text-[#888888] pt-1 flex justify-between"><span></span><span>High Load</span></div>
                <div className="border-b border-[#E0E0DE] w-full text-[8px] font-mono text-[#888888] pt-1 flex justify-between"><span></span><span>Neutral</span></div>
                <div className="border-b border-[#E0E0DE] w-full text-[8px] font-mono text-[#888888] pt-1 flex justify-between"><span></span><span>Sequestration</span></div>
              </div>

              {/* Bar charts side-by-side: Industry Standard Concrete vs Architect's Modified Design */}
              <div className="relative flex items-end justify-around h-[100px] z-10 px-8">
                
                {/* Column 1: Industry Baseline */}
                <div className="flex flex-col items-center gap-1.5 w-16">
                  <div className="relative w-8 bg-red-900/40 border border-red-500/30 rounded-t-sm transition-all duration-300" style={{ height: '70px' }}>
                    <div className="absolute -top-4 inset-x-0 text-center font-mono text-[8px] text-[#888888] font-semibold">
                      +{industryBaselineTons} t
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-[#888888] uppercase text-center leading-tight">Industry Standard</span>
                </div>

                {/* Column 2: Selected Parametric Design */}
                <div className="flex flex-col items-center gap-1.5 w-16">
                  {totalCarbonImpactTons <= 0 ? (
                    /* Negative Sequestration Bar going downward */
                    <div className="relative w-8 bg-emerald-950/50 border border-emerald-400/40 rounded-b-sm transition-all duration-300 origin-top h-[35px]" style={{ height: `${Math.min(65, Math.abs(totalCarbonImpactTons) / 1.5)}px` }}>
                      <div className="absolute -bottom-4 inset-x-0 text-center font-mono text-[8px] text-emerald-400 font-semibold">
                        {totalCarbonImpactTons} t
                      </div>
                    </div>
                  ) : (
                    /* Positive Bar going upward */
                    <div className="relative w-8 bg-amber-950/40 border border-amber-500/40 rounded-t-sm transition-all duration-300 h-[35px]" style={{ height: `${Math.max(10, Math.min(85, (totalCarbonImpactTons / industryBaselineTons) * 70))}px` }}>
                      <div className="absolute -top-4 inset-x-0 text-center font-mono text-[8px] text-amber-400 font-semibold">
                        +{totalCarbonImpactTons} t
                      </div>
                    </div>
                  )}
                  <span className="text-[8px] font-mono text-emerald-400 font-semibold uppercase text-center leading-tight">Your Design</span>
                </div>
              </div>
            </div>

            {/* Comparison Highlights */}
            <div className="flex items-center justify-between font-mono text-[9px] bg-[#121212]/50 p-2 border border-[#E0E0DE]/5">
              <span className="text-[#888888]">EMBODIED EMISSION REDUCTION VS BASELINE:</span>
              {carbonSavingsPct >= 100 ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <TrendingDown size={12} />
                  CARBON NEGATIVE SEQUESTRATION ({carbonSavingsPct}% REDUCTION)
                </span>
              ) : carbonSavingsPct > 0 ? (
                <span className="text-[#f59e0b] flex items-center gap-1 font-bold">
                  <TrendingDown size={12} />
                  {carbonSavingsPct}% LOWER CARBON footprint
                </span>
              ) : (
                <span className="text-rose-500 flex items-center gap-1 font-bold">
                  <TrendingUp size={12} />
                  {Math.abs(carbonSavingsPct)}% HIGHER CARBON load
                </span>
              )}
            </div>
          </div>

          {/* Interactive Numerical Metrics Matrix */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Metric 1: Financial capital cost */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">EST. CAPITAL COST:</span>
                <span className="text-[#F7F7F5] font-bold text-xs mt-0.5">${calculatedCostPerSqFt} <span className="text-[8px] font-light text-[#888888]">/ sq ft</span></span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">CONTRACT:</span>
                <span className="text-[#F7F7F5] font-semibold">${(totalProjectCost).toLocaleString()}</span>
              </div>
            </div>

            {/* Metric 2: U-Value & Thermal Rating */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">ENVELOPE R-VALUE:</span>
                <span className="text-amber-400 font-bold text-xs mt-0.5">R-{totalEnvelopeRValue} <span className="text-[8px] font-light text-[#888888]">hr·ft²·F/Btu</span></span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">THERMAL EFF:</span>
                <span className="text-emerald-400 font-semibold">
                  {(1 / totalEnvelopeRValue).toFixed(3)} U-val
                </span>
              </div>
            </div>

            {/* Metric 3: Off-grid solar generation */}
            <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col justify-between font-mono">
              <div>
                <span className="text-[8px] text-[#888888] uppercase block">SOLAR PRODUCTION:</span>
                <span className="text-[#F7F7F5] font-bold text-xs mt-0.5">{annualGenerationMWh} <span className="text-[8px] font-light text-[#888888]">MWh / yr</span></span>
              </div>
              <div className="border-t border-[#E0E0DE]/10 pt-1.5 mt-2 flex justify-between items-center text-[9px]">
                <span className="text-[#888888]">ROOF COVERAGE:</span>
                <span className="text-[#f59e0b] font-semibold">{solarCoverage}%</span>
              </div>
            </div>
          </div>

          {/* Environmental Performance bar meters */}
          <div className="bg-[#181818] p-3 border border-[#E0E0DE]/10 rounded-sm flex flex-col gap-2.5">
            {/* Meter 1: Daylight Autonomy */}
            <div className="flex flex-col gap-1 font-mono text-[9px]">
              <div className="flex justify-between items-center">
                <span className="text-[#888888] uppercase">DAYLIGHT AUTONOMY RATING:</span>
                <span className="text-[#F7F7F5] font-semibold">{calculatedDaylightAutonomy}%</span>
              </div>
              <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden border border-[#E0E0DE]/5">
                <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${calculatedDaylightAutonomy}%` }} />
              </div>
            </div>

            {/* Meter 2: Net-Zero Operational self-sufficiency */}
            {/* Determined by solar power offset against climate-heating load */}
            {(() => {
              const annualConsumptionMWh = Math.round((profile.heatingLoadBase * activeArea * 10.76) / 10000);
              const selfSufficiencyPct = annualConsumptionMWh > 0
                ? Math.min(100, Math.round((annualGenerationMWh / annualConsumptionMWh) * 100))
                : 100;

              return (
                <div className="flex flex-col gap-1 font-mono text-[9px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#888888] uppercase">NET-ZERO OPERATION INDEX:</span>
                    <span className="text-emerald-400 font-semibold">{selfSufficiencyPct}% POWER OFF-GRID</span>
                  </div>
                  <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden border border-[#E0E0DE]/5">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${selfSufficiencyPct}%` }} />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Synthesizer summary box */}
          <div className="bg-[#121212] p-3 rounded border border-[#E0E0DE]/10 flex gap-2 font-mono text-[9px] leading-relaxed">
            <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-amber-400 font-bold uppercase">BIM INTEGRITY REPORT \ {projectName}</span>
              <p className="text-[#888888]">
                {frameType === 'timber' && 'Sourcing premium European cross-laminated timber sequestering atmospheric CO2.'}
                {frameType === 'concrete' && 'Warning: Double-wall self-consolidating architectural concrete triggers high kiln production emissions.'}
                {frameType === 'steel' && 'Structural structural steel delivers magnificent clear structural spans but carries high smelting thermal carbon.'}
                {' '}
                {envelopeType === 'shou-sugi' && 'The Shou Sugi Ban exterior skin yields highly durable resistance to rot without needing volatile oil compounds.'}
                {envelopeType === 'rammed-earth' && 'monolithic earthen masonry absorbs heat slowly through high-lag Arizona dry desert thermal inertia.'}
                {envelopeType === 'double-glass' && 'Intensive full-glazing increases interior HVAC cooling loads but minimizes artificial visual light requirements.'}
                {' '}
                {glazingGrade === 'triple-low-e' ? 'Triple Low-E argon-filled glazing ensures tight passive house R-values.' : 'Double-pane layouts are budget-friendly but leak solar heating during extreme nights.'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Action Footer tip */}
      <div className="border-t border-[#E0E0DE]/10 pt-3 mt-4 flex items-center justify-between font-mono text-[8px] text-[#888888] tracking-widest uppercase">
        <span>TWEAK MULTIPLIERS TO LIVE MODEL PERFORMANCE</span>
        <span className="text-emerald-500 flex items-center gap-1 font-semibold animate-pulse">
          <Award size={10} /> LEED Platinum Compliant Model Study
        </span>
      </div>

    </div>
  );
}
