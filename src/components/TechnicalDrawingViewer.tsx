import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Layers, Download, ZoomIn, ZoomOut, Loader2, AlertCircle, Sun, Moon, Move, Ruler, Check } from 'lucide-react';
import { TechnicalDrawing } from '../types';

interface RoomMetadata {
  name: string;
  dimensions?: string;
  area?: string;
  category?: string;
  notes?: string;
}

const ROOM_DATABASE: Record<string, RoomMetadata> = {
  'GREAT ROOM': { name: 'Great Room', dimensions: "17'0\" × 17'8\"", area: '300 sq ft', category: 'Living & Dining' },
  'MASTER': { name: 'Master Suite', dimensions: "13'8\" × 14'0\"", area: '191 sq ft', category: 'Primary Suite' },
  'KITCHEN': { name: 'Gourmet Kitchen', dimensions: "13'0\" × 14'2\"", area: '184 sq ft', category: 'Culinary Area' },
  '2 CAR GARAGE': { name: 'Two-Car Garage', dimensions: "21'2\" × 20'10\"", area: '441 sq ft', category: 'Vehicle & Utility' },
  'BEDROOM 2': { name: 'Guest Bedroom 2', dimensions: "13'8\" × 10'10\"", area: '148 sq ft', category: 'Secondary Suite' },
  'BEDROOM 3': { name: 'Guest Bedroom 3', dimensions: "12'4\" × 10'10\"", area: '133 sq ft', category: 'Secondary Suite' },
  'DECK': { name: 'Cantilevered Deck', dimensions: "11'1\" × 11'8\"", area: '129 sq ft', category: 'Outdoor Living' },
  'ENTRY': { name: 'Main Entry & Porch', dimensions: "8'8\" × 10'5\"", area: '90 sq ft', category: 'Circulation' },
  'UTIL.': { name: 'Utility & Laundry', dimensions: "7'0\" × 6'7\"", area: '46 sq ft', category: 'Service' },
  'Pantry': { name: 'Pantry', dimensions: "5'2\" × 6'0\"", area: '31 sq ft', category: 'Storage' },
  'W.I.C.': { name: 'Walk-In Closet', dimensions: "8'1\" × 2'6\"", area: '20 sq ft', category: 'Wardrobe' },
  'BATH': { name: 'Ensuite Bath & W.I.C.', dimensions: "12'4\" × 14'0\"", area: '172 sq ft', category: 'Sanitary & Wardrobe' },
  'TOIL.': { name: 'Powder Room', dimensions: "5'0\" × 5'7\"", area: '28 sq ft', category: 'Sanitary' },
  'COVERED': { name: 'Covered Front Porch', dimensions: "7'2\" × 4'4\"", area: '31 sq ft', category: 'Outdoor Transition' },
  'PORCH': { name: 'Covered Front Porch', dimensions: "7'2\" × 4'4\"", area: '31 sq ft', category: 'Outdoor Transition' }
};

interface QuickRoomChip {
  id: string;
  name: string;
  pan: { x: number; y: number };
  zoom: number;
}

const QUICK_ROOM_CHIPS: QuickRoomChip[] = [
  { id: 'all', name: 'Full Plan', pan: { x: 0, y: 0 }, zoom: 100 },
  { id: 'great-room', name: 'Great Room', pan: { x: 90, y: 110 }, zoom: 145 },
  { id: 'master', name: 'Master Suite', pan: { x: 260, y: 120 }, zoom: 145 },
  { id: 'kitchen', name: 'Gourmet Kitchen', pan: { x: -60, y: 70 }, zoom: 155 },
  { id: 'garage', name: '2-Car Garage', pan: { x: -20, y: -90 }, zoom: 135 },
  { id: 'deck', name: 'Cantilevered Deck', pan: { x: -140, y: 120 }, zoom: 155 },
  { id: 'bed2', name: 'Bedrooms 2 & 3', pan: { x: 240, y: -20 }, zoom: 140 },
];

function formatArchitecturalDistance(inches: number): string {
  if (!inches || isNaN(inches)) return "0'0\"";
  const feet = Math.floor(inches / 12);
  const remInches = inches % 12;
  const wholeInches = Math.floor(remInches);
  const frac = remInches - wholeInches;
  let fracStr = "";
  if (frac >= 0.875) {
    return `${feet}'-${wholeInches + 1}"`;
  } else if (frac >= 0.625) {
    fracStr = " ¾";
  } else if (frac >= 0.375) {
    fracStr = " ½";
  } else if (frac >= 0.125) {
    fracStr = " ¼";
  }
  return `${feet}'-${wholeInches}${fracStr}"`;
}

