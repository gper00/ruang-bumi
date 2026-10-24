import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const { data, isi } = bacaMdx('topik/daratan/sungai.mdx');

describe('topik daratan/sungai', () => {
  it('memakai pertanyaan hulu–muara dan sumber resmi', () => {
    expect(String(data.pertanyaan)).toMatch(/muara|hulu/i);
    expect(data.sumber).toEqual(
      expect.arrayContaining(['usgs-watersheds', 'usgs-river-monitoring']),
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
