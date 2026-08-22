/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Layers, Download, ZoomIn, ZoomOut, Loader2, AlertCircle } from 'lucide-react';
import { TechnicalDrawing } from '../types';

interface TechnicalDrawingViewerProps {
  drawing: TechnicalDrawing;
  projectTitle: string;
}

export default function TechnicalDrawingViewer({ drawing, projectTitle }: TechnicalDrawingViewerProps) {
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 80));
  const handleResetZoom = () => setZoomLevel(100);

  useEffect(() => {
    if (!drawing.svgUrl) {
      setSvgContent(null);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    fetch(drawing.svgUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load vector drawing (${res.status} ${res.statusText})`);
        }
        return res.text();
      })
      .then((data) => {
        if (isMounted) {
          setSvgContent(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error loading dynamic SVG drawing:', err);
          setLoadError(err.message || 'Failed to load drawing asset');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [drawing.svgUrl]);

  return (
    <div className="bg-[#121212] text-[#F7F7F5] rounded-sm p-6 border border-[#E0E0DE]/20 shadow-2xl overflow-hidden flex flex-col h-[580px] relative" id="cad-viewer">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0E0DE]/20 pb-4 mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#888888] bg-[#F7F7F5]/10 px-2 py-0.5 rounded-sm">
              {drawing.type}
            </span>
            <span className="text-xs font-mono text-[#888888]">
              {drawing.svgUrl ? 'Vector SVG | Dynamic Asset' : 'Scale 1:100 | Vector DWG'}
            </span>
          </div>
          <h4 className="text-md font-sans font-medium mt-1 text-[#F7F7F5]">{drawing.name}</h4>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-[#F7F7F5]/10 hover:bg-[#F7F7F5]/20 text-[#888888] hover:text-[#F7F7F5] rounded-sm transition cursor-pointer"
            title="Zoom Out"
            id="zoom-out-btn"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-xs font-mono text-[#888888] w-10 text-center">{zoomLevel}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-[#F7F7F5]/10 hover:bg-[#F7F7F5]/20 text-[#888888] hover:text-[#F7F7F5] rounded-sm transition cursor-pointer"
            title="Zoom In"
            id="zoom-in-btn"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={handleResetZoom}
            className="text-[10px] font-mono bg-[#F7F7F5]/10 hover:bg-[#F7F7F5]/20 text-[#888888] hover:text-[#F7F7F5] px-2 py-1.5 rounded-sm transition cursor-pointer"
            title="Reset Zoom"
            id="zoom-reset-btn"
          >
            100%
          </button>
          <div className="h-6 w-[1px] bg-[#E0E0DE]/20 mx-1"></div>
          <a
            href={drawing.svgUrl || '#'}
            download={drawing.svgUrl ? `${drawing.name.toLowerCase().replace(/\s+/g, '-')}.svg` : `${drawing.name}.dwg`}
            className="flex items-center gap-1.5 bg-[#F7F7F5]/10 hover:bg-[#F7F7F5]/20 text-[#888888] hover:text-[#F7F7F5] px-3 py-1.5 rounded-sm text-xs font-mono transition cursor-pointer"
            title="Export DWG/SVG"
            id="export-drawing-btn"
          >
            <Download size={13} />
            <span className="hidden md:inline">{drawing.svgUrl ? 'SVG' : 'DWG'}</span>
          </a>
        </div>
      </div>

      {/* Main Drafting Canvas Container */}
      <div className="flex-1 bg-[#121212] rounded-sm border border-[#E0E0DE]/20 relative overflow-hidden flex items-center justify-center p-4">
        {/* Dynamic style sheet to drive CAD layer visibility */}
        <style>{`
          #dynamic-svg-root .cad-grid,
          #dynamic-svg-root .cad-grid-layer,
          #dynamic-svg-root [data-layer="GRID"] {
            display: ${showGrid ? 'inline' : 'none'} !important;
          }
          #dynamic-svg-root .cad-dim,
          #dynamic-svg-root .cad-dim-layer,
          #dynamic-svg-root [data-layer="DIM"] {
            display: ${showDimensions ? 'inline' : 'none'} !important;
          }
          #dynamic-svg-root .cad-anno,
          #dynamic-svg-root .cad-anno-layer,
          #dynamic-svg-root [data-layer="ANNO"] {
            display: ${showAnnotations ? 'inline' : 'none'} !important;
          }
        `}</style>

        {/* Fine Architectural Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none transition-opacity duration-300" 
          style={{
            backgroundImage: showGrid 
              ? 'radial-gradient(circle, #404040 1px, transparent 1px), linear-gradient(to right, #262626 1px, transparent 1px), linear-gradient(to bottom, #262626 1px, transparent 1px)'
              : 'none',
            backgroundSize: '16px 16px, 80px 80px, 80px 80px',
            backgroundPosition: 'center center'
          }}
        />

        {/* Vector SVG Render Viewport */}
        <div 
          className="w-full h-full max-w-lg max-h-96 transition-all duration-300 ease-out flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {drawing.svgUrl ? (
            <div className="w-full h-full flex items-center justify-center relative">
              {isLoading && (
                <div className="flex flex-col items-center gap-3 text-[#888888]">
                  <Loader2 className="animate-spin text-[#3b82f6]" size={24} />
                  <span className="text-xs font-mono tracking-wider uppercase">Loading Architectural Vector Asset...</span>
                </div>
              )}
              {loadError && (
                <div className="flex flex-col items-center gap-3 text-[#ef4444] p-4 text-center">
                  <AlertCircle size={24} />
                  <span className="text-xs font-mono uppercase tracking-wider">{loadError}</span>
                  <span className="text-[10px] text-[#888888] font-mono">{drawing.svgUrl}</span>
                </div>
              )}
              {!isLoading && !loadError && svgContent && (
                <div
                  id="dynamic-svg-root"
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              )}
            </div>
          ) : (
            <>
              {drawing.svgType === 'site-plan' && (
                <svg viewBox="0 0 400 300" className="w-full h-full text-neutral-400 font-mono select-none" id="svg-site-plan">
                  {/* Site contour topo lines */}
                  <path d="M-50,60 C100,50 200,90 450,80" fill="none" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="3,3" />
              <path d="M-50,110 C120,90 220,140 450,120" fill="none" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="3,3" />
              <path d="M-50,160 C140,130 240,190 450,170" fill="none" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="3,3" />
              <path d="M-50,210 C160,180 260,240 450,220" fill="none" stroke="#333" strokeWidth="1" />
              <path d="M-50,260 C180,230 280,290 450,270" fill="none" stroke="#333" strokeWidth="1.5" />

              {/* Fjord Water shoreline outline */}
              <path d="M-50,30 Q150,10 450,40" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.4" />
              {showAnnotations && <text x="20" y="25" fill="#3b82f6" fillOpacity="0.6" fontSize="8">FJORD WATERLINE ±0.00</text>}

              {/* Property Setback limits */}
              {showDimensions && (
                <rect x="30" y="50" width="340" height="220" fill="none" stroke="#4a1d1d" strokeWidth="1" strokeDasharray="4,4" />
              )}
              {showDimensions && showAnnotations && (
                <text x="35" y="62" fill="#ef4444" fillOpacity="0.5" fontSize="7">PROPERTY SETBACK BORDER</text>
              )}

              {/* Dotted trees */}
              <circle cx="80" cy="130" r="15" fill="none" stroke="#2e3a2e" strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="80" cy="130" r="2" fill="#2e3a2e" />
              <circle cx="320" cy="230" r="22" fill="none" stroke="#2e3a2e" strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="320" cy="230" r="2" fill="#2e3a2e" />
              {showAnnotations && (
                <>
                  <text x="75" y="112" fill="#6b7280" fontSize="7">PINUS SYLVESTRIS</text>
                  <text x="305" y="202" fill="#6b7280" fontSize="7">EXTG. OAK CANOPY</text>
                </>
              )}

              {/* Building Footprint (3 interlocked pavilions) */}
              <g className="transition-all hover:opacity-90 cursor-pointer">
                {/* Pavilion A (Main) */}
                <rect x="130" y="110" width="110" height="50" fill="#1e1e1e" stroke="#ffffff" strokeWidth="1.5" />
                {/* Pavilion B (Master) */}
                <rect x="220" y="145" width="60" height="40" fill="#1a1a1a" stroke="#ffffff" strokeWidth="1.5" />
                {/* Pavilion C (Guest) */}
                <rect x="100" y="85" width="45" height="35" fill="#1a1a1a" stroke="#ffffff" strokeWidth="1.5" />
                {/* Glass breezeway connector links */}
                <line x1="135" y1="110" x2="135" y2="120" stroke="#3b82f6" strokeWidth="2" />
                <line x1="230" y1="145" x2="230" y2="160" stroke="#3b82f6" strokeWidth="2" />
              </g>

              {/* North Arrow and Scale */}
              <g transform="translate(360, 95)" stroke="#ffffff" strokeWidth="1" fill="none">
                <circle cx="0" cy="0" r="12" stroke="#525252" />
                <line x1="0" y1="8" x2="0" y2="-12" />
                <polygon points="0,-12 -3,-4 3,-4" fill="#ffffff" stroke="none" />
                <text x="-3" y="18" fill="#ffffff" stroke="none" fontSize="8" fontWeight="bold">N</text>
              </g>

              {/* Annotations */}
              {showAnnotations && (
                <g fill="#a3a3a3" fontSize="8">
                  <text x="155" y="138" fill="#ffffff" fontWeight="medium">PAVILION A (LIVING)</text>
                  <text x="225" y="170">PAVILION B</text>
                  <text x="104" y="105" fontSize="7">PAVILION C</text>
                  <text x="140" y="240" fill="#737373">GRANITE BEDROCK</text>
                </g>
              )}

              {/* Dimension indicators */}
              {showDimensions && (
                <g stroke="#737373" strokeWidth="0.5" fill="#737373" fontSize="7">
                  {/* Horiz line to edge */}
                  <line x1="30" y1="260" x2="130" y2="260" />
                  <line x1="30" y1="257" x2="30" y2="263" />
                  <line x1="130" y1="257" x2="130" y2="263" />
                  <text x="65" y="255" textAnchor="middle">12.50m (Setback)</text>

                  {/* Horiz Pavilion width */}
                  <line x1="130" y1="70" x2="240" y2="70" />
                  <line x1="130" y1="67" x2="130" y2="73" />
                  <line x1="240" y1="67" x2="240" y2="73" />
                  <text x="185" y="65" textAnchor="middle">15.00m</text>
                </g>
              )}
            </svg>
          )}

          {drawing.svgType === 'floor-plan' && (
            <svg viewBox="0 0 400 300" className="w-full h-full text-neutral-400 font-mono select-none" id="svg-floor-plan">
              {/* Engineering Structural grid columns */}
              {showGrid && (
                <g stroke="#262626" strokeWidth="0.5" strokeDasharray="5,5">
                  <line x1="60" y1="10" x2="60" y2="280" />
                  <line x1="150" y1="10" x2="150" y2="280" />
                  <line x1="250" y1="10" x2="250" y2="280" />
                  <line x1="340" y1="10" x2="340" y2="280" />

                  <line x1="20" y1="60" x2="380" y2="60" />
                  <line x1="20" y1="140" x2="380" y2="140" />
                  <line x1="20" y1="220" x2="380" y2="220" />
                </g>
              )}

              {/* Grid Bubbles */}
              {showGrid && showAnnotations && (
                <g fill="#737373" fontSize="8" textAnchor="middle">
                  <circle cx="60" cy="288" r="6" fill="#1f1f1f" stroke="#404040" />
                  <text x="60" y="291">A</text>
                  <circle cx="150" cy="288" r="6" fill="#1f1f1f" stroke="#404040" />
                  <text x="150" y="291">B</text>
                  <circle cx="250" cy="288" r="6" fill="#1f1f1f" stroke="#404040" />
                  <text x="250" y="291">C</text>
                  <circle cx="340" cy="288" r="6" fill="#1f1f1f" stroke="#404040" />
                  <text x="340" y="291">D</text>

                  <circle cx="10" cy="60" r="6" fill="#1f1f1f" stroke="#404040" />
                  <text x="10" y="63">1</text>
                  <circle cx="10" cy="140" r="6" fill="#1f1f1f" stroke="#404040" />
                  <text x="10" y="143">2</text>
                  <circle cx="10" cy="220" r="6" fill="#1f1f1f" stroke="#404040" />
                  <text x="10" y="223">3</text>
                </g>
              )}

              {/* Outer Deck patio wood hatch pattern */}
              <rect x="50" y="50" width="300" height="180" fill="none" stroke="#222" strokeWidth="1" />
              <g stroke="#1a1a1a" strokeWidth="0.5">
                <line x1="50" y1="210" x2="350" y2="210" />
                <line x1="50" y1="215" x2="350" y2="215" />
                <line x1="50" y1="220" x2="350" y2="220" />
                <line x1="50" y1="225" x2="350" y2="225" />
              </g>

              {/* Concrete thick core walls */}
              <g stroke="#ffffff" strokeWidth="2" fill="none">
                {/* External perimeter of heated spaces */}
                <rect x="80" y="80" width="240" height="110" stroke="#ffffff" strokeWidth="2.5" fill="#171717" />
                {/* Interior divisions */}
                <line x1="170" y1="80" x2="170" y2="190" strokeWidth="2" />
                <line x1="250" y1="80" x2="250" y2="140" strokeWidth="1.5" />
                <line x1="250" y1="140" x2="320" y2="140" strokeWidth="1.5" />
              </g>

              {/* Glazed windows - single blue stroke */}
              <g stroke="#3b82f6" strokeWidth="1.5">
                <line x1="100" y1="80" x2="150" y2="80" />
                <line x1="190" y1="80" x2="230" y2="80" />
                <line x1="80" y1="110" x2="80" y2="160" />
                <line x1="320" y1="100" x2="320" y2="170" />
              </g>

              {/* Doors swinging curves */}
              <g stroke="#a3a3a3" strokeWidth="0.75" fill="none">
                {/* Main entrance swing */}
                <path d="M170,120 A20,20 0 0,1 190,140" />
                <line x1="170" y1="120" x2="170" y2="140" />
                {/* Room entry swing */}
                <path d="M250,110 A15,15 0 0,0 235,125" />
                <line x1="250" y1="110" x2="235" y2="110" />
              </g>

              {/* Interactive Rooms (hover/click) */}
              <g opacity="0.3">
                <rect 
                  x="85" y="85" width="80" height="100" 
                  fill={activeRoom === 'living' ? '#3b82f6' : 'transparent'} 
                  className="transition cursor-pointer"
                  onMouseEnter={() => setActiveRoom('living')}
                  onMouseLeave={() => setActiveRoom(null)}
                />
                <rect 
                  x="175" y="85" width="70" height="100" 
                  fill={activeRoom === 'kitchen' ? '#3b82f6' : 'transparent'} 
                  className="transition cursor-pointer"
                  onMouseEnter={() => setActiveRoom('kitchen')}
                  onMouseLeave={() => setActiveRoom(null)}
                />
                <rect 
                  x="255" y="85" width="60" height="50" 
                  fill={activeRoom === 'bed' ? '#3b82f6' : 'transparent'} 
                  className="transition cursor-pointer"
                  onMouseEnter={() => setActiveRoom('bed')}
                  onMouseLeave={() => setActiveRoom(null)}
                />
              </g>

              {/* Furnishings outline (Minimalist) */}
              <g stroke="#404040" strokeWidth="1" fill="none">
                {/* Dining table & chairs */}
                <rect x="200" y="110" width="22" height="35" rx="2" />
                <circle cx="192" cy="118" r="2" />
                <circle cx="192" cy="128" r="2" />
                <circle cx="192" cy="138" r="2" />
                <circle cx="230" cy="118" r="2" />
                <circle cx="230" cy="128" r="2" />
                <circle cx="230" cy="138" r="2" />

                {/* Lounge sofa */}
                <rect x="95" y="140" width="50" height="20" rx="1" />
                <rect x="105" y="130" width="30" height="10" rx="1" />
              </g>

              {/* Annotations */}
              {showAnnotations && (
                <g fill="#a3a3a3" fontSize="8" pointerEvents="none">
                  <text x="125" y="105" textAnchor="middle" fill="#fff" fontWeight="bold">01. LIVING AREA</text>
                  <text x="125" y="115" textAnchor="middle" fill="#737373" fontSize="6">32.4 m²</text>

                  <text x="210" y="95" textAnchor="middle" fill="#fff">02. KITCHEN</text>
                  <text x="210" y="103" textAnchor="middle" fill="#737373" fontSize="6">21.5 m²</text>

                  <text x="285" y="110" textAnchor="middle" fill="#fff">03. BEDROOM</text>
                  <text x="285" y="118" textAnchor="middle" fill="#737373" fontSize="6">12.0 m²</text>

                  <text x="200" y="222" textAnchor="middle" fill="#a3a3a3">04. OUTDOOR WRAP-AROUND TERRACE</text>
                </g>
              )}

              {/* Dynamic Room Hover Tooltip inside SVG */}
              {activeRoom && showAnnotations && (
                <g transform="translate(140, 240)">
                  <rect x="0" y="0" width="120" height="20" rx="3" fill="#2563eb" />
                  <text x="60" y="12" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" className="uppercase font-mono">
                    Active: {activeRoom} Space Highlight
                  </text>
                </g>
              )}

              {/* Dimension lines */}
              {showDimensions && (
                <g stroke="#737373" strokeWidth="0.5" fill="#737373" fontSize="7">
                  {/* Outer Top dimension */}
                  <line x1="80" y1="40" x2="320" y2="40" />
                  <line x1="80" y1="37" x2="80" y2="43" />
                  <line x1="320" y1="37" x2="320" y2="43" />
                  <text x="200" y="35" textAnchor="middle">24.00m (Structural Span)</text>

                  {/* Individual Left rooms */}
                  <line x1="50" y1="80" x2="50" y2="190" />
                  <line x1="47" y1="80" x2="53" y2="80" />
                  <line x1="47" y1="190" x2="53" y2="190" />
                  <text x="42" y="140" textAnchor="middle" transform="rotate(-90, 42, 140)">11.00m</text>
                </g>
              )}
            </svg>
          )}

          {drawing.svgType === 'section' && (
            <svg viewBox="0 0 400 300" className="w-full h-full text-neutral-400 font-mono select-none" id="svg-cross-section">
              {/* Ground bedrock profile */}
              <path d="M-50,240 L100,240 L220,265 L320,250 L450,270 L450,310 L-50,310 Z" fill="#1c1c1c" stroke="#2a2a2a" strokeWidth="1" />
              <path d="M-50,240 L100,240 L220,265 L320,250 L450,270" fill="none" stroke="#a3a3a3" strokeWidth="2" />

              {/* Deep concrete piers anchor */}
              <rect x="80" y="240" width="20" height="30" fill="#262626" stroke="#525252" strokeWidth="1" />
              <rect x="180" y="250" width="20" height="25" fill="#262626" stroke="#525252" strokeWidth="1" />
              <rect x="290" y="250" width="20" height="25" fill="#262626" stroke="#525252" strokeWidth="1" />

              {/* Sub-floor joists */}
              <rect x="60" y="225" width="280" height="15" fill="#171717" stroke="#ffffff" strokeWidth="1.5" />
              {showAnnotations && <text x="140" y="235" fill="#737373" fontSize="6">INSULATED SUB-STRUCTURE CORE</text>}

              {/* Columns support structure */}
              <line x1="80" y1="225" x2="80" y2="120" stroke="#ffffff" strokeWidth="3" />
              <line x1="200" y1="235" x2="200" y2="110" stroke="#ffffff" strokeWidth="3" />
              <line x1="320" y1="235" x2="320" y2="135" stroke="#ffffff" strokeWidth="3" />

              {/* Concrete mass floor topping */}
              <line x1="60" y1="225" x2="340" y2="225" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.6" />
              {showAnnotations && <text x="65" y="218" fill="#ef4444" fontSize="6">HYDRONIC HEATING LOOP</text>}

              {/* Roof system structure */}
              {/* Double cantilevers slanted */}
              <polygon points="40,110 200,95 360,115 360,130 200,115 40,125" fill="#1e1e1e" stroke="#ffffff" strokeWidth="1.5" />

              {/* Glazed envelopes side-profiles */}
              <rect x="78" y="120" width="4" height="105" fill="#3b82f6" fillOpacity="0.4" stroke="#3b82f6" strokeWidth="0.5" />
              <rect x="318" y="135" width="4" height="100" fill="#3b82f6" fillOpacity="0.4" stroke="#3b82f6" strokeWidth="0.5" />

              {/* Summer vs Winter Sun angles */}
              {showDimensions && (
                <g stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="3,3" fill="#f59e0b">
                  {/* Summer Sun (Blocked) */}
                  <line x1="390" y1="30" x2="270" y2="150" />
                  <polygon points="270,150 274,144 278,148" />
                  <text x="350" y="60" fontSize="7" fill="#f59e0b">SUMMER SOLAR ANGLE (62°)</text>

                  {/* Winter Sun (Deep Penetration) */}
                  <line x1="390" y1="90" x2="150" y2="225" />
                  <polygon points="150,225 156,220 158,224" />
                  <text x="280" y="175" fontSize="7" fill="#f59e0b">WINTER PASSIVE ANGLE (24°)</text>
                </g>
              )}

              {/* Air ventilation current path */}
              <path d="M70,200 Q150,170 300,150" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,4" />
              <polygon points="300,150 293,148 296,154" fill="#06b6d4" />
              {showAnnotations && <text x="110" y="165" fill="#06b6d4" fontSize="7">CROSS-BREEZE INDUCTION</text>}

              {/* Dimension heights */}
              {showDimensions && (
                <g stroke="#737373" strokeWidth="0.5" fill="#737373" fontSize="7">
                  {/* Floor to Ceiling height */}
                  <line x1="340" y1="125" x2="340" y2="235" />
                  <line x1="337" y1="125" x2="343" y2="125" />
                  <line x1="337" y1="235" x2="343" y2="235" />
                  <text x="348" y="185" textAnchor="start">3.10m CLEAR HT.</text>

                  {/* Cantilever roof projection */}
                  <line x1="40" y1="95" x2="80" y2="95" />
                  <line x1="40" y1="92" x2="40" y2="98" />
                  <line x1="80" y1="92" x2="80" y2="98" />
                  <text x="60" y="88" textAnchor="middle">1.80m OVERHANG</text>
                </g>
              )}

              {/* Annotations */}
              {showAnnotations && (
                <g fill="#a3a3a3" fontSize="8">
                  <text x="45" y="145">SHOU SUGI BAN CANOPY</text>
                  <text x="140" y="145" fill="#ffffff">MAIN LIVING SPACE</text>
                  <text x="210" y="278" fill="#737373">CHARRED FOUNDATION PIER</text>
                  <text x="10" y="260">NATURAL FJORD SLOPE</text>
                </g>
              )}
            </svg>
          )}

          {drawing.svgType === 'axonometric' && (
            <svg viewBox="0 0 400 300" className="w-full h-full text-neutral-400 font-mono select-none" id="svg-axonometric">
              {/* Isometrical reference plane */}
              {showGrid && (
                <g stroke="#262626" strokeWidth="0.5">
                  <line x1="200" y1="20" x2="50" y2="120" />
                  <line x1="200" y1="20" x2="350" y2="120" />
                  <line x1="50" y1="120" x2="200" y2="220" />
                  <line x1="350" y1="120" x2="200" y2="220" />

                  <line x1="200" y1="100" x2="50" y2="200" />
                  <line x1="200" y1="100" x2="350" y2="200" />
                  <line x1="50" y1="200" x2="200" y2="300" />
                  <line x1="350" y1="200" x2="200" y2="300" />
                </g>
              )}

              {/* EXPLODED LAYER 1: ROOF STRUCTURE (Offset High) */}
              <g transform="translate(0, -60)" stroke="#ffffff" strokeWidth="1" fill="none">
                {/* Roof Slab */}
                <polygon points="200,60 110,105 200,150 290,105" fill="#1c1c1c" fillOpacity="0.8" stroke="#ffffff" strokeWidth="1.2" />
                <polygon points="200,55 110,100 200,145 290,100" fill="#2a2a2a" fillOpacity="0.6" stroke="#ffffff" strokeWidth="1" />
                {/* Connect top edge lines */}
                <line x1="200" y1="55" x2="200" y2="60" />
                <line x1="110" y1="100" x2="110" y2="105" />
                <line x1="290" y1="100" x2="290" y2="105" />
                <line x1="200" y1="145" x2="200" y2="150" />

                {showAnnotations && <text x="210" y="90" fill="#ffffff" fontSize="8" fontWeight="bold">01. PREFAB TIMBER ROOF DIAPHRAGM</text>}
              </g>

              {/* Exploded dotted alignment connectors */}
              <g stroke="#3b82f6" strokeWidth="0.75" strokeDasharray="3,3" opacity="0.6">
                <line x1="110" y1="40" x2="110" y2="155" />
                <line x1="290" y1="40" x2="290" y2="155" />
                <line x1="200" y1="85" x2="200" y2="200" />
                <line x1="200" y1="0" x2="200" y2="115" />
              </g>

              {/* EXPLODED LAYER 2: MASSING / GLAZING WRAP (Offset Middle) */}
              <g transform="translate(0, 0)" stroke="#ffffff" strokeWidth="1" fill="none">
                {/* Glass Perimeter Walls (Isometric projection) */}
                <polygon points="200,120 120,160 200,200 280,160" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.8" />
                {/* Solid core segments inside */}
                <polygon points="170,145 150,155 180,170 200,160" fill="#222" stroke="#ffffff" />
                <line x1="170" y1="145" x2="170" y2="175" strokeWidth="1" />
                <line x1="150" y1="155" x2="150" y2="185" strokeWidth="1" />
                <line x1="200" y1="160" x2="200" y2="190" strokeWidth="1" />

                {showAnnotations && <text x="290" y="155" fill="#a3a3a3" fontSize="8">02. PERFORMANCE GLAZING & BOARD CORES</text>}
              </g>

              {/* Connectors Middle to Ground */}
              <g stroke="#3b82f6" strokeWidth="0.75" strokeDasharray="3,3" opacity="0.6">
                <line x1="120" y1="160" x2="120" y2="215" />
                <line x1="280" y1="160" x2="280" y2="215" />
                <line x1="200" y1="200" x2="200" y2="255" />
              </g>

              {/* EXPLODED LAYER 3: CONCRETE FOUNDATION SLAB (Offset Low) */}
              <g transform="translate(0, 55)" stroke="#ffffff" strokeWidth="1" fill="none">
                {/* Solid concrete base */}
                <polygon points="200,165 110,210 200,255 290,210" fill="#1a1a1a" stroke="#a3a3a3" strokeWidth="1" />
                <polygon points="200,160 110,205 200,250 290,205" fill="#333" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="200" y1="250" x2="200" y2="255" strokeWidth="1.5" />
                <line x1="110" y1="205" x2="110" y2="210" strokeWidth="1.5" />
                <line x1="290" y1="205" x2="290" y2="210" strokeWidth="1.5" />

                {showAnnotations && <text x="210" y="235" fill="#a3a3a3" fontSize="8">03. CONCRETE HEAVY SLAB ON BEDROCK</text>}
              </g>
            </svg>
          )}
        </>
      )}
    </div>
      </div>

      {/* Layer Control Dashboard Panel */}
      <div className="mt-4 border-t border-[#E0E0DE]/20 pt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-[#888888]">
          <Layers size={14} className="text-[#888888]" />
          <span className="text-[10px] font-mono tracking-wider uppercase">DRAFTING LAYERS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono transition-colors cursor-pointer ${
              showGrid 
                ? 'bg-[#F7F7F5] text-[#121212] border border-[#E0E0DE]' 
                : 'bg-[#121212] text-[#888888] border border-transparent hover:text-[#F7F7F5]'
            }`}
            id="toggle-grid-btn"
          >
            {showGrid ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>Grid.dwg</span>
          </button>

          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono transition-colors cursor-pointer ${
              showDimensions 
                ? 'bg-[#F7F7F5] text-[#121212] border border-[#E0E0DE]' 
                : 'bg-[#121212] text-[#888888] border border-transparent hover:text-[#F7F7F5]'
            }`}
            id="toggle-dimensions-btn"
          >
            {showDimensions ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>Dimensions.dwg</span>
          </button>

          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono transition-colors cursor-pointer ${
              showAnnotations 
                ? 'bg-[#F7F7F5] text-[#121212] border border-[#E0E0DE]' 
                : 'bg-[#121212] text-[#888888] border border-transparent hover:text-[#F7F7F5]'
            }`}
            id="toggle-annotations-btn"
          >
            {showAnnotations ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>Labels.dwg</span>
          </button>
        </div>
      </div>
    </div>
  );
}
