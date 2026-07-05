import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localPathPattern = /["'`](\.\/(?:assets|[a-z0-9-]+\.html)[^"'`)]*)["'`]/gi;
const htmlFiles = readdirSync(root).filter((file) => file.endsWith('.html'));
const jsFiles = [
  'assets/main.js',
  'assets/works.js',
  'assets/showreel.js',
  'assets/tour.js'
];

const stripUrlSuffix = (value) => value.split('#')[0].split('?')[0];
const toFilePath = (reference) => path.resolve(root, stripUrlSuffix(reference.slice(2)));
const references = new Map();

function collectReferences(file) {
  const absolute = path.join(root, file);
  const source = readFileSync(absolute, 'utf8');
  for (const match of source.matchAll(localPathPattern)) {
    references.set(match[1], file);
  }
}

for (const file of [...htmlFiles, ...jsFiles]) {
  collectReferences(file);
}

const missing = [];
for (const [reference, owner] of references) {
  const filePath = toFilePath(reference);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    missing.push(`${reference} referenced from ${owner}`);
  }
}

if (!existsSync(path.join(root, 'index.html'))) {
  missing.push('index.html is required at the site root for Cloudflare Pages');
}

if (missing.length) {
  console.error('Static site check failed:');
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log(`Static site check passed: ${references.size} local references found.`);
