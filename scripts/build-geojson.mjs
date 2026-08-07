#!/usr/bin/env node
/**
 * Build script — merges all event JSON files in /data/events into a single
 * compiled GeoJSON FeatureCollection at /public/events.geojson.
 *
 * Usage:  node scripts/build-geojson.js
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const eventsDir = join(root, 'data', 'events');
const outDir = join(root, 'public');
const outFile = join(outDir, 'events.geojson');

async function main() {
  const files = (await readdir(eventsDir)).filter((f) => f.endsWith('.json'));
  const features = [];

  for (const file of files) {
    const raw = await readFile(join(eventsDir, file), 'utf-8');
    const event = JSON.parse(raw);

    // Basic date validation: date_end must be null or >= date_start.
    if (event.date_end && event.date_end < event.date_start) {
      throw new Error(
        `[build] ${file}: date_end (${event.date_end}) is before date_start (${event.date_start})`,
      );
    }

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [event.lng, event.lat],
      },
      properties: {
        id: event.id,
        title: event.title,
        description: event.description ?? null,
        date_start: event.date_start,
        date_end: event.date_end ?? null,
        city: event.city,
        link: event.link ?? null,
        image: event.image ?? null,
        status: event.status,
      },
    });
  }

  const geojson = {
    type: 'FeatureCollection',
    features,
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, JSON.stringify(geojson, null, 2), 'utf-8');
  console.log(`[build] Wrote ${features.length} features to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
