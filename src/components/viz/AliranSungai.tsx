import { useState } from 'react';
import {
  LABEL_BEBAN,
  LABEL_STATUS,
  keadaanHilir,
  type JenisBeban,
  type StatusHilir,
} from '../../lib/aliranSungai';
import { useReduceMotion } from './useReduceMotion';
import './AliranSungai.css';

const WARNA_STATUS: Record<StatusHilir, string> = {
  jernih: 'var(--sea)',
  keruh: 'var(--sand)',
  'kaya-nutrisi': 'var(--ok)',
  tercemar: 'var(--bad)',
};

const JENIS: JenisBeban[] = ['erosi', 'pupuk', 'limbah'];

export default function AliranSungai() {
  const [jenis, setJenis] = useState<JenisBeban>('erosi');
  const [intensitas, setIntensitas] = useState(0);
  const kurangGerak = useReduceMotion();
  const hasil = keadaanHilir(jenis, intensitas);
  const warna = WARNA_STATUS[hasil.status];
  const adaBeban = intensitas >= 20;

  return (
    <div className={kurangGerak ? 'as as-tanpa-gerak' : 'as'}>
      <div className="as-kanvas">
        <svg viewBox="0 0 720 360" role="img" aria-labelledby="as-judul as-desk">
          <title id="as-judul">Aliran sungai dari hulu ke muara</title>
          <desc id="as-desk">
            Penampang memanjang sungai: gunung dan hulu di kiri, anak sungai, dataran, lalu muara
            dan laut di kanan. Warna air dan penanda sedimen berubah mengikuti jenis serta
            intensitas beban yang dipilih.
          </desc>

          <rect width="720" height="360" fill="var(--surface-2)" />
          <rect x="0" y="250" width="720" height="110" fill="var(--land)" />
          <rect x="620" y="250" width="100" height="110" fill="var(--ocean)" />
          <line x1="620" y1="250" x2="720" y2="250" stroke="var(--coast)" strokeWidth="2" />

          <path d="M40 250 L130 105 L220 250 Z" fill="var(--coast)" />
          <path d="M130 105 L156 148 L140 141 L128 154 L114 140 L104 147 Z" fill="var(--surface)" />

          <path
            d="M150 190 C190 205 210 245 270 252 C340 260 380 250 440 254 C500 258 540 250 600 258 L640 262"
            fill="none"
            stroke={warna}
            strokeWidth="9"
            strokeLinecap="round"
            className="as-sungai"
          />
          <path
            d="M300 200 C312 220 320 236 336 251"
            fill="none"
            stroke={warna}
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
          />

          {hasil.endapan && (
            <g className="as-endapan">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <circle
                  key={i}
                  cx={548 + (i % 4) * 18}
                  cy={252 + Math.floor(i / 4) * 8}
                  r="2.6"
                  fill="var(--sand)"
                />
              ))}
              <text x="590" y="286" textAnchor="middle" className="as-kecil">
                sedimen mengendap
              </text>
            </g>
          )}

          {adaBeban && (
            <g>
              <rect
                x="430"
                y="220"
                width="130"
                height="22"
                rx="11"
                fill="var(--surface)"
                stroke={warna}
                strokeWidth="1.5"
              />
              <text x="495" y="235" textAnchor="middle" className="as-label-muatan">
                {jenis === 'erosi' ? 'sedimen' : jenis === 'pupuk' ? 'nutrisi' : 'bahan pencemar'}
              </text>
            </g>
          )}

          <text x="52" y="300" className="as-kecil">
            GUNUNG
          </text>
          <text x="150" y="300" className="as-kecil">
            HULU
          </text>
          <text x="300" y="300" className="as-kecil">
            ANAK SUNGAI
          </text>
          <text x="380" y="330" className="as-kecil">
            DATARAN
          </text>
          <text x="628" y="300" className="as-kecil">
            MUARA
          </text>
          <text x="668" y="336" textAnchor="middle" className="as-kecil">
            LAUT
          </text>
        </svg>
      </div>

      <div className="as-kontrol">
        <div className="as-jenis">
          <label htmlFor="as-jenis">Jenis beban</label>
          <select
            id="as-jenis"
            value={jenis}
            onChange={(e) => setJenis(e.target.value as JenisBeban)}
          >
            {JENIS.map((j) => (
              <option key={j} value={j}>
                {LABEL_BEBAN[j]}
              </option>
            ))}
          </select>
        </div>

        <div className="as-intensitas">
          <label htmlFor="as-intensitas">Intensitas</label>
          <input
            id="as-intensitas"
            type="range"
            min="0"
            max="100"
            step="5"
            value={intensitas}
            onChange={(e) => setIntensitas(Number(e.target.value))}
          />
          <output htmlFor="as-intensitas">{intensitas}%</output>
        </div>
      </div>

      <p className="as-status" aria-live="polite">
        <strong>Hilir: {LABEL_STATUS[hasil.status]}.</strong> {hasil.keterangan}
      </p>

      <div className="as-catatan">
        <p>
          Model kualitatif: warna air, label muatan, dan penanda endapan menunjukkan arah dampak,
          bukan hasil pengukuran lapangan. Angka intensitas hanya pengatur besar kecilnya beban.
        </p>
        <ul className="as-panduan">
          <li>
            <strong>Erosi tanah</strong> membuat air keruh. Pada beban tinggi, sedimen mengendap di
            hilir dan muara.
          </li>
          <li>
            <strong>Pupuk dan nutrisi</strong> menaikkan kadar hara di hilir, sehingga alga bisa
            tumbuh berlebihan.
          </li>
          <li>
            <strong>Limbah permukiman</strong> membawa bahan pencemar yang ikut mengalir sampai
            muara.
          </li>
        </ul>
      </div>
    </div>
  );
}
