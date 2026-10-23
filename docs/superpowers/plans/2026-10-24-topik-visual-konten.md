# Perbaikan Konten & Visualisasi 5 Topik Baru — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memberi lima topik baru visualisasi khusus yang menjelaskan isinya, menulis ulang kontennya dengan sumber resmi, dan menghapus duplikat bioma.

**Architecture:** Setiap topik mendapat satu komponen React island (`client:visible`) berbasis SVG, dengan logika murni di `src/lib/*` agar bisa diuji Vitest tanpa JSX. Leaflet dilepas dari kelima halaman; `MapView` tetap untuk topik lempeng. Konten ditulis ulang memakai sumber NOAA/USGS/NASA yang sudah diverifikasi.

**Tech Stack:** Astro 7, React 19, TypeScript, Vitest 5, Playwright (`playwright-core`), axe-core, js-yaml.

**Spec:** `docs/superpowers/specs/2026-10-24-topik-visual-konten-design.md`

## Global Constraints

- Semua perintah `npm`/`npx` dijalankan dengan Node 24.21.0:
  `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 24.21.0 >/dev/null && <perintah>`
- Tanpa dependensi runtime baru. Tanpa `MapView`/Leaflet di kelima halaman ini.
- Warna hanya dari `src/styles/tokens.css`; jangan menulis nilai warna baru.
- WCAG 2.2 AA: target sentuh ≥24×24 px, fokus terlihat, kontras teks ≥4,5:1, `aria-live` untuk perubahan penting, ringkasan teks di luar SVG.
- Semua komponen `client:visible`, SSR-safe (tidak menyentuh `window` saat render).
- Setiap MDX topik diawali blok import yang sama dengan `ekologi/bioma.mdx` (sesuaikan komponen visualnya):
  ```mdx
  import KomponenVisual from '../../../components/viz/KomponenVisual';
  import Figure from '../../../components/sumber/Figure.astro';
  import DataNote from '../../../components/sumber/DataNote.astro';
  import Cite from '../../../components/sumber/Cite.astro';
  import Term from '../../../components/glosarium/Term.astro';
  import Quiz from '../../../components/quiz/Quiz';
  ```
- Setiap `input`, `select`, dan `button` wajib punya label programatik (label terlihat atau `aria-label`) dan target ≥24×24 px.
- Setiap `<Cite id>` harus ada di YAML sumber **dan** di frontmatter `sumber`; setiap `<Figure>` wajib punya `source`.
- Istilah karangan dilarang: `wetan`, `patchungan`, `auifer`, "parit pleret".
- `status: "terbit"` dan `diverifikasi: 2026-10-24` setelah checklist lolos.
- Budget build: JS awal <60 KB gzip, total <250 KB gzip.
- Satu commit per task, pesan bahasa Indonesia.

## Review Focus

- **Keyboard-only:** semua kontrol (slider, tombol zona/arus/musim/simpul) bisa dioperasikan Tab + panah/Enter — dicek di Task 9/10.
- **`prefers-reduced-motion: reduce`:** kelima halaman tetap termuat dan kontrol tetap berfungsi — dicek di Task 9 (konteks Playwright `reducedMotion`).
- **Viewport 360 px:** tidak ada overflow horizontal — dicek di Task 9 (loop ui-check).
- **Input di luar rentang:** `NaN`, negatif, >4.000 m, intensitas <0/>100 — unit test di Task 4–8.
- **Integritas sumber:** `<Cite>`/`<Figure source>` harus ada di YAML + frontmatter, dan tidak ada istilah karangan — `check:sources` + `tests/unit/konten.test.ts` di Task 10.

---

## Struktur berkas

```
src/lib/zonaLaut.ts              konstanta + zonaPadaKedalaman()
src/lib/arusLaut.ts              ARUS + saringArus()
src/lib/aliranSungai.ts          keadaanHilir()
src/lib/danauMusim.ts            MUSIM + keadaanDanau()
src/lib/sistemBumi.ts            SIMPUL + ALIRAN + aliranDari()
src/lib/duniaPath.ts             path SVG dunia (dihasilkan sekali)
data/scripts/land-svg.mjs        generator path dari public/data/land.geojson
src/components/viz/useReduceMotion.ts
src/components/viz/ZonaLaut.tsx + .css
src/components/viz/PetaArus.tsx + .css
src/components/viz/AliranSungai.tsx + .css
src/components/viz/DanauMusim.tsx + .css
src/components/viz/SistemBumi.tsx + .css
tests/unit/{zona-laut,arus-laut,aliran-sungai,danau-musim,sistem-bumi}.test.ts
tests/unit/{konten-ocean,konten-arus,konten-sungai,konten-danau,konten-menghubungkan}.test.ts
tests/unit/bantuan-konten.ts     parser frontmatter untuk tes konten
tests/unit/konten.test.ts        pemeriksaan glosarium & aturan konten global
```

---

### Task 1: Sumber resmi

**Files:**
- Create: `src/content/sumber/noaa-layers-ocean.yaml`
- Create: `src/content/sumber/noaa-light-ocean.yaml`
- Create: `src/content/sumber/noaa-ocean-currents.yaml`
- Create: `src/content/sumber/noaa-gyre.yaml`
- Create: `src/content/sumber/noaa-thermohaline.yaml`
- Create: `src/content/sumber/usgs-watersheds.yaml`
- Create: `src/content/sumber/usgs-river-monitoring.yaml`
- Create: `src/content/sumber/usgs-lakes-stratification.yaml`
- Create: `src/content/sumber/nasa-earth-system.yaml`

**Interfaces:**
- Produces: id sumber `noaa-layers-ocean`, `noaa-light-ocean`, `noaa-ocean-currents`, `noaa-gyre`, `noaa-thermohaline`, `usgs-watersheds`, `usgs-river-monitoring`, `usgs-lakes-stratification`, `nasa-earth-system` — dipakai Task 2 dan Task 4–8.

- [ ] **Step 1: Tulis sembilan YAML sumber**

Semua memakai `lisensi: public-domain-us-gov`, `jenis: web`, `diakses: 2026-10-24`, kecuali `usgs-lakes-stratification` (`jenis: buku`).

| id | penerbit | judul | url |
|---|---|---|---|
| noaa-layers-ocean | NOAA | Layers of the Ocean | https://www.noaa.gov/jetstream/ocean/layers-of-ocean |
| noaa-light-ocean | NOAA Ocean Explorer | How far does light travel in the ocean? | https://oceanexplorer.noaa.gov/ocean-fact/light-distributed/ |
| noaa-ocean-currents | NOAA | Ocean currents | https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-currents |
| noaa-gyre | NOAA Ocean Service | What is a gyre? | https://oceanservice.noaa.gov/facts/gyre.html |
| noaa-thermohaline | NOAA Ocean Service | Thermohaline Circulation — Currents | https://oceanservice.noaa.gov/education/tutorial_currents/05conveyor1.html |
| usgs-watersheds | USGS | Watersheds and Drainage Basins | https://www.usgs.gov/water-science-school/science/watersheds-and-drainage-basins |
| usgs-river-monitoring | USGS | Monitoring Our Rivers and Streams | https://pubs.usgs.gov/fs/fs-077-02/ |
| usgs-lakes-stratification | USGS | Lakes and Reservoirs: Guidelines for Study Design and Sampling (Techniques and Methods 9-A10) | https://pubs.usgs.gov/tm/09/a10/tm9a10.pdf |
| nasa-earth-system | NASA | About the Earth as a System: Background Information | https://mynasadata.larc.nasa.gov/basic-page/about-earth-system-background-information |

