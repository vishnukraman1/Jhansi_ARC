/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { experiences, educations, awards, skillCategories } from '../data';
import { Award, Briefcase, GraduationCap, Code, Compass, ChevronRight } from 'lucide-react';

export default function AboutCV() {
  return (
    <div className="bg-[#F7F7F5] text-[#121212] py-24 px-6 sm:px-8 lg:px-12 min-h-screen pt-32" id="about-cv-view">
      <div className="max-w-7xl mx-auto">
        
        {/* UPPER PROFILE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
          
          {/* Portrait Image Column */}
          <div className="lg:col-span-5 aspect-[4/5] bg-[#E0E0DE] border border-[#E0E0DE] shadow-sm overflow-hidden rounded-sm relative">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800"
              alt="Vishnu Kraman - Principal Architect"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover grayscale contrast-115 hover:grayscale-0 transition-all duration-700"
            />
            {/* Fine grid details on corners to evoke drafting desk */}
            <div className="absolute bottom-4 left-4 font-mono text-[9px] text-[#F7F7F5] bg-[#121212]/90 backdrop-blur-sm px-2 py-1 rounded-sm">
              PORTRAIT \ MONOCHROME-EX01
            </div>
          </div>

          {/* Bio & Design Philosophy Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-[#888888]" />
              <span className="font-mono text-xs text-[#888888] uppercase tracking-widest font-semibold">
                STUDIO PRINCIPAL
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-sans font-light tracking-tight text-[#121212]">
              Vishnu <span className="font-semibold text-[#121212]">Kraman</span>
            </h2>

            <p className="font-mono text-[11px] text-[#888888] uppercase tracking-wider -mt-3">
              M.Arch (ETH Zürich) \ Registered Architect Basel & Tokyo
            </p>

            <div className="h-[1px] w-full bg-[#E0E0DE] my-2" />

            <p className="font-sans text-[#121212] text-base sm:text-lg leading-relaxed font-light">
              We believe in architecture that manifests as a silent presence—structures whose beauty is found in the clean junction of materials, the modulation of light, and a severe structural economy. Our practice stands at the intersection of traditional craftsmanship and computational rigor.
            </p>

            <p className="font-sans text-[#888888] text-sm sm:text-base leading-relaxed">
              Having trained under leading visionaries in Zürich and Tokyo, Vishnu establishes a distinctive design vocabulary that merges rugged Scandinavian minimalism with intricate Japanese carpentry joints. We design with carbon-sequestering mass timber, locally harvested earth soils, and thermal massing to create high-performance architectural systems tailored for the 21st century.
            </p>

            {/* Core Values / Bullet grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#E0E0DE]">
              <div>
                <h4 className="font-sans font-semibold text-xs tracking-wider uppercase text-[#121212] mb-1">
                  Structural Honesty
                </h4>
                <p className="text-xs text-[#888888] font-sans leading-relaxed">
                  Materials should speak for themselves. Charred timber, raw concrete, and weathering steel are exposed directly.
                </p>
              </div>
              <div>
                <h4 className="font-sans font-semibold text-xs tracking-wider uppercase text-[#121212] mb-1">
                  Technical Precision
                </h4>
                <p className="text-xs text-[#888888] font-sans leading-relaxed">
                  Every structural column, window mullion, and shadow gap is simulated and drafted to millimeter tolerance.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* STRUCTURED CV SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 border-t border-[#E0E0DE] pt-20">
          
          {/* Column 1: Professional Experience (Timeline) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="flex items-center gap-2 border-b border-[#E0E0DE] pb-4">
              <Briefcase size={16} className="text-[#888888]" />
              <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-[#121212]">
                Professional Experience
              </h3>
            </div>

            <div className="flex flex-col gap-8 pl-4 border-l border-[#E0E0DE]">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative flex flex-col gap-1.5" id={`exp-item-${exp.id}`}>
                  {/* Dotted indicator on timeline */}
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-[#E0E0DE] bg-[#F7F7F5]" />
                  
                  <span className="font-mono text-[10px] text-[#888888] font-semibold uppercase tracking-wider">
                    {exp.period}
                  </span>
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <h4 className="font-sans font-bold text-sm text-[#121212]">
                      {exp.role}
                    </h4>
                    <span className="font-mono text-[10px] text-[#888888]">
                      {exp.location}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#888888] font-medium italic">
                    {exp.firm}
                  </p>
                  <p className="font-sans text-xs text-[#888888]/80 leading-relaxed mt-1">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Education, Awards, and Skills */}
          <div className="lg:col-span-5 flex flex-col gap-12">
            
            {/* Education Sub-Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-[#E0E0DE] pb-4">
                <GraduationCap size={16} className="text-[#888888]" />
                <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-[#121212]">
                  Education
                </h3>
              </div>

              <div className="flex flex-col gap-6 pl-4 border-l border-[#E0E0DE]">
                {educations.map((edu) => (
                  <div key={edu.id} className="relative flex flex-col gap-1" id={`edu-item-${edu.id}`}>
                    <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full border border-[#E0E0DE] bg-[#F7F7F5]" />
                    <span className="font-mono text-[10px] text-[#888888] font-semibold tracking-wider">
                      {edu.period}
                    </span>
                    <h4 className="font-sans font-bold text-sm text-[#121212]">
                      {edu.degree}
                    </h4>
                    <p className="font-sans text-xs text-[#888888] font-medium">
                      {edu.institution}, {edu.location}
                    </p>
                    {edu.achievements && (
                      <p className="font-sans text-[11px] text-[#888888] leading-relaxed mt-1">
                        {edu.achievements}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Awards Sub-Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-[#E0E0DE] pb-4">
                <Award size={16} className="text-[#888888]" />
                <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-[#121212]">
                  Recognitions & Awards
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {awards.map((aw) => (
                  <div key={aw.id} className="flex gap-4 items-start" id={`award-item-${aw.id}`}>
                    <span className="font-mono text-xs text-[#888888] mt-0.5">{aw.year}</span>
                    <div>
                      <h4 className="font-sans font-semibold text-xs text-[#121212]">
                        {aw.title}
                      </h4>
                      <p className="font-sans text-[11px] text-[#888888]">
                        {aw.institution} {aw.project ? `\\ Case: ${aw.project}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* TECHNICAL SYSTEM SKILLS SECTION */}
        <div className="border-t border-[#E0E0DE] mt-20 pt-20">
          <div className="flex items-center gap-2 border-b border-[#E0E0DE] pb-4 mb-8">
            <Code size={16} className="text-[#888888]" />
            <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-[#121212]">
              Technical Skill Ecosystem
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skillCategories.map((cat) => (
              <div key={cat.id} className="bg-[#F7F7F5] border border-[#E0E0DE] p-6 rounded-sm shadow-sm" id={`skill-cat-${cat.id}`}>
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#121212] mb-4 pb-2 border-b border-[#E0E0DE]">
                  {cat.name}
                </h4>
                <div className="flex flex-col gap-2.5">
                  {cat.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between text-xs text-[#888888] font-medium">
                      <div className="flex items-center gap-1.5">
                        <ChevronRight size={10} className="text-[#888888]" />
                        <span>{skill}</span>
                      </div>
                      <span className="font-mono text-[9px] text-[#888888] uppercase">Lvl. 05</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
