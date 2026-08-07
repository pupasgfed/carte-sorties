import { marked } from 'marked';

export type ArticleStatus = 'published' | 'draft';

export type Article = {
  slug: string;
  title: string;
  date: string | null;
  author: string;
  categories: string[];
  excerpt: string | null;
  cover: string | null;
  status: ArticleStatus;
  body: string;
};

type CompiledArticle = Omit<Article, 'body'> & { body: string };

export async function loadArticles(): Promise<Article[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}articles.json`);
  if (!res.ok) throw new Error(`Failed to load articles: ${res.status}`);
  const data: CompiledArticle[] = await res.json();
  return data;
}

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

export function formatDate(date: string | null): string {
  if (!date) return '';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date + 'T00:00:00') : new Date(date);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
