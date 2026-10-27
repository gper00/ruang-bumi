import { describe, expect, it } from 'vitest';
import {
  keadaanHutanGugur,
  keadaanStepa,
  keadaanTaiga,
  keadaanTundra,
  musimUtara,
} from '../../src/lib/bioma';

const tingkat = { rendah: 0, sedang: 1, tinggi: 2 } as const;

describe('musimUtara', () => {
  it('memetakan bulan ke empat musim belahan utara', () => {
    expect(musimUtara(0)).toBe('dingin');
    expect(musimUtara(1)).toBe('dingin');
    expect(musimUtara(2)).toBe('semi');
    expect(musimUtara(4)).toBe('semi');
    expect(musimUtara(5)).toBe('panas');
    expect(musimUtara(7)).toBe('panas');
    expect(musimUtara(8)).toBe('gugur');
    expect(musimUtara(10)).toBe('gugur');
    expect(musimUtara(11)).toBe('dingin');
  });

  it('menerima bulan di luar rentang dan nilai pecahan', () => {
    expect(musimUtara(12)).toBe('dingin');
    expect(musimUtara(-1)).toBe('dingin');
    expect(musimUtara(6.4)).toBe('panas');
  });
});

describe('keadaanStepa', () => {
  it('menurunkan tutupan pohon saat api atau penggembalaan bekerja', () => {
    const alami = keadaanStepa('alami');
    const gembala = keadaanStepa('gembala');
    const api = keadaanStepa('kebakaran');

    expect(tingkat[alami.tutupanPohon]).toBeGreaterThan(tingkat[gembala.tutupanPohon]);
    expect(tingkat[gembala.tutupanPohon]).toBeGreaterThan(tingkat[api.tutupanPohon]);
    expect(alami.pohonMuda).toBeGreaterThan(api.pohonMuda);
  });

  it('menjelaskan peran rumput dan gangguan', () => {
    expect(keadaanStepa('kebakaran').ringkas).toMatch(/api/i);
    expect(keadaanStepa('kebakaran').ringkas).toMatch(/bawah tanah/i);
    expect(keadaanStepa('gembala').ringkas).toMatch(/pucuk/i);
    expect(keadaanStepa('alami').ringkas).toMatch(/hutan/i);
  });
});

describe('keadaanHutanGugur', () => {
  it('mengikuti siklus daun sepanjang tahun', () => {
    expect(keadaanHutanGugur(0).daun).toBe('tidak-ada');
    expect(keadaanHutanGugur(0).dorman).toBe(true);
    expect(keadaanHutanGugur(3).daun).toBe('tunas');
    expect(keadaanHutanGugur(3).dorman).toBe(false);
    expect(keadaanHutanGugur(6).daun).toBe('penuh');
    expect(keadaanHutanGugur(9).daun).toBe('berwarna');
  });

  it('menjelaskan dormansi pada musim dingin', () => {
    expect(keadaanHutanGugur(0).ringkas).toMatch(/dorman/i);
  });
});

describe('keadaanTaiga', () => {
  it('mempertahankan daun jarum di kedua musim', () => {
    expect(keadaanTaiga('panas', 'jarum').berdaun).toBe(true);
    expect(keadaanTaiga('dingin', 'jarum').berdaun).toBe(true);
  });

  it('menggugurkan daun lebar saat dingin', () => {
    expect(keadaanTaiga('panas', 'lebar').berdaun).toBe(true);
    expect(keadaanTaiga('dingin', 'lebar').berdaun).toBe(false);
  });

  it('menandai salju hanya pada musim dingin', () => {
    expect(keadaanTaiga('dingin', 'lebar').salju).toBe(true);
    expect(keadaanTaiga('panas', 'lebar').salju).toBe(false);
  });
});

describe('keadaanTundra', () => {
  it('menebal di pertengahan tahun dan membeku di awal tahun', () => {
    const januari = keadaanTundra(0);
    const april = keadaanTundra(3);
    const juli = keadaanTundra(6);

    expect(januari.beku).toBe(true);
    expect(januari.kedalaman).toBeLessThan(april.kedalaman);
    expect(april.kedalaman).toBeLessThan(juli.kedalaman);
    expect(juli.kedalaman).toBeGreaterThan(0.9);
  });

  it('memberi ringkasan yang sesuai dengan ketebalan lapisan aktif', () => {
    expect(keadaanTundra(0).ringkas).toMatch(/membeku/i);
    expect(keadaanTundra(6).ringkas).toMatch(/permafrost|lapisan aktif/i);
  });
});
