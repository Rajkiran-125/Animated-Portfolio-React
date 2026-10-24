export type SectionId = 'home' | 'about' | 'skills' | 'projects' | 'experience' | 'contact';

export interface NavItem {
  id: SectionId;
  label: string;
}

export interface SocialLink {
  label: 'LinkedIn' | 'GitHub' | 'WhatsApp' | 'Email';
  href: string;
  handle: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  /** Short line describing how the group is used in practice */
  blurb: string;
  skills: string[];
}

export interface Project {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  context: string;
  summary: string;
  highlights: string[];
  stack: string[];
  image: { src: string; alt: string; width: number; height: number };
  /** Only real, publicly reachable URLs — omit when the project is private */
  liveUrl?: string;
}

export interface TimelineEntry {
  id: string;
  period: string;
  role: string;
  org: string;
  place?: string;
  kind: 'work' | 'freelance' | 'education';
  points: string[];
  stack?: string[];
}
