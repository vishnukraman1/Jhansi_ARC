/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, ProjectCategory } from '../types';
import { projects } from '../data';
import { ArrowUpRight, Grid } from 'lucide-react';

interface ProjectGalleryProps {
  onSelectProject: (id: string) => void;
}

export default function ProjectGallery({ onSelectProject }: ProjectGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | ProjectCategory>('All');

  const categories: ('All' | ProjectCategory)[] = ['All', 'Residential', 'Commercial', 'Concepts'];

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.category === activeFilter);

  return (
    <section className="bg-[#F7F7F5] text-[#121212] py-24 px-6 sm:px-8 lg:px-12 min-h-screen" id="projects-gallery">
      <div className="max-w-7xl mx-auto">
        
        {/* Gallery Title & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E0E0DE] pb-8 mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Grid size={14} className="text-[#888888]" />
              <span className="font-mono text-xs text-[#888888] uppercase tracking-widest">
                ARCHIVE INDEX
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-sans font-light tracking-tight text-[#121212]">
              Selected <span className="font-semibold text-[#121212]">Works</span>
            </h2>
          </div>

          {/* Filtering Tabs bar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#E0E0DE]/40 p-1 rounded-md border border-[#E0E0DE] self-start">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-[#121212] text-[#F7F7F5] shadow-sm font-semibold'
                    : 'text-[#888888] hover:text-[#121212]'
                }`}
                id={`filter-btn-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Project Grid with staggered animations */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.05 }}
                tabIndex={0}
                role="button"
                aria-label={`View case study for ${project.title}, ${project.category} in ${project.location}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectProject(project.id);
                  }
                }}
                className="group relative flex flex-col cursor-pointer bg-[#F7F7F5] border border-[#E0E0DE] overflow-hidden shadow-sm hover:shadow-md transition-all rounded-sm focus-visible:outline-2 focus-visible:outline-[#121212] focus-visible:outline-offset-2"
                onClick={() => onSelectProject(project.id)}
                id={`project-card-${project.id}`}
              >
                {/* Image Container with Hover zoom */}
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#E0E0DE]/30">
                  <img
                    src={project.heroImage}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle Dark Linear Mask on Hover */}
                  <div className="absolute inset-0 bg-[#121212]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Hover Floating Category Tag */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-[#121212]/95 backdrop-blur-sm text-[#F7F7F5] font-mono text-[9px] tracking-widest uppercase px-2 py-1 rounded-sm border border-[#E0E0DE]/20">
                      {project.category}
                    </span>
                  </div>

                  {/* Corner Arrow Icon on Hover */}
                  <div className="absolute bottom-4 right-4 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-[#121212] text-[#F7F7F5] p-2 rounded-full shadow-sm">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>

                {/* Info Description */}
                <div className="p-6 flex flex-col flex-1 bg-[#F7F7F5] justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[10px] text-[#888888]">
                        {project.location} \ {project.year}
                      </span>
                    </div>
                    <h3 className="text-lg font-sans font-semibold tracking-tight text-[#121212] group-hover:text-[#888888] transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#888888] leading-relaxed font-sans line-clamp-2">
                      {project.descriptor}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E0E0DE] flex items-center justify-between">
                    <span className="font-mono text-[9px] tracking-widest text-[#888888] group-hover:text-[#121212] uppercase transition-colors">
                      View details
                    </span>
                    <span className="font-mono text-xs text-[#E0E0DE] group-hover:text-[#121212] transition-colors">
                      0{index + 1}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state if any error or no elements */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-[#F7F7F5] border border-dashed border-[#E0E0DE] rounded-sm">
            <span className="font-mono text-xs text-[#888888]">No projects found for category "{activeFilter}"</span>
          </div>
        )}
      </div>
    </section>
  );
}
