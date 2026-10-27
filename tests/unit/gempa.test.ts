import { describe, expect, it } from 'vitest';
import {
  GESER_MAKS,
  KEDALAMAN_MAKS,
  KELAS_KEDALAMAN,
  goyanganPermukaan,
  jarakHiposentral,
  keadaanSesar,
  kelasKedalaman,
} from '../../src/lib/gempa';

describe('KELAS_KEDALAMAN', () => {
  it('menutupi 0–700 km tanpa celah', () => {
    expect(KELAS_KEDALAMAN[0].dari).toBe(0);
    expect(KELAS_KEDALAMAN[KELAS_KEDALAMAN.length - 1].sampai).toBe(KEDALAMAN_MAKS);
    for (let i = 1; i < KELAS_KEDALAMAN.length; i += 1) {
      expect(KELAS_KEDALAMAN[i].dari).toBe(KELAS_KEDALAMAN[i - 1].sampai);
    }
  });

  it('memakai batas USGS: 70 km dan 300 km', () => {
    expect(KELAS_KEDALAMAN.map((k) => k.sampai)).toEqual([70, 300, KEDALAMAN_MAKS]);
  });
});

describe('kelasKedalaman', () => {
  it('memetakan kedalaman ke kelas yang benar', () => {
    expect(kelasKedalaman(0).id).toBe('dangkal');
    expect(kelasKedalaman(69.9).id).toBe('dangkal');
    expect(kelasKedalaman(70).id).toBe('menengah');
    expect(kelasKedalaman(299).id).toBe('menengah');
    expect(kelasKedalaman(300).id).toBe('dalam');
    expect(kelasKedalaman(700).id).toBe('dalam');
  });

  it('membatasi nilai di luar rentang', () => {
    expect(kelasKedalaman(-40).id).toBe('dangkal');
    expect(kelasKedalaman(1500).id).toBe('dalam');
    expect(kelasKedalaman(Number.NaN).id).toBe('dangkal');
  });
});

describe('jarakHiposentral', () => {
  it('selalu lebih panjang daripada jarak episentrum', () => {
    expect(jarakHiposentral(30, 40)).toBeCloseTo(50, 5);
    expect(jarakHiposentral(0, 10)).toBeCloseTo(10, 5);
    expect(jarakHiposentral(100, 600)).toBeGreaterThan(600);
  });

  it('aman terhadap nilai negatif', () => {
    expect(jarakHiposentral(-5, -5)).toBe(0);
  });
});

describe('goyanganPermukaan', () => {
  it('melemah saat jarak atau kedalaman bertambah', () => {
    const dekat = goyanganPermukaan(20, 10);
    const jauh = goyanganPermukaan(120, 10);
    const dalam = goyanganPermukaan(20, 600);

    expect(dekat.nilai).toBeGreaterThan(jauh.nilai);
    expect(dekat.nilai).toBeGreaterThan(dalam.nilai);
    expect(dekat.label).toBe('kuat');
    expect(dalam.label).toBe('lemah');
  });

  it('selalu berada di antara 0 dan 1', () => {
    for (const [jarak, kedalaman] of [
      [0, 0],
      [10, 70],
      [150, 700],
    ]) {
      const hasil = goyanganPermukaan(jarak, kedalaman);
      expect(hasil.nilai).toBeGreaterThanOrEqual(0);
      expect(hasil.nilai).toBeLessThanOrEqual(1);
    }
  });
});

describe('keadaanSesar', () => {
  it('menyimpan energi secara kuadratik selama tersangkut', () => {
    const setengah = keadaanSesar(50, false);
    const penuh = keadaanSesar(100, false);

    expect(setengah.status).toBe('tersangkut');
    expect(setengah.menekuk).toBeCloseTo(0.5, 5);
    expect(setengah.geser).toBe(0);
    expect(penuh.energi).toBeCloseTo(1, 5);
    expect(penuh.energi).toBeGreaterThan(setengah.energi * 2);
  });

  it('meluncur hanya jika regangan sudah penuh dan dilepas', () => {
    const tidakDilepas = keadaanSesar(100, false);
    expect(tidakDilepas.status).toBe('tersangkut');
    expect(tidakDilepas.menekuk).toBeCloseTo(1, 5);

    const dilepas = keadaanSesar(100, true);
    expect(dilepas.status).toBe('meluncur');
    expect(dilepas.menekuk).toBe(0);
    expect(dilepas.geser).toBeCloseTo(GESER_MAKS, 5);
    expect(dilepas.energi).toBe(0);
    expect(dilepas.ringkas).toMatch(/gelombang seismik/i);

    const terlaluDini = keadaanSesar(80, true);
    expect(terlaluDini.status).toBe('tersangkut');
  });

  it('membatasi regangan di luar rentang', () => {
    expect(keadaanSesar(-30, false).menekuk).toBe(0);
    expect(keadaanSesar(500, false).menekuk).toBe(1);
    expect(keadaanSesar(Number.NaN, false).menekuk).toBe(0);
  });

  it('mengubah kalimat ringkas sesuai tahap regangan', () => {
    expect(keadaanSesar(10, false).ringkas).toMatch(/baru mulai melengkung/i);
    expect(keadaanSesar(60, false).ringkas).toMatch(/menumpuk/i);
    expect(keadaanSesar(95, false).ringkas).toMatch(/hampir penuh/i);
  });
});
