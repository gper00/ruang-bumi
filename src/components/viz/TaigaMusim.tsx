import { useState } from 'react';
import { BULAN, keadaanTaiga, type MusimTaiga } from '../../lib/bioma';
import './TaigaMusim.css';

const KANOPI_LEBAR = [
  [480, 104, 60, 46],
  [430, 134, 42, 32],
  [530, 134, 42, 32],
  [480, 138, 46, 34],
] as const;

export default function TaigaMusim() {
  const [musim, setMusim] = useState<MusimTaiga>('dingin');
  const jarum = keadaanTaiga(musim, 'jarum');
  const lebar = keadaanTaiga(musim, 'lebar');
  const dingin = musim === 'dingin';

  return (
    <div className="tg">
      <div className="tg-kanvas">
        <svg viewBox="0 0 720 320" role="img" aria-labelledby="tg-judul tg-desk">
          <title id="tg-judul">Pohon jarum dan pohon berdaun lebar di taiga</title>
          <desc id="tg-desk">
            Perbandingan dua pohon di taiga. Pohon jarum tetap berdaun sepanjang musim dingin,
            sedangkan pohon berdaun lebar kehilangan daun dan menumbuhkannya lagi pada musim
            panas yang pendek.
          </desc>

          <rect width="720" height="240" fill="var(--surface-2)" />
          <circle
            cx="636"
            cy={dingin ? 104 : 52}
            r="21"
            fill="var(--sand)"
            opacity={dingin ? 0.26 : 0.5}
          />
          <rect y="240" width="720" height="80" fill="var(--land)" />
          <line x1="0" y1="240" x2="720" y2="240" stroke="var(--line-strong)" strokeWidth="1" />
          {dingin && <rect y="231" width="720" height="12" fill="var(--tg-salju)" />}

          {/* Pohon jarum */}
          <g className="tg-jarum">
            <line x1="240" y1="240" x2="240" y2="186" />
            <path d="M240 58 180 140h120z" />
            <path d="M240 102 164 186h152z" />
            <path d="M240 146 148 232h184z" />
          </g>
          {dingin && (
            <g className="tg-beban">
              <path d="M240 58 196 122M240 102 182 168M240 146 166 214" />
            </g>
          )}

          {/* Pohon berdaun lebar */}
          <g className="tg-lebar">
            <line x1="480" y1="240" x2="480" y2="150" />
            <path d="M480 190 432 148M480 180 532 140M480 210 448 178M480 210 514 182" />
            {lebar.berdaun &&
              KANOPI_LEBAR.map(([cx, cy, rx, ry]) => (
                <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} />
              ))}
          </g>
          {dingin && (
            <g className="tg-beban">
              <path d="M432 148q22-8 44 0M532 140q-20-7-38 0M448 178q14-6 28 0" />
            </g>
          )}

          <text x="204" y="264" className="tg-label">
            daun jarum
          </text>
          <text x="430" y="264" className="tg-label">
            daun lebar
          </text>
          <text x="204" y="282" className="tg-label">
            {jarum.berdaun ? 'tetap berdaun' : 'gundul'}
          </text>
          <text x="430" y="282" className="tg-label">
            {lebar.berdaun ? 'berdaun' : 'gundul'}
          </text>
          {dingin && (
            <text x="588" y="212" className="tg-label">
              salju
            </text>
          )}
        </svg>
      </div>

      <div className="tg-kontrol" role="group" aria-label="Pilih musim di taiga">
        <button
          type="button"
          className="tg-tombol"
          aria-pressed={!dingin}
          onClick={() => setMusim('panas')}
        >
          Musim panas
        </button>
        <button
          type="button"
          className="tg-tombol"
          aria-pressed={dingin}
          onClick={() => setMusim('dingin')}
        >
          Musim dingin
        </button>
      </div>

      <div className="tg-hasil">
        <div>
          <p className="tg-kecil">Musim</p>
          <p className="tg-nilai">{dingin ? 'Dingin panjang' : 'Panas pendek'}</p>
        </div>
        <div>
          <p className="tg-kecil">Daun jarum</p>
          <p className="tg-nilai">{jarum.berdaun ? 'tetap' : 'rontok'}</p>
        </div>
        <div>
          <p className="tg-kecil">Daun lebar</p>
          <p className="tg-nilai tg-daun-lebar">{lebar.berdaun ? 'ada' : 'rontok'}</p>
        </div>
      </div>

      <div className="tg-pita-blok">
        <div className="tg-pita" aria-hidden="true">
          {BULAN.map((b, i) => (
            <span key={b} className={i >= 4 && i <= 8 ? 'tg-tumbuh' : undefined} title={b} />
          ))}
        </div>
        <p className="tg-pita-label">
          Musim tumbuh sekitar 4–6 bulan bebas beku. Pita di atas adalah ilustrasi lima bulan.
        </p>
      </div>

      <p className="tg-status" aria-live="polite">
        {jarum.ringkas} {lebar.ringkas}
      </p>

      <p className="tg-ilustrasi">
        Ilustrasi. Suhu, curah hujan, dan lama musim tumbuh mengikuti ringkasan NASA; bentuk
        pohon dan salju disederhanakan. Taiga di sini berarti hutan boreal di lintang tinggi.
      </p>
    </div>
  );
}
