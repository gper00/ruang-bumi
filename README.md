# Ruang Bumi

Situs belajar ilmu kebumian berbahasa Indonesia. Tiap halaman menjawab satu pertanyaan lewat visual
interaktif, dan tiap angka bisa ditelusuri ke sumbernya.

Nama "Ruang Bumi" masih placeholder.

## Menjalankan

Butuh Node.js 24 (lihat `.nvmrc`; Astro 7 menolak Node di bawah 22.23.4).

```sh
nvm use            # kalau memakai nvm
npm install
npm run dev        # http://localhost:4321
```

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Cek sumber, lalu build statis ke `dist/` |
| `npm run preview` | Menyajikan hasil build |
| `npm run check` | `astro check` + cek sumber + cek tautan internal |
| `npm run check:sources` | Aturan sumber saja (tanpa build) |
| `npm run check:links` | Tautan internal wajib valid; tautan luar hanya peringatan |
| `npm run check:ui` | Uji peramban: hidrasi, peta, kuis, popover, axe, overflow 390/1280 px |
| `npm run data:build` | Bangun ulang GeoJSON peta dari `data/scripts/` |

`check:ui` membutuhkan `playwright-core`, Chromium, dan `axe-core` (sudah ada di devDependencies;
Chromium dipasang dengan `npx playwright install chromium`). Skrip mencari Chromium di cache
Playwright secara otomatis; set `PLAYWRIGHT_CHROMIUM=/path/ke/chrome` bila lokasinya berbeda.
Preview harus berjalan di port 4321, misalnya `npm run preview -- --port 4321`.

CI (`.github/workflows/ci.yml`) menjalankan `astro check`, `npm run build` (termasuk penjaga
sumber), dan `check:links` dengan `SKIP_EXTERNAL=1` agar tidak bergantung pada situs pihak ketiga.
Uji peramban (`check:ui`) dijalankan lokal karena butuh Chromium.

## Struktur

```
src/
├─ content/
│  ├─ topik/<kategori>/<slug>.mdx     artikel per pertanyaan
│  ├─ sumber/*.yaml                   satu berkas per sumber
│  ├─ dataset/*.yaml                  satu berkas per dataset
│  └─ glosarium/istilah.yaml          daftar istilah (satu berkas)
├─ components/
│  ├─ layout/    Header, Footer, ThemeToggle, Breadcrumb
│  ├─ topik/     AnswerBox, RelatedTopics, SourceList, TopicCard
│  ├─ sumber/    Cite, Figure, DataNote
│  ├─ viz/       MapView, SimAnginLaut, SimMusim, SiklusAir, BiomaMap
│  ├─ quiz/      Quiz
│  └─ glosarium/ Term
├─ layouts/      Layout.astro, TopikLayout.astro
├─ lib/          topik.ts, glosarium.ts
├─ pages/        index, topik, kategori, glosarium, sumber, tentang, 404
└─ styles/       tokens.css, base.css
data/
├─ processed/    GeoJSON hasil skrip (jangan diedit manual)
└─ scripts/      plates.mjs
public/data/     salinan GeoJSON yang disajikan ke peramban
scripts/         check-sources.mjs, check-links.mjs
tests/           ui-check.mjs
```

## Aturan sumber

`npm run build` menjalankan `scripts/check-sources.mjs` lebih dulu. Build berhenti bila:

1. Ada `<Figure>` atau `<img>` tanpa `source` atau `dataset`.
2. Ada id sumber/dataset yang tidak ada di YAML.
3. Topik `status: terbit` punya kurang dari dua sumber.
4. Ada sumber tanpa `lisensi` atau `diakses`.
5. Ada `<Cite>` yang tidak tercantum di frontmatter `sumber` (nomornya tidak akan muncul).

Verifikasi yang lebih tua dari 12 bulan hanya memicu peringatan.

## Menambah topik

1. Salin pola dari topik yang sudah ada di `src/content/topik/<kategori>/`.
2. Isi frontmatter: `pertanyaan`, `kategori`, `menit`, `jawabanSingkat` (maks. 320 karakter),
   `terkait`, `sumber` (minimal 2), `dataset` bila memakai peta, `glosarium` bila memakai istilah.
3. Struktur isi: visual utama di `<Figure>` → `## Kok bisa?` → `## Fakta menarik` → `<Quiz>`.
4. Pasang `<Cite id="...">` untuk setiap angka atau klaim spesifik.
5. Beri `<DataNote>` pada visual yang disederhanakan.
6. Jalankan `npm run check` sebelum mengubah `status` menjadi `terbit`.

Gaya penulisan ada di [CONTENT-GUIDE.md](./CONTENT-GUIDE.md).

## Peta dan data

Data lempeng berasal dari model PB2002 (Bird, 2003) lewat repositori `fraxen/tectonicplates`
(lisensi ODbL-1.0 untuk berkas turunan). Garis daratan memakai Natural Earth 1:110m (domain
publik). Keduanya diolah `data/scripts/plates.mjs`: koordinat dibulatkan satu desimal, poligon
kecil dibuang, lalu ditulis ke `data/processed/` dan `public/data/`.

Peta **tidak** memakai tile pihak ketiga; semuanya GeoJSON lokal. Data gempa USGS dan peta bioma
detail belum termasuk MVP.

## Lisensi

- Kode: MIT (`LICENSE`).
- Teks dan visual orisinal: CC BY 4.0 (`LICENSE-CONTENT.md`).
- Data pihak ketiga mengikuti lisensinya masing-masing dan dicatat di `/sumber/`.

## Deploy

Build statis. Di Cloudflare Pages: build command `npm run build`, output directory `dist`, variabel
`NODE_VERSION=24`. Domain dan nama final belum ditentukan.
