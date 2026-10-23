# Rancangan: perbaikan konten & visualisasi 5 topik baru Ruang Bumi

Tanggal: 2026-10-24
Status: menunggu review
Cakupan: `ruang-bumi/`

## 1. Latar belakang

Lima topik yang baru ditambahkan (`laut/ocean`, `laut/owen`, `daratan/sungai`,
`daratan/danau`, `penutup/menghubungkan`) belum memenuhi standar proyek:

- Visual utamanya hanya `<MapView>` generik. Layer yang diminta (`oceans`, `coasts`,
  `currents`, `drainage`, `lakes`) tidak punya data, sehingga yang tampil hanya peta dunia
  dan garis daratan. Peta itu tidak menjelaskan mekanisme yang dibahas topik.
- Teksnya mengandung kalimat rusak, campuran bahasa, dan istilah karangan
  (`wetan`, `patchungan`, `auifer`, "parit pleret"). Beberapa pertanyaan topik juga
  tidak masuk akal, mis. `laut/owen`: "Kenapa lautan pernah dianggap terbatas, padahal
  beralih dari gradientnya?".
- Statusnya sudah `terbit` padahal belum lolos checklist CONTENT-GUIDE.

Topik lama sudah punya pola yang benar: setiap topik punya komponen visual khusus yang
menjelaskan mekanismenya (`SimMusim`, `SiklusAir`, `SimAnginLaut`, `BiomaMap`,
`SubduksiDiagram`, `DistribusiAir`). Rancangan ini menyamakan standar tersebut untuk lima
topik baru.

## 2. Tujuan

1. Setiap topik baru punya visual yang menjelaskan pertanyaan topiknya, bukan peta tempelan.
2. Teks setiap topik ditulis ulang: akurat, berbahasa Indonesia yang wajar, setiap angka
   bersumber, dan kuis menjelaskan jawaban benar maupun salah.
3. Tidak ada lagi istilah karangan di konten maupun glosarium.
4. Duplikat `topik/bioma/bioma.mdx` dihapus.

## 3. Bukan tujuan

- Menambah topik baru di luar lima topik ini.
- Mengubah `MapView` atau topik lempeng tektonik.
- Peta 3D/globe (sesuai SPEC, globe arus laut adalah fase 3).
- Deploy atau perubahan CI di luar penyesuaian tes yang sudah ada.

## 4. Keputusan yang sudah disetujui

- Pendekatan visual: **komponen khusus per topik** (bukan satu komponen reusable, bukan
  MapView + overlay).
- Cakupan: **5 topik + hapus duplikat bioma**.
- **Pertanyaan topik boleh di-reframe** menjadi pertanyaan kebumian yang nyata.
- Visual memakai **SVG/DOM, bukan Leaflet**. Leaflet dilepas dari kelima halaman ini.
  `MapView` tetap dipakai topik lempeng tektonik.
- `status` tetap `terbit` karena build memfilter `status === 'terbit'`; halaman akan hilang
  dari situs bila diset `review`. `diverifikasi` diisi tanggal baru setelah checklist lolos.

## 5. Rancangan per topik

Semua topik memakai kerangka wajib CONTENT-GUIDE: `Figure` + `DataNote`, bagian
"Kok bisa?" maksimal ~500 kata, "Fakta menarik" 2–4 butir, dan `Quiz` 3 soal.
Setiap angka wajib punya satuan dan `<Cite>`. `<Figure source="...">` harus menunjuk
sumber yang memang mendasari visual tersebut, bukan sekadar sumber teks.

### 5.1 `laut/ocean` — Zona laut

- **Pertanyaan baru:** "Kenapa laut terbagi jadi beberapa zona, padahal airnya menyambung?"
- **Jawaban singkat (arah):** air laut menyambung, tetapi cahaya, suhu, dan tekanan berubah
  drastis menurut kedalaman; perubahan itu membentuk zona kehidupan yang berbeda.
