import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const { data, isi } = bacaMdx('topik/penutup/menghubungkan.mdx');

describe('topik penutup/menghubungkan', () => {
  it('memakai sumber sistem Bumi', () => {
    expect(data.sumber).toEqual(expect.arrayContaining(['nasa-earth-system']));
  });
  it('tidak memakai MapView dan bebas istilah karangan', () => {
    expect(isi).not.toMatch(/<MapView/);
    expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
  });
  it('punya tiga soal kuis', () => {
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
  });
});
