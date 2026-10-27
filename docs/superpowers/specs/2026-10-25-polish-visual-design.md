# Desain: polish visual Ruang Bumi

Status: selesai 2026-10-26. Tahap 1–4 dikerjakan; ringkasan hasil ada di bagian 9.
Tanggal: 2026-10-25
Keputusan pemilik: **polish konservatif**. Bricolage Grotesque dan Figtree tetap dipakai,
struktur kartu dan sidebar artikel dipertahankan. Prioritas: fondasi, lalu halaman artikel.

---

## 1. Diagnosis

Yang membuat halaman terasa seperti blog biasa bukan isinya, melainkan eksekusi detail:

1. **Skala baca kurang.** Body 1,04 rem terasa kecil di layar lebar, jarak antarbaris belum
   lega, dan measure 68ch terlalu panjang untuk Figtree.
2. **Mono dipakai terlalu banyak.** Hampir semua label, nav, tombol, dan metadata memakai mono,
   sehingga halaman terasa seperti dokumentasi produk, bukan tulisan.
3. **Semua permukaan sama.** Kartu topik, jawaban singkat, figure, kuis, dan sidebar memakai
   border, radius, dan bayangan yang seragam. Tidak ada perbedaan derajat antar-elemen.
4. **Hero dan kartu beranda memakai pola default.** Blob gradien + ilustrasi kecil, kartu dengan
   top-bar yang baru muncul saat hover.
5. **Font eksternal.** Google Fonts memblokir render, tanpa preload, dan tanpa kendali subset.

---

## 2. Arah: polish konservatif

Bukan rebrand. Yang diubah adalah kualitas eksekusi: skala, ritme, kontras, dan detail komponen.
Struktur navigasi, kartu, sidebar TOC, serta keluarga font tetap.

Prinsip:

- **Satu suara tipografi.** Figtree untuk semua teks dan antarmuka; Bricolage hanya untuk judul
  dan label besar; mono hanya untuk angka, sitasi, dan sumber gambar.
- **Garis rambut, bukan bayangan.** Pemisah memakai `--line`; bayangan hanya untuk lapisan
  sementara (popover, peta).
- **Warna sebagai aksen, bukan latar.** Kartu tetap ada, tetapi permukaannya tenang; warna
  kategori hadir sebagai garis/petak kecil.
- **Ruang lebih lega, ukuran lebih tegas.** Sedikit elemen, tetapi setiap elemen punya ukuran
  dan jarak yang disengaja.

---

## 3. Token

Nama token dipertahankan agar seluruh komponen visual ikut berubah tanpa disentuh.

| Token | Terang | Gelap |
|---|---|---|
| `--bg` | `#eef2ee` | `#0b1617` |
| `--surface` | `#fbfcf8` | `#122022` |
| `--surface-2` | `#e3eae4` | `#182a2b` |
| `--fg` | `#14201e` | `#e6efec` |
| `--muted` | `#526660` | `#98ada7` |
| `--line` | `#d2dcd4` | `#273b3b` |
| `--line-strong` | `#9fb3aa` | `#45615c` |
| `--sea` | `#146e78` | `#5db7b5` |
| `--sea-soft` | `#d6e8e7` | `#163a3c` |
| `--heat` | `#b5472c` | `#eb8f6c` |
| `--heat-ink` | `#9a3a22` | `#eb8f6c` |
| `--heat-soft` | `#f4ded4` | `#3b241c` |
| `--ocean` | `#d5e5e2` | `#0c1e22` |
| `--land` | `#e7ead9` | `#1d312b` |
| `--coast` | `#73938d` | `#4d7c78` |
| `--mantle` | `#e8d8cc` | `#3a2922` |
| `--sand` | `#b5944e` | `#7a6540` |
| `--ok` / `--bad` | `#2f6f4a` / `#a13c33` | `#63bd8b` / `#ea857c` |

- `--radius: 10px` untuk kartu dan panel; `--radius-sm: 6px` untuk tombol, chip, opsi kuis.
- Tidak ada `box-shadow` pada kartu, figure, atau kuis. Hover kartu cukup mengubah border dan
  mengangkat 1 px.
- `--wrap: 1160px`; gutter `clamp(20px, 4vw, 40px)`.
- Measure teks `64ch`; jarak paragraf `1.1em`; jarak sebelum `h2` `3rem`.

