import { useState } from 'react';
import './BiomaMap.css';

interface Bioma {
  id: string;
  nama: string;
  lat: string;
  atas: number;
  bawah: number;
  warna: string;
  ciri: string;
  contoh: string;
}

const BIOMA: Bioma[] = [
  {
    id: 'es',
    nama: 'Es abadi',
    lat: '75°–90°',
    atas: 0,
    bawah: 26,
    warna: '#dfeaf0',
    ciri: 'Hampir seluruhnya tertutup es. Sangat dingin dan kering; air tersimpan sebagai es.',
    contoh: 'Antartika, Greenland',
  },
  {
    id: 'tundra',
    nama: 'Tundra',
    lat: '65°–75°',
    atas: 26,
    bawah: 52,
    warna: '#c9d9bd',
    ciri: 'Tanah beku sebagian tahun, hanya lumut, rumput, dan perdu pendek yang bertahan.',
    contoh: 'Siberia utara, Alaska utara',
  },
  {
    id: 'taiga',
    nama: 'Hutan berdaun jarum (taiga)',
    lat: '45°–65°',
    atas: 52,
    bawah: 88,
    warna: '#9dbfa4',
    ciri: 'Hutan pinus dan cemara yang tahan dingin, musim tumbuh pendek.',
    contoh: 'Siberia, Kanada utara, Skandinavia',
  },
  {
    id: 'sedang',
    nama: 'Hutan & semak sedang',
    lat: '30°–45°',
    atas: 88,
    bawah: 122,
    warna: '#c8cf8f',
    ciri: 'Musim jelas. Banyak wilayah beriklim mediterania: kering di musim panas, hujan di musim dingin.',
    contoh: 'Mediterania, California, Chile tengah',
  },
  {
    id: 'gurun',
    nama: 'Gurun subtropis',
    lat: '20°–30°',
    atas: 122,
    bawah: 152,
    warna: '#e6cf9a',
    ciri: 'Sangat kering karena udara turun di sekitar lintang ini. Suhu siang dan malam berbeda jauh.',
    contoh: 'Sahara, Jazirah Arab, Australia tengah',
  },
  {
    id: 'sabana',
    nama: 'Sabana & hutan muson',
    lat: '10°–20°',
    atas: 152,
    bawah: 176,
    warna: '#d8c48a',
    ciri: 'Musim kering yang jelas, ditumbuhi rumput tinggi dan pohon yang menyebar.',
    contoh: 'Afrika Timur, Nusa Tenggara, sebagian India',
  },
  {
    id: 'tropis',
    nama: 'Hutan hujan tropis',
    lat: '0°–10°',
    atas: 176,
    bawah: 204,
    warna: '#8fbf7f',
    ciri: 'Panas dan basah sepanjang tahun, kanopi rapat, keanekaragaman hayati tertinggi.',
    contoh: 'Amazon, Kongo, Sumatra, Kalimantan',
  },
  {
    id: 'sabana-s',
    nama: 'Sabana & hutan muson',
    lat: '10°–20°',
    atas: 204,
    bawah: 228,
    warna: '#d8c48a',
    ciri: 'Musim kering yang jelas, ditumbuhi rumput tinggi dan pohon yang menyebar.',
    contoh: 'Afrika Selatan, Australia utara, Brazil tengah',
  },
  {
    id: 'gurun-s',
    nama: 'Gurun subtropis',
    lat: '20°–30°',
    atas: 228,
    bawah: 258,
    warna: '#e6cf9a',
    ciri: 'Sangat kering; banyak di antaranya merupakan gurun panas dengan langit cerah hampir sepanjang tahun.',
    contoh: 'Kalahari, Atacama, Australia barat',
  },
  {
    id: 'sedang-s',
    nama: 'Hutan & semak sedang',
    lat: '30°–45°',
    atas: 258,
    bawah: 292,
    warna: '#c8cf8f',
    ciri: 'Iklim sedang dengan empat musim, atau mediterania di pesisir barat benua.',
    contoh: 'Argentina tengah, Australia selatan, Selandia Baru',
  },
  {
    id: 'taiga-s',
    nama: 'Hutan berdaun jarum (taiga)',
    lat: '45°–55°',
    atas: 292,
    bawah: 314,
    warna: '#9dbfa4',
    ciri: 'Hutan jarum di lintang tinggi selatan, sebagian besar di Patagonia dan pulau-pulau selatan.',
    contoh: 'Patagonia, Tasmania',
  },
];

