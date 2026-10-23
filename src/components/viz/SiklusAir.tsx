import { useState } from 'react';
import './SiklusAir.css';

interface Langkah {
  id: string;
  judul: string;
  ringkas: string;
  detail: string;
}

const LANGKAH: Langkah[] = [
  {
    id: 'penguapan',
    judul: '1. Penguapan',
    ringkas: 'Matahari memanaskan air laut, danau, dan tanah.',
    detail:
      'Air berubah menjadi uap air dan naik ke atmosfer. Tumbuhan juga melepaskan uap lewat transpirasi. Sebagian besar uap air di atmosfer berasal dari laut.',
  },
  {
    id: 'kondensasi',
    judul: '2. Kondensasi',
    ringkas: 'Uap air mendingin dan berubah menjadi titik air.',
    detail:
      'Makin tinggi, udara makin dingin. Uap air mengembun di sekitar partikel kecil dan membentuk awan. Titik-titik air itu masih sangat kecil sehingga awan bisa tetap melayang.',
  },
  {
    id: 'presipitasi',
    judul: '3. Presipitasi',
    ringkas: 'Titik air bergabung sampai cukup berat untuk jatuh.',
    detail:
      'Hujan, salju, atau hujan es turun ke permukaan. Tidak semua hujan sampai ke tanah; sebagian menguap lagi di udara kering sebelum menyentuh permukaan.',
  },
  {
    id: 'aliran',
    judul: '4. Aliran permukaan',
    ringkas: 'Air mengalir di permukaan menuju sungai dan laut.',
    detail:
      'Air yang jatuh di daratan mengalir ke tempat yang lebih rendah, berkumpul di sungai, lalu kembali ke laut. Dalam perjalanannya air mengikis batuan dan mengangkut sedimen.',
  },
  {
    id: 'infiltrasi',
    judul: '5. Infiltrasi & simpanan',
    ringkas: 'Sebagian air meresap ke tanah dan batuan.',
    detail:
      'Air masuk ke pori tanah dan batuan, mengisi akuifer, lalu bisa keluar lagi sebagai mata air. Air tanah bisa tersimpan lama, dari hitungan bulan sampai ribuan tahun.',
  },
];

export default function SiklusAir() {
  const [aktif, setAktif] = useState(0);
  const langkah = LANGKAH[aktif];

  return (
    <div className="siklus">
      <div className="siklus-kanvas">
        <svg viewBox="0 0 720 380" role="img" aria-labelledby="siklus-judul siklus-desk">
          <title id="siklus-judul">Diagram siklus air</title>
          <desc id="siklus-desk">
            Laut di kiri, daratan dan gunung di kanan. Panah menunjukkan penguapan, kondensasi,
            hujan, aliran sungai, dan peresapan air ke tanah.
          </desc>

          <rect width="720" height="380" fill="var(--surface-2)" />
          <circle cx="600" cy="52" r="22" fill="#f6c453" />
          <text x="600" y="94" textAnchor="middle" className="siklus-kecil">MATAHARI</text>

          {/* gunung */}
          <path d="M360 300 L455 135 L560 300 Z" fill="var(--coast)" />
          <path d="M455 135 L492 196 L455 186 L420 204 Z" fill="#ffffff" opacity="0.85" />
          <path d="M500 300 L600 210 L700 300 Z" fill="var(--coast)" opacity="0.75" />

          {/* daratan */}
          <path d="M330 300 L720 300 L720 380 L330 380 Z" fill="var(--land)" />
          <path d="M330 300 L720 300 L720 312 L330 312 Z" fill="var(--coast)" opacity="0.5" />

          {/* laut */}
          <path d="M0 300 Q90 288 180 300 T360 300 L360 380 L0 380 Z" fill="var(--sea)" opacity="0.85" />

          {/* sungai */}
          <path d="M455 210 C430 240 420 260 380 300" fill="none" stroke="var(--sea)" strokeWidth="4" strokeLinecap="round" />

          {/* awan */}
          <g className="siklus-awan">
            <ellipse cx="380" cy="105" rx="52" ry="22" fill="#f4f7f8" opacity="0.95" />
            <ellipse cx="420" cy="96" rx="38" ry="18" fill="#ffffff" opacity="0.95" />
            <ellipse cx="345" cy="94" rx="30" ry="15" fill="#ffffff" opacity="0.95" />
          </g>

          {/* hujan */}
          <g className="siklus-hujan">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <line
                key={i}
                x1={340 + (i % 5) * 16}
                y1={128 + Math.floor(i / 5) * 14}
                x2={336 + (i % 5) * 16}
                y2={146 + Math.floor(i / 5) * 14}
                stroke="var(--sea)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* panah penguapan */}
          <g className="siklus-panah penguapan">
            <path d="M150 295 C150 245 170 220 195 205" fill="none" stroke="var(--heat)" strokeWidth="2.4" strokeDasharray="6 5" />
            <path d="M187 210 l10 -6 -3 11" fill="var(--heat)" />
          </g>
          <text x="120" y="240" className="siklus-kecil">penguapan</text>

          {/* panah aliran */}
          <path d="M380 300 L250 306" fill="none" stroke="var(--sea)" strokeWidth="2.4" strokeDasharray="6 5" />
          <text x="250" y="326" className="siklus-kecil">aliran ke laut</text>

          {/* panah infiltrasi */}
          <g className="siklus-panah infiltrasi">
            <path d="M560 300 C560 315 560 330 560 345" fill="none" stroke="var(--sea)" strokeWidth="2.4" strokeDasharray="6 5" />
            <path d="M553 339 l7 9 7 -9" fill="none" stroke="var(--sea)" strokeWidth="2.4" />
          </g>
          <text x="575" y="330" className="siklus-kecil">meresap</text>

          {LANGKAH.map((item, i) => (
            <circle
              key={item.id}
              cx={[196, 396, 356, 268, 566][i]}
              cy={[206, 106, 152, 300, 344][i]}
              r={aktif === i ? 9 : 5}
              fill={aktif === i ? 'var(--heat)' : 'var(--surface)'}
              stroke="var(--heat)"
              strokeWidth="2"
            />
          ))}

          <text x="20" y="372" className="siklus-kecil">LAUT</text>
          <text x="680" y="372" textAnchor="end" className="siklus-kecil">DARATAN</text>
        </svg>
      </div>

      <div className="siklus-langkah" role="tablist" aria-label="Tahap siklus air">
        {LANGKAH.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={aktif === i}
            aria-controls="panel-siklus"
            className="siklus-tab"
            onClick={() => setAktif(i)}
          >
            {item.judul.replace(/^\d+\.\s*/, '')}
          </button>
        ))}
      </div>

      <div className="siklus-panel" id="panel-siklus" role="tabpanel" aria-labelledby={`tab-${langkah.id}`}>
        <p className="siklus-judul">{langkah.judul}</p>
        <p className="siklus-ringkas">{langkah.ringkas}</p>
        <p className="siklus-detail">{langkah.detail}</p>
      </div>

      <p className="siklus-ilustrasi">
        Ilustrasi. Perbandingan ukuran, tinggi awan, dan jumlah air di tiap tahap tidak berskala.
      </p>
    </div>
  );
}
