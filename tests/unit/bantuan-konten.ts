import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const akar = path.resolve(import.meta.dirname, '../..');

export function bacaMdx(relatif: string) {
  const isi = fs.readFileSync(path.join(akar, 'src/content', relatif), 'utf8');
  const cocok = isi.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!cocok) throw new Error(`${relatif}: frontmatter tidak ditemukan`);
  return { data: yaml.load(cocok[1]) as Record<string, unknown>, isi };
}
