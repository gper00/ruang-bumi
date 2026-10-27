# Desain: artikel bioma dengan tab empat bioma

Tanggal: 2026-10-26
Status: selesai (2026-10-27)
Cakupan: `ruang-bumi/`

## 1. Latar belakang

Artikel `ekologi/bioma` sekarang menjelaskan bioma secara umum (lintang, hujan, suhu) dan
memakai `BiomaMap` untuk menunjukkan sabuk bioma. Penjelasannya benar, tetapi belum pernah
membedah satu bioma sampai ke mekanismenya. Pembaca yang bertanya “kenapa stepa tidak jadi
hutan?” atau “kenapa pohon taiga tidak rontok?” tidak mendapat jawaban di halaman itu.

Keputusan pemilik: **satu artikel dengan tab**, bukan memecah menjadi banyak halaman topik.
Alasannya: bioma adalah satu konsep; tab menjaga konteks tetap di satu halaman sambil memberi
ruang untuk empat penjelasan mendalam. Setiap tab tetap mendapat visual sendiri yang khusus
menjawab mekanismenya, bukan satu visual umum yang dipakai berulang.

## 2. Tujuan

1. Artikel bioma punya empat penjelasan mekanisme: stepa, hutan gugur, taiga, tundra.
2. Setiap tab punya visual interaktif yang berbeda dan benar-benar menjelaskan pertanyaannya.
3. Tab bisa dioperasikan keyboard, tetap terbaca tanpa JavaScript, dan tidak menambah
   dependensi baru.
4. Semua klaim baru punya sumber resmi (NASA, NPS, NOAA) dan tercatat di halaman sumber.
5. Budget performa dan pemeriksaan aksesibilitas tetap lolos.

## 3. Bukan tujuan

- Menambah halaman topik baru. Backlog topik lain disimpan di `docs/content-backlog.md`.
- Mengganti `BiomaMap` atau topik lain.
- Menambah foto atau aset gambar baru.
- Mengubah navigasi, beranda, atau sistem sumber.

## 4. Struktur artikel

Urutan tetap mengikuti `CONTENT-GUIDE.md`:

```mdx
<Figure> BiomaMap </Figure>
<DataNote> ... </DataNote>

## Kok bisa?
  iklim, air, suhu, lintang; contoh Sumatra–Sumbawa

## Empat bioma, empat mekanisme
  <BiomaTabs>
    tab stepa | tab hutan gugur | tab taiga | tab tundra
  </BiomaTabs>
  <DataNote> ilustrasi untuk keempat visual </DataNote>

### Kenapa Sumbawa berbeda dari Sumatra?
### Jangan tertukar
### Berapa banyak jenis bioma?

## Fakta menarik
<Quiz> tiga soal </Quiz>
```

Empat tab:

| Tab | Pertanyaan yang dijawab | Visual |
|---|---|---|
| Stepa | Kalau hujannya cukup, kenapa pohon tidak menang? | Api dan penggembalaan menghabisi pohon muda; rumput tumbuh lagi dari tunas di bawah tanah |
| Hutan gugur | Kenapa pohon melepas daunnya sebelum dingin? | Kalender 12 bulan: kanopi berubah, tanah bersalju, pohon dorman |
| Taiga | Kenapa hutan terluas di darat disusun pohon jarum? | Perbandingan jarum vs daun lebar sepanjang musim tumbuh yang pendek |
| Tundra | Kenapa tidak ada pohon di tanah yang basah? | Penampang permafrost + lapisan aktif; akar pohon tertahan tanah beku |

## 5. Komponen tab

`src/components/viz/BiomaTabs.astro` (Astro, bukan React):

- Isi tiap panel ditulis di MDX sebagai `<section class="bt-panel" id="bioma-…"
  data-tab="…" data-tanya="…">`. Named slot tidak dipakai, sehingga `<Cite>`, `<Figure>`,
  `<Term>`, dan visual React tetap komponen biasa di dalam panel.
- Tanpa JavaScript bar tab tidak dirender dan keempat panel tampil bertumpuk, masing-masing
  dengan judulnya sendiri. Keempat isi tetap terbaca.
- Skrip di komponen membangun tab dari panel: tombol dengan `role="tab"`, `aria-selected`,
  dan `aria-controls`; panel menjadi `role="tabpanel"` + `aria-labelledby`. Panah
  kiri/kanan/Home/End memindahkan fokus, dan tab aktif disimpan di hash URL.
- Kelas `js` ditambahkan skrip inline sebelum panel dirender, supaya panel yang tidak dipilih
  tidak sempat terlihat berkedip.
- Judul panel memakai `<p class="bt-panel-judul">`, bukan heading, agar tidak masuk daftar isi
  halaman; panel yang tersembunyi juga tidak punya tautan TOC.
- Tampilan: empat tombol tab berisi label dan pertanyaannya, aksen `--sea` pada tab aktif,
  target sentuh ≥ 46 px, fokus keyboard terlihat.

## 6. Visual per tab