- [ ] **Step 2: Verifikasi guard sumber**

Run: `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 24.21.0 >/dev/null && npm run check:sources`
Expected: `Semua aturan sumber terpenuhi.` tanpa `GALAT`.

- [ ] **Step 3: Commit**

```bash
git add src/content/sumber
git commit -m "Tambah sumber resmi NOAA, USGS, dan NASA untuk 5 topik"
```

---

### Task 2: Glosarium bersih + helper tes konten

**Files:**
- Modify: `src/content/glosarium/istilah.yaml`
- Create: `tests/unit/bantuan-konten.ts`
- Create: `tests/unit/konten.test.ts`

**Interfaces:**
- Produces: `bacaMdx(relatif: string): { data: Record<string, unknown>; isi: string }` di `tests/unit/bantuan-konten.ts`; `relatif` contoh `topik/laut/ocean.mdx`.

- [ ] **Step 1: Tulis tes glosarium yang gagal**

`tests/unit/konten.test.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

const akar = path.resolve(import.meta.dirname, '../..');
const glosarium = yaml.load(
  fs.readFileSync(path.join(akar, 'src/content/glosarium/istilah.yaml'), 'utf8'),
) as Array<{ id: string; istilah: string; definisi: string; sumber: string }>;

describe('glosarium', () => {
  it('tidak memuat istilah karangan', () => {
    const id = glosarium.map((g) => g.id);
    expect(id).not.toContain('wetan');
    expect(id).not.toContain('patchungan');
    expect(id).not.toContain('auifer');
  });

  it('memuat istilah baru yang dipakai 5 topik', () => {
    const id = new Set(glosarium.map((g) => g.id));
    for (const wajib of [
      'zona-fotik', 'zona-senja', 'zona-gelap', 'arus-laut', 'efek-coriolis',
      'upwelling', 'daerah-aliran-sungai', 'sedimen', 'muara',
      'epilimnion', 'termoklin', 'hipolimnion', 'sistem-bumi',
    ]) {
      expect(id.has(wajib), wajib).toBe(true);
    }
  });

  it('setiap entri lengkap dan sumbernya ada', () => {
    const idSumber = new Set(
      fs.readdirSync(path.join(akar, 'src/content/sumber'))
        .filter((f) => f.endsWith('.yaml'))
        .map((f) => (yaml.load(fs.readFileSync(path.join(akar, 'src/content/sumber', f), 'utf8')) as { id: string }).id),
    );
    for (const g of glosarium) {
      expect(g.istilah?.length, g.id).toBeGreaterThan(0);
      expect(g.definisi?.length, g.id).toBeGreaterThan(10);
      expect(idSumber.has(g.sumber), `${g.id} → ${g.sumber}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/konten.test.ts`
Expected: FAIL — `wetan` masih ada dan istilah baru belum ada.

- [ ] **Step 3: Edit glosarium**

Hapus tiga entri: `wetan`, `patchungan`, `auifer`. Tambahkan entri berikut (sumber sesuai Task 1):

| id | istilah | definisi | sumber |
|---|---|---|---|
| zona-fotik | Zona fotik | Lapisan permukaan laut sampai sekitar 200 meter yang masih cukup terang untuk fotosintesis. | noaa-layers-ocean |
| zona-senja | Zona senja | Lapisan laut sekitar 200–1.000 meter; cahaya sangat redup sehingga fotosintesis tidak berlangsung. | noaa-layers-ocean |
| zona-gelap | Zona gelap | Lapisan laut di bawah 1.000 meter yang tidak menerima cahaya Matahari. | noaa-layers-ocean |
| arus-laut | Arus laut | Pergerakan air laut yang terus-menerus; di permukaan digerakkan angin, di kedalaman oleh perbedaan suhu dan kadar garam. | noaa-ocean-currents |
| efek-coriolis | Efek Coriolis | Pembelokan arah gerak air dan udara karena Bumi berputar. | noaa-ocean-currents |
| upwelling | Upwelling | Naiknya air dingin dari kedalaman ke permukaan, membawa nutrisi. | noaa-ocean-currents |
| daerah-aliran-sungai | Daerah aliran sungai | Seluruh daratan yang mengalirkan air hujan dan air tanah ke satu titik keluaran. | usgs-watersheds |
| sedimen | Sedimen | Partikel tanah atau batuan yang terangkat dan terbawa air. | usgs-watersheds |
| muara | Muara | Tempat sungai bertemu laut dan air tawar bercampur dengan air laut. | usgs-watersheds |
| epilimnion | Epilimnion | Lapisan atas danau yang lebih hangat dan bercampur oleh angin. | usgs-lakes-stratification |
| termoklin | Termoklin | Lapisan peralihan di danau tempat suhu turun cepat terhadap kedalaman. | usgs-lakes-stratification |
| hipolimnion | Hipolimnion | Lapisan bawah danau yang lebih dingin dan padat. | usgs-lakes-stratification |
| sistem-bumi | Sistem Bumi | Kesatuan atmosfer, hidrosfer, biosfer, kriosfer, dan geosfer yang saling memengaruhi. | nasa-earth-system |

- [ ] **Step 4: Tulis helper tes konten**

`tests/unit/bantuan-konten.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const akar = path.resolve(import.meta.dirname, '../..');

export function bacaMdx(relatif: string) {
  const isi = fs.readFileSync(path.join(akar, 'src/content', relatif), 'utf8');
  const cocok = isi.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!cocok) throw new Error(`${relatif}: frontmatter tidak ditemukan`);
  return { data: yaml.load(cocok[1]) as Record<string, unknown>, isi };
}
```

- [ ] **Step 5: Jalankan, pastikan lolos**

Run: `npx vitest run tests/unit/konten.test.ts`
Expected: `3 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/content/glosarium/istilah.yaml tests/unit/konten.test.ts tests/unit/bantuan-konten.ts
git commit -m "Bersihkan glosarium karangan dan tambah istilah baru"
```

---

### Task 3: Hook reduced-motion

**Files:**
- Create: `src/components/viz/useReduceMotion.ts`

**Interfaces:**
- Produces: `export function useReduceMotion(): boolean` — dipakai Task 4–8 dan Task 8.

- [ ] **Step 1: Implementasikan hook**

```ts
import { useEffect, useState } from 'react';

