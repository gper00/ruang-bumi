export type GayaId = 'efusif' | 'transisi' | 'eksplosif';

export interface Gaya {
  id: GayaId;
  nama: string;
  /** Apa yang keluar dari mulut gunung pada gaya ini. */
  keluaran: string;
  ringkas: string;
}

export type BentukId = 'perisai' | 'kerucut' | 'kubah';

export interface Bentuk {
  id: BentukId;
  nama: string;
  /** Kemiringan lereng dalam derajat, keluaran model ilustratif. */
  lereng: number;
  /** Label kemiringan untuk pembaca. */
  lerengNama: string;
  ringkas: string;
}

/** Rentang kedua slider: skala tanpa satuan, hanya pengatur besar-kecilnya. */
export const RENTANG = { min: 0, max: 100, langkah: 5 } as const;

function batasi(nilai: number): number {
  if (!Number.isFinite(nilai)) return 0;
  return Math.min(Math.max(nilai, RENTANG.min), RENTANG.max);
}

/**
 * Fraksi gas yang tidak sempat lepas sebelum magma mencapai permukaan.
 * Magma encer membiarkan gas keluar, magma kental menahannya — jadi gas
 * hanya benar-benar terperangkap kalau keduanya tinggi sekaligus.
 * Angka 0–1 dipakai untuk membandingkan, bukan untuk perhitungan.
 */
export function gasTerkunci(kekentalan: number, gas: number): number {
  const v = batasi(kekentalan) / 100;
  const g = batasi(gas) / 100;
  return g * (0.25 + 0.75 * v);
}

export function gayaErupsi(kekentalan: number, gas: number): Gaya {
  const terkunci = gasTerkunci(kekentalan, gas);

  if (terkunci < 0.3) {
    return {
      id: 'efusif',
      nama: 'Efusif',
      keluaran: 'lava mengalir dan air mancur lava',
      ringkas:
        'Gas keluar perlahan karena magma mudah mengalir, jadi lava mengalir tenang keluar dari mulut dan abunya sedikit.',
    };
  }

  if (terkunci < 0.6) {
    return {
      id: 'transisi',
      nama: 'Transisi',
      keluaran: 'air mancur lava, abu, dan serpihan batuan',
      ringkas:
        'Sebagian gas masih terperangkap. Air mancur lava bergantian dengan ledakan kecil yang memuntahkan abu ke udara.',
    };
  }

  return {
    id: 'eksplosif',
    nama: 'Eksplosif',
    keluaran: 'kolom abu dan tefra yang menembak tinggi',
    ringkas:
      'Magma kental menahan gas sampai tekanannya terlalu besar, lalu lava dan tefra terlontar keras ke udara.',
  };
}

/**
 * Bentuk gunung mengikuti seberapa jauh lava sempat menyebar sebelum
 * mendingin, dan lerengnya dihitung dari kekentalan yang sama.
 * Model ilustratif: 4° landai sampai 34° curam.
 */
export function bentukGunung(kekentalan: number): Bentuk {
  const v = batasi(kekentalan) / 100;
  const lereng = Math.round(4 + 30 * v);
  const lerengNama = lereng < 12 ? 'landai' : lereng < 24 ? 'sedang' : 'curam';

  if (v < 0.35) {
    return {
      id: 'perisai',
      nama: 'Perisai',
      lereng,
      lerengNama,
      ringkas:
        'Lava encer menyebar jauh sebelum mendingin, jadi gunungnya melebar dengan puncak yang landai.',
    };
  }

  if (v < 0.7) {
    return {
      id: 'kerucut',
      nama: 'Kerucut lapis',
      lereng,
      lerengNama,
      ringkas:
        'Lava berhenti lebih dekat ke puncak lalu bertumpuk bersama abu, sehingga gunungnya tumbuh tinggi dan curam.',
    };
  }

  return {
    id: 'kubah',
    nama: 'Kubah lava',
    lereng,
    lerengNama,
    ringkas:
      'Magma sangat kental nyaris tidak bisa mengalir; ia menumpuk di atas mulut gunung menjadi kubah yang curam.',
  };
}

/** Teks untuk aria-valuetext slider kekentalan. */
export function labelKekentalan(nilai: number): string {
  const v = batasi(nilai);
  if (v <= 33) return 'rendah, magma basalt yang encer';
  if (v <= 66) return 'sedang';
  return 'tinggi, magma dasit atau riolit yang kental';
}

/** Teks untuk aria-valuetext slider kadar gas. */
export function labelGas(nilai: number): string {
  const g = batasi(nilai);
  if (g <= 33) return 'rendah';
  if (g <= 66) return 'sedang';
  return 'tinggi';
}