Semua visual adalah React island `client:visible`, SVG/DOM tanpa library baru, memakai token
warna yang ada, dan menyediakan ringkasan teks `aria-live` serta catatan “ilustrasi”.

### 6.1 `StepaGangguan`

- Tiga skenario: tanpa gangguan, kebakaran, penggembalaan.
- Lanskap: rumput berakar dalam, pohon muda, serasah; api membakar pucuk di atas tanah,
  penggembalaan memangkas pucuk; rumput tumbuh lagi.
- Indikator tutupan pohon kualitatif (rendah/sedang/tinggi), bukan persentase ilmiah.
- Fakta: curah hujan 500–900 mm/tahun dan akar rumput hingga 1,8 m (NASA); api membunuh
  pohon dan semak, rumput dorman di akar (NPS).

### 6.2 `HutanGugurMusim`

- Slider 12 bulan; kanopi: penuh (panas), berwarna (gugur), gundul + salju (dingin),
  tunas (semi).
- Panel status: musim, daun, pertumbuhan (aktif/dorman).
- Fakta: 750–1.500 mm/tahun, rata-rata sekitar 10 °C, empat musim (NASA); daun rontok dan
  pohon dorman saat dingin (NPS).
- Catatan eksplisit: pola ini untuk lintang menengah; Indonesia tidak mengalaminya.

### 6.3 `TaigaMusim`

- Dua tombol musim (panas/dingin) dan dua pohon berdampingan: jarum dan daun lebar.
- Musim dingin: jarum tetap, daun lebar gundul; salju di tanah; musim tumbuh hanya 4–6 bulan.
- Fakta: suhu musim panas sekitar 10 °C, curah hujan 300–900 mm, 4–6 bulan bebas beku
  (NASA); taiga adalah bioma darat terluas dan api adalah gangguan dominan (NOAA).

### 6.4 `TundraTanah`

- Slider bulan mengubah ketebalan lapisan aktif di atas permafrost; akar pohon muda
  berhenti di batas beku, akar semak tetap di lapisan aktif.
- Indikator: lapisan aktif (tipis/tebal), akar (tertahan/tumbuh), air (tergenang).
- Fakta: 150–250 mm/tahun, permafrost, hanya lapisan tipis yang mencair (NASA); lapisan
  aktif 30–100 cm (NOAA).

## 7. Logika dan tes

Logika murni di `src/lib/bioma.ts`:

- `musimUtara(bulan)` untuk pemetaan bulan → musim.
- `keadaanStepa(skenario)` → tingkat tutupan pohon, jumlah pohon muda, keadaan rumput,
  ringkasan.
- `keadaanHutanGugur(bulan)` → keadaan daun dan dormansi.
- `keadaanTaiga(musim, jenis)` → berdaun/tidak dan salju.
- `keadaanTundra(bulan)` → ketebalan relatif lapisan aktif dan ringkasan.

Tes unit memeriksa batas musim, urutan tutupan pohon, keadaan daun, dan siklus lapisan aktif.
Tes konten memeriksa empat slot, tiga soal kuis, jumlah sumber, `<Figure source>`, dan
glosarium. `tests/ui-check.mjs` menambah pemeriksaan: tab berganti lewat klik dan panah,
panel tersembunyi benar-benar tersembunyi, dan tiap visual bereaksi terhadap kontrolnya.

## 8. Sumber baru

| id | Penerbit | Dipakai untuk |
|---|---|---|
| `nasa-grassland` | NASA Science | Iklim stepa, akar rumput |
| `nps-prairie-fire` | NPS Tallgrass Prairie | Api dan penggembalaan |
| `nasa-temperate-forest` | NASA Science | Iklim hutan gugur |
| `nps-deciduous-forest` | NPS NCRN | Dormansi dan empat musim |
| `nasa-coniferous` | NASA Science | Iklim taiga, daun jarum |
| `noaa-boreal-fire` | NOAA Arctic Report Card | Taiga terluas, api |
| `nasa-tundra` | NASA Science | Permafrost dan vegetasi tundra |
| `noaa-permafrost` | NOAA PMEL | Lapisan aktif dan drainase |

Semua berlisensi domain publik pemerintah AS; tanggal akses 2026-10-26.

## 9. Verifikasi

`npm run check`, `npm test`, `npm run build` (termasuk budget), dan `npm run check:ui`
(axe, luapan horizontal, tema terang/gelap, reduced motion, pada 360/390/1280 px).

Hasil 2026-10-27 (Node 24.21): `npm run check` bersih, `npm test` 85 tes lolos,
`npm run build` lolos dengan 3,7 KB gzip JS awal di halaman bioma dan 212,9 KB gzip total,
`npm run check:ui` lolos tanpa temuan.

Pemeriksaan UI menambah: hanya satu panel bioma yang tampak, tab berganti lewat klik dan
lewat panah/Home, hash URL mengikuti tab aktif, keempat visual bereaksi pada kontrolnya,
dan tanpa JavaScript keempat panel beserta judulnya tetap terbaca. Penilaian rupa di layar
sungguhan diserahkan ke pemilik proyek.
