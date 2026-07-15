/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ArrowDown, ArrowRight } from 'lucide-react';

interface HeroProps {
  onExploreWork: () => void;
}

export default function Hero({ onExploreWork }: HeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#121212] text-white overflow-hidden" id="hero-section">
      {/* Background High-Impact Architectural Image with Ken Burns effect */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center opacity-50 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000")',
        }}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 6, ease: 'easeOut' }}
      />
      
      {/* Dark Subtle Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-[#121212]/60 z-10" />

      {/* Grid line overlay to reinforce architectural structure */}
      <div className="absolute inset-0 z-15 pointer-events-none opacity-20 flex justify-between max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="w-[1px] h-full bg-[#E0E0DE]/20" />
        <div className="w-[1px] h-full bg-[#E0E0DE]/20 hidden sm:block" />
        <div className="w-[1px] h-full bg-[#E0E0DE]/20 hidden md:block" />
        <div className="w-[1px] h-full bg-[#E0E0DE]/20" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-between h-[calc(100vh-160px)] mt-24">
        
        {/* Technical Coordinate Tag (CAD Style) */}
        <div className="self-start">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 border-l border-[#E0E0DE]/30 pl-4 py-1"
          >
            <span className="font-mono text-[10px] text-[#888888] uppercase tracking-widest">
              SYSTEM AT-260 \ COORDS: 47.5596° N, 7.5886° E
            </span>
          </motion.div>
        </div>

        {/* Central Core Statement */}
        <div className="max-w-3xl my-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
            className="flex flex-col gap-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-sans font-light tracking-tight leading-tight text-white">
              Designing spaces with <span className="font-semibold text-[#F7F7F5]">sculptural silence</span> and technical rigor.
            </h1>
            
            <p className="font-sans text-[#E0E0DE] text-sm sm:text-base max-w-lg leading-relaxed">
              We create low-energy custom residences, high-end commercial monuments, and conceptual biospheres that foster structural honesty and ecological integration.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <button
                onClick={onExploreWork}
                className="group flex items-center gap-2 bg-[#F7F7F5] text-[#121212] px-6 py-3.5 text-xs font-mono uppercase tracking-widest hover:bg-[#E0E0DE] transition-all rounded-sm border border-[#E0E0DE] cursor-pointer"
                id="explore-portfolio-btn"
              >
                Explore Selected Works
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Metadata & Scroll Prompt */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-t border-[#E0E0DE]/20 pt-6 gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-8 font-mono text-[10px] text-[#888888] uppercase tracking-widest"
          >
            <div>
              <p className="text-[#888888]/80">PRINCIPAL</p>
              <p className="text-[#F7F7F5] font-medium mt-0.5">V. KRAMAN ARCH.</p>
            </div>
            <div>
              <p className="text-[#888888]/80">EDITION</p>
              <p className="text-[#F7F7F5] font-medium mt-0.5">2026 INDEX</p>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            onClick={onExploreWork}
            className="flex items-center gap-2 font-mono text-[9px] text-[#888888] tracking-widest uppercase hover:text-white transition cursor-pointer self-end"
            id="scroll-explore-prompt"
          >
            Scroll to view
            <ArrowDown size={11} />
          </motion.button>
        </div>

      </div>
    </div>
  );
}
