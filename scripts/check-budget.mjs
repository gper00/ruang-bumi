#!/usr/bin/env node
/**
 * Performance budget guard (SPEC §11).
 *
 * Fails the build when the output exceeds the budgets:
 *   - Initial JS per page: < 60 KB gzip (every dist HTML page)
 *   - World total: all JS chunks + map GeoJSON < 250 KB gzip
 *
 * Run after `astro build`; wired into `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const akar = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(akar, 'dist');

const BUDGET_HALAMAN_KB = 60; // gzip, JS awal tanpa visual
const BUDGET_TOTAL_KB = 250; // gzip, semua chunk JS + data peta
const KB = 1024;

if (!fs.existsSync(dist)) {
  console.error('dist/ tidak ditemukan. Jalankan `astro build` terlebih dahulu.');
  process.exit(1);
}

/** @returns {string[]} semua path berkas di bawah `dir` yang berakhiran `ext`. */
function cariBerkas(dir, ext, hasil = []) {
  if (!fs.existsSync(dir)) return hasil;
  for (const entri of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entri.name);
    if (entri.isDirectory()) cariBerkas(p, ext, hasil);
    else if (entri.name.endsWith(ext)) hasil.push(p);
  }
  return hasil;
}

function gzipSize(buf) {
  return zlib.gzipSync(buf, { level: 9 }).length;
}

/** Ekstrak <script src> + <link rel=modulepreload> URL aset, dan isi <script> inline. */
function asetAwal(html) {
  const urls = new Set();
  const inline = [];
  const regex =
    /<script([^>]*)>([\s\S]*?)<\/script>|<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"[^>]*>/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    if (m[3]) {
      if (m[3].startsWith('/')) urls.add(m[3].split('?')[0]);
      continue;
    }
    const attrs = m[1] ?? '';
    const isi = m[2] ?? '';
    const srcMatch = attrs.match(/src="([^"]+)"/);
    if (srcMatch) {
      if (srcMatch[1].startsWith('/')) urls.add(srcMatch[1].split('?')[0]);
    } else if (isi.trim()) {
      inline.push(isi);
    }
  }
  return { urls: [...urls], inline };
}

const halamanHtml = cariBerkas(dist, '.html');
if (halamanHtml.length === 0) {
  console.error('Tidak ada HTML di dist/. Build tampaknya belum berjalan.');
  process.exit(1);
}

let gagal = false;
let maksAwal = { halaman: '', kb: 0 };

for (const html of halamanHtml) {
  const isi = fs.readFileSync(html, 'utf8');
  const { urls, inline } = asetAwal(isi);
  let total = 0;
  for (const url of urls) {
    const berkas = path.join(dist, url);
    if (!fs.existsSync(berkas)) {
      console.error(`BERKAS HILANG: ${url} direferensikan di ${path.relative(dist, html)} tetapi tidak ada di dist/.`);
      gagal = true;
      continue;
    }
    total += gzipSize(fs.readFileSync(berkas));
  }
  for (const kode of inline) total += gzipSize(Buffer.from(kode, 'utf8'));
  const kb = total / KB;
  if (kb > maksAwal.kb) maksAwal = { halaman: path.relative(dist, html), kb };
  if (kb > BUDGET_HALAMAN_KB) {
    console.error(
      `BUDGET TERLAMPAU: JS awal ${path.relative(dist, html)} = ${kb.toFixed(1)} KB gzip (budget ${BUDGET_HALAMAN_KB} KB).`,
    );
    gagal = true;
  }
}

// Total berat "dunia": semua chunk JS (termasuk Leaflet dynamic-import) + data peta.
const jsChunks = cariBerkas(path.join(dist, '_astro'), '.js');
const dataPeta = ['plates.geojson', 'land.geojson']
  .map((n) => path.join(dist, 'data', n))
  .filter((p) => fs.existsSync(p));

let totalKb = 0;
for (const berkas of [...jsChunks, ...dataPeta]) {
  totalKb += gzipSize(fs.readFileSync(berkas)) / KB;
}

console.log(`Halaman diperiksa: ${halamanHtml.length}`);
console.log(`JS awal terberat: ${maksAwal.halaman} = ${maksAwal.kb.toFixed(1)} KB gzip (budget ${BUDGET_HALAMAN_KB} KB)`);
console.log(`Total JS + data peta: ${totalKb.toFixed(1)} KB gzip (budget ${BUDGET_TOTAL_KB} KB)`);

if (totalKb > BUDGET_TOTAL_KB) {
  console.error(
    `BUDGET TERLAMPAU: total ${totalKb.toFixed(1)} KB gzip melebihi ${BUDGET_TOTAL_KB} KB.`,
  );
  gagal = true;
}

if (gagal) process.exit(1);
console.log('Semua budget performa terpenuhi.');
