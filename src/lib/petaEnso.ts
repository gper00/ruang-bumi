/**
 * Jendela peta Pasifik tropis untuk visual ENSO: bujur 100°BT sampai 70°BB
 * dan lintang 30°U–30°S, dipetakan ke kanvas 720×300.
 *
 * DUNIA_PATH memakai proyeksi equirektangular 1000×500, jadi komponen cukup
 * memotong jendela ini. Karena peta ENSO melewati garis 180°, jalur daratan
 * digambar dua kali: satu salinan digeser 1000 unit ke timur.
 */

export const PETA = {
  lebar: 720,
  tinggi: 300,
  atasPeta: 30,
  lonAwal: 100,
  lonAkhir: 290,
  latAtas: 30,
  latBawah: -30,
} as const;

/** Skala dari kanvas dunia 1000×500 ke lebar jendela peta. */
export const SKALA = PETA.lebar / (((PETA.lonAkhir - PETA.lonAwal) / 360) * 1000);

/** Geseran supaya (lonAwal, latAtas) jatuh di pojok kiri atas jendela. */
export const TX = -(((PETA.lonAwal + 180) / 360) * 1000) * SKALA;

export const TINGGI_PETA =
  (((90 - PETA.latBawah) - (90 - PETA.latAtas)) / 180) * 500 * SKALA;

export const TY = -(((90 - PETA.latAtas) / 180) * 500) * SKALA + PETA.atasPeta;

/** Bujur (derajat timur) ke posisi x pada kanvas. */
export function px(bujur: number): number {
  return ((bujur - PETA.lonAwal) / (PETA.lonAkhir - PETA.lonAwal)) * PETA.lebar;
}

/** Lintang (derajat, positif = utara) ke posisi y pada kanvas. */
export function py(lintang: number): number {
  return PETA.atasPeta + ((PETA.latAtas - lintang) / (PETA.latAtas - PETA.latBawah)) * TINGGI_PETA;
}

export const EKUATOR = py(0);
