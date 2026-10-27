# Desain topik gunung api

Tanggal: 2026-10-28 · Status: selesai (topik `planet-bumi/gunung-api` terbit)

## Pertanyaan dan sasaran

Backlog prioritas Tinggi: *Kenapa ada gunung api yang meletus tenang dan ada yang meledak?*
Satu visual wajib memakai dua slider — kekentalan magma dan kadar gas — yang mengubah bentuk
erupsi dan lereng gunung. Minimal dua sumber resmi, satu visual interaktif khusus, dan tiga soal
kuis sesuai `CONTENT-GUIDE.md`.

## Model (`src/lib/erupsi.ts`)

Dua masukan berskala 0–100 tanpa satuan, satu fungsi murni per keluaran supaya mudah diuji:

- `gasTerkunci(kekentalan, gas)` → fraksi gas yang tidak sempat lepas, `g × (0,25 + 0,75 × v)`.
  Faktor kekentalan membuat magma encer selalu lolos meski gasnya banyak: pada kekentalan 0
  hasilnya maksimal 0,25, sehingga magma basalt tidak pernah dikunci menjadi eksplosif.
- `gayaErupsi()` membagi hasil itu ke tiga kelas: `< 0,3` efusif, `< 0,6` transisi, selainnya
  eksplosif. Tanpa gas hasilnya nol, jadi kelasnya selalu efusif.
- `bentukGunung()` hanya bergantung kekentalan, karena bentuk gunung mengikuti jarak tempuh
  lava: `< 0,35` perisai, `< 0,7` kerucut lapis, sisanya kubah lava. Lereng `4 + 30 × v`
  derajat dibulatkan, label landai `< 12°`, sedang `< 24°`, selainnya curam.

## Visual (`src/components/viz/SimErupsi.tsx`)

Penampang gunung dengan kamar magma, pipa magma, badan gunung berlapis, dan satu dari tiga
gambar letusan: aliran lava beranimasi (efusif), air mancur dan awan (transisi), atau kolom abu
dengan tefra berjatuhan (eksplosif). Lebar setengah dasar dihitung dari kekentalan, jadi gunung
melebar saat magma encer dan menyempit saat kental.

Kontrol memakai `input type="range"` native dengan `aria-describedby` untuk skala ujung, nilai
dibaca lewat `aria-valuetext`, ringkasan perubahan lewat `aria-live="polite"`, dan animasi
mati pada `prefers-reduced-motion` lewat `useReduceMotion` serta fallback CSS.

## Sumber dan glosarium

Lima sumber baru, semuanya USGS: `usgs-eruption-styles` (gaya letusan dari sifat magma),
`usgs-about-volcanoes` (magma–lava, jenis gunung api, jumlah gunung api aktif),
`usgs-volcanic-gases` (gas sebagai penggerak letusan), `usgs-principal-volcano-types`
(perisai, kerucut lapis, kubah, peristiwa Parícutin dan Mont Pelée), dan
`usgs-plate-tectonics` (Cincin Api). Enam istilah baru: `magma`, `lava`, `kekentalan-magma`,
`letusan-efusif`, `letusan-eksplosif`, `tefra`.

## Keputusan

- Pertanyaan dan `jawabanSingkat` sengaja tidak memuat kata “gempa”, karena pencarian beranda
  di `tests/ui-check.mjs` mengunci hasil kata “gempa” ke dua kartu.
- Angka lereng, persentase gas terperangkap, dan skala slider diberi label ilustrasi di
  `<DataNote>` dan di bawah visual; skala tegak gambar dilebih-lebihkan.
- Satu topik, bukan dua: gaya letusan dan bentuk gunung adalah satu konsep yang sama-sama
  ditentukan oleh kekentalan dan gas.

## Pengujian

- `tests/unit/erupsi.test.ts`: rentang, monotonisitas, batas kelas, bentuk dan lereng.
- `tests/unit/konten-erupsi.test.ts`: frontmatter, sumber, istilah glosarium, kuis, dan
  kunci kata “gempa”.
- `tests/ui-check.mjs`: halaman baru dikunjungi di tujuh viewport, lalu slider digeser ke
  10/10 dan 100/100 untuk memeriksa gaya, bentuk, lereng, dan gas terperangkap.
