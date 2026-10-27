/**
 * Model ENSO untuk visual: satu angka anomali suhu laut Pasifik tropis
 * (−2,0 sampai +2,0 °C) diturunkan menjadi fase, kekuatan angin pasat,
 * posisi pita hujan, dan dampaknya ke Indonesia.
 *
 * Ambang fase mengikuti Oceanic Niño Index NOAA: +0,5 °C untuk El Niño,
 * −0,5 °C untuk La Niña. Angka lain (posisi pita, kekuatan angin) adalah
 * model ilustratif untuk membandingkan arah perubahan, bukan hasil ukuran.
 */

export const RENTANG_ANOMALI = { min: -2, max: 2, langkah: 0.1 } as const;

/** Ambang fase menurut Oceanic Niño Index (ONI) NOAA. */
export const BATAS_FASE = 0.5;

export type FaseId = 'la-nina' | 'netral' | 'el-nino';

export interface Fase {
  id: FaseId;
  nama: string;
  ringkas: string;
}

export type DampakId = 'kering' | 'normal' | 'basah';

export interface Dampak {
  id: DampakId;
  label: string;
  ringkas: string;
}

/** Tombol pemicu cepat di bawah peta. */
export const PILIHAN: { id: FaseId; label: string; nilai: number }[] = [
  { id: 'la-nina', label: 'La Niña', nilai: -1.5 },
  { id: 'netral', label: 'Netral', nilai: 0 },
  { id: 'el-nino', label: 'El Niño', nilai: 1.5 },
];

function batasi(nilai: number): number {
  if (!Number.isFinite(nilai)) return 0;
  return Math.min(Math.max(nilai, RENTANG_ANOMALI.min), RENTANG_ANOMALI.max);
}

export function faseEnso(anomali: number): Fase {
  const a = batasi(anomali);

  if (a >= BATAS_FASE) {
    return {
      id: 'el-nino',
      nama: 'El Niño',
      ringkas:
        'Angin pasat melemah, air hangat terdorong ke timur, dan hujan ikut mengikuti air hangat menjauh dari Indonesia.',
    };
  }

  if (a <= -BATAS_FASE) {
    return {
      id: 'la-nina',
      nama: 'La Niña',
      ringkas:
        'Angin pasat bertiup lebih kencang, air hangat tertahan di barat Pasifik, dan hujan berkumpul makin dekat ke Indonesia.',
    };
  }

  return {
    id: 'netral',
    nama: 'Netral',
    ringkas:
      'Angin pasat menahan air hangat di barat Pasifik seperti biasanya, dan hujan turun di atas air hangat dekat Indonesia.',
  };
}

/**
 * Kekuatan angin pasat relatif terhadap tahun netral: 1,0 = biasa.
 * El Niño menurunkannya, La Niña menaikkannya.
 */
export function kekuatanAngin(anomali: number): number {
  return Math.min(Math.max(1 - 0.35 * batasi(anomali), 0.3), 1.7);
}

export function labelAngin(anomali: number): 'melemah' | 'normal' | 'lebih kencang' {
  const nilai = kekuatanAngin(anomali);
  if (nilai > 1.1) return 'lebih kencang';
  if (nilai < 0.9) return 'melemah';
  return 'normal';
}

/**
 * Bujur pusat air hangat (derajat, 0–360 timur), model ilustratif:
 * netral di sekitar 150°BT, El Niño menyeret pusatnya ke timur,
 * La Niña menekannya ke barat dekat Indonesia.
 */
export function pusatHangat(anomali: number): number {
  return Math.min(Math.max(150 + 27.5 * batasi(anomali), 125), 205);
}

/**
 * Pita hujan mengikuti air yang paling hangat, jadi pusatnya sama dengan
 * pusat anomali: saat El Niño hujan bergeser ke Pasifik tengah-timur,
 * saat La Niña mundur ke barat.
 */
export function pusatHujan(anomali: number): number {
  return pusatHangat(anomali);
}

/** Pita hangat hanya diberi warna bila anomali cukup terasa. */
export function kejelasanAnomali(anomali: number): number {
  return Math.min(Math.abs(batasi(anomali)) / RENTANG_ANOMALI.max, 1);
}

export function dampakIndonesia(anomali: number): Dampak {
  const a = batasi(anomali);

  if (a >= BATAS_FASE) {
    return {
      id: 'kering',
      label: 'Curah hujan menurun',
      ringkas:
        'El Niño: hujan turun di hampir seluruh Indonesia pada periode Juni–November, sehingga kemarau berlangsung lebih panjang dan kering. Risiko kekeringan serta kebakaran lahan ikut naik.',
    };
  }

  if (a <= -BATAS_FASE) {
    return {
      id: 'basah',
      label: 'Curah hujan meningkat',
      ringkas:
        'La Niña: hujan naik sekitar 20–40% dibanding tahun netral pada Juni–November, kemarau sering berubah jadi kemarau basah, dan risiko banjir serta tanah longsor bertambah.',
    };
  }

  return {
    id: 'normal',
    label: 'Sekitar normal',
    ringkas:
      'Tanpa anomali yang menonjol, curah hujan mengikuti pola musimnya sendiri: ENSO hanya menambah atau mengurangi hujan yang sudah ada.',
  };
}

/** "150°BT" atau "160°BB" untuk label bujur pada peta. */
export function formatBujur(bujur: number): string {
  const lon = ((bujur % 360) + 360) % 360;
  if (lon <= 180) return `${Math.round(lon)}°BT`;
  return `${Math.round(360 - lon)}°BB`;
}

/** Teks angka anomali gaya Indonesia: "+1,2 °C", "−0,4 °C", "0,0 °C". */
export function labelAnomali(anomali: number): string {
  const a = batasi(anomali);
  const tanda = a > 0 ? '+' : a < 0 ? '−' : '';
  return `${tanda}${Math.abs(a).toFixed(1).replace('.', ',')} °C`;
}
