export interface Profile {
  id: string;
  name: string;
  headline: string;
  about: string;
  email?: string;
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  resumeUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  description: string;
  techStack: string[];
  startDate: string;
  endDate?: string;
  current: boolean;
  sortOrder: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured: boolean;
  sortOrder: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  sortOrder: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage?: string;
  tags: string[];
  published?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  body: string;
  read: boolean;
  createdAt: string;
}
