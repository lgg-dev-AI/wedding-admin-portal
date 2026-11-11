const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BASE_DIR = 'C:\\Users\\Luis\\.gemini\\antigravity\\scratch\\wedding-admin-portal';
const ARTIFACT_DIR = 'C:\\Users\\Luis\\.gemini\\antigravity\\brain\\9cbaf1ea-6608-4175-9a0d-be1197676424';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1374411558';

function startLocalServer(port) {
    const MIME = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };
    const srv = http.createServer((req, res) => {
        let p = path.join(BASE_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
            res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
            fs.createReadStream(p).pipe(res);
        } else {
            res.writeHead(404);
            res.end();
        }
    });
    return new Promise(resolve => srv.listen(port, () => resolve(srv)));
}

async function run() {
    console.log('🚀 Iniciando Generación de Anuncio V2 (Fondo Real del Dashboard + Retina 2400x2400)...');
    const port = 5258;
    const srv = await startLocalServer(port);

    const uniqueProfile = path.join(os.tmpdir(), 'chrome_adv2_' + Date.now());

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        userDataDir: uniqueProfile,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });

    // 1. Configurar y capturar el Dashboard REAL
    console.log('📸 Capturando pantalla real del Dashboard de PaseBoda...');
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

    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    await page.evaluate(() => {
        if (typeof switchWedding === 'function') switchWedding('aura');
        if (typeof toggleMenuAccordion === 'function') toggleMenuAccordion('guests');
        const b = document.getElementById('demoFloatingBanner');
        if (b) {
            b.style.display = 'flex';
            const t = document.getElementById('demoBannerText');
            if (t) {
                t.innerHTML = '<strong>⏳ PRUEBA DE 15 DÍAS (AURA WEDDINGS):</strong> Te restan <strong>15 días</strong>. Mesas 2D, CRM y boletos activos. <span style="color:#fbbf24; font-weight:800; margin-left:8px;">PaseBoda Pro</span>';
            }
        }
    });

    const bgPath = path.join(BASE_DIR, 'assets', 'img', 'dashboard_real_bg.png');
    await page.screenshot({ path: bgPath, type: 'png' });
    console.log(`✅ Captura del dashboard guardada en: ${bgPath}`);

    // 2. Renderizar el anuncio final a 2400x2400 px
    console.log('🎨 Renderizando composición publicitaria final en alta resolución...');
    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:${port}/promocion-facebook-paseboda-v2.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500)); // Esperar fuentes de Google

    const outPng = path.join(BASE_DIR, 'anuncio_facebook_paseboda_hd.png');
    await page.screenshot({ path: outPng, type: 'png' });
    console.log(`🎉 Imagen publicitaria generada exitosamente: ${(fs.statSync(outPng).size / 1024).toFixed(1)} KB`);

    // Copiar al directorio de artefactos
    const artifactOut = path.join(ARTIFACT_DIR, 'anuncio_facebook_paseboda_hd.png');
    fs.copyFileSync(outPng, artifactOut);
    console.log(`✅ Artefacto actualizado en: ${artifactOut}`);

    await browser.close();
    try { fs.rmSync(uniqueProfile, { recursive: true, force: true }); } catch (e) {}
    srv.close();

    // 3. Enviar a Telegram
    console.log('📤 Enviando anuncio a Telegram (@WeddingOs_bot)...');
    try {
        const form = new FormData();
        form.append('chat_id', TELEGRAM_CHAT_ID);
        form.append('photo', new Blob([fs.readFileSync(outPng)], { type: 'image/png' }), 'anuncio_facebook_paseboda_hd.png');
        form.append('caption', '💎 <b>¡Nuevo Anuncio Publicitario PaseBoda Suite (V2 HD)!</b> 📸\n\n' +
            '• <b>Fondo Real:</b> Dashboard vivo de PaseBoda (Sofía & Alejandro, métricas y menú oficial).\n' +
            '• <b>Enfoque Dual:</b> Para novias que organizan su propia boda Y para wedding planners.\n' +
            '• <b>Colorimetría Oficial:</b> Navy (#0f172a), Oro Nupcial (#c5a059), Esmeralda (#10b981) y Blush (#e2a891).\n' +
            '• <b>Resolución:</b> 2400 x 2400 px (Retina Ultra HD, Cero espacios vacíos).\n' +
            '• <b>Contacto:</b> paseboda.com • WhatsApp: 81 2219 9352\n\n' +
            '<i>¡Descárgala directamente para pautar en Meta Ads!</i>');
        form.append('parse_mode', 'HTML');

        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: form
        });
        const data = await res.json();
        console.log('Resultado Telegram:', data.ok ? '✅ Entregada exitosamente' : data);
    } catch (err) {
        console.log('Aviso Telegram:', err.message);
    }
}

run().catch(console.error);
