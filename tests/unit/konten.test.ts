import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const akar = path.resolve(import.meta.dirname, '../..');
const glosarium = yaml.load(
  fs.readFileSync(path.join(akar, 'src/content/glosarium/istilah.yaml'), 'utf8'),
) as Array<{ id: string; istilah: string; definisi: string; sumber: string }>;

describe('glosarium', () => {
  it('tidak memuat istilah karangan', () => {
    const id = glosarium.map((g) => g.id);
    expect(id).not.toContain('wetan');
    expect(id).not.toContain('patchungan');
    expect(id).not.toContain('auifer');
  });

  it('memuat istilah baru yang dipakai 5 topik', () => {
    const id = new Set(glosarium.map((g) => g.id));
    for (const wajib of [
      'zona-fotik', 'zona-senja', 'zona-gelap', 'arus-laut', 'efek-coriolis',
      'upwelling', 'daerah-aliran-sungai', 'sedimen', 'muara',
      'epilimnion', 'termoklin', 'hipolimnion', 'sistem-bumi',
    ]) {
      expect(id.has(wajib), wajib).toBe(true);
    }
  });

  it('setiap entri lengkap dan sumbernya ada', () => {
    const idSumber = new Set(
      fs.readdirSync(path.join(akar, 'src/content/sumber'))
        .filter((f) => f.endsWith('.yaml'))
        .map((f) => (yaml.load(fs.readFileSync(path.join(akar, 'src/content/sumber', f), 'utf8')) as { id: string }).id),
    );
    for (const g of glosarium) {
      expect(g.istilah?.length, g.id).toBeGreaterThan(0);
      expect(g.definisi?.length, g.id).toBeGreaterThan(10);
      expect(idSumber.has(g.sumber), `${g.id} → ${g.sumber}`).toBe(true);
    }
  });
});

const topikBaru = [
  'topik/laut/ocean.mdx',
  'topik/laut/arus.mdx',
  'topik/daratan/sungai.mdx',
  'topik/daratan/danau.mdx',
  'topik/penutup/menghubungkan.mdx',
];

describe('konten 5 topik baru', () => {
  for (const relatif of topikBaru) {
    it(`${relatif}: bersih, bersumber, dan punya 3 soal`, () => {
      const { data, isi } = bacaMdx(relatif);
      expect(isi).not.toMatch(/wetan|patchungan|auifer/i);
      expect(isi).not.toMatch(/<MapView/);
      expect(Array.isArray(data.sumber) ? (data.sumber as string[]).length : 0).toBeGreaterThanOrEqual(2);
      expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
      expect((isi.match(/\bbenar:/g) ?? []).length).toBe(3);
      expect(String(isi)).toMatch(/<Figure[^>]*source="/);
    });
  }
});
