import { describe, expect, it } from 'vitest';
import { keadaanHilir } from '../../src/lib/aliranSungai';

describe('keadaanHilir', () => {
  it('jernih pada beban rendah', () => {
    expect(keadaanHilir('erosi', 0).status).toBe('jernih');
    expect(keadaanHilir('pupuk', 19).status).toBe('jernih');
    expect(keadaanHilir('limbah', 19).status).toBe('jernih');
  });
  it('berubah sesuai jenis beban', () => {
    expect(keadaanHilir('erosi', 50)).toMatchObject({ status: 'keruh', endapan: false });
    expect(keadaanHilir('erosi', 80)).toMatchObject({ status: 'keruh', endapan: true });
    expect(keadaanHilir('pupuk', 50).status).toBe('kaya-nutrisi');
    expect(keadaanHilir('limbah', 50).status).toBe('tercemar');
  });
  it('menjepit intensitas ke 0–100', () => {
    expect(keadaanHilir('limbah', -10).status).toBe('jernih');
    expect(keadaanHilir('limbah', 150).status).toBe('tercemar');
    expect(keadaanHilir('erosi', Number.NaN).status).toBe('jernih');
  });
});