- **Isi "Kok bisa?":**
  - Cahaya diserap air; sebagian besar habis di 200 meter pertama.
  - Zona fotik/epipelagik (0–200 m): cukup cahaya untuk fotosintesis.
  - Zona senja/mesopelagik (200–1.000 m): cahaya redup, tidak cukup untuk fotosintesis.
  - Zona gelap/batipelagik (>1.000 m): tanpa cahaya matahari; kehidupan bergantung pada
    bahan organik yang jatuh dari atas dan sumber kimia di dasar.
  - Zona bukan dinding: air, panas, dan nutrisi tetap berpindah antarzona.
- **Visual:** `ZonaLaut` (lihat 6.1).
- **Fakta menarik:** contoh adaptasi kehidupan di tiap zona; pentingnya zona fotik sebagai
  dasar rantai makanan laut.
- **Glosarium:** zona fotik, zona senja, zona gelap.

### 5.2 `laut/arus` (ganti `laut/owen`) — Arus laut

- **Berkas baru:** `src/content/topik/laut/arus.mdx`; `owen.mdx` dihapus.
  Tidak ada referensi lain ke id `laut/owen`, jadi penggantian aman.
- **Pertanyaan baru:** "Kenapa air laut mengalir, dan ke mana perginya?"
- **Jawaban singkat (arah):** angin dan perbedaan suhu/garam menggerakkan air laut dalam
  aliran tetap; arus memindahkan panas dan nutrisi antarbenua, sehingga laut berperan
  seperti sabuk pengangkut iklim.
- **Isi "Kok bisa?":**
  - Arus permukaan digerakkan angin dan dibelokkan rotasi Bumi (efek Coriolis).
  - Bentuk benua membelokkan aliran menjadi pusaran (gyre).
  - Arus hangat memindahkan panas dari ekuator ke lintang tinggi; arus dingin sebaliknya.
  - Arus dalam (termohalin) digerakkan perbedaan suhu dan kadar garam.
  - Naiknya air dalam (upwelling) membawa nutrisi ke permukaan dan menopang perikanan.
- **Visual:** `PetaArus` (lihat 6.2).
- **Fakta menarik:** contoh Gulf Stream/Kuroshio; hubungan upwelling dengan produktivitas
  laut; arus sebagai pengatur iklim pesisir.
- **Glosarium:** arus laut, efek Coriolis, upwelling.

### 5.3 `daratan/sungai` — Kualitas air hulu ke hilir

- **Pertanyaan baru:** "Kenapa kualitas air di muara ditentukan oleh apa yang terjadi di hulu?"
- **Jawaban singkat (arah):** sungai mengangkut materi dari seluruh daerah alirannya; apa
  yang masuk di hulu ikut bergerak dan terakumulasi di hilir.
- **Isi "Kok bisa?":**
  - Daerah aliran sungai (DAS) mengumpulkan air hujan dari seluruh cekungan.
  - Erosi membawa sedimen; lahan pertanian membawa pupuk; permukiman membawa limbah.
  - Materi larut bergerak bersama air; sebagian mengendap, sebagian terurai, sebagian
    terakumulasi.
  - Muara mencampur air sungai dengan air laut, sehingga dampaknya terasa di pesisir.
  - Perbaikan di hulu (tutupan lahan, pengelolaan limbah) berpengaruh sampai hilir.
- **Visual:** `AliranSungai` (lihat 6.3).
- **Fakta menarik:** contoh beban sedimen/nutrisi; mengapa hilir dan muara sering menjadi
  titik pemantauan.
- **Glosarium:** daerah aliran sungai, sedimen, muara.

### 5.4 `daratan/danau` — Pencampuran danau

- **Pertanyaan baru:** "Kenapa air danau tidak pernah benar-benar diam?"
- **Jawaban singkat (arah):** danau memang tidak mengalir seperti sungai, tetapi airnya
  bergerak vertikal mengikuti suhu; perbedaan massa jenis membentuk lapisan yang berganti
  sepanjang tahun.
