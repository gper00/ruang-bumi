import yaml from 'js-yaml';
import { z } from 'zod';
import mentah from '../content/glosarium/istilah.yaml?raw';

const skema = z.array(
  z.object({
    id: z.string(),
    istilah: z.string(),
    definisi: z.string(),
    topik: z.array(z.string()).default([]),
    sumber: z.string().optional(),
  }),
);

export type Istilah = z.infer<typeof skema>[number];

export const glosarium: Istilah[] = skema.parse(yaml.load(mentah));

export function cariIstilah(id: string): Istilah | undefined {
  return glosarium.find((item) => item.id === id);
}

/** Anchor used by both `<Term>` and the glossary page. */
export function istilahSlug(teks: string): string {
  return teks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
