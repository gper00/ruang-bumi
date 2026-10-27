# SPEC: Ruang Bumi

Situs belajar ilmu kebumian berbahasa Indonesia. Nama masih placeholder.

Status: draft v0.1. Dokumen ini dibuat untuk dikerjakan sendiri oleh satu developer, dengan bantuan AI coding agent. Setiap bagian ditulis supaya bisa langsung dijadikan task.

---

## 1. Tujuan

**Satu kalimat:** tiap halaman menjawab satu pertanyaan tentang Bumi lewat visual interaktif, dan setiap angka, grafik, atau peta bisa ditelusuri ke sumbernya.

**Pembeda:**
1. Visual interaktif (animasi, peta, grafik), bukan teks panjang.
2. Sumber transparan di setiap klaim dan visual.
3. Konteks lokal (Indonesia, Lombok, Rinjani, Cincin Api).

**Target pengguna:** pelajar SMP-SMA, mahasiswa baru, dan orang awam yang penasaran. Mereka biasanya menonton video (misalnya West Edukasi) dan butuh tempat untuk baca ulang, melihat diagram, dan lanjut belajar.

**Tujuan pemilik:** rilis publik sekaligus portfolio.

### Keputusan yang sudah diambil
| Hal | Keputusan |
|---|---|
| Framework | Astro + MDX + Content Collections |
| Island framework | React |
| Peta | Leaflet 1.9.4 (2.0 masih alpha, jangan dipakai) |
| Data live v1 | Hanya gempa USGS |
| Lisensi | Teks CC BY 4.0, kode MIT |
| Target MVP | 5 topik |
| Nama | "Ruang Bumi" (placeholder, ganti sebelum rilis) |

### Non-goals (sengaja tidak dikerjakan di v1)
Crawler otomatis, ringkasan AI otomatis, akun pengguna, CMS, komentar, multi-bahasa, aplikasi mobile.

---

## 2. Prinsip

1. **Mulai dari pertanyaan, bukan kategori.** Judul halaman adalah pertanyaan yang orang benar-benar penasaran soal itu.
2. **Visual dulu, teks menyusul.** Kalau sebuah topik tidak bisa dibuat visualnya, tulis lebih pendek.
3. **Tulis ulang, jangan salin.** Nilai situs ini ada di kurasi, penyederhanaan, dan visualisasi.
4. **Tanpa sumber, tidak terbit.** Dipaksa oleh build, bukan oleh disiplin.
5. **Ringan.** Muat library berat hanya di halaman yang butuh.
6. **Jujur soal penyederhanaan.** Model yang disederhanakan diberi label "ilustrasi".

---

## 3. Stack

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Framework | Astro (stabil terbaru saat inisiasi, pin versinya) | Konten statis, island untuk interaktif |
| Konten | MDX + Content Collections + Zod | Schema divalidasi saat build |
| Island | React | Hanya untuk komponen interaktif |
| Peta | Leaflet 1.9.4 | Dimuat client-side saja, butuh `window` |
| Grafik | Observable Plot atau D3 | Pilih Plot dulu, D3 kalau butuh kontrol penuh |
| Animasi | SVG + CSS, GSAP atau Motion bila perlu | Hormati `prefers-reduced-motion` |
| 3D (fase 3) | three.js atau globe.gl | Hanya untuk struktur Bumi dan arus laut |
| Pencarian | Pagefind | Index dibuat saat build |
| Styling | CSS variables + CSS modules atau Tailwind | Pilih satu, jangan campur |
| Tes | Vitest (unit), Playwright (visual dan a11y), axe | |
| Hosting | Cloudflare Pages atau Vercel | Pilih yang gratis dan paling dikenal |
| Lint | ESLint, Prettier, `astro check` | Jalankan di CI |

Aturan versi: semua dependency dipin ke versi exact di `package.json`, dan upgrade dilakukan sengaja, bukan otomatis.

---

## 4. Struktur repo

