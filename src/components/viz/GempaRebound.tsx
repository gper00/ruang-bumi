import { useState } from 'react';
import { GESER_MAKS, keadaanSesar } from '../../lib/gempa';
import './GempaRebound.css';

const Y_ATAS = 40;
const Y_BAWAH = 320;
const FAULT_ATAS = 352;
const FAULT_BAWAH = 368;
const Y_PAGAR = 176;
const AMP = 26;

const xFault = (y: number) => FAULT_ATAS + ((y - Y_ATAS) / (Y_BAWAH - Y_ATAS)) * (FAULT_BAWAH - FAULT_ATAS);

const angka = (nilai: number, desimal = 1) => nilai.toFixed(desimal).replace('.', ',');

export default function GempaRebound() {
  const [regangan, setRegangan] = useState(60);
  const [terlepas, setTerlepas] = useState(false);
  const keadaan = keadaanSesar(regangan, terlepas);

  const meluncur = keadaan.status === 'meluncur';
  const amplitudo = meluncur ? AMP : keadaan.menekuk * AMP;
  const xt = xFault(Y_PAGAR);

  function geserY(x: number): number {
    const d = x - xt;
    const arah = d < 0 ? -1 : 1;
    if (d === 0) return 0;
    return meluncur ? arah * AMP : arah * amplitudo * Math.tanh(Math.abs(d) / 60);
  }

  function garis(y: number): string {
    const titik: string[] = [];
    for (let x = 60; x <= 660; x += 6) {
      titik.push(`${x},${(y + geserY(x)).toFixed(1)}`);
    }
    return titik.join(' ');
  }

  function ubahRegangan(nilai: number) {
    setRegangan(nilai);
    if (nilai < 100) setTerlepas(false);
  }

  return (
    <div className="grb">
      <div className="grb-kanvas">
        <svg viewBox="0 0 720 360" role="img" aria-labelledby="grb-judul grb-desk">
          <title id="grb-judul">Model pemulihan elastis pada sesar</title>
          <desc id="grb-desk">
            Sketsa dua blok kerak yang dipisahkan sesar, dengan pagar dan lapisan batuan
            menyeberanginya. Saat sesar tersangkut, pagar melengkung dan energi elastis menumpuk.
            Setelah sesar meluncur, pagar kembali lurus tetapi sudah bergeser.
          </desc>

          {/* Dua blok kerak yang dipisahkan sesar. */}
          <polygon
            points={`0,${Y_ATAS} ${xFault(Y_ATAS)},${Y_ATAS} ${xFault(Y_BAWAH)},${Y_BAWAH} 0,${Y_BAWAH}`}
            className="grb-blok"
          />
          <polygon
            points={`720,${Y_ATAS} ${xFault(Y_ATAS)},${Y_ATAS} ${xFault(Y_BAWAH)},${Y_BAWAH} 720,${Y_BAWAH}`}
            className="grb-blok grb-blok-kanan"
          />
          <line
            x1={xFault(Y_ATAS)}
            y1={Y_ATAS}
            x2={xFault(Y_BAWAH)}
            y2={Y_BAWAH}
            className="grb-sesar"
          />

          {/* Lapisan batuan yang ikut melengkung. */}
          {[110, 250].map((y) => (
            <polyline key={y} points={garis(y)} className="grb-lapisan" />
          ))}
          <line x1="60" y1={Y_PAGAR} x2="660" y2={Y_PAGAR} className="grb-awal" />

          {/* Arah gerak relatif kedua blok. */}
          <g className="grb-panah">
            <path d="M150 66 150 46M150 46l-7 9M150 46l7 9" />
            <path d="M570 46 570 66M570 66l-7-9M570 66l7-9" />
          </g>
          <text x="360" y="30" textAnchor="middle" className="grb-label">
            kedua blok bergerak perlahan, berlawanan arah
          </text>

          {/* Pagar dengan tiang, dibangun lurus menyeberangi sesar. */}
          <polyline points={garis(Y_PAGAR)} className="grb-pagar" />
          {Array.from({ length: 10 }, (_, i) => 100 + i * 58).map((x) => {
            const geser = geserY(x);
            return (
              <line
                key={x}
                x1={x}
                y1={Y_PAGAR + geser - 7}
                x2={x}
                y2={Y_PAGAR + geser + 7}
                className="grb-tiang"
              />
            );
          })}

          {meluncur && (
            <g className="grb-gempa">
              <circle cx={xt} cy={Y_PAGAR} r="34" />
              <circle cx={xt} cy={Y_PAGAR} r="54" />
              <circle cx={xt} cy={Y_PAGAR} r="76" />
              <text x={xt + 20} y={Y_PAGAR - 88} className="grb-label">
                energi terlepas sebagai gelombang seismik
              </text>
            </g>
          )}

          <text x={xFault(Y_BAWAH) + 12} y="338" className="grb-label">
            sesar
          </text>
          <text x="60" y="338" className="grb-label">
            posisi pagar sebelum melengkung (garis putus-putus)
          </text>
        </svg>
      </div>

      <div className="grb-kontrol">
        <label className="grb-slider">
          <span className="grb-slider-label">Regangan</span>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={regangan}
            onChange={(e) => ubahRegangan(Number(e.target.value))}
            aria-valuetext={`${regangan} persen`}
          />
        </label>
        <p className="grb-persen">{regangan}%</p>
      </div>

      <div className="grb-tombol-bar" role="group" aria-label="Kendali siklus sesar">
        <button
          type="button"
          className="grb-tombol"
          disabled={regangan < 100 || terlepas}
          onClick={() => setTerlepas(true)}
        >
          {terlepas ? 'Sesar sudah meluncur' : 'Lepaskan regangan'}
        </button>
        <button
          type="button"
          className="grb-tombol"
          disabled={!terlepas && regangan === 0}
          onClick={() => {
            setRegangan(0);
            setTerlepas(false);
          }}
        >
          Mulai siklus baru
        </button>
        {regangan < 100 && (
          <p className="grb-petunjuk">Naikkan regangan sampai penuh untuk bisa melepasnya.</p>
        )}
      </div>

      <div className="grb-hasil">
        <div>
          <p className="grb-label-kecil">Keadaan sesar</p>
          <p className="grb-nilai">{meluncur ? 'meluncur' : 'tersangkut'}</p>
        </div>
        <div>
          <p className="grb-label-kecil">Energi tersimpan</p>
          <p className="grb-nilai">{Math.round(keadaan.energi * 100)}%</p>
        </div>
        <div>
          <p className="grb-label-kecil">Geser permanen</p>
          <p className="grb-nilai">{angka(keadaan.geser)} m</p>
        </div>
      </div>

      <p className="grb-ringkas" aria-live="polite">
        {keadaan.ringkas}
      </p>

      <p className="grb-ilustrasi">
        Ilustrasi. Lengkungannya dilebih-lebihkan: di alam, distorsi sebesar {angka(GESER_MAKS)} m
        tersebar di banyak kilometer dan hanya terlihat dengan alat ukur presisi seperti GPS. Angka
        geser mengikuti pagar dekat Bolinas yang bergeser sekitar 8,5 kaki pada gempa 1906. Gerak
        sesar di sini digambar ke atas-bawah halaman; yang sebenarnya bergerak adalah blok batuan
        sejajar garis sesar.
      </p>
    </div>
  );
}
