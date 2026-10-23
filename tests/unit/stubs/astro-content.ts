/**
 * Stub untuk modul virtual `astro:content` di luar runtime Astro.
 * Isi koleksi bisa diisi per tes lewat objek `collections`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Entri = { id: string; data: Record<string, any> };

export const collections: Record<string, Entri[]> = {};

export async function getCollection(
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter?: (entry: Entri) => boolean,
): Promise<Entri[]> {
  const semua = collections[name] ?? [];
  return filter ? semua.filter(filter) : [...semua];
}

export async function getEntry(name: string, id: string): Promise<Entri | undefined> {
  return (collections[name] ?? []).find((e) => e.id === id);
}
