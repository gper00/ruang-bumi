/**
 * Smoke test in a real browser: hydration, map, quiz, citations, overflow, axe.
 * Usage: node tests/ui-check.mjs [baseUrl] [executablePath]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] ?? 'http://localhost:4321';

/** Locate a Chromium build installed by `npx playwright install chromium`. */
function cariChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const akar = path.join(os.homedir(), '.cache/ms-playwright');
  if (!fs.existsSync(akar)) return undefined;
  const builds = fs
    .readdirSync(akar)
    .filter((nama) => nama.startsWith('chromium-'))
    .sort()
    .reverse();
  for (const build of builds) {
    for (const relatif of [
      'chrome-linux64/chrome',
      'chrome-linux/chrome',
      'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      'chrome-win/chrome.exe',
    ]) {
      const calon = path.join(akar, build, relatif);
      if (fs.existsSync(calon)) return calon;
    }
  }
  return undefined;
}

const executablePath = process.argv[3] ?? cariChromium();
if (!executablePath) {
  console.error(
    'Chromium tidak ditemukan. Jalankan `npx playwright install chromium` atau set PLAYWRIGHT_CHROMIUM.',
  );
  process.exit(1);
}

const axeSource = fs.readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../node_modules/axe-core/axe.min.js'),
  'utf8',
);

const halaman = [
  '/',
  '/topik/',
  '/topik/atmosfer/angin-darat-laut/',
  '/topik/atmosfer/musim/',
  '/topik/atmosfer/siklus-air/',
  '/topik/ekologi/bioma/',
  '/topik/planet-bumi/lempeng-tektonik/',
  '/topik/laut/ocean/',
  '/topik/laut/arus/',
  '/topik/daratan/sungai/',
  '/topik/daratan/danau/',
  '/topik/penutup/menghubungkan/',
  '/kategori/atmosfer/',
  '/glosarium/',
  '/sumber/',
  '/tentang/',
];

const masalah = [];
const catat = (pesan) => {
  masalah.push(pesan);
  console.log(`MASALAH  ${pesan}`);
};

const browser = await chromium.launch({ executablePath });

