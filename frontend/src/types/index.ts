// Unified Project type for frontend display
// This maps backend data to what the UI needs

import { ReactNode } from "react";

export interface Skill {
  title: string;
  bg: string;
  fg: string;
  icon: ReactNode;
}

// Project type compatible with current UI
export interface Project {
  id: string;
  category: string;
  title: string;
  src: string; // Main image/thumbnail
  screenshots: string[];
  skills: { frontend: Skill[]; backend: Skill[] };
  content: ReactNode;
  github?: string;
  live: string;
  description?: string;
}

// Blog type for frontend display
export interface Blog {
  id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  link?: string;
  image?: string;
  featured: boolean;
  createdAt: string;
}

// Certification type for frontend display
export interface Certification {
  id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  link?: string;
  image?: string;
  issuer: string;
  issueDate: string;
  pdf?: string;
  featured: boolean;
}

// Navigation link type
export interface Link {
  title: string;
  href: string;
  thumbnail: string;
  target?: string;
}
