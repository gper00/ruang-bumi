import { useState } from 'react';
import { BULAN, keadaanTundra } from '../../lib/bioma';
import './TundraMusim.css';

const PERMUKAAN = 150;
const PX_PER_CM = 0.7;
const AKAR_SEMAK_CM = 20;

export default function TundraMusim() {
  const [bulan, setBulan] = useState(6);
  const keadaan = keadaanTundra(bulan);

  // NOAA melaporkan lapisan aktif tundra sekitar 30–100 cm; skala di sini mengikuti rentang itu.
  const cmLapisan = Math.round(30 + keadaan.kedalaman * 70);
  const tebal = cmLapisan * PX_PER_CM;
  const dasar = PERMUKAAN + tebal;

  const cmAkarPohon = Math.max(cmLapisan - 6, 12);
  const akarPohon = cmAkarPohon * PX_PER_CM;
  const akarSemak = Math.min(tebal - 4, AKAR_SEMAK_CM * PX_PER_CM);

  const tergenang = !keadaan.beku && keadaan.kedalaman > 0.62;
  const air = keadaan.beku ? 'beku' : tergenang ? 'tergenang' : 'meresap lambat';

  return (
    <div className="tu">
      <div className="tu-kanvas">
        <svg viewBox="0 0 720 340" role="img" aria-labelledby="tu-judul tu-desk">
          <title id="tu-judul">Penampang tanah tundra: lapisan aktif di atas permafrost</title>
          <desc id="tu-desk">
            Penampang tanah tundra. Lapisan atas yang mencair pada musim panas hanya setipis
            puluhan sentimeter, sedangkan tanah di bawahnya tetap beku sepanjang tahun. Akar semak
            tertahan di lapisan tipis itu, dan air yang tidak bisa meresap ke bawah tertahan di
            permukaan.
          </desc>

          <rect width="720" height={PERMUKAAN} fill="var(--surface-2)" />
          <circle
            cx="654"
            cy={keadaan.beku ? 96 : 56}
            r="22"
            fill="var(--sand)"
            opacity={keadaan.beku ? 0.3 : 0.5}
          />

          {/* Tanah: lapisan aktif yang mencair di atas permafrost yang selalu beku. */}
          <rect x="0" y={dasar} width="720" height={340 - dasar} className="tu-permafrost" />
          <rect
            x="0"
            y={PERMUKAAN}
            width="720"
            height={tebal}
            className={`tu-aktif${keadaan.beku ? ' tu-beku' : ''}`}
          />
          <line
            x1="0"
            y1={PERMUKAAN}
            x2="720"
            y2={PERMUKAAN}
            stroke="var(--line-strong)"
            strokeWidth="1"
          />
          <line x1="0" y1={dasar} x2="720" y2={dasar} className="tu-batas" />

          {/* Semak tundra: akar dangkal, tetap di dalam lapisan aktif. */}
          <g className="tu-semak">
            <ellipse cx="200" cy="138" rx="27" ry="13" />
            <ellipse cx="181" cy="144" rx="15" ry="10" />
            <ellipse cx="219" cy="144" rx="15" ry="10" />
          </g>
          <g className="tu-akar">
            <path
              d={`M200 ${PERMUKAAN} C196 ${PERMUKAAN + akarSemak * 0.6} 206 ${
                PERMUKAAN + akarSemak * 0.8
              } 200 ${PERMUKAAN + akarSemak}`}
            />
            <path
              d={`M200 ${PERMUKAAN + akarSemak * 0.45} C186 ${PERMUKAAN + akarSemak * 0.62} 180 ${
                PERMUKAAN + akarSemak * 0.9
              } 175 ${PERMUKAAN + akarSemak}`}
            />
            <path
              d={`M200 ${PERMUKAAN + akarSemak * 0.5} C214 ${PERMUKAAN + akarSemak * 0.66} 220 ${
                PERMUKAAN + akarSemak * 0.9
              } 225 ${PERMUKAAN + akarSemak}`}
            />
          </g>

          {/* Pohon muda: akarnya berhenti tepat di batas tanah beku. */}
          <g className="tu-pohon">
            <line x1="430" y1={PERMUKAAN} x2="430" y2="92" />
            <path d="M430 128 404 106M430 118 456 98M430 140 412 126M430 140 448 128" />
            <ellipse cx="430" cy="82" rx="29" ry="21" className="tu-kanopi" />
          </g>
          <g className="tu-akar tu-akar-pohon">
            <path
              d={`M430 ${PERMUKAAN} C426 ${PERMUKAAN + akarPohon * 0.5} 434 ${
                PERMUKAAN + akarPohon * 0.8
              } 430 ${PERMUKAAN + akarPohon}`}
            />
            <path
              d={`M430 ${PERMUKAAN + akarPohon * 0.42} C410 ${PERMUKAAN + akarPohon * 0.6} 402 ${
                PERMUKAAN + akarPohon * 0.85
              } 398 ${PERMUKAAN + akarPohon}`}
            />
            <path
              d={`M430 ${PERMUKAAN + akarPohon * 0.42} C450 ${PERMUKAAN + akarPohon * 0.6} 462 ${
                PERMUKAAN + akarPohon * 0.85
              } 466 ${PERMUKAAN + akarPohon}`}
            />
            <path
              d={`M396 ${PERMUKAAN + akarPohon} H468`}
              className="tu-akar-stop"
              strokeDasharray="5 4"
            />
          </g>

          {tergenang && (
            <g className="tu-genangan">
              <ellipse cx="300" cy="147" rx="60" ry="7" />
              <ellipse cx="600" cy="148" rx="44" ry="6" />
            </g>
          )}

          <g className="tu-penggaris">
            <line x1="664" y1={PERMUKAAN} x2="664" y2="320" />
            {[0, 50, 100].map((tanda) => {
              const y = PERMUKAAN + tanda * PX_PER_CM;
              return (
                <g key={tanda}>
                  <line x1="656" y1={y} x2="672" y2={y} />
                  <text x="648" y={y + 3} textAnchor="end" className="tu-label">
                    {tanda === 0 ? '0' : `${tanda} cm`}
                  </text>
                </g>
              );
            })}
          </g>

          <text x="20" y={dasar - 7} className="tu-label">
            lapisan aktif {cmLapisan} cm
          </text>
          <text x="20" y="306" className="tu-label">
            permafrost: selalu beku
          </text>
          <text x="430" y={PERMUKAAN + akarPohon + 24} textAnchor="middle" className="tu-label">
            akar berhenti di tanah beku
          </text>
          <text x="248" y="120" className="tu-label">
            semak
          </text>
          <text x="430" y="46" textAnchor="middle" className="tu-label">
            pohon muda
          </text>
          {tergenang && (
            <text x="300" y="126" textAnchor="middle" className="tu-label">
              air tertahan, tidak bisa meresap
            </text>
          )}
        </svg>
      </div>

      <div className="tu-kontrol">
        <label className="tu-slider">
          <span className="tu-slider-label">Bulan</span>
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
        <p className="tu-bulan">{BULAN[bulan]}</p>
      </div>

      <div className="tu-hasil">
        <div>
          <p className="tu-kecil">Lapisan aktif</p>
          <p className="tu-nilai">{cmLapisan} cm</p>
        </div>
        <div>
          <p className="tu-kecil">Akar pohon muda</p>
          <p className="tu-nilai">{cmAkarPohon} cm, tertahan</p>
        </div>
        <div>
          <p className="tu-kecil">Air</p>
          <p className="tu-nilai">{air}</p>
        </div>
      </div>

      <p className="tu-ringkas" aria-live="polite">
        {keadaan.ringkas}
      </p>

      <p className="tu-ilustrasi">
        Ilustrasi. Kedalaman lapisan aktif di sini mengikuti rentang 30–100 cm; permukaan
        permafrost, tinggi tanaman, dan genangan air disederhanakan. Tundra Indonesia tidak berbentuk
        seperti ini: yang berperan di sana adalah ketinggian gunung, bukan permafrost.
      </p>
    </div>
  );
}