/** true bila pengguna meminta animasi dikurangi; SSR-safe (default false). */
export function useReduceMotion(): boolean {
  const [kurang, setKurang] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ubah = () => setKurang(mq.matches);
    ubah();
    mq.addEventListener('change', ubah);
    return () => mq.removeEventListener('change', ubah);
  }, []);
  return kurang;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx astro check`
Expected: `0 errors` (hint boleh bertambah).

- [ ] **Step 3: Commit**

```bash
git add src/components/viz/useReduceMotion.ts
git commit -m "Tambah hook useReduceMotion untuk semua visual baru"
```

---

### Task 4: Topik laut/ocean — ZonaLaut

**Files:**
- Create: `src/lib/zonaLaut.ts`
- Test: `tests/unit/zona-laut.test.ts`
- Create: `src/components/viz/ZonaLaut.tsx`, `src/components/viz/ZonaLaut.css`
- Modify: `src/content/topik/laut/ocean.mdx`
- Test: `tests/unit/konten-ocean.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type IdZona = 'fotik' | 'senja' | 'gelap';
  export interface Zona { id: IdZona; nama: string; batas: [number, number]; cahaya: string; contoh: string[] }
  export const ZONA: readonly Zona[]; // urut fotik → senja → gelap
  export function zonaPadaKedalaman(meter: number): Zona; // NaN/negatif → fotik
  ```
- Selector untuk ui-check: `.zl`, `.zl-slider input`, `.zl-zona-nama`, `.zl-tombol-zona`.

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/zona-laut.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ZONA, zonaPadaKedalaman } from '../../src/lib/zonaLaut';

describe('zonaPadaKedalaman', () => {
  it('memetakan batas zona', () => {
    expect(zonaPadaKedalaman(0).id).toBe('fotik');
    expect(zonaPadaKedalaman(199).id).toBe('fotik');
    expect(zonaPadaKedalaman(200).id).toBe('senja');
    expect(zonaPadaKedalaman(999).id).toBe('senja');
    expect(zonaPadaKedalaman(1000).id).toBe('gelap');
    expect(zonaPadaKedalaman(4000).id).toBe('gelap');
  });
  it('menangani nilai di luar rentang', () => {
    expect(zonaPadaKedalaman(-50).id).toBe('fotik');
    expect(zonaPadaKedalaman(Number.NaN).id).toBe('fotik');
  });
  it('menyediakan tiga zona berurutan', () => {
    expect(ZONA.map((z) => z.id)).toEqual(['fotik', 'senja', 'gelap']);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/zona-laut.test.ts`
Expected: FAIL — modul `src/lib/zonaLaut.ts` tidak ada.

- [ ] **Step 3: Implementasikan `src/lib/zonaLaut.ts`**

Zona: fotik 0–200 m, senja 200–1.000 m, gelap 1.000–4.000 m. Isi `nama`, `cahaya`, `contoh` (2–3 contoh per zona) dengan kalimat Indonesia singkat. `zonaPadaKedalaman` menjepit nilai: `NaN`/negatif → fotik, >1.000 → gelap.

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `npx vitest run tests/unit/zona-laut.test.ts`
Expected: `3 passed`.

- [ ] **Step 5: Buat komponen `ZonaLaut.tsx` + CSS**

Ketentuan:
- SVG `viewBox="0 0 700 420"`, `role="img"` dengan `<title>`/`<desc>`.
- Tiga pita zona dengan warna turunan `var(--sea)`, `var(--sea-soft)`, `var(--ocean)`; label kedalaman 0/200/1.000/4.000 m.
- Kontrol: `<input type="range" min="0" max="4000" step="10">` di `.zl-slider`, plus tombol `.zl-tombol-zona` per zona (`aria-pressed`).
- Panel menampilkan `.zl-zona-nama` (nama zona terpilih), cahaya, dan contoh kehidupan.
- `aria-live="polite"` merangkum: `Kedalaman ${meter} meter, zona ${zona.nama}.`
- Ringkasan teks statis di bawah SVG yang menjelaskan ketiga zona.
- `useReduceMotion()` mematikan transisi CSS (kelas `.zl-tanpa-gerak` pada root).
- Mobile: panel di bawah SVG; tidak ada elemen >100% lebar.

- [ ] **Step 6: Tulis tes konten yang gagal**

`tests/unit/konten-ocean.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const { data, isi } = bacaMdx('topik/laut/ocean.mdx');

describe('topik laut/ocean', () => {
  it('memakai pertanyaan baru dan sumber resmi', () => {
    expect(String(data.pertanyaan)).toMatch(/zona/i);
    expect(data.sumber).toEqual(expect.arrayContaining(['noaa-layers-ocean', 'noaa-light-ocean']));
  });
  it('tidak memakai MapView dan tidak memuat istilah karangan', () => {
    expect(isi).not.toMatch(/<MapView/);
    expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
  });
  it('punya satu Figure bersumber dan tiga soal kuis', () => {
    expect(isi).toMatch(/<Figure[^>]*source="noaa-layers-ocean"/);
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
    expect((isi.match(/\bbenar:/g) ?? []).length).toBe(3);
  });
});
```

- [ ] **Step 7: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/konten-ocean.test.ts`
Expected: FAIL — konten lama masih memakai MapView/istilah karangan.

- [ ] **Step 8: Tulis ulang `ocean.mdx`**

Frontmatter:
- `pertanyaan: "Kenapa laut terbagi jadi beberapa zona, padahal airnya menyambung?"`
- `kategori: "laut"`, `level: "pemula"`, `menit: 5`
- `jawabanSingkat` ≤320 karakter: air menyambung, tetapi cahaya, suhu, dan tekanan berubah menurut kedalaman sehingga kehidupannya berbeda per zona.
- `terkait: ["laut/arus", "atmosfer/siklus-air", "ekologi/bioma"]`
- `sumber: ["noaa-layers-ocean", "noaa-light-ocean", "noaa-water-cycle"]`
- `glosarium: ["zona-fotik", "zona-senja", "zona-gelap"]`
- `dataset: []`, `status: "terbit"`, `diverifikasi: 2026-10-24`

Isi:
- `<Figure source="noaa-layers-ocean" caption="...">` berisi `<ZonaLaut client:visible />`.
- `<DataNote>`: ilustrasi, skala kedalaman tidak linier.
- "Kok bisa?" ≤500 kata dengan fakta: fotik 0–200 m cukup cahaya untuk fotosintesis; senja 200–1.000 m cahaya sangat redup; gelap >1.000 m tanpa cahaya matahari; kehidupan beradaptasi (mis. menghasilkan cahaya sendiri); air, panas, dan nutrisi tetap berpindah antarzona. Setiap fakta diberi `<Cite>`.
- "Fakta menarik" 3 butir.
- Kuis 3 soal:

```mdx
soal={[
  { tanya: 'Sampai kedalaman berapa zona epipelagik (zona cahaya)?',
    opsi: ['0–200 meter', '200–1.000 meter', 'Lebih dari 4.000 meter'], benar: 0,
    penjelasan: 'Zona epipelagik membentang dari permukaan sampai sekitar 200 meter, tempat cahaya masih cukup untuk fotosintesis.' },
  { tanya: 'Mengapa fotosintesis tidak berlangsung di zona senja?',
    opsi: ['Karena airnya terlalu asin', 'Karena cahaya terlalu redup', 'Karena tidak ada ikan'], benar: 1,
    penjelasan: 'Cahaya di zona senja sangat redup sehingga tumbuhan tidak bisa berfotosintesis; yang salah tetap salah karena salinitas bukan pembatas cahaya.' },
  { tanya: 'Apa ciri khas kehidupan di zona gelap?',
    opsi: ['Bergantung pada cahaya Matahari', 'Banyak yang menghasilkan cahaya sendiri', 'Tidak ada kehidupan sama sekali'], benar: 1,
    penjelasan: 'Tanpa cahaya Matahari, banyak hewan menghasilkan cahaya sendiri untuk berkomunikasi dan mencari mangsa.' },
]}
```

- [ ] **Step 9: Jalankan tes, typecheck**

Run: `npx vitest run tests/unit/zona-laut.test.ts tests/unit/konten-ocean.test.ts && npx astro check`
Expected: semua tes PASS; `0 errors`.

- [ ] **Step 10: Commit**

```bash
git add src/lib/zonaLaut.ts tests/unit/zona-laut.test.ts tests/unit/konten-ocean.test.ts src/components/viz/ZonaLaut.tsx src/components/viz/ZonaLaut.css src/content/topik/laut/ocean.mdx
git commit -m "Tulis ulang topik zona laut dengan visual ZonaLaut"
```

---

### Task 5: Topik laut/arus — PetaArus

**Files:**
- Create: `src/lib/arusLaut.ts`
- Test: `tests/unit/arus-laut.test.ts`
- Create: `data/scripts/land-svg.mjs`
- Create: `src/lib/duniaPath.ts` (hasil generate)
- Create: `src/components/viz/PetaArus.tsx`, `src/components/viz/PetaArus.css`
- Create: `src/content/topik/laut/arus.mdx`
- Delete: `src/content/topik/laut/owen.mdx`
- Test: `tests/unit/konten-arus.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type JenisArus = 'hangat' | 'dingin';
  export interface Arus { id: string; nama: string; jenis: JenisArus; arah: string; pengaruh: string }
  export const ARUS: readonly Arus[];
  export function saringArus(jenis?: JenisArus | 'semua'): readonly Arus[];
  ```
  `src/lib/duniaPath.ts`: `export const DUNIA_PATH: string`.
- Selector ui-check: `.pa`, `.pa-daftar button`, `.pa-info-nama`, `.pa-toggle button[data-jenis]`.

- [ ] **Step 1: Tulis tes yang gagal**

```ts
import { describe, expect, it } from 'vitest';
import { ARUS, saringArus } from '../../src/lib/arusLaut';

