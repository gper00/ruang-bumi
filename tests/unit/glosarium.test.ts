import { describe, expect, it } from 'vitest';
import { cariIstilah, glosarium, istilahSlug } from '../../src/lib/glosarium';

describe('glosarium', () => {
  it('parse YAML glosarium asli tanpa melempar', () => {
    expect(glosarium.length).toBeGreaterThan(0);
    for (const item of glosarium) {
      expect(item.id).toBeTruthy();
      expect(item.istilah).toBeTruthy();
      expect(item.definisi).toBeTruthy();
    }
  });

  it('cariIstilah menemukan istilah yang ada', () => {
    const litosfer = cariIstilah('litosfer');
    expect(litosfer?.istilah).toBe('Litosfer');
  });

  it('cariIstilah mengembalikan undefined untuk id yang tidak ada', () => {
    expect(cariIstilah('tidak-ada-istilah-ini')).toBeUndefined();
  });
});

describe('istilahSlug', () => {
  it('menurunkan huruf besar dan mengganti spasi dengan tanda hubung', () => {
    expect(istilahSlug('Siklus Air')).toBe('siklus-air');
  });

  it('membuang karakter non-alfanumerik', () => {
    expect(istilahSlug('Akuifer?')).toBe('akuifer');
    expect(istilahSlug('  Litosfer & Mantel ')).toBe('litosfer-mantel');
  });

  it('menangani teks kosong', () => {
    expect(istilahSlug('')).toBe('');
  });

  it('idempoten: slug dari slug itu sendiri tidak berubah', () => {
    expect(istilahSlug('siklus-air')).toBe('siklus-air');
  });
});
