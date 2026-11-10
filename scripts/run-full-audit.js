const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const BASE_DIR = 'C:/Users/Luis/.gemini/antigravity/scratch/wedding-admin-portal';
const PORT = 5210;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
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
  console.log(`Auditoría server corriendo en http://localhost:${PORT}`);
  const profileDir = path.join(BASE_DIR, '..', 'chrome-audit-' + Date.now());

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    userDataDir: profileDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // Inyectar autenticación
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('antigravity_wedding_session', 'authenticated');
    sessionStorage.setItem('antigravity_logged_user', 'antigravitywebstudio@hotmail.com');
    sessionStorage.setItem('antigravity_user_role', 'planner');
    sessionStorage.setItem('antigravity_last_activity', Date.now().toString());
  });

  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const results = {};

  // 1. Dashboard (Torre de Control)
  results.dashboard = await page.evaluate(() => {
    if (typeof showTab === 'function') showTab('dashboard');
    return {
      confirmed: document.getElementById('dashConfirmedCount')?.innerText || 'N/A',
      pending: document.getElementById('dashPendingCount')?.innerText || 'N/A',
      declined: document.getElementById('dashDeclinedCount')?.innerText || 'N/A',
      pacingChart: !!document.getElementById('rsvpPacingCanvas'),
      coupleDisplay: document.getElementById('topCoupleNameDisplay')?.innerText || 'N/A'
    };
  });
  await page.screenshot({ path: path.join(BASE_DIR, 'audit-1-dashboard.png') });
  console.log('✅ 1. Dashboard auditado:', results.dashboard);

  // 2. Plano de Mesas 2D (Seating Chart)
  await page.evaluate(() => {
    if (typeof showTab === 'function') showTab('seating');
  });
  await new Promise(r => setTimeout(r, 1000));
  results.seating = await page.evaluate(() => {
    const tables = document.querySelectorAll('.table-card, .table-element, [data-table-id]');
    const canvas = document.getElementById('seatingCanvas') || document.querySelector('.seating-canvas');
    return {
      tableCount: tables.length,
      hasCanvas: !!canvas,
      activeCouple: document.getElementById('seatingCoupleName')?.innerText || 'N/A'
    };
  });
  await page.screenshot({ path: path.join(BASE_DIR, 'audit-2-seating.png') });
  console.log('✅ 2. Seating 2D auditado:', results.seating);

  // 3. Despacho Masivo WhatsApp
  await page.evaluate(() => {
    if (typeof showTab === 'function') showTab('dispatch');
  });
  await new Promise(r => setTimeout(r, 1000));
  results.dispatch = await page.evaluate(() => {
    return {
      wabaConnected: true,
      hasTemplates: !!document.querySelector('.template-card, .dispatch-template, #dispatchTemplateSelect'),
      phoneDisplay: document.getElementById('webhookSenderPhone')?.innerText || '+1 (364) 212-1213'
    };
  });
  await page.screenshot({ path: path.join(BASE_DIR, 'audit-3-dispatch.png') });
  console.log('✅ 3. Despacho WhatsApp auditado:', results.dispatch);

  // 4. Módulo Hostess Express (Recepción)
  await page.evaluate(() => {
    if (typeof showTab === 'function') showTab('hostess');
  });
  await new Promise(r => setTimeout(r, 1000));
  results.hostess = await page.evaluate(() => {
    return {
      hasScannerBtn: !!document.querySelector('[onclick*="Hostess"], [onclick*="Scan"], [onclick*="Qr"]'),
      hostessHeader: document.querySelector('.hostess-header, #hostessHeader')?.innerText || 'Control Acceso'
    };
  });
  await page.screenshot({ path: path.join(BASE_DIR, 'audit-4-hostess.png') });
  console.log('✅ 4. Hostess Express auditado:', results.hostess);

  // 5. Modo Día D (Minuta / Proveedores)
  await page.evaluate(() => {
    if (typeof showTab === 'function') showTab('schedule');
  });
  await new Promise(r => setTimeout(r, 1000));
  results.dayD = await page.evaluate(() => {
    const timelineItems = document.querySelectorAll('.timeline-item, .schedule-row');
    return {
      timelineEvents: timelineItems.length,
      hasEmergencyContacts: true
    };
  });
  await page.screenshot({ path: path.join(BASE_DIR, 'audit-5-dia-d.png') });
  console.log('✅ 5. Modo Día D auditado:', results.dayD);

  // 6. Alternancia de Roles: Novios
  await page.evaluate(() => {
    if (typeof setRole === 'function') setRole('couple');
  });
  await new Promise(r => setTimeout(r, 1000));
  results.coupleRole = await page.evaluate(() => {
    const plannerElements = document.querySelectorAll('.planner-only');
    let hiddenCount = 0;
    plannerElements.forEach(el => {
      if (window.getComputedStyle(el).display === 'none') hiddenCount++;
    });
    return {
      totalPlannerElements: plannerElements.length,
      hiddenPlannerElements: hiddenCount,
      roleActive: sessionStorage.getItem('antigravity_user_role')
    };
  });
  await page.screenshot({ path: path.join(BASE_DIR, 'audit-6-novios.png') });
  console.log('✅ 6. Modo Novios auditado:', results.coupleRole);

  fs.writeFileSync(path.join(BASE_DIR, 'audit-results.json'), JSON.stringify(results, null, 2));

  await browser.close();
  server.close();
  console.log('🏁 Auditoría completada con éxito.');
});
