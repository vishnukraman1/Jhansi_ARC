import React, { useMemo, useState, useRef } from 'react';
import DxfParser from 'dxf-parser';
import { ZoomIn, ZoomOut, Upload, Trash2, Eye, EyeOff, Layers } from 'lucide-react';

interface CustomCADViewerProps {
  onBack?: () => void;
}
const getStyleForLayer = (layerName: string | undefined) => {
  if (!layerName) return { color: '#ffffff', strokeWidth: 1, dashArray: 'none' };
  
  const layer = layerName.toLowerCase();
  
  // Windows / Glass
  if (layer.includes('glass') || layer.includes('glaz') || layer.includes('window') || layer.includes('a-glaz')) {
    return { color: '#3b82f6', strokeWidth: 1.5, dashArray: 'none' };
  }
  
  // Walls (thick white)
  if (layer.includes('wall') || layer.includes('strc') || layer.includes('core') || layer.includes('a-wall')) {
    return { color: '#ffffff', strokeWidth: 2, dashArray: 'none' };
  }
  
  // Doors (thin gray)
  if (layer.includes('door') || layer.includes('a-door')) {
    return { color: '#a3a3a3', strokeWidth: 0.75, dashArray: 'none' };
  }
  
  // Furniture / Casework / Floors (thin dark gray)
  if (layer.includes('furn') || layer.includes('mill') || layer.includes('case') || layer.includes('flor') || layer.includes('a-flor')) {
    return { color: '#737373', strokeWidth: 0.5, dashArray: 'none' };
  }

  // Dimensions / Grid / Annotations (dashed gray)
  if (layer.includes('dim') || layer.includes('grid') || layer.includes('anno')) {
    return { color: '#737373', strokeWidth: 0.5, dashArray: '4,4' };
  }
  
  // Default
  return { color: '#ffffff', strokeWidth: 1.5, dashArray: 'none' };
};

