# Desain topik El Niño & La Niña

Tanggal: 2026-10-28, pembanding berdampingan ditambahkan 2026-10-29 · Status: selesai (topik
`atmosfer/el-nino-la-nina` terbit)

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
- `dampakIndonesia()` memakai angka BMKG: La Niña menaikkan hujan 20–40% dibanding tahun netral
  pada Juni–November; El Niño menurunkan hampir di seluruh wilayah pada periode yang sama.

## Peta (`src/components/viz/PetaEnso.tsx`)

Jendela peta bujur 100°BT–70°BB dan lintang 30°U–30°S dipetakan ke kanvas 720×300. Proyeksi ini
dipindahkan ke `src/lib/petaEnso.ts` (`PETA`, `px()`, `py()`, `EKUATOR`) agar dipakai bersama oleh
peta interaktif dan peta pembanding. `DUNIA_PATH` memakai proyeksi equirektangular 1000×500, jadi
jalur itu digambar dua kali — satu salinan digeser 1.000 unit — supaya belahan 180° tetap sambung
di tengah peta tanpa proyeksi baru.

Lapisan yang bergerak mengikuti slider: posisi pusat air terhangat, lidah air dingin
(opasitas upwelling melemah saat El Niño), tiga panah angin pasat (tebal, panjang, kecepatan
animasi), serta awan dan butiran hujan yang berpindah bersama pita hangat. Kontrol memakai
`input type="range"` native ditambah tiga tombol fase (`aria-pressed`), nilai dibaca lewat
`aria-valuetext`, ringkasan lewat `aria-live="polite"`, dan animasi mati pada
`prefers-reduced-motion`.

Label peta diperbesar pada layar ≤640 px seperti `PetaArus`, dan posisinya diatur agar tidak
bertumpukan pada ukuran itu: “Ekuator” di barat, “angin pasat” di timur atas, “upwelling” dan label
pita hangat di selatan ekuator, “Indonesia”, “SAMUDRA PASIFIK”, dan “Amerika Selatan” di baris
bawah.

## Pembanding berdampingan (`src/components/viz/BandingEnso.tsx`)

Di bawah penjelasan La Niña, artikel memasang dua peta statis bersebelahan: El Niño kuat (+2,0 °C)
dan La Niña kuat (−2,0 °C), keduanya dari `PERBANDINGAN` di `src/lib/enso.ts`. Tiap panel memakai
proyeksi, warna, dan jumlah panah yang sama supaya perbedaan yang terlihat benar-benar berasal
dari anomalinya, bukan dari gaya gambar: pusat air terhangat dan pita hujan di 155°BB versus
125°BT, panah angin pasat 30% versus 170% tahun netral, serta lidah air dingin yang menipis saat
El Niño dan menebal saat La Niña. Angka pendamping diambil dari fungsi model yang sama
(`labelAngin`, `formatBujur`, `dampakIndonesia`), jadi peta pembanding tidak bisa berbeda cerita
dengan slider.

Komponen ini statis (tanpa `client:` directive dan tanpa state) sehingga tidak menambah JavaScript
halaman; animasi panah, awan, dan butiran hujan murni CSS dan mati pada `prefers-reduced-motion`.
Di layar ≥720 px panel berbagi lebar sama; di ponsel panel ditumpuk. Karena React hanya menerima
satu string sebagai isi `<title>`, teks alternatif tiap peta dirangkai lebih dulu dalam satu
template string.

Peta interaktif juga ikut diselaraskan: elips di pusat air terhangat selalu berwarna hangat dan
berlabel “pusat air terhangat” (sebelumnya berubah biru dan berlabel “air lebih dingin” saat
La Niña, padahal posisinya menandai pusat air terhangat). Perbedaan El Niño–La Niña pada peta itu
tetap terbaca dari posisi elips dan opasitas lidah air dingin di Pasifik timur.

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
  dampak Indonesia, format bujur dan anomali, `PERBANDINGAN`, serta `porsiAngin()`.
- `tests/unit/konten-enso.test.ts`: frontmatter, sumber, istilah glosarium, kuis, visual pembanding
  (termasuk memastikan komponennya statis), dan kunci kata “gempa”.
- `tests/ui-check.mjs`: halaman dikunjungi di tujuh viewport, lalu slider digeser ke −1,5 °C dan
  +1,5 °C untuk memeriksa fase, label angin, dan bujur pita hujan, serta tombol fase Netral;
  dua panel pembanding diperiksa dari jumlah panel, bujur pita hujan (155°BB dan 125°BT), dan tebal
  panah (2 dan 5).
