import { describe, expect, it } from 'vitest';
import {
  BATAS_FASE,
  PERBANDINGAN,
  PILIHAN,
  RENTANG_ANOMALI,
  dampakIndonesia,
  faseEnso,
  formatBujur,
  kejelasanAnomali,
  kekuatanAngin,
  labelAnomali,
  labelAngin,
  porsiAngin,
  pusatHangat,
  pusatHujan,
} from '../../src/lib/enso';

describe('konstanta', () => {
  it('slider anomali memakai rentang −2 sampai +2 °C dengan langkah 0,1', () => {
    expect(RENTANG_ANOMALI.min).toBe(-2);
    expect(RENTANG_ANOMALI.max).toBe(2);
    expect(RENTANG_ANOMALI.langkah).toBe(0.1);
  });

  it('batas fase mengikuti ambang ONI NOAA', () => {
    expect(BATAS_FASE).toBe(0.5);
  });

  it('pilihan fase memakai nilai di dalam rentang dan id unik', () => {
    expect(PILIHAN).toHaveLength(3);
    expect(new Set(PILIHAN.map((p) => p.id)).size).toBe(3);
    for (const p of PILIHAN) {
      expect(p.nilai).toBeGreaterThanOrEqual(RENTANG_ANOMALI.min);
      expect(p.nilai).toBeLessThanOrEqual(RENTANG_ANOMALI.max);
    }
    expect(PILIHAN.find((p) => p.id === 'netral')?.nilai).toBe(0);
  });
});

describe('faseEnso', () => {
  it('membagi anomali di ambang +0,5 dan −0,5', () => {
    expect(faseEnso(0.4).id).toBe('netral');
    expect(faseEnso(-0.4).id).toBe('netral');
    expect(faseEnso(0.5).id).toBe('el-nino');
    expect(faseEnso(-0.5).id).toBe('la-nina');
  });

  it('menamai fase sesuai istilah yang dipakai artikel', () => {
    expect(faseEnso(1.5).nama).toBe('El Niño');
    expect(faseEnso(-1.5).nama).toBe('La Niña');
    expect(faseEnso(0).nama).toBe('Netral');
    expect(faseEnso(1.5).ringkas).toMatch(/melemah/i);
    expect(faseEnso(-1.5).ringkas).toMatch(/kencang/i);
  });

  it('membatasi nilai di luar rentang dan nilai cacat', () => {
    expect(faseEnso(40).id).toBe('el-nino');
    expect(faseEnso(-40).id).toBe('la-nina');
    expect(faseEnso(Number.NaN).id).toBe('netral');
  });
});

describe('kekuatanAngin', () => {
  it('1,0 berarti seperti tahun netral, El Niño menurunkan, La Niña menaikkan', () => {
    expect(kekuatanAngin(0)).toBeCloseTo(1, 5);
    expect(kekuatanAngin(1.5)).toBeLessThan(1);
    expect(kekuatanAngin(-1.5)).toBeGreaterThan(1);
  });

  it('selalu berada di antara 0,3 dan 1,7', () => {
    for (const a of [-4, -2, 0, 1, 2, 6, Number.NaN]) {
      const nilai = kekuatanAngin(a);
      expect(nilai).toBeGreaterThanOrEqual(0.3);
      expect(nilai).toBeLessThanOrEqual(1.7);
    }
  });

  it('menurun monoton saat anomali naik', () => {
    let sebelum = Infinity;
    for (let a = RENTANG_ANOMALI.min; a <= RENTANG_ANOMALI.max; a += 0.1) {
      const nilai = kekuatanAngin(a);
      expect(nilai).toBeLessThanOrEqual(sebelum + 1e-9);
      sebelum = nilai;
    }
  });

  it('label angin mengikuti ambang kekuatan', () => {
    expect(labelAngin(0)).toBe('normal');
    expect(labelAngin(1.5)).toBe('melemah');
    expect(labelAngin(-1.5)).toBe('lebih kencang');
  });
});

describe('pusatHangat dan pusatHujan', () => {
  it('netral di 150°BT, El Niño menyeret ke timur, La Niña ke barat', () => {
    expect(pusatHangat(0)).toBe(150);
    expect(pusatHangat(2)).toBe(205);
    expect(pusatHangat(-2)).toBe(125);
  });

  it('naik monoton dan tetap di dalam jendela peta', () => {
    let sebelum = 0;
    for (let a = RENTANG_ANOMALI.min; a <= RENTANG_ANOMALI.max; a += 0.1) {
      const lon = pusatHangat(a);
      expect(lon).toBeGreaterThanOrEqual(125);
      expect(lon).toBeLessThanOrEqual(205);
      expect(lon).toBeGreaterThanOrEqual(sebelum - 1e-9);
      sebelum = lon;
    }
  });

  it('pita hujan mengikuti pusat air hangat', () => {
    for (const a of [-2, -0.5, 0, 0.5, 2]) {
      expect(pusatHujan(a)).toBe(pusatHangat(a));
    }
  });

  it('kejelasan anomali berada di antara 0 dan 1', () => {
    expect(kejelasanAnomali(0)).toBe(0);
    expect(kejelasanAnomali(2)).toBe(1);
    expect(kejelasanAnomali(-2)).toBe(1);
    expect(kejelasanAnomali(1)).toBe(0.5);
  });
});