```
/
├─ src/
│  ├─ content/
│  │  ├─ topik/
│  │  │  ├─ atmosfer/angin-darat-laut.mdx
│  │  │  ├─ atmosfer/musim.mdx
│  │  │  ├─ atmosfer/siklus-air.mdx
│  │  │  ├─ planet-bumi/struktur-bumi.mdx
│  │  │  ├─ planet-bumi/lempeng-tektonik.mdx
│  │  │  └─ ekologi/bioma.mdx
│  │  ├─ sumber/sources.yaml
│  │  ├─ dataset/datasets.yaml
│  │  └─ glosarium/istilah.yaml
│  ├─ components/
│  │  ├─ layout/       (Header, Footer, ThemeToggle, Breadcrumb)
│  │  ├─ topik/        (AnswerBox, Section, Fact, RelatedTopics, SourceList)
│  │  ├─ sumber/       (Cite, Figure, DataNote)
│  │  ├─ viz/          (MapView, Chart, SimAnginLaut, ...)
│  │  ├─ quiz/         (Quiz, Question)
│  │  └─ glosarium/    (Term)
│  ├─ layouts/TopikLayout.astro
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ topik/[...slug].astro
│  │  ├─ kategori/[kategori].astro
│  │  ├─ glosarium.astro
│  │  ├─ sumber.astro
│  │  ├─ tentang.astro
│  │  └─ 404.astro
│  ├─ lib/             (sources.ts, datasets.ts, usgs.ts, geo.ts)
│  └─ styles/          (tokens.css, base.css)
├─ data/
│  ├─ raw/             (file asli yang diunduh, jangan diedit)
│  ├─ processed/       (hasil skrip, dipakai situs)
│  └─ scripts/         (skrip pemrosesan, bisa dijalankan ulang)
├─ scripts/check-sources.mjs
├─ tests/
├─ SPEC.md
├─ CONTENT-GUIDE.md
└─ LICENSE (MIT) + LICENSE-CONTENT (CC BY 4.0)
```

---

## 5. Model konten

### 5.1 Topik (`src/content/topik/**.mdx`)

```ts
// src/content.config.ts
import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const topik = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/topik' }),
  schema: z.object({
    pertanyaan: z.string().min(10),            // judul halaman, berbentuk pertanyaan
    slug: z.string().optional(),
    kategori: z.enum(['planet-bumi','atmosfer','laut','daratan','ekologi','penutup']),
    level: z.enum(['pemula','menengah']).default('pemula'),
    menit: z.number().int().min(1).max(15),    // perkiraan waktu baca
    jawabanSingkat: z.string().max(320),
    terkait: z.array(z.string()).max(6),       // id topik lain
    sumber: z.array(z.string()).min(2),        // id dari sources.yaml, minimal 2
    dataset: z.array(z.string()).default([]),  // id dari datasets.yaml
    glosarium: z.array(z.string()).default([]),
    status: z.enum(['draft','review','terbit']).default('draft'),
    diverifikasi: z.coerce.date(),             // tanggal fakta terakhir dicek
    penulis: z.string().default('Umam'),
  }),
});
```

Template isi tiap topik (urutan tetap):
1. Jawaban singkat (dari `jawabanSingkat`).
2. Visual utama (komponen interaktif).
3. "Kok bisa?" (penjelasan, maksimal sekitar 500 kata).
4. Fakta menarik (2 sampai 4 butir).
5. Kuis (3 soal pilihan ganda).
6. Lanjut belajar (`terkait`).
7. Sumber (dikumpulkan otomatis).

### 5.2 Sumber (`src/content/sumber/sources.yaml`)

```yaml
- id: usgs-plate-tectonics
  penerbit: USGS
  judul: "Plate Tectonics and People"
  url: https://pubs.usgs.gov/gip/dynamic/tectonics.html
  jenis: web            # web | jurnal | buku | dataset | video
  lisensi: public-domain-us-gov
  diakses: 2026-10-22
  catatan: "Dipakai untuk definisi tiga jenis batas lempeng."
```

Field wajib: `id`, `penerbit`, `judul`, `url`, `jenis`, `lisensi`, `diakses`.

### 5.3 Dataset (`src/content/dataset/datasets.yaml`)

