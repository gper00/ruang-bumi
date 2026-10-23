import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const akar = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // `astro:content` hanya hidup di dalam runtime Astro. Fungsi murni di
      // src/lib/topik.ts tidak memanggilnya saat import, jadi stub cukup.
      'astro:content': path.join(akar, 'tests/unit/stubs/astro-content.ts'),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
