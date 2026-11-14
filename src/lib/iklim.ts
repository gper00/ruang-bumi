// Model ilustrasi untuk topik cuaca vs iklim.
//
// Satu deret suhu harian selama 30 tahun, dibangkitkan secara deterministik supaya
// angka di ringkasan, grafik, dan tes selalu sama. Ini bukan data stasiun nyata:
// tujuannya hanya memisahkan dua skala waktu — ayunan harian dan rata-rata iklim.

export const TAHUN_AWAL = 1996;
export const TAHUN_AKHIR = 2025;
export const JUMLAH_TAHUN = TAHUN_AKHIR - TAHUN_AWAL + 1;
export const HARI_PER_TAHUN = 365;

const SUHU_DASAR = 27.0;
const AYUNAN_MUSIMAN = 1.2;
const TREN_PER_TAHUN = 0.03;

const HARI_BULAN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const NAMA_BULAN = [
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
];

// Hash bilangan bulat, bukan Math.random, agar hasil sama di setiap render dan tes.
function hash(a: number, b: number): number {
  let x = (a * 374761393 + b * 668265263) >>> 0;
  x = ((x ^ (x >>> 13)) * 1274126177) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

function seragam(a: number, b: number): number {
  return hash(a, b) / 4294967296;
}

// Tiga bilangan seragam dijumlahkan supaya sebarannya menyerupai lonceng, bukan rata.
function derau(tahun: number, hari: number): number {
  const jumlah =
    seragam(tahun, hari) +
    seragam(tahun + 101, hari) +
    seragam(tahun, hari + 701) -
    1.5;
  return jumlah * 2.4;
}

function bulat1(nilai: number): number {
  return Math.round(nilai * 10) / 10;
}

export function tahunValid(tahun: number): number {
  if (!Number.isFinite(tahun)) return TAHUN_AKHIR;
  return Math.min(TAHUN_AKHIR, Math.max(TAHUN_AWAL, Math.round(tahun)));
}

/** Suhu harian ilustrasi, satu angka per hari (1–365). */
export function suhuHarian(tahun: number, hari: number): number {
  const t = tahunValid(tahun);
  const h = Math.min(HARI_PER_TAHUN, Math.max(1, Math.round(hari)));
  const musim = AYUNAN_MUSIMAN * Math.cos((2 * Math.PI * (h - 288)) / HARI_PER_TAHUN);
  const tren = TREN_PER_TAHUN * (t - TAHUN_AWAL);
  const bedaTahun = (seragam(t, 9999) - 0.5) * 0.3;
  return bulat1(SUHU_DASAR + tren + musim + bedaTahun + derau(t, h));
}

export function deretHarian(tahun: number): number[] {
  const t = tahunValid(tahun);
  return Array.from({ length: HARI_PER_TAHUN }, (_, i) => suhuHarian(t, i + 1));
}

let cacheNormal: number[] | null = null;

/** Rata-rata suhu untuk tiap hari dalam setahun, dihitung dari seluruh 30 tahun. */
export function normalTahunan(): number[] {
  if (!cacheNormal) {
    cacheNormal = Array.from({ length: HARI_PER_TAHUN }, (_, i) => {
      let jumlah = 0;
      for (let tahun = TAHUN_AWAL; tahun <= TAHUN_AKHIR; tahun += 1) {
        jumlah += suhuHarian(tahun, i + 1);
      }
      return jumlah / JUMLAH_TAHUN;
    });
  }
  return cacheNormal;
}

export function rataRataTahunan(tahun: number): number {
  const harian = deretHarian(tahun);
  return harian.reduce((jumlah, nilai) => jumlah + nilai, 0) / harian.length;
}

let cacheIklim: number | null = null;

/** Rata-rata seluruh hari selama 30 tahun: satu angka untuk "iklim" periode ini. */
export function rataRataIklim(): number {
  if (cacheIklim === null) {
    let jumlah = 0;
    for (let tahun = TAHUN_AWAL; tahun <= TAHUN_AKHIR; tahun += 1) {
      jumlah += rataRataTahunan(tahun);
    }
    cacheIklim = jumlah / JUMLAH_TAHUN;
  }
  return cacheIklim;
}

export interface RataRataTahun {
  tahun: number;
  rataRata: number;
}

export function deretTahunan(): RataRataTahun[] {
  return Array.from({ length: JUMLAH_TAHUN }, (_, i) => {
    const tahun = TAHUN_AWAL + i;
    return { tahun, rataRata: rataRataTahunan(tahun) };
  });
}

/** Selisih rata-rata tahun terakhir dan tahun pertama: pemanasan selama 30 tahun. */
export function trenIklim(): number {
  return rataRataTahunan(TAHUN_AKHIR) - rataRataTahunan(TAHUN_AWAL);
}

export interface RingkasanTahun {
  tahun: number;
  rataRata: number;
  normal: number;
  anomali: number;
  terpanas: number;
  terdingin: number;
  hariTerpanas: number;
  hariTerdingin: number;
  simpanganHarian: number;
}

export function ringkasTahun(tahun: number): RingkasanTahun {
  const t = tahunValid(tahun);
  const harian = deretHarian(t);
  const normal = normalTahunan();

  let terpanas = harian[0];
  let terdingin = harian[0];
  let hariTerpanas = 1;
  let hariTerdingin = 1;
  let simpanganHarian = 0;

  for (let i = 0; i < harian.length; i += 1) {
    const nilai = harian[i];
    if (nilai > terpanas) {
      terpanas = nilai;
      hariTerpanas = i + 1;
    }
    if (nilai < terdingin) {
      terdingin = nilai;
      hariTerdingin = i + 1;
    }
    simpanganHarian = Math.max(simpanganHarian, Math.abs(nilai - normal[i]));
  }

  const rataRata = rataRataTahunan(t);

  return {
    tahun: t,
    rataRata,
    normal: rataRataIklim(),
    anomali: rataRata - rataRataIklim(),
    terpanas,
    terdingin,
    hariTerpanas,
    hariTerdingin,
    simpanganHarian,
  };
}

/** Label tanggal sederhana (tanpa tahun kabisat) untuk hari ke-1 sampai 365. */
export function labelTanggal(hari: number): string {
  let sisa = Math.min(HARI_PER_TAHUN, Math.max(1, Math.round(hari)));
  for (let bulan = 0; bulan < HARI_BULAN.length; bulan += 1) {
    if (sisa <= HARI_BULAN[bulan]) return `${sisa} ${NAMA_BULAN[bulan]}`;
    sisa -= HARI_BULAN[bulan];
  }
  return `31 Desember`;
}

export function bulanDalamTahun(): string[] {
  return [...NAMA_BULAN];
}
