import { describe, expect, it } from 'vitest';
import { boundsUntuk } from '../../src/lib/peta';

describe('boundsUntuk', () => {
  it('mengembalikan bounds untuk view yang sah', () => {
    expect(boundsUntuk('world')).toEqual([
      [-58, -172],
      [80, 178],
    ]);
    expect(boundsUntuk('indonesia')).toEqual([
      [-13, 94],
      [10, 143],
    ]);
  });

  it('jatuh ke dunia untuk view di luar kontrak (mdx mengirim "ocean", "lake", dst.)', () => {
    // Regresi: BOUNDS['ocean'] === undefined → fitBounds melempar
    // "Bounds are not valid" → status MapView berubah jadi 'gagal'.
    for (const view of ['ocean', 'lake', 'drainage', 'pesisir', '']) {
      expect(boundsUntuk(view as 'world')).toEqual(boundsUntuk('world'));
    }
  });

  it('mengembalikan bounds dunia saat view tidak diisi', () => {
    expect(boundsUntuk()).toEqual(boundsUntuk('world'));
  });

  it('menghormati bounds kustom pada view berbentuk objek', () => {
    const custom: [number, number][] = [
      [-8, 114],
      [-4, 120],
    ];
    expect(boundsUntuk({ bounds: custom as [[number, number], [number, number]] })).toEqual(custom);
  });
});