try {
  for (const { lebar, skema, gerak } of [
    { lebar: 390, skema: 'light' },
    { lebar: 1280, skema: 'light' },
    { lebar: 390, skema: 'dark' },
    { lebar: 1280, skema: 'dark' },
    { lebar: 360, skema: 'light' },
    { lebar: 360, skema: 'dark' },
    { lebar: 1280, skema: 'light', gerak: 'reduce' },
  ]) {
    const tanda = `${lebar}px/${skema}${gerak ? `/${gerak}` : ''}`;
    const context = await browser.newContext({
      viewport: { width: lebar, height: 900 },
      colorScheme: skema,
      ...(gerak ? { reducedMotion: gerak } : {}),
    });
    const page = await context.newPage();

    page.on('pageerror', (err) => catat(`[${tanda}] pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') catat(`[${tanda}] console error: ${msg.text()}`);
    });

    for (const url of halaman) {
      await page.goto(base + url, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 2) catat(`[${tanda}] ${url}: overflow horizontal ${overflow}px`);

      await page.addScriptTag({ content: axeSource });
      const hasil = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return r.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id} (${v.nodes.length} node): ${v.help}`);
      });
      for (const v of hasil) catat(`[${tanda}] axe ${url}: ${v}`);
    }

    // Interactive checks only once, at the desktop light viewport without reduced motion.
    if (lebar === 1280 && skema === 'light' && !gerak) {
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      await page.locator('#cari-topik').fill('gempa');
      let tampil = await page.locator('.kartu-topik:visible').count();
      if (tampil !== 1) catat(`Beranda: pencarian "gempa" menampilkan ${tampil} kartu, seharusnya 1`);
      await page.locator('#cari-topik').fill('');
      await page.locator('.filter-btn', { hasText: 'Ekologi' }).click();
      tampil = await page.locator('.kartu-topik:visible').count();
      // Duplikat bioma sudah dihapus, jadi kategori Ekologi hanya punya 1 topik.
      if (tampil !== 1) catat(`Beranda: filter Ekologi menampilkan ${tampil} kartu, seharusnya 1`);

      await page.goto(base + '/topik/planet-bumi/lempeng-tektonik/', { waitUntil: 'networkidle' });
      await page.waitForSelector('.mv-canvas .leaflet-container', { timeout: 15000 });
      await page.waitForTimeout(1200);
      const jumlahLempeng = await page.locator('.mv-canvas path.mv-plate').count();
      if (jumlahLempeng < 40) catat(`Peta: hanya ${jumlahLempeng} poligon lempeng yang tergambar`);

      await page.getByRole('button', { name: 'Indonesia' }).click();
      await page.waitForTimeout(500);
      await page.getByText('Daftar lempeng sebagai teks').click();
      const tombolLempeng = page.locator('.mv-alt button').first();
      const namaLempeng = (await tombolLempeng.textContent())?.trim();
      await tombolLempeng.click();
      const info = await page.locator('.mv-info-judul').textContent();
      if (!info) catat('Peta: panel info tidak muncul setelah memilih lempeng');
      else console.log(`INFO    Peta memilih "${info}" (dari daftar: ${namaLempeng})`);

      const tautanSumber = await page.locator('.mv-info-sumber').getAttribute('href');
      if (!tautanSumber?.startsWith('/sumber/')) catat('Peta: panel info tidak menautkan sumber data');

      const darat = page.locator('path.mv-land').first();
      const fillAwal = await darat.getAttribute('fill');
      await page.locator('#theme-toggle').click();
      await page.waitForTimeout(400);
      const fillAkhir = await darat.getAttribute('fill');
      if (fillAwal === fillAkhir) catat('Peta: warna daratan tidak ikut berubah saat tema diganti');

      await page.goto(base + '/topik/atmosfer/siklus-air/', { waitUntil: 'networkidle' });
      await page.getByRole('tab', { name: 'Kondensasi' }).click();
      const panel = await page.locator('#panel-siklus .siklus-judul').textContent();
      if (!panel?.includes('Kondensasi')) catat('Siklus air: tab tidak mengganti panel');

      await page.goto(base + '/topik/ekologi/bioma/', { waitUntil: 'networkidle' });
      await page.locator('.bio-chip', { hasText: 'Gurun subtropis' }).first().click();
      const bioma = await page.locator('.bio-judul').textContent();
      if (!bioma?.includes('Gurun')) catat('Bioma: tombol tidak mengganti panel');

      await page.goto(base + '/topik/atmosfer/musim/', { waitUntil: 'networkidle' });
      await page.locator('.sms-slider input').fill('9');
      const bulan = await page.locator('.sms-bulan').textContent();
      if (bulan?.trim() !== 'Oktober') catat(`Musim: slider menunjukkan "${bulan}", seharusnya Oktober`);

      await page.goto(base + '/topik/atmosfer/angin-darat-laut/', { waitUntil: 'networkidle' });
      await page.locator('.sal-slider input').fill('2');
      const lencana = await page.locator('.sal-lencana-label').textContent();
      if (lencana?.trim() !== 'Angin darat') catat(`Angin: pukul 02.00 menunjukkan "${lencana}"`);

      const cite = page.locator('.cite-btn').first();
      await cite.click();
      const pop = page.locator('.cite-pop').first();
      if (!(await pop.isVisible())) catat('Cite: popover tidak terbuka saat diklik');

      const quiz = page.locator('.quiz');
      await quiz.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const island = document.querySelector('astro-island[component-url*="Quiz"]');
        return island !== null && !island.hasAttribute('ssr');
      }, null, { timeout: 15000 });
      await page.locator('.quiz-opsi-btn').nth(1).click();
      const umpan = page.locator('.quiz-feedback').first();
      if (!(await umpan.isVisible())) catat('Kuis: umpan balik tidak muncul setelah memilih jawaban');

      await page.goto(base + '/topik/laut/ocean/', { waitUntil: 'networkidle' });
      await page.locator('.zl-slider input').fill('1500');
      if (!(await page.locator('.zl-zona-nama').textContent())?.toLowerCase().includes('gelap'))
        catat('Zona laut: kedalaman 1.500 m bukan zona gelap');

      await page.goto(base + '/topik/laut/arus/', { waitUntil: 'networkidle' });
      await page.locator('.pa-daftar button', { hasText: 'Gulf Stream' }).click();
      if (!(await page.locator('.pa-info-nama').textContent())?.includes('Gulf Stream'))
        catat('Arus: memilih Gulf Stream tidak mengisi panel info');

      await page.goto(base + '/topik/daratan/sungai/', { waitUntil: 'networkidle' });
      await page.locator('.as-jenis select').selectOption('limbah');
      await page.locator('.as-intensitas input').fill('80');
      if (!(await page.locator('.as-status').textContent())?.toLowerCase().includes('tercemar'))
        catat('Sungai: beban limbah tinggi tidak menandai tercemar');

      await page.goto(base + '/topik/daratan/danau/', { waitUntil: 'networkidle' });
      await page.locator('.dm-musim button', { hasText: 'Gugur' }).click();
      if (!(await page.locator('.dm-status').textContent())?.toLowerCase().includes('campur'))
        catat('Danau: musim gugur tidak menampilkan pencampuran');

      await page.goto(base + '/topik/penutup/menghubungkan/', { waitUntil: 'networkidle' });
      await page.locator('.sb-simpul button', { hasText: 'Laut' }).click();
      if (!(await page.locator('.sb-panel').textContent())?.toLowerCase().includes('laut'))
        catat('Sistem Bumi: memilih simpul laut tidak mengisi panel');

      await page.goto(base + '/topik/laut/ocean/', { waitUntil: 'networkidle' });
      const slider = page.locator('.zl-slider input');
      await slider.focus();
      const sebelum = await slider.inputValue();
      await page.keyboard.press('ArrowRight');
      if ((await slider.inputValue()) === sebelum)
        catat('Zona laut: slider tidak merespons panah keyboard');
    }

    await context.close();
  }
} finally {
  await browser.close();
}

console.log(masalah.length === 0 ? '\nOK: semua pemeriksaan UI lolos.' : `\n${masalah.length} masalah UI.`);
process.exit(masalah.length === 0 ? 0 : 1);
