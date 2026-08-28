/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  activeSection: 'home' | 'work' | 'about' | 'contact';
  setActiveSection: (section: 'home' | 'work' | 'about' | 'contact') => void;
  setSelectedProjectId: (id: string | null) => void;
}

export default function Navbar({ activeSection, setActiveSection, setSelectedProjectId }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', code: '01' },
    { id: 'work', label: 'Work', code: '02' },
    { id: 'about', label: 'About & CV', code: '03' },
    { id: 'contact', label: 'Contact', code: '04' }
  ] as const;

  const handleNavClick = (sectionId: 'home' | 'work' | 'about' | 'contact') => {
    setActiveSection(sectionId);
    setSelectedProjectId(null); // Return to list view
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#F7F7F5]/95 backdrop-blur-md border-b border-[#E0E0DE] text-[#121212]" id="main-nav">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo / Studio Name */}
        <button 
          onClick={() => handleNavClick('home')}
          className="group flex flex-col items-start text-left cursor-pointer transition-opacity"
          id="logo-button"
        >
          <span className="font-sans font-semibold tracking-widest text-sm uppercase">
            V. KRAMAN
          </span>
          <span className="font-mono text-[9px] tracking-widest text-[#888888] group-hover:text-[#121212] transition-colors uppercase">
            STUDIO \ Basel & Tokyo
          </span>
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8" role="navigation" aria-label="Main Navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="group flex items-center gap-1.5 cursor-pointer relative py-2"
              aria-current={activeSection === item.id ? 'page' : undefined}
              id={`nav-item-${item.id}`}
            >
              <span className="font-mono text-[10px] text-[#888888] group-hover:text-[#121212] transition-colors">
                {item.code}
              </span>
              <span className={`font-sans text-xs tracking-wider uppercase transition-colors ${
                activeSection === item.id 
                  ? 'text-[#121212] font-semibold' 
                  : 'text-[#888888] group-hover:text-[#121212]'
              }`}>
                {item.label}
              </span>
              {/* Sleek Underline Indicator */}
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#121212]" />
              )}
            </button>
          ))}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[#888888] hover:text-[#121212] transition cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          id="mobile-menu-toggle"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full h-screen bg-[#F7F7F5] border-t border-[#E0E0DE] px-6 py-8 flex flex-col gap-6" id="mobile-nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="flex items-baseline gap-4 py-3 border-b border-[#E0E0DE] text-left cursor-pointer group"
              id={`mobile-nav-item-${item.id}`}
            >
              <span className="font-mono text-xs text-[#888888] group-hover:text-[#121212] transition-colors">
                {item.code}
              </span>
              <span className={`font-sans text-lg tracking-widest uppercase transition-colors ${
                activeSection === item.id 
                  ? 'text-[#121212] font-semibold' 
                  : 'text-[#888888] group-hover:text-[#121212]'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