Aksen kategori tetap seperti sekarang (`--acc-*`), karena sudah lolos kontras dan dipakai visual.

---

## 4. Tipografi

Keluarga font tidak berubah:

| Peran | Font | Perubahan |
|---|---|---|
| Display | Bricolage Grotesque 600/800 | h1 lebih tegas, tracking −0,025em, line-height 1,08 |
| Body | Figtree 400/500/600/700 | naik ke 1,1 rem, line-height 1,72, measure 64ch |
| Label/UI | Figtree 600 | menggantikan mono untuk label, nav, tombol, chip |
| Data | IBM Plex Mono 400/500 | hanya nomor sitasi, angka simulasi, sumber gambar, metadata |

Skala:

- h1 beranda `clamp(2.4rem, 5.2vw, 3.6rem)`.
- h1 artikel `clamp(1.95rem, 4.3vw, 3rem)`, max 22ch.
- h2 `clamp(1.35rem, 2.2vw, 1.6rem)`, Bricolage 800.
- h3 `1.12rem`, Bricolage 700.
- Body `clamp(1.06rem, 1.02rem + 0.2vw, 1.12rem)`.
- Lede `1.18rem`, line-height 1,6.
- Label `0,72rem`, Figtree 600, uppercase, tracking 0,08em.
- Meta `0,74rem`, mono.
- Tidak memakai `hyphens: auto` (bahasa Indonesia tidak punya kamus hyphenation yang baik).

### 4.1 Font self-hosted

- Unduh woff2 latin: Bricolage variable, Figtree variable, Plex Mono 400 + 500.
- `src/styles/fonts.css` dengan `font-display: swap` dan `unicode-range` latin.
- Preload Figtree dan Bricolage; hapus tautan Google Fonts dan preconnect.
- Fallback: `'Segoe UI', system-ui, sans-serif` untuk Figtree; `'Trebuchet MS'` untuk Bricolage;
  `ui-monospace, Menlo` untuk Plex Mono.
- Sertakan `public/fonts/OFL.txt`. Target total ≤ 180 KB.

---

## 5. Layout artikel

Struktur tetap: artikel + sidebar kanan. Yang dirapikan:

```
wrap 1160
┌───────────────────────────────────────────────┬──────────────┐
│ breadcrumb                                    │              │
│ LAUT · PEMULA                                 │  DI HALAMAN  │
│ Kenapa air laut mengalir, dan ke mana ...     │  INI         │
│ ─────────────────────────────────              │  · Kok bisa? │
│ Jawaban singkat (lede)                        │  · Fakta     │
│                                               │  · Kuis      │
│ Kok bisa?                                     │  · Sumber    │
│ Teks 64ch ...                                 │              │
│ ┌───────────────────────────────────────────┐ │  LANJUT      │
│ │ visual                                    │ │  BELAJAR     │
│ └───────────────────────────────────────────┘ │              │
│ keterangan + sumber                           │  CARA BACA   │
│ Fakta menarik / Kuis / Sumber                 │              │
└───────────────────────────────────────────────┴──────────────┘
```

- Grid `minmax(0, 1fr) 280px`, gap 56 px; konten utama maksimal 720 px.
- Mobile: TOC ringkas berupa `<details>` "Di halaman ini" setelah lede; sidebar TOC
  disembunyikan. "Lanjut belajar" tetap di bawah artikel.
- Header artikel: h1, lede, meta satu baris. Garis bawah header 1 px + aksen kategori 3 px.
- Figure tetap berupa panel, tetapi tanpa bayangan, radius 10, latar `--surface-2` tipis.
- Kuis dan sumber memakai lebar teks; tidak ada panel baru.

---

## 6. Komponen yang disentuh

