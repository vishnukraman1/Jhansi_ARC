/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Scale, Layers, HelpCircle, Compass, ChevronDown, HardHat, Leaf } from 'lucide-react';
import { Project } from '../types';
import { projects } from '../data';
import TechnicalDrawingViewer from './TechnicalDrawingViewer';
import ThreeModelViewer from './ThreeModelViewer';
import CustomCADViewer from './CustomCADViewer';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onSelectProject: (id: string) => void;
}

export default function ProjectDetail({ projectId, onBack, onSelectProject }: ProjectDetailProps) {
  const project = projects.find((p) => p.id === projectId);

  // Fallback to first project if not found
  const currentProject = project || projects[0];

  const [activeDrawingId, setActiveDrawingId] = useState<string>('');
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [workbenchMode, setWorkbenchMode] = useState<'2d' | '3d'>('2d');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Find next project in array for quick cycling
  const currentIndex = projects.findIndex((p) => p.id === currentProject.id);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  // Set the first drawing of this project as active when project changes
  useEffect(() => {
    if (currentProject.technicalDrawings && currentProject.technicalDrawings.length > 0) {
      setActiveDrawingId(currentProject.technicalDrawings[0].id);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentProject]);

  const activeDrawing = currentProject.technicalDrawings.find((d) => d.id === activeDrawingId) 
    || currentProject.technicalDrawings[0];

  return (
    <div className="bg-[#F7F7F5] text-[#121212] min-h-screen pt-20" id="project-detail-view">
      
      {/* Visual Header / Hero "Wow" Image */}
      <div className="relative h-[65vh] w-full overflow-hidden bg-[#121212]">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1.0, opacity: 0.8 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          src={currentProject.heroImage}
          alt={currentProject.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/20 to-transparent" />
        
        {/* Absolute floating control bar */}
        <div className="absolute top-8 left-6 sm:left-8 lg:left-12 z-20">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 bg-[#F7F7F5]/90 hover:bg-[#121212] text-[#121212] hover:text-[#F7F7F5] border border-[#E0E0DE] px-4 py-2.5 rounded-sm text-xs font-mono uppercase tracking-widest transition cursor-pointer"
            id="back-to-works-btn"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Index
          </button>
        </div>

        {/* Hero Title & Subtitle Info overlay */}
        <div className="absolute bottom-12 left-6 sm:left-8 lg:left-12 right-6 sm:right-8 lg:right-12 z-20 max-w-7xl mx-auto text-[#F7F7F5]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#888888] bg-[#121212] px-2.5 py-1 rounded">
                {currentProject.category}
              </span>
              <span className="font-mono text-xs text-[#888888]">{currentProject.location}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight mt-2 text-[#F7F7F5]">
              {currentProject.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Main Content: 2-Column Split Specification & Narrative */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Project Technical Specifications (Sidebar) */}
          <div className="lg:col-span-4 bg-[#F7F7F5] border border-[#E0E0DE] p-8 rounded-sm shadow-sm flex flex-col gap-6 lg:sticky lg:top-28">
            <h3 className="font-mono text-xs text-[#888888] uppercase tracking-widest border-b border-[#E0E0DE] pb-3 font-semibold">
              SPECIFICATION MATRIX
            </h3>

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0E0DE]/40 text-[#121212] rounded-sm">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-mono text-[9px] text-[#888888] uppercase">LOCATION</p>
                  <p className="font-sans text-sm font-semibold text-[#121212]">{currentProject.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0E0DE]/40 text-[#121212] rounded-sm">
                  <Scale size={16} />
                </div>
                <div>
                  <p className="font-mono text-[9px] text-[#888888] uppercase">SURFACE AREA</p>
                  <p className="font-sans text-sm font-semibold text-[#121212]">{currentProject.area}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0E0DE]/40 text-[#121212] rounded-sm">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="font-mono text-[9px] text-[#888888] uppercase">COMPLETION YEAR</p>
                  <p className="font-sans text-sm font-semibold text-[#121212]">{currentProject.year}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0E0DE]/40 text-[#121212] rounded-sm">
                  <Layers size={16} />
                </div>
                <div>
                  <p className="font-mono text-[9px] text-[#888888] uppercase">BUILDING TYPOLOGY</p>
                  <p className="font-sans text-sm font-semibold text-[#121212]">{currentProject.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0E0DE]/40 text-[#121212] rounded-sm">
                  <HelpCircle size={16} />
                </div>
                <div>
                  <p className="font-mono text-[9px] text-[#888888] uppercase">CLIENT / JURY</p>
                  <p className="font-sans text-sm font-semibold text-[#121212]">{currentProject.client}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E0E0DE] pt-5 mt-2">
              <span className="font-mono text-[9px] text-[#888888] uppercase block mb-1">ECOLOGICAL RATING</span>
              <div className="flex gap-1">
                <div className="h-1.5 w-8 bg-[#121212] rounded-full" />
                <div className="h-1.5 w-8 bg-[#121212] rounded-full" />
                <div className="h-1.5 w-8 bg-[#121212] rounded-full" />
                <div className="h-1.5 w-8 bg-[#121212] rounded-full" />
                <div className="h-1.5 w-8 bg-[#E0E0DE] rounded-full" />
                <span className="font-mono text-[9px] text-[#888888] ml-2 -mt-1">PHPP-A+</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Conceptual Narrative (Problem, Process, Solution) */}
          <div className="lg:col-span-8 flex flex-col gap-10 text-[#121212]">
            <div>
              <span className="font-mono text-xs text-[#888888] uppercase tracking-widest font-semibold block mb-2">
                DESIGN PROBLEM
              </span>
              <p className="text-[#121212]/90 text-sm sm:text-base leading-relaxed font-sans font-light">
                {currentProject.narrative.problem}
              </p>
            </div>

            <div className="border-t border-[#E0E0DE] pt-8">
              <span className="font-mono text-xs text-[#888888] uppercase tracking-widest font-semibold block mb-2">
                DRAFTING & STRATEGY PROCESS
              </span>
              <p className="text-[#121212]/90 text-sm sm:text-base leading-relaxed font-sans font-light">
                {currentProject.narrative.process}
              </p>
            </div>

            <div className="border-t border-[#E0E0DE] pt-8">
              <span className="font-mono text-xs text-[#888888] uppercase tracking-widest font-semibold block mb-2">
                SPATIAL SOLUTION
              </span>
              <p className="text-[#121212]/90 text-sm sm:text-base leading-relaxed font-sans font-light">
                {currentProject.narrative.solution}
              </p>
            </div>

            {currentProject.specs && (
              <div className="border-t border-[#E0E0DE] pt-8" id="tech-specs-section">
                <span className="font-mono text-xs text-[#888888] uppercase tracking-widest font-semibold block mb-4">
                  TECHNICAL SPECIFICATIONS
                </span>
                
                <div className="flex flex-col gap-3" id="specs-accordion">
                  {/* Materials & Finishes */}
                  <div className="border border-[#E0E0DE] rounded-sm bg-[#F7F7F5]" id="spec-materials-accordion">
                    <button
                      onClick={() => toggleSection('materials')}
                      className="w-full flex items-center justify-between p-4 text-left font-mono text-xs font-semibold tracking-wider uppercase text-[#121212] hover:bg-[#E0E0DE]/20 transition cursor-pointer"
                      aria-expanded={openSection === 'materials'}
                      id="toggle-materials-btn"
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers size={14} className="text-[#888888]" />
                        <span>Materials & Finishes</span>
                      </div>
                      <motion.div
                        animate={{ rotate: openSection === 'materials' ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={14} className="text-[#888888]" />
                      </motion.div>
                    </button>
                    
                    <motion.div
                      initial={false}
                      animate={{ height: openSection === 'materials' ? 'auto' : 0, opacity: openSection === 'materials' ? 1 : 0 }}
                      className="overflow-hidden"
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="p-4 pt-0 border-t border-[#E0E0DE]/40 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F7F5]/50">
                        {currentProject.specs.materials.map((item, idx) => (
                          <div key={idx} className="flex flex-col border-b border-[#E0E0DE]/20 pb-2 last:border-0 last:pb-0 sm:border-0 sm:pb-0 pt-2">
                            <span className="font-mono text-[9px] text-[#888888] uppercase tracking-widest">{item.name}</span>
                            <span className="font-sans text-sm text-[#121212] font-light mt-0.5">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Structural Systems */}
                  <div className="border border-[#E0E0DE] rounded-sm bg-[#F7F7F5]" id="spec-structural-accordion">
                    <button
                      onClick={() => toggleSection('structural')}
                      className="w-full flex items-center justify-between p-4 text-left font-mono text-xs font-semibold tracking-wider uppercase text-[#121212] hover:bg-[#E0E0DE]/20 transition cursor-pointer"
                      aria-expanded={openSection === 'structural'}
                      id="toggle-structural-btn"
                    >
                      <div className="flex items-center gap-2.5">
                        <HardHat size={14} className="text-[#888888]" />
                        <span>Structural Systems & Foundation</span>
                      </div>
                      <motion.div
                        animate={{ rotate: openSection === 'structural' ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={14} className="text-[#888888]" />
                      </motion.div>
                    </button>
                    
                    <motion.div
                      initial={false}
                      animate={{ height: openSection === 'structural' ? 'auto' : 0, opacity: openSection === 'structural' ? 1 : 0 }}
                      className="overflow-hidden"
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="p-4 pt-0 border-t border-[#E0E0DE]/40 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F7F5]/50">
                        {currentProject.specs.structural.map((item, idx) => (
                          <div key={idx} className="flex flex-col border-b border-[#E0E0DE]/20 pb-2 last:border-0 last:pb-0 sm:border-0 sm:pb-0 pt-2">
                            <span className="font-mono text-[9px] text-[#888888] uppercase tracking-widest">{item.name}</span>
                            <span className="font-sans text-sm text-[#121212] font-light mt-0.5">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Environmental Performance */}
                  <div className="border border-[#E0E0DE] rounded-sm bg-[#F7F7F5]" id="spec-environmental-accordion">
                    <button
                      onClick={() => toggleSection('environmental')}
                      className="w-full flex items-center justify-between p-4 text-left font-mono text-xs font-semibold tracking-wider uppercase text-[#121212] hover:bg-[#E0E0DE]/20 transition cursor-pointer"
                      aria-expanded={openSection === 'environmental'}
                      id="toggle-environmental-btn"
                    >
                      <div className="flex items-center gap-2.5">
                        <Leaf size={14} className="text-[#888888]" />
                        <span>Sustainable Tech & Metrics</span>
                      </div>
                      <motion.div
                        animate={{ rotate: openSection === 'environmental' ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={14} className="text-[#888888]" />
                      </motion.div>
                    </button>
                    
                    <motion.div
                      initial={false}
                      animate={{ height: openSection === 'environmental' ? 'auto' : 0, opacity: openSection === 'environmental' ? 1 : 0 }}
                      className="overflow-hidden"
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="p-4 pt-0 border-t border-[#E0E0DE]/40 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F7F5]/50">
                        {currentProject.specs.environmental.map((item, idx) => (
                          <div key={idx} className="flex flex-col border-b border-[#E0E0DE]/20 pb-2 last:border-0 last:pb-0 sm:border-0 sm:pb-0 pt-2">
                            <span className="font-mono text-[9px] text-[#888888] uppercase tracking-widest">{item.name}</span>
                            <span className="font-sans text-sm text-[#121212] font-light mt-0.5">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TECHNICAL EVIDENCE: Drafting Studio Workdesk */}
      <div className="bg-[#121212] py-24 text-[#F7F7F5] border-t border-b border-[#E0E0DE]/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[#E0E0DE]/20 pb-8 mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-[#888888]">
                <Compass size={14} />
                <span className="font-mono text-xs uppercase tracking-widest">
                  TECHNICAL WORKDESK
                </span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-sans font-light tracking-tight text-[#F7F7F5]">
                Architectural <span className="font-semibold text-[#F7F7F5]">Evidence</span>
              </h3>
            </div>

            {/* Selector controls for 2D vs 3D and individual views */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Main 2D vs 3D vs Sustainability Mode Selector */}
              <div className="flex items-center gap-1 bg-[#121212] p-1 border border-[#E0E0DE]/20">
                <button
                  onClick={() => setWorkbenchMode('2d')}
                  className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                    workbenchMode === '2d'
                      ? 'bg-[#F7F7F5] text-[#121212] font-semibold'
                      : 'text-[#888888] hover:text-[#F7F7F5]'
                  }`}
                  id="workbench-tab-2d"
                >
                  2D Blueprints
                </button>
                <button
                  onClick={() => setWorkbenchMode('3d')}
                  className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                    workbenchMode === '3d'
                      ? 'bg-[#F7F7F5] text-[#121212] font-semibold'
                      : 'text-[#888888] hover:text-[#F7F7F5]'
                  }`}
                  id="workbench-tab-3d"
                >
                  3D Model Study
                </button>
              </div>

              {/* Sub-selectors (Only visible in 2D mode) */}
              {workbenchMode === '2d' && (
                <div className="flex flex-wrap items-center gap-1.5 bg-[#121212] p-1.5 border border-[#E0E0DE]/10">
                  {currentProject.technicalDrawings.map((draw) => (
                    <button
                      key={draw.id}
                      onClick={() => setActiveDrawingId(draw.id)}
                      className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                        activeDrawingId === draw.id
                          ? 'bg-[#F7F7F5]/10 text-[#F7F7F5] border border-[#E0E0DE]/30'
                          : 'text-[#888888] hover:text-[#F7F7F5]'
                      }`}
                      id={`drawing-selector-${draw.id}`}
                    >
                      {draw.type}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveDrawingId('custom-dxf')}
                    className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                      activeDrawingId === 'custom-dxf'
                        ? 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30'
                        : 'text-[#3b82f6]/70 hover:text-[#3b82f6]'
                    }`}
                  >
                    + UPLOAD DXF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Drafting Canvas Workbench container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Description details of selected drawing or 3D study */}
              <div className="lg:col-span-4 flex flex-col justify-between bg-[#121212]/40 p-8 border border-[#E0E0DE]/20">
                {workbenchMode === '2d' ? (
                  activeDrawingId === 'custom-dxf' ? (
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#3b82f6] uppercase">
                        DYNAMIC PARSER
                      </span>
                      <h4 className="text-lg font-sans font-medium text-[#F7F7F5] mt-2 mb-4">
                        Custom DXF Renderer
                      </h4>
                      <p className="text-xs text-[#888888] leading-relaxed font-sans mb-6">
                        You are currently in the custom CAD workspace. Upload any standard DXF file to view it dynamically as an SVG within this environment.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#888888] uppercase">
                        DRAFT SPECIFICATION
                      </span>
                      <h4 className="text-lg font-sans font-medium text-[#F7F7F5] mt-2 mb-4">
                        {activeDrawing.name}
                      </h4>
                      <p className="text-xs text-[#888888] leading-relaxed font-sans mb-6">
                        {activeDrawing.description}
                      </p>
                    </div>
                  )
                ) : (
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#888888] uppercase">
                      3D ASSEMBLY STUDY
                    </span>
                    <h4 className="text-lg font-sans font-medium text-[#F7F7F5] mt-2 mb-4">
                      Volumetric Massing Study
                    </h4>
                    <p className="text-xs text-[#888888] leading-relaxed font-sans mb-4">
                      This interactive spatial study explores the primary tectonic envelopes, modular cores, and material layers defining <span className="text-[#F7F7F5]">{currentProject.title}</span>.
                    </p>
                    <p className="text-xs text-[#888888] leading-relaxed font-sans mb-6 border-l border-[#E0E0DE]/20 pl-3 italic">
                      Use the assembly slider to expand, lift, and "explode" individual structural frameworks and glass skins, exposing the internal spatial configurations below.
                    </p>
                  </div>
                )}

                {/* Technical key features legend */}
                <div className="border-t border-[#E0E0DE]/20 pt-6">
                  <span className="text-[10px] font-mono tracking-widest text-[#888888] uppercase block mb-3">
                    {workbenchMode === '2d' ? 'VECTOR DRAFT CODES' : 'MASSING DESIGN CODES'}
                  </span>
                  {workbenchMode === '2d' ? (
                    <div className="flex flex-col gap-2 font-mono text-[9px] text-[#888888]">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-5 bg-[#F7F7F5] rounded" />
                        <span>CONCRETE MASONRY LOAD-BEARING STRATA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-5 bg-blue-500 rounded" />
                        <span>TRIPLE-GLAZED THERMAL ENVELOPE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-5 bg-amber-500 rounded" strokeDasharray="2,2" />
                        <span>SOLAR INSULATION CONTOURS & CO-GRID</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 font-mono text-[9px] text-[#888888]">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-5 bg-[#14B8A6] rounded opacity-60" />
                        <span>GLASS SKIN / PHOTOVOLTAIC LEAF SHADERS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-5 bg-amber-600 rounded" />
                        <span>PRIMARY MASS-TIMBER FRAME / TIMBER CORE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-5 bg-neutral-300 rounded" />
                        <span>WHITE CONCRETE / EXTERIOR MONOLITH</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-5 bg-red-800 rounded" />
                        <span>CLAY WALLS / SHOU SUGI BAN CABINS</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Vector or 3D Renderer */}
              <div className="lg:col-span-8 flex flex-col">
                {workbenchMode === '2d' ? (
                  activeDrawingId === 'custom-dxf' ? (
                    <CustomCADViewer onBack={() => setActiveDrawingId(currentProject.technicalDrawings[0].id)} />
                  ) : (
                    <TechnicalDrawingViewer drawing={activeDrawing} projectTitle={currentProject.title} />
                  )
                ) : (
                  <ThreeModelViewer projectId={currentProject.id} projectName={currentProject.title} />
                )}
              </div>

            </div>

        </div>
      </div>

      {/* ADDITIONAL PROJECT PHOTOGRAPHY GALLERY */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
        <div className="flex flex-col mb-12">
          <span className="font-mono text-xs text-[#888888] uppercase tracking-widest block mb-2">
            VISCERAL PHOTOGRAPHY
          </span>
          <h3 className="text-2xl sm:text-3xl font-sans font-light tracking-tight text-[#121212]">
            Spatial <span className="font-semibold text-[#121212]">Vistas</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentProject.gallery.map((imgUrl, index) => (
            <div key={index} className="aspect-[4/3] bg-[#E0E0DE]/30 overflow-hidden border border-[#E0E0DE] shadow-sm rounded-sm">
              <img
                src={imgUrl}
                alt={`${currentProject.title} perspective ${index + 1}`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* NEXT PROJECT FOOTER SHORTCUT BANNER */}
      <button
        onClick={() => onSelectProject(nextProject.id)}
        className="relative w-full h-[35vh] flex items-center justify-center bg-[#121212] text-[#F7F7F5] overflow-hidden group cursor-pointer border-t border-[#E0E0DE]/20"
        id="next-project-footer"
      >
        <img
          src={nextProject.heroImage}
          alt={nextProject.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-30 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-[#121212]/40" />

        <div className="relative z-10 text-center flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-[#888888] group-hover:text-white transition-colors uppercase">
            NEXT ARCHITECTURAL CASE →
          </span>
          <h4 className="text-3xl sm:text-5xl font-sans font-semibold tracking-tight text-[#F7F7F5]">
            {nextProject.title}
          </h4>
          <span className="font-mono text-xs text-[#888888]">
            {nextProject.location} \ {nextProject.year}
          </span>
        </div>
      </button>

    </div>
  );
}
