/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectCategory = 'Residential' | 'Commercial' | 'Concepts';

export interface TechnicalDrawing {
  id: string;
  name: string;
  type: 'Site Plan' | 'Floor Plan' | 'Cross Section' | 'Axonometric';
  description: string;
  // We'll generate actual stylized SVG representations for structural drawings, or elegant blueprints
  svgType: 'site-plan' | 'floor-plan' | 'section' | 'axonometric';
}

export interface ProjectNarrative {
  problem: string;
  process: string;
  solution: string;
}

export interface SpecItem {
  name: string;
  value: string;
}

export interface ProjectSpecs {
  materials: SpecItem[];
  structural: SpecItem[];
  environmental: SpecItem[];
}

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  location: string;
  area: string;
  year: string;
  type: string;
  client: string;
  heroImage: string;
  gallery: string[];
  descriptor: string;
  narrative: ProjectNarrative;
  technicalDrawings: TechnicalDrawing[];
  specs?: ProjectSpecs;
}

export interface CVExperience {
  id: string;
  period: string;
  role: string;
  firm: string;
  location: string;
  description: string;
}

export interface CVEducation {
  id: string;
  period: string;
  degree: string;
  institution: string;
  location: string;
  achievements?: string;
}

export interface CVAward {
  id: string;
  year: string;
  title: string;
  project?: string;
  institution: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}
