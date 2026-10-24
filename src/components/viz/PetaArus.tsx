import { useState } from 'react';
import { ARUS, type Arus, type JenisArus } from '../../lib/arusLaut';
import { DUNIA_PATH } from '../../lib/duniaPath';
import { useReduceMotion } from './useReduceMotion';
import './PetaArus.css';

/**
 * Jalur panah skematis pada kanvas 1000×500. Posisi dan lengkungan
 * disederhanakan; ini bukan koordinat arus yang terukur.
 */
const JALUR: Record<string, string> = {
  'gulf-stream': 'M278 181C300 172 306 156 322 150C336 145 348 134 362 128',
  kuroshio: 'M839 208C858 193 868 176 889 153',
  'atlantik-utara': 'M368 126C400 116 424 102 458 88',
  california: 'M153 139C158 152 168 166 181 181',
  humboldt: 'M292 361C286 337 279 300 278 264',
  acc: 'M64 402C180 424 300 386 430 396C560 406 700 386 820 396C880 401 920 402 952 404',
};

type Saringan = JenisArus | 'semua';

const PILIHAN: { id: Saringan; label: string }[] = [
  { id: 'semua', label: 'Semua arus' },
  { id: 'hangat', label: 'Arus hangat' },
  { id: 'dingin', label: 'Arus dingin' },
];

function warnaArus(jenis: JenisArus): string {
  return jenis === 'hangat' ? 'var(--heat)' : 'var(--sea)';
}

export default function PetaArus() {
  const [pilih, setPilih] = useState<string>(ARUS[0].id);
  const [saring, setSaring] = useState<Saringan>('semua');
  const kurangGerak = useReduceMotion();
  const aktif: Arus = ARUS.find((a) => a.id === pilih) ?? ARUS[0];

  return (
    <div className={kurangGerak ? 'pa pa-tanpa-gerak' : 'pa'}>
      <div className="pa-kanvas">
        <svg viewBox="0 0 1000 500" role="img" aria-labelledby="pa-judul pa-desk">
          <title id="pa-judul">Peta skematik arus laut utama</title>
          <desc id="pa-desk">
            Peta dunia sederhana dengan panah arus laut. Panah oranye menandai arus hangat dan
            panah biru menandai arus dingin. Pilih arus pada daftar di bawah peta untuk membaca
            arah dan pengaruhnya.
          </desc>

          <defs>
            <marker
              id="pa-ujung-hangat"
              viewBox="0 0 10 8"
              refX="9"
              refY="4"
              markerWidth="12"
              markerHeight="9"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M0 0L10 4L0 8Z" fill="var(--heat)" />
            </marker>
            <marker
              id="pa-ujung-dingin"
              viewBox="0 0 10 8"
              refX="9"
              refY="4"
              markerWidth="12"
              markerHeight="9"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M0 0L10 4L0 8Z" fill="var(--sea)" />
            </marker>
          </defs>

          <rect width="1000" height="500" fill="var(--ocean)" />
          <path d={DUNIA_PATH} fill="var(--land)" stroke="var(--line-strong)" strokeWidth="0.7" />

          <text x="180" y="300" className="pa-laut-label">
            SAMUDRA PASIFIK
          </text>
          <text x="360" y="230" className="pa-laut-label">
            ATLANTIK
          </text>
          <text x="720" y="300" className="pa-laut-label">
            SAMUDRA HINDIA
          </text>

          {ARUS.map((arus) => {
            const redup = saring !== 'semua' && arus.jenis !== saring;
            const terpilih = arus.id === pilih;
            return (
              <path
                key={arus.id}
                d={JALUR[arus.id]}
                className={[
                  'pa-panah',
                  redup ? 'pa-redup' : '',
                  terpilih ? 'pa-aktif' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                data-jenis={arus.jenis}
                fill="none"
                stroke={warnaArus(arus.jenis)}
                strokeWidth={terpilih ? 5 : 3}
                strokeLinecap="round"
                markerEnd={`url(#pa-ujung-${arus.jenis})`}
              />
            );
          })}
        </svg>
      </div>

      <div className="pa-kontrol">
        <div className="pa-toggle" role="group" aria-label="Saring arus menurut jenis">
          {PILIHAN.map((p) => (
            <button
              key={p.id}
              type="button"
              data-jenis={p.id}
              aria-pressed={saring === p.id}
              onClick={() => setSaring(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <ul className="pa-legenda">
          <li>
            <span className="pa-kunci pa-kunci-hangat" aria-hidden="true" />
            Arus hangat
          </li>
          <li>
            <span className="pa-kunci pa-kunci-dingin" aria-hidden="true" />
            Arus dingin
          </li>
        </ul>
      </div>

      <div className="pa-badan">
        <ul className="pa-daftar" aria-label="Daftar arus laut">
          {ARUS.map((arus) => (
            <li key={arus.id}>
              <button
                type="button"
                aria-pressed={arus.id === pilih}
                onClick={() => setPilih(arus.id)}
              >
                <span className="pa-daftar-nama">{arus.nama}</span>
                <span className="pa-daftar-jenis">{arus.jenis}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="pa-info" aria-live="polite">
          <p className="pa-info-nama">{aktif.nama}</p>
          <p className="pa-info-jenis">Arus {aktif.jenis}</p>
          <p className="pa-info-arah">
            <span>Arah</span> {aktif.arah}
          </p>
          <p className="pa-info-pengaruh">
            <span>Pengaruh</span> {aktif.pengaruh}
          </p>
        </div>
      </div>

      <div className="pa-catatan">
        <p>
          Peta ini skematik: bentuk daratan disederhanakan dari data Natural Earth, sedangkan posisi
          dan lengkungan panah tidak mengikuti koordinat arus yang terukur. Gunakan peta untuk
          memahami pola, bukan untuk navigasi.
        </p>
        <ul className="pa-ringkas">
          {ARUS.map((arus) => (
            <li key={arus.id}>
              <strong>{arus.nama}</strong> (arus {arus.jenis}). {arus.arah}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
