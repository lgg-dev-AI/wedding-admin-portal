const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const os = require('os');

const BASE_DIR = 'C:\\Users\\Luis\\.gemini\\antigravity\\scratch\\wedding-admin-portal';
const ARTIFACT_DIR = 'C:\\Users\\Luis\\.gemini\\antigravity\\brain\\9cbaf1ea-6608-4175-9a0d-be1197676424';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1374411558';

async function generateAdImage() {
    console.log('🚀 Renderizando Imagen Publicitaria HD para Facebook (1200x1200px Retina)...');
    const uniqueProfile = path.join(os.tmpdir(), 'chrome_ad_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        userDataDir: uniqueProfile,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,1200']
    });

    const page = await browser.newPage();
    // Renderizamos a 2x Device Scale Factor (2400x2400 nativo) para nitidez absoluta sin pixelado
    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });

    const htmlPath = path.join(BASE_DIR, 'promocion-facebook-paseboda.html');
    await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500)); // Esperar carga de Google Fonts

    const outPng = path.join(BASE_DIR, 'anuncio_facebook_paseboda_hd.png');
    await page.screenshot({ path: outPng, type: 'png' });
    console.log(`✅ Imagen HD generada: ${(fs.statSync(outPng).size / 1024).toFixed(1)} KB`);

    // Copiar al directorio de artefactos
    const artifactOut = path.join(ARTIFACT_DIR, 'anuncio_facebook_paseboda_hd.png');
    fs.copyFileSync(outPng, artifactOut);
    console.log(`✅ Copiada al directorio de artefactos: ${artifactOut}`);

    await browser.close();
    try { fs.rmSync(uniqueProfile, { recursive: true, force: true }); } catch (e) {}

    // Enviar a Telegram
    console.log('📤 Enviando imagen a Telegram (@WeddingOs_bot)...');
    try {
        const form = new FormData();
        form.append('chat_id', TELEGRAM_CHAT_ID);
        form.append('photo', new Blob([fs.readFileSync(outPng)], { type: 'image/png' }), 'anuncio_facebook_paseboda_hd.png');
        form.append('caption', '✨ <b>¡Imagen Promocional HD para Facebook Ads!</b> 📸\n\n' +
            '• <b>Resolución:</b> 2400x2400 px (Retina Ultra HD, Cero Pixelado).\n' +
            '• <b>Pilares que muestra:</b>\n' +
            '  1. 🪑 Plano de Mesas 2D & Salón (Pista, escenario, comensales).\n' +
            '  2. ⏱️ Minuta & Cronograma Oficial Minuto a Minuto.\n' +
            '  3. 📊 Control de Asistencia & Banquetes (Dietas especiales / Alergias).\n' +
            '  4. 📲 Boletos VIP WhatsApp con Código QR Individual.\n\n' +
            '• <b>Llamado a la Acción (CTA):</b>\n' +
            '  👉 <i>Prueba 15 Días Gratis en paseboda.com</i>\n' +
            '  💬 <i>WhatsApp de Asesoría Directa: 81 2219 9352</i>\n\n' +
            '<i>¡Descárgala directamente para subirla a tu campaña de Facebook / Instagram!</i>');
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

generateAdImage().catch(console.error);
