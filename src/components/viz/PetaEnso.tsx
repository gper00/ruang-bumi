import { useState } from 'react';
import {
  PILIHAN,
  RENTANG_ANOMALI,
  dampakIndonesia,
  faseEnso,
  formatBujur,
  kejelasanAnomali,
  kekuatanAngin,
  labelAnomali,
  labelAngin,
  pusatHangat,
  pusatHujan,
} from '../../lib/enso';
import { DUNIA_PATH } from '../../lib/duniaPath';
import { useReduceMotion } from './useReduceMotion';
import './PetaEnso.css';

/**
 * Jendela peta: bujur 100°BT sampai 70°BB (Pasifik tropis) dan lintang
 * 30°U–30°S, dipetakan ke kanvas 720×300. DUNIA_PATH memakai proyeksi
 * equirektangular 1000×500, jadi jalur itu digambar dua kali (satu salinan
 * digeser 1000 unit) supaya garis 180° tidak terpotong di tengah peta.
 */
const W = 720;
const MAP_Y = 30;
const LON_AWAL = 100;
const LON_AKHIR = 290;
const LAT_ATAS = 30;
const LAT_BAWAH = -30;

const SKALA = W / (((LON_AKHIR - LON_AWAL) / 360) * 1000);
const TX = -(((LON_AWAL + 180) / 360) * 1000) * SKALA;
const MAP_H = ((((90 - LAT_BAWAH) - (90 - LAT_ATAS)) / 180) * 500) * SKALA;
const TY = -(((90 - LAT_ATAS) / 180) * 500) * SKALA + MAP_Y;

const px = (lon: number) => ((lon - LON_AWAL) / (LON_AKHIR - LON_AWAL)) * W;
const py = (lat: number) => MAP_Y + ((LAT_ATAS - lat) / (LAT_ATAS - LAT_BAWAH)) * MAP_H;

const EKUATOR = py(0);
const PANAH = [7, 0, -7];
const AWAN = [-78, -40, 0, 40, 78];
const TURUN = [-58, -22, 14, 50];

/** 0–1: seberapa kencang angin dibanding tahun netral, untuk stroke peta. */
function porsiAngin(nilai: number): number {
  return Math.min(Math.max((nilai - 0.3) / 1.4, 0), 1);
}

