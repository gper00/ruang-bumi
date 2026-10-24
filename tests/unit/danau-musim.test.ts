import { describe, expect, it } from 'vitest';
import { MUSIM, keadaanDanau } from '../../src/lib/danauMusim';

describe('keadaanDanau', () => {
  it('musim panas berlapis dan dasar miskin oksigen', () => {
    expect(keadaanDanau('panas')).toMatchObject({
      berlapis: true, mencampur: false, es: false, oksigenDasar: 'rendah',
    });
  });
  it('pembalikan semi dan gugur mencampur lapisan', () => {
    expect(keadaanDanau('semi')).toMatchObject({ berlapis: false, mencampur: true });
    expect(keadaanDanau('gugur')).toMatchObject({ berlapis: false, mencampur: true });
  });
  it('musim dingin berlapis es', () => {
    expect(keadaanDanau('dingin')).toMatchObject({ es: true, mencampur: false });
  });
  it('menyediakan empat musim berlabel', () => {
    expect(MUSIM.map((m) => m.id)).toEqual(['semi', 'panas', 'gugur', 'dingin']);
    expect(MUSIM.every((m) => m.label.length > 2)).toBe(true);
  });
});
