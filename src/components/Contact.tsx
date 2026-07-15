/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Linkedin, Globe, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Residential',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', projectType: 'Residential', message: '' });
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-[#F7F7F5] text-[#121212] py-24 px-6 sm:px-8 lg:px-12 min-h-screen pt-32" id="contact-view">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col mb-16 border-b border-[#E0E0DE] pb-8">
          <div className="flex items-center gap-2 mb-2 text-[#888888]">
            <Globe size={14} />
            <span className="font-mono text-xs uppercase tracking-widest">
              CONSULTATION PORTAL
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans font-light tracking-tight text-[#121212]">
            Start a <span className="font-semibold text-[#121212]">Commission</span>
          </h2>
        </div>

        {/* Form and Coordinates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT: Minimalist Contact Form (7 columns) */}
          <div className="lg:col-span-7 bg-[#F7F7F5] border border-[#E0E0DE] p-8 rounded-sm shadow-sm" id="contact-form-container">
            {isSubmitted ? (
              <div className="text-center py-16 flex flex-col items-center justify-center gap-4" id="success-message">
                <CheckCircle size={48} className="text-[#121212]" />
                <h3 className="font-sans font-bold text-lg text-[#121212]">Commission Request Logged</h3>
                <p className="text-sm text-[#888888] max-w-sm leading-relaxed">
                  Your spatial guidelines and inquiry have been securely transmitted to our Basel office. One of our associates will contact you within 48 hours with a preliminary site feasibility study.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-[#121212] hover:bg-[#888888] text-[#F7F7F5] font-mono text-xs uppercase tracking-wider rounded-sm transition cursor-pointer"
                  id="reset-form-btn"
                >
                  Draft Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6" id="commission-form">
                <p className="text-xs text-[#888888] font-sans leading-relaxed mb-2">
                  Use this drafting form to outline your land coordinates, desired project typology, and square footage details.
                </p>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-wider text-[#888888] font-bold">
                    COMMISSIONER NAME *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="E.g., Dr. Elizabeth Vance"
                    className="w-full bg-[#F7F7F5] border border-[#E0E0DE] focus:border-[#121212] focus:bg-[#F7F7F5] text-sm px-4 py-3 outline-none transition rounded-sm"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-wider text-[#888888] font-bold">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="E.g., client@domain.com"
                    className="w-full bg-[#F7F7F5] border border-[#E0E0DE] focus:border-[#121212] focus:bg-[#F7F7F5] text-sm px-4 py-3 outline-none transition rounded-sm"
                  />
                </div>

                {/* Project Typology */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="projectType" className="font-mono text-[10px] uppercase tracking-wider text-[#888888] font-bold">
                    PROJECT TYPOLOGY
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full bg-[#F7F7F5] border border-[#E0E0DE] focus:border-[#121212] focus:bg-[#F7F7F5] text-sm px-4 py-3 outline-none cursor-pointer transition rounded-sm"
                  >
                    <option value="Residential">Residential (Private Estate / Cabin)</option>
                    <option value="Commercial">Commercial (Office / Pavilion / Cultural)</option>
                    <option value="Concepts">Concept (Biosphere / Parametric / Research)</option>
                  </select>
                </div>

                {/* Message Brief */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="font-mono text-[10px] uppercase tracking-wider text-[#888888] font-bold">
                    PROJECT SCOPE & SITE OUTLINE *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Provide land topography, location, targeted square footage, and budget criteria..."
                    className="w-full bg-[#F7F7F5] border border-[#E0E0DE] focus:border-[#121212] focus:bg-[#F7F7F5] text-sm px-4 py-3 outline-none resize-none transition rounded-sm"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2.5 w-full bg-[#121212] hover:bg-[#888888] disabled:bg-[#888888] text-[#F7F7F5] py-4 text-xs font-mono uppercase tracking-widest transition rounded-sm cursor-pointer mt-2"
                  id="submit-commission-btn"
                >
                  {isSubmitting ? (
                    <span>TRANSMITTING GUIDELINES...</span>
                  ) : (
                    <>
                      <span>SUBMIT COMMISSION REQUEST</span>
                      <Send size={12} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: Coordinates & Direct Office Info (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Basel Office */}
            <div className="bg-[#F7F7F5] border border-[#E0E0DE] p-6 rounded-sm shadow-sm" id="office-basel">
              <span className="font-mono text-[10px] tracking-widest text-[#888888] uppercase font-bold block mb-3">
                BASEL HEADQUARTERS
              </span>
              <div className="flex flex-col gap-3 font-sans text-sm text-[#121212]">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#888888] mt-0.5 shrink-0" />
                  <p>Spalenvorstadt 12, 4051 Basel, Switzerland</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#888888] shrink-0" />
                  <p>+41 61 220 88 44</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#888888] shrink-0" />
                  <p>basel@kramanstudio.ch</p>
                </div>
              </div>
            </div>

            {/* Tokyo Office */}
            <div className="bg-[#F7F7F5] border border-[#E0E0DE] p-6 rounded-sm shadow-sm" id="office-tokyo">
              <span className="font-mono text-[10px] tracking-widest text-[#888888] uppercase font-bold block mb-3">
                TOKYO LAB
              </span>
              <div className="flex flex-col gap-3 font-sans text-sm text-[#121212]">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#888888] mt-0.5 shrink-0" />
                  <p>5 Chome-24 Jingumae, Shibuya City, Tokyo 150-0001, Japan</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#888888] shrink-0" />
                  <p>+81 3 5544 9900</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#888888] shrink-0" />
                  <p>tokyo@kramanstudio.jp</p>
                </div>
              </div>
            </div>

            {/* Social Network linkages */}
            <div className="bg-[#121212] text-[#F7F7F5] p-6 rounded-sm shadow-sm" id="social-networks-box">
              <span className="font-mono text-[10px] tracking-widest text-[#888888] uppercase font-bold block mb-4">
                DIGITAL REPOSITORIES
              </span>
              <div className="flex flex-col gap-3">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs text-[#F7F7F5]/80 hover:text-[#F7F7F5] border-b border-[#E0E0DE]/20 pb-2.5 transition"
                  id="linkedin-link"
                >
                  <div className="flex items-center gap-2">
                    <Linkedin size={14} className="text-[#888888]" />
                    <span>LinkedIn Professional Network</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#888888]">/IN/V-KRAMAN</span>
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs text-[#F7F7F5]/80 hover:text-[#F7F7F5] transition"
                  id="instagram-link"
                >
                  <div className="flex items-center gap-2">
                    <Instagram size={14} className="text-[#888888]" />
                    <span>Instagram Project Logbook</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#888888]">@KRAMAN_STUDIO</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