export default function CustomCADViewer({ onBack }: CustomCADViewerProps) {
  const [dxfData, setDxfData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setDxfData(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const parsedDXF = useMemo(() => {
    if (!dxfData) return null;
    try {
      const parser = new DxfParser();
      return parser.parseSync(dxfData);
    } catch (e) {
      console.error("Failed to parse DXF:", e);
      return null;
    }
  }, [dxfData]);

  const allLayers = useMemo(() => {
    if (!parsedDXF) return [];
    const layers = new Set<string>();
    parsedDXF.entities.forEach((ent: any) => {
      if (ent.layer) layers.add(ent.layer);
    });
    return Array.from(layers).sort();
  }, [parsedDXF]);

  const toggleLayer = (layer: string) => {
    setHiddenLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  // Compute bounding box to auto-center and scale SVG
  const boundingBox = useMemo(() => {
    if (!parsedDXF || !parsedDXF.entities || !Array.isArray(parsedDXF.entities) || parsedDXF.entities.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    parsedDXF.entities.forEach((ent: any) => {
      if (ent && Array.isArray(ent.vertices)) {
        ent.vertices.forEach((v: any) => {
          if (v && typeof v.x === 'number' && v.x < minX) minX = v.x;
          if (v && typeof v.y === 'number' && v.y < minY) minY = v.y;
          if (v && typeof v.x === 'number' && v.x > maxX) maxX = v.x;
          if (v && typeof v.y === 'number' && v.y > maxY) maxY = v.y;
        });
      }
      if (ent && ent.type === 'CIRCLE' && ent.center && typeof ent.radius === 'number') {
        if (ent.center.x - ent.radius < minX) minX = ent.center.x - ent.radius;
        if (ent.center.y - ent.radius < minY) minY = ent.center.y - ent.radius;
        if (ent.center.x + ent.radius > maxX) maxX = ent.center.x + ent.radius;
        if (ent.center.y + ent.radius > maxY) maxY = ent.center.y + ent.radius;
      }
    });
    
    if (minX === Infinity || isNaN(minX)) return { minX: 0, minY: 0, width: 100, height: 100 };
    return { minX, minY, width: maxX - minX, height: maxY - minY };
  }, [parsedDXF]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  // Maps parsed DXF elements to SVG React elements
  const renderEntity = (ent: any, idx: number) => {
    if (!ent) return null;
    if (ent.layer && hiddenLayers.has(ent.layer)) return null;
    
    const { color, strokeWidth, dashArray } = getStyleForLayer(ent.layer);
    const strokeDasharray = dashArray === 'none' ? undefined : dashArray;

    try {
      switch (ent.type) {
        case 'LINE':
          if (!ent.vertices || ent.vertices.length < 2) return null;
          return <line key={idx} x1={ent.vertices[0].x} y1={-ent.vertices[0].y} x2={ent.vertices[1].x} y2={-ent.vertices[1].y} stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />;
        case 'CIRCLE':
          if (!ent.center) return null;
          return <circle key={idx} cx={ent.center.x} cy={-ent.center.y} r={ent.radius || 0} stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} fill="none" />;
        case 'ARC':
          if (!ent.center || typeof ent.startAngle !== 'number' || typeof ent.endAngle !== 'number') return null;
          // Calculate SVG path for arc
          const startAngle = ent.startAngle;
          const endAngle = ent.endAngle;
          const r = ent.radius || 0;
          const cx = ent.center.x;
          const cy = -ent.center.y;
          
          const startX = cx + r * Math.cos(startAngle);
          const startY = cy - r * Math.sin(startAngle); // - due to inverted Y
          const endX = cx + r * Math.cos(endAngle);
          const endY = cy - r * Math.sin(endAngle);
          
          let largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
          if (endAngle < startAngle) {
              largeArcFlag = (endAngle + 2*Math.PI) - startAngle <= Math.PI ? "0" : "1";
          }
          
          const d = `M ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
          return <path key={idx} d={d} stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} fill="none" />;
        
        case 'POLYLINE':
        case 'LWPOLYLINE':
          if (!ent.vertices || !Array.isArray(ent.vertices)) return null;
          const points = ent.vertices.map((v: any) => `${v.x || 0},${-(v.y || 0)}`).join(' ');
          if (ent.shape) {
              return <polygon key={idx} points={points} stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} fill="none" />;
          }
          return <polyline key={idx} points={points} stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} fill="none" />;
          
        case 'TEXT':
        case 'MTEXT':
          if (!ent.startPoint) return null;
          // Clean AutoCAD formatting characters like %%u (underline), %%c, %%d
          const cleanText = ent.text?.replace(/%%[A-Za-z]/g, '').trim() || '';
          
          // If the text looks like a room label, make it an interactive hotspot
          const isRoom = cleanText.includes('ROOM') || cleanText.includes('BED') || cleanText.includes('BATH') || cleanText.includes('HALL') || cleanText.includes('ENTRY') || cleanText.includes('KITCHEN') || cleanText.includes('GARAGE');
          
          if (isRoom) {
             const isHovered = activeRoom === cleanText;
             return (
               <g 
                 key={idx} 
                 className="cursor-pointer transition-all duration-200" 
                 onMouseEnter={() => setActiveRoom(cleanText)} 
                 onMouseLeave={() => setActiveRoom(null)}
               >
                 <rect x={ent.startPoint.x - 5} y={-ent.startPoint.y - 12} width={cleanText.length * 8 + 10} height={16} fill={isHovered ? "#3b82f6" : "transparent"} fillOpacity={0.1} stroke={isHovered ? "#3b82f6" : "transparent"} rx="2" pointerEvents="all" />
                 <text x={ent.startPoint.x} y={-ent.startPoint.y} fill={isHovered ? "#3b82f6" : "#F7F7F5"} fontSize={ent.textHeight || 12} fontFamily="sans-serif" fontWeight="bold">{cleanText}</text>
               </g>
             );
          }
          return <text key={idx} x={ent.startPoint.x} y={-ent.startPoint.y} fill="#F7F7F5" fontSize={ent.textHeight || 12} fontFamily="sans-serif" fontWeight="bold">{cleanText}</text>;
        default:
          return null;
      }
    } catch (e) {
      console.warn("Failed to render DXF entity", ent, e);
      return null;
    }
  };

  if (!dxfData) {
    return (
      <div className="bg-[#121212] text-[#F7F7F5] rounded-sm p-12 border border-[#E0E0DE]/20 shadow-2xl flex flex-col items-center justify-center h-[580px] w-full relative">
        {onBack && (
            <button onClick={onBack} className="absolute top-4 right-4 text-xs font-mono text-[#888888] hover:text-[#F7F7F5]">
                CLOSE DXF
            </button>
        )}
        <div className="w-16 h-16 bg-[#3b82f6]/10 rounded-full flex items-center justify-center mb-6 text-[#3b82f6]">
          <Upload size={32} />
        </div>
        <h3 className="text-xl font-sans mb-2 font-medium">Upload Custom CAD File</h3>
        <p className="text-[#888888] font-mono text-xs mb-8 text-center max-w-md leading-relaxed">
          Upload any standard .DXF file to dynamically convert and render it as an interactive SVG using our client-side parser pipeline. No server required.
        </p>
        
        <label className="bg-[#F7F7F5] text-[#121212] px-6 py-3 font-mono text-xs uppercase tracking-widest cursor-pointer hover:bg-[#E0E0DE] transition rounded-sm flex items-center gap-2">
          <Upload size={14} /> Select .DXF File
          <input type="file" accept=".dxf" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>
    );
  }

  if (!parsedDXF) {
    return (
      <div className="bg-[#121212] text-red-500 rounded-sm p-12 border border-red-500/20 flex flex-col items-center justify-center h-[580px]">
        <p>Failed to parse DXF file. Ensure it is a valid ASCII DXF.</p>
        <button onClick={() => setDxfData(null)} className="mt-4 px-4 py-2 border border-red-500/50 hover:bg-red-500/10 rounded-sm font-mono text-xs">Try Again</button>
      </div>
    );
  }

  const viewBox = boundingBox 
    ? `${boundingBox.minX - 10} ${-boundingBox.minY - boundingBox.height - 10} ${boundingBox.width + 20} ${boundingBox.height + 20}` 
    : "0 0 100 100";

  return (
    <div className="w-full">
      <div className="bg-[#121212] text-[#F7F7F5] rounded-sm border border-[#E0E0DE]/20 shadow-2xl flex flex-col h-[580px] w-full relative overflow-hidden">
        
        {/* Header Panel */}
      <div className="flex items-center justify-between p-4 border-b border-[#E0E0DE]/20 z-10 bg-[#121212]/80 backdrop-blur-sm absolute top-0 left-0 right-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-0.5 rounded-sm">
            DYNAMIC DXF
          </span>
          <h4 className="text-sm font-sans font-medium text-[#F7F7F5] truncate max-w-[200px]">{fileName}</h4>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoomLevel(p => Math.max(10, p - 10))} className="p-1.5 hover:bg-[#F7F7F5]/20 rounded-sm text-[#888888] hover:text-[#F7F7F5] transition" title="Zoom Out"><ZoomOut size={15} /></button>
          <span className="text-xs font-mono w-10 text-center text-[#888888]">{zoomLevel}%</span>
          <button onClick={() => setZoomLevel(p => p + 10)} className="p-1.5 hover:bg-[#F7F7F5]/20 rounded-sm text-[#888888] hover:text-[#F7F7F5] transition" title="Zoom In"><ZoomIn size={15} /></button>
          <div className="w-[1px] h-4 bg-[#E0E0DE]/20 mx-2"></div>
          <button onClick={() => setDxfData(null)} className="p-1.5 text-red-400 hover:bg-red-400/20 rounded-sm flex items-center gap-1 text-xs font-mono transition">
            <Trash2 size={13} /> <span className="hidden sm:inline">Clear</span>
          </button>
          {onBack && (
            <button onClick={onBack} className="ml-2 text-xs font-mono text-[#888888] hover:text-[#F7F7F5] uppercase border-l border-[#E0E0DE]/20 pl-4">
                Close
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas with pure pointer dragging */}
      <div 
        className="flex-grow cursor-move relative mt-16"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div 
          className="w-full h-full absolute inset-0 flex items-center justify-center origin-center transition-transform duration-75"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel / 100})` }}
        >
          <svg 
            viewBox={viewBox} 
            className="w-[90%] h-[90%] max-w-none max-h-none"
            vectorEffect="non-scaling-stroke"
          >
            {/* Minimalist Axis/Grid center lines for context */}
            <g stroke="#262626" strokeWidth="0.5" strokeDasharray="5,5">
                {boundingBox && (
                    <line x1={boundingBox.minX} y1={-boundingBox.minY} x2={boundingBox.minX + boundingBox.width} y2={-boundingBox.minY} />
                )}
            </g>
            
            <g strokeWidth={zoomLevel < 100 ? 100 / zoomLevel : 1}>
                {parsedDXF.entities.map((ent: any, i: number) => renderEntity(ent, i))}
            </g>
          </svg>
        </div>
      </div>

      {/* Floating Room Info Overlay */}
      {activeRoom && (
        <div className="absolute top-20 right-6 bg-[#121212]/95 backdrop-blur-md border border-[#3b82f6]/40 p-5 rounded-sm shadow-2xl z-20 w-64 pointer-events-none transition-opacity">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></span>
            <span className="font-mono text-[10px] text-[#3b82f6] tracking-widest uppercase">SPACE HIGHLIGHTED</span>
          </div>
          <h4 className="text-lg font-sans text-[#F7F7F5] font-semibold mb-4">{activeRoom}</h4>
          
          <div className="flex flex-col gap-2.5 border-t border-[#E0E0DE]/10 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[9px] text-[#888888] uppercase">Primary Finish</span>
              <span className="font-mono text-[10px] text-[#E0E0DE]">Wide Plank Oak</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-[9px] text-[#888888] uppercase">Ceiling Height</span>
              <span className="font-mono text-[10px] text-[#E0E0DE]">9' - 0"</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-[9px] text-[#888888] uppercase">Lighting</span>
              <span className="font-mono text-[10px] text-[#E0E0DE]">Recessed LED</span>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Layer Control Dashboard Panel */}
      {allLayers.length > 0 && (
        <div className="mt-4 border-t border-[#E0E0DE]/20 pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[#888888]">
            <Layers size={14} className="text-[#888888]" />
            <span className="text-[10px] font-mono tracking-wider uppercase">DRAFTING LAYERS:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {allLayers.map(layer => {
              const isVisible = !hiddenLayers.has(layer);
              return (
                <button
                  key={layer}
                  onClick={() => toggleLayer(layer)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono transition-colors cursor-pointer ${
                    isVisible 
                      ? 'bg-[#F7F7F5] text-[#121212] border border-[#E0E0DE]' 
                      : 'bg-[#121212] text-[#888888] border border-transparent hover:text-[#F7F7F5]'
                  }`}
                >
                  {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{layer}.dwg</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
