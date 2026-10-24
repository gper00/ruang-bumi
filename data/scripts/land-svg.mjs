/**
 * Hasilkan `src/lib/duniaPath.ts` dari `public/data/land.geojson`.
 *
 * Peta di PetaArus bersifat skematik, jadi koordinat dibulatkan ke bilangan bulat
 * derajat proyeksi dan ring kecil dibuang. Jalankan ulang dengan:
 *   node data/scripts/land-svg.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const akar = path.resolve(import.meta.dirname, '../..');
const masuk = path.join(akar, 'public/data/land.geojson');
const keluar = path.join(akar, 'src/lib/duniaPath.ts');

const geo = JSON.parse(fs.readFileSync(masuk, 'utf8'));

const proyeksi = (lon, lat) => [
  Math.round(((lon + 180) / 360) * 1000),
  Math.round(((90 - lat) / 180) * 500),
];

const bagian = [];
let titik = 0;

for (const fitur of geo.features) {
  if (!fitur.geometry) continue;
  const poligon =
    fitur.geometry.type === 'Polygon'
      ? [fitur.geometry.coordinates]
      : fitur.geometry.type === 'MultiPolygon'
        ? fitur.geometry.coordinates
        : [];

  for (const poli of poligon) {
    for (const ring of poli) {
      const bersih = [];
      for (const [lon, lat] of ring) {
        const [x, y] = proyeksi(lon, lat);
        const terakhir = bersih[bersih.length - 1];
        if (!terakhir || terakhir[0] !== x || terakhir[1] !== y) bersih.push([x, y]);
      }
      if (bersih.length < 4) continue;
      const d =
        `M${bersih[0][0]} ${bersih[0][1]}` +
        bersih
          .slice(1)
          .map(([x, y]) => `L${x} ${y}`)
          .join('') +
        'Z';
      bagian.push(d);
      titik += bersih.length;
    }
  }
}

const d = bagian.join('');
const isi = `// Dibuat oleh data/scripts/land-svg.mjs dari public/data/land.geojson.
// Jangan diedit manual: jalankan ulang skripnya bila data peta berubah.
export const DUNIA_PATH = '${d}';
`;

fs.writeFileSync(keluar, isi);
const ukuran = fs.statSync(keluar).size;
console.log(`duniaPath.ts: ${bagian.length} ring, ${titik} titik, ${(ukuran / 1024).toFixed(1)} KB`);
