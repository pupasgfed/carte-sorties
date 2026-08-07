#!/usr/bin/env node
/**
 * Validation script — checks every event JSON file in /data/events against
 * the JSON Schema in /data/schema.json.
 *
 * Usage:  node scripts/validate-events.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const eventsDir = join(root, 'data', 'events');
const schemaPath = join(root, 'data', 'schema.json');

async function main() {
  const schema = JSON.parse(await readFile(schemaPath, 'utf-8'));
  const ajv = new Ajv({ allErrors: true, formats: { date: true } });
  const validate = ajv.compile(schema);

  const files = (await readdir(eventsDir)).filter((f) => f.endsWith('.json'));
  let hasErrors = false;

  for (const file of files) {
    const raw = await readFile(join(eventsDir, file), 'utf-8');
    const data = JSON.parse(raw);

    if (!validate(data)) {
      hasErrors = true;
      console.error(`✗ ${file}`);
      for (const err of validate.errors ?? []) {
        console.error(`  ${err.instancePath || '(root)'}: ${err.message}`);
      }
    } else {
      console.log(`✓ ${file}`);
    }
  }

  if (hasErrors) {
    console.error('\nValidation failed.');
    process.exit(1);
  }
  console.log(`\nAll ${files.length} event files valid.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