```yaml
- id: pb2002-plates
  nama: "Lempeng tektonik PB2002"
  sumber: bird-2003-pb2002        # id di sources.yaml
  asal: https://github.com/fraxen/tectonicplates
  lisensi: ODbL-1.0               # VERIFIKASI saat inisiasi
  diambil: 2026-10-21
  proses: data/scripts/plates.mjs
  keluaran: data/processed/plates.geojson
  catatan: "Koordinat dibulatkan 1 desimal. Poligon yang melintasi bujur 180 dipecah."
```

---

## 6. Sistem sumber dan atribusi (inti sistem)

### 6.1 Komponen
- `<Cite id="usgs-plate-tectonics" />` menampilkan penanda `[1]` di teks. Klik membuka popover berisi penerbit, judul, tanggal akses, dan tautan.
- `<Figure source="..." dataset="..." caption="...">` membungkus peta, grafik, atau gambar. Wajib ada `source` atau `dataset`, dan menampilkan baris "Sumber: ..." di bawahnya.
- `<DataNote>` untuk catatan seperti "ilustrasi", "model disederhanakan", atau "diperbarui pukul ...".
- Daftar sumber di akhir halaman dibuat otomatis dari `sumber` di frontmatter dan semua `<Cite>` di isi.

### 6.2 Aturan yang ditegakkan oleh build (`scripts/check-sources.mjs`)
Build **gagal** bila:
1. Ada `<Figure>` atau gambar tanpa `source` atau `dataset`.
2. Ada id sumber atau dataset yang tidak ada di YAML.
3. Topik berstatus `terbit` punya kurang dari 2 sumber.
4. Ada sumber tanpa `lisensi` atau `diakses`.
5. Topik berstatus `terbit` punya `diverifikasi` lebih lama dari 12 bulan (peringatan, bukan gagal).

### 6.3 Kebijakan lisensi sumber
| Sumber | Boleh dipakai sebagai | Catatan |
|---|---|---|
| NASA, NOAA, USGS | Referensi dan gambar | Umumnya domain publik pemerintah AS. Cek per gambar, kredit tetap dicantumkan. |
| Natural Earth | Data peta | Domain publik. |
| PB2002 (Bird 2003) | Data lempeng | Sitasi wajib. Cek lisensi file turunan yang dipakai. |
| OpenStreetMap | Peta dasar bila memakai tile | Atribusi wajib. Patuhi kebijakan tile server. |
| BMKG | Rujukan dan tautan | Wajib "Sumber: BMKG". Mengintegrasikan data ke situs atau memakai komersial butuh izin tertulis. Dilarang scraping. Akses otomatis hanya lewat API resmi. **Tidak dipakai sebagai sumber data otomatis di v1.** |
| Britannica, National Geographic | Bacaan referensi saja | Berhak cipta. Tulis ulang dengan kata sendiri. Jangan salin teks, gambar, atau struktur. |
| Wikipedia | Penunjuk awal | Jangan dijadikan sumber akhir. Rujuk sumber primernya. |
| Video YouTube | Inspirasi topik | Jangan salin skrip atau visual. |

Sebelum rilis, baca ulang syarat tiap sumber karena bisa berubah.

---

## 7. Peta (Leaflet)

### 7.1 Aturan umum
- Leaflet **1.9.4**, dimuat hanya di halaman yang punya `<MapView>`.
- Dirender client-side saja (`client:only="react"` atau `client:visible`). Jangan render di server.
- CRS `L.CRS.EPSG4326` untuk peta dunia datar tanpa tile. Untuk peta regional dengan tile, boleh `EPSG3857`.
- Basemap berasal dari GeoJSON lokal (Natural Earth), jadi tidak bergantung tile pihak ketiga dan tetap jalan offline.
- Bila nanti memakai tile OSM: atribusi wajib, patuhi kebijakan penggunaan tile, dan siapkan penyedia cadangan.

