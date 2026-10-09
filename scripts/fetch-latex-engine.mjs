#!/usr/bin/env node
// Puts the files the LaTeX Lab loads at runtime into public/core/busytex.
//
// The full BusyTeX release is a 520 MB archive that unpacks to ~685 MB, and
// most of it (texlive-recommended/extra) is never requested: packages beyond
// texlive-basic stream from the TeX Live endpoint on demand. This pulls only
// the engine, texlive-basic and biber (~160 MB), so the deploy stays small
// and the 340 MB data packages never ship.
//
// Every file is checked against a pinned SHA-256: these scripts run on our
// origin, so a swapped release asset must fail the build, not ship.
//
// Usage: node scripts/fetch-latex-engine.mjs   (no-op when files are present)

import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const destRoot = join(root, 'public', 'core');
const destDir = join(destRoot, 'busytex');

const { version } = JSON.parse(
  readFileSync(join(root, 'node_modules', 'texlyre-busytex', 'package.json'), 'utf8')
);

// Pinned per texlyre-busytex version. The worker and pipeline scripts must
// match the package's runtime, so a version bump needs new hashes here.
const CHECKSUMS = {
  '1.4.0': {
    'busytex_worker.js': '80eca56a2eb015bdfbebff26e539dd793407b73b6c1cd351170e6fdb6e17c39a',
    'busytex_biber.js': 'e1a3ff55a120e392d3a7ef27f1bff1978c7a9d5978999296e39e1cfeac01d923',
    'busytex_pipeline.js': '4855e8fec24e8df952e1080d902791752bcdf283f4fae15811c371dd3ba3389e',
    'busytex.js': '875b87795162cb26b15bd93cffa2e8739bcb900d623ab904029b39402508a1a4',
    'busytex.wasm': '8d1988fc58cd1611c3cbd6bd986c3e607e5ff44f1d94252207ff7aae4cee72e0',
    'texlive-basic.js': 'd4abc2e93a1ae33099107c6ad8a61813978cd44036a95697db2f2365a393c283',
    'texlive-basic.data': 'ccb35d98d77cbaf988e1481f8538709f72166196785cf6b8785eabe6c8fb2993',
    // Loaded only when a document uses biblatex with backend=biber.
    'biber.js': 'f097b241ec1dfaff8c43b7c3e242a85c535d4a24b6252288da869d1a8b465c08',
    'biber.wasm': '6c2ddccf3b95e06b419d4aee5f88ef10ddec658ce760fabb34d7145371ff18c5',
    'biber.data': '9ea1357e6180477479b5edfe17538ba655ebebc03142a195d85fb1d47899df21',
  },
};

const ARCHIVE_URL = `https://github.com/TeXlyre/texlyre-busytex/releases/download/assets-v${version}/busytex-assets.tar.gz`;

const expected = CHECKSUMS[version];
if (!expected) {
  console.error(
    `No pinned checksums for texlyre-busytex ${version}. Download the release, ` +
      `verify it, and add its hashes to CHECKSUMS in scripts/fetch-latex-engine.mjs:\n` +
      `  npx texlyre-busytex download-assets ./public/core\n` +
      `  (cd public/core/busytex && shasum -a 256 ${Object.keys(CHECKSUMS['1.4.0']).join(' ')})`
  );
  process.exit(1);
}

const files = Object.keys(expected);

async function sha256(path) {
  const hash = createHash('sha256');
  await pipeline(createReadStream(path), hash);
  return hash.digest('hex');
}

async function mismatches() {
  const bad = [];
  for (const name of files) {
    const path = join(destDir, name);
    if (!existsSync(path)) bad.push(`${name}: missing`);
    else {
      const actual = await sha256(path);
      if (actual !== expected[name]) bad.push(`${name}: sha256 ${actual}`);
    }
  }
  return bad;
}

if ((await mismatches()).length === 0) {
  console.log(`LaTeX engine ${version} already in public/core/busytex`);
  process.exit(0);
}

console.log(`Fetching LaTeX engine ${version} from ${ARCHIVE_URL}`);
const started = Date.now();
mkdirSync(destRoot, { recursive: true });

const res = await fetch(ARCHIVE_URL);
if (!res.ok || !res.body) {
  console.error(`Download failed: HTTP ${res.status}`);
  process.exit(1);
}

// Stream straight into tar and extract only the files we serve, so the
// 520 MB archive never touches the disk.
const tar = spawn('tar', ['-xzf', '-', '-C', destRoot, ...files.map((f) => `busytex/${f}`)], {
  stdio: ['pipe', 'inherit', 'inherit'],
});
const tarExit = new Promise((resolve, reject) => {
  tar.on('error', reject);
  tar.on('close', resolve);
});
await pipeline(Readable.fromWeb(res.body), tar.stdin);
const code = await tarExit;
if (code !== 0) {
  console.error(`tar exited with code ${code}`);
  process.exit(1);
}

const bad = await mismatches();
if (bad.length) {
  console.error(`LaTeX engine files failed verification:\n  ${bad.join('\n  ')}`);
  process.exit(1);
}
console.log(`LaTeX engine ready in ${((Date.now() - started) / 1000).toFixed(0)} s`);
