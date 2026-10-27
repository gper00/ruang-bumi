import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const akar = path.resolve(import.meta.dirname, '../..');
const { data, isi } = bacaMdx('topik/planet-bumi/gempa-bumi.mdx');

const sumber = [
  'usgs-science-earthquakes',
  'usgs-elastic-rebound',
  'usgs-depth-earthquake',
  'usgs-earthquake-glossary',
  'usgs-plate-tectonics',
  'bmkg-gempa',
];

const istilah = [
  'sesar',
  'hiposentrum',
  'episentrum',
  'pemulihan-elastis',
  'gempa-susulan',
  'magnitudo',
  'lempeng-tektonik',
  'cincin-api',
];

describe('topik gempa bumi', () => {
  it('punya frontmatter lengkap dan enam sumber', () => {
    expect(data.kategori).toBe('planet-bumi');
    expect(data.status).toBe('terbit');
    expect(String(data.jawabanSingkat).length).toBeLessThanOrEqual(320);
    expect((data.sumber as string[]).sort()).toEqual([...sumber].sort());
  });

  it('memakai dua visual, keduanya sebagai figure bersumber', () => {
    expect(isi).toMatch(/import GempaRebound from/);
    expect(isi).toMatch(/import GempaFokus from/);
    expect(isi).toMatch(/<GempaRebound client:visible \/>/);
    expect(isi).toMatch(/<GempaFokus client:visible \/>/);
    expect(isi).toMatch(/<Figure[^>]*source="usgs-elastic-rebound"/);
    expect(isi).toMatch(/<Figure[^>]*source="usgs-depth-earthquake"/);
  });

  it('menjelaskan tiap klaim dengan sumber', () => {
    for (const id of sumber) expect(isi, id).toContain(`<Cite id="${id}" />`);
    expect(isi).toMatch(/## Kok bisa\?/);
    expect(isi).toMatch(/### Sesar yang menahan, bukan yang bergerak/);
    expect(isi).toMatch(/### Hiposentrum dan episentrum/);
    expect(isi).toMatch(/### Seberapa dalam gempanya\?/);
    expect(isi).toMatch(/### Yang belum bisa dilakukan: meramal/);
    expect(isi).toMatch(/## Fakta menarik/);
  });

  it('menautkan istilah baru ke glosarium', () => {
    for (const id of istilah) {
      expect(isi, id).toMatch(new RegExp(`<Term istilah="${id}" />`));
      expect(data.glosarium as string[], id).toContain(id);
    }
  });

  it('punya tiga soal kuis dengan penjelasan', () => {
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
    expect((isi.match(/\bbenar:/g) ?? []).length).toBe(3);
    expect((isi.match(/penjelasan:/g) ?? []).length).toBe(3);
  });

  it('tidak menyalin sumber lain atau memakai gambar markdown', () => {
    expect(isi).not.toMatch(/!\[[^\]]*\]\([^)]*\)/);
    expect(isi).not.toMatch(/\bWikipedia\b/);
  });
});

describe('glosarium gempa', () => {
  const semua = yaml.load(
    fs.readFileSync(path.join(akar, 'src/content/glosarium/istilah.yaml'), 'utf8'),
  ) as Array<{ id: string; istilah: string; definisi: string; sumber: string }>;

  it('entri baru punya definisi dan sumber yang ada', () => {
    const idSumber = new Set(
      fs
        .readdirSync(path.join(akar, 'src/content/sumber'))
        .filter((f) => f.endsWith('.yaml'))
        .map(
          (f) =>
            (yaml.load(fs.readFileSync(path.join(akar, 'src/content/sumber', f), 'utf8')) as {
              id: string;
            }).id,
        ),
    );

    for (const id of istilah) {
      const entri = semua.find((g) => g.id === id);
      expect(entri, id).toBeDefined();
      expect(entri?.definisi.length, id).toBeGreaterThan(40);
      expect(idSumber.has(entri?.sumber ?? ''), `${id} → ${entri?.sumber}`).toBe(true);
    }
  });
});
