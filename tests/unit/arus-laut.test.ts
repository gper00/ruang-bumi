import { describe, expect, it } from 'vitest';
import { ARUS, saringArus } from '../../src/lib/arusLaut';

describe('arusLaut', () => {
  it('punya arus hangat dan dingin', () => {
    expect(ARUS.find((a) => a.id === 'gulf-stream')?.jenis).toBe('hangat');
    expect(ARUS.find((a) => a.id === 'acc')?.jenis).toBe('dingin');
  });
  it('menyaring sesuai jenis', () => {
    expect(saringArus('dingin').every((a) => a.jenis === 'dingin')).toBe(true);
    expect(saringArus('hangat').every((a) => a.jenis === 'hangat')).toBe(true);
    expect(saringArus('semua').length).toBe(ARUS.length);
    expect(saringArus().length).toBe(ARUS.length);
  });
  it('setiap arus punya nama, arah, dan pengaruh', () => {
    for (const a of ARUS) {
      expect(a.nama.length).toBeGreaterThan(2);
      expect(a.arah.length).toBeGreaterThan(2);
      expect(a.pengaruh.length).toBeGreaterThan(10);
    }
  });
});
