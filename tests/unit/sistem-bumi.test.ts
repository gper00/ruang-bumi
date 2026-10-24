import { describe, expect, it } from 'vitest';
import { ALIRAN, SIMPUL, aliranDari } from '../../src/lib/sistemBumi';

describe('sistemBumi', () => {
  it('setiap aliran merujuk simpul yang ada', () => {
    const id = new Set(SIMPUL.map((s) => s.id));
    for (const a of ALIRAN) {
      expect(id.has(a.dari), a.label).toBe(true);
      expect(id.has(a.ke), a.label).toBe(true);
    }
  });
  it('setiap aliran punya label, topik, dan contoh', () => {
    for (const a of ALIRAN) {
      expect(a.label.length).toBeGreaterThan(2);
      expect(a.topik.startsWith('/topik/')).toBe(true);
      expect(a.contoh.length).toBeGreaterThan(10);
    }
  });
  it('aliranDari mengembalikan aliran yang terhubung', () => {
    const hasil = aliranDari('laut');
    expect(hasil.length).toBeGreaterThan(0);
    expect(hasil.every((a) => a.dari === 'laut' || a.ke === 'laut')).toBe(true);
  });
});
