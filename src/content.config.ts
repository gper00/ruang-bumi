import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const topik = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/topik' }),
  schema: z.object({
    pertanyaan: z.string().min(10),
    slug: z.string().optional(),
    kategori: z.enum(['planet-bumi', 'atmosfer', 'laut', 'daratan', 'ekologi', 'penutup']),
    level: z.enum(['pemula', 'menengah']).default('pemula'),
    menit: z.number().int().min(1).max(15),
    jawabanSingkat: z.string().max(320),
    terkait: z.array(z.string()).max(6),
    sumber: z.array(z.string()).min(2),
    dataset: z.array(z.string()).default([]),
    glosarium: z.array(z.string()).default([]),
    status: z.enum(['draft', 'review', 'terbit']).default('draft'),
    diverifikasi: z.coerce.date(),
    penulis: z.string().default('Umam'),
  }),
});

const sumber = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/sumber' }),
  schema: z.object({
    id: z.string(),
    penerbit: z.string(),
    judul: z.string(),
    url: z.string().url(),
    jenis: z.enum(['web', 'jurnal', 'buku', 'dataset', 'video']),
    lisensi: z.string(),
    // YAML parses an unquoted 2026-10-22 as a Date, so accept both and normalise.
    diakses: z
      .union([z.string(), z.date()])
      .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
      .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    catatan: z.string().optional(),
  }),
});

const dataset = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/dataset' }),
  schema: z.object({
    id: z.string(),
    nama: z.string(),
    sumber: z.string(),
    asal: z.string().url(),
    lisensi: z.string(),
    diambil: z
      .union([z.string(), z.date()])
      .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
      .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    proses: z.string().optional(),
    keluaran: z.string().optional(),
    catatan: z.string().optional(),
  }),
});

// Glosarium lives in one YAML file and is parsed in src/lib/glosarium.ts,
// because the glob loader expects one entry per file.
export const collections = { topik, sumber, dataset };