export type IdSimpul = 'lempeng' | 'atmosfer' | 'air' | 'laut' | 'kehidupan';

export interface Simpul {
  id: IdSimpul;
  nama: string;
  ringkas: string;
}

export interface Aliran {
  dari: IdSimpul;
  ke: IdSimpul;
  label: string;
  topik: string;
  contoh: string;
}

export const SIMPUL: readonly Simpul[] = [
  {
    id: 'lempeng',
    nama: 'Lempeng',
    ringkas:
      'Lempeng tektonik membentuk gunung, palung, dan daratan. Bentuk permukaan itu lalu mengatur arah air dan angin.',
  },
  {
    id: 'atmosfer',
    nama: 'Atmosfer',
    ringkas:
      'Atmosfer menyimpan dan memindahkan panas serta uap air. Angin mengangkut uap dari laut ke darat dan menggerakkan arus permukaan.',
  },
  {
    id: 'air',
    nama: 'Air',
    ringkas:
      'Air tawar bergerak lewat hujan, sungai, dan air tanah. Dalam perjalanannya air mengikis batuan dan membawa sedimen serta nutrisi.',
  },
  {
    id: 'laut',
    nama: 'Laut',
    ringkas:
      'Laut menyimpan panas, mengangkut nutrisi lewat arus, dan menjadi sumber utama uap air bagi atmosfer.',
  },
  {
    id: 'kehidupan',
    nama: 'Kehidupan',
    ringkas:
      'Kehidupan menerima air, nutrisi, dan energi dari bagian lain Bumi. Sebaliknya, tumbuhan dan hewan ikut memengaruhi tanah, air, dan atmosfer.',
  },
];

export const ALIRAN: readonly Aliran[] = [
  {
    dari: 'lempeng',
    ke: 'atmosfer',
    label: 'relief dan angin',
    topik: '/topik/planet-bumi/lempeng-tektonik/',
    contoh:
      'Pegunungan yang terbentuk oleh lempeng menaikkan udara yang bergerak, sehingga pola angin dan hujan di sekitarnya berubah.',
  },
  {
    dari: 'lempeng',
    ke: 'air',
    label: 'relief dan aliran',
    topik: '/topik/daratan/sungai/',
    contoh: 'Kemiringan lereng menentukan arah sungai dan seberapa cepat air mengikis tanah.',
  },
  {
    dari: 'lempeng',
    ke: 'kehidupan',
    label: 'tanah dan gunung api',
    topik: '/topik/planet-bumi/lempeng-tektonik/',
    contoh: 'Abu vulkanik dapat menyuburkan tanah, tetapi letusan juga dapat menghancurkan habitat.',
  },
  {
    dari: 'atmosfer',
    ke: 'air',
    label: 'hujan',
    topik: '/topik/atmosfer/siklus-air/',
    contoh: 'Uap air diangkut angin, mengembun, lalu jatuh sebagai hujan di daratan.',
  },
  {
    dari: 'atmosfer',
    ke: 'laut',
    label: 'angin',
    topik: '/topik/laut/arus/',
    contoh: 'Angin menggerakkan lapisan atas laut dan membentuk arus permukaan.',
  },
  {
    dari: 'air',
    ke: 'laut',
    label: 'aliran dan sedimen',
    topik: '/topik/daratan/sungai/',
    contoh: 'Sungai membawa air, sedimen, dan nutrisi dari hulu sampai ke muara.',
  },
  {
    dari: 'air',
    ke: 'kehidupan',
    label: 'air tawar',
    topik: '/topik/ekologi/bioma/',
    contoh: 'Ketersediaan air sepanjang tahun ikut menentukan jenis tumbuhan dan bioma.',
  },
  {
    dari: 'laut',
    ke: 'atmosfer',
    label: 'panas dan uap',
    topik: '/topik/atmosfer/siklus-air/',
    contoh: 'Laut menyumbang sebagian besar uap air dan melepaskan panas ke atmosfer.',
  },
  {
    dari: 'laut',
    ke: 'kehidupan',
    label: 'nutrisi',
    topik: '/topik/laut/arus/',
    contoh: 'Upwelling membawa air kaya nutrisi ke permukaan dan menopang rantai makanan laut.',
  },
];

export function aliranDari(id: IdSimpul): readonly Aliran[] {
  return ALIRAN.filter((a) => a.dari === id || a.ke === id);
}
