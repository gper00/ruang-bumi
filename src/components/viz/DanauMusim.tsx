import { useState } from 'react';
import { MUSIM, keadaanDanau, type Musim } from '../../lib/danauMusim';
import { useReduceMotion } from './useReduceMotion';
import './DanauMusim.css';

const OKSIGEN = { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' } as const;

export default function DanauMusim() {
  const [musim, setMusim] = useState<Musim>('panas');
  const kurangGerak = useReduceMotion();
  const keadaan = keadaanDanau(musim);
  const label = MUSIM.find((m) => m.id === musim)?.label ?? 'Panas';

  return (
    <div className={kurangGerak ? 'dm dm-tanpa-gerak' : 'dm'}>
      <div className="dm-kanvas">
        <svg viewBox="0 0 720 380" role="img" aria-labelledby="dm-judul dm-desk">
          <title id="dm-judul">Penampang lapisan danau sepanjang musim</title>
          <desc id="dm-desk">
            Penampang danau dengan tiga lapisan: epilimnion di atas, termoklin di tengah, dan
            hipolimnion di bawah. Saat musim semi dan gugur, panah menunjukkan air bercampur. Saat
            musim dingin, permukaan danau tertutup es.
          </desc>

          <defs>
            <clipPath id="dm-danau">
              <path d="M60 90H660L610 330Q360 366 110 330Z" />
            </clipPath>
            <linearGradient id="dm-gradien" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--heat-soft)" />
              <stop offset="100%" stopColor="var(--sea-soft)" />
            </linearGradient>
          </defs>

          <rect width="720" height="380" fill="var(--surface-2)" />
          <rect x="0" y="90" width="720" height="290" fill="var(--land)" />

          <g clipPath="url(#dm-danau)">
            {keadaan.berlapis ? (
              <>
                <rect x="60" y="90" width="600" height="80" fill="var(--heat-soft)" />
                <rect x="60" y="170" width="600" height="80" fill="url(#dm-gradien)" />
                <rect x="60" y="250" width="600" height="120" fill="var(--sea-soft)" />
              </>
            ) : (
              <rect x="60" y="90" width="600" height="280" fill="var(--sea-soft)" />
            )}
          </g>

          <path
            d="M60 90H660L610 330Q360 366 110 330Z"
            fill="none"
            stroke="var(--coast)"
            strokeWidth="2.5"
          />

          {keadaan.es && (
            <g>
              <rect x="60" y="82" width="600" height="13" rx="5" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5" />
              <text x="360" y="70" textAnchor="middle" className="dm-kecil">
                lapisan es
              </text>
            </g>
          )}

          {keadaan.mencampur && (
            <g className="dm-pencampuran">
              <path
                d="M250 130C225 190 225 250 250 315"
                fill="none"
                stroke="var(--sea)"
                strokeWidth="2.5"
                strokeDasharray="7 5"
                markerEnd="url(#dm-ujung)"
              />
              <path
                d="M470 315C495 250 495 190 470 130"
                fill="none"
                stroke="var(--sea)"
                strokeWidth="2.5"
                strokeDasharray="7 5"
                markerEnd="url(#dm-ujung)"
              />
              <marker
                id="dm-ujung"
                viewBox="0 0 10 8"
                refX="9"
                refY="4"
                markerWidth="11"
                markerHeight="8"
                markerUnits="userSpaceOnUse"
                orient="auto"
              >
                <path d="M0 0L10 4L0 8Z" fill="var(--sea)" />
              </marker>
              <text x="360" y="228" textAnchor="middle" className="dm-kecil">
                air bercampur
              </text>
            </g>
          )}

          {keadaan.berlapis && (
            <g>
              <text x="88" y="138" className="dm-label">
                Epilimnion
              </text>
              <text x="88" y="215" className="dm-label">
                Termoklin
              </text>
              <text x="88" y="300" className="dm-label">
                Hipolimnion
              </text>
            </g>
          )}

          <text x="360" y="356" textAnchor="middle" className="dm-kecil">
            dasar danau
          </text>
        </svg>
      </div>

      <div className="dm-musim" role="group" aria-label="Pilih musim">
        {MUSIM.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={musim === m.id}
            onClick={() => setMusim(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="dm-panel">
        <p className="dm-status" aria-live="polite">
          <strong>{label}.</strong> {keadaan.keterangan}
        </p>
        <dl className="dm-indikator">
          <div>
            <dt>Oksigen dasar</dt>
            <dd>{OKSIGEN[keadaan.oksigenDasar]}</dd>
          </div>
          <div>
            <dt>Pencampuran</dt>
            <dd>{keadaan.mencampur ? 'Berlangsung' : 'Tidak berlangsung'}</dd>
          </div>
          <div>
            <dt>Lapisan</dt>
            <dd>{keadaan.berlapis ? 'Terbentuk' : 'Tidak terbentuk'}</dd>
          </div>
        </dl>
      </div>

      <div className="dm-catatan">
        <p className="dm-khusus">
          Model danau lintang tinggi. Danau tropis seperti di Indonesia tidak mengalami musim dingin
          berlapis es, sehingga pola pencampurannya berbeda.
        </p>
        <ul className="dm-ringkas">
          <li>
            <strong>Musim panas.</strong> Permukaan hangat mengapung di atas air dingin; lapisan
            terpisah dan oksigen dasar menurun.
          </li>
          <li>
            <strong>Musim gugur dan semi.</strong> Suhu permukaan mendekati suhu air di bawahnya,
            sehingga angin mencampur lapisan dan membawa oksigen ke dasar.
          </li>
          <li>
            <strong>Musim dingin.</strong> Permukaan membeku, air terdingin tepat di bawah es, dan
            air sekitar 4 °C yang lebih padat berada lebih dalam.
          </li>
        </ul>
      </div>
    </div>
  );
}
