#!/usr/bin/env node
/**
 * Validation script — checks every markdown article file in /data/articles
 * against the JSON Schema in /data/articles.schema.json (frontmatter only).
 *
 * Usage:  node scripts/validate-articles.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const articlesDir = join(root, 'data', 'articles');
const schemaPath = join(root, 'data', 'articles.schema.json');

async function main() {
  const schema = JSON.parse(await readFile(schemaPath, 'utf-8'));
  const ajv = new Ajv({ allErrors: true, formats: { date: true } });
  const validate = ajv.compile(schema);

  const files = (await readdir(articlesDir)).filter((f) => f.endsWith('.md'));
  let hasErrors = false;

  for (const file of files) {
    const raw = await readFile(join(articlesDir, file), 'utf-8');
    const { data: fm, content: body } = matter(raw);
    const data = {
      ...fm,
      date: fm.date ? new Date(fm.date).toISOString().slice(0, 10) : undefined,
      body: body.trim(),
    };

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
  console.log(`\nAll ${files.length} article files valid.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
