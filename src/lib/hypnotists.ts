import { marked } from 'marked';

export type HypnotistStatus = 'published' | 'draft';

export type Hypnotist = {
  id: string;
  name: string;
  city: string;
  department: string;
  description: string | null;
  excerpt: string | null;
  lat: number | null;
  lng: number | null;
  website: string | null;
  instagram: string | null;
  twitter: string | null;
  phone: string | null;
  email: string | null;
  image: string | null;
  rating: number;
  status: HypnotistStatus;
};

export async function loadHypnotists(): Promise<Hypnotist[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}hypnotists.json`);
  if (!res.ok) throw new Error(`Failed to load hypnotists: ${res.status}`);
  return res.json();
}

export function renderHypnotistMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

export function profileLocation(profile: Hypnotist): string {
  return `${profile.city} (${profile.department})`;
}
