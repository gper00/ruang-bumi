import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const akar = path.resolve(import.meta.dirname, '../..');
const { data, isi } = bacaMdx('topik/atmosfer/el-nino-la-nina.mdx');

const sumber = ['noaa-pmel-el-nino', 'noaa-ninonina', 'noaa-oni', 'bmkg-enso'];

const istilah = ['enso', 'el-nino', 'la-nina', 'angin-pasat', 'anomali-suhu-laut', 'upwelling'];

describe('topik el nino la nina', () => {
  it('punya frontmatter lengkap dan empat sumber', () => {
    expect(data.kategori).toBe('atmosfer');
    expect(data.status).toBe('terbit');
    expect(String(data.jawabanSingkat).length).toBeLessThanOrEqual(320);
    expect((data.sumber as string[]).sort()).toEqual([...sumber].sort());
  });

  it('tidak memuat kata "gempa" di pertanyaan maupun jawaban singkat', () => {
    // Pencarian beranda di ui-check.mjs mengunci 2 kartu untuk kata "gempa".
    const gabungan = `${data.pertanyaan} ${data.jawabanSingkat}`.toLowerCase();
    expect(gabungan).not.toContain('gempa');
  });

  it('memakai peta Pasifik interaktif di dalam Figure bersumber', () => {
    expect(isi).toMatch(/import PetaEnso from/);
    expect(isi).toMatch(/<PetaEnso client:visible \/>/);
    expect(isi).toMatch(/<Figure[^>]*source="noaa-pmel-el-nino"/);
    expect(isi).toMatch(/<DataNote>/);
    expect(isi).toMatch(/Ilustrasi\./);
  });

  it('menjelaskan tiap klaim dengan sumber', () => {
    for (const id of sumber) expect(isi, id).toContain(`<Cite id="${id}" />`);
    expect(isi).toMatch(/## Kok bisa\?/);
    expect(isi).toMatch(/### El Niño: hujan berpindah ke timur/);
    expect(isi).toMatch(/### La Niña: angin yang lebih kencang/);
    expect(isi).toMatch(/### Apa yang dirasakan Indonesia/);
    expect(isi).toMatch(/## Fakta menarik/);
  });

  it('memakai slider anomali dan tombol fase pada peta', () => {
    const komponen = fs.readFileSync(path.join(akar, 'src/components/viz/PetaEnso.tsx'), 'utf8');
    expect(komponen).toMatch(/Anomali suhu laut Pasifik tropis/);
    expect(komponen).toMatch(/type="range"/);
    expect(komponen).toMatch(/role="group"/);
    expect(komponen).toMatch(/aria-live="polite"/);
    // keadaan awal terisi, bukan layar kosong
    expect(komponen).toMatch(/useState\(1\.5\)/);
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

  it('tidak menyalin sumber lain atau memakai gambar markdown', () => {
    expect(isi).not.toMatch(/!\[[^\]]*\]\([^)]*\)/);
    expect(isi).not.toMatch(/\bWikipedia\b/);
  });
});

describe('glosarium el nino', () => {
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
            (
              yaml.load(fs.readFileSync(path.join(akar, 'src/content/sumber', f), 'utf8')) as {
                id: string;
              }
            ).id,
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
