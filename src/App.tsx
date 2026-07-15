/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectGallery from './components/ProjectGallery';
import ProjectDetail from './components/ProjectDetail';
import AboutCV from './components/AboutCV';
import Contact from './components/Contact';
import { projects } from './data';
import { ArrowUpRight, Compass, Eye } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'work' | 'about' | 'contact'>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Quick navigation helpers
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setActiveSection('work');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreWork = () => {
    setActiveSection('work');
    setSelectedProjectId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F7F7F5] text-[#121212] min-h-screen flex flex-col font-sans selection:bg-[#121212] selection:text-[#F7F7F5]" id="app-root">
      
      {/* Universal Floating Navigation Header */}
      <Navbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        setSelectedProjectId={setSelectedProjectId}
      />

      {/* Main Content Viewport with Cross-Fade Transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {selectedProjectId ? (
            /* Immersive Interactive Case Study Detail Page */
            <motion.div
              key={`detail-${selectedProjectId}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <ProjectDetail 
                projectId={selectedProjectId}
                onBack={() => {
                  setSelectedProjectId(null);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onSelectProject={handleSelectProject}
              />
            </motion.div>
          ) : (
            /* Standard Sections */
            <motion.div
              key={activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {activeSection === 'home' && (
                <div id="home-view-group">
                  {/* Hero Landing */}
                  <Hero onExploreWork={handleExploreWork} />
                  
                  {/* Editorial Intro Banner */}
                  <section className="py-24 px-6 sm:px-8 lg:px-12 bg-[#F7F7F5] border-b border-[#E0E0DE]" id="intro-philosophy">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="lg:col-span-4 flex items-center gap-2">
                        <Compass size={14} className="text-[#888888]" />
                        <span className="font-mono text-xs text-[#888888] uppercase tracking-widest font-semibold">
                          STUDIO CRITERIA
                        </span>
                      </div>
                      
                      <div className="lg:col-span-8 flex flex-col gap-6">
                        <h3 className="text-xl sm:text-3xl font-sans font-light tracking-tight text-[#121212] leading-relaxed">
                          "We do not build to decorate coordinates. We craft silent, heavy structures that capture daylight, temper mountain winds, and settle with absolute integrity into their native landscapes."
                        </h3>
                        <p className="font-mono text-xs text-[#888888] uppercase tracking-widest">
                          — VISHNU KRAMAN, FOUNDER
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Featured Curation Section */}
                  <section className="py-24 px-6 sm:px-8 lg:px-12 bg-[#F7F7F5]" id="featured-projects">
                    <div className="max-w-7xl mx-auto">
                      <div className="flex items-center justify-between border-b border-[#E0E0DE] pb-6 mb-12">
                        <div>
                          <span className="font-mono text-[10px] text-[#888888] uppercase tracking-widest block mb-1">
                            HIGHLIGHT INDEX
                          </span>
                          <h3 className="text-2xl sm:text-4xl font-sans font-light tracking-tight text-[#121212]">
                            Featured <span className="font-semibold text-black">Curation</span>
                          </h3>
                        </div>
                        <button
                          onClick={handleExploreWork}
                          className="flex items-center gap-1.5 font-mono text-[10px] text-[#888888] hover:text-[#121212] uppercase tracking-widest border-b border-transparent hover:border-[#121212] transition py-1 cursor-pointer"
                          id="home-view-all-btn"
                        >
                          <span>View All ({projects.length})</span>
                          <ArrowUpRight size={12} />
                        </button>
                      </div>

                      {/* Featured Alternating Grid */}
                      <div className="flex flex-col gap-16 lg:gap-24">
                        {projects.slice(0, 3).map((project, index) => (
                          <div 
                            key={project.id}
                            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center ${
                              index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                            }`}
                            id={`featured-row-${project.id}`}
                          >
                            {/* Project Visual (7 cols) */}
                            <div 
                              className={`lg:col-span-7 aspect-[16/10] bg-[#E0E0DE] overflow-hidden border border-[#E0E0DE] shadow-sm cursor-pointer rounded-sm relative group ${
                                index % 2 === 1 ? 'lg:order-last' : ''
                              }`}
                              onClick={() => handleSelectProject(project.id)}
                            >
                              <img
                                src={project.heroImage}
                                alt={project.title}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out grayscale hover:grayscale-0"
                              />
                              <div className="absolute inset-0 bg-[#121212]/10 group-hover:bg-transparent transition-colors duration-300" />
                            </div>

                            {/* Project Specs (5 cols) */}
                            <div className="lg:col-span-5 flex flex-col gap-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] text-[#888888] uppercase tracking-wider bg-[#E0E0DE]/60 px-2 py-0.5 rounded-sm">
                                  {project.category}
                                </span>
                                <span className="font-mono text-[10px] text-[#888888]">
                                  {project.location} \ {project.year}
                                </span>
                              </div>
                              
                              <h4 className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[#121212]">
                                {project.title}
                              </h4>
                              
                              <p className="text-xs text-[#888888] leading-relaxed font-sans">
                                {project.descriptor}
                              </p>

                              <button
                                onClick={() => handleSelectProject(project.id)}
                                className="self-start flex items-center gap-2 bg-[#121212] hover:bg-[#888888] text-[#F7F7F5] px-5 py-3 text-[10px] font-mono uppercase tracking-widest rounded-sm transition cursor-pointer mt-2"
                                id={`view-featured-${project.id}-btn`}
                              >
                                <Eye size={12} />
                                <span>Examine Case Study</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeSection === 'work' && (
                <ProjectGallery onSelectProject={handleSelectProject} />
              )}

              {activeSection === 'about' && (
                <AboutCV />
              )}

              {activeSection === 'contact' && (
                <Contact />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Structured Minimalist Footer */}
      <footer className="bg-[#F7F7F5] text-[#888888] border-t border-[#E0E0DE] py-16 px-6 sm:px-8 lg:px-12" id="main-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-[#E0E0DE] pb-12 mb-12">
          
          {/* Footer Logo */}
          <div className="flex flex-col items-start">
            <span className="font-sans font-semibold tracking-widest text-xs uppercase text-[#121212]">
              V. KRAMAN STUDIO
            </span>
            <span className="font-mono text-[9px] tracking-widest text-[#888888] mt-1 uppercase">
              RESTORING STRUCTURAL INTEGRITY \ ESTD 2017
            </span>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <button 
              onClick={() => { setActiveSection('home'); setSelectedProjectId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-xs font-mono text-[#888888] hover:text-[#121212] transition uppercase cursor-pointer"
              id="footer-link-home"
            >
              Home
            </button>
            <button 
              onClick={() => { setActiveSection('work'); setSelectedProjectId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-xs font-mono text-[#888888] hover:text-[#121212] transition uppercase cursor-pointer"
              id="footer-link-work"
            >
              Works Archive
            </button>
            <button 
              onClick={() => { setActiveSection('about'); setSelectedProjectId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-xs font-mono text-[#888888] hover:text-[#121212] transition uppercase cursor-pointer"
              id="footer-link-about"
            >
              Credentials & CV
            </button>
            <button 
              onClick={() => { setActiveSection('contact'); setSelectedProjectId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-xs font-mono text-[#888888] hover:text-[#121212] transition uppercase cursor-pointer"
              id="footer-link-contact"
            >
              Commission
            </button>
          </div>
        </div>

        {/* Global copyright & coordinates */}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] font-mono text-[#888888] uppercase tracking-wider">
          <p>© 2026 V. KRAMAN STUDIO. ALL RIGHTS RESERVED. CODE COMPACT-X04.</p>
          <div className="flex gap-4">
            <span>BASEL SWITZERLAND (HQ)</span>
            <span>SHIBUYA TOKYO (LAB)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