### 7.2 Komponen `<MapView>`
```ts
type MapViewProps = {
  layers: Array<'plates' | 'volcanoes' | 'earthquakes' | 'biomes' | string>;
  view: 'world' | 'indonesia' | { bounds: [[number, number], [number, number]] };
  dataset: string[];          // wajib, id dari datasets.yaml
  caption: string;
  height?: string;            // default clamp(300px, 50vw, 470px)
};
```
Perilaku:
- Toggle layer, tombol "Dunia" dan "Indonesia".
- Klik fitur membuka panel info (judul, tag, keterangan, tautan sumber).
- Mobile: drag satu jari dimatikan supaya halaman tetap bisa di-scroll. Zoom lewat tombol dan cubit. Desktop: scroll-zoom aktif setelah peta diklik.
- Semua elemen interaktif bisa diakses keyboard. Penanda punya `title`. Ada daftar teks alternatif di bawah peta untuk pembaca layar.
- Warna dan stroke mengikuti token tema (terang dan gelap).
- Atribusi tampil di sudut peta dan di baris "Sumber".

### 7.3 Pemrosesan data peta (`data/scripts/`)
1. Unduh file asli ke `data/raw/` dan catat tanggalnya.
2. Sederhanakan geometri dan bulatkan koordinat (1 desimal untuk skala dunia).
3. Pecah poligon yang melintasi bujur ±180.
4. Tulis ke `data/processed/` dan perbarui `datasets.yaml`.
5. Target ukuran: total GeoJSON di satu halaman di bawah 300 KB (gzip lebih kecil).

### 7.4 Jika Leaflet tidak cukup
Kalau nanti butuh peta vektor yang zoom halus, rotasi, atau 3D, pertimbangkan MapLibre GL. Putuskan pada fase 3, bukan sekarang.

---

## 8. Data live: gempa USGS

- Sumber: feed GeoJSON resmi USGS (misalnya `significant_month.geojson` atau `2.5_week.geojson`). USGS meminta kredit.
- Diambil **saat build** dan dijadwalkan ulang (rebuild terjadwal, misalnya tiap beberapa jam). Alternatif: edge function dengan cache.
- Selalu tampilkan "Data USGS, diperbarui pukul ... WITA" dan tautan ke halaman sumbernya.
- Bila fetch gagal, pakai salinan terakhir yang tersimpan dan tampilkan waktu salinan itu, jangan tampilkan peta kosong.
- Validasi dengan Zod: koordinat, magnitudo, waktu. Buang fitur yang tidak valid dan catat jumlahnya di log build.
- Data gempa Indonesia dari BMKG hanya **ditautkan** (ke halaman resmi BMKG) di v1. Integrasi otomatis menunggu izin tertulis atau akses API resmi.

---

## 9. Visual dan komponen interaktif

| Komponen | Topik | Teknik | Fase |
|---|---|---|---|
| `SimAnginLaut` | Angin darat dan laut | SVG + JS, slider 24 jam | 1 (prototype sudah ada) |
| `MapView` + lempeng | Lempeng tektonik | Leaflet | 1 (prototype sudah ada) |
| `SimMusim` | Musim | SVG, kemiringan sumbu dan orbit | 1 |
| `SiklusAir` | Siklus air | SVG beranimasi, langkah per langkah | 1 |
| `StrukturBumi` | Struktur Bumi | SVG irisan lapisan, klik per lapisan | 1 |
| `BiomaMap` | Bioma | Leaflet + data bioma | 1 |
| `Chart` | Suhu, curah hujan | Observable Plot | 2 |
| `Globe` | Arus laut | three.js atau globe.gl | 3 |

Aturan semua visual:
- Punya kontrol yang jelas (putar, jeda, slider) dan keadaan awal yang sudah terisi.
- Bekerja di layar 360 px sampai desktop.
- `prefers-reduced-motion` menghentikan animasi otomatis.
- Teks alternatif atau ringkasan teks yang menjelaskan isi visual.
- Visual yang menyederhanakan fisika diberi `<DataNote>` "ilustrasi".

---

## 10. Desain

