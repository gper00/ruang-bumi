import { useState } from 'react';
import { keadaanStepa, type SkenarioStepa } from '../../lib/bioma';
import './StepaGangguan.css';

const PILIHAN: Array<{ id: SkenarioStepa; label: string }> = [
  { id: 'alami', label: 'Tanpa gangguan' },
  { id: 'kebakaran', label: 'Kebakaran' },
  { id: 'gembala', label: 'Penggembalaan' },
];

const LEBAR_METER = { rendah: 22, sedang: 50, tinggi: 78 } as const;

export default function StepaGangguan() {
  const [skenario, setSkenario] = useState<SkenarioStepa>('alami');
  const keadaan = keadaanStepa(skenario);

  const tinggiRumput = keadaan.rumput === 'tinggi' ? 42 : keadaan.rumput === 'sedang' ? 30 : 17;
  const rumput = Array.from({ length: 26 }, (_, i) => {
    const x = 26 + i * 27;
    const tinggi = tinggiRumput * (0.62 + ((i * 7) % 10) / 16);
    return { x, tinggi };
  });

  const pohon = [350, 440, 530, 620];
  const api = skenario === 'kebakaran';
  const gembala = skenario === 'gembala';

  return (
    <div className="st">
      <div className="st-kanvas">
        <svg viewBox="0 0 720 320" role="img" aria-labelledby="st-judul st-desk">
          <title id="st-judul">Stepa dengan api dan penggembalaan</title>
          <desc id="st-desk">
            Penampang padang rumput. Rumput berakar dalam dan tunasnya berada di bawah tanah.
            Pohon muda tumbuh di atas permukaan. Api membakar pucuk di atas tanah, sedangkan
            penggembalaan memangkas pucuk pohon muda.
          </desc>

          <rect width="720" height="210" fill="var(--surface-2)" />
          <circle cx="644" cy="52" r="23" fill="var(--sand)" opacity="0.5" />
          <rect y="210" width="720" height="110" fill="var(--land)" />
          <rect y="274" width="720" height="46" fill="var(--mantle)" opacity="0.45" />
          <line x1="0" y1="210" x2="720" y2="210" stroke="var(--line-strong)" strokeWidth="1" />

          {/* Akar rumput: dalam, bercabang, tetap ada di semua skenario. */}
          {Array.from({ length: 8 }, (_, i) => {
            const x = 66 + i * 88;
            return (
              <g key={`akar-${i}`} className="st-akar">
                <path d={`M${x} 212 C${x - 5} 238 ${x + 7} 250 ${x - 2} 272`} />
                <path d={`M${x - 2} 240 C${x - 20} 248 ${x - 24} 260 ${x - 30} 268`} />
                <path d={`M${x + 3} 252 C${x + 22} 256 ${x + 26} 264 ${x + 34} 270`} />
              </g>
            );
          })}

          {rumput.map(({ x, tinggi }, i) => (
            <path
              key={`rumput-${i}`}
              className="st-rumput"
              d={`M${x} 211 Q${x + (i % 2 === 0 ? 4 : -4)} ${211 - tinggi / 2} ${x + (i % 3 === 0 ? 3 : -2)} ${211 - tinggi}`}
            />
          ))}

          {/* Pohon muda. Api membakar pucuk di atas tanah; penggembalaan memangkasnya. */}
          {pohon.map((x, i) => {
            const hidup = i < keadaan.pohonMuda;
            const tinggi = api ? 13 : gembala && hidup ? 30 : 66;
            const puncak = 211 - tinggi;
            return (
              <g key={`pohon-${x}`} className={`st-pohon${api ? ' terbakar' : ''}`}>
                <line x1={x} y1="211" x2={x} y2={puncak} />
                {hidup ? (
                  <ellipse cx={x} cy={puncak - 6} rx="17" ry="21" className="st-kanopi" />
                ) : (
                  <path
                    d={`M${x - 7} ${puncak + 4} l7-7 7 7`}
                    className="st-pangkas"
                    fill="none"
                  />
                )}
              </g>
            );
          })}

          {api && (
            <g className="st-api">
              {[270, 320, 372, 424, 476, 528].map((x, i) => (
                <path
                  key={`api-${x}`}
                  d={`M${x} 212 c-8-15 6-19 2-32 15 8 18 22 8 32z`}
                  opacity={0.75 - i * 0.05}
                />
              ))}
              <circle cx="330" cy="150" r="12" className="st-asap" />
              <circle cx="372" cy="126" r="9" className="st-asap" />
              <circle cx="452" cy="140" r="11" className="st-asap" />
              <text x="300" y="98" className="st-label">
                api membakar pucuk di atas tanah
              </text>
            </g>
          )}

          {gembala && (
            <g className="st-gembala">
              <ellipse cx="158" cy="192" rx="30" ry="16" />
              <circle cx="193" cy="180" r="9" />
              <path d="M150 208v14M170 208v14M188 206v14M196 174l8-9" />
              <text x="126" y="238" className="st-label">
                penggembalaan
              </text>
            </g>
          )}

          <text x="26" y="300" className="st-label">
            tunas rumput di bawah tanah
          </text>
          <text x="600" y="300" className="st-label">
            pohon muda
          </text>
          <text x="350" y="196" className="st-label">
            {tinggiRumput > 20 ? 'rumput tinggi' : 'rumput pendek'}
          </text>
        </svg>
      </div>

      <div className="st-kontrol" role="group" aria-label="Pilih gangguan pada stepa">
        {PILIHAN.map((p) => (
          <button
            key={p.id}
            type="button"
            className="st-tombol"
            aria-pressed={skenario === p.id}
            onClick={() => setSkenario(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="st-hasil">
        <div className="st-meter-blok">
          <p className="st-meter-label">Tutupan pohon</p>
          <div
            className="st-meter"
            role="img"
            aria-label={`Tutupan pohon ${keadaan.tutupanPohon}`}
          >
            <span style={{ width: `${LEBAR_METER[keadaan.tutupanPohon]}%` }} />
          </div>
          <p className="st-meter-nilai">{keadaan.tutupanPohon}</p>
        </div>

        <p className="st-angka">
          <span>
            <strong>{keadaan.pohonMuda}</strong> dari 4 pohon muda bertahan
          </span>
          <span>Rumput: {keadaan.rumput}</span>
        </p>

        <p className="st-ringkas" aria-live="polite">
          {keadaan.ringkas}
        </p>
      </div>

      <p className="st-ilustrasi">
        Ilustrasi. Jumlah pohon dan tinggi rumput adalah model kualitatif, bukan hasil
        pengukuran. Curah hujan stepa sendiri cukup untuk pohon di banyak tempat.
      </p>
    </div>
  );
}
