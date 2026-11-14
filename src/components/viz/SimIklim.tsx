import { useMemo, useState } from 'react';
import {
  HARI_PER_TAHUN,
  TAHUN_AKHIR,
  TAHUN_AWAL,
  bulanDalamTahun,
  deretHarian,
  deretTahunan,
  labelTanggal,
  normalTahunan,
  ringkasTahun,
  trenIklim,
} from '../../lib/iklim';
import './SimIklim.css';

const BULAN = bulanDalamTahun().map((nama) => nama.slice(0, 3));
const HARI_AWAL_BULAN = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
const TAHUN_TANDA = [1996, 2000, 2005, 2010, 2015, 2020, 2025];

const W = 720;
const KIRI = 48;
const KANAN = 16;
const LEBAR = W - KIRI - KANAN;

function angka(nilai: number, digit = 1): string {
  return nilai.toFixed(digit).replace('.', ',');
}

function tanda(nilai: number): string {
  return `${nilai >= 0 ? '+' : '−'}${angka(Math.abs(nilai))}`;
}

export default function SimIklim() {
  const [tahun, setTahun] = useState(TAHUN_AKHIR);
  const [tampilNormal, setTampilNormal] = useState(true);

  const harian = useMemo(() => deretHarian(tahun), [tahun]);
  const normal = useMemo(() => normalTahunan(), []);
  const tahunan = useMemo(() => deretTahunan(), []);
  const ringkas = useMemo(() => ringkasTahun(tahun), [tahun]);
  const tren = useMemo(() => trenIklim(), []);

  const semuaNilai = tampilNormal ? [...harian, ...normal] : harian;
  const yMin = Math.floor(Math.min(...semuaNilai) - 0.4);
  const yMax = Math.ceil(Math.max(...semuaNilai) + 0.4);

  const ATAS = 34;
  const TINGGI = 240;

  const x = (indeks: number) => KIRI + (indeks / (HARI_PER_TAHUN - 1)) * LEBAR;
  const y = (nilai: number) =>
    ATAS + ((yMax - nilai) / Math.max(1, yMax - yMin)) * TINGGI;

  const garis = (nilai: number[]) =>
    nilai
      .map((n, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(n).toFixed(1)}`)
      .join(' ');

  const kisi: number[] = [];
  for (let suhu = Math.ceil(yMin / 2) * 2; suhu <= yMax; suhu += 2) kisi.push(suhu);

  const nilaiTahunan = tahunan.map((t) => t.rataRata);
  const aMin = Math.floor((Math.min(...nilaiTahunan) - 0.25) * 2) / 2;
  const aMax = Math.ceil((Math.max(...nilaiTahunan) + 0.25) * 2) / 2;
  const ATAS2 = 22;
  const TINGGI2 = 88;
  const y2 = (nilai: number) =>
    ATAS2 + ((aMax - nilai) / Math.max(0.1, aMax - aMin)) * TINGGI2;
  const x2 = (indeks: number) => KIRI + (indeks / (tahunan.length - 1)) * LEBAR;
  const indeksTahun = tahun - TAHUN_AWAL;
  const rataTahun = tahunan[indeksTahun]?.rataRata ?? ringkas.rataRata;

  return (
    <div className="sk">
      <div className="sk-kanvas">
        <svg
          viewBox="0 0 720 308"
          role="img"
          aria-labelledby="sk-judul-grafik sk-desk-grafik"
          className="sk-grafik"
        >
          <title id="sk-judul-grafik">{`Suhu harian ${tahun} dibandingkan normal 30 tahun`}</title>
          <desc id="sk-desk-grafik">
            {`Garis panas berkelok menunjukkan suhu tiap hari sepanjang tahun ${tahun}. Garis putus-putus biru menunjukkan rata-rata hari yang sama selama 1996–2025. Garis harian berayun jauh, sedangkan garis normal jauh lebih halus.`}
          </desc>

          {kisi.map((suhu) => (
            <g key={suhu}>
              <line
                x1={KIRI}
                x2={KIRI + LEBAR}
                y1={y(suhu)}
                y2={y(suhu)}
                className="sk-kisi"
              />
              <text x={KIRI - 8} y={y(suhu) + 4} textAnchor="end" className="sk-sumbu">
                {suhu}°
              </text>
            </g>
          ))}

          {HARI_AWAL_BULAN.map((hari, i) => (
            <text key={BULAN[i]} x={x(hari - 1)} y={ATAS + TINGGI + 24} textAnchor="middle" className="sk-sumbu">
              {BULAN[i]}
            </text>
          ))}

          {tampilNormal && (
            <path d={garis(normal)} className="sk-normal" data-garis="normal" />
          )}
          <path d={garis(harian)} className="sk-harian" data-garis="harian" />

          <g className="sk-legenda">
            <line x1={KIRI} x2={KIRI + 26} y1="18" y2="18" className="sk-kunci-harian" />
            <text x={KIRI + 32} y="22">
              suhu harian {tahun}
            </text>
            {tampilNormal && (
              <>
                <line
                  x1={KIRI + 168}
                  x2={KIRI + 194}
                  y1="18"
                  y2="18"
                  className="sk-kunci-normal"
                />
                <text x={KIRI + 200} y="22">
                  normal 30 tahun (1996–2025)
                </text>
              </>
            )}
          </g>
        </svg>

        <svg
          viewBox="0 0 720 150"
          role="img"
          aria-labelledby="sk-judul-tahunan sk-desk-tahunan"
          className="sk-grafik sk-grafik-tahunan"
        >
          <title id="sk-judul-tahunan">Rata-rata suhu tahunan 1996–2025</title>
          <desc id="sk-desk-tahunan">
            {`Tiga puluh titik rata-rata tahunan membentuk garis yang naik perlahan. Titik yang disorot adalah tahun ${tahun}. Garis putus-putus adalah rata-rata seluruh 30 tahun.`}
          </desc>

          {[aMin, aMax].map((nilai) => (
            <g key={nilai}>
              <line
                x1={KIRI}
                x2={KIRI + LEBAR}
                y1={y2(nilai)}
                y2={y2(nilai)}
                className="sk-kisi"
              />
              <text x={KIRI - 8} y={y2(nilai) + 4} textAnchor="end" className="sk-sumbu">
                {angka(nilai)}°
              </text>
            </g>
          ))}

          <line
            x1={KIRI}
            x2={KIRI + LEBAR}
            y1={y2(ringkas.normal)}
            y2={y2(ringkas.normal)}
            className="sk-rata-iklim"
          />

          {TAHUN_TANDA.map((t) => (
            <text
              key={t}
              x={x2(t - TAHUN_AWAL)}
              y={ATAS2 + TINGGI2 + 26}
              textAnchor="middle"
              className="sk-sumbu"
            >
              {t}
            </text>
          ))}

          <path d={garisTahunan()} className="sk-tahunan" />

          <circle
            cx={x2(indeksTahun)}
            cy={y2(rataTahun)}
            r="5"
            className="sk-titik-tahun"
          />
          <text
            x={Math.min(KIRI + LEBAR - 8, Math.max(KIRI + 8, x2(indeksTahun)))}
            y={Math.max(14, y2(rataTahun) - 12)}
            textAnchor="middle"
            className="sk-label-tahun"
          >
            {tahun}
          </text>

          <text x={KIRI + LEBAR} y={y2(ringkas.normal) - 6} textAnchor="end" className="sk-sumbu">
            rata-rata 30 tahun
          </text>
        </svg>
      </div>

      <div className="sk-kontrol">
        <label className="sk-slider">
          <span className="sk-slider-baris">
            <span className="sk-slider-label">Tahun</span>
            <output className="sk-output" htmlFor="sk-tahun">
              {tahun}
            </output>
          </span>
          <input
            id="sk-tahun"
            type="range"
            min={TAHUN_AWAL}
            max={TAHUN_AKHIR}
            step="1"
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            aria-valuetext={`Tahun ${tahun}`}
          />
        </label>

        <label className="sk-centang">
          <input
            id="sk-normal"
            type="checkbox"
            checked={tampilNormal}
            onChange={(e) => setTampilNormal(e.target.checked)}
          />
          <span>Tampilkan normal 30 tahun</span>
        </label>
      </div>

      <div className="sk-hasil">
        <div>
          <p className="sk-label">Rata-rata {tahun}</p>
          <p className="sk-nilai">{angka(ringkas.rataRata)} °C</p>
          <p className="sk-extra">
            Normal 30 tahun {angka(ringkas.normal)} °C
          </p>
        </div>
        <div>
          <p className="sk-label">Anomali tahun ini</p>
          <p className="sk-nilai">{tanda(ringkas.anomali)} °C</p>
          <p className="sk-extra">Selisih dari rata-rata 1996–2025</p>
        </div>
        <div>
          <p className="sk-label">Hari terpanas</p>
          <p className="sk-nilai">{angka(ringkas.terpanas)} °C</p>
          <p className="sk-extra">{labelTanggal(ringkas.hariTerpanas)}</p>
        </div>
        <div>
          <p className="sk-label">Hari terdingin</p>
          <p className="sk-nilai">{angka(ringkas.terdingin)} °C</p>
          <p className="sk-extra">{labelTanggal(ringkas.hariTerdingin)}</p>
        </div>
      </div>

      <p className="sk-ringkas" aria-live="polite">
        Tahun {tahun}: rata-rata {angka(ringkas.rataRata)} °C, {tanda(ringkas.anomali)} °C dari
        normal 30 tahun. Satu hari bisa menyimpang sampai {angka(ringkas.simpanganHarian)} °C dari
        normal hari itu, sementara rata-rata tahunan naik {angka(tren)} °C dari 1996 ke 2025.
        {!tampilNormal && ' Garis normal sedang disembunyikan.'}
      </p>

      <p className="sk-ilustrasi">
        Ilustrasi. Deret suhu ini dibangkitkan dari model sederhana, bukan data stasiun cuaca.
        Yang digambarkan hanya perbedaan skala waktu antara cuaca harian dan iklim 30 tahun.
      </p>
    </div>
  );

  function garisTahunan() {
    return tahunan
      .map(
        (t, i) =>
          `${i === 0 ? 'M' : 'L'}${x2(i).toFixed(1)} ${y2(t.rataRata).toFixed(1)}`,
      )
      .join(' ');
  }
}