| Komponen | Perubahan |
|---|---|
| `Header` | Tinggi 64 px; nav Figtree 0,8 rem; brand 1,08 rem; active 2 px; toggle tema radius 6. |
| `Footer` | Jarak dan tipografi; label kolofon; tetap 3 kolom. |
| `Breadcrumb` | 0,68 rem mono; halaman aktif dipotong satu baris dengan elipsis. |
| `AnswerBox` | Panel tenang: border 1 px, aksen kiri 3 px, radius 8, padding 20/24, teks 1,18 rem. |
| `Figure` | Tanpa bayangan; gradien dihapus; caption 0,86 rem Figtree; sumber mono 0,7. |
| `DataNote` | Garis putus-putus tetap; label dan padding dirapikan. |
| `Cite` | Ukuran dan popover dirapikan; target 24 px dipertahankan. |
| `Quiz` | Tanpa gradien; garis atas 2 px sea; opsi radius 6; spacing lebih lega. |
| `SourceList` | Nomor mono, judul 0,95 rem, meta 0,72, jarak antar-butir 14 px. |
| `RelatedTopics` | Kartu radius 8, padding 12/14, hover border sea. |
| `TOC` | 0,84 rem Figtree; aktif sea + border 2 px; jarak baris 1,45. |
| `ThemeToggle` | Radius 6, Figtree 0,74 rem. |
| `TopicCard` | Ditunda ke tahap beranda. |

---

## 7. Aksesibilitas dan performa

- Body ≥ 17 px, measure 64ch, line-height 1,72.
- Kontras teks ≥ 4,5:1; aksen tidak untuk teks.
- Fokus 2 px `--sea`, offset 3 px.
- `<details>` TOC bisa dioperasikan keyboard dan punya ringkasan yang jelas.
- Tanpa JS baru; scroll-spy yang ada dipakai ulang.
- Font ≤ 180 KB, preload 2 file, tanpa Google Fonts.
- Budget tetap: JS awal < 60 KB gzip; halaman peta < 250 KB.

---

## 8. Tahapan

1. **Fondasi + artikel (sekarang).** Token, font self-host, base typography, header/footer,
   komponen artikel, TOC mobile.
2. **Beranda + indeks + kategori.** Hero, kartu, search/filter.
3. **Halaman pendukung.** Glosarium, sumber, tentang, 404.
4. **Polish akhir.** Tangkapan layar 360/768/1280, tema gelap, axe, ukuran font.

Verifikasi tiap tahap: `npm run check`, `npm test`, `npm run build`, `npm run check:ui`.

---

## 9. Hasil

- **Beranda.** Masthead tanpa ilustrasi: label, h1 besar, dek, dan satu tautan "Mulai dari" ke
  topik unggulan. Di bawahnya poros kategori dari inti ke permukaan: satu garis dengan enam
  penanda warna, nama kategori, dan jumlah topik. Pencarian dan filter memakai radius 6 dan
  keadaan aktif `--sea-soft`. Kartu topik memakai garis rambut, tanpa bayangan, dan kaki kartu
  "n menit · n sumber" yang sejajar antarkartu; indeks kategori di bawahnya berupa daftar, bukan
  kartu kedua.
- **Semua topik.** Navigasi "Lompat ke" per kategori, heading bagian dengan penanda warna
  kategori, jumlah topik di kanan, dan grid bersama `.grid-topik`.
- **Kategori.** Header dengan aksen kategori dan jumlah topik; daftar kategori lain tanpa pil.
- **Glosarium.** Alfabet kotak 29 px; heading huruf gaya kamus (huruf, garis, jumlah istilah);
  istilah yang dituju tautan disorot dengan warna laut.
- **Tentang.** Aturan bagian bergaya sama dengan artikel, daftar bernomor yang kembali
  menampilkan penanda, catatan status dalam kotak putus-putus.
- **Sumber.** Kolom 74ch, heading bagian dengan jumlah entri, panel kebijakan disamakan lebarnya.
- **404.** Label 404 dengan garis aksen, tombol utama, dan tautan balik.
- **Header & footer.** Empat tautan nav tetap satu baris di 360 px; footer dua kolom pada tablet,
  tiga kolom di 900 px. Baris "nama situs masih placeholder" diganti keterangan lisensi peta.
- **Verifikasi.** `npm run check`, `npm test` (66 tes), `npm run build`, `npm run check:ui`
  (axe, luapan horizontal 360/390/1280, tema terang/gelap, reduced motion) semuanya lolos.
  Teks artikel 18,4 px/32 px pada 1280, sekitar 68 karakter per baris.

---

## Lampiran: arah yang tidak dipilih

Sebuah opsi "atlas lapangan" sempat dipertimbangkan: body serif, kolom inti sebagai TOC, dan
indeks tanpa kartu. Opsi itu ditolak pemilik karena terlalu jauh dari struktur yang sudah ada.
Dokumen ini sengaja tidak memuat detailnya agar tidak bercampur dengan pekerjaan yang disetujui.
