export type JenisArus = 'hangat' | 'dingin';

export interface Arus {
  id: string;
  nama: string;
  jenis: JenisArus;
  arah: string;
  pengaruh: string;
}

export const ARUS: readonly Arus[] = [
  {
    id: 'gulf-stream',
    nama: 'Gulf Stream',
    jenis: 'hangat',
    arah: 'Dari Karibia dan Teluk Meksiko menyusuri pantai timur Amerika Serikat, lalu menyeberang Atlantik menuju Eropa.',
    pengaruh:
      'Membawa panas ke lintang tinggi; panasnya membuat sebagian besar Eropa utara lebih hangat daripada wilayah lain pada lintang yang sama.',
  },
  {
    id: 'kuroshio',
    nama: 'Kuroshio',
    jenis: 'hangat',
    arah: 'Dari perairan Filipina ke utara, melewati pantai timur Jepang.',
    pengaruh: 'Membawa air hangat ke Pasifik barat laut dan memengaruhi suhu perairan Jepang.',
  },
  {
    id: 'atlantik-utara',
    nama: 'Arus Atlantik Utara',
    jenis: 'hangat',
    arah: 'Melanjutkan Gulf Stream ke arah timur laut, menuju Eropa dan Greenland.',
    pengaruh: 'Melengkapi jalur air hangat di Atlantik utara sebelum air mendingin dan tenggelam.',
  },
  {
    id: 'california',
    nama: 'Arus California',
    jenis: 'dingin',
    arah: 'Menyusuri pantai barat Amerika Utara dari utara ke selatan.',
    pengaruh: 'Mendinginkan perairan pesisir dan berkaitan dengan naiknya air dalam di lepas pantai.',
  },
  {
    id: 'humboldt',
    nama: 'Arus Humboldt',
    jenis: 'dingin',
    arah: 'Menyusuri pantai barat Amerika Selatan dari selatan ke utara.',
    pengaruh:
      'Membawa air dingin kaya nutrisi ke permukaan; daerah upwelling seperti ini menjadi wilayah perikanan yang produktif.',
  },
  {
    id: 'acc',
    nama: 'Arus Antartika',
    jenis: 'dingin',
    arah: 'Mengelilingi Antartika dari barat ke timur.',
    pengaruh: 'Menghubungkan Samudra Atlantik, Hindia, dan Pasifik serta membatasi masuknya air hangat ke Antartika.',
  },
];

export function saringArus(jenis?: JenisArus | 'semua'): readonly Arus[] {
  if (!jenis || jenis === 'semua') return ARUS;
  return ARUS.filter((a) => a.jenis === jenis);
}
