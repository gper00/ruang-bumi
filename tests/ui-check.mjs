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
  '/topik/atmosfer/el-nino-la-nina/',
  '/topik/atmosfer/lapisan-atmosfer/',
  '/topik/atmosfer/musim/',
  '/topik/atmosfer/siklus-air/',
  '/topik/ekologi/bioma/',
  '/topik/planet-bumi/gempa-bumi/',
  '/topik/planet-bumi/gunung-api/',
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
      // Dua topik memuat kata "gempa": lempeng tektonik dan gempa bumi.
      let tampil = await page.locator('.kartu-topik:visible').count();
      if (tampil !== 2) catat(`Beranda: pencarian "gempa" menampilkan ${tampil} kartu, seharusnya 2`);
      if ((await page.locator('.kartu-topik:visible', { hasText: 'bergetar' }).count()) !== 1)
        catat('Beranda: topik gempa bumi tidak muncul saat mencari "gempa"');
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

      // Tab empat bioma: hanya satu panel tampil, panel bertukar lewat klik dan panah,
      // dan setiap visual menanggapi kontrolnya sendiri.
      const tabBioma = (nama) => page.getByRole('tab', { name: new RegExp(nama) });
      const panelBioma = async () => page.locator('.bt-panel:visible').count();
      const tungguVisual = async (nama) => {
        await page.waitForFunction(
          (komponen) => {
            const island = document.querySelector(`astro-island[component-url*="${komponen}"]`);
            return island !== null && !island.hasAttribute('ssr');
          },
          nama,
          { timeout: 15000 },
        );
      };

      if ((await panelBioma()) !== 1)
        catat(`Bioma tab: ${await panelBioma()} panel terlihat saat halaman dibuka, seharusnya 1`);

      await tabBioma('Tundra').click();
      if (!(await page.locator('#bioma-tundra').isVisible()))
        catat('Bioma tab: memilih Tundra tidak menampilkan panelnya');
      if ((await panelBioma()) !== 1)
        catat('Bioma tab: panel lain tidak disembunyikan setelah tab diganti');
      if (!page.url().endsWith('#bioma-tundra'))
        catat(`Bioma tab: alamat tidak menyimpan tab aktif (${page.url()})`);

      await tabBioma('Stepa').click();
      await page.locator('#bioma-stepa').scrollIntoViewIfNeeded();
      await tungguVisual('StepaGangguan');
      await page.locator('.st-tombol', { hasText: 'Kebakaran' }).click();
      if ((await page.locator('.st-meter-nilai').textContent())?.trim() !== 'rendah')
        catat('Stepa: skenario kebakaran tidak menurunkan tutupan pohon');

      await tabBioma('Hutan gugur').click();
      await page.locator('#bioma-hutan-gugur').scrollIntoViewIfNeeded();
      await tungguVisual('HutanGugurMusim');
      await page.locator('.hg-slider input').fill('0');
      if ((await page.locator('.hg-bulan').textContent())?.trim() !== 'Januari')
        catat('Hutan gugur: slider bulan tidak mengganti bulan');
      if (!(await page.locator('.hg-daun-status').textContent())?.includes('tidak ada'))
        catat('Hutan gugur: musim dingin tidak digambarkan tanpa daun');

      await tabBioma('Taiga').click();
      await page.locator('#bioma-taiga').scrollIntoViewIfNeeded();
      await tungguVisual('TaigaMusim');
      await page.locator('.tg-tombol', { hasText: 'Musim panas' }).click();
      if ((await page.locator('.tg-daun-lebar').textContent())?.trim() !== 'ada')
        catat('Taiga: musim panas tidak menumbuhkan kembali daun lebar');

      await tabBioma('Tundra').click();
      await page.locator('#bioma-tundra').scrollIntoViewIfNeeded();
      await tungguVisual('TundraMusim');
      await page.locator('.tu-slider input').fill('0');
      if (!(await page.locator('.tu-nilai').first().textContent())?.includes('30 cm'))
        catat('Tundra: Januari tidak menipiskan lapisan aktif');
      if (!(await page.locator('.tu-ringkas').textContent())?.toLowerCase().includes('membeku'))
        catat('Tundra: ringkasan Januari tidak menyebut lapisan aktif membeku');

      await tabBioma('Tundra').focus();
      await page.keyboard.press('Home');
      const tabAktif = await page.locator('.bt-tab[aria-selected="true"]').textContent();
      if (!tabAktif?.includes('Stepa'))
        catat(`Bioma tab: tombol Home tidak memindahkan tab ke tab pertama (${tabAktif})`);

      await page.goto(base + '/topik/atmosfer/lapisan-atmosfer/', { waitUntil: 'networkidle' });
      await page.locator('.atl-slider input').fill('5');
      if ((await page.locator('.atl-km').textContent())?.trim() !== '5 km')
        catat('Lapisan atmosfer: slider tidak mengganti angka ketinggian');
      const lapisanKontrol = page.locator('.atl-hasil > div').first();
      if (!(await lapisanKontrol.textContent())?.includes('Troposfer'))
        catat('Lapisan atmosfer: 5 km tidak dibaca sebagai troposfer');
      const cxAwal = await page.locator('.atl-titik').getAttribute('cx');

      await page.locator('.atl-slider input').fill('60');
      const suhuKontrol = page.locator('.atl-hasil > div').nth(1);
      if (!(await lapisanKontrol.textContent())?.includes('Mesosfer'))
        catat(`Lapisan atmosfer: 60 km menunjukkan ${await lapisanKontrol.textContent()}`);
      if (!(await suhuKontrol.textContent())?.includes('−'))
        catat(`Lapisan atmosfer: suhu 60 km tidak negatif (${await suhuKontrol.textContent()})`);
      if ((await page.locator('.atl-titik').getAttribute('cx')) === cxAwal)
        catat('Lapisan atmosfer: penanda kurva tidak bergerak saat ketinggian digeser');

      await page.goto(base + '/topik/planet-bumi/gempa-bumi/', { waitUntil: 'networkidle' });
      await tungguVisual('GempaRebound');
      const nilaiSesar = page.locator('.grb-hasil .grb-nilai');
      await page.locator('.grb-slider input').fill('60');
      if ((await nilaiSesar.nth(0).textContent())?.trim() !== 'tersangkut')
        catat(`Gempa: regangan 60% seharusnya tersangkut (${await nilaiSesar.nth(0).textContent()})`);
      const pagarTertekuk = await page.locator('.grb-pagar').getAttribute('points');

      await page.locator('.grb-slider input').fill('100');
      await page.locator('.grb-tombol', { hasText: 'Lepaskan regangan' }).click();
      if ((await nilaiSesar.nth(0).textContent())?.trim() !== 'meluncur')
        catat('Gempa: melepas regangan tidak membuat sesar meluncur');
      if ((await page.locator('.grb-pagar').getAttribute('points')) === pagarTertekuk)
        catat('Gempa: bentuk pagar tidak berubah setelah sesar meluncur');
      if ((await nilaiSesar.nth(2).textContent())?.trim() !== '2,6 m')
        catat(`Gempa: geser permanen tidak muncul setelah meluncur (${await nilaiSesar.nth(2).textContent()})`);

      await page.locator('.gfk-slider input').first().scrollIntoViewIfNeeded();
      await tungguVisual('GempaFokus');
      const nilaiFokus = page.locator('.gfk-hasil .gfk-nilai');
      const ambilAngka = (teks) => Number((teks ?? '').match(/(\d+)/)?.[1] ?? NaN);

      await page.locator('.gfk-slider input').first().fill('10');
      if ((await nilaiFokus.nth(0).textContent())?.trim() !== 'Dangkal')
        catat(`Gempa: kedalaman 10 km bukan kelas dangkal (${await nilaiFokus.nth(0).textContent()})`);

      await page.locator('.gfk-slider input').first().fill('600');
      if ((await nilaiFokus.nth(0).textContent())?.trim() !== 'Dalam')
        catat('Gempa: kedalaman 600 km bukan kelas dalam');
      if ((await nilaiFokus.nth(2).textContent())?.trim() !== 'lemah')
        catat('Gempa: getaran gempa 600 km tidak dinilai lemah');
      const jarakEpi = ambilAngka(await page.locator('.gfk-hasil .gfk-extra').nth(1).textContent());
      const jarakHipo = ambilAngka(await nilaiFokus.nth(1).textContent());
      if (!(jarakHipo > jarakEpi))
        catat(
          `Gempa: jarak hiposentrum ${jarakHipo} tidak lebih panjang daripada jarak episentrum ${jarakEpi}`,
        );

      await page.goto(base + '/topik/planet-bumi/gunung-api/', { waitUntil: 'networkidle' });
      await tungguVisual('SimErupsi');
      const sliderErupsi = page.locator('.seu-slider input');
      await sliderErupsi.first().scrollIntoViewIfNeeded();
      const nilaiErupsi = page.locator('.seu-hasil .seu-nilai');

      await sliderErupsi.first().fill('10');
      await sliderErupsi.nth(1).fill('10');
      if ((await nilaiErupsi.nth(0).textContent())?.trim() !== 'Efusif')
        catat(
          `Gunung api: kekentalan 10 dan gas 10 seharusnya efusif (${await nilaiErupsi.nth(0).textContent()})`,
        );
      if (!(await nilaiErupsi.nth(1).textContent())?.includes('Perisai'))
        catat('Gunung api: magma encer seharusnya menghasilkan gunung perisai');
      const lerengAwal = await page.locator('.seu-hasil .seu-extra').nth(1).textContent();
      if (!(await page.locator('.seu-ringkas').textContent())?.includes('menyebar jauh'))
        catat('Gunung api: ringkasan gaya efusif tidak muncul pada magma encer');

      await sliderErupsi.first().fill('100');
      await sliderErupsi.nth(1).fill('100');
      if ((await nilaiErupsi.nth(0).textContent())?.trim() !== 'Eksplosif')
        catat('Gunung api: kekentalan dan gas maksimal seharusnya eksplosif');
      if ((await nilaiErupsi.nth(1).textContent())?.includes('Perisai'))
        catat('Gunung api: magma kental seharusnya tidak berbentuk perisai');
      if ((await page.locator('.seu-hasil .seu-extra').nth(1).textContent()) === lerengAwal)
        catat('Gunung api: lereng tidak berubah saat kekentalan digeser');
      if (!(await page.locator('.seu-ringkas').textContent())?.includes('menahan gas'))
        catat('Gunung api: ringkasan gaya eksplosif tidak muncul pada magma kental ber gas tinggi');

      const persenGas = (await nilaiErupsi.nth(2).textContent())?.trim();
      if (persenGas !== '100%')
        catat(`Gunung api: gas terperangkap pada kedua slider maksimal adalah ${persenGas}, seharusnya 100%`);

      await page.goto(base + '/topik/atmosfer/musim/', { waitUntil: 'networkidle' });
      await page.locator('.sms-slider input').fill('9');
      const bulan = await page.locator('.sms-bulan').textContent();
      if (bulan?.trim() !== 'Oktober') catat(`Musim: slider menunjukkan "${bulan}", seharusnya Oktober`);

      await page.goto(base + '/topik/atmosfer/angin-darat-laut/', { waitUntil: 'networkidle' });
      await page.locator('.sal-slider input').fill('2');
      const lencana = await page.locator('.sal-lencana-label').textContent();
      if (lencana?.trim() !== 'Angin darat') catat(`Angin: pukul 02.00 menunjukkan "${lencana}"`);

      await page.goto(base + '/topik/atmosfer/el-nino-la-nina/', { waitUntil: 'networkidle' });
      await tungguVisual('PetaEnso');
      const nilaiEnso = page.locator('.pe-hasil .pe-nilai');
      const sliderEnso = page.locator('.pe-slider input');
      await sliderEnso.scrollIntoViewIfNeeded();

      if ((await nilaiEnso.nth(0).textContent())?.trim() !== 'El Niño')
        catat(
          `ENSO: keadaan awal seharusnya El Niño (${await nilaiEnso.nth(0).textContent()})`,
        );

      await sliderEnso.fill('-1.5');
      if ((await nilaiEnso.nth(0).textContent())?.trim() !== 'La Niña')
        catat('ENSO: anomali −1,5 °C bukan La Niña');
      if ((await nilaiEnso.nth(1).textContent())?.trim() !== 'lebih kencang')
        catat('ENSO: La Niña tidak menampilkan angin pasat lebih kencang');
      if ((await nilaiEnso.nth(2).textContent())?.trim() !== '125°BT')
        catat(`ENSO: pita hujan La Niña bukan 125°BT (${await nilaiEnso.nth(2).textContent()})`);

      await sliderEnso.fill('1.5');
      if ((await nilaiEnso.nth(0).textContent())?.trim() !== 'El Niño')
        catat('ENSO: anomali +1,5 °C bukan El Niño');
      if ((await nilaiEnso.nth(1).textContent())?.trim() !== 'melemah')
        catat('ENSO: El Niño tidak menampilkan angin pasat melemah');
      if ((await nilaiEnso.nth(2).textContent())?.trim() !== '169°BB')
        catat(`ENSO: pita hujan El Niño bukan 169°BB (${await nilaiEnso.nth(2).textContent()})`);
      if (!(await page.locator('.pe-ringkas').textContent())?.includes('kemarau'))
        catat('ENSO: ringkasan El Niño tidak menyebut kemarau yang lebih panjang');

      await page.locator('.pe-toggle button', { hasText: 'Netral' }).click();
      if ((await nilaiEnso.nth(0).textContent())?.trim() !== 'Netral')
        catat('ENSO: tombol Netral tidak mengubah fase');
      if ((await nilaiEnso.nth(1).textContent())?.trim() !== 'normal')
        catat('ENSO: tahun netral tidak menampilkan angin pasat normal');

      const panelBanding = page.locator('.be-panel');
      if ((await panelBanding.count()) !== 2)
        catat(`ENSO: pembanding menampilkan ${await panelBanding.count()} panel, seharusnya 2`);
      const hujanBanding = (await page.locator('.be-hujan-nilai').allTextContents()).map((t) =>
        t.trim(),
      );
      if (hujanBanding.join('|') !== '155°BB|125°BT')
        catat(`ENSO: pita hujan pembanding ${hujanBanding.join('|')}, seharusnya 155°BB|125°BT`);
      const tebalPanah = await page
        .locator('.be-panel .be-panah')
        .evaluateAll((els) => [...new Set(els.map((el) => el.getAttribute('stroke-width')))]);
      if (tebalPanah.join('|') !== '2|5')
        catat(`ENSO: tebal panah pembanding ${tebalPanah.join('|')}, seharusnya 2|5`);

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

  // Progresif: tanpa JavaScript keempat panel bioma tetap terbaca dan bar tab tidak ada.
  {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(base + '/topik/ekologi/bioma/', { waitUntil: 'domcontentloaded' });
    const panel = await page.locator('.bt-panel:visible').count();
    if (panel !== 4) catat(`Bioma tanpa JS: ${panel} panel terlihat, seharusnya 4`);
    if ((await page.locator('.bt-tab').count()) !== 0)
      catat('Bioma tanpa JS: bar tab tetap dirender');
    for (const id of ['bioma-stepa', 'bioma-hutan-gugur', 'bioma-taiga', 'bioma-tundra']) {
      const judul = await page.locator(`#${id} .bt-panel-judul`).textContent();
      if (!judul?.trim()) catat(`Bioma tanpa JS: judul panel ${id} kosong`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(masalah.length === 0 ? '\nOK: semua pemeriksaan UI lolos.' : `\n${masalah.length} masalah UI.`);
process.exit(masalah.length === 0 ? 0 : 1);
