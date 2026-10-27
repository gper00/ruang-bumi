import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { bacaMdx } from './bantuan-konten';

const akar = path.resolve(import.meta.dirname, '../..');
const { data, isi } = bacaMdx('topik/ekologi/bioma.mdx');

const tab = ['stepa', 'hutan-gugur', 'taiga', 'tundra'];

const sumberBaru = [
  'nasa-grassland',
  'nps-prairie-fire',
  'nasa-temperate-forest',
  'nps-deciduous-forest',
  'nasa-coniferous',
  'noaa-boreal-fire',
  'nasa-tundra',
  'noaa-permafrost',
];

const istilahBaru = [
  'stepa',
  'hutan-gugur',
  'taiga',
  'tundra',
  'permafrost',
  'lapisan-aktif',
  'dormansi',
];

describe('artikel bioma: tab empat bioma', () => {
  it('memuat empat panel dengan id dan label yang lengkap', () => {
    for (const id of tab) {
      const panel = isi.match(new RegExp(`<section[\\s\\S]*?id="bioma-${id}"[\\s\\S]*?>`, 'm'));
      expect(panel, id).not.toBeNull();
      expect(panel?.[0], id).toMatch(/class="bt-panel"/);
      expect(panel?.[0], id).toMatch(/data-tab="[^"]+"/);
      expect(panel?.[0], id).toMatch(/data-tanya="[^"]+"/);
      expect(panel?.[0], id).toMatch(/aria-label="[^"]+"/);
    }
    expect((isi.match(/class="bt-panel"/g) ?? []).length).toBe(4);
    expect(isi).toMatch(/<BiomaTabs\b/);
  });

  it('memberi setiap tab visualnya sendiri', () => {
    for (const visual of ['StepaGangguan', 'HutanGugurMusim', 'TaigaMusim', 'TundraMusim']) {
      expect(isi, visual).toMatch(new RegExp(`import ${visual} from`));
      expect(isi, visual).toMatch(new RegExp(`<${visual} client:visible />`));
    }
  });

  it('menyediakan sumber di frontmatter untuk tiap tab', () => {
    const sumber = data.sumber as string[];
    for (const id of sumberBaru) expect(sumber, id).toContain(id);
    expect(sumber.length).toBeGreaterThanOrEqual(8);
  });

  it('menghubungkan setiap angka di tab ke sumbernya', () => {
    for (const [tabId, citasi] of [
      ['stepa', ['nasa-grassland', 'nps-prairie-fire']],
      ['hutan-gugur', ['nasa-temperate-forest', 'nps-deciduous-forest']],
      ['taiga', ['nasa-coniferous', 'noaa-boreal-fire']],
      ['tundra', ['nasa-tundra', 'noaa-permafrost']],
    ] as Array<[string, string[]]>) {
      const mulai = isi.indexOf(`id="bioma-${tabId}"`);
      const berikutnya = isi.indexOf('class="bt-panel"', mulai);
      const potongan = isi.slice(mulai, berikutnya === -1 ? undefined : berikutnya);
      for (const id of citasi) {
        expect(potongan, `${tabId} → ${id}`).toContain(`<Cite id="${id}" />`);
      }
    }
  });

  it('tetap punya tiga soal kuis dengan penjelasan', () => {
    expect((isi.match(/\btanya:/g) ?? []).length).toBe(3);
    expect((isi.match(/\bbenar:/g) ?? []).length).toBe(3);
    expect((isi.match(/penjelasan:/g) ?? []).length).toBe(3);
  });

  it('tidak kehilangan penanda bagian dan sumber di Figure', () => {
    expect(isi).toMatch(/## Kok bisa\?/);
    expect(isi).toMatch(/## Empat bioma, empat mekanisme/);
    expect(isi).toMatch(/## Fakta menarik/);
    expect((isi.match(/<Figure\b/g) ?? []).length).toBe(5);
    expect(isi).not.toMatch(/<Figure(?![^>]*source=)/);
  });
});

describe('glosarium bioma', () => {
  const glosarium = yaml.load(
    fs.readFileSync(path.join(akar, 'src/content/glosarium/istilah.yaml'), 'utf8'),
  ) as Array<{ id: string; istilah: string; definisi: string; sumber: string }>;

  it('menambah istilah baru untuk artikel bioma', () => {
    const id = new Set(glosarium.map((g) => g.id));
    for (const wajib of istilahBaru) expect(id.has(wajib), wajib).toBe(true);
  });

  it('menautkan istilah baru ke sumber yang memuatnya', () => {
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

    for (const id of istilahBaru) {
      const entri = glosarium.find((g) => g.id === id);
      expect(entri, id).toBeDefined();
      expect(entri?.definisi.length, id).toBeGreaterThan(20);
      expect(idSumber.has(entri?.sumber ?? ''), `${id} → ${entri?.sumber}`).toBe(true);
    }
  });
});
