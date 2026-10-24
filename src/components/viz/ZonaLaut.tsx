import { useState } from 'react';
import { ZONA, zonaPadaKedalaman, type Zona } from '../../lib/zonaLaut';
import { useReduceMotion } from './useReduceMotion';
import './ZonaLaut.css';

const angka = new Intl.NumberFormat('id-ID');

/** Skala vertikal tidak linier: tiap zona dapat ruang yang cukup untuk label. */
function yKedalaman(meter: number): number {
  const m = Number.isFinite(meter) ? Math.min(Math.max(meter, 0), 4000) : 0;
  if (m <= 200) return 30 + (m / 200) * 82;
  if (m <= 1000) return 112 + ((m - 200) / 800) * 116;
  return 228 + ((m - 1000) / 3000) * 144;
}

function tengahZona(zona: Zona): number {
  return Math.round((zona.batas[0] + zona.batas[1]) / 2);
}

const BATAS = [
  { meter: 0, y: 30 },
  { meter: 200, y: 112 },
  { meter: 1000, y: 228 },
  { meter: 4000, y: 372 },
];

export default function ZonaLaut() {
  const [meter, setMeter] = useState(0);
  const kurangGerak = useReduceMotion();
  const zona = zonaPadaKedalaman(meter);
  const y = yKedalaman(meter);

  return (
    <div className={kurangGerak ? 'zl zl-tanpa-gerak' : 'zl'}>
      <div className="zl-kanvas">
        <svg viewBox="0 0 700 400" role="img" aria-labelledby="zl-judul zl-desk">
          <title id="zl-judul">Penampang vertikal zona laut</title>
          <desc id="zl-desk">
            Tiga lapisan laut menurut kedalaman: zona fotik dari permukaan sampai 200 meter, zona
            senja dari 200 sampai 1.000 meter, dan zona gelap dari 1.000 sampai 4.000 meter. Garis
            oranye menandai kedalaman yang dipilih.
          </desc>

          <rect width="700" height="400" fill="var(--ocean)" />

          <rect x="80" y="30" width="600" height="82" fill="var(--sea)" opacity="0.1" />
          <rect x="80" y="112" width="600" height="116" fill="var(--sea)" opacity="0.22" />
          <rect x="80" y="228" width="600" height="144" fill="var(--sea)" opacity="0.34" />

          {BATAS.map((b) => (
            <g key={b.meter}>
              <line
                x1="80"
                y1={b.y}
                x2="680"
                y2={b.y}
                stroke="var(--line-strong)"
                strokeWidth="1"
                strokeDasharray={b.meter === 0 ? undefined : '4 4'}
              />
              <text x="70" y={b.y + 4} textAnchor="end" className="zl-sumbu">
                {angka.format(b.meter)} m
              </text>
            </g>
          ))}

          <path
            d="M80 30 q25 -9 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0"
            fill="none"
            stroke="var(--sea)"
            strokeWidth="2.5"
          />
          <text x="90" y="22" className="zl-sumbu">
            permukaan laut
          </text>

          <text x="110" y="76" className="zl-zona-label">
            Zona fotik
          </text>
          <text x="110" y="94" className="zl-zona-kecil">
            0–200 m · masih ada cahaya
          </text>

          <text x="110" y="176" className="zl-zona-label">
            Zona senja
          </text>
          <text x="110" y="194" className="zl-zona-kecil">
            200–1.000 m · cahaya sangat redup
          </text>

          <text x="110" y="296" className="zl-zona-label">
            Zona gelap
          </text>
          <text x="110" y="314" className="zl-zona-kecil">
            1.000–4.000 m · tanpa cahaya Matahari
          </text>

          <line
            x1="80"
            y1={y}
            x2="680"
            y2={y}
            stroke="var(--heat)"
            strokeWidth="2"
            className="zl-penanda"
          />
          <circle cx="96" cy={y} r="6" fill="var(--heat)" />
          <rect
            x="596"
            y={y - 20}
            width="84"
            height="20"
            rx="4"
            fill="var(--surface)"
            stroke="var(--heat)"
            strokeWidth="1"
          />
          <text x="638" y={y - 6} textAnchor="middle" className="zl-penanda-teks">
            {angka.format(meter)} m
          </text>
        </svg>
      </div>

      <div className="zl-kontrol">
        <div className="zl-slider">
          <label className="zl-slider-label" htmlFor="zl-kedalaman">
            Kedalaman
          </label>
          <input
            id="zl-kedalaman"
            type="range"
            min="0"
            max="4000"
            step="10"
            value={meter}
            onChange={(e) => setMeter(Number(e.target.value))}
          />
          <output className="zl-meter" htmlFor="zl-kedalaman">
            {angka.format(meter)} m
          </output>
        </div>

        <div className="zl-tombol-grup" role="group" aria-label="Pilih zona">
          {ZONA.map((z) => (
            <button
              key={z.id}
              type="button"
              className="zl-tombol-zona"
              aria-pressed={zona.id === z.id}
              onClick={() => setMeter(tengahZona(z))}
            >
              {z.nama}
            </button>
          ))}
        </div>
      </div>

      <div className="zl-panel">
        <p className="zl-zona-nama">
          {zona.nama}
          <span>
            {' '}
            · {angka.format(zona.batas[0])}–{angka.format(zona.batas[1])} m
          </span>
        </p>
        <p className="zl-cahaya">{zona.cahaya}</p>
        <p className="zl-suhu">{zona.suhu}</p>
        <p className="zl-contoh">Contoh kehidupan: {zona.contoh.join(', ')}.</p>
      </div>

      <p className="zl-live" aria-live="polite">
        Kedalaman {angka.format(meter)} meter, zona {zona.nama.replace('Zona ', '').toLowerCase()}.
      </p>

      <ul className="zl-ringkas">
        <li>
          <strong>Zona fotik (0–200 m).</strong> Cahaya masih cukup untuk fotosintesis, sehingga
          sebagian besar makanan laut dihasilkan di sini.
        </li>
        <li>
          <strong>Zona senja (200–1.000 m).</strong> Cahaya terlalu redup untuk fotosintesis;
          kehidupan bergantung pada makanan yang jatuh dari lapisan atas.
        </li>
        <li>
          <strong>Zona gelap (1.000–4.000 m).</strong> Tidak ada cahaya Matahari. Banyak hewan
          menghasilkan cahaya sendiri untuk berkomunikasi dan mencari mangsa.
        </li>
      </ul>
    </div>
  );
}
