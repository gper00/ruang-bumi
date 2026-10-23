/**
 * Repro: kunjungi semua topik ber-map, laporkan status MapView + error console.
 * Usage: node tests/repro-map.mjs [baseUrl]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const base = process.argv[2] ?? 'http://localhost:4321';

function cariChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const akar = path.join(os.homedir(), '.cache/ms-playwright');
  if (!fs.existsSync(akar)) return undefined;
  const builds = fs.readdirSync(akar).filter((n) => n.startsWith('chromium-')).sort().reverse();
  for (const b of builds) {
    for (const rel of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
      const p = path.join(akar, b, rel);
      if (fs.existsSync(p)) return p;
    }
  }
  return undefined;
}

const HALAMAN = [
  '/topik/planet-bumi/lempeng-tektonik/',
  '/topik/laut/ocean/',
  '/topik/laut/owen/',
  '/topik/daratan/sungai/',
  '/topik/daratan/danau/',
  '/topik/penutup/menghubungkan/',
];

const browser = await chromium.launch({ executablePath: cariChromium() });
const page = await browser.newPage();

for (const h of HALAMAN) {
  const log = [];
  page.removeAllListeners('console');
  page.on('console', (m) => {
    if (m.type() === 'error') log.push(m.text());
  });
  await page.goto(base + h, { waitUntil: 'networkidle' });
  // Paksa hydrate island client:visible dengan scroll.
  const mv = page.locator('.mv').first();
  const adaMv = (await mv.count()) > 0;
  if (adaMv) await mv.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const status = adaMv
    ? await page.locator('.mv-status').allTextContents()
    : ['(tidak ada .mv)'];
  const tombolLayer = adaMv
    ? await page.locator('.mv-group[aria-label="Lapisan peta"] button').allTextContents()
    : [];
  console.log(JSON.stringify({ h, status, tombolLayer, consoleErrors: log.slice(0, 4) }, null, 0));
}

await browser.close();
