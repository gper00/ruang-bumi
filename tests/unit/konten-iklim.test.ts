import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const akar = path.resolve(import.meta.dirname, '../..');
const { data, isi } = bacaMdx('topik/atmosfer/cuaca-vs-iklim.mdx');

const sumber = [
  'noaa-climate-vs-weather',
  'noaa-forecast-reliability',
  'wmo-climate-normals',
  'bmkg-normal-suhu',
];

const istilah = ['cuaca', 'iklim', 'normal-iklim'];

describe('topik cuaca vs iklim', () => {
  it('punya frontmatter lengkap dan empat sumber resmi', () => {
    expect(data.kategori).toBe('atmosfer');
    expect(data.status).toBe('terbit');
    expect(String(data.jawabanSingkat).length).toBeLessThanOrEqual(320);
    expect((data.sumber as string[]).sort()).toEqual([...sumber].sort());
  });

  it('memasang visual interaktif di dalam Figure bersumber', () => {
    expect(isi).toMatch(/import SimIklim from/);
    expect(isi).toMatch(/<SimIklim client:visible \/>/);
    expect(isi).toMatch(/<Figure[^>]*source="noaa-climate-vs-weather"/);
    expect(isi).toMatch(/<DataNote>/);
    expect(isi).toMatch(/Ilustrasi\./);
  });

  it('menjelaskan tiap klaim dengan sumber', () => {
    for (const id of sumber) expect(isi, id).toContain(`<Cite id="${id}" />`);
    expect(isi).toMatch(/## Kok bisa\?/);
    expect(isi).toMatch(/### Kenapa ramalan besok bisa meleset/);
    expect(isi).toMatch(/### Kenapa 30 tahun justru lebih stabil/);
    expect(isi).toMatch(/## Fakta menarik/);
  });

  it('memakai angka NOAA dan BMKG yang bisa dilacak', () => {
    expect(isi).toMatch(/lima hari tepat sekitar 90%/);
    expect(isi).toMatch(/tujuh hari sekitar 80%/);
    expect(isi).toMatch(/26,7 °C/);
    expect(isi).toMatch(/27,05 °C/);
    expect(isi).toMatch(/\+0,38 °C/);
  });

  it('tidak memakai peta atau istilah karangan', () => {
    expect(isi).not.toMatch(/<MapView/);
    expect(isi).not.toMatch(/!\[[^\]]*\]\([^)]*\)/);
    expect(isi).not.toMatch(/\bWikipedia\b/);
  });

  it('menautkan istilah glosarium', () => {
    for (const id of istilah) {
      expect(isi, id).toMatch(new RegExp(`<Term istilah="${id}" />`));
      expect(data.glosarium as string[], id).toContain(id);
    }
    expect(data.glosarium as string[]).toHaveLength(istilah.length);
  });

  it('punya tiga soal kuis dengan penjelasan', () => {
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
    expect((isi.match(/\bbenar:/g) ?? []).length).toBe(3);
    expect((isi.match(/penjelasan:/g) ?? []).length).toBe(3);
  });
});

describe('visual cuaca vs iklim', () => {
  const komponen = fs.readFileSync(path.join(akar, 'src/components/viz/SimIklim.tsx'), 'utf8');

  it('punya kendali tahun, normal 30 tahun, dan dua grafik', () => {
    expect(komponen).toMatch(/type="range"/);
    expect(komponen).toMatch(/id="sk-tahun"/);
    expect(komponen).toMatch(/type="checkbox"/);
    expect(komponen).toMatch(/id="sk-normal"/);
    expect(komponen).toMatch(/aria-live="polite"/);
    expect(komponen).toMatch(/<svg/);
    expect(komponen).toMatch(/sk-grafik-tahunan/);
  });

  it('mulai dari tahun terakhir dan menampilkan normal', () => {
    expect(komponen).toMatch(/useState\(TAHUN_AKHIR\)/);
    expect(komponen).toMatch(/useState\(true\)/);
  });
});

describe('glosarium cuaca vs iklim', () => {
  const semua = yaml.load(
    fs.readFileSync(path.join(akar, 'src/content/glosarium/istilah.yaml'), 'utf8'),
  ) as Array<{ id: string; istilah: string; definisi: string; sumber: string }>;

  const idSumber = new Set(
    fs
      .readdirSync(path.join(akar, 'src/content/sumber'))
      .filter((f) => f.endsWith('.yaml'))
      .map(
        (f) =>
          (
            yaml.load(fs.readFileSync(path.join(akar, 'src/content/sumber', f), 'utf8')) as {
              id: string;
            }
          ).id,
      ),
  );

  it('entri baru punya definisi dan sumber yang ada', () => {
    for (const id of ['cuaca', 'normal-iklim']) {
      const entri = semua.find((g) => g.id === id);
      expect(entri, id).toBeDefined();
      expect(entri?.definisi.length, id).toBeGreaterThan(40);
      expect(idSumber.has(entri?.sumber ?? ''), `${id} → ${entri?.sumber}`).toBe(true);
    }
  });
});
