# Desain topik El Niño & La Niña

Tanggal: 2026-10-28 · Status: selesai (topik `atmosfer/el-nino-la-nina` terbit)

## Pertanyaan dan sasaran

Backlog prioritas Tinggi: *Kenapa kemarau di Indonesia kadang jauh lebih panjang?* Visual wajib
berupa peta Pasifik dengan anomali suhu laut, panah angin pasat, dan pergeseran hujan. Minimal
dua sumber resmi, satu visual interaktif khusus, dan tiga soal kuis sesuai `CONTENT-GUIDE.md`.

## Model (`src/lib/enso.ts`)

Satu masukan: anomali suhu laut Pasifik tropis −2,0 sampai +2,0 °C (langkah 0,1). Semua keluaran
diturunkan dari angka itu lewat fungsi murni:

- `faseEnso()` memakai ambang Oceanic Niño Index NOAA: ≥ +0,5 °C El Niño, ≤ −0,5 °C La Niña,
  selainnya netral. Ambang ini fakta bersumber, bukan pilihan model.
- `kekuatanAngin()` = `1 − 0,35 × anomali` dibatasi 0,3–1,7 (1,0 = tahun netral): El Niño
  menurunkannya, La Niña menaikkannya.
- `pusatHangat()` = `150 + 27,5 × anomali` dibatasi 125–205° timur: netral di 150°BT, El Niño
  menyeret pusat air hangat ke timur, La Niña menekannya ke barat dekat Indonesia.
- `pusatHujan()` sengaja sama dengan `pusatHangat()`, karena mengikuti keterangan PMEL bahwa
  hujan turun di atas air yang paling hangat.
- `dampakIndonesia()` memakai angka BMKG: El Niña menaikkan hujan 20–40% dibanding tahun netral
  pada Juni–November; El Niño menurunkan hampir di seluruh wilayah pada periode yang sama.

## Peta (`src/components/viz/PetaEnso.tsx`)

Jendela peta bujur 100°BT–70°BB dan lintang 30°U–30°S dipetakan ke kanvas 720×300. `DUNIA_PATH`
memakai proyeksi equirektangular 1000×500, jadi jalur itu digambar dua kali — satu salinan
digeser 1.000 unit — supaya belahan 180° tetap sambung di tengah peta tanpa proyeksi baru.

Lapisan yang bergerak mengikuti slider: pita air hangat (posisi dan warna), lidah air dingin
(opasitas upwelling melemah saat El Niño), tiga panah angin pasat (tebal, panjang, kecepatan
animasi), serta awan dan butiran hujan yang berpindah bersama pita hangat. Kontrol memakai
`input type="range"` native ditambah tiga tombol fase (`aria-pressed`), nilai dibaca lewat
`aria-valuetext`, ringkasan lewat `aria-live="polite"`, dan animasi mati pada
`prefers-reduced-motion`.

Label peta diperbesar pada layar ≤640 px seperti `PetaArus`, dan posisinya diatur agar tidak
bertumpukan pada ukuran itu: “Ekuator” di barat, “angin pasat” di timur atas, “upwelling” dan label
pita hangat di selatan ekuator, “Indonesia”, “SAMUDRA PASIFIK”, dan “Amerika Selatan” di baris
bawah.

## Sumber dan glosarium

Empat sumber: `noaa-pmel-el-nino` (kondisi normal, hujan mengikuti air hangat, kemarau di
Indonesia), `noaa-ninonina` (angin pasat melemah/menguat, lamanya kejadian), `noaa-oni` (ambang
±0,5 °C), dan `bmkg-enso` (dampak curah hujan bulanan di Indonesia; hanya ditautkan). Lima istilah
baru: `enso`, `el-nino`, `la-nina`, `angin-pasat`, `anomali-suhu-laut`, plus pemakaian ulang
`upwelling`.

## Keputusan

- Pertanyaan dan `jawabanSingkat` tidak memuat kata “gempa”, karena pencarian beranda di
  `tests/ui-check.mjs` mengunci hasil kata “gempa” ke dua kartu.
- Satu slider, bukan dua: semua perubahan di peta memang berasal dari satu angka anomali, dan
  tombol fase hanya pemercepat untuk nilai yang sudah ada.
- Angka posisi pita dan persentase kekuatan angin diberi label ilustrasi di `<DataNote>` dan di
  bawah visual; yang fakta hanya ambang fase, arah perubahan, dan angka BMKG.

## Pengujian

- `tests/unit/enso.test.ts`: ambang fase, monotonisitas kekuatan angin dan pusat pita, batas
  dampak Indonesia, format bujur dan anomali.
- `tests/unit/konten-enso.test.ts`: frontmatter, sumber, istilah glosarium, kuis, dan kunci kata
  “gempa”.
- `tests/ui-check.mjs`: halaman dikunjungi di tujuh viewport, lalu slider digeser ke −1,5 °C dan
  +1,5 °C untuk memeriksa fase, label angin, dan bujur pita hujan, serta tombol fase Netral.
