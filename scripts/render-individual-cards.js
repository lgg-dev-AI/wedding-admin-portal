const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1374411558';

async function renderAndSendIndividualCards() {
    console.log('🚀 Iniciando renderizado de tarjetas individuales...');

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 1200, deviceScaleFactor: 2 });

    const fileUrl = 'file:///' + path.resolve('tarjetas-presentacion.html').replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    const pbPath = path.resolve('assets/img/tarjeta_paseboda_hd.jpg');
    const sbPath = path.resolve('assets/img/tarjeta_sobreboda_hd.jpg');

    // 1. Captura individual PaseBoda
    const pbEl = await page.$('#card-pb-standalone');
    await pbEl.screenshot({ path: pbPath, quality: 95, type: 'jpeg' });
    console.log('✅ Tarjeta PaseBoda capturada en:', pbPath);

    // 2. Captura individual Sobreboda
    const sbEl = await page.$('#card-sb-standalone');
    await sbEl.screenshot({ path: sbPath, quality: 95, type: 'jpeg' });
    console.log('✅ Tarjeta Sobreboda capturada en:', sbPath);

    await browser.close();

    // Copiar a directorio de artifacts
    const artifactDir = 'C:\\Users\\Luis\\.gemini\\antigravity\\brain\\9cbaf1ea-6608-4175-9a0d-be1197676424';
    fs.copyFileSync(pbPath, path.join(artifactDir, 'tarjeta_paseboda_hd.jpg'));
    fs.copyFileSync(sbPath, path.join(artifactDir, 'tarjeta_sobreboda_hd.jpg'));
    console.log('✅ Copiadas a carpeta de artifacts.');

    // 3. Enviar Imagen 1 a Telegram: PaseBoda
    console.log('📤 Enviando Tarjeta 1 (PaseBoda) a Telegram...');
    const pbBuffer = fs.readFileSync(pbPath);
    const pbForm = new FormData();
    pbForm.append('chat_id', TELEGRAM_CHAT_ID);
    pbForm.append('photo', new Blob([pbBuffer], { type: 'image/jpeg' }), 'tarjeta_paseboda_hd.jpg');
    pbForm.append('caption', '🟣 <b>TARJETA 1: PASEBODA</b> (9 x 5 cm)\n\n' +
        '• <b>Público:</b> Wedding Planners y Novias en planeación.\n' +
        '• <b>Pregunta Gancho:</b> <i>\"¿Eres Wedding Planner o te vas a casar próximamente?\"</i>\n' +
        '• <b>Beneficios Clave:</b>\n' +
        '  🪑 Mesas 2D Drag & Drop en minutos\n' +
        '  💬 WhatsApp Oficial & Boletos QR\n' +
        '  📲 Hostess Check-in ágil en puerta\n\n' +
        '🎟️ <b>QR:</b> 15 Días Gratis en paseboda.com');
    pbForm.append('parse_mode', 'HTML');

    const resPb = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: pbForm
    });
    const dataPb = await resPb.json();
    console.log('Resultado Telegram PaseBoda:', dataPb.ok ? '✅ Entregado' : dataPb);

    // 4. Enviar Imagen 2 a Telegram: Sobreboda
    console.log('📤 Enviando Tarjeta 2 (Sobreboda) a Telegram...');
    const sbBuffer = fs.readFileSync(sbPath);
    const sbForm = new FormData();
    sbForm.append('chat_id', TELEGRAM_CHAT_ID);
    sbForm.append('photo', new Blob([sbBuffer], { type: 'image/jpeg' }), 'tarjeta_sobreboda_hd.jpg');
    sbForm.append('caption', '🟤 <b>TARJETA 2: SOBREBODA</b> (9 x 5 cm)\n\n' +
        '• <b>Público:</b> Parejas buscando invitación digital boutique.\n' +
        '• <b>Pregunta Gancho:</b> <i>\"¿Ya tienes tu boda planeada, pero te faltan las invitaciones?\"</i>\n' +
        '• <b>Beneficios Clave:</b>\n' +
        '  🎵 Música Romántica & Cuenta Regresiva\n' +
        '  📍 Navegación Google Maps & Waze en 1 toque\n' +
        '  🎁 Mesa de Regalos con CLABE directa\n\n' +
        '✨ <b>QR:</b> Ver Demos en Vivo en sobreboda.com');
    sbForm.append('parse_mode', 'HTML');

    const resSb = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: sbForm
    });
    const dataSb = await resSb.json();
    console.log('Resultado Telegram Sobreboda:', dataSb.ok ? '✅ Entregado' : dataSb);
}

renderAndSendIndividualCards().catch(console.error);
