#!/usr/bin/env node
/**
 * Link checker.
 *
 * Internal links in dist/ must resolve to a page, asset, or heading anchor:
 * those failures exit 1. External source URLs only warn, because a third-party
 * site can block bots or go down without our build being wrong (SPEC §13).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const akar = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(akar, 'dist');

if (!fs.existsSync(dist)) {
  console.error('Folder dist/ belum ada. Jalankan build dulu.');
  process.exit(1);
}

function semuaBerkas(dir, ext, hasil = []) {
  for (const entri of fs.readdirSync(dir, { withFileTypes: true })) {
    const lokasi = path.join(dir, entri.name);
    if (entri.isDirectory()) semuaBerkas(lokasi, ext, hasil);
    else if (entri.name.endsWith(ext)) hasil.push(lokasi);
  }
  return hasil;
}

function berkasUntuk(urlPath) {
  const bersih = decodeURIComponent(urlPath.split('?')[0]);
  if (bersih.endsWith('/')) return path.join(dist, bersih, 'index.html');
  const langsung = path.join(dist, bersih);
  if (fs.existsSync(langsung) && fs.statSync(langsung).isFile()) return langsung;
  const html = `${langsung}.html`;
  if (fs.existsSync(html)) return html;
  const index = path.join(langsung, 'index.html');
  if (fs.existsSync(index)) return index;
  return null;
}

const html = semuaBerkas(dist, '.html');
const idCache = new Map();

function punyaId(berkas, id) {
  const isi = fs.readFileSync(berkas, 'utf8');
  const aman = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`id="${aman}"`).test(isi);
}

const galatInternal = [];
let tautanInternal = 0;

for (const berkas of html) {
  const isi = fs.readFileSync(berkas, 'utf8');
  for (const m of isi.matchAll(/\b(?:href|src)="(\/[^"]*)"/g)) {
    const url = m[1];
    if (url.startsWith('//')) continue;
    tautanInternal += 1;
    const [tanpaHash, hash] = url.split('#');
    let tujuan = berkasUntuk(tanpaHash || '/');
    if (!tujuan) {
      galatInternal.push(`${path.relative(dist, berkas)} -> ${url} (berkas tidak ada)`);
      continue;
    }
    if (hash) {
      if (!idCache.has(tujuan)) idCache.set(tujuan, tujuan.endsWith('.html'));
      if (tujuan.endsWith('.html') && !punyaId(tujuan, hash)) {
        galatInternal.push(`${path.relative(dist, berkas)} -> ${url} (anchor #${hash} tidak ada)`);
      }
    }
  }
}

const sumber = [];
const dirSumber = path.join(akar, 'src/content/sumber');
for (const nama of fs.readdirSync(dirSumber).filter((f) => f.endsWith('.yaml'))) {
  const data = yaml.load(fs.readFileSync(path.join(dirSumber, nama), 'utf8'));
  if (data?.url) sumber.push({ id: data.id, url: data.url });
}

const peringatanEksternal = [];
const lewatiEksternal = process.env.SKIP_EXTERNAL === '1';
for (const s of lewatiEksternal ? [] : sumber) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(s.url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      },
    });
    clearTimeout(timer);
    if (!res.ok) peringatanEksternal.push(`${s.id}: HTTP ${res.status} (${s.url})`);
  } catch (err) {
    peringatanEksternal.push(`${s.id}: tidak bisa dihubungi (${err.name})`);
  }
}

console.log(
  `Tautan internal diperiksa: ${tautanInternal} · sumber eksternal: ${sumber.length}${
    lewatiEksternal ? ' (dilewati, SKIP_EXTERNAL=1)' : ''
  }`,
);

for (const p of peringatanEksternal) console.warn(`PERINGATAN  ${p}`);
for (const g of galatInternal) console.error(`GALAT       ${g}`);

if (galatInternal.length > 0) {
  console.error(`\n${galatInternal.length} tautan internal rusak.`);
  process.exit(1);
}

console.log('Tautan internal valid.');
