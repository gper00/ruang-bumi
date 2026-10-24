import { useState } from 'react';
import {
  ALIRAN,
  SIMPUL,
  aliranDari,
  type Aliran,
  type IdSimpul,
} from '../../lib/sistemBumi';
import { useReduceMotion } from './useReduceMotion';
import './SistemBumi.css';

const POSISI: Record<IdSimpul, { x: number; y: number }> = {
  atmosfer: { x: 500, y: 90 },
  laut: { x: 830, y: 230 },
  kehidupan: { x: 700, y: 450 },
  air: { x: 300, y: 450 },
  lempeng: { x: 170, y: 230 },
};

const NAMA = new Map(SIMPUL.map((s) => [s.id, s.nama]));

/** Kurva sedikit melengkung ke arah pusat, dengan offset agar aliran bolak-balik tidak menumpuk. */
function jalurAliran(aliran: Aliran, i: number) {
  const p = POSISI[aliran.dari];
  const q = POSISI[aliran.ke];
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const panjang = Math.hypot(dx, dy) || 1;
  const geser = ((i % 3) - 1) * 18;
  const cx = ((p.x + q.x) / 2) * 0.62 + 500 * 0.38 + (-dy / panjang) * geser;
  const cy = ((p.y + q.y) / 2) * 0.62 + 280 * 0.38 + (dx / panjang) * geser;
  const mx = 0.25 * p.x + 0.5 * cx + 0.25 * q.x;
  const my = 0.25 * p.y + 0.5 * cy + 0.25 * q.y;
  return {
    d: `M${p.x} ${p.y}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${q.x} ${q.y}`,
    mx,
    my,
  };
}

export default function SistemBumi() {
  const [aktif, setAktif] = useState<IdSimpul | null>(null);
  const kurangGerak = useReduceMotion();
  const simpulAktif = SIMPUL.find((s) => s.id === aktif) ?? null;
  const koneksi = aktif ? aliranDari(aktif) : [];

  return (
    <div className={kurangGerak ? 'sb sb-tanpa-gerak' : 'sb'}>
      <div className="sb-grafik">
        <svg viewBox="0 0 1000 560" aria-hidden="true" focusable="false">
          {ALIRAN.map((aliran, i) => {
            const { d, mx, my } = jalurAliran(aliran, i);
            const terkait =
              aktif !== null && (aliran.dari === aktif || aliran.ke === aktif);
            const kelas = [
              'sb-garis',
              aktif === null ? 'sb-garis-semua' : terkait ? 'sb-garis-aktif' : 'sb-garis-redup',
            ].join(' ');
            return (
              <g key={`${aliran.dari}-${aliran.ke}-${aliran.label}`} className={kelas}>
                <path d={d} fill="none" strokeLinecap="round" />
                {terkait && (
                  <text x={mx} y={my - 6} textAnchor="middle" className="sb-garis-label">
                    {aliran.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {SIMPUL.map((s) => {
          const pos = POSISI[s.id];
          return (
            <div
              key={s.id}
              className="sb-simpul"
              style={{ left: `${(pos.x / 1000) * 100}%`, top: `${(pos.y / 560) * 100}%` }}
            >
              <button
                type="button"
                aria-pressed={aktif === s.id}
                onClick={() => setAktif(aktif === s.id ? null : s.id)}
              >
                {s.nama}
              </button>
            </div>
          );
        })}
      </div>

      <div className="sb-panel" aria-live="polite">
        {simpulAktif ? (
          <>
            <p className="sb-panel-nama">{simpulAktif.nama}</p>
            <p className="sb-panel-ringkas">{simpulAktif.ringkas}</p>
            <p className="sb-panel-petunjuk">Koneksi dengan bagian lain:</p>
            <ul className="sb-koneksi">
              {koneksi.map((a) => {
                const lain = a.dari === aktif ? a.ke : a.dari;
                return (
                  <li key={`${a.dari}-${a.ke}-${a.label}`}>
                    <a href={a.topik}>{a.label}</a>{' '}
                    <span>dengan {NAMA.get(lain)}</span>
                    <p>{a.contoh}</p>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <>
            <p className="sb-panel-nama">Sistem Bumi</p>
            <p className="sb-panel-ringkas">
              Bumi bekerja sebagai satu sistem. Pilih salah satu simpul untuk melihat apa yang
              mengalir ke dan dari bagian tersebut.
            </p>
            <p className="sb-panel-petunjuk">
              Lima bagian yang saling terhubung: lempeng, atmosfer, air, laut, dan kehidupan.
            </p>
          </>
        )}
      </div>

      <div className="sb-catatan">
        <p>
          Diagram konsep, bukan peta. Garis menunjukkan arah pengaruh yang disederhanakan; dalam
          kenyataan setiap bagian saling memengaruhi dua arah.
        </p>
        <ul className="sb-ringkas">
          {ALIRAN.map((a, i) => (
            <li key={`${a.dari}-${a.ke}-${a.label}-${i}`}>
              <strong>
                {NAMA.get(a.dari)} → {NAMA.get(a.ke)}
              </strong>{' '}
              · {a.label}. {a.contoh}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