- **Mood:** jernih, ilmiah, hangat. Mirip buku atlas modern, bukan dashboard korporat.
- **Token:** semua warna, jarak, dan tipografi sebagai CSS variables di `tokens.css`. Terang dan gelap lewat `prefers-color-scheme` dan atribut `data-theme`.
- **Tipografi:** satu font display berkarakter untuk judul, satu font body yang nyaman dibaca, satu mono untuk label dan angka. Lebar baris sekitar 65 karakter.
- **Warna semantik:** laut, daratan, panas, dan status benar/salah punya token sendiri dan konsisten di semua visual.
- **Layout topik:** satu kolom di HP; di desktop kolom utama plus sidebar (lanjut belajar, sumber).
- **Beranda:** deretan pertanyaan, filter per kategori, pencarian.
- **Navigasi:** kategori, glosarium, sumber, tentang. Breadcrumb di tiap topik.
- **Jangan:** emoji sebagai penanda bagian, gradien ungu generik, kartu dengan radius dan bayangan seragam di mana-mana.

---

## 11. Aksesibilitas dan performa

**Aksesibilitas:** target WCAG 2.2 AA. Kontras cukup di kedua tema, fokus keyboard terlihat, semua kontrol punya label, kuis bisa dioperasikan keyboard, tidak ada informasi yang hanya disampaikan lewat warna.

**Performa (budget):**
| Metrik | Target |
|---|---|
| JS awal halaman tanpa visual | < 60 KB gzip |
| Halaman dengan peta | < 250 KB gzip total JS + data peta |
| LCP (4G, HP menengah) | < 2,5 detik |
| CLS | < 0,1 |
| Gambar | WebP/AVIF, ukuran sesuai tampilan, `loading="lazy"` |

Muat library berat dengan `client:visible`. Jangan memuat Leaflet atau D3 di halaman yang tidak memakainya.

---

## 12. Alur konten

1. Pilih pertanyaan dan kelompokkan topik terkait.
2. Baca 2-3 sumber, catat ke `sources.yaml` sambil membaca.
3. Tulis jawaban singkat lebih dulu, lalu rancang visualnya.
4. Tulis penjelasan dengan kata sendiri (maksimal sekitar 500 kata).
5. Pasang `<Cite>` untuk setiap klaim angka atau fakta spesifik.
6. Buat 3 soal kuis.
7. Review dengan checklist (lihat bawah), ubah `status` ke `review`, lalu `terbit`.

**Peran AI:** boleh untuk membantu draft, mengecek kejelasan, dan mencari kesalahan. Tidak untuk menghasilkan artikel final tanpa penulisan ulang, dan tidak untuk menjadi sumber fakta.

**Checklist review per topik:**
- [ ] Setiap angka punya satuan dan sumber.
- [ ] Klaim dicek ke sumber primer (bukan hanya ke satu situs populer).
- [ ] Tidak ada kalimat yang disalin dari sumber.
- [ ] Gambar dan data punya lisensi yang jelas dan kredit tercantum.
- [ ] Visual yang disederhanakan diberi label "ilustrasi".
- [ ] Uji di HP, mode gelap, dan hanya keyboard.
- [ ] Kuis punya penjelasan untuk jawaban benar dan salah.
- [ ] `diverifikasi` diisi tanggal hari ini.

Dokumen terpisah `CONTENT-GUIDE.md` berisi gaya bahasa (santai tapi akurat, istilah teknis selalu dijelaskan sekali) dan contoh.

---

## 13. Tes dan CI

- **Unit (Vitest):** fungsi di `lib/`, skema Zod, pemrosesan data, validasi feed USGS.
- **Build check:** `check-sources.mjs` berjalan di CI dan menggagalkan build sesuai aturan 6.2.
- **Visual dan a11y (Playwright + axe):** tiap halaman terbit di lebar 390 px dan 1280 px, tema terang dan gelap, tanpa pelanggaran axe tingkat serious atau critical.
- **Tautan:** cek tautan sumber (peringatan, bukan gagal, karena situs luar bisa turun).
- CI: lint, `astro check`, tes, build, lalu deploy preview untuk tiap PR.

---

## 14. Roadmap

### Fase 0: Fondasi (sekitar 1 minggu)
- Inisialisasi repo, Astro, MDX, React, lint, CI.
- Token desain, layout topik, beranda sederhana.
- Skema konten, `sources.yaml`, `<Cite>`, `<Figure>`, `check-sources`.

**Selesai bila:** satu topik dummy terbit dengan sumber, dan build gagal kalau sumbernya dihapus.

