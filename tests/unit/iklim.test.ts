import { describe, expect, it } from 'vitest';
import {
  HARI_PER_TAHUN,
  JUMLAH_TAHUN,
  TAHUN_AKHIR,
  TAHUN_AWAL,
  deretHarian,
  deretTahunan,
  labelTanggal,
  normalTahunan,
  rataRataIklim,
  rataRataTahunan,
  ringkasTahun,
  suhuHarian,
  tahunValid,
  trenIklim,
} from '../../src/lib/iklim';

describe('model iklim', () => {
  it('memakai periode 30 tahun dan 365 hari', () => {
    expect(JUMLAH_TAHUN).toBe(30);
    expect(TAHUN_AKHIR - TAHUN_AWAL + 1).toBe(JUMLAH_TAHUN);
    expect(deretHarian(TAHUN_AKHIR)).toHaveLength(HARI_PER_TAHUN);
    expect(deretTahunan()).toHaveLength(JUMLAH_TAHUN);
  });

  it('deterministik dan menghasilkan suhu yang masuk akal', () => {
    expect(suhuHarian(2010, 100)).toBe(suhuHarian(2010, 100));
    expect(suhuHarian(2010, 100)).not.toBe(suhuHarian(2010, 101));

    for (const tahun of [TAHUN_AWAL, 2010, TAHUN_AKHIR]) {
      for (const hari of [1, 90, 180, 270, 365]) {
        const nilai = suhuHarian(tahun, hari);
        expect(nilai).toBeGreaterThan(20);
        expect(nilai).toBeLessThan(35);
      }
    }
  });

  it('normal harian adalah rata-rata 30 tahun untuk hari yang sama', () => {
    const normal = normalTahunan();
    for (const hari of [1, 60, 200, 365]) {
      let jumlah = 0;
      for (let tahun = TAHUN_AWAL; tahun <= TAHUN_AKHIR; tahun += 1) {
        jumlah += suhuHarian(tahun, hari);
      }
      expect(normal[hari - 1]).toBeCloseTo(jumlah / JUMLAH_TAHUN, 10);
    }
  });

  it('rata-rata tahunan cocok dengan rata-rata deret hariannya', () => {
    const harian = deretHarian(2005);
    const langsung = harian.reduce((a, b) => a + b, 0) / harian.length;
    expect(rataRataTahunan(2005)).toBeCloseTo(langsung, 10);
  });

  it('iklim lebih hangat di ujung periode, tetapi tetap lebih halus daripada cuaca', () => {
    expect(trenIklim()).toBeGreaterThan(0.4);
    expect(trenIklim()).toBeLessThan(1.5);
    expect(rataRataTahunan(TAHUN_AKHIR)).toBeGreaterThan(rataRataTahunan(TAHUN_AWAL));

    const ringkas = ringkasTahun(TAHUN_AKHIR);
    // Satu hari bisa menyimpang lebih jauh daripada selisih rata-rata antartahun.
    expect(ringkas.simpanganHarian).toBeGreaterThan(1);
    expect(ringkas.simpanganHarian).toBeLessThan(5);
  });

  it('ringkasan menghitung anomali terhadap rata-rata 30 tahun', () => {
    const ringkas = ringkasTahun(2025);
    expect(ringkas.normal).toBeCloseTo(rataRataIklim(), 10);
    expect(ringkas.anomali).toBeCloseTo(ringkas.rataRata - rataRataIklim(), 10);
    expect(ringkas.terpanas).toBeGreaterThanOrEqual(ringkas.rataRata);
    expect(ringkas.terdingin).toBeLessThanOrEqual(ringkas.rataRata);
    expect(ringkas.hariTerpanas).toBeGreaterThanOrEqual(1);
    expect(ringkas.hariTerpanas).toBeLessThanOrEqual(HARI_PER_TAHUN);
  });

  it('membatasi tahun di luar periode dan memberi label tanggal', () => {
    expect(tahunValid(1900)).toBe(TAHUN_AWAL);
    expect(tahunValid(3000)).toBe(TAHUN_AKHIR);
    expect(labelTanggal(1)).toBe('1 Januari');
    expect(labelTanggal(365)).toBe('31 Desember');
  });
});
