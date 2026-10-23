import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export const KATEGORI = [
  {
    id: 'planet-bumi',
    label: 'Planet Bumi',
    deskripsi: 'Bentuk, lapisan, dan proses besar yang membentuk Bumi.',
  },
  {
    id: 'atmosfer',
    label: 'Atmosfer',
    deskripsi: 'Udara, cuaca, dan iklim yang menyelimuti planet kita.',
  },
  { id: 'laut', label: 'Laut', deskripsi: 'Air asin yang menutupi hampir tiga perempat permukaan Bumi.' },
  { id: 'daratan', label: 'Daratan', deskripsi: 'Bentuk muka bumi, batuan, dan bentang alam.' },
  { id: 'ekologi', label: 'Ekologi', deskripsi: 'Makhluk hidup dan tempat tinggalnya.' },
  { id: 'penutup', label: 'Penutup', deskripsi: 'Rangkuman dan benang merah antar topik.' },
] as const;

export type KategoriId = (typeof KATEGORI)[number]['id'];

export function kategoriLabel(id: string): string {
  return KATEGORI.find((k) => k.id === id)?.label ?? id;
}

export function kategoriDeskripsi(id: string): string {
  return KATEGORI.find((k) => k.id === id)?.deskripsi ?? '';
}

export type Topik = CollectionEntry<'topik'>;

/** Topics that are allowed to appear in listings and static routes. */
export async function getTopikTerbit(): Promise<Topik[]> {
  const semua = await getCollection('topik', (entry) => entry.data.status === 'terbit');
  return urutkanTopik(semua);
}

export function urutkanTopik(entries: Topik[]): Topik[] {
  const urutanKategori = new Map(KATEGORI.map((k, i) => [k.id as string, i]));
  return [...entries].sort((a, b) => {
    const ka = urutanKategori.get(a.data.kategori) ?? 99;
    const kb = urutanKategori.get(b.data.kategori) ?? 99;
    if (ka !== kb) return ka - kb;
    return a.data.pertanyaan.localeCompare(b.data.pertanyaan, 'id');
  });
}

/** Content-layer ids look like `atmosfer/angin-darat-laut`. */
export function topikId(entry: Topik): string {
  return entry.id.replace(/\.mdx$/, '');
}

export function topikHref(entry: Topik): string {
  return `/topik/${topikId(entry)}/`;
}

export function topikDariPathname(pathname: string): string | undefined {
  const match = pathname.match(/\/topik\/(.+?)\/?$/);
  return match?.[1];
}

export async function getTopikBySlug(slug: string): Promise<Topik | undefined> {
  return getEntry('topik', slug);
}

/**
 * Numbered source list for a topic page: the frontmatter order is the
 * canonical numbering, so a `<Cite>` anywhere in the body resolves to the
 * same number as the list at the bottom of the page.
 */
export async function sumberHalaman(entry: Topik): Promise<Array<{ nomor: number; id: string; data: CollectionEntry<'sumber'>['data'] }>> {
  const hasil: Array<{ nomor: number; id: string; data: CollectionEntry<'sumber'>['data'] }> = [];
  for (const [index, id] of entry.data.sumber.entries()) {
    const sumber = await getEntry('sumber', id);
    if (!sumber) continue;
    hasil.push({ nomor: index + 1, id, data: sumber.data });
  }
  return hasil;
}

export async function sumberById(id: string): Promise<CollectionEntry<'sumber'> | undefined> {
  return getEntry('sumber', id);
}

export async function datasetById(id: string): Promise<CollectionEntry<'dataset'> | undefined> {
  return getEntry('dataset', id);
}

export function bacaMenit(entry: Topik): number {
  return entry.data.menit;
}

export function tanggalIndo(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Makassar',
  }).format(date);
}

/** Related topics: explicit `terkait` ids first, then same-category siblings. */
export async function topikTerkait(entry: Topik): Promise<Topik[]> {
  const semua = await getCollection('topik', (e) => e.data.status === 'terbit');
  const byId = new Map(semua.map((e) => [topikId(e), e]));
  const hasil: Topik[] = [];
  for (const id of entry.data.terkait ?? []) {
    const found = byId.get(id);
    if (found && found.id !== entry.id) hasil.push(found);
  }
  if (hasil.length < 3) {
    for (const kandidat of urutkanTopik(semua.filter((e) => e.data.kategori === entry.data.kategori))) {
      if (kandidat.id === entry.id || hasil.some((h) => h.id === kandidat.id)) continue;
      hasil.push(kandidat);
      if (hasil.length >= 3) break;
    }
  }
  return hasil.slice(0, 4);
}
