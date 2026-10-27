export type LapisanId = 'troposfer' | 'stratosfer' | 'mesosfer' | 'termosfer';

export interface LapisanAtmosfer {
  id: LapisanId;
  nama: string;
  /** Batas bawah dan atas dalam kilometer. Batas atas termosfer adalah batas jendela grafik. */
  dari: number;
  sampai: number;
  arah: 'turun' | 'naik';
  pemanas: string;
  ringkas: string;
}

/** Batas jendela profil. Termosfer berlanjut jauh di atas ini. */
export const BATAS_ATAS = 100;

export const LAPISAN: LapisanAtmosfer[] = [
  {
    id: 'troposfer',
    nama: 'Troposfer',
    dari: 0,
    sampai: 11,
    arah: 'turun',
    pemanas: 'permukaan Bumi',
    ringkas:
      'Hampir semua uap air, awan, dan cuaca ada di lapisan ini. Udaranya dipanaskan dari bawah oleh permukaan Bumi, lalu mendingin saat naik dan mengembang — sekitar 6,5 °C setiap kilometer.',
  },
  {
    id: 'stratosfer',
    nama: 'Stratosfer',
    dari: 11,
    sampai: 50,
    arah: 'naik',
    pemanas: 'ozon yang menyerap ultraviolet',
    ringkas:
      'Ozon menyerap radiasi ultraviolet Matahari, jadi lapisan ini makin hangat ke atas. Udara hangat berada di atas udara dingin, sehingga udaranya stabil dan jarang bergejolak.',
  },
  {
    id: 'mesosfer',
    nama: 'Mesosfer',
    dari: 50,
    sampai: 85,
    arah: 'turun',
    pemanas: 'sedikit sekali — tidak ada ozon',
    ringkas:
      'Tidak ada penyerap ultraviolet di sini, sementara udara di bawahnya masih lebih hangat. Suhu terus turun sampai mesopause, bagian terdingin dari seluruh atmosfer.',
  },
  {
    id: 'termosfer',
    nama: 'Termosfer',
    dari: 85,
    sampai: BATAS_ATAS,
    arah: 'naik',
    pemanas: 'ultraviolet ekstrem dan sinar-X',
    ringkas:
      'Molekulnya sangat sedikit, jadi tiap molekul menyerap lebih banyak energi dan suhunya bisa mencapai ribuan derajat. Karena jumlah molekulnya sedikit, panas yang tersimpan tetap kecil.',
  },
];

/**
 * Titik tetap profil suhu, mengikuti tabel U.S. Standard Atmosphere 1976.
 * Di atas 85 km nilai mengikuti model kerapatan rendah: suhu naik lagi dengan lambat.
 */
const TITIK_SUHU: ReadonlyArray<readonly [number, number]> = [
  [0, 15],
  [11, -56.5],
  [20, -56.5],
  [32, -44.5],
  [47, -2.5],
  [51, -2.5],
  [71, -58.5],
  [85, -86],
  [100, -78],
];

function batasi(km: number): number {
  if (!Number.isFinite(km)) return 0;
  return Math.min(Math.max(km, 0), BATAS_ATAS);
}

/** Suhu udara dalam derajat Celsius pada ketinggian tertentu (km), interpolasi linear. */
export function suhuPada(km: number): number {
  const tinggi = batasi(km);
  for (let i = 1; i < TITIK_SUHU.length; i += 1) {
    const [kmAtas, suhuAtas] = TITIK_SUHU[i];
    if (tinggi <= kmAtas) {
      const [kmBawah, suhuBawah] = TITIK_SUHU[i - 1];
      const porsi = kmAtas === kmBawah ? 0 : (tinggi - kmBawah) / (kmAtas - kmBawah);
      return suhuBawah + porsi * (suhuAtas - suhuBawah);
    }
  }
  return TITIK_SUHU[TITIK_SUHU.length - 1][1];
}

/** Lapisan yang memuat ketinggian ini. Batas dipakai oleh lapisan di atasnya. */
export function lapisanPada(km: number): LapisanAtmosfer {
  const tinggi = batasi(km);
  return LAPISAN.find((lapisan) => tinggi < lapisan.sampai) ?? LAPISAN[LAPISAN.length - 1];
}

export interface TitikProfil {
  km: number;
  suhu: number;
}

/** Sampel profil untuk menggambar kurva. */
export function profilSuhu(langkah = 1): TitikProfil[] {
  const lebar = langkah > 0 ? langkah : 1;
  const titik: TitikProfil[] = [];
  for (let km = 0; km <= BATAS_ATAS; km += lebar) {
    titik.push({ km: Number(km.toFixed(2)), suhu: suhuPada(km) });
  }
  if (titik[titik.length - 1].km !== BATAS_ATAS) {
    titik.push({ km: BATAS_ATAS, suhu: suhuPada(BATAS_ATAS) });
  }
  return titik;
}

/** Ubah gradien antar titik tetap menjadi kalimat pendek, misalnya “turun 6,5 °C/km”. */
export function gradienLapisan(id: LapisanId): string {
  switch (id) {
    case 'troposfer':
      return 'turun sekitar 6,5 °C per km';
    case 'stratosfer':
      return 'naik 1 sampai 2,8 °C per km';
    case 'mesosfer':
      return 'turun sekitar 2 sampai 2,8 °C per km';
    default:
      return 'naik, makin cepat di ketinggian lebih besar';
  }
}
