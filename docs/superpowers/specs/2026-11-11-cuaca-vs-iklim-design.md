# Desain topik Cuaca vs iklim

Tanggal: 2026-11-11 · Status: selesai (topik `atmosfer/cuaca-vs-iklim` terbit)

## Pertanyaan dan sasaran

Backlog prioritas Tinggi: *Kenapa ramalan besok bisa salah, tetapi pola 30 tahun bisa dihitung?*
Visual harus memisahkan dua skala waktu: deret harian yang berisik dan rata-rata 30 tahun yang
halus. Minimal dua sumber resmi, satu visual interaktif khusus, dan tiga soal kuis sesuai
`CONTENT-GUIDE.md`.

## Model (`src/lib/iklim.ts`)

Deret suhu sintetis 30 tahun (1996–2025), 365 hari per tahun, dibangkitkan deterministik dari hash
bilangan bulat supaya angka di grafik, ringkasan, dan tes tidak berubah antar-render. Tidak ada
`Math.random`.

- `suhuHarian(tahun, hari)` = suhu dasar 27,0 °C + tren 0,03 °C/tahun + ayunan musiman 1,2 °C
  (puncak sekitar Oktober) + beda antartahun ±0,15 °C + derau harian (tiga bilangan seragam
  dijumlahkan, diskalakan ke simpangan baku sekitar 1,2 °C).
- `normalTahunan()` = rata-rata 30 tahun untuk tiap hari yang sama. Ini replika kecil dari normal
  iklim: rata-rata jangka panjang, bukan satu nilai harian.
- `rataRataTahunan()` dan `rataRataIklim()` merata-ratakan deret harian; `deretTahunan()` memberi
  30 titik untuk grafik kedua; `trenIklim()` adalah selisih rata-rata 2025 dan 1996.
- `ringkasTahun()` mengembalikan rata-rata, anomali terhadap iklim 30 tahun, hari terpanas dan
  terdingin beserta tanggalnya, serta simpangan harian terjauh dari normal.
- Tahun di luar 1996–2025 dijepit lewat `tahunValid()`.

Semua angka model adalah ilustrasi, bukan data stasiun. Fakta yang dikutip artikel tetap berasal
dari sumber: definisi cuaca/iklim, normal 30 tahun, keandalan prakiraan NOAA, dan normal suhu
Indonesia dari BMKG.

## Visual (`src/components/viz/SimIklim.tsx`)

Dua grafik dalam satu komponen:

1. Grafik utama 720×308: suhu harian tahun terpilih (garis panas) di atas garis normal 30 tahun
   (garis putus-putus biru). Sumbu-Y dibulatkan ke derajat, kisi tiap 2 °C, sumbu-X dua belas bulan.
2. Grafik tahunan 720×150: 30 titik rata-rata tahunan, garis rata-rata 30 tahun, dan titik tahun
   terpilih yang disorot. Grafik ini memperlihatkan bahwa rata-rata bergerak perlahan walaupun
   cuaca harian melonjak.

Kontrol: slider tahun 1996–2025 (native `input type="range"`, default 2025) dan centang
“Tampilkan normal 30 tahun” (default aktif). Ringkasan `aria-live="polite"` menyebut rata-rata,
anomali, simpangan harian terjauh, dan tren 30 tahun; saat garis normal disembunyikan, ringkasan
mengatakannya. Keadaan awal sudah terisi. Tidak ada animasi, jadi tidak ada tambahan khusus untuk
`prefers-reduced-motion`; label SVG diperbesar pada layar ≤640 px seperti visual lain.

## Sumber dan glosarium

Empat sumber: `noaa-climate-vs-weather` (definisi cuaca/iklim, normal 30 tahun, ayunan cuaca tidak
otomatis perubahan iklim), `noaa-forecast-reliability` (5 hari ±90%, 7 hari ±80%, 10 hari atau lebih
±50%), `wmo-climate-normals` (definisi normal iklim standar 30 tahun dan pembaruan tiap dekade),
serta `bmkg-normal-suhu` (normal Indonesia 1991–2020 26,7 °C, rata-rata 2025 27,05 °C, anomali
+0,38 °C; hanya ditautkan). Tiga istilah dipakai: `cuaca` dan `normal-iklim` baru, `iklim` memakai
entri lama.

## Keputusan

- Dua grafik, bukan satu: grafik harian menunjukkan ayunan cuaca, grafik tahunan menunjukkan bahwa
  rata-ratanya justru stabil. Satu grafik saja akan membuat salah satu gagal terbaca.
- Model memakai suhu, bukan curah hujan, karena rata-rata suhu lebih mudah dibandingkan satu angka
  normal dan tidak perlu menjelaskan akumulasi harian.
- Normal 30 tahun ditampilkan sebagai garis, bukan band: tujuannya membandingkan bentuk, bukan
  menghitung interval kepercayaan.
- Artikel tidak memakai kata “gempa” agar pencarian beranda di `tests/ui-check.mjs` tetap
  menampilkan dua kartu.

## Pengujian

- `tests/unit/iklim.test.ts`: periode 30 tahun, determinisme, rentang suhu, normal = rata-rata 30
  tahun per hari, konsistensi rata-rata tahunan, tren positif, batas tahun, dan label tanggal.
- `tests/unit/konten-iklim.test.ts`: frontmatter, empat sumber, angka NOAA/BMKG, visual di dalam
  `Figure`, istilah glosarium, tiga soal kuis, serta kendali komponen (slider, centang, dua grafik,
  keadaan awal).
- `tests/ui-check.mjs`: halaman baru dikunjungi di tujuh viewport; slider digeser ke 1996 untuk
  memeriksa keluaran, ringkasan, dan anomali negatif; centang normal dimatikan untuk memastikan
  garis hilang dan ringkasan ikut berubah.
