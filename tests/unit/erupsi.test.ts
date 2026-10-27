import { describe, expect, it } from 'vitest';
import {
  RENTANG,
  bentukGunung,
  gayaErupsi,
  gasTerkunci,
  labelGas,
  labelKekentalan,
} from '../../src/lib/erupsi';

describe('RENTANG', () => {
  it('memakai skala 0–100 dengan langkah 5', () => {
    expect(RENTANG.min).toBe(0);
    expect(RENTANG.max).toBe(100);
    expect(RENTANG.langkah).toBe(5);
  });
});

describe('gasTerkunci', () => {
  it('selalu berada di antara 0 dan 1', () => {
    for (const [v, g] of [
      [0, 0],
      [0, 100],
      [100, 0],
      [100, 100],
      [55, 45],
      [-30, 250],
      [Number.NaN, 40],
    ]) {
      const nilai = gasTerkunci(v, g);
      expect(nilai).toBeGreaterThanOrEqual(0);
      expect(nilai).toBeLessThanOrEqual(1);
    }
  });

  it('naik saat kadar gas ditambah, pada kekentalan berapa pun', () => {
    for (const v of [0, 30, 65, 100]) {
      const sedikit = gasTerkunci(v, 20);
      const banyak = gasTerkunci(v, 80);
      expect(banyak).toBeGreaterThanOrEqual(sedikit);
    }
  });

  it('naik saat magma makin kental, pada kadar gas berapa pun', () => {
    for (const g of [0, 40, 100]) {
      expect(gasTerkunci(90, g)).toBeGreaterThanOrEqual(gasTerkunci(10, g));
    }
  });

  it('kekentalan lebih menentukan daripada gas: gas banyak di magma encer tetap rendah', () => {
    expect(gasTerkunci(0, 100)).toBeLessThan(gasTerkunci(60, 50));
    expect(gasTerkunci(100, 0)).toBe(0);
  });
});

describe('gayaErupsi', () => {
  it('magma encer dengan gas sedikit menghasilkan letusan efusif', () => {
    const hasil = gayaErupsi(20, 30);
    expect(hasil.id).toBe('efusif');
    expect(hasil.nama).toBe('Efusif');
    expect(hasil.ringkas).toMatch(/lava mengalir tenang/i);
    expect(hasil.keluaran).toMatch(/lava/i);
  });

  it('kekentalan dan gas sama-sama tinggi menghasilkan letusan eksplosif', () => {
    const hasil = gayaErupsi(100, 100);
    expect(hasil.id).toBe('eksplosif');
    expect(hasil.nama).toBe('Eksplosif');
    expect(hasil.ringkas).toMatch(/tef?ra/i);
  });

  it('tanpa gas tidak pernah meledak, berapa pun kekentalannya', () => {
    expect(gayaErupsi(100, 0).id).toBe('efusif');
    expect(gayaErupsi(0, 0).id).toBe('efusif');
  });

  it('melewati gaya transisi saat gas ditambah pada magma kental', () => {
    const urut = [0, 40, 70, 100].map((g) => gayaErupsi(100, g).id);
    expect(urut).toEqual(['efusif', 'transisi', 'eksplosif', 'eksplosif']);
  });

  it('selalu mengembalikan salah satu dari tiga gaya', () => {
    const id = gayaErupsi(Number.NaN, Number.NaN).id;
    expect(['efusif', 'transisi', 'eksplosif']).toContain(id);
  });
});

describe('bentukGunung', () => {
  it('magma encer menjadi perisai yang landai', () => {
    const hasil = bentukGunung(10);
    expect(hasil.id).toBe('perisai');
    expect(hasil.lereng).toBeLessThan(12);
    expect(hasil.lerengNama).toBe('landai');
    expect(hasil.ringkas).toMatch(/menyebar jauh/i);
  });

  it('kekentalan menengah menjadi kerucut lapis, ujung atas menjadi kubah lava', () => {
    expect(bentukGunung(34).id).toBe('perisai');
    expect(bentukGunung(35).id).toBe('kerucut');
    expect(bentukGunung(69).id).toBe('kerucut');
    expect(bentukGunung(70).id).toBe('kubah');
  });

  it('lereng bertambah monoton dari 4 sampai 34 derajat', () => {
    let sebelum = 0;
    for (let v = 0; v <= 100; v += 5) {
      const lereng = bentukGunung(v).lereng;
      expect(lereng).toBeGreaterThanOrEqual(sebelum);
      expect(lereng).toBeGreaterThanOrEqual(4);
      expect(lereng).toBeLessThanOrEqual(34);
      sebelum = lereng;
    }
    expect(bentukGunung(100).lerengNama).toBe('curam');
  });

  it('membatasi nilai di luar rentang', () => {
    expect(bentukGunung(-50).lereng).toBe(4);
    expect(bentukGunung(400).lereng).toBe(34);
    expect(bentukGunung(Number.NaN).id).toBe('perisai');
  });
});

describe('label ke slider', () => {
  it('label kekentalan menyebut basalt di ujung encer dan riolit di ujung kental', () => {
    expect(labelKekentalan(0)).toMatch(/basalt/);
    expect(labelKekentalan(100)).toMatch(/riolit/);
    expect(labelKekentalan(50)).toBe('sedang');
  });

  it('label gas memakai tiga tingkat', () => {
    expect(labelGas(10)).toBe('rendah');
    expect(labelGas(50)).toBe('sedang');
    expect(labelGas(95)).toBe('tinggi');
  });
});
