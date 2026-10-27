import { useState } from 'react';
import { BULAN, keadaanHutanGugur } from '../../lib/bioma';
import './HutanGugurMusim.css';

const NAMA_MUSIM = {
  dingin: 'Dingin',
  semi: 'Semi',
  panas: 'Panas',
  gugur: 'Gugur',
} as const;

const NAMA_DAUN = {
  'tidak-ada': 'tidak ada',
  tunas: 'tunas baru',
  penuh: 'penuh',
  berwarna: 'berwarna',
} as const;

const KANOPI = [
  [360, 92, 58, 44],
  [310, 118, 44, 34],
  [410, 118, 44, 34],
  [335, 145, 40, 28],
  [390, 145, 40, 28],
  [360, 132, 46, 36],
  [300, 88, 34, 28],
  [420, 88, 34, 28],
] as const;

const TUNAS = [
  [360, 98],
  [315, 122],
  [405, 122],
  [340, 148],
  [380, 148],
] as const;

export default function HutanGugurMusim() {
  const [bulan, setBulan] = useState(9);
  const keadaan = keadaanHutanGugur(bulan);
  const salju = keadaan.musim === 'dingin';

  return (
    <div className="hg">
      <div className="hg-kanvas">
        <svg viewBox="0 0 720 330" role="img" aria-labelledby="hg-judul hg-desk">
          <title id="hg-judul">Siklus daun hutan gugur sepanjang tahun</title>
          <desc id="hg-desk">
            Pohon hutan gugur berdaun lebar. Pada musim panas kanopi penuh; musim gugur daun
            berwarna lalu gugur; musim dingin cabang gundul dan pohon dorman; musim semi tunas
            baru muncul.
          </desc>

          <rect width="720" height="270" fill="var(--surface-2)" />
          <circle
            cx="620"
            cy={salju ? 105 : 58}
            r="22"
            fill="var(--sand)"
            opacity={salju ? 0.28 : 0.5}
          />
          <rect y="270" width="720" height="60" fill="var(--land)" />
          <line x1="0" y1="270" x2="720" y2="270" stroke="var(--line-strong)" strokeWidth="1" />

          {salju && <rect y="260" width="720" height="14" fill="var(--hg-salju)" />}

          <g className="hg-batang">
            <path d="M360 271V148" />
            <path d="M360 196 300 142M360 182 422 132M360 216 316 168M360 212 408 176" />
          </g>

          {keadaan.daun === 'penuh' &&
            KANOPI.map(([cx, cy, rx, ry]) => (
              <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} className="hg-daun" />
            ))}

          {keadaan.daun === 'berwarna' && (
            <g className="hg-gugur">
              {KANOPI.map(([cx, cy, rx, ry], i) => (
                <ellipse
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  className={`hg-daun hg-warna-${i % 3}`}
                />
              ))}
              {[
                [286, 185],
                [316, 222],
                [402, 204],
                [432, 166],
                [344, 238],
              ].map(([x, y], i) => (
                <path
                  key={`jatuh-${x}-${y}`}
                  d={`M${x} ${y} q8-5 12 3 q-8 5-12-3`}
                  className={`hg-jatuh hg-warna-${i % 3}`}
                />
              ))}
            </g>
          )}

          {keadaan.daun === 'tunas' && (
            <g className="hg-tunas">
              {TUNAS.map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9" />
              ))}
            </g>
          )}

          {salju && (
            <g className="hg-salju">
              <path d="M300 142q30-10 60 0M422 132q-24-8-48 0M316 168q20-7 40 0" />
              <path d="M352 264q10-6 20 0M288 266q12-6 24 0M402 265q14-6 28 0" />
            </g>
          )}

          {keadaan.musim === 'gugur' && (
            <text x="470" y="300" className="hg-label">
              daun gugur
            </text>
          )}
          {salju && (
            <text x="478" y="300" className="hg-label">
              pohon dorman
            </text>
          )}
        </svg>
      </div>

      <div className="hg-kontrol">
        <label className="hg-slider">
          <span className="hg-slider-label">Bulan</span>
          <input
            type="range"
            min="0"
            max="11"
            step="1"
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            aria-valuetext={BULAN[bulan]}
          />
        </label>
        <p className="hg-bulan">{BULAN[bulan]}</p>
      </div>

      <div className="hg-hasil">
        <div>
          <p className="hg-label-kecil">Musim</p>
          <p className="hg-nilai">{NAMA_MUSIM[keadaan.musim]}</p>
        </div>
        <div>
          <p className="hg-label-kecil">Daun</p>
          <p className="hg-nilai hg-daun-status">{NAMA_DAUN[keadaan.daun]}</p>
        </div>
        <div>
          <p className="hg-label-kecil">Pertumbuhan</p>
          <p className="hg-nilai">{keadaan.dorman ? 'berhenti' : 'aktif'}</p>
        </div>
      </div>

      <p className="hg-ringkas" aria-live="polite">
        {keadaan.ringkas}
      </p>

      <p className="hg-ilustrasi">
        Ilustrasi. Siklus ini untuk hutan gugur lintang menengah di belahan utara. Indonesia
        tidak mengalami empat musim; pohon di sini menggugurkan daun karena sebab lain, bukan
        karena salju.
      </p>
    </div>
  );
}
