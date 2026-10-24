export type IdZona = 'fotik' | 'senja' | 'gelap';

export interface Zona {
  id: IdZona;
  nama: string;
  batas: [number, number];
  cahaya: string;
  suhu: string;
  contoh: string[];
}

export const ZONA: readonly Zona[] = [
  {
    id: 'fotik',
    nama: 'Zona fotik',
    batas: [0, 200],
    cahaya: 'Cukup terang untuk fotosintesis. Hampir semua cahaya yang terlihat di laut berada di lapisan ini.',
    suhu: 'Paling hangat dan paling berubah, karena langsung menerima panas Matahari dan pengaruh udara.',
    contoh: ['Fitoplankton', 'Terumbu karang', 'Ikan kecil pemakan plankton'],
  },
  {
    id: 'senja',
    nama: 'Zona senja',
    batas: [200, 1000],
    cahaya: 'Sangat redup dan makin lemah seiring kedalaman, sehingga tidak cukup untuk fotosintesis.',
    suhu: 'Lebih dingin daripada permukaan dan berubah lebih lambat.',
    contoh: ['Ikan lentera', 'Cumi-cumi', 'Hewan yang naik ke permukaan pada malam hari'],
  },
  {
    id: 'gelap',
    nama: 'Zona gelap',
    batas: [1000, 4000],
    cahaya: 'Tidak ada cahaya Matahari sama sekali. Satu-satunya cahaya berasal dari makhluk hidup.',
    suhu: 'Dingin dan nyaris stabil sepanjang tahun.',
    contoh: ['Ikan dengan cahaya sendiri', 'Bakteri pengurai di dasar', 'Pemakan bangkai yang jatuh dari atas'],
  },
];

/** Zona pada kedalaman tertentu. NaN dan nilai negatif dianggap permukaan. */
export function zonaPadaKedalaman(meter: number): Zona {
  if (!Number.isFinite(meter) || meter < 200) return ZONA[0];
  if (meter < 1000) return ZONA[1];
  return ZONA[2];
}
