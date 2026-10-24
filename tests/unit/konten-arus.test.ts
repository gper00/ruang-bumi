import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const { data, isi } = bacaMdx('topik/laut/arus.mdx');

describe('topik laut/arus', () => {
  it('memakai pertanyaan arus dan sumber resmi', () => {
    expect(String(data.pertanyaan)).toMatch(/arus/i);
    expect(data.sumber).toEqual(
      expect.arrayContaining(['noaa-ocean-currents', 'noaa-gyre', 'noaa-thermohaline']),
    );
  });
  it('tidak memakai MapView dan bebas istilah karangan', () => {
    expect(isi).not.toMatch(/<MapView/);
    expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
  });
  it('punya tiga soal kuis', () => {
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
  });
});
