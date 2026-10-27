import { useState } from 'react';
import {
  KEDALAMAN_MAKS,
  KELAS_KEDALAMAN,
  goyanganPermukaan,
  jarakHiposentral,
  kelasKedalaman,
} from '../../lib/gempa';
import './GempaFokus.css';

const Y_PERMUKAAN = 80;
const Y_DASAR = 400;
const X_HIPOSENTRUM = 420;
const SKALA_MENDATAR = 1.35;

const yKedalaman = (km: number) =>
  Y_PERMUKAAN + (Y_DASAR - Y_PERMUKAAN) * Math.pow(Math.max(km, 0) / KEDALAMAN_MAKS, 0.55);

const bulat = (nilai: number) => Math.round(nilai);

export default function GempaFokus() {
  const [kedalaman, setKedalaman] = useState(35);
  const [jarakKota, setJarakKota] = useState(100);

  const kelas = kelasKedalaman(kedalaman);
  const goyangan = goyanganPermukaan(jarakKota, kedalaman);
  const jarakHipo = jarakHiposentral(jarakKota, kedalaman);

  const yHipo = yKedalaman(kedalaman);
  const xKota = X_HIPOSENTRUM + jarakKota * SKALA_MENDATAR;
  const puncakGelombang = goyangan.label === 'kuat' ? 1 : goyangan.label === 'sedang' ? 0.6 : 0.3;

  // Label jarak hiposentrum digeser sedikit ke atas agar tidak menabrak garis.
  const tengahX = (X_HIPOSENTRUM + xKota) / 2;
  const tengahY = (yHipo + Y_PERMUKAAN) / 2;

  return (
    <div className="gfk">
      <div className="gfk-kanvas">
        <svg viewBox="0 0 720 470" role="img" aria-labelledby="gfk-judul gfk-desk">
          <title id="gfk-judul">Penampang hiposentrum dan episentrum gempa</title>
          <desc id="gfk-desk">
            Penampang tanah dengan hiposentrum di bawah permukaan dan episentrum tepat di atasnya.
            Jarak dari kota ke hiposentrum selalu lebih panjang daripada jarak ke episentrum, dan
            getaran yang terasa di permukaan melemah saat gempa makin dalam.
          </desc>

          <rect width="720" height={Y_PERMUKAAN} fill="var(--surface-2)" />

          {KELAS_KEDALAMAN.map((item, i) => {
            const atas = yKedalaman(item.dari);
            const bawah = yKedalaman(item.sampai);
            const tengah = (atas + bawah) / 2;
            return (
              <g key={item.id}>
                <rect
                  x="0"
                  y={atas}
                  width="720"
                  height={bawah - atas}
                  fill={i % 2 === 0 ? 'var(--land)' : 'var(--mantle)'}
                  opacity={i % 2 === 0 ? 0.85 : 0.6}
                />
                <text x="10" y={tengah - 2} className="gfk-nama">
                  {item.nama}
                </text>
                <text x="10" y={tengah + 11} className="gfk-kecil">
                  {item.dari}–{item.sampai} km
                </text>
              </g>
            );
          })}

          {[70, 300].map((batas) => (
            <g key={batas}>
              <line x1="0" y1={yKedalaman(batas)} x2="720" y2={yKedalaman(batas)} className="gfk-batas" />
              <text x="140" y={yKedalaman(batas) - 4} textAnchor="end" className="gfk-kecil">
                {batas} km
              </text>
            </g>
          ))}

          <line x1="0" y1={Y_PERMUKAAN} x2="720" y2={Y_PERMUKAAN} className="gfk-permukaan" />

          {/* Gelombang seismik dari hiposentrum. */}
          <g className="gfk-gelombang">
            <circle cx={X_HIPOSENTRUM} cy={yHipo} r="26" />
            <circle cx={X_HIPOSENTRUM} cy={yHipo} r="44" />
            <circle cx={X_HIPOSENTRUM} cy={yHipo} r="62" />
          </g>

          {/* Hiposentrum, episentrum, dan kota di permukaan. */}
          <line
            x1={X_HIPOSENTRUM}
            y1={yHipo}
            x2={X_HIPOSENTRUM}
            y2={Y_PERMUKAAN}
            className="gfk-tegak"
          />
          <text x={X_HIPOSENTRUM - 8} y={tengahY} textAnchor="end" className="gfk-kecil">
            tegak lurus
          </text>

          <path
            d={`M${X_HIPOSENTRUM} ${yHipo - 9} l3 5 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z`}
            className="gfk-hiposentrum"
          />
          <text x={X_HIPOSENTRUM - 12} y={yHipo + 4} textAnchor="end" className="gfk-penanda kuat">
            hiposentrum {bulat(kedalaman)} km
          </text>

          <circle cx={X_HIPOSENTRUM} cy={Y_PERMUKAAN} r="5" className="gfk-episentrum" />
          <text x={X_HIPOSENTRUM + 10} y={Y_PERMUKAAN - 24} className="gfk-penanda">
            episentrum
          </text>

          <g className="gfk-kota">
            <rect x={xKota - 9} y={Y_PERMUKAAN - 18} width="18" height="18" />
            <path d={`M${xKota - 13} ${Y_PERMUKAAN - 18} ${xKota} ${Y_PERMUKAAN - 30} ${xKota + 13} ${Y_PERMUKAAN - 18}z`} />
          </g>
          <text x={xKota} y={Y_PERMUKAAN - 36} textAnchor="middle" className="gfk-penanda kuat">
            kota
          </text>

          {[0, 1, 2].map((i) => (
            <path
              key={`getar-${i}`}
              d={`M${xKota - 16 - i * 9} ${Y_PERMUKAAN - 24 - i * 8} q${8 + i * 4} -${6 + i * 3} ${16 + i * 8} 0`}
              className="gfk-getar"
              opacity={puncakGelombang * (0.9 - i * 0.25)}
            />
          ))}

          <line
            x1={X_HIPOSENTRUM}
            y1={Y_PERMUKAAN - 8}
            x2={xKota}
            y2={Y_PERMUKAAN - 8}
            className="gfk-jarak"
          />
          <text x={tengahX} y={Y_PERMUKAAN - 14} textAnchor="middle" className="gfk-kecil">
            jarak episentrum {bulat(jarakKota)} km
          </text>

          <line x1={X_HIPOSENTRUM} y1={yHipo} x2={xKota} y2={Y_PERMUKAAN - 8} className="gfk-jarak" />
          <text x={tengahX + 26} y={tengahY + 16} className="gfk-kecil">
            jarak hiposentrum {bulat(jarakHipo)} km
          </text>
        </svg>
      </div>

      <div className="gfk-kontrol">
        <label className="gfk-slider">
          <span className="gfk-slider-label">Kedalaman</span>
          <input
            type="range"
            min="5"
            max={KEDALAMAN_MAKS}
            step="5"
            value={kedalaman}
            onChange={(e) => setKedalaman(Number(e.target.value))}
            aria-valuetext={`${kedalaman} kilometer, kelas ${kelas.nama.toLowerCase()}`}
          />
        </label>
        <p className="gfk-angka">{kedalaman} km</p>

        <label className="gfk-slider gfk-slider-kedua">
          <span className="gfk-slider-label">Jarak kota</span>
          <input
            type="range"
            min="20"
            max="150"
            step="5"
            value={jarakKota}
            onChange={(e) => setJarakKota(Number(e.target.value))}
            aria-valuetext={`${jarakKota} kilometer dari episentrum`}
          />
        </label>
        <p className="gfk-angka">{jarakKota} km</p>
      </div>

      <div className="gfk-hasil">
        <div>
          <p className="gfk-label-kecil">Kelas kedalaman</p>
          <p className="gfk-nilai">{kelas.nama}</p>
          <p className="gfk-extra">
            {kelas.dari}–{kelas.sampai} km
          </p>
        </div>
        <div>
          <p className="gfk-label-kecil">Jarak ke hiposentrum</p>
          <p className="gfk-nilai">{bulat(jarakHipo)} km</p>
          <p className="gfk-extra">jarak episentrum {bulat(jarakKota)} km</p>
        </div>
        <div>
          <p className="gfk-label-kecil">Getaran di permukaan</p>
          <p className="gfk-nilai">{goyangan.label}</p>
          <div
            className="gfk-meter"
            role="img"
            aria-label={`Perkiraan kekuatan getaran ${goyangan.label}`}
          >
            <span style={{ width: `${Math.round(goyangan.nilai * 100)}%` }} />
          </div>
        </div>
      </div>

      <p className="gfk-ringkas" aria-live="polite">
        {kelas.ringkas} Jarak dari kota ke hiposentrum selalu lebih panjang daripada jarak ke
        episentrum, karena garis miringnya harus turun dulu ke kedalaman gempa.
      </p>

      <p className="gfk-ilustrasi">
        Ilustrasi. Skala kedalaman dimampatkan supaya rentang 0–700 km muat dalam satu gambar, dan
        skala mendatar berbeda dari skala tegak. Tingkat getaran di sini model sederhana — makin
        jauh dan makin dalam, makin lemah — bukan hasil perhitungan seismologi.
      </p>
    </div>
  );
}
