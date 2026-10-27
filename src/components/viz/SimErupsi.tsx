import { useState } from 'react';
import {
  RENTANG,
  bentukGunung,
  gayaErupsi,
  gasTerkunci,
  labelGas,
  labelKekentalan,
} from '../../lib/erupsi';
import { useReduceMotion } from './useReduceMotion';
import './SimErupsi.css';

const CX = 360;
const DASAR = 330;
const TINGGI = 168;
const PUNCAK = DASAR - TINGGI;

/** Titik jatuh tefra pada letusan eksplosif, sebaran simetris di kedua sisi kolom. */
const TEFRA = [-138, -96, -58, -22, 24, 62, 104, 142];

export default function SimErupsi() {
  // Keadaan awal terisi: magma encer dengan gas sedikit, gaya efusif.
  const [kekentalan, setKekentalan] = useState(20);
  const [gas, setGas] = useState(30);
  const kurangGerak = useReduceMotion();

  const v = kekentalan / 100;
  const lebar = Math.round(300 - 150 * v);
  const gaya = gayaErupsi(kekentalan, gas);
  const bentuk = bentukGunung(kekentalan);
  const terkunci = gasTerkunci(kekentalan, gas);
  const gelembung = Math.max(2, Math.round(gas / 10));

  const kiri = CX - lebar;
  const kanan = CX + lebar;

  return (
    <div className={kurangGerak ? 'seu seu-tanpa-gerak' : 'seu'}>
      <div className="seu-kanvas">
        <svg viewBox="0 0 720 420" role="img" aria-labelledby="seu-judul seu-desk">
          <title id="seu-judul">Penampang gunung api dan gaya letusannya</title>
          <desc id="seu-desk">
            Penampang gunung api dengan kamar magma di bawahnya. Kekentalan magma mengubah lebar dan
            kemiringan gunung, sedangkan kadar gas menentukan gaya letusannya: lava mengalir tenang,
            air mancur lava, atau kolom abu yang menembak tinggi.
          </desc>

          <rect width="720" height="420" fill="var(--surface-2)" />
          <rect x="0" y={DASAR} width="720" height={420 - DASAR} fill="var(--land)" />

          {/* Kamar magma dan gas yang masih terlarut di dalamnya. */}
          <ellipse cx={CX} cy="378" rx="152" ry="32" className="seu-kamar" />
          <text x={CX} y="412" textAnchor="middle" className="seu-kecil">
            kamar magma
          </text>
          {Array.from({ length: gelembung }, (_, i) => {
            const sudut = (i / gelembung) * Math.PI * 2;
            return (
              <circle
                key={`gelembung-${i}`}
                cx={CX + Math.cos(sudut) * 92}
                cy={378 + Math.sin(sudut) * 15}
                r="5"
                className="seu-gelembung"
              />
            );
          })}

          {/* Badan gunung: lava bertumpuk dari dasar ke puncak. */}
          <path
            d={`M${kiri} ${DASAR} C${CX - lebar * 0.72} ${DASAR - TINGGI * 0.45} ${CX - lebar * 0.3} ${
              DASAR - TINGGI * 0.82
            } ${CX - 16} ${PUNCAK + 4} L${CX + 16} ${PUNCAK + 4} C${CX + lebar * 0.3} ${
              DASAR - TINGGI * 0.82
            } ${CX + lebar * 0.72} ${DASAR - TINGGI * 0.45} ${kanan} ${DASAR} Z`}
            className="seu-gunung"
          />
          {[0.42, 0.7].map((porsi) => (
            <path
              key={`lapis-${porsi}`}
              d={`M${kiri + lebar * porsi * 0.75} ${DASAR} C${CX - lebar * (1 - porsi * 0.6)} ${
                DASAR - TINGGI * 0.5
              } ${CX - lebar * (1 - porsi) * 0.9} ${DASAR - TINGGI * 0.85} ${CX - 16} ${
                PUNCAK + 4 + porsi * 26
              }`}
              className="seu-lapis"
            />
          ))}

          {/* Pipa magma dari kamar ke mulut. */}
          <line x1={CX} y1={352} x2={CX} y2={PUNCAK + 8} className="seu-pipa" />
          <path
            d={`M${CX - 17} ${PUNCAK + 4} L${CX + 17} ${PUNCAK + 4} L${CX + 11} ${PUNCAK + 16} L${
              CX - 11
            } ${PUNCAK + 16} Z`}
            className="seu-mulut"
          />

          {gaya.id === 'efusif' && (
            <g>
              <path
                d={`M${CX + 8} ${PUNCAK + 6} C${CX + lebar * 0.5} ${DASAR - TINGGI * 0.55} ${
                  CX + lebar * 0.85
                } ${DASAR - 20} ${kanan + 34} ${DASAR + 8}`}
                className="seu-lava"
              />
              <circle cx={CX - 22} cy={PUNCAK - 20} r="13" className="seu-embun" />
              <circle cx={CX + 16} cy={PUNCAK - 34} r="9" className="seu-embun seu-embun-b" />
              <text x={CX + 40} y={PUNCAK - 16} className="seu-kecil">
                lava mengalir tenang
              </text>
            </g>
          )}

          {gaya.id === 'transisi' && (
            <g>
              <path
                d={`M${CX} ${PUNCAK + 4} q -20 -50 -50 -14`}
                className="seu-mancur"
              />
              <path d={`M${CX} ${PUNCAK + 4} q 0 -62 2 -74`} className="seu-mancur" />
              <path d={`M${CX} ${PUNCAK + 4} q 20 -50 50 -14`} className="seu-mancur" />
              <ellipse cx={CX} cy={PUNCAK - 96} rx="58" ry="30" className="seu-awan" />
              <text x={CX + 76} y={PUNCAK - 92} className="seu-kecil">
                air mancur lava dan abu
              </text>
            </g>
          )}

          {gaya.id === 'eksplosif' && (
            <g>
              <path
                d={`M${CX - 15} ${PUNCAK + 4} C${CX - 36} ${PUNCAK - 44} ${CX - 92} ${
                  PUNCAK - 74
                } ${CX - 132} ${PUNCAK - 132} C${CX - 150} 6 ${CX + 150} 6 ${CX + 132} ${
                  PUNCAK - 132
                } C${CX + 92} ${PUNCAK - 74} ${CX + 36} ${PUNCAK - 44} ${CX + 15} ${PUNCAK + 4} Z`}
                className="seu-kolom"
              />
              <path
                d={`M${CX - 14} ${PUNCAK + 4} l -8 -26 14 6 4 -20 8 22 16 -8 -8 20 20 4 -20 8z`}
                className="seu-ledak"
              />
              {TEFRA.map((dx, i) => (
                <circle
                  key={`tefra-${dx}`}
                  cx={CX + dx}
                  cy={PUNCAK - 40 - (i % 3) * 26}
                  r={i % 2 === 0 ? 4 : 3}
                  className="seu-tefra"
                  style={{ animationDelay: `${i * 0.32}s` }}
                />
              ))}
              <text x={CX + 150} y={PUNCAK - 140} className="seu-kecil">
                kolom abu dan tefra
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="seu-kontrol">
        <div className="seu-slider">
          <label htmlFor="seu-kekentalan" className="seu-slider-baris">
            <span className="seu-slider-label">Kekentalan magma</span>
            <output htmlFor="seu-kekentalan">{kekentalan}</output>
          </label>
          <input
            id="seu-kekentalan"
            type="range"
            min={RENTANG.min}
            max={RENTANG.max}
            step={RENTANG.langkah}
            value={kekentalan}
            onChange={(e) => setKekentalan(Number(e.target.value))}
            aria-valuetext={`${kekentalan} dari 100, ${labelKekentalan(kekentalan)}`}
            aria-describedby="seu-kekentalan-skala"
          />
          <p className="seu-skala" id="seu-kekentalan-skala">
            <span>encer (magma basalt)</span>
            <span>kental (magma riolit)</span>
          </p>
        </div>

        <div className="seu-slider">
          <label htmlFor="seu-gas" className="seu-slider-baris">
            <span className="seu-slider-label">Kadar gas</span>
            <output htmlFor="seu-gas">{gas}</output>
          </label>
          <input
            id="seu-gas"
            type="range"
            min={RENTANG.min}
            max={RENTANG.max}
            step={RENTANG.langkah}
            value={gas}
            onChange={(e) => setGas(Number(e.target.value))}
            aria-valuetext={`${gas} dari 100, kadar gas ${labelGas(gas)}`}
            aria-describedby="seu-gas-skala"
          />
          <p className="seu-skala" id="seu-gas-skala">
            <span>sedikit gas</span>
            <span>banyak gas</span>
          </p>
        </div>
      </div>

      <div className="seu-hasil">
        <div>
          <p className="seu-label-kecil">Gaya letusan</p>
          <p className="seu-nilai">{gaya.nama}</p>
          <p className="seu-extra">{gaya.keluaran}</p>
        </div>
        <div>
          <p className="seu-label-kecil">Bentuk gunung</p>
          <p className="seu-nilai">{bentuk.nama}</p>
          <p className="seu-extra">
            lereng {bentuk.lereng}°, {bentuk.lerengNama}
          </p>
        </div>
        <div>
          <p className="seu-label-kecil">Gas yang terperangkap</p>
          <p className="seu-nilai">{Math.round(terkunci * 100)}%</p>
          <div
            className="seu-meter"
            role="img"
            aria-label={`Gas yang terperangkap ${Math.round(terkunci * 100)} persen`}
          >
            <span style={{ width: `${Math.round(terkunci * 100)}%` }} />
          </div>
        </div>
      </div>

      <p className="seu-ringkas" aria-live="polite">
        {gaya.ringkas} {bentuk.ringkas}
      </p>

      <p className="seu-ilustrasi">
        Ilustrasi. Kekentalan dan kadar gas memakai skala 0–100 tanpa satuan, angka lereng dan
        persentase gas terperangkap keluaran model sederhana, dan skala tegak pada gambar
        dilebih-lebihkan supaya bentuk gunung terlihat.
      </p>
    </div>
  );
}
