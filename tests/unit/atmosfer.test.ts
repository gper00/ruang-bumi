import { describe, expect, it } from 'vitest';
import {
  BATAS_ATAS,
  LAPISAN,
  gradienLapisan,
  lapisanPada,
  profilSuhu,
  suhuPada,
} from '../../src/lib/atmosfer';

describe('LAPISAN', () => {
  it('menutupi 0–100 km tanpa celah dan berurutan', () => {
    expect(LAPISAN[0].dari).toBe(0);
    expect(LAPISAN[LAPISAN.length - 1].sampai).toBe(BATAS_ATAS);
    for (let i = 1; i < LAPISAN.length; i += 1) {
      expect(LAPISAN[i].dari).toBe(LAPISAN[i - 1].sampai);
    }
  });

  it('memberi arah suhu yang bergantian', () => {
    expect(LAPISAN.map((l) => l.arah)).toEqual(['turun', 'naik', 'turun', 'naik']);
  });

  it('menyebut proses pemanas dan ringkasan untuk tiap lapisan', () => {
    for (const lapisan of LAPISAN) {
      expect(lapisan.pemanas.length, lapisan.id).toBeGreaterThan(5);
      expect(lapisan.ringkas.length, lapisan.id).toBeGreaterThan(60);
    }
  });
});

describe('suhuPada', () => {
  it('mengikuti titik tetap standar', () => {
    expect(suhuPada(0)).toBeCloseTo(15, 5);
    expect(suhuPada(11)).toBeCloseTo(-56.5, 5);
    expect(suhuPada(15)).toBeCloseTo(-56.5, 5); // lapisan isotermal 11–20 km
    expect(suhuPada(50)).toBeCloseTo(-2.5, 5);
    expect(suhuPada(85)).toBeCloseTo(-86, 5);
    expect(suhuPada(100)).toBeCloseTo(-78, 5);
  });

  it('turun 6,5 °C per km di troposfer', () => {
    expect(suhuPada(1) - suhuPada(0)).toBeCloseTo(-6.5, 5);
    expect(suhuPada(5)).toBeCloseTo(15 - 6.5 * 5, 5);
  });

  it('paling dingin di mesopause, bukan di puncak jendela', () => {
    const titikTerdingin = profilSuhu(1).reduce((a, b) => (b.suhu < a.suhu ? b : a));
    expect(titikTerdingin.km).toBe(85);
    expect(suhuPada(85)).toBeLessThan(suhuPada(70));
    expect(suhuPada(85)).toBeLessThan(suhuPada(100));
  });

  it('membatasi nilai di luar rentang', () => {
    expect(suhuPada(-20)).toBeCloseTo(15, 5);
    expect(suhuPada(500)).toBeCloseTo(suhuPada(BATAS_ATAS), 5);
    expect(suhuPada(Number.NaN)).toBeCloseTo(15, 5);
  });
});

describe('lapisanPada', () => {
  it('memetakan ketinggian ke lapisan yang benar', () => {
    expect(lapisanPada(0).id).toBe('troposfer');
    expect(lapisanPada(10.9).id).toBe('troposfer');
    expect(lapisanPada(11).id).toBe('stratosfer');
    expect(lapisanPada(49).id).toBe('stratosfer');
    expect(lapisanPada(50).id).toBe('mesosfer');
    expect(lapisanPada(84.9).id).toBe('mesosfer');
    expect(lapisanPada(85).id).toBe('termosfer');
    expect(lapisanPada(100).id).toBe('termosfer');
    expect(lapisanPada(400).id).toBe('termosfer');
  });
});

describe('profilSuhu', () => {
  it('memberi sampel berurutan dan berakhir di batas atas', () => {
    const titik = profilSuhu(5);
    expect(titik[0].km).toBe(0);
    expect(titik[titik.length - 1].km).toBe(BATAS_ATAS);
    for (let i = 1; i < titik.length; i += 1) {
      expect(titik[i].km).toBeGreaterThan(titik[i - 1].km);
    }
  });

  it('memakai langkah 1 km bila langkah tidak masuk akal', () => {
    expect(profilSuhu(0)[1].km).toBe(1);
    expect(profilSuhu(-3)[1].km).toBe(1);
  });
});

describe('gradienLapisan', () => {
  it('menyebut arah perubahan untuk tiap lapisan', () => {
    expect(gradienLapisan('troposfer')).toMatch(/turun/);
    expect(gradienLapisan('stratosfer')).toMatch(/naik/);
    expect(gradienLapisan('mesosfer')).toMatch(/turun/);
    expect(gradienLapisan('termosfer')).toMatch(/naik/);
  });
});
