export type KelasKedalamanId = 'dangkal' | 'menengah' | 'dalam';

export interface KelasKedalaman {
  id: KelasKedalamanId;
  nama: string;
  dari: number;
  sampai: number;
  ringkas: string;
}

/** Batas kedalaman gempa menurut USGS: permukaan sampai sekitar 700 km. */
export const KEDALAMAN_MAKS = 700;

export const KELAS_KEDALAMAN: KelasKedalaman[] = [
  {
    id: 'dangkal',
    nama: 'Dangkal',
    dari: 0,
    sampai: 70,
    ringkas:
      'Gempa dangkal paling sering terjadi di kerak yang rapuh. Getarannya sampai ke permukaan dengan sedikit sekali energi yang hilang di perjalanan.',
  },
  {
    id: 'menengah',
    nama: 'Menengah',
    dari: 70,
    sampai: 300,
    ringkas:
      'Gempa menengah terjadi di lempeng yang sudah menunjam ke mantel. Energinya harus menempuh jarak lebih jauh, sehingga getaran di permukaan biasanya lebih lemah.',
  },
  {
    id: 'dalam',
    nama: 'Dalam',
    dari: 300,
    sampai: KEDALAMAN_MAKS,
    ringkas:
      'Gempa dalam hanya terjadi di dalam lempeng litosfer yang tenggelam jauh ke mantel. Gelombang permukaannya kecil, jadi getaran di permukaan umumnya terbatas.',
  },
];

export function kelasKedalaman(km: number): KelasKedalaman {
  const dalam = Number.isFinite(km) ? Math.min(Math.max(km, 0), KEDALAMAN_MAKS) : 0;
  return KELAS_KEDALAMAN.find((kelas) => dalam < kelas.sampai) ?? KELAS_KEDALAMAN[KELAS_KEDALAMAN.length - 1];
}

/** Jarak dari satu titik di permukaan ke hiposentrum: akar dari jarak episentrum² + kedalaman². */
export function jarakHiposentral(jarakEpisentral: number, kedalaman: number): number {
  const datar = Math.max(jarakEpisentral, 0);
  const vertikal = Math.max(kedalaman, 0);
  return Math.sqrt(datar * datar + vertikal * vertikal);
}

export interface Goyangan {
  /** 0 = tidak terasa, 1 = paling kuat. Model kualitatif, bukan rumus seismologi. */
  nilai: number;
  label: 'lemah' | 'sedang' | 'kuat';
}

/**
 * Perkiraan kekuatan getaran di permukaan: makin jauh dan makin dalam, makin lemah.
 * Angka ini sengaja sederhana supaya perbandingannya terlihat, bukan untuk perhitungan.
 */
export function goyanganPermukaan(jarakEpisentral: number, kedalaman: number): Goyangan {
  const jarak = jarakHiposentral(jarakEpisentral, kedalaman);
  const redam = 1 / (1 + Math.max(kedalaman, 0) / 300);
  const nilai = Math.min(1, Math.max(0, (40 / (jarak + 10)) * redam));
  const label = nilai < 0.15 ? 'lemah' : nilai < 0.42 ? 'sedang' : 'kuat';
  return { nilai, label };
}

/** Offset maksimum yang dipakai ilustrasi: pagar 1906 yang bergeser sekitar 8,5 kaki. */
export const GESER_MAKS = 2.6;

export type StatusSesar = 'tersangkut' | 'meluncur';

export interface KeadaanSesar {
  /** 0 = lurus, 1 = lengkungan penuh; dipakai untuk menggambar bentuk pagar. */
  menekuk: number;
  /** Offset permanen dalam meter setelah sesar meluncur. */
  geser: number;
  status: StatusSesar;
  /** Energi elastis yang masih tersimpan, 0–1 relatif terhadap satu siklus penuh. */
  energi: number;
  ringkas: string;
}

export function keadaanSesar(regangan: number, terlepas: boolean): KeadaanSesar {
  const angka = Number.isFinite(regangan) ? regangan : 0;
  const porsi = Math.min(Math.max(angka, 0), 120) / 100;
  const terkunci = Math.min(porsi, 1);

  if (terlepas && porsi >= 1) {
    return {
      menekuk: 0,
      geser: GESER_MAKS,
      status: 'meluncur',
      energi: 0,
      ringkas:
        'Sesar meluncur. Lengkungan dilepas dalam sekali gerak, kedua sisi kembali lurus tetapi sudah bergeser. Energi yang tersimpan berubah menjadi gelombang seismik.',
    };
  }

  return {
    menekuk: terkunci,
    geser: 0,
    status: 'tersangkut',
    energi: terkunci * terkunci,
    ringkas:
      terkunci < 0.35
        ? 'Regangan masih kecil. Batuan baru mulai melengkung dan belum menyimpan banyak energi.'
        : terkunci < 0.85
          ? 'Sesar tersangkut sementara kedua sisinya terus bergerak. Batuan melengkung dan energi elastis menumpuk.'
          : 'Regangan hampir penuh. Sedikit tambahan saja cukup untuk melewati gesekan di sesar, lalu energi terlepas.',
  };
}