- **Isi "Kok bisa?":**
  - Air paling rapat pada suhu sekitar 4 °C; sifat ini yang memungkinkan lapisan terbentuk.
  - Lapisan atas (epilimnion) lebih hangat dan terkena cahaya.
  - Termoklin adalah lapisan peralihan dengan suhu turun cepat.
  - Lapisan bawah (hipolimnion) lebih dingin, gelap, dan miskin oksigen.
  - Saat permukaan mendingin/menghangat, lapisan bercampur (pembalikan/ turnover).
  - **Catatan penting:** siklus empat musim menggambarkan danau lintang tinggi; danau
    tropis seperti di Indonesia umumnya lebih stabil dan berpola berbeda. Ini wajib
    ditulis eksplisit, bukan disamakan.
- **Visual:** `DanauMusim` (lihat 6.4).
- **Fakta menarik:** mengapa oksigen di dasar danau bisa habis; hubungan pencampuran dengan
  nutrisi dan kehidupan.
- **Glosarium:** epilimnion, termoklin, hipolimnion.

### 5.5 `penutup/menghubungkan` — Sistem Bumi

- **Pertanyaan tetap:** "Bagaimana semua hal di atas saling terhubung?"
- **Isi "Kok bisa?":** tulis ulang total. Bumi sebagai sistem: lempeng membentuk relief →
  relief mengatur aliran air dan angin → iklim membentuk bioma → laut mengangkut panas →
  siklus air menghubungkan semuanya. Setiap klaim ditautkan ke topik terkait.
- **Visual:** `SistemBumi` (lihat 6.5).
- **Fakta menarik:** 2–4 contoh rantai sebab-akibat lintas topik.
- **Glosarium:** sistem Bumi (bila belum ada).

## 6. Rancangan komponen visual

Pola umum semua komponen:

- React island dengan `client:visible`, tanpa impor Leaflet.
- Keadaan awal selalu terisi; tidak ada layar kosong.
- Kontrol memakai elemen native (`button`, `input[type=range]`) sehingga bisa dioperasikan
  keyboard; target sentuh minimal 24×24 px.
- Ringkasan perubahan penting lewat `aria-live="polite"`; teks alternatif statis juga
  ditampilkan di bawah visual (di luar SVG) agar terbaca pembaca layar dan tanpa JS.
- Kontras teks minimal 4,5:1 dan fokus keyboard selalu terlihat (WCAG 2.2 AA).
- `useReduceMotion()` mematikan animasi otomatis.
- Warna hanya dari token `src/styles/tokens.css`; ukuran responsif 360 px sampai desktop.
- Label "Ilustrasi" lewat `<DataNote>` di MDX, bukan di komponen.
- Skala yang tidak linier diberi keterangan "skala tidak linier" pada visual.

### 6.1 `ZonaLaut`

- SVG penampang vertikal laut, sumbu kedalaman 0–4.000 m (skala tidak linier, ditandai).
- Tiga pita zona: fotik (0–200 m), senja (200–1.000 m), gelap (>1.000 m).
- Kontrol: slider kedalaman + tombol per zona; keduanya sinkron.
- Panel info per zona: perkiraan cahaya, suhu (kualitatif atau angka bersumber), contoh
  kehidupan.
- Label "0 m / 200 m / 1.000 m / 4.000 m" selalu terlihat.
- `aria-live`: "Kedalaman 250 m, zona senja."

### 6.2 `PetaArus`

- SVG peta dunia skematik dengan panah arus utama: Gulf Stream, Kuroshio, Arus
  Khatulistiwa, Arus Antartika (ACC), dan beberapa lainnya. Bentuk daratan disederhanakan
  dari `public/data/land.geojson` lalu disimpan sebagai path SVG statis (dihasilkan sekali
  dari data itu, bukan digambar ulang manual).
- Toggle "Arus hangat / Arus dingin" menyorot kelompok arus.
- Klik panah atau tombol daftar arus membuka kartu info: nama, jenis (hangat/dingin),
  arah, dan pengaruhnya.
- Daftar tombol arus di bawah peta menjadi jalur keyboard dan teks alternatif.
- Peta bersifat skematik: arah dan posisi disederhanakan, bukan koordinat presisi.
  Keterangan ini wajib ada di `DataNote`.

### 6.3 `AliranSungai`

