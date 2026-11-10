const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:/Users/Luis/.gemini/antigravity/scratch/wedding-admin-portal';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let filepath = path.join(BASE_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
    const ext = path.extname(filepath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filepath).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(5240, async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('antigravity_wedding_session', 'authenticated');
    sessionStorage.setItem('antigravity_logged_user', 'valeria.garza@auraweddings.com');
    sessionStorage.setItem('antigravity_agency_name', 'Aura Weddings & Events');
    sessionStorage.setItem('antigravity_planner_name', 'Valeria Garza Sada');
    sessionStorage.setItem('antigravity_user_role', 'planner');
    sessionStorage.setItem('antigravity_is_trial', 'true');
    sessionStorage.setItem('antigravity_demo_mode', 'true');
    sessionStorage.setItem('antigravity_is_demo_trial', 'true');
    localStorage.setItem('wp_active_wedding_id', 'aura');
  });

  await page.goto('http://localhost:5240/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const result = await page.evaluate(() => {
    if (typeof switchWedding === 'function') {
      switchWedding('aura');
    }
    const banner = document.getElementById('demoFloatingBanner');
    if (banner) {
      banner.style.display = 'flex';
      const text = document.getElementById('demoBannerText');
      if (text) {
        text.innerHTML = '<strong>⏳ PRUEBA DE 15 DÍAS:</strong> Te restan 15 días. Mesas 2D, CRM y boletos activos. <span style="color:#fbbf24; font-weight:bold; margin-left:8px;">PaseBoda Pro</span>';
      }
    }

    return {
      activeWeddingId: window.currentWeddingId,
      couple: window.currentData ? window.currentData.couple : 'none',
      guestsCount: (window.currentData && window.currentData.guests) ? window.currentData.guests.length : 0,
      tablesCount: (window.currentData && window.currentData.tables) ? window.currentData.tables.length : 0,
      bannerVisible: banner ? window.getComputedStyle(banner).display : 'none'
    };
  });

  console.log('Result from page:', result);
  await page.screenshot({ path: path.join(BASE_DIR, 'test-demo-aura.png') });
  console.log('Saved test-demo-aura.png');

  await browser.close();
  server.close();
});
