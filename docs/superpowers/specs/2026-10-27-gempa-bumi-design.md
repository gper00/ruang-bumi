# Desain: topik gempa bumi

Tanggal: 2026-10-27
Status: dikerjakan
Cakupan: `ruang-bumi/`

## 1. Pertanyaan

“Apa yang sebenarnya bergerak saat tanah terasa bergetar?” Pembaca sering membayangkan tanah
bergerak sebagai satu benda, atau menganggap gempa terjadi karena lempeng “menabrak” lalu berhenti.
Yang benar: dua blok batuan meluncur tiba-tiba di bidang sesar, setelah sekian lama tersangkut dan
melengkung sambil menyimpan energi elastis.

## 2. Tujuan

1. Topik baru `planet-bumi/gempa-bumi` dengan kerangka wajib `CONTENT-GUIDE.md`.
2. Dua visual: model pemulihan elastis yang bisa dilepas pembaca, dan pembanding
   hiposentrum–episentrum dengan slider kedalaman.
3. Semua klaim bersumber USGS; tautan BMKG hanya sebagai rujukan pemantauan.
4. Logika murni diuji tanpa peramban.

## 3. Struktur artikel

```mdx
<Figure> GempaRebound </Figure>
<DataNote> distorsi dilebih-lebihkan </DataNote>

## Kok bisa?
  dua blok meluncur di bidang sesar; tepi lempeng kasar yang tersangkut
### Sesar yang menahan, bukan yang bergerak
  karet gelang, pagar 1906, krip sesar, asperity
### Hiposentrum dan episentrum
  <Figure> GempaFokus </Figure>
  definisi, jarak hiposentrum selalu lebih panjang
### Seberapa dalam gempanya?
  tiga kelas kedalaman, gempa dalam di lempeng yang menunjam
### Yang belum bisa dilakukan: meramal
  susulan, magnitudo vs intensitas, belum bisa diramalkan, BMKG

## Fakta menarik
<Quiz> tiga soal </Quiz>
```

## 4. Visual

### 4.1 `GempaRebound`

- Slider regangan 0–120% + tombol “Lepaskan regangan” (aktif saat regangan penuh) + tombol
  “Mulai siklus baru”.
- Pagar dan dua lapisan batuan melengkung mengikuti fungsi tanh yang berpusat di sesar; setelah
  meluncur, keduanya kembali lurus dengan offset permanen sebesar 2,6 m (angka ilustrasi dari
  offset pagar 1906).
- Busur gelombang muncul setelah pelepasan.
- Panel hasil: keadaan sesar, energi tersimpan, geser permanen.
- Catatan ilustrasi menyebut konvensi gambar (gerak digambar ke atas-bawah halaman) dan bahwa
  distorsi sebenarnya tersebar di banyak kilometer.

### 4.2 `GempaFokus`

- Penampang dengan skala kedalaman dimampatkan (pangkat 0,55) supaya 0–700 km muat; sabuk tiga
  kelas kedalaman diberi latar dan label.
- Slider kedalaman 5–700 km dan slider jarak kota 20–150 km.
- Penanda: bintang hiposentrum, titik episentrum tepat di atasnya, garis “tegak lurus”, garis
  jarak episentrum dan jarak hiposentrum, plus busur getaran di kota.
- Panel hasil: kelas kedalaman, jarak ke hiposentrum (dengan pembanding jarak episentrum), dan
  perkiraan getaran di permukaan.

## 5. Logika dan tes

`src/lib/gempa.ts`: `KELAS_KEDALAMAN` (dangkal/menengah/dalam), `kelasKedalaman(km)`,
`jarakHiposentral(jarak, kedalaman)`, `goyanganPermukaan(...)` (model kualitatif), dan
`keadaanSesar(regangan, terlepas)`.

## 6. Sumber baru

| id | Penerbit | Dipakai untuk |
|---|---|---|
| `usgs-science-earthquakes` | USGS Earthquake Hazards | Definisi gempa, sesar, hiposentrum/episentrum, susulan, magnitudo, peramalan |
| `usgs-elastic-rebound` | USGS Earthquake Hazards | Teori pemulihan elastis dan pagar 1906 |
| `usgs-depth-earthquake` | USGS Earthquake Hazards | Tiga kelas kedalaman dan gempa dalam |
| `usgs-earthquake-glossary` | USGS Earthquake Hazards | Episentrum, kedalaman fokus, krip sesar, asperity |

Ditambah dua sumber yang sudah ada: `usgs-plate-tectonics` dan `bmkg-gempa`.

## 7. Verifikasi

`npm run check`, `npm test`, `npm run build` (termasuk budget), dan `npm run check:ui`.
Pemeriksaan UI menambah: melepas regangan mengubah bentuk pagar dan status sesar, kelas kedalaman
berganti saat slider digeser, dan jarak hiposentrum selalu lebih panjang daripada jarak episentrum.
