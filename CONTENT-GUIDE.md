# Panduan konten

Aturan singkat agar semua topik terasa satu suara. Target pembaca: pelajar SMP–SMA, mahasiswa baru,
dan orang awam yang penasaran.

## Suara

- Santai tapi akurat. Tulis seperti menjelaskan ke teman yang pintar, bukan menggurui.
- Kalimat pendek. Satu ide per kalimat.
- Istilah teknis dijelaskan sekali, lalu dipakai konsisten. Bungkus dengan `<Term istilah="..." />`
  hanya pada kemunculan pertama.
- Hindari hiperbola ("sangat luar biasa", "menakjubkan") dan hindari emoji sebagai penanda bagian.
- Jangan menyalin kalimat dari sumber. Baca, tutup tab, tulis ulang. Kalau sebuah kalimat terasa
  terlalu mirip aslinya, ubah strukturnya, bukan hanya satu kata.

## Kerangka wajib

```mdx
---
pertanyaan: "Judul berupa pertanyaan yang orang benar-benar tanyakan?"
kategori: "atmosfer"          # planet-bumi | atmosfer | laut | daratan | ekologi | penutup
level: "pemula"               # pemula | menengah
menit: 5
jawabanSingkat: "Maksimal 320 karakter. Ini yang dibaca orang kalau hanya punya 10 detik."
terkait: ["atmosfer/musim"]   # id topik lain, pakai jalur folder tanpa .mdx
sumber: ["noaa-seasons", "bmkg-musim"]
dataset: []                    # hanya bila memakai peta
glosarium: ["musim"]
status: "terbit"              # draft | review | terbit
diverifikasi: 2026-10-22
---

import Figure from '../../../components/sumber/Figure.astro';
import DataNote from '../../../components/sumber/DataNote.astro';
import Cite from '../../../components/sumber/Cite.astro';
import Term from '../../../components/glosarium/Term.astro';
import Quiz from '../../../components/quiz/Quiz';

<Figure caption="Apa yang terlihat, dan apa yang harus dilakukan pembaca." source="noaa-seasons">
  <KomponenVisual client:visible />
</Figure>

<DataNote>Kalau visualnya disederhanakan, tulis apa yang tidak berskala.</DataNote>

## Kok bisa?

Penjelasan, maksimal sekitar 500 kata. Setiap angka diberi <Cite id="noaa-seasons" />.

### Subbagian bila perlu

## Fakta menarik

- Dua sampai empat butir. Boleh diberi <Cite id="..." />.

<Quiz
  judul="Kuis"
  client:visible
  soal={[
    { tanya: '...', opsi: ['A', 'B', 'C'], benar: 1, penjelasan: '...' },
  ]}
/>
```

Tiga soal per topik. `benar` adalah indeks jawaban (mulai 0). Penjelasan harus berlaku untuk
jawaban benar maupun salah, bukan sekadar mengulang jawaban.

## Aturan angka dan klaim

- Setiap angka butuh satuan dan sumber. "Sekitar 96,5 persen" lebih baik daripada "hampir semua".
- Klaim sebab-akibat ("karena itu", "akibatnya") harus bisa dilacak ke sumber atau ke Penalaran
  yang sudah dijelaskan di halaman itu sendiri.
- Jangan mengarang tanggal, magnitudo, atau nama peristiwa. Kalau tidak yakin, hapus atau ganti
  dengan pernyataan umum.
- Sumber primer atau lembaga resmi (USGS, NOAA, NASA, BMKG) untuk fakta. Britannica, National
  Geographic, dan video hanya untuk orientasi; tulis ulang, jangan dikutip sebagai sumber akhir.
- BMKG hanya ditautkan. Jangan ambil data BMKG otomatis tanpa izin tertulis.

## Visual

- Selalu ada keadaan awal yang sudah terisi; jangan mulai dari layar kosong.
- Kontrol harus jelas: tombol putar/jeda, slider, atau tab. Semua bisa dioperasikan keyboard.
- `prefers-reduced-motion` mematikan animasi otomatis.
- Sediakan ringkasan teks: `aria-live` untuk perubahan penting, atau daftar alternatif di bawah
  visual.
- Beri `<DataNote>` atau label "ilustrasi" pada model yang disederhanakan.
- Warna mengikuti token di `src/styles/tokens.css`; jangan menulis warna baru di komponen.

## Checklist sebelum `terbit`

- [ ] Setiap angka punya satuan dan `<Cite>`.
- [ ] Klaim sudah dicek ke sumber primer.
- [ ] Tidak ada kalimat hasil salin-tempel.
- [ ] Gambar/peta punya lisensi dan kredit di daftar sumber.
- [ ] Visual yang disederhanakan diberi label ilustrasi.
- [ ] Kuis punya penjelasan untuk jawaban benar dan salah.
- [ ] `npm run check` lolos, `npm run check:ui` lolos.
- [ ] `diverifikasi` diisi tanggal hari ini.
- [ ] `status` diubah ke `terbit` paling akhir.