interface TechnicalDrawingViewerProps {
  drawing: TechnicalDrawing;
  projectTitle: string;
}

export default function TechnicalDrawingViewer({ drawing, projectTitle }: TechnicalDrawingViewerProps) {
  const [showGrid, setShowGrid] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [viewPreset, setViewPreset] = useState<'presentation' | 'technical'>('presentation');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Interactive CAD Pan & Zoom state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Spatial Inspection Hover HUD & Layer Spotlight
  const [hoveredHUD, setHoveredHUD] = useState<{
    title: string;
    dimensions?: string;
    area?: string;
    category?: string;
    notes?: string;
    x: number;
    y: number;
  } | null>(null);
  const [spotlightLayer, setSpotlightLayer] = useState<'grid' | 'dim' | 'anno' | null>(null);

  // Quick-Jump and Caliper Tool states
  const [activeRoomChip, setActiveRoomChip] = useState<string>('all');
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measureP1, setMeasureP1] = useState<{ x: number; y: number } | null>(null);
  const [measureP2, setMeasureP2] = useState<{ x: number; y: number } | null>(null);
  const [isMeasureLocked, setIsMeasureLocked] = useState<boolean>(false);

  // Persistent Selected Room Spec Card
  const [selectedRoomCard, setSelectedRoomCard] = useState<{
    id: string;
    num: string;
    name: string;
    dimensions: string;
    area: string;
    category: string;
    features: string[];
  } | null>(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 300));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 40));
  const handleResetZoom = () => {
    setZoomLevel(100);
    setPan({ x: 0, y: 0 });
    setActiveRoomChip('all');
    setSelectedRoomCard(null);
    setHoveredHUD(null);
    setMeasureP1(null);
    setMeasureP2(null);
    setIsMeasureLocked(false);
    document.querySelectorAll('#dynamic-svg-root .cad-room-zone, #dynamic-svg-root .cad-room-badge-group').forEach((el) => el.classList.remove('active'));
  };

  const handleRoomSelect = (roomId: string) => {
    if (roomId === 'all') {
      handleResetZoom();
      return;
    }

    const chip = QUICK_ROOM_CHIPS.find((c) => c.id === roomId);
    if (chip) {
      setActiveRoomChip(roomId);
      setPan(chip.pan);
      setZoomLevel(chip.zoom);
    }

    // Highlight room zone & badge in SVG
    document.querySelectorAll('#dynamic-svg-root .cad-room-zone').forEach((el) => {
      if (el.id === `zone-${roomId}`) el.classList.add('active');
      else el.classList.remove('active');
    });

    document.querySelectorAll('#dynamic-svg-root .cad-room-badge-group').forEach((el) => {
      if (el.id === `badge-${roomId}`) el.classList.add('active');
      else el.classList.remove('active');
    });

    const zoneMap: Record<string, { num: string; name: string; dim: string; area: string; cat: string; feat: string[] }> = {
      'great-room': { num: '02', name: 'Great Room', dim: "17'0\" × 17'8\"", area: '300 SQ FT', cat: 'Primary Living & Social Core', feat: ['Open-concept layout', 'South-facing passive solar gain', 'Direct timber deck connection'] },
      'master': { num: '07', name: 'Master Suite', dim: "13'8\" × 14'0\"", area: '191 SQ FT', cat: 'Primary Bedroom Suite', feat: ['Private ensuite access', 'Integrated walk-in wardrobe', 'Double-glazed daylight window'] },
      'kitchen': { num: '04', name: 'Gourmet Kitchen', dim: "13'0\" × 14'2\"", area: '184 SQ FT', cat: 'Culinary & Prep Zone', feat: ['Custom island millwork', 'Walk-in pantry access', 'Quartz countertop prep'] },
      'garage': { num: '01', name: 'Two-Car Garage', dim: "21'2\" × 20'10\"", area: '441 SQ FT', cat: 'Vehicle & Utility Storage', feat: ['Fire-rated 20-min door', 'Dual-vehicle clearance', 'Integrated mechanical closet'] },
      'deck': { num: '05', name: 'Cantilevered Deck', dim: "11'1\" × 11'8\"", area: '129 SQ FT', cat: 'Outdoor Living Terrace', feat: ['Charred cedar planking', 'Panoramic valley vista', 'Covered overhang protection'] },
      'bed2': { num: '09', name: 'Guest Bedroom 2', dim: "13'8\" × 10'10\"", area: '148 SQ FT', cat: 'Secondary Living Suite', feat: ['Full built-in wardrobe', 'North-west daylight aspect', 'Acoustically isolated partition'] },
      'bed3': { num: '10', name: 'Guest Bedroom 3', dim: "12'4\" × 10'10\"", area: '133 SQ FT', cat: 'Secondary Living Suite', feat: ['Built-in closet', 'Optimal natural ventilation', 'Hardwood flooring'] },
      'master-bath': { num: '08', name: 'Ensuite Bath & W.I.C.', dim: "12'4\" × 14'0\"", area: '172 SQ FT', cat: 'Primary Sanitary Suite', feat: ['Dual vanity fixtures', 'Walk-in shower enclosure', 'Full dressing room'] },
      'dining': { num: '03', name: 'Dining Room', dim: "13'0\" × 10'11\"", area: '142 SQ FT', cat: 'Formal Dining Area', feat: ['Adjacent to kitchen island', 'Direct garden views', 'Custom pendant lighting'] },
      'entry': { num: '06', name: 'Main Entry & Porch', dim: "8'8\" × 10'5\"", area: '90 SQ FT', cat: 'Circulation & Draft Airlock', feat: ['Covered timber porch', 'Draft airlock vestibule', 'Integrated coat storage'] }
    };

    const details = zoneMap[roomId];
    if (details) {
      setSelectedRoomCard({
        id: roomId,
        num: details.num,
        name: details.name,
        dimensions: details.dim,
        area: details.area,
        category: details.cat,
        features: details.feat
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    if (isMeasuring) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (!measureP1 || isMeasureLocked) {
        setMeasureP1({ x: clickX, y: clickY });
        setMeasureP2({ x: clickX, y: clickY });
        setIsMeasureLocked(false);
      } else {
        setMeasureP2({ x: clickX, y: clickY });
        setIsMeasureLocked(true);
      }
      return;
    }

    const target = e.target as HTMLElement;

    // Check if clicked directly on an embedded room badge or zone polygon
    const badge = target.closest('.cad-room-badge-group') as SVGElement | null;
    if (badge) {
      const roomId = badge.getAttribute('data-room-id');
      if (roomId) {
        handleRoomSelect(roomId);
        return;
      }
    }

    const roomZone = target.closest('.cad-room-zone') as SVGPolygonElement | null;
    if (roomZone) {
      const roomId = roomZone.getAttribute('data-room-id');
      if (roomId) {
        handleRoomSelect(roomId);
        return;
      }
    }

    setIsDragging(true);
    setHoveredHUD(null);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    if (isMeasuring && measureP1 && !isMeasureLocked) {
      setMeasureP2({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      return;
    }

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    const target = e.target as HTMLElement;

    // 1. Check if hovering directly on an architectural room zone polygon
    const roomZone = target.closest('.cad-room-zone') as SVGPolygonElement | null;
    if (roomZone) {
      const roomName = roomZone.getAttribute('data-room-name') || '';
      const dim = roomZone.getAttribute('data-dim') || '';
      const area = roomZone.getAttribute('data-area') || '';

      // Activate zone class
      document.querySelectorAll('#dynamic-svg-root .cad-room-zone').forEach((el) => {
        if (el === roomZone) el.classList.add('active');
        else el.classList.remove('active');
      });

      const dbData = Object.values(ROOM_DATABASE).find((r) => r.name.toLowerCase() === roomName.toLowerCase());

      setHoveredHUD({
        title: roomName || 'Architectural Space',
        dimensions: dim || dbData?.dimensions,
        area: area || dbData?.area,
        category: dbData?.category || 'Designated Living Area',
        notes: dbData?.notes || 'Custom architectural volume with perimeter wall definition.',
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      return;
    }

    // 2. Check if hovering on room text or dimension text
    const textNode = target.closest('text');
    if (textNode) {
      const label = textNode.getAttribute('data-label') || textNode.textContent || '';
      const clean = label.trim().toUpperCase();

      const matchedKey = Object.keys(ROOM_DATABASE).find((k) => clean.includes(k.toUpperCase()));

      if (matchedKey) {
        const data = ROOM_DATABASE[matchedKey];
        
        // Synchronize polygon highlight for this room
        const matchedZoneId = Object.entries({
          'GARAGE': 'garage',
          'GREAT ROOM': 'great-room',
          'DINING': 'dining',
          'KITCHEN': 'kitchen',
          'DECK': 'deck',
          'ENTRY': 'entry',
          'MASTER': 'master',
          'BATH': 'master-bath',
          'BEDROOM 2': 'bed2',
          'BEDROOM 3': 'bed3'
        }).find(([k]) => clean.includes(k))?.[1];

        document.querySelectorAll('#dynamic-svg-root .cad-room-zone').forEach((el) => {
          if (matchedZoneId && el.id === `zone-${matchedZoneId}`) el.classList.add('active');
          else el.classList.remove('active');
        });

        setHoveredHUD({
          title: data.name,
          dimensions: data.dimensions,
          area: data.area,
          category: data.category,
          notes: data.notes,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        return;
      }

      if (/\d+['"]/.test(clean)) {
        document.querySelectorAll('#dynamic-svg-root .cad-room-zone').forEach((el) => el.classList.remove('active'));
        setHoveredHUD({
          title: `Dimension: ${label.trim()}`,
          category: 'Architectural Measurement String',
          notes: 'Standard centerline / wall opening dimension.',
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        return;
      }
    }

    // Clear active zone highlights when over empty canvas
    document.querySelectorAll('#dynamic-svg-root .cad-room-zone').forEach((el) => el.classList.remove('active'));
    if (hoveredHUD) {
      setHoveredHUD(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 15 : -15;
    setZoomLevel((prev) => Math.max(40, Math.min(300, prev + delta)));
  };

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

  const isDark = themeMode === 'dark';
  const lodClass = zoomLevel < 120 ? 'lod-macro' : (zoomLevel <= 200 ? 'lod-detail' : 'lod-inspect');

  return (
    <div 
      className={`rounded-sm border shadow-2xl overflow-hidden flex flex-col h-[700px] relative transition-colors duration-300 ${
        isDark 
          ? 'bg-[#0a0a0c] text-[#F7F7F5] border-[#E0E0DE]/15' 
          : 'bg-[#f8f9fa] text-[#121212] border-[#121212]/15'
      }`} 
      id="cad-viewer"
    >
      {/* Top Floating Glass Navigation Header */}
      <div className={`absolute top-3 left-3 right-3 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-sm backdrop-blur-md transition-colors pointer-events-none ${
        isDark ? 'bg-[#121216]/60 border border-[#E0E0DE]/10' : 'bg-white/60 border border-[#121212]/10'
      }`}>
        <div className="flex items-center gap-2.5 pointer-events-auto pl-1">
          <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse shrink-0"></span>
          <div className="flex items-baseline gap-2">
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-[#F7F7F5]' : 'text-[#121212]'}`}>
              {drawing.name}
            </h4>
            <span className={`text-[10px] font-mono ${isDark ? 'text-[#71717a]' : 'text-[#a1a1aa]'}`}>
              {drawing.svgUrl ? '· VECTOR SVG' : '· DWG'}
            </span>
          </div>
        </div>

        {/* Spatial Focus Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto select-none pr-1">
          <span className={`text-[9px] font-mono uppercase tracking-widest mr-1 shrink-0 ${isDark ? 'text-[#71717a]' : 'text-[#94a3b8]'}`}>
            ROOMS:
          </span>
          {QUICK_ROOM_CHIPS.map((chip) => {
            const isSelected = activeRoomChip === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => handleRoomSelect(chip.id)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? (isDark ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8] font-bold shadow-xs' : 'bg-[#0284c7]/15 border-[#0284c7] text-[#0284c7] font-bold shadow-xs')
                    : (isDark ? 'bg-[#18181b]/70 hover:bg-[#27272a] text-[#a1a1aa] border-transparent hover:text-white' : 'bg-white/70 hover:bg-[#e2e8f0] text-[#64748b] border-transparent hover:text-black')
                }`}
              >
                {chip.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Drafting Canvas Container (Edge-to-Edge) */}
      <div 
        className={`flex-1 w-full h-full relative overflow-hidden flex items-center justify-center transition-colors duration-300 select-none ${
          isMeasuring ? 'cursor-crosshair' : (isDragging ? 'cursor-grabbing' : 'cursor-grab')
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => {
          if (hoveredHUD) setHoveredHUD(null);
        }}
        onWheel={handleWheel}
        onDoubleClick={handleResetZoom}
      >
        {/* Dynamic style sheet to drive CAD layer visibility, theme tokens, and spotlight preview */}
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
          ${spotlightLayer ? `
            #dynamic-svg-root g[class*="cad-"]:not(.cad-${spotlightLayer}) {
              opacity: 0.12 !important;
              transition: opacity 0.2s ease !important;
            }
            #dynamic-svg-root .cad-${spotlightLayer} {
              opacity: 1 !important;
              filter: drop-shadow(0 0 5px ${isDark ? 'rgba(56, 189, 248, 0.7)' : 'rgba(2, 132, 199, 0.7)'}) !important;
            }
          ` : ''}
        `}</style>

        {/* Floating Frosted Glass HUD (Bottom-Center Dock) */}
        <div 
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-200 flex items-center gap-2 p-1.5 rounded-full border shadow-2xl backdrop-blur-xl ${
            isDragging ? 'opacity-30 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          } ${
            isDark 
              ? 'bg-[#141418]/90 border-[#E0E0DE]/20 text-[#F7F7F5] shadow-black/90' 
              : 'bg-white/90 border-[#121212]/20 text-[#121212] shadow-slate-400'
          }`}
        >
          {/* View Mode Segment */}
          <div className={`flex items-center rounded-full border p-0.5 ${
            isDark ? 'bg-[#1E1E24] border-[#E0E0DE]/10' : 'bg-[#F2F2F6] border-[#121212]/10'
          }`}>
            <button
              onClick={() => {
                setViewPreset('presentation');
                setShowDimensions(false);
                setShowGrid(false);
                setShowAnnotations(true);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all duration-150 cursor-pointer ${
                viewPreset === 'presentation'
                  ? (isDark ? 'bg-[#38bdf8] text-[#0a0a0c] font-bold shadow-xs' : 'bg-[#0284c7] text-white font-bold shadow-xs')
                  : (isDark ? 'text-[#888888] hover:text-[#F7F7F5]' : 'text-[#666666] hover:text-[#121212]')
              }`}
              title="Serene Presentation View"
            >
              🏛️ Presentation
            </button>
            <button
              onClick={() => {
                setViewPreset('technical');
                setShowDimensions(true);
                setShowGrid(true);
                setShowAnnotations(true);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all duration-150 cursor-pointer ${
                viewPreset === 'technical'
                  ? (isDark ? 'bg-[#38bdf8] text-[#0a0a0c] font-bold shadow-xs' : 'bg-[#0284c7] text-white font-bold shadow-xs')
                  : (isDark ? 'text-[#888888] hover:text-[#F7F7F5]' : 'text-[#666666] hover:text-[#121212]')
              }`}
              title="Technical Blueprint with Dimensions"
            >
              📐 Blueprint
            </button>
          </div>

          {/* Divider */}
          <div className={`h-4 w-[1px] ${isDark ? 'bg-[#E0E0DE]/20' : 'bg-[#121212]/20'}`} />

          {/* Precision Caliper Tool */}
          <button
            onClick={() => {
              setIsMeasuring(!isMeasuring);
              setMeasureP1(null);
              setMeasureP2(null);
              setIsMeasureLocked(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all duration-150 cursor-pointer ${
              isMeasuring
                ? 'bg-[#38bdf8] text-[#0a0a0c] font-bold shadow-xs'
                : (isDark ? 'hover:bg-[#282830] text-[#A0A0AA]' : 'hover:bg-[#EAEAEF] text-[#555566]')
            }`}
            title="Measure Real-World Distance"
          >
            <Ruler size={12} />
            <span className="hidden sm:inline">{isMeasuring ? 'Measuring' : 'Measure'}</span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isDark ? 'hover:bg-[#282830] text-amber-400' : 'hover:bg-[#EAEAEF] text-indigo-600'
            }`}
            title="Toggle Drafting/Print Sheet Theme"
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          {/* Divider */}
          <div className={`h-4 w-[1px] ${isDark ? 'bg-[#E0E0DE]/20' : 'bg-[#121212]/20'}`} />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isDark ? 'hover:bg-[#282830] text-[#888888] hover:text-[#F7F7F5]' : 'hover:bg-[#EAEAEF] text-[#555555] hover:text-[#121212]'
              }`}
              title="Zoom Out"
            >
              <ZoomOut size={12} />
            </button>
            <span className={`text-[10px] font-mono w-9 text-center font-medium ${isDark ? 'text-[#CCCCCC]' : 'text-[#333333]'}`}>
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isDark ? 'hover:bg-[#282830] text-[#888888] hover:text-[#F7F7F5]' : 'hover:bg-[#EAEAEF] text-[#555555] hover:text-[#121212]'
              }`}
              title="Zoom In"
            >
              <ZoomIn size={12} />
            </button>
            <button
              onClick={handleResetZoom}
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors cursor-pointer ${
                isDark ? 'bg-[#1E1E22] hover:bg-[#282830] text-[#A0A0AA] hover:text-white' : 'bg-[#F2F2F5] hover:bg-[#EAEAEF] text-[#555566] hover:text-black'
              }`}
              title="Fit to Screen"
            >
              Fit
            </button>
          </div>
        </div>
        {/* Dynamic style sheet to drive CAD layer visibility, theme tokens, and spotlight preview */}
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
          ${spotlightLayer ? `
            #dynamic-svg-root g[class*="cad-"]:not(.cad-${spotlightLayer}) {
              opacity: 0.12 !important;
              transition: opacity 0.2s ease !important;
            }
            #dynamic-svg-root .cad-${spotlightLayer} {
              opacity: 1 !important;
              filter: drop-shadow(0 0 5px ${isDark ? 'rgba(56, 189, 248, 0.7)' : 'rgba(2, 132, 199, 0.7)'}) !important;
            }
          ` : ''}
        `}</style>

        {/* Sleek Architectural HUD Micro-Badge */}
        {hoveredHUD && !isDragging && !isMeasuring && !selectedRoomCard && (
          <div 
            className={`absolute pointer-events-none z-30 transition-all duration-100 ease-out px-2.5 py-1 rounded-sm shadow-xl border backdrop-blur-md flex items-center gap-2 whitespace-nowrap ${
              isDark 
                ? 'bg-[#121212]/95 text-[#F7F7F5] border-[#38bdf8]/60 shadow-black/90' 
                : 'bg-white/95 text-[#121212] border-[#0284c7]/60 shadow-slate-400'
            }`}
            style={{ 
              left: Math.min(Math.max(hoveredHUD.x + 12, 10), 440), 
              top: Math.max(hoveredHUD.y - 32, 10) 
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse shrink-0"></span>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase">{hoveredHUD.title}</span>
            {hoveredHUD.dimensions && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#38bdf8]/15 text-[#38bdf8] rounded-xs font-semibold">
                {hoveredHUD.dimensions}
              </span>
            )}
            {hoveredHUD.area && (
              <span className={`text-[10px] font-mono ${isDark ? 'text-[#888888]' : 'text-[#666666]'}`}>
                · {hoveredHUD.area}
              </span>
            )}
          </div>
        )}

        {/* Persistent Click-to-Inspect Architectural Spec Card */}
        {selectedRoomCard && (
          <div 
            className={`absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[360px] p-3.5 rounded-sm border shadow-2xl backdrop-blur-xl z-30 transition-all duration-200 ${
              isDark 
                ? 'bg-[#111114]/95 border-[#38bdf8]/60 text-[#f8fafc] shadow-black/90' 
                : 'bg-white/95 border-[#0284c7]/60 text-[#0f172a] shadow-slate-400'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-[#38bdf8]/20 text-[#38bdf8]">
                    {selectedRoomCard.num}
                  </span>
                  <h5 className="font-mono font-bold text-xs tracking-wider uppercase">
                    {selectedRoomCard.name}
                  </h5>
                </div>
                <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-[#a1a1aa]' : 'text-[#64748b]'}`}>
                  {selectedRoomCard.category}
                </p>
              </div>
              <button 
                onClick={() => {
                  setSelectedRoomCard(null);
                  handleResetZoom();
                }}
                className={`text-xs px-1.5 py-0.5 rounded-xs transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-[#27272a] text-[#a1a1aa] hover:text-white' : 'hover:bg-[#f1f5f9] text-[#64748b] hover:text-black'
                }`}
                title="Close & Reset Zoom"
              >
                ✕
              </button>
            </div>

            <div className={`grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-[11px] font-mono ${isDark ? 'border-[#27272a]' : 'border-[#e2e8f0]'}`}>
              <div>
                <span className={`block text-[9px] uppercase tracking-wider ${isDark ? 'text-[#71717a]' : 'text-[#94a3b8]'}`}>Dimensions</span>
                <span className="font-semibold text-[11px]">{selectedRoomCard.dimensions}</span>
              </div>
              <div>
                <span className={`block text-[9px] uppercase tracking-wider ${isDark ? 'text-[#71717a]' : 'text-[#94a3b8]'}`}>Floor Area</span>
                <span className="font-semibold text-[11px] text-[#38bdf8]">{selectedRoomCard.area}</span>
              </div>
            </div>

            {selectedRoomCard.features && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedRoomCard.features.map((feat, idx) => (
                  <span 
                    key={idx} 
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs border ${
                      isDark ? 'bg-[#18181b] border-[#27272a] text-[#d4d4d8]' : 'bg-[#f8fafc] border-[#e2e8f0] text-[#334155]'
                    }`}
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interactive Caliper Measure Live Line & Dimension Overlay */}
        {measureP1 && measureP2 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
            {(() => {
              const dx = measureP2.x - measureP1.x;
              const dy = measureP2.y - measureP1.y;
              const screenDist = Math.hypot(dx, dy);
              // Scale distance based on viewport zoom & viewBox width (1018 drawing inches)
              const cadInches = (screenDist / (zoomLevel / 100)) * (1018 / 620);
              const distStr = formatArchitecturalDistance(cadInches);
              const midX = (measureP1.x + measureP2.x) / 2;
              const midY = (measureP1.y + measureP2.y) / 2;
              const angle = Math.atan2(dy, dx);
              const tickLen = 8;
              const perpX = -Math.sin(angle) * tickLen;
              const perpY = Math.cos(angle) * tickLen;

              return (
                <g className="transition-opacity duration-150">
                  <line
                    x1={measureP1.x - perpX}
                    y1={measureP1.y - perpY}
                    x2={measureP1.x + perpX}
                    y2={measureP1.y + perpY}
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1={measureP2.x - perpX}
                    y1={measureP2.y - perpY}
                    x2={measureP2.x + perpX}
                    y2={measureP2.y + perpY}
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1={measureP1.x}
                    y1={measureP1.y}
                    x2={measureP2.x}
                    y2={measureP2.y}
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  <g transform={`translate(${midX}, ${midY - 14})`}>
                    <rect
                      x="-44"
                      y="-12"
                      width="88"
                      height="24"
                      rx="2"
                      fill={isDark ? '#0f172a' : '#ffffff'}
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 2px 6px rgba(0,0,0,0.5))"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isDark ? '#f8fafc' : '#0f172a'}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {distStr}
                    </text>
                  </g>
                </g>
              );
            })()}
          </svg>
        )}

        {/* Fine Architectural Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300" 
          style={{
            opacity: showGrid ? (isDark ? 0.15 : 0.08) : 0,
            backgroundImage: isDark
              ? 'radial-gradient(circle, #404040 1px, transparent 1px), linear-gradient(to right, #262626 1px, transparent 1px), linear-gradient(to bottom, #262626 1px, transparent 1px)'
              : 'radial-gradient(circle, #888888 1px, transparent 1px), linear-gradient(to right, #E0E0DE 1px, transparent 1px), linear-gradient(to bottom, #E0E0DE 1px, transparent 1px)',
            backgroundSize: '16px 16px, 80px 80px, 80px 80px',
            backgroundPosition: 'center center'
          }}
        />

        {/* Vector SVG Render Viewport */}
        <div 
          className="w-full h-full max-w-full max-h-full transition-transform duration-75 ease-out flex items-center justify-center pointer-events-none"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel / 100})` }}
        >
          {drawing.svgUrl ? (
            <div className="w-full h-full flex items-center justify-center relative pointer-events-auto">
              {isLoading && (
                <div className={`flex flex-col items-center gap-3 ${isDark ? 'text-[#888888]' : 'text-[#666666]'}`}>
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
                  className={`w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:max-w-full ${
                    !isDark ? 'cad-light' : ''
                  } ${viewPreset === 'technical' ? 'show-technical' : ''} ${lodClass}`}
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
      <div className={`mt-4 border-t pt-4 flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'border-[#E0E0DE]/20' : 'border-[#121212]/20'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 ${isDark ? 'text-[#888888]' : 'text-[#666666]'}`}>
            <Layers size={14} />
            <span className="text-[10px] font-mono tracking-wider uppercase">DRAFTING LAYERS:</span>
          </div>
          <span className={`hidden md:flex items-center gap-1 text-[10px] font-mono ${isDark ? 'text-[#666666]' : 'text-[#888888]'}`}>
            <Move size={10} /> Drag to pan · Scroll to zoom
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowGrid(!showGrid)}
            onMouseEnter={() => setSpotlightLayer('grid')}
            onMouseLeave={() => setSpotlightLayer(null)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-mono transition-all duration-200 cursor-pointer ${
              showGrid 
                ? (isDark 
                    ? 'bg-[#1E1E1E] text-[#F7F7F5] border border-[#3B82F6]/60 shadow-[0_0_12px_rgba(59,130,246,0.15)] ring-1 ring-[#3B82F6]/30' 
                    : 'bg-white text-[#121212] border border-[#2563EB]/60 shadow-xs ring-1 ring-[#2563EB]/20')
                : (isDark 
                    ? 'bg-[#121212] text-[#888888] border border-[#E0E0DE]/15 hover:border-[#E0E0DE]/30 hover:text-[#F7F7F5]' 
                    : 'bg-[#F7F7F5] text-[#777777] border border-[#121212]/15 hover:border-[#121212]/30 hover:text-[#121212]')
            }`}
            id="toggle-grid-btn"
          >
            {showGrid ? <Eye size={12} className={isDark ? "text-[#3B82F6]" : "text-[#2563EB]"} /> : <EyeOff size={12} className="opacity-60" />}
            <span>Grid.dwg</span>
            {showGrid && (
              <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#3B82F6]' : 'bg-[#2563EB]'}`} />
            )}
          </button>

          <button
            onClick={() => setShowDimensions(!showDimensions)}
            onMouseEnter={() => setSpotlightLayer('dim')}
            onMouseLeave={() => setSpotlightLayer(null)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-mono transition-all duration-200 cursor-pointer ${
              showDimensions 
                ? (isDark 
                    ? 'bg-[#1E1E1E] text-[#F7F7F5] border border-[#3B82F6]/60 shadow-[0_0_12px_rgba(59,130,246,0.15)] ring-1 ring-[#3B82F6]/30' 
                    : 'bg-white text-[#121212] border border-[#2563EB]/60 shadow-xs ring-1 ring-[#2563EB]/20')
                : (isDark 
                    ? 'bg-[#121212] text-[#888888] border border-[#E0E0DE]/15 hover:border-[#E0E0DE]/30 hover:text-[#F7F7F5]' 
                    : 'bg-[#F7F7F5] text-[#777777] border border-[#121212]/15 hover:border-[#121212]/30 hover:text-[#121212]')
            }`}
            id="toggle-dimensions-btn"
          >
            {showDimensions ? <Eye size={12} className={isDark ? "text-[#3B82F6]" : "text-[#2563EB]"} /> : <EyeOff size={12} className="opacity-60" />}
            <span>Dimensions.dwg</span>
            {showDimensions && (
              <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#3B82F6]' : 'bg-[#2563EB]'}`} />
            )}
          </button>

          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            onMouseEnter={() => setSpotlightLayer('anno')}
            onMouseLeave={() => setSpotlightLayer(null)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-mono transition-all duration-200 cursor-pointer ${
              showAnnotations 
                ? (isDark 
                    ? 'bg-[#1E1E1E] text-[#F7F7F5] border border-[#3B82F6]/60 shadow-[0_0_12px_rgba(59,130,246,0.15)] ring-1 ring-[#3B82F6]/30' 
                    : 'bg-white text-[#121212] border border-[#2563EB]/60 shadow-xs ring-1 ring-[#2563EB]/20')
                : (isDark 
                    ? 'bg-[#121212] text-[#888888] border border-[#E0E0DE]/15 hover:border-[#E0E0DE]/30 hover:text-[#F7F7F5]' 
                    : 'bg-[#F7F7F5] text-[#777777] border border-[#121212]/15 hover:border-[#121212]/30 hover:text-[#121212]')
            }`}
            id="toggle-annotations-btn"
          >
            {showAnnotations ? <Eye size={12} className={isDark ? "text-[#3B82F6]" : "text-[#2563EB]"} /> : <EyeOff size={12} className="opacity-60" />}
            <span>Labels.dwg</span>
            {showAnnotations && (
              <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#3B82F6]' : 'bg-[#2563EB]'}`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