export default function PetaEnso() {
  // Keadaan awal terisi: El Niño, pertanyaan pembuka artikel.
  const [anomali, setAnomali] = useState(1.5);
  const kurangGerak = useReduceMotion();

  const fase = faseEnso(anomali);
  const dampak = dampakIndonesia(anomali);
  const kuat = kekuatanAngin(anomali);
  const porsi = porsiAngin(kuat);
  const pusat = pusatHangat(anomali);
  const hujan = pusatHujan(anomali);
  const cxHangat = px(pusat);
  const cxHujan = px(hujan);
  const panjang = 300 + 130 * porsi;

  const warnaPita = anomali > 0.05 ? 'var(--heat)' : anomali < -0.05 ? 'var(--sea)' : 'var(--muted)';
  const opasitasPita = 0.12 + 0.3 * kejelasanAnomali(anomali);
  const labelPita =
    anomali > 0.05 ? 'air lebih hangat' : anomali < -0.05 ? 'air lebih dingin' : 'sekitar biasanya';

  return (
    <div className={kurangGerak ? 'pe pe-tanpa-gerak' : 'pe'}>
      <div className="pe-kanvas">
        <svg viewBox={`0 0 ${W} 300`} role="img" aria-labelledby="pe-judul pe-desk">
          <title id="pe-judul">Peta skematik Samudra Pasifik tropis saat ENSO berubah</title>
          <desc id="pe-desk">
            Peta Pasifik dari Indonesia di kiri sampai Amerika Selatan di kanan. Geser slider anomali
            suhu laut: pita air hangat, panah angin pasat, dan pita hujan berpindah bersamaan, lalu
            dampaknya ke Indonesia berubah.
          </desc>

          <defs>
            <marker
              id="pe-ujung"
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

          <rect width={W} height="300" fill="var(--ocean)" />
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

          <line x1="0" y1={EKUATOR} x2={W} y2={EKUATOR} className="pe-ekuator" />
          <text x="8" y={EKUATOR - 8} className="pe-kecil">
            Ekuator
          </text>

          {/* Lidah air dingin di Pasifik timur; upwelling-nya melemah saat El Niño. */}
          <ellipse
            cx={px(250)}
            cy={EKUATOR}
            rx="88"
            ry="30"
            fill="var(--sea)"
            opacity={Math.min(Math.max(0.32 - 0.12 * anomali, 0.06), 0.5)}
          />
          <text x={px(250)} y={EKUATOR + 46} textAnchor="middle" className="pe-kecil">
            upwelling
          </text>

          {/* Pita air hangat yang pusatnya bergeser mengikuti anomali. */}
          <ellipse
            cx={cxHangat}
            cy={EKUATOR}
            rx="115"
            ry="30"
            fill={warnaPita}
            opacity={opasitasPita}
            className="pe-pita"
          />
          <text x={cxHangat} y={EKUATOR + 46} textAnchor="middle" className="pe-label-pita">
            {labelPita}
          </text>

          {/* Angin pasat: panah dari timur ke barat, tebalnya mengikuti kekuatan. */}
          <text x={W - 65} y={py(9)} textAnchor="end" className="pe-kecil">
            angin pasat
          </text>
          {PANAH.map((lat) => (
            <path
              key={`pasat-${lat}`}
              d={`M${W - 60} ${py(lat)} L${W - 60 - panjang} ${py(lat)}`}
              className="pe-panah"
              stroke="var(--sea)"
              strokeWidth={2 + 3 * porsi}
              strokeLinecap="round"
              markerEnd="url(#pe-ujung)"
              opacity={0.4 + 0.55 * porsi}
            />
          ))}

          {/* Pita hujan: awan dan butiran hujan di atas air yang paling hangat. */}
          <g className="pe-hujan">
            <line x1={cxHujan} y1={EKUATOR - 40} x2={cxHujan} y2={EKUATOR - 8} className="pe-kolom" />
            {AWAN.map((dx) => (
              <ellipse
                key={`awan-${dx}`}
                cx={cxHujan + dx}
                cy={py(15) + (Math.abs(dx) / 78) * 9}
                rx={dx === 0 ? 34 : 25}
                ry={dx === 0 ? 20 : 15}
                className="pe-awan"
              />
            ))}
            {TURUN.map((dx) => (
              <line
                key={`turun-${dx}`}
                x1={cxHujan + dx}
                y1={EKUATOR - 32}
                x2={cxHujan + dx}
                y2={EKUATOR - 20}
                className="pe-tetes"
              />
            ))}
            <text x={cxHujan} y={py(21)} textAnchor="middle" className="pe-kecil pe-hujan-label">
              pita hujan
            </text>
          </g>

          {/* Indonesia dan nama wilayah. */}
          <circle cx={px(117)} cy={py(-2)} r="5" className="pe-indonesia" />
          <text x="10" y={py(-19)} className="pe-label-wilayah">
            Indonesia
          </text>
          <text x="236" y={py(-24)} className="pe-laut-label">
            SAMUDRA PASIFIK
          </text>
          <text x={W - 8} y={py(-26)} textAnchor="end" className="pe-label-wilayah">
            Amerika Selatan
          </text>
        </svg>
      </div>

      <div className="pe-kontrol">
        <div className="pe-slider">
          <label htmlFor="pe-anomali" className="pe-slider-baris">
            <span className="pe-slider-label">Anomali suhu laut Pasifik tropis</span>
            <output htmlFor="pe-anomali">{labelAnomali(anomali)}</output>
          </label>
          <input
            id="pe-anomali"
            type="range"
            min={RENTANG_ANOMALI.min}
            max={RENTANG_ANOMALI.max}
            step={RENTANG_ANOMALI.langkah}
            value={anomali}
            onChange={(e) => setAnomali(Number(e.target.value))}
            aria-valuetext={`${labelAnomali(anomali)}, fase ${fase.nama}`}
            aria-describedby="pe-anomali-skala"
          />
          <p className="pe-skala" id="pe-anomali-skala">
            <span>−2,0 °C</span>
            <span>0,0 °C</span>
            <span>+2,0 °C</span>
          </p>
        </div>

        <div className="pe-toggle" role="group" aria-label="Atur fase dengan cepat">
          {PILIHAN.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={Math.abs(anomali - p.nilai) < 0.05}
              onClick={() => setAnomali(p.nilai)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pe-hasil">
        <div>
          <p className="pe-label-kecil">Fase ENSO</p>
          <p className="pe-nilai">{fase.nama}</p>
          <p className="pe-extra">anomali {labelAnomali(anomali)}</p>
        </div>
        <div>
          <p className="pe-label-kecil">Angin pasat</p>
          <p className="pe-nilai">{labelAngin(anomali)}</p>
          <p className="pe-extra">{Math.round(kuat * 100)}% dari tahun netral</p>
        </div>
        <div>
          <p className="pe-label-kecil">Pita hujan</p>
          <p className="pe-nilai">{formatBujur(hujan)}</p>
          <p className="pe-extra">{dampak.label.toLowerCase()} di Indonesia</p>
        </div>
      </div>

      <p className="pe-ringkas" aria-live="polite">
        {fase.ringkas} {dampak.ringkas}
      </p>

      <p className="pe-ilustrasi">
        Ilustrasi. Peta memakai garis pantai Natural Earth; pusat pita air hangat, tebal panah, dan
        letak pita hujan adalah model sederhana dari satu angka anomali, bukan hasil ukuran. Ambang
        fase ±0,5 °C mengikuti Oceanic Niño Index NOAA.
      </p>
    </div>
  );
}
