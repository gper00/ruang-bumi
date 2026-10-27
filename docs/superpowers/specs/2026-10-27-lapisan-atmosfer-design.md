# Desain: topik lapisan atmosfer

Tanggal: 2026-10-27
Status: dikerjakan
Cakupan: `ruang-bumi/`

## 1. Pertanyaan

“Kalau makin tinggi, kenapa udara makin dingin?” Ini pertanyaan yang jawabannya sering
disederhanakan menjadi salah. Yang benar: arah suhu berganti-ganti di tiap lapisan, karena setiap
lapisan dipanaskan proses yang berbeda. Artikel harus membuat pembaca melihat profil suhu, bukan
menghafal urutan nama lapisan.

## 2. Tujuan

1. Satu halaman topik baru `atmosfer/lapisan-atmosfer` dengan kerangka wajib `CONTENT-GUIDE.md`.
2. Visual profil suhu 0–100 km: slider ketinggian, kurva suhu, batas lapisan, dan penjelasan
   pemanas tiap lapisan.
3. Semua angka punya sumber resmi (NASA, NOAA, US Standard Atmosphere) dan tercatat di halaman
   sumber.
4. Logika profil suhu diuji tanpa peramban.

## 3. Struktur artikel

```mdx
<Figure> ProfilAtmosfer </Figure>
<DataNote> profil standar; batas nyata bervariasi </DataNote>

## Kok bisa?
  troposfer: dipanaskan dari permukaan, suhu turun ~6,5 °C/km
### Kenapa udara yang naik jadi dingin?
### Di atas tropopause arahnya berbalik
### Mesosfer: bagian terdingin atmosfer
### Termosfer: suhunya tinggi, panasnya sedikit

## Fakta menarik
<Quiz> tiga soal </Quiz>
```

## 4. Visual `ProfilAtmosfer`

- SVG vertikal 0–100 km: kurva suhu, sabuk empat lapisan, penanda ketinggian yang digerakkan
  slider 0–100 km.
- Panel hasil: lapisan, suhu, arah perubahan, dan proses yang memanaskan lapisan itu.
- Kurva memakai titik tetap U.S. Standard Atmosphere 1976: 15 °C di permukaan laut, −56,5 °C di
  11 km (tropopause), sekitar −2,5 °C di stratopause 47–51 km, −86 °C di mesopause 85 km, lalu
  naik sedikit sampai 100 km.
- Alasan kurva berhenti di 100 km: di atas itu suhu termosfer bisa ribuan derajat, tetapi
  skalanya akan menghapus seluruh bentuk di bawahnya. Ditulis di label ilustrasi.
- Label ilustrasi juga menyebut tropopause nyata berkisar 8 km (kutub) sampai 17 km (ekuator).

## 5. Logika dan tes

`src/lib/atmosfer.ts`: `LAPISAN` (id, nama, rentang, arah, pemanas, ringkasan), `suhuPada(km)`
dengan interpolasi linear antar titik tetap, `lapisanPada(km)`, dan `profilSuhu(langkah)`.
Tes unit memeriksa titik tetap, nilai minimum di mesopause, batas lapisan, dan pembatasan nilai
di luar rentang.

## 6. Sumber baru

| id | Penerbit | Dipakai untuk |
|---|---|---|
| `nasa-atmosphere-cake` | NASA Science | Batas lima lapisan, pemanasan troposfer dari permukaan, mesopause −85 °C |
| `nasa-what-atmosphere` | NASA | Mekanisme ozon, mesosfer terdingin, termosfer sampai 2.000 °C |
| `noaa-atmosphere-layers` | NOAA JetStream | Lima lapisan dan batas “pause” |
| `nasa-standard-atmosphere` | NASA NTRS | Profil suhu standar (titik tetap kurva) |
| `noaa-air-pressure` | NOAA JetStream | Tekanan standar permukaan laut 1.013,25 hPa |
| `nasa-puncak-jaya` | NASA Earth Observatory | Puncak Jaya 4.884 m dan es tropisnya (pembuka artikel) |

## 7. Verifikasi

`npm run check`, `npm test`, `npm run build` (termasuk budget), dan `npm run check:ui`
(axe, luapan horizontal, tema terang/gelap, reduced motion). Pemeriksaan UI menambah: slider
ketinggian mengganti lapisan dan suhu, dan batas lapisan di panel hasil ikut berubah.
