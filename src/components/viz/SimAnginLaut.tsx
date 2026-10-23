import { useEffect, useMemo, useState } from 'react';
import './SimAnginLaut.css';

const TAU = Math.PI * 2;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function SimAnginLaut() {
  const [jam, setJam] = useState(13);
  const [main, setMain] = useState(false);
  const [kurangiGerak, setKurangiGerak] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const perbarui = () => setKurangiGerak(mq.matches);
    perbarui();
    mq.addEventListener('change', perbarui);
    return () => mq.removeEventListener('change', perbarui);
  }, []);

  useEffect(() => {
    if (!main || kurangiGerak) return;
    const id = window.setInterval(() => {
      setJam((prev) => (prev + 0.25) % 24);
    }, 220);
    return () => window.clearInterval(id);
  }, [main, kurangiGerak]);

  const suhuDarat = 28 + 6 * Math.cos((TAU * (jam - 14)) / 24);
  const suhuLaut = 28 + 0.9 * Math.cos((TAU * (jam - 15)) / 24);
  const selisih = suhuDarat - suhuLaut;
  const tenang = Math.abs(selisih) < 0.5;
  const anginLaut = selisih >= 0;
  const arah = tenang ? 'tenang' : anginLaut ? 'laut' : 'darat';

  const waktu = `${pad(Math.floor(jam) % 24)}:${pad(Math.round((jam % 1) * 60) % 60)}`;
  const siang = jam >= 6 && jam < 18;

  // Matahari/bulan bergerak di busur langit.
  const bendaX = 400 + 300 * Math.cos(Math.PI - ((jam - 6) / 12) * Math.PI);
  const bendaY = siang
    ? 210 - 150 * Math.sin(((jam - 6) / 12) * Math.PI)
    : 150 - 30 * Math.sin(((jam - 18) / 12) * Math.PI);

  const ringkasan = useMemo(() => {
    if (tenang) {
      return `Pukul ${waktu}, suhu darat ${suhuDarat.toFixed(1)} derajat dan laut ${suhuLaut.toFixed(
        1,
      )} derajat. Selisihnya kecil, udara hampir tidak bergerak.`;
    }
    return `Pukul ${waktu}, suhu darat ${suhuDarat.toFixed(1)} derajat dan laut ${suhuLaut.toFixed(
      1,
    )} derajat. Angin ${anginLaut ? 'laut bertiup dari laut ke darat' : 'darat bertiup dari darat ke laut'}.`;
  }, [waktu, suhuDarat, suhuLaut, tenang, anginLaut]);

  return (
    <div className="sal">
      <div className="sal-kanvas">
        <svg viewBox="0 0 800 420" role="img" aria-labelledby="sal-judul sal-deskripsi">
          <title id="sal-judul">Simulasi angin darat dan laut dalam 24 jam</title>
          <desc id="sal-deskripsi">Ilustrasi potongan pantai: laut di kiri, daratan di kanan.</desc>
          <defs>
            <linearGradient id="sal-langit-siang" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6fb3e0" />
              <stop offset="1" stopColor="#d9ecf6" />
            </linearGradient>
            <linearGradient id="sal-langit-malam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0f2733" />
              <stop offset="1" stopColor="#274b5c" />
            </linearGradient>
            <linearGradient id="sal-laut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a93b8" />
              <stop offset="1" stopColor="#146583" />
            </linearGradient>
          </defs>

          <rect
            width="800"
            height="420"
            fill={siang ? 'url(#sal-langit-siang)' : 'url(#sal-langit-malam)'}
          />

          {siang ? (
            <circle cx={bendaX} cy={bendaY} r="26" fill="#f6c453" />
          ) : (
            <circle cx={bendaX} cy={Math.max(40, bendaY)} r="16" fill="#dfe7ee" opacity="0.9" />
          )}

          {/* laut */}
          <rect x="0" y="250" width="450" height="170" fill="url(#sal-laut)" />
          <path d="M0 262 Q40 252 80 262 T160 262 T240 262 T320 262 T400 262 T480 262" fill="none" stroke="#bfe3ef" strokeWidth="2" opacity="0.6" />

          {/* pantai dan darat */}
          <path d="M430 250 L480 250 L500 420 L420 420 Z" fill="#e2c98f" />
          <path d="M480 250 L800 250 L800 420 L500 420 Z" fill="#6f9a55" />
          <path d="M480 250 L800 250 L800 268 L492 268 Z" fill="#5d8546" />

          {/* vegetasi */}
          <g fill="#3f6b39" opacity="0.9">
            <circle cx="560" cy="250" r="12" />
            <circle cx="585" cy="252" r="9" />
            <circle cx="690" cy="250" r="14" />
            <circle cx="720" cy="252" r="10" />
          </g>

          {/* panah angin */}
          <g className={`sal-angin ${kurangiGerak ? 'statis' : ''} ${arah}`} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${120 + i * 120}, ${205 - (i % 2) * 26})`}>
                <path d="M0 0 h34" stroke="#fdf6e3" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
                <path d="M28 -7 l10 7 -10 7" fill="none" stroke="#fdf6e3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
              </g>
            ))}
          </g>

          <text x="180" y="330" textAnchor="middle" className="sal-label">LAUT</text>
          <text x="650" y="330" textAnchor="middle" className="sal-label">DARAT</text>

          {tenang && (
            <text x="400" y="160" textAnchor="middle" className="sal-tenang">
              udara hampir tenang
            </text>
          )}

          <g className="sal-suhu">
            <text x="180" y="368" textAnchor="middle">{suhuLaut.toFixed(1)}°C</text>
            <text x="650" y="368" textAnchor="middle">{suhuDarat.toFixed(1)}°C</text>
          </g>
        </svg>

        <div className={`sal-lencana ${arah}`}>
          <span className="sal-lencana-label">
            {tenang ? 'Hampir tenang' : anginLaut ? 'Angin laut' : 'Angin darat'}
          </span>
          <span className="sal-lencana-arah">{tenang ? '—' : anginLaut ? 'laut → darat' : 'darat → laut'}</span>
        </div>
      </div>

      <div className="sal-kontrol">
        <button
          type="button"
          className="btn"
          onClick={() => setMain((v) => !v)}
          disabled={kurangiGerak}
          aria-pressed={main}
        >
          {main ? 'Jeda' : 'Putar 24 jam'}
        </button>

        <label className="sal-slider">
          <span className="sal-slider-label">Jam</span>
          <input
            type="range"
            min="0"
            max="23.75"
            step="0.25"
            value={jam}
            onChange={(e) => {
              setMain(false);
              setJam(Number(e.target.value));
            }}
            aria-valuetext={waktu}
          />
        </label>

        <output className="sal-jam" aria-label="Waktu simulasi">
          {waktu} WITA
        </output>
      </div>

      <div className="sal-baca">
        <dl>
          <div>
            <dt>Suhu darat</dt>
            <dd>{suhuDarat.toFixed(1)} °C</dd>
          </div>
          <div>
            <dt>Suhu laut</dt>
            <dd>{suhuLaut.toFixed(1)} °C</dd>
          </div>
          <div>
            <dt>Selisih</dt>
            <dd>{Math.abs(selisih).toFixed(1)} °C</dd>
          </div>
        </dl>
        <p className="sal-kesimpulan" aria-live="polite">
          {tenang
            ? 'Suhu darat dan laut hampir sama; angin nyaris berhenti.'
            : anginLaut
              ? 'Darat lebih panas, udara di atasnya naik, angin dari laut mengisi tempatnya.'
              : 'Laut lebih hangat, udara di atasnya naik, angin dari darat mengisi tempatnya.'}
        </p>
      </div>

      {kurangiGerak && (
        <p className="sal-nota">
          Animasi otomatis dimatikan karena perangkatmu meminta gerak minimal. Kamu tetap bisa
          menggeser slider jam.
        </p>
      )}

      <p className="sal-sr" aria-live="polite">
        {ringkasan}
      </p>
    </div>
  );
}
