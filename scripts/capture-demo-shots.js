const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const BASE_DIR = 'C:/Users/Luis/.gemini/antigravity/scratch/wedding-admin-portal';
const PORT = 5220;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let filepath = path.join(BASE_DIR, parsed.pathname === '/' ? 'index.html' : parsed.pathname);
  if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
    const ext = path.extname(filepath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filepath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found: ' + parsed.pathname);
  }
});

server.listen(PORT, async () => {
  console.log(`Demo test server running on http://localhost:${PORT}`);
  const profileDir = path.join(BASE_DIR, '..', 'chrome-demo-captures-' + Date.now());

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    userDataDir: profileDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // Inyectar autenticación en MODO DEMO / PRUEBA 15 DÍAS
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('antigravity_wedding_session', 'authenticated');
    sessionStorage.setItem('antigravity_logged_user', 'valeria.garza@auraweddings.com');
    sessionStorage.setItem('antigravity_agency_name', 'Aura Weddings & Events');
    sessionStorage.setItem('antigravity_planner_name', 'Valeria Garza Sada');
    sessionStorage.setItem('antigravity_user_role', 'planner');
    sessionStorage.setItem('antigravity_is_trial', 'true');
    sessionStorage.setItem('antigravity_demo_mode', 'true');
    sessionStorage.setItem('antigravity_is_demo_trial', 'true');
    sessionStorage.setItem('antigravity_last_activity', Date.now().toString());
  });

  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // Forzar que el banner de 15 días de prueba esté visible y bonito
  await page.evaluate(() => {
    const banner = document.getElementById('demoFloatingBanner');
    if (banner) {
      banner.style.display = 'flex';
      const text = document.getElementById('demoBannerText');
      if (text) {
        text.innerHTML = '<strong>⏳ PRUEBA DE 15 DÍAS (AURA WEDDINGS):</strong> Te restan <strong>15 días</strong>. Mesas 2D, CRM y boletos activos. <span style="color:#fbbf24; font-weight:800; margin-left:8px;">💳 PaseBoda Suite Pro</span>';
      }
    }
  });

  // 1. Dashboard en Modo Demo con Banner de 15 Días
  await page.screenshot({ path: path.join(BASE_DIR, 'demo-shot-1-dashboard.png') });
  console.log('✅ Shot 1: Dashboard en Modo Demo');

  // 2. Seating 2D Overview
  await page.evaluate(() => {
    if (typeof showTab === 'function') showTab('seating');
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(BASE_DIR, 'demo-shot-2-seating.png') });
  console.log('✅ Shot 2: Plano 2D Seating');

  // 3. Seating 2D Close-up (Zoom en mesas)
  await page.evaluate(() => {
    const container = document.getElementById('seatingCanvasArea') || document.querySelector('.seating-viewport') || document.querySelector('.seating-container');
    if (container) {
      container.style.transform = 'scale(1.22)';
      container.style.transformOrigin = 'center center';
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(BASE_DIR, 'demo-shot-3-seating-zoom.png') });
  console.log('✅ Shot 3: Plano 2D Zoom');

  // 4. Modo Novios (Vista limpia sin estrés)
  await page.evaluate(() => {
    if (typeof setRole === 'function') setRole('couple');
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(BASE_DIR, 'demo-shot-4-novios.png') });
  console.log('✅ Shot 4: Modo Novios');

  // 5. Despacho WhatsApp & Boleto Digital
  await page.evaluate(() => {
    if (typeof setRole === 'function') setRole('planner');
    if (typeof showTab === 'function') showTab('dispatch');
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(BASE_DIR, 'demo-shot-5-dispatch.png') });
  console.log('✅ Shot 5: Despacho WhatsApp & Boletos');

  // 6. Hostess Express (Recepción en puerta)
  await page.evaluate(() => {
    if (typeof showTab === 'function') showTab('hostess');
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(BASE_DIR, 'demo-shot-6-hostess.png') });
  console.log('✅ Shot 6: Hostess Express');

  // 7. Minuta Día D
  await page.evaluate(() => {
    if (typeof showTab === 'function') showTab('dayof');
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(BASE_DIR, 'demo-shot-7-dayof.png') });
  console.log('✅ Shot 7: Minuta Día D');

  await browser.close();
  server.close();
  console.log('🏁 Todas las capturas en Modo Demo listas.');
});
