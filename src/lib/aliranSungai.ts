export type JenisBeban = 'erosi' | 'pupuk' | 'limbah';
export type StatusHilir = 'jernih' | 'keruh' | 'kaya-nutrisi' | 'tercemar';

export interface KeadaanHilir {
  status: StatusHilir;
  keterangan: string;
  endapan: boolean;
}

const JERNIH: KeadaanHilir = {
  status: 'jernih',
  keterangan:
    'Beban rendah. Air masih membawa sedikit partikel dan hara, sehingga muara tidak banyak berubah.',
  endapan: false,
};

/** Keadaan kualitatif di hilir. Intensitas dijepit ke 0–100; NaN dianggap 0. */
export function keadaanHilir(jenis: JenisBeban, intensitas: number): KeadaanHilir {
  const nilai = Number.isFinite(intensitas) ? Math.min(100, Math.max(0, intensitas)) : 0;
  if (nilai < 20) return JERNIH;

  if (jenis === 'erosi') {
    return nilai >= 60
      ? {
          status: 'keruh',
          keterangan:
            'Partikel tanah terbawa air dalam jumlah besar. Sebagian sedimen mengendap di hilir dan muara.',
          endapan: true,
        }
      : {
          status: 'keruh',
          keterangan: 'Air keruh karena partikel tanah yang tererosi dari hulu dan tebing sungai.',
          endapan: false,
        };
  }

  if (jenis === 'pupuk') {
    return {
      status: 'kaya-nutrisi',
      keterangan:
        'Nutrisi berlebih terbawa sampai muara dan dapat memicu pertumbuhan alga yang berlebihan.',
      endapan: false,
    };
  }

  return {
    status: 'tercemar',
    keterangan:
      'Bahan pencemar dari permukiman dan kegiatan lain ikut mengalir hingga ke hilir dan muara.',
    endapan: false,
  };
}

export const LABEL_BEBAN: Record<JenisBeban, string> = {
  erosi: 'Erosi tanah',
  pupuk: 'Pupuk dan nutrisi',
  limbah: 'Limbah permukiman',
};

export const LABEL_STATUS: Record<StatusHilir, string> = {
  jernih: 'Jernih',
  keruh: 'Keruh',
  'kaya-nutrisi': 'Kaya nutrisi',
  tercemar: 'Tercemar',
};
