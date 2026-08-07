#!/usr/bin/env node
/**
 * Build script — reads all markdown article files in /data/articles,
 * extracts frontmatter + body, and compiles them into a single JSON file
 * at /public/articles.json for the site to consume.
 *
 * Usage:  node scripts/build-articles.mjs
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const articlesDir = join(root, 'data', 'articles');
const outDir = join(root, 'public');
const outFile = join(outDir, 'articles.json');

async function main() {
  const files = (await readdir(articlesDir)).filter((f) => f.endsWith('.md'));
  const articles = [];

  for (const file of files) {
    const raw = await readFile(join(articlesDir, file), 'utf-8');
    const { data: fm, content: body } = matter(raw);

    const slug = file.replace(/\.md$/, '');

    articles.push({
      slug,
      title: fm.title ?? slug,
      date: fm.date ? new Date(fm.date).toISOString().slice(0, 10) : null,
      author: fm.author ?? 'Anonyme',
      categories: Array.isArray(fm.categories) ? fm.categories : [],
      excerpt: fm.excerpt ?? null,
      cover: fm.cover ?? null,
      status: fm.status ?? 'draft',
      body: body.trim(),
    });
  }

  articles.sort((a, b) => {
    const da = a.date ? String(a.date) : '';
    const db = b.date ? String(b.date) : '';
    return db.localeCompare(da);
  });

  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, JSON.stringify(articles, null, 2), 'utf-8');
  console.log(`[build-articles] Wrote ${articles.length} articles to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
