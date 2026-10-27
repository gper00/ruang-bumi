#!/usr/bin/env node
/**
 * Build the map data used by <MapView>.
 *
 * Input: the prototype `simple-proto/Peta Lempeng Tektonik.html`, which embeds
 * PB2002 plate polygons (Bird, 2003) and a simplified Natural Earth land layer.
 * Output: data/processed/*.geojson plus copies in public/data/ for the site.
 *
 * Run with: npm run data:build
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sini = path.dirname(fileURLToPath(import.meta.url));
const akar = path.resolve(sini, '../..');
const prototipe = path.resolve(akar, 'simple-proto/Peta Lempeng Tektonik.html');
const keluarProses = path.resolve(akar, 'data/processed');
const keluarPublik = path.resolve(akar, 'public/data');

const html = fs.readFileSync(prototipe, 'utf8');

/** Read a JS array literal assigned with `var NAME = [...]`, honouring strings. */
function ambilArray(nama) {
  const penanda = `var ${nama} = `;
  const mulai = html.indexOf(penanda);
  if (mulai === -1) throw new Error(`Tidak menemukan ${nama} di prototipe`);
  let i = html.indexOf('[', mulai + penanda.length);
  const awal = i;
  let kedalaman = 0;
  let dalamString = false;
  let escape = false;

  for (; i < html.length; i += 1) {
    const c = html[i];
    if (dalamString) {
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === '"') dalamString = false;
      continue;
    }
    if (c === '"') dalamString = true;
    else if (c === '[') kedalaman += 1;
    else if (c === ']') {
      kedalaman -= 1;
      if (kedalaman === 0) {
        return JSON.parse(partisi(html.slice(awal, i + 1)));
      }
    }
  }
  throw new Error(`Array ${nama} tidak tertutup`);

  // The embedded literal is valid JSON except for a handful of trailing commas.
  function partisi(teks) {
    return teks.replace(/,\s*([\]}])/g, '$1');
  }
}

const bulat = (n) => Math.round(n * 10) / 10;

function bersihkanRing(ring) {
  const hasil = [];
  for (const [lon, lat] of ring) {
    const titik = [bulat(lon), bulat(lat)];
    const akhir = hasil[hasil.length - 1];
    if (!akhir || akhir[0] !== titik[0] || akhir[1] !== titik[1]) hasil.push(titik);
  }
  if (hasil.length && (hasil[0][0] !== hasil[hasil.length - 1][0] || hasil[0][1] !== hasil[hasil.length - 1][1])) {
    hasil.push([...hasil[0]]);
  }
  return hasil;
}

function luasKasar(ring) {
  let luas = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    luas += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(luas / 2);
}

const AMBANG_LUAS = 0.35; // derajat persegi; membuang pulau-pulau sangat kecil

function bersihkanGeometri(geom, { saringKecil = false } = {}) {
  if (!geom) return null;
  if (geom.type === 'Polygon') {
    const rings = geom.coordinates.map(bersihkanRing).filter((r) => r.length >= 4);
    if (rings.length === 0) return null;
    if (saringKecil && luasKasar(rings[0]) < AMBANG_LUAS) return null;
    return { type: 'Polygon', coordinates: rings };
  }
  if (geom.type === 'MultiPolygon') {
    const polys = [];
    for (const poly of geom.coordinates) {
      const rings = poly.map(bersihkanRing).filter((r) => r.length >= 4);
      if (rings.length === 0) continue;
      if (saringKecil && luasKasar(rings[0]) < AMBANG_LUAS) continue;
      polys.push(rings);
    }
    if (polys.length === 0) return null;
    return { type: 'MultiPolygon', coordinates: polys };
  }
  throw new Error(`Geometri tidak didukung: ${geom.type}`);
}

function tulis(nama, fitur, kePublik = true) {
  const fc = { type: 'FeatureCollection', features: fitur };
  const teks = JSON.stringify(fc);
  fs.mkdirSync(keluarProses, { recursive: true });
  fs.writeFileSync(path.join(keluarProses, nama), teks);
  if (kePublik) {
    fs.mkdirSync(keluarPublik, { recursive: true });
    fs.writeFileSync(path.join(keluarPublik, nama), teks);
  }
  console.log(`  ${nama}: ${fitur.length} fitur, ${(teks.length / 1024).toFixed(1)} KB`);
}

console.log('Membangun data peta…');

const land = ambilArray('LAND');
const plates = ambilArray('PLATES');

const fiturLand = [];
for (const geom of land) {
  const bersih = bersihkanGeometri(geom);
  if (bersih) fiturLand.push({ type: 'Feature', properties: {}, geometry: bersih });
}

const fiturPlates = [];
for (const plate of plates) {
  const bersih = bersihkanGeometri(plate.g, { saringKecil: true });
  if (!bersih) continue;
  fiturPlates.push({
    type: 'Feature',
    properties: { name: plate.n, code: plate.c ?? '' },
    geometry: bersih,
  });
}

tulis('plates.geojson', fiturPlates);
tulis('land.geojson', fiturLand);

const total =
  fs.statSync(path.join(keluarProses, 'plates.geojson')).size +
  fs.statSync(path.join(keluarProses, 'land.geojson')).size;
console.log(`Total GeoJSON: ${(total / 1024).toFixed(1)} KB (target < 300 KB)`);

const catatan = path.join(keluarProses, 'README.md');
fs.writeFileSync(
  catatan,
  [
    '# Data peta',
    '',
    'Dihasilkan oleh `data/scripts/plates.mjs` dari prototipe `simple-proto/Peta Lempeng Tektonik.html`.',
    'Jangan mengedit berkas di folder ini secara manual.',
    '',
    '- `plates.geojson`: batas lempeng PB2002 (Bird, 2003), koordinat dibulatkan 1 desimal.',
    '- `land.geojson`: garis besar daratan untuk orientasi, disederhanakan.',
    '',
  ].join('\n'),
);
