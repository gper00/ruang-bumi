export type Musim = 'semi' | 'panas' | 'gugur' | 'dingin';

export interface KeadaanDanau {
  musim: Musim;
  berlapis: boolean;
  mencampur: boolean;
  es: boolean;
  oksigenDasar: 'tinggi' | 'sedang' | 'rendah';
  keterangan: string;
}

export const MUSIM: readonly { id: Musim; label: string; ringkas: string }[] = [
  { id: 'semi', label: 'Semi', ringkas: 'Pembalikan musim semi' },
  { id: 'panas', label: 'Panas', ringkas: 'Stratifikasi kuat' },
  { id: 'gugur', label: 'Gugur', ringkas: 'Pembalikan musim gugur' },
  { id: 'dingin', label: 'Dingin', ringkas: 'Permukaan membeku' },
];

const KEADAAN: Record<Musim, KeadaanDanau> = {
  semi: {
    musim: 'semi',
    berlapis: false,
    mencampur: true,
    es: false,
    oksigenDasar: 'sedang',
    keterangan:
      'Permukaan menghangat setelah musim dingin. Air bercampur dari atas ke bawah dan membawa oksigen ke dasar.',
  },
  panas: {
    musim: 'panas',
    berlapis: true,
    mencampur: false,
    es: false,
    oksigenDasar: 'rendah',
    keterangan:
      'Permukaan hangat dan lebih ringan, sehingga mengapung di atas air dingin. Lapisan tidak bercampur dan oksigen di dasar menurun.',
  },
  gugur: {
    musim: 'gugur',
    berlapis: false,
    mencampur: true,
    es: false,
    oksigenDasar: 'tinggi',
    keterangan:
      'Permukaan mendingin dan menjadi lebih padat. Air bercampur lagi, mengembalikan oksigen ke lapisan bawah.',
  },
  dingin: {
    musim: 'dingin',
    berlapis: true,
    mencampur: false,
    es: true,
    oksigenDasar: 'sedang',
    keterangan:
      'Permukaan membeku. Air terdingin berada tepat di bawah es, sedangkan air sekitar 4 °C yang lebih padat berada lebih dalam.',
  },
};

export function keadaanDanau(musim: Musim): KeadaanDanau {
  return KEADAAN[musim] ?? KEADAAN.panas;
}
