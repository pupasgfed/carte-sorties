#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const profilesDir = join(root, 'data', 'hypnotists');
const schemaPath = join(root, 'data', 'hypnotists.schema.json');

async function main() {
  const schema = JSON.parse(await readFile(schemaPath, 'utf-8'));
  const ajv = new Ajv({ allErrors: true, formats: { uri: true, email: true } });
  const validate = ajv.compile(schema);
  const files = (await readdir(profilesDir)).filter((file) => file.endsWith('.json'));
  let hasErrors = false;

  for (const file of files) {
    const data = JSON.parse(await readFile(join(profilesDir, file), 'utf-8'));
    if (!validate(data)) {
      hasErrors = true;
      console.error(`✗ ${file}`);
      for (const error of validate.errors ?? []) {
        console.error(`  ${error.instancePath || '(root)'}: ${error.message}`);
      }
    } else {
      console.log(`✓ ${file}`);
    }
  }

  if (hasErrors) {
    console.error('\nValidation failed.');
    process.exit(1);
  }
  console.log(`\nAll ${files.length} hypnotist files valid.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
