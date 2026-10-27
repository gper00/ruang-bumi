import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const akar = path.resolve(import.meta.dirname, '../..');
const { data, isi } = bacaMdx('topik/atmosfer/lapisan-atmosfer.mdx');

const sumber = [
  'nasa-atmosphere-cake',
  'nasa-what-atmosphere',
  'noaa-atmosphere-layers',
  'nasa-standard-atmosphere',
  'noaa-air-pressure',
  'nasa-puncak-jaya',
];

const istilah = ['troposfer', 'stratosfer', 'mesosfer', 'termosfer', 'tropopause', 'lapisan-ozon'];

describe('topik lapisan atmosfer', () => {
  it('punya frontmatter lengkap dan enam sumber', () => {
    expect(data.kategori).toBe('atmosfer');
    expect(data.status).toBe('terbit');
    expect(String(data.jawabanSingkat).length).toBeLessThanOrEqual(320);
    expect((data.sumber as string[]).sort()).toEqual([...sumber].sort());
  });

  it('memakai visual profil suhu sebagai figure bersumber', () => {
    expect(isi).toMatch(/import ProfilAtmosfer from/);
    expect(isi).toMatch(/<ProfilAtmosfer client:visible \/>/);
    expect(isi).toMatch(/<Figure[^>]*source="nasa-standard-atmosphere"/);
  });

  it('menjelaskan arah suhu tiap lapisan dengan sumber', () => {
    for (const id of sumber) expect(isi, id).toContain(`<Cite id="${id}" />`);
    expect(isi).toMatch(/## Kok bisa\?/);
    expect(isi).toMatch(/### Kenapa udara yang naik jadi dingin\?/);
    expect(isi).toMatch(/### Di atas tropopause, arahnya berbalik/);
    expect(isi).toMatch(/### Mesosfer: bagian terdingin atmosfer/);
    expect(isi).toMatch(/### Termosfer: suhunya tinggi, panasnya sedikit/);
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

  it('tidak menyalin kalimat dari sumber dan tidak memakai gambar markdown', () => {
    expect(isi).not.toMatch(/!\[[^\]]*\]\([^)]*\)/);
    expect(isi).not.toMatch(/\bWikipedia\b/);
  });
});

describe('glosarium lapisan atmosfer', () => {
  const glosarium = yaml.load(
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
      const entri = glosarium.find((g) => g.id === id);
      expect(entri, id).toBeDefined();
      expect(entri?.definisi.length, id).toBeGreaterThan(40);
      expect(idSumber.has(entri?.sumber ?? ''), `${id} → ${entri?.sumber}`).toBe(true);
    }
  });
});
