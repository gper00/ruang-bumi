import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const { data, isi } = bacaMdx('topik/laut/ocean.mdx');

describe('topik laut/ocean', () => {
  it('memakai pertanyaan baru dan sumber resmi', () => {
    expect(String(data.pertanyaan)).toMatch(/zona/i);
    expect(data.sumber).toEqual(expect.arrayContaining(['noaa-layers-ocean', 'noaa-light-ocean']));
  });
  it('tidak memakai MapView dan tidak memuat istilah karangan', () => {
    expect(isi).not.toMatch(/<MapView/);
    expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
  });
  it('punya satu Figure bersumber dan tiga soal kuis', () => {
    expect(isi).toMatch(/<Figure[^>]*source="noaa-layers-ocean"/);
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
    expect((isi.match(/\bbenar:/g) ?? []).length).toBe(3);
  });
});
