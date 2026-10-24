import { describe, expect, it } from 'vitest';
import { ZONA, zonaPadaKedalaman } from '../../src/lib/zonaLaut';

describe('zonaPadaKedalaman', () => {
  it('memetakan batas zona', () => {
    expect(zonaPadaKedalaman(0).id).toBe('fotik');
    expect(zonaPadaKedalaman(199).id).toBe('fotik');
    expect(zonaPadaKedalaman(200).id).toBe('senja');
    expect(zonaPadaKedalaman(999).id).toBe('senja');
    expect(zonaPadaKedalaman(1000).id).toBe('gelap');
    expect(zonaPadaKedalaman(4000).id).toBe('gelap');
  });
  it('menangani nilai di luar rentang', () => {
    expect(zonaPadaKedalaman(-50).id).toBe('fotik');
    expect(zonaPadaKedalaman(Number.NaN).id).toBe('fotik');
  });
  it('menyediakan tiga zona berurutan', () => {
    expect(ZONA.map((z) => z.id)).toEqual(['fotik', 'senja', 'gelap']);
  });
});
