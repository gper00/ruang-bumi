import { useEffect, useState } from 'react';

/** true bila pengguna meminta animasi dikurangi; SSR-safe (default false). */
export function useReduceMotion(): boolean {
  const [kurang, setKurang] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ubah = () => setKurang(mq.matches);
    ubah();
    mq.addEventListener('change', ubah);
    return () => mq.removeEventListener('change', ubah);
  }, []);
  return kurang;
}
