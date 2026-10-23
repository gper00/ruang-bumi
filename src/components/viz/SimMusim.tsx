import { useState } from 'react';
import './SimMusim.css';

const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function musimUtara(bulan: number) {
  if (bulan <= 1 || bulan === 11) return 'Musim dingin';
  if (bulan <= 4) return 'Musim semi';
  if (bulan <= 7) return 'Musim panas';
  return 'Musim gugur';
}

function musimSelatan(bulan: number) {
  if (bulan <= 1 || bulan === 11) return 'Musim panas';
  if (bulan <= 4) return 'Musim gugur';
  if (bulan <= 7) return 'Musim dingin';
  return 'Musim semi';
}

function musimIndonesia(bulan: number) {
  if (bulan >= 10 || bulan <= 2) return 'Musim hujan';
  if (bulan >= 4 && bulan <= 8) return 'Musim kemarau';
  return 'Peralihan';
}

export default function SimMusim() {
  const [bulan, setBulan] = useState(5);

  const indeks = Math.round(bulan) % 12;
  const theta = Math.PI - ((bulan + 0.5) / 12) * Math.PI * 2;
  const cx = 250;
  const cy = 170;
  const rx = 168;
  const ry = 104;
  const bumiX = cx + rx * Math.cos(theta);
  const bumiY = cy + ry * Math.sin(theta);

  // Sumbu bumi miring 23,4° dan arahnya tetap di ruang, tidak ikut mengelilingi Matahari.
  const miring = -23.4;
  const sumbuX = 34 * Math.sin((miring * Math.PI) / 180);
  const sumbuY = -34 * Math.cos((miring * Math.PI) / 180);
  const menghadapMatahari = bumiX < cx ? 'kutub utara menjauh' : 'kutub utara mendekat';

  return (
    <div className="sms">
      <div className="sms-kanvas">
        <svg viewBox="0 0 500 340" role="img" aria-labelledby="sms-judul sms-desk">
          <title id="sms-judul">Simulasi orbit Bumi dan kemiringan sumbu</title>
          <desc id="sms-desk">
            Bumi mengelilingi Matahari dengan sumbu miring 23,4 derajat. Kemiringan inilah yang
            membuat belahan utara dan selatan bergantian menerima lebih banyak sinar.
          </desc>

          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="var(--line)" strokeDasharray="4 6" />

          <circle cx={cx} cy={cy} r="26" fill="#f6c453" />
          <circle cx={cx} cy={cy} r="38" fill="#f6c453" opacity="0.18" />
          <text x={cx} y={cy + 60} textAnchor="middle" className="sms-sun">
            MATAHARI
          </text>

          <line x1={cx} y1={cy} x2={bumiX} y2={bumiY} stroke="var(--line-strong)" strokeWidth="0.8" strokeDasharray="2 4" />

          <g transform={`translate(${bumiX} ${bumiY})`}>
            <circle r="17" fill="var(--sea)" />
            <ellipse rx="17" ry="6" fill="none" stroke="var(--fg)" opacity="0.35" />
            <line
              x1={-sumbuX}
              y1={-sumbuY}
              x2={sumbuX}
              y2={sumbuY}
              stroke="var(--fg)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx={sumbuX} cy={sumbuY} r="2.6" fill="var(--heat)" />
            <text x={sumbuX + 8} y={sumbuY} className="sms-kutub">
              U
            </text>
            <text x={-sumbuX - 12} y={-sumbuY} className="sms-kutub">
              S
            </text>
          </g>

          <text x="20" y="30" className="sms-anotasi">
            sumbu miring 23,4°, arahnya tetap
          </text>
        </svg>
      </div>

      <div className="sms-kontrol">
        <label className="sms-slider">
          <span className="sms-slider-label">Bulan</span>
          <input
            type="range"
            min="0"
            max="11.9"
            step="0.1"
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            aria-valuetext={BULAN[indeks]}
          />
        </label>
        <p className="sms-bulan">{BULAN[indeks]}</p>
      </div>

      <div className="sms-hasil">
        <div>
          <p className="sms-label">Belahan utara</p>
          <p className="sms-nilai">{musimUtara(indeks)}</p>
        </div>
        <div>
          <p className="sms-label">Belahan selatan</p>
          <p className="sms-nilai">{musimSelatan(indeks)}</p>
        </div>
        <div>
          <p className="sms-label">Indonesia</p>
          <p className="sms-nilai">{musimIndonesia(indeks)}</p>
        </div>
      </div>

      <p className="sms-catatan" aria-live="polite">
        Posisi Bumi: kutub utara {menghadapMatahari}. Yang menentukan musim adalah kemiringan
        sumbu, bukan jarak Bumi ke Matahari.
      </p>

      <p className="sms-ilustrasi">
        Ilustrasi. Skala orbit, ukuran Bumi, dan tanggal peralihan musim disederhanakan. Musim di
        Indonesia mengikuti angin muson, bukan empat musim seperti di lintang tinggi.
      </p>
    </div>
  );
}