describe('dampakIndonesia', () => {
  it('El Niño menurunkan hujan dan memanjangkan kemarau', () => {
    const hasil = dampakIndonesia(1);
    expect(hasil.id).toBe('kering');
    expect(hasil.label).toBe('Curah hujan menurun');
    expect(hasil.ringkas).toMatch(/Juni/);
    expect(hasil.ringkas).toMatch(/kemarau/i);
  });

  it('La Niña menaikkan hujan sekitar 20–40% seperti catatan BMKG', () => {
    const hasil = dampakIndonesia(-1);
    expect(hasil.id).toBe('basah');
    expect(hasil.ringkas).toMatch(/20–40%/);
    expect(hasil.ringkas).toMatch(/banjir/);
  });

  it('anomali kecil dianggap sekitar normal', () => {
    expect(dampakIndonesia(0).id).toBe('normal');
    expect(dampakIndonesia(0.3).id).toBe('normal');
    expect(dampakIndonesia(-0.3).id).toBe('normal');
    expect(dampakIndonesia(Number.NaN).id).toBe('normal');
  });
});

describe('PERBANDINGAN', () => {
  it('berisi dua ujung, satu El Niño dan satu La Niña', () => {
    expect(PERBANDINGAN).toHaveLength(2);
    expect(PERBANDINGAN.map((p) => p.id)).toEqual(['el-nino', 'la-nina']);
    expect(new Set(PERBANDINGAN.map((p) => p.judul)).size).toBe(2);
  });

  it('memakai nilai di ujung rentang yang masih menghasilkan fase kuat', () => {
    const [elNino, laNina] = PERBANDINGAN;
    expect(elNino.anomali).toBe(RENTANG_ANOMALI.max);
    expect(laNina.anomali).toBe(RENTANG_ANOMALI.min);
    expect(faseEnso(elNino.anomali).id).toBe('el-nino');
    expect(faseEnso(laNina.anomali).id).toBe('la-nina');
    expect(elNino.judul).toMatch(/kuat/i);
    expect(laNina.judul).toMatch(/kuat/i);
  });

  it('menghasilkan posisi pita hujan dan dampak yang berbeda', () => {
    const [elNino, laNina] = PERBANDINGAN;
    expect(pusatHujan(elNino.anomali)).toBeGreaterThan(pusatHujan(laNina.anomali));
    expect(dampakIndonesia(elNino.anomali).id).toBe('kering');
    expect(dampakIndonesia(laNina.anomali).id).toBe('basah');
  });
});

describe('porsiAngin', () => {
  it('memetakan rentang 0,3–1,7 ke 0–1', () => {
    expect(porsiAngin(0.3)).toBe(0);
    expect(porsiAngin(1.7)).toBe(1);
    expect(porsiAngin(1)).toBeCloseTo(0.5, 5);
  });

  it('membatasi nilai di luar rentang', () => {
    expect(porsiAngin(0)).toBe(0);
    expect(porsiAngin(-3)).toBe(0);
    expect(porsiAngin(5)).toBe(1);
  });

  it('El Niño kuat memberi panah paling tipis, La Niña kuat paling tebal', () => {
    const [elNino, laNina] = PERBANDINGAN;
    expect(porsiAngin(kekuatanAngin(elNino.anomali))).toBeLessThan(
      porsiAngin(kekuatanAngin(laNina.anomali)),
    );
    expect(porsiAngin(kekuatanAngin(laNina.anomali))).toBe(1);
  });
});

describe('formatBujur dan labelAnomali', () => {
  it('menulis bujur timur dengan °BT dan barat dengan °BB', () => {
    expect(formatBujur(150)).toBe('150°BT');
    expect(formatBujur(180)).toBe('180°BT');
    expect(formatBujur(205)).toBe('155°BB');
  });

  it('menulis anomali gaya Indonesia', () => {
    expect(labelAnomali(0)).toBe('0,0 °C');
    expect(labelAnomali(1.5)).toBe('+1,5 °C');
    expect(labelAnomali(-0.4)).toBe('−0,4 °C');
  });
});
