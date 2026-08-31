import type { Blog, Experience, Profile, Project, Skill } from './types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const getProfile = () => get<Profile | null>('/profile', null);
export const getExperiences = () => get<Experience[]>('/experiences', []);
export const getProjects = () => get<Project[]>('/projects', []);
export const getSkills = () => get<Skill[]>('/skills', []);
export const getBlogs = () => get<Blog[]>('/blogs', []);
export const getBlogBySlug = (slug: string) =>
  get<Blog | null>(`/blogs/slug/${encodeURIComponent(slug)}`, null);
