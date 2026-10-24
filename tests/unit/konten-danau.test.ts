import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const { data, isi } = bacaMdx('topik/daratan/danau.mdx');

describe('topik daratan/danau', () => {
  it('memakai pertanyaan danau dan sumber resmi', () => {
    expect(String(data.pertanyaan)).toMatch(/danau/i);
    expect(data.sumber).toEqual(expect.arrayContaining(['usgs-lakes-stratification']));
  });
  it('tidak memakai MapView dan bebas istilah karangan', () => {
    expect(isi).not.toMatch(/<MapView/);
    expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
  });
  it('punya tiga soal kuis', () => {
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
  });
});
