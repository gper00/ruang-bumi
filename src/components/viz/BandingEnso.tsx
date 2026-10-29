import {
  PERBANDINGAN,
  dampakIndonesia,
  faseEnso,
  formatBujur,
  kekuatanAngin,
  labelAnomali,
  labelAngin,
  porsiAngin,
  pusatHangat,
  pusatHujan,
} from '../../lib/enso';
import { DUNIA_PATH } from '../../lib/duniaPath';
import { EKUATOR, PETA, SKALA, TX, TY, px, py } from '../../lib/petaEnso';
import './BandingEnso.css';

const W = PETA.lebar;
const PANAH = [7, 0, -7];
const AWAN = [-70, -36, 0, 36, 70];
const TURUN = [-52, -18, 18, 50];

function PetaKecil({ anomali, kunci, judul }: { anomali: number; kunci: string; judul: string }) {
  const porsi = porsiAngin(kekuatanAngin(anomali));
  const cxHangat = px(pusatHangat(anomali));
  const cxHujan = px(pusatHujan(anomali));
  const panjang = 300 + 130 * porsi;
  const teks = `Peta Pasifik tropis saat ${judul}. Pusat air terhangat dan pita hujan berada di ${formatBujur(
    pusatHujan(anomali),
  )}, dan angin pasat ${labelAngin(anomali)}.`;

  // Lidah air dingin di Pasifik timur: La Niña memperkuat upwelling, El Niño melemahkannya.
  const dingin = Math.min(Math.max(0.32 - 0.12 * anomali, 0.06), 0.5);

  return (
    <svg viewBox={`0 0 ${W} ${PETA.tinggi}`} role="img" aria-labelledby={`be-${kunci}-judul`}>
      {/* React hanya menerima satu string sebagai isi <title>; rangkai dulu. */}
      <title id={`be-${kunci}-judul`}>{teks}</title>

      <defs>
        <marker
          id={`be-ujung-${kunci}`}
          viewBox="0 0 10 8"
          refX="9"
          refY="4"
          markerWidth="11"
          markerHeight="9"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path d="M0 0L10 4L0 8Z" fill="var(--sea)" />
        </marker>
      </defs>

      <rect width={W} height={PETA.tinggi} fill="var(--ocean)" />
      <g transform={`translate(${TX.toFixed(2)} ${TY.toFixed(2)}) scale(${SKALA.toFixed(5)})`}>
        <path d={DUNIA_PATH} fill="var(--land)" stroke="var(--line-strong)" strokeWidth="0.7" />
        <path
          d={DUNIA_PATH}
          transform="translate(1000 0)"
          fill="var(--land)"
          stroke="var(--line-strong)"
          strokeWidth="0.7"
        />
      </g>

      <line x1="0" y1={EKUATOR} x2={W} y2={EKUATOR} className="be-ekuator" />
      <text x="8" y={EKUATOR - 10} className="be-svg-teks">
        Ekuator
      </text>

      <ellipse cx={px(250)} cy={EKUATOR} rx="88" ry="30" fill="var(--sea)" opacity={dingin} />
      <ellipse cx={cxHangat} cy={EKUATOR} rx="115" ry="30" fill="var(--heat)" opacity="0.3" />
      <text x={cxHangat} y={EKUATOR + 46} textAnchor="middle" className="be-svg-teks">
        air terhangat
      </text>

      {PANAH.map((lat) => (
        <path
          key={`pasat-${lat}`}
          d={`M${W - 60} ${py(lat)} L${W - 60 - panjang} ${py(lat)}`}
          className="be-panah"
          stroke="var(--sea)"
          strokeWidth={2 + 3 * porsi}
          strokeLinecap="round"
          markerEnd={`url(#be-ujung-${kunci})`}
          opacity={0.4 + 0.55 * porsi}
        />
      ))}
      <text x={W - 60} y={py(9) - 8} textAnchor="end" className="be-svg-teks">
        angin pasat
      </text>

      <line x1={cxHujan} y1={EKUATOR - 40} x2={cxHujan} y2={EKUATOR - 8} className="be-kolom" />
      {AWAN.map((dx) => (
        <ellipse
          key={`awan-${dx}`}
          cx={cxHujan + dx}
          cy={py(15) + (Math.abs(dx) / 70) * 9}
          rx={dx === 0 ? 34 : 24}
          ry={dx === 0 ? 20 : 14}
          className="be-awan"
        />
      ))}
      {TURUN.map((dx) => (
        <line
          key={`turun-${dx}`}
          x1={cxHujan + dx}
          y1={EKUATOR - 32}
          x2={cxHujan + dx}
          y2={EKUATOR - 20}
          className="be-tetes"
        />
      ))}
      <text x={cxHujan} y={py(21)} textAnchor="middle" className="be-svg-teks be-tegas">
        pita hujan
      </text>

      <circle cx={px(117)} cy={py(-2)} r="5" className="be-indonesia" />
      <text x="10" y={py(-19)} className="be-svg-wilayah">
        Indonesia
      </text>
      <text x={W - 8} y={py(-26)} textAnchor="end" className="be-svg-wilayah">
        Amerika Selatan
      </text>
    </svg>
  );
}

export default function BandingEnso() {
  return (
    <div className="be">
      {PERBANDINGAN.map((p) => {
        const fase = faseEnso(p.anomali);
        const dampak = dampakIndonesia(p.anomali);
        const kuat = kekuatanAngin(p.anomali);

        return (
          <article key={p.id} className="be-panel" data-fase={p.id}>
            <div className="be-kepala">
              <p className="be-judul">{p.judul}</p>
              <p className="be-anomali">{labelAnomali(p.anomali)}</p>
            </div>

            <div className="be-kanvas">
              <PetaKecil anomali={p.anomali} kunci={p.id} judul={p.judul} />
            </div>

            <dl className="be-angka">
              <div>
                <dt>Angin pasat</dt>
                <dd>
                  {labelAngin(p.anomali)} · {Math.round(kuat * 100)}%
                </dd>
              </div>
              <div>
                <dt>Pita hujan</dt>
                <dd className="be-hujan-nilai">{formatBujur(pusatHujan(p.anomali))}</dd>
              </div>
              <div>
                <dt>Indonesia</dt>
                <dd>{dampak.label}</dd>
              </div>
            </dl>

            <p className="be-ringkas">{fase.ringkas}</p>
          </article>
        );
      })}

      <p className="be-catatan">
        Kedua peta memakai skala, warna, dan jumlah panah yang sama; yang berbeda hanya keadaan yang
        diturunkan dari anomali ±2,0 °C. Ilustrasi: posisi pusat air terhangat, panjang panah, dan
        letak pita hujan adalah model sederhana, bukan hasil pengukuran.
      </p>
    </div>
  );
}
