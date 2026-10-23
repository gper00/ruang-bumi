import { useMemo, useState } from 'react';

export interface Soal {
  tanya: string;
  opsi: string[];
  benar: number;
  penjelasan: string;
}

interface Props {
  soal: Soal[];
  judul?: string;
}

export default function Quiz({ soal, judul = 'Kuis cepat' }: Props) {
  const [jawaban, setJawaban] = useState<Record<number, number>>({});
  const [dibuka, setDibuka] = useState<Record<number, boolean>>({});

  const terjawab = Object.keys(jawaban).length;
  const benar = useMemo(
    () => soal.reduce((total, item, i) => (jawaban[i] === item.benar ? total + 1 : total), 0),
    [jawaban, soal],
  );
  const selesai = terjawab === soal.length;

  function pilih(index: number, opsi: number) {
    setJawaban((prev) => ({ ...prev, [index]: opsi }));
    setDibuka((prev) => ({ ...prev, [index]: true }));
  }

  function ulangi() {
    setJawaban({});
    setDibuka({});
  }

  return (
    <section className="quiz" aria-labelledby="quiz-judul">
      <header className="quiz-head">
        <h2 id="quiz-judul">{judul}</h2>
        <p className="quiz-progress" aria-live="polite">
          {terjawab} dari {soal.length} soal dijawab
          {selesai ? ` · ${benar} benar` : ''}
        </p>
      </header>

      <ol className="quiz-list">
        {soal.map((item, index) => {
          const dipilih = jawaban[index];
          const sudah = dibuka[index] && dipilih !== undefined;
          const tepat = dipilih === item.benar;
          return (
            <li key={item.tanya} className="quiz-item">
              <fieldset>
                <legend>
                  <span className="quiz-nomor">{String(index + 1).padStart(2, '0')}</span>
                  {item.tanya}
                </legend>
                <div className="quiz-opsi">
                  {item.opsi.map((opsi, oi) => {
                    const iniDipilih = dipilih === oi;
                    const iniBenar = sudah && oi === item.benar;
                    return (
                      <button
                        key={opsi}
                        type="button"
                        className={`quiz-opsi-btn${iniDipilih ? ' dipilih' : ''}${
                          iniBenar ? ' benar' : ''
                        }${iniDipilih && !tepat ? ' salah' : ''}`}
                        aria-pressed={iniDipilih}
                        onClick={() => pilih(index, oi)}
                      >
                        <span className="quiz-huruf">{String.fromCharCode(65 + oi)}</span>
                        <span>{opsi}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              {sudah && (
                <p className={`quiz-feedback ${tepat ? 'tepat' : 'belum'}`} aria-live="polite">
                  <strong>{tepat ? 'Benar.' : `Belum tepat. Jawabannya ${String.fromCharCode(65 + item.benar)}.`}</strong>{' '}
                  {item.penjelasan}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {selesai && (
        <button type="button" className="btn quiz-reset" onClick={ulangi}>
          Ulangi kuis
        </button>
      )}
    </section>
  );
}
