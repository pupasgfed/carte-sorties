#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const profilesDir = join(root, 'data', 'hypnotists');
const outDir = join(root, 'public');
const outFile = join(outDir, 'hypnotists.json');

function buildExcerpt(description) {
  if (!description) return null;
  return description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(' ')
    .replace(/^#{1,6}\s+/, '')
    .replace(/[*_`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    || null;
}

async function main() {
  const files = (await readdir(profilesDir)).filter((file) => file.endsWith('.json'));
  const profiles = [];

  for (const file of files) {
    const profile = JSON.parse(await readFile(join(profilesDir, file), 'utf-8'));
    profiles.push({
      id: profile.id,
      name: profile.name,
      city: profile.city,
      department: profile.department,
      description: profile.description ?? null,
      excerpt: buildExcerpt(profile.description),
      lat: profile.lat ?? null,
      lng: profile.lng ?? null,
      website: profile.website ?? null,
      instagram: profile.instagram ?? null,
      twitter: profile.twitter ?? null,
      phone: profile.phone ?? null,
      email: profile.email ?? null,
      image: profile.image ?? null,
      rating: profile.rating,
      status: profile.status,
    });
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, JSON.stringify(profiles, null, 2), 'utf-8');
  console.log(`[build-hypnotists] Wrote ${profiles.length} profiles to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
