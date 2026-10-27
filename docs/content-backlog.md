# Backlog konten Ruang Bumi

Dokumen hidup. Dipakai untuk menyimpan ide topik dan visual yang belum dikerjakan, supaya
tidak hilang setelah satu putaran pekerjaan. Status: `ide` → `riset` → `draf` → `review` →
`terbit`. Setiap topik baru wajib punya minimal dua sumber resmi, satu visual interaktif
khusus, dan tiga soal kuis (lihat `CONTENT-GUIDE.md`).

Terakhir diperbarui: 2026-10-27 (topik lapisan atmosfer dan gempa bumi selesai).

## Sedang dikerjakan atau baru selesai

| Topik | Pertanyaan | Visual | Status |
|---|---|---|---|
| `atmosfer/lapisan-atmosfer` | Kalau makin tinggi, kenapa udara makin dingin? | Profil suhu 0–100 km: slider ketinggian, kurva titik tetap US Standard Atmosphere 1976, penanda lapisan dan proses pemanasnya | terbit |
| `planet-bumi/gempa-bumi` | Apa yang sebenarnya bergerak saat tanah terasa bergetar? | Dua visual: model pemulihan elastis dengan tombol pelepasan regangan, dan pembanding hiposentrum–episentrum dengan slider kedalaman 5–700 km | terbit |
| `ekologi/bioma` (hub + tab) | Kenapa hutan di Sumatra berbeda dengan padang di Sumbawa? | Tab empat bioma: stepa (api & penggembalaan), hutan gugur (kalender daun), taiga (jarum vs daun lebar), tundra (lapisan aktif) | terbit |

Catatan: artikel bioma memakai empat sumber baru per tab (NASA/NPS untuk stepa dan hutan gugur,
NASA/NOAA untuk taiga dan tundra) plus tiga sumber lama. Logika mekanismenya diuji di
`tests/unit/bioma.test.ts`, isi tab di `tests/unit/konten-bioma.test.ts`, dan perilaku tab di
`tests/ui-check.mjs`.

## Berikutnya

| Prioritas | Topik | Pertanyaan | Kategori | Calon visual | Calon sumber |
|---|---|---|---|---|---|
| Tinggi | Gunung api | Kenapa ada gunung api yang meletus tenang dan ada yang meledak? | planet-bumi | Slider kekentalan magma + kadar gas → bentuk erupsi dan lereng | USGS Volcano Hazards |
| Tinggi | El Niño & La Niña | Kenapa kemarau di Indonesia kadang jauh lebih panjang? | atmosfer | Peta Pasifik dengan anomali suhu laut; panah angin pasat dan pergeseran hujan | NOAA ENSO, BMKG (tautan) |
| Menengah | Cuaca vs iklim | Kenapa ramalan besok bisa salah, tetapi pola 30 tahun bisa dihitung? | atmosfer | Distribusi 30 tahun vs deret harian; slider tahun | NOAA Climate, BMKG |
| Menengah | Pasang surut | Kenapa laut naik dua kali sehari? | laut | Bumi–Bulan–Matahari dengan slider posisi; grafik pasang purnama/perbani | NOAA Tides |
| Menengah | Tanah | Kenapa tanah di tiap tempat berbeda? | daratan | Profil tanah dengan slider curah hujan/umur; lapisan O–A–B–C | USGS/FAO soils |
| Menengah | Siklus batuan | Kenapa batu bisa berubah jenis tanpa meleleh? | planet-bumi | Diagram siklus batuan yang bisa diklik; contoh batuan Indonesia | USGS rock cycle |
| Rendah | Gurun | Kenapa gurun banyak di lintang 30°? | ekologi | Sel Hadley: udara naik di ekuator, turun kering di 30° | NASA/NOAA |
| Rendah | Hutan hujan | Kenapa hutan hujan selalu basah? | ekologi | Siklus uap–hujan lokal; bandingkan dengan savana | NASA/ASU |
| Menengah | Savana Nusa Tenggara | Kenapa padang di NTT dan NTB terbakar berulang tiap kemarau? | ekologi | Slider panjang musim kemarau: rumput mengering, api menjalar, pohon bertahan | BMKG (tautan), NASA Earth Observatory |
| Menengah | Permafrost yang mencair | Apa yang berubah kalau tanah yang selalu beku mulai menghangat? | ekologi | Penampang tanah beku bertahun-tahun: lapisan aktif menebal, tanah turun dan tergenang | NOAA Arctic Report Card, NASA |

## Keputusan: bioma tetap satu hub bertab

Empat bioma mekanisme (stepa, hutan gugur, taiga, tundra) dibahas sebagai tab di dalam artikel
`ekologi/bioma`, bukan sebagai empat topik terpisah. Alasannya: bioma adalah satu konsep, dan tab
menjaga konteks pembaca tanpa memecah halaman menjadi potongan yang saling mengulang pembuka.

Kalau nanti salah satu arah butuh kedalaman sendiri — misalnya savana Indonesia yang punya pola
kebakaran dan musim kering sendiri, atau permafrost sebagai cerita perubahan iklim — pecahannya
bisa jadi topik tersendiri dengan visual dan sumbernya sendiri. Hub-nya tetap berguna sebagai
pintu masuk, dan tab yang ada cukup diringkas dengan tautan ke topik baru itu.

## Fitur pendukung (bukan topik)

- Jalur belajar berurutan (planet → atmosfer → laut → daratan → ekologi).
- Peta Indonesia interaktif: lempeng, gunung api, dan pola hujan dalam satu tampilan.
- Foto lanskap domain publik (NASA/NPS) sebagai visual pendamping, dengan kredit per gambar.
- Mode cetak ringkasan per topik.

## Catatan saat menambah topik

- `tests/ui-check.mjs` mengunci beberapa angka: kartu Ekologi, hasil pencarian “gempa”, dan
  halaman yang dikunjungi. Perbarui tesnya bersama topik baru, jangan dilonggarkan.
- Setiap visual baru: keadaan awal terisi, kontrol native, ringkasan `aria-live`, label
  ilustrasi, dan `prefers-reduced-motion`.
- Budget performa: total JS + data peta < 250 KB gzip. Ukur dengan `npm run build`.
- Topik yang memakai `<Term>` baru harus menambah entri glosarium beserta sumbernya.
