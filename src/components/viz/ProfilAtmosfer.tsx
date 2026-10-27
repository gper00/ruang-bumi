import { useState } from 'react';
import { BATAS_ATAS, LAPISAN, gradienLapisan, lapisanPada, profilSuhu, suhuPada } from '../../lib/atmosfer';
import './ProfilAtmosfer.css';

const KIRI = 160;
const KANAN = 690;
const ATAS = 40;
const BAWAH = 390;
const SUHU_MIN = -100;
const SUHU_MAKS = 20;

const xSuhu = (suhu: number) => KIRI + ((suhu - SUHU_MIN) / (SUHU_MAKS - SUHU_MIN)) * (KANAN - KIRI);
const yKm = (km: number) => BAWAH - (km / BATAS_ATAS) * (BAWAH - ATAS);

const WARNA_LAPISAN: Record<string, string> = {
  troposfer: 'var(--surface-2)',
  stratosfer: 'var(--sea-soft)',
  mesosfer: 'var(--line)',
  termosfer: 'var(--heat-soft)',
};

const TITIK_KURVA = profilSuhu(1)
  .map((titik) => `${xSuhu(titik.suhu).toFixed(1)},${yKm(titik.km).toFixed(1)}`)
  .join(' ');

function angka(nilai: number): string {
  const teks = Math.abs(nilai).toFixed(1).replace('.', ',');
  return `${nilai < 0 ? '−' : ''}${teks}`;
}

export default function ProfilAtmosfer() {
  const [km, setKm] = useState(5);
  const lapisan = lapisanPada(km);
  const suhu = suhuPada(km);
  const x = xSuhu(suhu);
  const y = yKm(km);

  return (
    <div className="atl">
      <div className="atl-kanvas">
        <svg viewBox="0 0 720 470" role="img" aria-labelledby="atl-judul atl-desk">
          <title id="atl-judul">Profil suhu atmosfer dari permukaan sampai 100 kilometer</title>
          <desc id="atl-desk">
            Kurva suhu terhadap ketinggian. Suhu turun di troposfer, naik di stratosfer karena ozon
            menyerap ultraviolet, turun lagi sampai titik terdingin di mesopause, lalu naik pelan di
            bagian bawah termosfer.
          </desc>

          {LAPISAN.map((item) => {
            const atas = yKm(item.sampai);
            const tinggi = yKm(item.dari) - atas;
            const tengah = atas + tinggi / 2;
            return (
              <g key={item.id}>
                <rect
                  x="0"
                  y={atas}
                  width={KANAN}
                  height={tinggi}
                  fill={WARNA_LAPISAN[item.id]}
                  opacity={item.id === 'mesosfer' ? 0.4 : 0.75}
                />
                <text x="12" y={tengah - 2} className="atl-nama">
                  {item.nama}
                </text>
                <text x="12" y={tengah + 11} className="atl-kecil">
                  {item.id === 'termosfer' ? `${item.dari} km ke atas` : `${item.dari}–${item.sampai} km`}
                </text>
              </g>
            );
          })}

          {[11, 50, 85].map((batas) => (
            <g key={batas}>
              <line
                x1="0"
                y1={yKm(batas)}
                x2={KANAN}
                y2={yKm(batas)}
                className="atl-batas"
              />
              <text x="148" y={yKm(batas) - 4} textAnchor="end" className="atl-kecil">
                {batas} km
              </text>
            </g>
          ))}

          <line x1={KIRI} y1={ATAS} x2={KIRI} y2={BAWAH} className="atl-sumbu" />
          <line x1={KIRI} y1={BAWAH} x2={KANAN} y2={BAWAH} className="atl-sumbu" />

          {[-100, -50, 0].map((tanda) => (
            <g key={tanda}>
              <line x1={xSuhu(tanda)} y1={ATAS} x2={xSuhu(tanda)} y2={BAWAH} className="atl-grid" />
              <text x={xSuhu(tanda)} y="408" textAnchor="middle" className="atl-kecil">
                {tanda}
              </text>
            </g>
          ))}

          <polyline points={TITIK_KURVA} className="atl-kurva" />

          <text x="232" y="96" className="atl-kecil">
            mesopause: bagian terdingin atmosfer
          </text>
          <text x={KANAN} y={yKm(11) - 6} textAnchor="end" className="atl-kecil">
            tropopause: arah suhu berbalik
          </text>

          <line x1={KIRI} y1={y} x2={x} y2={y} className="atl-penunjuk" />
          <line x1={x} y1={y} x2={x} y2={BAWAH} className="atl-penunjuk" />
          <circle cx={x} cy={y} r="5.5" className="atl-titik" />
          <text
            x={x > KANAN - 60 ? x - 10 : x + 10}
            y={y - 9}
            textAnchor={x > KANAN - 60 ? 'end' : 'start'}
            className="atl-penanda"
          >
            {km} km
          </text>

          <text x={KIRI} y="426" className="atl-kecil">
            Suhu (°C)
          </text>
          <text x="12" y="426" className="atl-kecil">
            km
          </text>
        </svg>
      </div>

      <div className="atl-kontrol">
        <label className="atl-slider">
          <span className="atl-slider-label">Ketinggian</span>
          <input
            type="range"
            min="0"
            max={BATAS_ATAS}
            step="1"
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            aria-valuetext={`${km} kilometer, ${lapisan.nama}, suhu ${angka(suhu)} derajat Celsius`}
          />
        </label>
        <p className="atl-km">{km} km</p>
      </div>

      <div className="atl-hasil">
        <div>
          <p className="atl-label">Lapisan</p>
          <p className="atl-nilai">{lapisan.nama}</p>
        </div>
        <div>
          <p className="atl-label">Suhu</p>
          <p className="atl-nilai">{angka(suhu)} °C</p>
        </div>
        <div>
          <p className="atl-label">Arah suhu</p>
          <p className="atl-nilai">{lapisan.arah}</p>
          <p className="atl-extra">{gradienLapisan(lapisan.id)}</p>
        </div>
        <div>
          <p className="atl-label">Dipanaskan oleh</p>
          <p className="atl-nilai">{lapisan.pemanas}</p>
        </div>
      </div>

      <p className="atl-ringkas" aria-live="polite">
        {lapisan.ringkas}
      </p>

      <p className="atl-ilustrasi">
        Ilustrasi. Kurva memakai titik tetap U.S. Standard Atmosphere 1976. Batas lapisan yang
        sebenarnya bergeser: tropopause berkisar 8 km di daerah kutub sampai 17 km di ekuator, dan
        termosfer berlanjut jauh di atas 100 km dengan suhu yang bisa mencapai 2.000 °C.
      </p>
    </div>
  );
}
