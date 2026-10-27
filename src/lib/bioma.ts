export const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export type Musim = 'dingin' | 'semi' | 'panas' | 'gugur';
export type Tingkat = 'rendah' | 'sedang' | 'tinggi';
export type TingkatRumput = 'pendek' | 'sedang' | 'tinggi';

function indeksBulan(bulan: number): number {
  const angka = Number.isFinite(bulan) ? Math.round(bulan) : 0;
  return ((angka % 12) + 12) % 12;
}

/** Musim di belahan utara; dipakai untuk hutan gugur dan contoh lintang tinggi. */
export function musimUtara(bulan: number): Musim {
  const b = indeksBulan(bulan);
  if (b === 11 || b <= 1) return 'dingin';
  if (b <= 4) return 'semi';
  if (b <= 7) return 'panas';
  return 'gugur';
}

export type SkenarioStepa = 'alami' | 'kebakaran' | 'gembala';

export interface KeadaanStepa {
  skenario: SkenarioStepa;
  judul: string;
  tutupanPohon: Tingkat;
  pohonMuda: number;
  rumput: TingkatRumput;
  ringkas: string;
}

/**
 * Model kualitatif, bukan angka lapangan. Api dan penggembalaan menekan pohon muda;
 * rumput bertahan karena tunasnya berada di bawah permukaan tanah.
 */
export function keadaanStepa(skenario: SkenarioStepa): KeadaanStepa {
  switch (skenario) {
    case 'kebakaran':
      return {
        skenario,
        judul: 'Kebakaran',
        tutupanPohon: 'rendah',
        pohonMuda: 0,
        rumput: 'sedang',
        ringkas:
          'Api membakar serasah dan membunuh pohon muda yang tunasnya di atas tanah. Rumput tumbuh lagi dari akar dan tunas di bawah tanah.',
      };
    case 'gembala':
      return {
        skenario,
        judul: 'Penggembalaan',
        tutupanPohon: 'sedang',
        pohonMuda: 1,
        rumput: 'pendek',
        ringkas:
          'Penggembala memakan pucuk pohon muda dan menekan pertumbuhannya. Rumput tetap pendek, tetapi akarnya utuh.',
      };
    default:
      return {
        skenario: 'alami',
        judul: 'Tanpa gangguan',
        tutupanPohon: 'tinggi',
        pohonMuda: 4,
        rumput: 'tinggi',
        ringkas:
          'Tanpa api dan penggembalaan, pohon muda tumbuh dan mulai menaungi rumput. Padang rumput bergerak menuju hutan.',
      };
  }
}

export type DaunHutan = 'tidak-ada' | 'tunas' | 'penuh' | 'berwarna';

export interface KeadaanHutanGugur {
  musim: Musim;
  daun: DaunHutan;
  dorman: boolean;
  ringkas: string;
}

export function keadaanHutanGugur(bulan: number): KeadaanHutanGugur {
  const musim = musimUtara(bulan);
  switch (musim) {
    case 'dingin':
      return {
        musim,
        daun: 'tidak-ada',
        dorman: true,
        ringkas:
          'Pohon dorman: pertumbuhan berhenti dan daun sudah gugur. Cabang gundul mengurangi air yang hilang saat dingin.',
      };
    case 'semi':
      return {
        musim,
        daun: 'tunas',
        dorman: false,
        ringkas: 'Kuncup pecah dan daun baru tumbuh. Pertumbuhan dimulai lagi setelah musim dingin.',
      };
    case 'panas':
      return {
        musim,
        daun: 'penuh',
        dorman: false,
        ringkas: 'Kanopi penuh dan pertumbuhan paling cepat karena cahaya serta hujan mencukupi.',
      };
    default:
      return {
        musim,
        daun: 'berwarna',
        dorman: false,
        ringkas:
          'Daun menua dan warnanya berubah. Pohon bersiap melepas daun sebelum dingin datang.',
      };
  }
}

export type MusimTaiga = 'panas' | 'dingin';
export type JenisDaun = 'jarum' | 'lebar';

export interface KeadaanTaiga {
  berdaun: boolean;
  salju: boolean;
  ringkas: string;
}

export function keadaanTaiga(musim: MusimTaiga, jenis: JenisDaun): KeadaanTaiga {
  const dingin = musim === 'dingin';
  if (jenis === 'jarum') {
    return {
      berdaun: true,
      salju: dingin,
      ringkas: dingin
        ? 'Daun jarum tetap terpasang sepanjang musim dingin, siap bekerja begitu suhu menghangat.'
        : 'Daun jarum tetap terpasang; pohon tidak perlu membangun kanopi baru dari nol.',
    };
  }
  return {
    berdaun: !dingin,
    salju: dingin,
    ringkas: dingin
      ? 'Daun lebar rontok saat dingin. Musim semi dipakai untuk menumbuhkan kanopi baru.'
      : 'Daun lebar penuh di musim panas, memanfaatkan cahaya dan suhu yang singkat.',
  };
}

export interface KeadaanTundra {
  /** 0 = lapisan aktif membeku, 1 = lapisan aktif paling tebal (ilustrasi). */
  kedalaman: number;
  beku: boolean;
  ringkas: string;
}

export function keadaanTundra(bulan: number): KeadaanTundra {
  const b = indeksBulan(bulan);
  // Puncak pencairan pada Juli (indeks 6), minimum pada Januari (indeks 0).
  const kedalaman = (1 + Math.cos(((b - 6) / 12) * Math.PI * 2)) / 2;
  const beku = kedalaman < 0.15;

  if (beku) {
    return {
      kedalaman,
      beku,
      ringkas:
        'Lapisan aktif membeku kembali. Akar tidak bisa menembus permafrost di bawahnya.',
    };
  }

  return {
    kedalaman,
    beku,
    ringkas:
      kedalaman > 0.75
        ? 'Lapisan aktif paling tebal, tetapi tetap tipis dibanding permafrost. Air tertahan di atas tanah beku.'
        : 'Lapisan aktif sedang mencair atau membeku. Hanya akar dangkal yang muat di lapisan ini.',
  };
}