### Fase 1: MVP, 5 topik (sekitar 4-6 minggu)
Topik: angin darat dan laut, lempeng tektonik, musim, siklus air, bioma. Struktur Bumi menyusul bila waktu cukup.
- Pindahkan dua prototype yang sudah ada ke komponen.
- Pencarian Pagefind, glosarium dasar, halaman sumber.
- Kuis dan progres lokal.
- Tes a11y dan performa lolos budget.
- Deploy publik di domain sendiri.

**Selesai bila:** 5 topik terbit, tiap topik punya minimal 2 sumber dan 1 visual interaktif, dan skor Lighthouse mobile di atas 90 untuk performa dan aksesibilitas.

### Fase 2: Perluasan (sekitar 6-8 minggu)
- Tambah sekitar 10 topik (muson, cuaca vs iklim, lapisan atmosfer, arus laut, gunung api, gempa bumi, dan seterusnya).
- Grafik data (Observable Plot) dan data gempa USGS live.
- Peta bioma dan peta Indonesia yang lebih kaya.
- Jalur belajar (urutan topik yang disarankan) dan umpan balik pembaca (formulir sederhana).

**Selesai bila:** 15 topik terbit dan umpan balik pertama sudah dibaca.

### Fase 3: Lanjutan (opsional)
- Globe 3D, MapLibre bila perlu.
- Penyempurnaan: mode cetak ringkasan, berbagi kartu per topik.
- Pertimbangkan izin dan API resmi BMKG untuk data Indonesia.

---

## 15. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Hak cipta konten | Tuntutan atau penurunan konten | Tulis ulang, kebijakan lisensi 6.3, build check |
| Izin dan syarat BMKG | Pelanggaran syarat penggunaan | Hanya tautan dan atribusi di v1, minta izin tertulis sebelum integrasi |
| Akurasi sains | Reputasi | Sumber primer, `diverifikasi`, label "ilustrasi", jalur koreksi publik |
| Beban menulis sendirian | Proyek berhenti | MVP kecil, template tetap, rilis bertahap |
| Performa peta di HP | Pengalaman buruk | Budget 11, `client:visible`, GeoJSON diringkas |
| Lisensi data turunan (misalnya PB2002) | Atribusi atau berbagi-serupa | Verifikasi lisensi di awal, catat di `datasets.yaml` |
| Library berubah (Leaflet 2.0) | Kode rusak | Pin 1.9.4, upgrade sengaja |

---

## 16. Pertanyaan terbuka

1. Nama final situs dan domain.
2. Lisensi pasti file lempeng PB2002 yang dipakai (verifikasi ke sumber asli sebelum rilis).
3. Observable Plot atau D3 sebagai standar grafik.
4. Hosting: Cloudflare Pages atau Vercel.
5. Apakah perlu halaman "Koreksi" publik sejak fase 1.
6. Kapan mengajukan izin ke BMKG, dan lewat jalur apa.

---

## Lampiran A: prototype yang sudah ada

- `ruang-bumi-angin.html`: simulasi angin darat dan laut (SVG + JS, slider 24 jam, kuis).
- `peta-lempeng.html`: peta Leaflet 1.9.4 dengan 54 lempeng, 10 gunung api, 5 gempa besar, basemap GeoJSON lokal.

Keduanya dipakai sebagai acuan gaya dan pola halaman, lalu dipecah menjadi komponen di fase 1. Fakta di prototype (tanggal dan magnitudo gempa, deskripsi gunung api) ditulis dari ingatan dan **harus diverifikasi** ke sumber sebelum terbit.

## Lampiran B: sumber rujukan untuk spec ini

- Leaflet, halaman unduhan: versi stabil 1.9.4, 2.0 masih alpha. https://leafletjs.com/download
- BMKG, ketentuan penggunaan: wajib atribusi, integrasi dan komersial butuh izin tertulis, scraping dilarang. https://www.bmkg.go.id/ketentuan-penggunaan
- infoBMKG/data-gempabumi: endpoint data gempa BMKG dan kewajiban mencantumkan BMKG. https://github.com/infoBMKG/data-gempabumi