describe('arusLaut', () => {
  it('punya arus hangat dan dingin', () => {
    expect(ARUS.find((a) => a.id === 'gulf-stream')?.jenis).toBe('hangat');
    expect(ARUS.find((a) => a.id === 'acc')?.jenis).toBe('dingin');
  });
  it('menyaring sesuai jenis', () => {
    expect(saringArus('dingin').every((a) => a.jenis === 'dingin')).toBe(true);
    expect(saringArus('hangat').every((a) => a.jenis === 'hangat')).toBe(true);
    expect(saringArus('semua').length).toBe(ARUS.length);
    expect(saringArus().length).toBe(ARUS.length);
  });
  it('setiap arus punya nama, arah, dan pengaruh', () => {
    for (const a of ARUS) {
      expect(a.nama.length).toBeGreaterThan(2);
      expect(a.arah.length).toBeGreaterThan(2);
      expect(a.pengaruh.length).toBeGreaterThan(10);
    }
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/arus-laut.test.ts`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasikan `src/lib/arusLaut.ts`**

Minimal 6 arus: `gulf-stream` (hangat), `kuroshio` (hangat), `atlantik-utara` (hangat), `california` (dingin), `humboldt` (dingin), `acc` (dingin). Setiap entri: `nama`, `jenis`, `arah`, `pengaruh`.

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `npx vitest run tests/unit/arus-laut.test.ts`
Expected: `3 passed`.

- [ ] **Step 5: Hasilkan path dunia**

`data/scripts/land-svg.mjs`: baca `public/data/land.geojson` (FeatureCollection, geometri `Polygon`/`MultiPolygon`), proyeksikan bujur/lintang ke `x = (lon + 180) / 360 * 1000`, `y = (90 - lat) / 180 * 500`, **bulatkan ke bilangan bulat derajat** (peta skematik, bukan peta presisi), lewati ring dengan <4 titik, lalu gabungkan semua ring menjadi satu string `d`. Tulis `src/lib/duniaPath.ts` berisi `export const DUNIA_PATH = '...';`. Jalankan sekali:

Run: `node data/scripts/land-svg.mjs`
Expected: `src/lib/duniaPath.ts` tercipta dan <40 KB (land.geojson hanya 64 KB / 5.062 titik).

- [ ] **Step 6: Buat komponen `PetaArus.tsx` + CSS**

Ketentuan:
- SVG `viewBox="0 0 1000 500"`; `<path d={DUNIA_PATH} fill="var(--land)" stroke="var(--line-strong)">`.
- Panah arus: satu `<path>` per arus dengan kelas `pa-panah` dan `data-jenis`; warna `var(--heat)` untuk hangat, `var(--sea)` untuk dingin.
- Toggle `.pa-toggle button[data-jenis="hangat|dingin"]` menyaring arus yang disorot.
- Daftar tombol `.pa-daftar button` (nama arus) — jalur keyboard; klik menyorot panah dan mengisi `.pa-info-nama`, `.pa-info-jenis`, `.pa-info-arah`, `.pa-info-pengaruh`.
- Keadaan awal: semua panah terlihat, kartu info menampilkan arus pertama.
- Ringkasan teks di bawah menjelaskan bahwa peta skematik (posisi/arah disederhanakan).
- `useReduceMotion()` mematikan animasi panah.

- [ ] **Step 7: Tulis tes konten yang gagal**

```ts
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const { data, isi } = bacaMdx('topik/laut/arus.mdx');

describe('topik laut/arus', () => {
  it('memakai pertanyaan arus dan sumber resmi', () => {
    expect(String(data.pertanyaan)).toMatch(/arus/i);
    expect(data.sumber).toEqual(
      expect.arrayContaining(['noaa-ocean-currents', 'noaa-gyre', 'noaa-thermohaline']),
    );
  });
  it('tidak memakai MapView dan bebas istilah karangan', () => {
    expect(isi).not.toMatch(/<MapView/);
    expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
  });
  it('punya tiga soal kuis', () => {
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
  });
});
```

- [ ] **Step 8: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/konten-arus.test.ts`
Expected: FAIL — `arus.mdx` belum ada.

- [ ] **Step 9: Tulis `arus.mdx`, hapus `owen.mdx`**

Frontmatter:
- `pertanyaan: "Kenapa air laut mengalir, dan ke mana perginya?"`
- `terkait: ["laut/ocean", "atmosfer/angin-darat-laut", "atmosfer/siklus-air"]`
- `sumber: ["noaa-ocean-currents", "noaa-gyre", "noaa-thermohaline"]`
- `glosarium: ["arus-laut", "efek-coriolis", "upwelling"]`
- `status: "terbit"`, `diverifikasi: 2026-10-24`.

Isi: `<Figure source="noaa-ocean-currents">` berisi `<PetaArus client:visible />`; `<DataNote>` menyatakan peta skematik. Fakta bersumber: angin menggerakkan arus permukaan (lapisan atas ~100 m); rotasi Bumi membelokkan arah (Coriolis); benua membentuk gyre (lima gyre utama); perbedaan suhu dan garam menggerakkan sirkulasi termohalin di kedalaman; upwelling membawa air dingin kaya nutrisi. Kuis:

```mdx
soal={[
  { tanya: 'Apa penggerak utama arus permukaan?', opsi: ['Angin', 'Gempa bumi', 'Pasang surut'], benar: 0,
    penjelasan: 'Angin menggerakkan lapisan atas laut; gempa dan pasang surut bukan penggerak utama arus permukaan global.' },
  { tanya: 'Mengapa arah arus membelok?', opsi: ['Karena rotasi Bumi (efek Coriolis)', 'Karena warna air', 'Karena fase Bulan'], benar: 0,
    penjelasan: 'Rotasi Bumi membelokkan gerak air dan udara; warna air dan fase Bulan bukan penyebab pembelokan.' },
  { tanya: 'Apa yang dibawa upwelling ke permukaan?', opsi: ['Air hangat miskin nutrisi', 'Air dingin kaya nutrisi', 'Pasir dari dasar'], benar: 1,
    penjelasan: 'Upwelling mengangkat air dalam yang dingin dan kaya nutrisi ke lapisan yang terkena cahaya.' },
]}
```

Hapus `owen.mdx` dengan `git rm src/content/topik/laut/owen.mdx`.

- [ ] **Step 10: Jalankan tes, typecheck**

Run: `npx vitest run tests/unit/arus-laut.test.ts tests/unit/konten-arus.test.ts && npx astro check`
Expected: PASS; `0 errors`.

- [ ] **Step 11: Commit**

```bash
git add src/lib/arusLaut.ts src/lib/duniaPath.ts data/scripts/land-svg.mjs tests/unit/arus-laut.test.ts tests/unit/konten-arus.test.ts src/components/viz/PetaArus.tsx src/components/viz/PetaArus.css src/content/topik/laut/arus.mdx
git rm src/content/topik/laut/owen.mdx
git commit -m "Ganti topik owen dengan arus laut dan visual PetaArus"
```

---

### Task 6: Topik daratan/sungai — AliranSungai

**Files:**
- Create: `src/lib/aliranSungai.ts`
- Test: `tests/unit/aliran-sungai.test.ts`
- Create: `src/components/viz/AliranSungai.tsx`, `src/components/viz/AliranSungai.css`
- Modify: `src/content/topik/daratan/sungai.mdx`
- Test: `tests/unit/konten-sungai.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type JenisBeban = 'erosi' | 'pupuk' | 'limbah';
  export type StatusHilir = 'jernih' | 'keruh' | 'kaya-nutrisi' | 'tercemar';
  export interface KeadaanHilir { status: StatusHilir; keterangan: string; endapan: boolean }
  export function keadaanHilir(jenis: JenisBeban, intensitas: number): KeadaanHilir;
  ```
  Aturan: intensitas dijepit 0–100; <20 → `jernih`; erosi → `keruh` (`endapan` true bila ≥60); pupuk → `kaya-nutrisi`; limbah → `tercemar`.
- Selector ui-check: `.as`, `.as-jenis select`, `.as-intensitas input`, `.as-status`.

- [ ] **Step 1: Tulis tes yang gagal**

```ts
import { describe, expect, it } from 'vitest';
import { keadaanHilir } from '../../src/lib/aliranSungai';

describe('keadaanHilir', () => {
  it('jernih pada beban rendah', () => {
    expect(keadaanHilir('erosi', 0).status).toBe('jernih');
    expect(keadaanHilir('pupuk', 19).status).toBe('jernih');
    expect(keadaanHilir('limbah', 19).status).toBe('jernih');
  });
  it('berubah sesuai jenis beban', () => {
    expect(keadaanHilir('erosi', 50)).toMatchObject({ status: 'keruh', endapan: false });
    expect(keadaanHilir('erosi', 80)).toMatchObject({ status: 'keruh', endapan: true });
    expect(keadaanHilir('pupuk', 50).status).toBe('kaya-nutrisi');
    expect(keadaanHilir('limbah', 50).status).toBe('tercemar');
  });
  it('menjepit intensitas ke 0–100', () => {
    expect(keadaanHilir('limbah', -10).status).toBe('jernih');
    expect(keadaanHilir('limbah', 150).status).toBe('tercemar');
    expect(keadaanHilir('erosi', Number.NaN).status).toBe('jernih');
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/aliran-sungai.test.ts`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasikan `src/lib/aliranSungai.ts`**

Setiap status punya `keterangan` singkat berbahasa Indonesia yang menjelaskan dampaknya sampai muara.

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `npx vitest run tests/unit/aliran-sungai.test.ts`
Expected: `3 passed`.

- [ ] **Step 5: Buat komponen `AliranSungai.tsx` + CSS**

Ketentuan:
- SVG profil memanjang: gunung → hulu → anak sungai → dataran → muara.
- Kontrol: `<select class="as-jenis">` (erosi/pupuk/limbah) + slider `.as-intensitas input` 0–100.
- Warna air/indikator berubah sesuai `keadaanHilir`; teks `.as-status` menampilkan status + keterangan.
- Penanda endapan muncul saat `endapan` true.
- `aria-live="polite"` merangkum perubahan.
- Ringkasan teks di bawah menjelaskan bahwa model ini kualitatif, bukan angka pengukuran.
- `useReduceMotion()` mematikan transisi.

- [ ] **Step 6: Tulis tes konten yang gagal**

```ts
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const { data, isi } = bacaMdx('topik/daratan/sungai.mdx');

describe('topik daratan/sungai', () => {
  it('memakai pertanyaan hulu–muara dan sumber resmi', () => {
    expect(String(data.pertanyaan)).toMatch(/muara|hulu/i);
    expect(data.sumber).toEqual(
      expect.arrayContaining(['usgs-watersheds', 'usgs-river-monitoring']),
    );
  });
  it('tidak memakai MapView dan bebas istilah karangan', () => {
    expect(isi).not.toMatch(/<MapView/);
    expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
  });
  it('punya tiga soal kuis', () => {
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
  });
});
```

- [ ] **Step 7: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/konten-sungai.test.ts`
Expected: FAIL — konten lama.

- [ ] **Step 8: Tulis ulang `sungai.mdx`**

Frontmatter:
- `pertanyaan: "Kenapa kualitas air di muara ditentukan oleh apa yang terjadi di hulu?"`
- `terkait: ["daratan/danau", "atmosfer/siklus-air", "laut/arus"]`
- `sumber: ["usgs-watersheds", "usgs-river-monitoring", "usgs-water-cycle"]`
- `glosarium: ["daerah-aliran-sungai", "sedimen", "muara"]`
- `status: "terbit"`, `diverifikasi: 2026-10-24`.

Isi: `<Figure source="usgs-watersheds">` berisi `<AliranSungai client:visible />`; `<DataNote>` model kualitatif. Fakta bersumber: DAS mencakup seluruh daratan yang mengalirkan air ke satu titik keluaran, termasuk air tanah; aliran dan kualitas air sungai dipengaruhi hal-hal yang terjadi di daratan "di atas" titik keluaran; sedimen tersuspensi adalah faktor penting kualitas air; kualitas permukaan mencerminkan kondisi alami dan aktivitas manusia di DAS. Kuis:

```mdx
soal={[
  { tanya: 'Apa itu daerah aliran sungai (DAS)?', opsi: ['Seluruh daratan yang mengalirkan air ke satu titik keluaran', 'Hanya bagian sungai yang terlihat', 'Tempat air laut masuk ke sungai'], benar: 0,
    penjelasan: 'DAS adalah seluruh daratan yang airnya mengalir ke satu titik; batasnya bukan yang terlihat di permukaan sungai saja.' },
  { tanya: 'Mengapa kualitas air di muara dipengaruhi oleh hulu?', opsi: ['Karena air muara selalu bersih', 'Karena materi terbawa air sepanjang aliran', 'Karena muara tidak terhubung ke sungai'], benar: 1,
    penjelasan: 'Air mengangkut sedimen, nutrisi, dan limbah dari hulu ke hilir, sehingga muara menerima akumulasi sepanjang aliran.' },
  { tanya: 'Apa itu sedimen tersuspensi?', opsi: ['Partikel tanah atau batuan yang terbawa air', 'Gas yang larut dalam air', 'Ikan kecil di dasar sungai'], benar: 0,
    penjelasan: 'Sedimen tersuspensi adalah partikel padat yang melayang di air dan memengaruhi kekeruhan serta kualitas air.' },
]}
```

- [ ] **Step 9: Jalankan tes, typecheck**

Run: `npx vitest run tests/unit/aliran-sungai.test.ts tests/unit/konten-sungai.test.ts && npx astro check`
Expected: PASS; `0 errors`.

- [ ] **Step 10: Commit**

```bash
git add src/lib/aliranSungai.ts tests/unit/aliran-sungai.test.ts tests/unit/konten-sungai.test.ts src/components/viz/AliranSungai.tsx src/components/viz/AliranSungai.css src/content/topik/daratan/sungai.mdx
git commit -m "Tulis ulang topik sungai dengan visual AliranSungai"
```

---

### Task 7: Topik daratan/danau — DanauMusim

**Files:**
- Create: `src/lib/danauMusim.ts`
- Test: `tests/unit/danau-musim.test.ts`
- Create: `src/components/viz/DanauMusim.tsx`, `src/components/viz/DanauMusim.css`
- Modify: `src/content/topik/daratan/danau.mdx`
- Test: `tests/unit/konten-danau.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type Musim = 'semi' | 'panas' | 'gugur' | 'dingin';
  export interface KeadaanDanau { musim: Musim; berlapis: boolean; mencampur: boolean; es: boolean; oksigenDasar: 'tinggi' | 'sedang' | 'rendah'; keterangan: string }
  export const MUSIM: readonly { id: Musim; label: string }[];
  export function keadaanDanau(musim: Musim): KeadaanDanau;
  ```
  Aturan: panas → berlapis, tidak mencampur, oksigen dasar `rendah`; semi & gugur → tidak berlapis, mencampur, oksigen `sedang`/`tinggi`; dingin → es, berlapis, tidak mencampur, oksigen `sedang`.
- Selector ui-check: `.dm`, `.dm-musim button`, `.dm-status`.

- [ ] **Step 1: Tulis tes yang gagal**

```ts
import { describe, expect, it } from 'vitest';
import { MUSIM, keadaanDanau } from '../../src/lib/danauMusim';

describe('keadaanDanau', () => {
  it('musim panas berlapis dan dasar miskin oksigen', () => {
    expect(keadaanDanau('panas')).toMatchObject({
      berlapis: true, mencampur: false, es: false, oksigenDasar: 'rendah',
    });
  });
  it('pembalikan semi dan gugur mencampur lapisan', () => {
    expect(keadaanDanau('semi')).toMatchObject({ berlapis: false, mencampur: true });
    expect(keadaanDanau('gugur')).toMatchObject({ berlapis: false, mencampur: true });
  });
  it('musim dingin berlapis es', () => {
    expect(keadaanDanau('dingin')).toMatchObject({ es: true, mencampur: false });
  });
  it('menyediakan empat musim berlabel', () => {
    expect(MUSIM.map((m) => m.id)).toEqual(['semi', 'panas', 'gugur', 'dingin']);
    expect(MUSIM.every((m) => m.label.length > 2)).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/danau-musim.test.ts`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasikan `src/lib/danauMusim.ts`**

Setiap musim punya `keterangan` yang menyebut lapisan dan pencampuran.

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `npx vitest run tests/unit/danau-musim.test.ts`
Expected: `4 passed`.

- [ ] **Step 5: Buat komponen `DanauMusim.tsx` + CSS**

Ketentuan:
- SVG penampang danau: epilimnion, termoklin, hipolimnion, dasar, tepian.
- Empat tombol `.dm-musim button` (`aria-pressed`), keadaan awal `panas`.
- Panah pencampuran hanya saat `mencampur`; lapisan es saat `es`.
- Indikator oksigen dasar + teks `.dm-status` berisi keterangan musim.
- Catatan di dalam visual: "Model danau lintang tinggi; danau tropis berpola berbeda."
- `aria-live="polite"`; ringkasan teks di bawah; `useReduceMotion()`.

- [ ] **Step 6: Tulis tes konten yang gagal**

```ts
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const { data, isi } = bacaMdx('topik/daratan/danau.mdx');

describe('topik daratan/danau', () => {
  it('memakai pertanyaan danau dan sumber resmi', () => {
    expect(String(data.pertanyaan)).toMatch(/danau/i);
    expect(data.sumber).toEqual(expect.arrayContaining(['usgs-lakes-stratification']));
  });
  it('tidak memakai MapView dan bebas istilah karangan', () => {
    expect(isi).not.toMatch(/<MapView/);
    expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
  });
  it('punya tiga soal kuis', () => {
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
  });
});
```

- [ ] **Step 7: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/konten-danau.test.ts`
Expected: FAIL — konten lama.

- [ ] **Step 8: Tulis ulang `danau.mdx`**

Frontmatter:
- `pertanyaan: "Kenapa air danau tidak pernah benar-benar diam?"`
- `terkait: ["daratan/sungai", "atmosfer/siklus-air", "ekologi/bioma"]`
- `sumber: ["usgs-lakes-stratification", "noaa-water-cycle", "usgs-water-cycle"]`
- `glosarium: ["epilimnion", "termoklin", "hipolimnion"]`
- `status: "terbit"`, `diverifikasi: 2026-10-24`.

Isi: `<Figure source="usgs-lakes-stratification">` berisi `<DanauMusim client:visible />`; `<DataNote>` menyatakan model lintang tinggi dan skala disederhanakan. Fakta bersumber: air paling rapat sekitar 4 °C; danau dalam membentuk epilimnion (hangat), metalimnion dengan termoklin, dan hipolimnion (dingin); danau dimiktik bercampur dua kali (semi & gugur), monomiktik sekali, polimiktik sering; stratifikasi memisahkan hipolimnion dari atmosfer sehingga oksigen bisa menurun. **Wajib** tulis bahwa danau tropis tidak mengalami musim dingin berlapis es sehingga pola pencampurannya berbeda. Kuis:

```mdx
soal={[
  { tanya: 'Pada suhu berapa air paling rapat?', opsi: ['0 °C', '4 °C', '20 °C'], benar: 1,
    penjelasan: 'Air mencapai massa jenis tertinggi sekitar 4 °C; di atas dan di bawah suhu itu air menjadi lebih ringan.' },
  { tanya: 'Apa nama lapisan peralihan suhu di danau?', opsi: ['Epilimnion', 'Termoklin', 'Hipolimnion'], benar: 1,
    penjelasan: 'Termoklin (bagian dari metalimnion) adalah lapisan tempat suhu turun cepat terhadap kedalaman.' },
  { tanya: 'Apa yang terjadi saat pencampuran (turnover)?', opsi: ['Lapisan bercampur dan oksigen dari permukaan masuk ke dasar', 'Danau membeku total', 'Air berhenti bergerak selamanya'], benar: 0,
    penjelasan: 'Saat permukaan mendingin atau menghangat, perbedaan massa jenis melemah dan angin mencampur lapisan, membawa oksigen ke bawah.' },
]}
```

- [ ] **Step 9: Jalankan tes, typecheck**

Run: `npx vitest run tests/unit/danau-musim.test.ts tests/unit/konten-danau.test.ts && npx astro check`
Expected: PASS; `0 errors`.

- [ ] **Step 10: Commit**

```bash
git add src/lib/danauMusim.ts tests/unit/danau-musim.test.ts tests/unit/konten-danau.test.ts src/components/viz/DanauMusim.tsx src/components/viz/DanauMusim.css src/content/topik/daratan/danau.mdx
git commit -m "Tulis ulang topik danau dengan visual DanauMusim"
```

---

### Task 8: Topik penutup/menghubungkan — SistemBumi

**Files:**
- Create: `src/lib/sistemBumi.ts`
- Test: `tests/unit/sistem-bumi.test.ts`
- Create: `src/components/viz/SistemBumi.tsx`, `src/components/viz/SistemBumi.css`
- Modify: `src/content/topik/penutup/menghubungkan.mdx`
- Test: `tests/unit/konten-menghubungkan.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type IdSimpul = 'lempeng' | 'atmosfer' | 'air' | 'laut' | 'kehidupan';
  export interface Simpul { id: IdSimpul; nama: string; ringkas: string }
  export interface Aliran { dari: IdSimpul; ke: IdSimpul; label: string; topik: string; contoh: string }
  export const SIMPUL: readonly Simpul[];
  export const ALIRAN: readonly Aliran[];
  export function aliranDari(id: IdSimpul): readonly Aliran[]; // dari === id || ke === id
  ```
- Selector ui-check: `.sb`, `.sb-simpul button`, `.sb-panel`.

- [ ] **Step 1: Tulis tes yang gagal**

```ts
import { describe, expect, it } from 'vitest';
import { ALIRAN, SIMPUL, aliranDari } from '../../src/lib/sistemBumi';

describe('sistemBumi', () => {
  it('setiap aliran merujuk simpul yang ada', () => {
    const id = new Set(SIMPUL.map((s) => s.id));
    for (const a of ALIRAN) {
      expect(id.has(a.dari), a.label).toBe(true);
      expect(id.has(a.ke), a.label).toBe(true);
    }
  });
  it('setiap aliran punya label, topik, dan contoh', () => {
    for (const a of ALIRAN) {
      expect(a.label.length).toBeGreaterThan(2);
      expect(a.topik.startsWith('/topik/')).toBe(true);
      expect(a.contoh.length).toBeGreaterThan(10);
    }
  });
  it('aliranDari mengembalikan aliran yang terhubung', () => {
    const hasil = aliranDari('laut');
    expect(hasil.length).toBeGreaterThan(0);
    expect(hasil.every((a) => a.dari === 'laut' || a.ke === 'laut')).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/sistem-bumi.test.ts`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasikan `src/lib/sistemBumi.ts`**

Lima simpul dengan `ringkas`; minimal 7 aliran (lempeng→atmosfer, lempeng→air, atmosfer→air, atmosfer→laut, air→laut, laut→kehidupan, air→kehidupan). Setiap `topik` menunjuk rute nyata, mis. `/topik/planet-bumi/lempeng-tektonik/`, `/topik/laut/arus/`.

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `npx vitest run tests/unit/sistem-bumi.test.ts`
Expected: `3 passed`.

- [ ] **Step 5: Buat komponen `SistemBumi.tsx` + CSS**

Ketentuan:
- SVG node graph; setiap simpul adalah `<button class="sb-simpul">` yang bisa difokus (gunakan `<foreignObject>` atau tombol HTML di atas SVG — pilih yang paling andal; tombol HTML dalam layout grid lebih aman).
- Klik simpul menyorot edge terkait (kelas `sb-aktif`), panel `.sb-panel` menampilkan nama, ringkas, dan daftar koneksi dengan contoh + tautan.
- Keadaan awal: semua edge terlihat; panel menampilkan penjelasan umum.
- Daftar teks di bawah diagram menjelaskan semua koneksi (untuk pembaca layar).
- `aria-live="polite"`; `useReduceMotion()`.

- [ ] **Step 6: Tulis tes konten yang gagal**

```ts
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const { data, isi } = bacaMdx('topik/penutup/menghubungkan.mdx');

describe('topik penutup/menghubungkan', () => {
  it('memakai sumber sistem Bumi', () => {
    expect(data.sumber).toEqual(expect.arrayContaining(['nasa-earth-system']));
  });
  it('tidak memakai MapView dan bebas istilah karangan', () => {
    expect(isi).not.toMatch(/<MapView/);
    expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
  });
  it('punya tiga soal kuis', () => {
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
  });
});
```

- [ ] **Step 7: Jalankan, pastikan gagal**

Run: `npx vitest run tests/unit/konten-menghubungkan.test.ts`
Expected: FAIL — konten lama.

- [ ] **Step 8: Tulis ulang `menghubungkan.mdx`**

Frontmatter:
- `pertanyaan: "Bagaimana semua hal di atas saling terhubung?"`
- `terkait: ["atmosfer/siklus-air", "laut/arus", "planet-bumi/lempeng-tektonik"]`
- `sumber: ["nasa-earth-system", "noaa-water-cycle", "usgs-water-cycle"]`
- `glosarium: ["sistem-bumi", "siklus-air"]`
- `status: "terbit"`, `diverifikasi: 2026-10-24`.

Isi: `<Figure source="nasa-earth-system">` berisi `<SistemBumi client:visible />`; `<DataNote>` diagram konsep, bukan peta. Fakta bersumber: sistem Bumi punya lima sphere (atmosfer, hidrosfer, biosfer, kriosfer, geosfer); perubahan satu bagian memengaruhi bagian lain; siklus energi, air, batuan, dan biogeokimia menghubungkan reservoir; flux adalah aliran energi/materi (mis. arus laut, angin, aliran sungai). "Fakta menarik" berisi 3 rantai sebab-akibat lintas topik. Kuis:

```mdx
soal={[
  { tanya: 'Berapa sphere utama sistem Bumi menurut NASA?', opsi: ['Tiga', 'Lima', 'Tujuh'], benar: 1,
    penjelasan: 'NASA membagi sistem Bumi menjadi atmosfer, hidrosfer, biosfer, kriosfer, dan geosfer.' },
  { tanya: 'Contoh aliran (flux) yang menghubungkan laut dan atmosfer adalah...', opsi: ['Arus laut dan angin', 'Warna tanah', 'Jumlah gunung'], benar: 0,
    penjelasan: 'Arus laut dan angin memindahkan panas serta uap air antara laut dan atmosfer.' },
  { tanya: 'Mengapa perubahan di satu bagian sistem Bumi memengaruhi bagian lain?', opsi: ['Karena bagian-bagiannya terhubung lewat siklus energi dan materi', 'Karena semua bagian identik', 'Karena Bumi tidak berubah'], benar: 0,
    penjelasan: 'Siklus energi dan materi membuat perubahan di satu sphere merambat ke sphere lain.' },
]}
```

- [ ] **Step 9: Jalankan tes, typecheck**

Run: `npx vitest run tests/unit/sistem-bumi.test.ts tests/unit/konten-menghubungkan.test.ts && npx astro check`
Expected: PASS; `0 errors`.

- [ ] **Step 10: Commit**

```bash
git add src/lib/sistemBumi.ts tests/unit/sistem-bumi.test.ts tests/unit/konten-menghubungkan.test.ts src/components/viz/SistemBumi.tsx src/components/viz/SistemBumi.css src/content/topik/penutup/menghubungkan.mdx
git commit -m "Tulis ulang topik penutup dengan visual SistemBumi"
```

---

### Task 9: Hapus duplikat bioma + perluas ui-check

**Files:**
- Delete: `src/content/topik/bioma/bioma.mdx`
- Delete: `tests/repro-map.mjs`
- Modify: `tests/ui-check.mjs`

- [ ] **Step 1: Hapus duplikat dan skrip repro yang usang**

```bash
git rm src/content/topik/bioma/bioma.mdx tests/repro-map.mjs
```

- [ ] **Step 2: Perbarui daftar halaman & jumlah kartu Ekologi**

Di `tests/ui-check.mjs`:
- Tambahkan ke `halaman`: `/topik/laut/ocean/`, `/topik/laut/arus/`, `/topik/daratan/sungai/`, `/topik/daratan/danau/`, `/topik/penutup/menghubungkan/`.
- Ubah komentar + ekspektasi filter Ekologi menjadi **1** kartu.
- Tambahkan viewport `{ lebar: 360, skema: 'light' }` dan `{ lebar: 360, skema: 'dark' }` ke loop.
- Tambahkan iterasi `{ lebar: 1280, skema: 'light', gerak: 'reduce' }`; ubah destructuring menjadi `for (const { lebar, skema, gerak } of [...])` dan teruskan ke context secara kondisional:
  ```js
  const context = await browser.newContext({
    viewport: { width: lebar, height: 900 },
    colorScheme: skema,
    ...(gerak ? { reducedMotion: gerak } : {}),
  });
  ```

- [ ] **Step 3: Tambahkan pemeriksaan interaktif kelima komponen**

Sisipkan di blok `if (lebar === 1280 && skema === 'light' && !gerak)`:

```js
await page.goto(base + '/topik/laut/ocean/', { waitUntil: 'networkidle' });
await page.locator('.zl-slider input').fill('1500');
if (!(await page.locator('.zl-zona-nama').textContent())?.toLowerCase().includes('gelap'))
  catat('Zona laut: kedalaman 1.500 m bukan zona gelap');

await page.goto(base + '/topik/laut/arus/', { waitUntil: 'networkidle' });
await page.locator('.pa-daftar button', { hasText: 'Gulf Stream' }).click();
if (!(await page.locator('.pa-info-nama').textContent())?.includes('Gulf Stream'))
  catat('Arus: memilih Gulf Stream tidak mengisi panel info');

await page.goto(base + '/topik/daratan/sungai/', { waitUntil: 'networkidle' });
await page.locator('.as-jenis select').selectOption('limbah');
await page.locator('.as-intensitas input').fill('80');
if (!(await page.locator('.as-status').textContent())?.toLowerCase().includes('tercemar'))
  catat('Sungai: beban limbah tinggi tidak menandai tercemar');

await page.goto(base + '/topik/daratan/danau/', { waitUntil: 'networkidle' });
await page.locator('.dm-musim button', { hasText: 'Gugur' }).click();
if (!(await page.locator('.dm-status').textContent())?.toLowerCase().includes('campur'))
  catat('Danau: musim gugur tidak menampilkan pencampuran');

await page.goto(base + '/topik/penutup/menghubungkan/', { waitUntil: 'networkidle' });
await page.locator('.sb-simpul button', { hasText: 'Laut' }).click();
if (!(await page.locator('.sb-panel').textContent())?.toLowerCase().includes('laut'))
  catat('Sistem Bumi: memilih simpul laut tidak mengisi panel');
```

Tambahkan juga pemeriksaan keyboard:

```js
await page.goto(base + '/topik/laut/ocean/', { waitUntil: 'networkidle' });
const slider = page.locator('.zl-slider input');
await slider.focus();
const sebelum = await slider.inputValue();
await page.keyboard.press('ArrowRight');
if ((await slider.inputValue()) === sebelum) catat('Zona laut: slider tidak merespons panah keyboard');
```

- [ ] **Step 4: Jalankan ui-check**

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 24.21.0 >/dev/null
npm run build
(npm run preview -- --port 4321 >/tmp/opencode/rb-preview-ui.log 2>&1 &)
sleep 3
npm run check:ui
pkill -f "astro preview" 2>/dev/null; true
```

Expected: `OK: semua pemeriksaan UI lolos.`

- [ ] **Step 5: Commit**

```bash
git add tests/ui-check.mjs
git commit -m "Perluas ui-check ke 5 topik baru dan hapus duplikat bioma"
```

---

### Task 10: Verifikasi penuh

**Files:**
- Modify (bila perlu): berkas yang gagal verifikasi.
- Test: `tests/unit/konten.test.ts` (tambahkan pemeriksaan global).

- [ ] **Step 1: Tambahkan pemeriksaan konten global**

Tambahkan ke `tests/unit/konten.test.ts`:

```ts
import { bacaMdx } from './bantuan-konten';

const topikBaru = [
  'topik/laut/ocean.mdx',
  'topik/laut/arus.mdx',
  'topik/daratan/sungai.mdx',
  'topik/daratan/danau.mdx',
  'topik/penutup/menghubungkan.mdx',
];

describe('konten 5 topik baru', () => {
  for (const relatif of topikBaru) {
    it(`${relatif}: bersih, bersumber, dan punya 3 soal`, () => {
      const { data, isi } = bacaMdx(relatif);
      expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
      expect(isi).not.toMatch(/<MapView/);
      expect(Array.isArray(data.sumber) ? (data.sumber as string[]).length : 0).toBeGreaterThanOrEqual(2);
      expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
      expect((isi.match(/\bbenar:/g) ?? []).length).toBe(3);
      expect(String(isi)).toMatch(/<Figure[^>]*source="/);
    });
  }
});
```

- [ ] **Step 2: Jalankan seluruh tes**

Run: `npm test`
Expected: semua test file PASS (minimal 14 file: 3 tes lama + `konten.test.ts` + 5 tes lib + 5 tes konten topik).

- [ ] **Step 3: Jalankan pemeriksaan proyek**

Run: `npm run check`
Expected: `0 errors`, `Semua aturan sumber terpenuhi.`, tanpa tautan rusak.

- [ ] **Step 4: Build + budget**

Run: `npm run build`
Expected: build selesai tanpa error, lalu `Semua budget performa terpenuhi.`

- [ ] **Step 5: ui-check final**

```bash
(npm run preview -- --port 4321 >/tmp/opencode/rb-preview-final.log 2>&1 &)
sleep 3
npm run check:ui
pkill -f "astro preview" 2>/dev/null; true
```

Expected: `OK: semua pemeriksaan UI lolos.`

- [ ] **Step 6: Pemeriksaan manual**

Buka kelima halaman di 360 px dan desktop, tema terang/gelap. Pastikan:
- tidak ada teks terpotong/overflow;
- slider/tombol bisa dipakai hanya dengan keyboard;
- ringkasan `aria-live` berubah;
- tidak ada kalimat campur bahasa atau istilah karangan.

- [ ] **Step 7: Commit sisa perbaikan**

```bash
git add -A
git commit -m "Verifikasi akhir konten dan visual 5 topik baru"
```

---

## Catatan eksekusi

- Task 4–8 saling independen (berkas berbeda) dan boleh dijalankan paralel setelah Task 1–3 selesai.
- Task 9 bergantung pada Task 4–8 (selector & daftar halaman).
- Jangan mengubah `src/components/viz/MapView.tsx` atau topik lempeng.
- Jangan menambah dependensi; semua visual memakai React + SVG + CSS yang ada.
