#!/usr/bin/env node
/**
 * Build guard for the source system (SPEC §6.2).
 *
 * Fails the build when a page can publish a claim without a traceable source.
 * Run standalone with `npm run check:sources`; `npm run build` runs it first.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const akar = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = (...bagian) => path.resolve(akar, ...bagian);

const galat = [];
const peringatan = [];

const FIELD_SUMBER = ['id', 'penerbit', 'judul', 'url', 'jenis', 'lisensi', 'diakses'];
const FIELD_DATASET = ['id', 'nama', 'sumber', 'asal', 'lisensi', 'diambil'];
const JENIS_SUMBER = ['web', 'jurnal', 'buku', 'dataset', 'video'];

function bacaYamlDir(dir) {
  const hasil = [];
  if (!fs.existsSync(dir)) return hasil;
  for (const nama of fs.readdirSync(dir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))) {
    const isi = yaml.load(fs.readFileSync(path.join(dir, nama), 'utf8'));
    if (isi && typeof isi === 'object') hasil.push({ ...isi, __berkas: nama });
    else galat.push(`${nama}: isi YAML bukan objek.`);
  }
  return hasil;
}

function tanggal(nilai) {
  if (nilai instanceof Date) return nilai;
  const teks = String(nilai ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(teks)) return null;
  const d = new Date(`${teks}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daftarMdx(dir) {
  const hasil = [];
  if (!fs.existsSync(dir)) return hasil;
  for (const entri of fs.readdirSync(dir, { withFileTypes: true })) {
    const lokasi = path.join(dir, entri.name);
    if (entri.isDirectory()) hasil.push(...daftarMdx(lokasi));
    else if (entri.name.endsWith('.mdx')) hasil.push(lokasi);
  }
  return hasil;
}

function frontmatter(teks) {
  const cocok = teks.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!cocok) return null;
  try {
    return yaml.load(cocok[1]);
  } catch (err) {
    return { __galat: String(err) };
  }
}

function idDariAtribut(tag, nama) {
  const ids = [];
  const tunggal = new RegExp(`${nama}\\s*=\\s*"([^"]+)"`, 'g');
  for (const m of tag.matchAll(tunggal)) ids.push(m[1]);
  const banyak = new RegExp(`${nama}\\s*=\\s*\\{\\s*\\[([^\\]]*)\\]\\s*\\}`, 'g');
  for (const m of tag.matchAll(banyak)) {
    for (const s of m[1].matchAll(/['"]([^'"]+)['"]/g)) ids.push(s[1]);
  }
  return ids;
}

const sumber = bacaYamlDir(folder('src/content/sumber'));
const dataset = bacaYamlDir(folder('src/content/dataset'));
const glosariumRaw = yaml.load(
  fs.readFileSync(folder('src/content/glosarium/istilah.yaml'), 'utf8'),
);

const idSumber = new Set();
const idDataset = new Set();

for (const s of sumber) {
  const nama = s.__berkas ?? s.id ?? '(tanpa nama)';
  for (const field of FIELD_SUMBER) {
    if (s[field] === undefined || s[field] === null || s[field] === '') {
      galat.push(`sumber/${nama}: field wajib "${field}" kosong.`);
    }
  }
  if (s.id) {
    if (idSumber.has(s.id)) galat.push(`sumber/${nama}: id "${s.id}" dipakai lebih dari sekali.`);
    idSumber.add(s.id);
  }
  if (s.jenis && !JENIS_SUMBER.includes(s.jenis)) {
    galat.push(`sumber/${nama}: jenis "${s.jenis}" tidak dikenal.`);
  }
  if (s.url && !/^https?:\/\//.test(String(s.url))) {
    galat.push(`sumber/${nama}: url harus diawali http:// atau https://.`);
  }
  if (!tanggal(s.diakses)) galat.push(`sumber/${nama}: diakses harus berformat YYYY-MM-DD.`);
  // Rule 4: license and access date are mandatory (already covered above, made explicit).
  if (!s.lisensi) galat.push(`sumber/${nama}: sumber tanpa lisensi.`);
  if (!s.diakses) galat.push(`sumber/${nama}: sumber tanpa tanggal akses.`);
}

for (const d of dataset) {
  const nama = d.__berkas ?? d.id ?? '(tanpa nama)';
  for (const field of FIELD_DATASET) {
    if (d[field] === undefined || d[field] === null || d[field] === '') {
      galat.push(`dataset/${nama}: field wajib "${field}" kosong.`);
    }
  }
  if (d.id) {
    if (idDataset.has(d.id)) galat.push(`dataset/${nama}: id "${d.id}" dipakai lebih dari sekali.`);
    idDataset.add(d.id);
  }
  if (d.sumber && !idSumber.has(d.sumber)) {
    galat.push(`dataset/${nama}: sumber "${d.sumber}" tidak ada di src/content/sumber/.`);
  }
  if (!tanggal(d.diambil)) galat.push(`dataset/${nama}: diambil harus berformat YYYY-MM-DD.`);
}

const idGlosarium = new Set(
  Array.isArray(glosariumRaw) ? glosariumRaw.map((g) => g?.id).filter(Boolean) : [],
);

const topik = daftarMdx(folder('src/content/topik'));
const idTopik = new Set(
  topik.map((file) => path.relative(folder('src/content/topik'), file).replace(/\.mdx$/, '').split(path.sep).join('/')),
);

const batasVerifikasi = new Date();
batasVerifikasi.setMonth(batasVerifikasi.getMonth() - 12);

for (const file of topik) {
  const relatif = path.relative(akar, file);
  const teks = fs.readFileSync(file, 'utf8');
  const data = frontmatter(teks);

  if (!data) {
    galat.push(`${relatif}: frontmatter tidak ditemukan.`);
    continue;
  }
  if (data.__galat) {
    galat.push(`${relatif}: frontmatter tidak bisa dibaca (${data.__galat}).`);
    continue;
  }

  const sumberTopik = Array.isArray(data.sumber) ? data.sumber : [];
  const datasetTopik = Array.isArray(data.dataset) ? data.dataset : [];
  const terbit = data.status === 'terbit';

  // Rule 3
  if (terbit && sumberTopik.length < 2) {
    galat.push(`${relatif}: status terbit hanya punya ${sumberTopik.length} sumber (minimal 2).`);
  }

  // Rule 2 (frontmatter)
  for (const id of sumberTopik) {
    if (!idSumber.has(id)) galat.push(`${relatif}: sumber "${id}" tidak ada di src/content/sumber/.`);
  }
  for (const id of datasetTopik) {
    if (!idDataset.has(id)) galat.push(`${relatif}: dataset "${id}" tidak ada di src/content/dataset/.`);
  }

  // Rule 1 & 2 (body)
  for (const m of teks.matchAll(/<Figure\b([^>]*)>/g)) {
    const tag = m[0];
    const idsSumber = idDariAtribut(tag, 'source');
    const idsDataset = idDariAtribut(tag, 'dataset');
    if (idsSumber.length === 0 && idsDataset.length === 0) {
      galat.push(`${relatif}: <Figure> tanpa source atau dataset.`);
    }
    for (const id of [...idsSumber, ...idsDataset]) {
      if (idsDataset.includes(id) ? !idDataset.has(id) : !idSumber.has(id)) {
        galat.push(`${relatif}: <Figure> merujuk id "${id}" yang tidak ada di YAML.`);
      }
    }
  }

  for (const m of teks.matchAll(/<img\b[^>]*>/g)) {
    if (!/\b(source|data-source)\s*=/.test(m[0])) {
      galat.push(`${relatif}: <img> tanpa source atau data-source.`);
    }
  }
  if (/!\[[^\]]*\]\([^)]*\)/.test(teks)) {
    galat.push(`${relatif}: gambar markdown ditemukan; bungkus dengan <Figure source="...">.`);
  }

  for (const m of teks.matchAll(/<Cite\b[^>]*\bid\s*=\s*"([^"]+)"/g)) {
    const id = m[1];
    if (!idSumber.has(id)) {
      galat.push(`${relatif}: <Cite id="${id}"> tidak ada di src/content/sumber/.`);
    }
    if (!sumberTopik.includes(id)) {
      galat.push(
        `${relatif}: <Cite id="${id}"> tidak dicantumkan di frontmatter sumber, jadi nomornya tidak akan muncul di daftar.`,
      );
    }
  }

  for (const id of Array.isArray(data.glosarium) ? data.glosarium : []) {
    if (!idGlosarium.has(id)) galat.push(`${relatif}: istilah glosarium "${id}" tidak ada.`);
  }

  for (const id of Array.isArray(data.terkait) ? data.terkait : []) {
    if (!idTopik.has(id)) peringatan.push(`${relatif}: topik terkait "${id}" belum ada.`);
  }

  // Rule 5: stale verification is a warning, not a failure.
  const dicek = tanggal(
    data.diverifikasi instanceof Date
      ? data.diverifikasi.toISOString().slice(0, 10)
      : data.diverifikasi,
  );
  if (terbit && (!dicek || dicek < batasVerifikasi)) {
    peringatan.push(
      `${relatif}: verifikasi terakhir ${data.diverifikasi ?? '—'} sudah lebih dari 12 bulan.`,
    );
  }
}

console.log(
  `Sumber: ${sumber.length} · dataset: ${dataset.length} · topik: ${topik.length} · glosarium: ${idGlosarium.size}`,
);

for (const pesan of peringatan) console.warn(`PERINGATAN  ${pesan}`);
for (const pesan of galat) console.error(`GALAT       ${pesan}`);

if (galat.length > 0) {
  console.error(`\n${galat.length} masalah sumber ditemukan. Build dihentikan.`);
  process.exit(1);
}

console.log('Semua aturan sumber terpenuhi.');
