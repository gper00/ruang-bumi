import { beforeEach, describe, expect, it } from 'vitest';
import {
  KATEGORI,
  kategoriDeskripsi,
  kategoriLabel,
  tanggalIndo,
  topikDariPathname,
  topikHref,
  topikId,
  topikTerkait,
  urutkanTopik,
  type Topik,
} from '../../src/lib/topik';
import { collections } from './stubs/astro-content';

/** Objek tiruan cukup punya field yang dipakai lib — paksa ke tipe Topik. */
const sebagaiTopik = (objek: { id: string }) => objek as unknown as Topik;

/** Bangun entri topik tiruan dengan field minimum yang dipakai lib. */
function topikTiruan(
  id: string,
  data: Partial<{ kategori: string; pertanyaan: string; status: string; terkait: string[] }>,
) {
  return {
    id,
    data: {
      kategori: 'atmosfer',
      pertanyaan: id,
      status: 'terbit',
      terkait: [] as string[],
      ...data,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

beforeEach(() => {
  for (const key of Object.keys(collections)) delete collections[key];
});

describe('kategoriLabel / kategoriDeskripsi', () => {
  it('mengembalikan label untuk id yang dikenal', () => {
    expect(kategoriLabel('atmosfer')).toBe('Atmosfer');
    expect(kategoriLabel('planet-bumi')).toBe('Planet Bumi');
  });

  it('jatuh ke id mentah untuk id yang tidak dikenal', () => {
    expect(kategoriLabel('luar-angkasa')).toBe('luar-angkasa');
  });

  it('deskripsi tidak kosong untuk id yang dikenal, kosong untuk asing', () => {
    expect(kategoriDeskripsi('laut')).not.toBe('');
    expect(kategoriDeskripsi('luar-angkasa')).toBe('');
  });
});

describe('urutkanTopik', () => {
  it('mengurutkan menurut urutan KATEGORI, lalu pertanyaan (localeCompare id)', () => {
    const entri = [
      topikTiruan('laut/b', { kategori: 'laut', pertanyaan: 'Zzz?' }),
      topikTiruan('atmosfer/b', { kategori: 'atmosfer', pertanyaan: 'Coba?' }),
      topikTiruan('atmosfer/a', { kategori: 'atmosfer', pertanyaan: 'Apa?' }),
      topikTiruan('daratan/a', { kategori: 'daratan', pertanyaan: 'Mengapa?' }),
    ];
    const hasil = urutkanTopik(entri).map((e) => e.id);
    expect(hasil).toEqual(['atmosfer/a', 'atmosfer/b', 'laut/b', 'daratan/a']);
  });

  it('kategori yang tidak dikenal diurutkan paling akhir', () => {
    const entri = [
      topikTiruan('aneh/a', { kategori: 'aneh', pertanyaan: 'A?' }),
      topikTiruan('atmosfer/a', { kategori: 'atmosfer', pertanyaan: 'B?' }),
    ];
    expect(urutkanTopik(entri).map((e) => e.id)).toEqual(['atmosfer/a', 'aneh/a']);
  });

  it('tidak mengubah array masukan', () => {
    const entri = [
      topikTiruan('laut/a', { kategori: 'laut', pertanyaan: 'A?' }),
      topikTiruan('atmosfer/a', { kategori: 'atmosfer', pertanyaan: 'B?' }),
    ];
    const salinan = [...entri];
    urutkanTopik(entri);
    expect(entri).toEqual(salinan);
  });
});

describe('topikId / topikHref', () => {
  it('membuang ekstensi .mdx bila ada', () => {
    expect(topikId(sebagaiTopik({ id: 'atmosfer/musim.mdx' }))).toBe('atmosfer/musim');
    expect(topikId(sebagaiTopik({ id: 'atmosfer/musim' }))).toBe('atmosfer/musim');
  });

  it('topikHref selalu diawali dan diakhiri slash', () => {
    expect(topikHref(sebagaiTopik({ id: 'laut/ocean.mdx' }))).toBe('/topik/laut/ocean/');
  });
});

describe('topikDariPathname', () => {
  it('menangkap slug setelah /topik/', () => {
    expect(topikDariPathname('/topik/atmosfer/musim/')).toBe('atmosfer/musim');
    expect(topikDariPathname('/topik/atmosfer/musim')).toBe('atmosfer/musim');
  });

  it('mengembalikan undefined di luar rute topik', () => {
    expect(topikDariPathname('/glosarium/')).toBeUndefined();
    expect(topikDariPathname('/')).toBeUndefined();
  });
});

describe('tanggalIndo', () => {
  it('memformat tanggal dengan pola Indonesia', () => {
    // 2026-10-23T00:00Z = 2026-10-23 08:00 WITA — tanggal tetap 23.
    expect(tanggalIndo('2026-10-23')).toBe('23 Oktober 2026');
    expect(tanggalIndo(new Date('2026-01-01T00:00:00Z'))).toBe('1 Januari 2026');
  });
});

describe('topikTerkait', () => {
  it('memakai `terkait` eksplisit lebih dulu dan mengecualikan diri sendiri', async () => {
    collections.topik = [
      topikTiruan('atmosfer/musim', { terkait: ['laut/ocean', 'atmosfer/musim', 'tidak-ada'] }),
      topikTiruan('laut/ocean', {}),
      topikTiruan('atmosfer/angin', {}),
      topikTiruan('daratan/sungai', {}),
      topikTiruan('daratan/danau', {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any[];
    const hasil = await topikTerkait(sebagaiTopik(collections.topik[0]));
    const ids = hasil.map((e) => e.id);
    expect(ids).toContain('laut/ocean');
    expect(ids).not.toContain('atmosfer/musim');
    expect(ids).not.toContain('tidak-ada');
  });

  it('melengkapi dengan saudara sekategori sampai minimal 3', async () => {
    collections.topik = [
      topikTiruan('atmosfer/musim', { terkait: ['laut/ocean'] }),
      topikTiruan('laut/ocean', {}),
      topikTiruan('atmosfer/angin', {}),
      topikTiruan('atmosfer/siklus', {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any[];
    const hasil = await topikTerkait(sebagaiTopik(collections.topik[0]));
    expect(hasil.length).toBeGreaterThanOrEqual(3);
    expect(hasil.map((e) => e.id)).toContain('laut/ocean');
    expect(hasil.map((e) => e.id)).toContain('atmosfer/angin');
  });

  it('hanya mengambil topik berstatus terbit', async () => {
    collections.topik = [
      topikTiruan('atmosfer/musim', {}),
      topikTiruan('atmosfer/draf', { status: 'draf' }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any[];
    const hasil = await topikTerkait(sebagaiTopik(collections.topik[0]));
    expect(hasil.map((e) => e.id)).not.toContain('atmosfer/draf');
  });

  it('maksimal 4 hasil', async () => {
    collections.topik = [
      topikTiruan('atmosfer/musim', {
        terkait: ['laut/a', 'laut/b', 'laut/c', 'laut/d', 'laut/e'],
      }),
      topikTiruan('laut/a', {}),
      topikTiruan('laut/b', {}),
      topikTiruan('laut/c', {}),
      topikTiruan('laut/d', {}),
      topikTiruan('laut/e', {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any[];
    const hasil = await topikTerkait(sebagaiTopik(collections.topik[0]));
    expect(hasil.length).toBeLessThanOrEqual(4);
  });
});

describe('KATEGORI', () => {
  it('id unik dan label tidak kosong', () => {
    const ids = KATEGORI.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const k of KATEGORI) expect(k.label).toBeTruthy();
  });
});
