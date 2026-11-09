const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 950, height: 1450, deviceScaleFactor: 2 });
  const fileUrl = 'file:///' + path.resolve('flyer-pared-doble.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  const posterEl = await page.$('.poster-canvas');
  await posterEl.screenshot({ path: 'assets/img/flyer_pared_doble_preview.jpg', quality: 95, type: 'jpeg' });
  await browser.close();
  console.log('✅ Preview generated successfully: assets/img/flyer_pared_doble_preview.jpg');
})();