- SVG profil memanjang: gunung → hulu → anak sungai → dataran → muara/laut.
- Kontrol: pilih jenis beban (erosi, pupuk, limbah) + slider intensitas 0–100.
- Visual hilir berubah secara kualitatif: indikator "jernih / keruh / kaya nutrisi /
  tercemar" dan penanda endapan.
- Tidak menampilkan angka ilmiah palsu; ini model kualitatif dan diberi label ilustrasi.
- `aria-live` merangkum: "Beban pupuk tinggi: nutrisi meningkat sampai muara."

### 6.4 `DanauMusim`

- SVG penampang danau: epilimnion, termoklin, hipolimnion, dasar, tepian.
- Kontrol: empat tombol musim (semi, panas, gugur, dingin) atau slider satu sumbu.
- Panas: stratifikasi kuat; gugur/semi: panah pencampuran; dingin: lapisan es di permukaan
  dan air terdingin di bawahnya.
- Indikator oksigen dan nutrisi berubah kualitatif.
- Catatan di dalam visual: "Model danau lintang tinggi; danau tropis berpola berbeda."
- `aria-live` merangkum keadaan tiap musim.

### 6.5 `SistemBumi`

- Diagram node: lempeng, atmosfer, air, laut, kehidupan.
- Edge berlabel: panas, air, sedimen, nutrisi, karbon.
- Klik node (tombol) menyorot edge yang terhubung dan menampilkan 2–3 contoh rantai
  sebab-akibat + tautan ke topik terkait.
- Keadaan awal: semua edge terlihat, belum ada node terpilih.
- Daftar teks di bawah diagram menjelaskan semua koneksi untuk pembaca layar.

## 7. Arsitektur kode

Berkas baru:

```
src/components/viz/ZonaLaut.tsx + ZonaLaut.css
src/components/viz/PetaArus.tsx + PetaArus.css
src/components/viz/AliranSungai.tsx + AliranSungai.css
src/components/viz/DanauMusim.tsx + DanauMusim.css
src/components/viz/SistemBumi.tsx + SistemBumi.css
src/components/viz/useReduceMotion.ts
src/lib/zonaLaut.ts
src/lib/arusLaut.ts
src/lib/aliranSungai.ts
src/lib/danauMusim.ts
src/lib/sistemBumi.ts
```

- Logika murni (pemetaan kedalaman→zona, musim→keadaan lapisan, beban→indikator hilir,
  daftar arus, node/edge sistem) berada di `src/lib/*` dan diuji Vitest tanpa JSX.
- Komponen hanya menangani render, state UI, dan aksesibilitas.
- `useReduceMotion` menggantikan duplikasi `pakaiReduce` (MapView tetap memakai
  implementasinya sendiri pada tahap ini; tidak diubah agar lingkup tetap kecil).

## 8. Konten, sumber, dan glosarium

- Tiap topik ditulis ulang penuh (bukan tambal): `jawabanSingkat`, "Kok bisa?", fakta,
  kuis, `terkait`, `glosarium`, `sumber`.
- Sumber baru yang diperlukan ditambahkan ke `src/content/sumber/*.yaml` dengan field
  wajib lengkap (`id`, `penerbit`, `judul`, `url`, `jenis`, `lisensi`, `diakses`).
  Hanya sumber resmi/primer (NOAA, USGS, NASA) sesuai kebijakan lisensi SPEC §6.3;
  URL, lisensi, dan tanggal akses diverifikasi sebelum YAML ditulis.
- Setiap angka di teks punya satuan dan `<Cite>`; kalau tidak ada sumber yang tepat,
  angka dihapus dan diganti pernyataan kualitatif.
- Glosarium: hapus entri `wetan`, `patchungan`, dan `auifer`. Tambahkan hanya istilah yang
  benar-benar dipakai di kelima topik. Setiap `<Term>` hanya pada kemunculan pertama.
- Larangan eksplisit: istilah dan frasa karangan (`wetan`, `patchungan`, `auifer`,
  "parit pleret"), kalimat campur bahasa, dan klaim tanpa sumber.