export default function BiomaMap() {
  const [aktif, setAktif] = useState('tropis');
  const terpilih = BIOMA.find((b) => b.id === aktif) ?? BIOMA[0];

  function pilih(id: string) {
    setAktif(id);
  }

  return (
    <div className="bio">
      <div className="bio-kanvas">
        <svg viewBox="0 0 720 380" role="img" aria-labelledby="bio-judul bio-desk">
          <title id="bio-judul">Sabuk bioma berdasarkan lintang</title>
          <desc id="bio-desk">
            Diagram sabuk bioma dari kutub utara ke kutub selatan. Setiap sabuk dapat dipilih untuk
            melihat ciri dan contoh wilayahnya.
          </desc>

          <rect width="720" height="380" fill="var(--ocean)" opacity="0.35" />

          {BIOMA.map((b) => (
            <g key={b.id} className={`bio-sabuk${aktif === b.id ? ' aktif' : ''}`}>
              <rect x="90" y={b.atas} width="470" height={b.bawah - b.atas} fill={b.warna} />
              <rect
                x="90"
                y={b.atas}
                width="470"
                height={b.bawah - b.atas}
                fill="none"
                stroke={aktif === b.id ? 'var(--heat)' : 'transparent'}
                strokeWidth="2"
              />
              <text x="100" y={b.atas + (b.bawah - b.atas) / 2 + 4} className="bio-nama">
                {b.nama}
              </text>
              <text x="568" y={b.atas + (b.bawah - b.atas) / 2 + 4} className="bio-lat">
                {b.lat}
              </text>
            </g>
          ))}

          <line x1="90" y1="190" x2="560" y2="190" stroke="var(--fg)" strokeWidth="1" strokeDasharray="3 5" />
          <text x="30" y="194" className="bio-sumbu">0°</text>
          <text x="30" y="24" className="bio-sumbu">90°U</text>
          <text x="30" y="366" className="bio-sumbu">90°S</text>
          <text x="576" y="194" className="bio-sumbu">khatulistiwa</text>
        </svg>
      </div>

      <div className="bio-pilih" role="group" aria-label="Pilih bioma">
        {Array.from(new Map(BIOMA.map((b) => [b.nama, b])).values()).map((b) => {
          const anggota = BIOMA.filter((x) => x.nama === b.nama);
          const aktifDiGrup = anggota.some((x) => x.id === aktif);
          return (
            <button
              key={b.nama}
              type="button"
              className="bio-chip"
              aria-pressed={aktifDiGrup}
              onClick={() => pilih(aktifDiGrup ? b.id : anggota[0].id)}
            >
              {b.nama}
            </button>
          );
        })}
      </div>

      <div className="bio-panel" aria-live="polite">
        <p className="bio-judul">
          {terpilih.nama} <span>lintang {terpilih.lat}</span>
        </p>
        <p className="bio-ciri">{terpilih.ciri}</p>
        <p className="bio-contoh">Contoh wilayah: {terpilih.contoh}</p>
      </div>

      <p className="bio-ilustrasi">
        Ilustrasi. Bioma tidak ditentukan oleh lintang saja: ketinggian, arus laut, dan curah hujan
        juga berperan, sehingga sabuk ini bisa bergeser atau terputus.
      </p>
    </div>
  );
}
