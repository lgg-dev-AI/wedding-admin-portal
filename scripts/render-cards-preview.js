const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 750, deviceScaleFactor: 2 });
  const fileUrl = 'file:///' + path.resolve('tarjetas-presentacion.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  const showcaseEl = await page.$('.showcase-container');
  await showcaseEl.screenshot({ path: 'assets/img/tarjetas_presentacion_preview.jpg', quality: 95, type: 'jpeg' });
  await browser.close();
  console.log('✅ Tarjetas preview generated successfully: assets/img/tarjetas_presentacion_preview.jpg');
})();