- Kuis: tiga soal per topik; penjelasan harus berlaku untuk jawaban benar dan salah.
- Setelah lolos checklist CONTENT-GUIDE, `status: "terbit"` dan `diverifikasi` diisi
  tanggal penyelesaian.

## 9. Pembersihan dan penyesuaian

- Hapus `src/content/topik/bioma/bioma.mdx` (duplikat `ekologi/bioma.mdx`).
- Hapus `src/content/topik/laut/owen.mdx`; tambah `laut/arus.mdx`.
- Perbarui `terkait` di topik lain yang menunjuk id lama (bila ada).
- Perbarui `tests/ui-check.mjs`: jumlah kartu Ekologi sekarang 1 (bukan 2), dan tambahkan
  kunjungan ke lima halaman baru.
- Tidak ada perubahan pada `src/components/viz/MapView.tsx`.

## 10. Verifikasi

Unit test (Vitest):

- `tests/unit/zona-laut.test.ts` — batas 200 m dan 1.000 m, nilai di luar rentang.
- `tests/unit/arus-laut.test.ts` — daftar arus, klasifikasi hangat/dingin, filter toggle.
- `tests/unit/aliran-sungai.test.ts` — indikator hilir untuk tiap jenis beban dan
  intensitas 0/50/100.
- `tests/unit/danau-musim.test.ts` — keadaan lapisan dan pencampuran per musim.
- `tests/unit/sistem-bumi.test.ts` — node/edge konsisten, setiap edge punya label.
- `tests/unit/konten.test.ts` — tidak ada istilah terlarang di `src/content/topik` dan
  glosarium; setiap topik baru punya minimal 2 sumber dan 3 soal kuis.

Pemeriksaan proyek:

- `npm run check` — astro check + check-sources + check-links.
- `npm test` — seluruh unit test.
- `npm run build` — build + budget performa (JS awal <60 KB, total <250 KB gzip).
- `npm run check:ui` — Playwright + axe untuk kelima halaman baru: visual tampil,
  tidak ada console error, kontrol bisa dioperasikan keyboard, tidak ada overflow
  horizontal di 360 px, axe tanpa pelanggaran serius.

Manual:

- Cek visual di 360 px dan desktop, tema terang dan gelap.
- Baca ulang kelima topik sebagai pembaca: tidak ada kalimat rusak, setiap klaim
  dapat ditelusuri.

## 11. Urutan pengerjaan

1. Fondasi: `useReduceMotion` + lima modul `src/lib/*` + unit test (TDD).
2. Sumber resmi: verifikasi dan tambah YAML; bersihkan glosarium.
3. Per topik (bisa paralel karena berkas terpisah): komponen visual + konten + kuis.
4. Pembersihan: hapus duplikat bioma, rename `owen` → `arus`, perbarui `terkait`.
5. Integrasi & verifikasi: ui-check, budget, axe, review visual.

## 12. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Konten tetap tidak akurat | Hanya sumber resmi; setiap angka di-`Cite`; review akurasi terpisah sebelum `terbit` |
| Visual terasa dekoratif, bukan menjelaskan | Setiap komponen harus mengubah keadaan sesuai kontrol dan punya ringkasan `aria-live`; konsep disetujui per topik |
| Danau empat musim tidak relevan untuk Indonesia | Catatan eksplisit di teks dan `DataNote`; bahas perbedaan danau tropis |
| Budget performa membengkak | Semua komponen `client:visible`; Leaflet dilepas dari lima halaman; budget check tetap di build |
| Aksesibilitas | Kontrol native, target sentuh 24 px, fokus terlihat, `aria-live`, teks alternatif, axe di ui-check |
| Peta arus dianggap data presisi | Label ilustrasi + penyederhanaan eksplisit di `DataNote` |

## 13. Definisi selesai

- Lima topik baru lolos checklist CONTENT-GUIDE, berstatus `terbit`, `diverifikasi` baru.
- Tidak ada `MapView` di kelima topik tersebut; masing-masing punya visual khusus.
- Duplikat bioma hilang; ui-check dan build hijau.
- Tidak ada istilah karangan tersisa di konten atau glosarium.
