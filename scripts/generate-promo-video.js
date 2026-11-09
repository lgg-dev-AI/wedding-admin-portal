const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1374411558';

async function generateAndSendVideo() {
    console.log('🚀 Iniciando generador de video promocional de PaseBoda...');
    
    const outputPathWebm = path.join(__dirname, 'promo_paseboda.webm');
    const outputPathMp4 = path.join(__dirname, 'PaseBoda_Reels_Promo.mp4');

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=720,1280'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 720, height: 1280, deviceScaleFactor: 1 });

    console.log('🎬 Renderizando escenas y grabando canvas a 720x1280 (9:16 Reels)...');

    const videoBase64 = await page.evaluate(async () => {
        const width = 720;
        const height = 1280;
        const fps = 30;
        const totalDurationSec = 25;
        const totalFrames = fps * totalDurationSec; // 750 frames

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const stream = canvas.captureStream(fps);
        const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 4500000 // 4.5 Mbps alta calidad
        });

        const chunks = [];
        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        const stoppedPromise = new Promise(resolve => recorder.onstop = resolve);

        recorder.start();

        // Helpers de animación y dibujo
        function lerp(a, b, t) { return a + (b - a) * t; }
        function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
        function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

        function drawGlassCard(x, y, w, h, radius, bg = 'rgba(30, 41, 59, 0.75)', border = 'rgba(255, 255, 255, 0.12)') {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
            ctx.fillStyle = bg;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = border;
            ctx.stroke();
            ctx.restore();
        }

        function drawGoldBadge(text, x, y) {
            ctx.save();
            ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const m = ctx.measureText(text);
            const w = m.width + 28;
            const h = 32;
            const bx = x - w / 2;
            ctx.beginPath();
            ctx.roundRect(bx, y - 20, w, h, 16);
            ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#fbbf24';
            ctx.textAlign = 'center';
            ctx.fillText(text, x, y + 2);
            ctx.restore();
        }

        // Renderizado frame a frame
        for (let frame = 0; frame < totalFrames; frame++) {
            const time = frame / fps; // tiempo en segundos

            // Fondo gradiente lujoso
            const bgGrad = ctx.createLinearGradient(0, 0, width, height);
            bgGrad.addColorStop(0, '#090d16');
            bgGrad.addColorStop(0.5, '#0f172a');
            bgGrad.addColorStop(1, '#020617');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // Partículas o resplandor dorado suave
            ctx.save();
            const glow = ctx.createRadialGradient(width / 2, height * 0.35, 10, width / 2, height * 0.35, 450);
            glow.addColorStop(0, 'rgba(217, 119, 6, 0.12)');
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();

            // =========================================================================
            // ESCENA 1: EL GANCHO (0s a 5s) - ¿Planeando tu boda? Adiós al Excel
            // =========================================================================
            if (time < 5.0) {
                const p = time / 5.0;
                drawGoldBadge('✨ LA NUEVA FORMA DE PLANEAR', width / 2, 160);

                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('¿Planeando tu Boda?', width / 2, 240);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('Dile adiós al caos de Excel y a perseguir', width / 2, 290);
                ctx.fillText('invitados por semanas.', width / 2, 320);
                ctx.restore();

                // Tarjeta comparativa visual "Antes vs Ahora"
                const cardY = 380 + Math.sin(time * 2) * 5;
                drawGlassCard(40, cardY, width - 80, 480, 24, 'rgba(15, 23, 42, 0.85)', 'rgba(245, 158, 11, 0.3)');

                // Icono animado de Excel con cruz roja
                ctx.save();
                ctx.fillStyle = '#ef4444';
                ctx.font = 'bold 22px sans-serif';
                ctx.fillText('❌  EL MÉTODO TRADICIONAL', 70, cardY + 50);

                ctx.fillStyle = '#cbd5e1';
                ctx.font = '16px monospace';
                const rows = [
                    '• Lista_Boda_Final_v3_REAL.xlsx',
                    '• 240 filas sin confirmación',
                    '• Mesas dibujadas en PowerPoint',
                    '• Listas de papel tachadas en la entrada'
                ];
                rows.forEach((r, idx) => {
                    ctx.fillText(r, 70, cardY + 95 + idx * 32);
                });

                // Línea divisoria elegante
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.moveTo(70, cardY + 240);
                ctx.lineTo(width - 70, cardY + 240);
                ctx.stroke();

                // La solución PaseBoda
                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 22px sans-serif';
                ctx.fillText('✨  CON PASEBODA TODO EN 1', 70, cardY + 285);

                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                const pbFeatures = [
                    '⚡ Mesas 2D interactivas Drag & Drop',
                    '💬 Confirmaciones vía WhatsApp Oficial',
                    '🎟️ Boletos digitales con Código QR VIP',
                    '📲 Hostess Check-in con celular en vivo'
                ];
                pbFeatures.forEach((f, idx) => {
                    ctx.fillText(f, 70, cardY + 330 + idx * 34);
                });
                ctx.restore();

                // Logo pill inferior
                drawGlassCard(width / 2 - 140, 940, 280, 56, 28, 'rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.5)');
                ctx.fillStyle = '#fbbf24';
                ctx.textAlign = 'center';
                ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('PASEBODA SUITE', width / 2, 975);
            }

            // =========================================================================
            // ESCENA 2: PLANO DE MESAS 2D INTERACTIVO (5s a 11s)
            // =========================================================================
            else if (time >= 5.0 && time < 11.0) {
                const p = (time - 5.0) / 6.0;
                drawGoldBadge('01. PLANO DE SALÓN 2D', width / 2, 140);

                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('Acomodo de Mesas 2D', width / 2, 215);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('Arrastra y acomoda a tus invitados en segundos', width / 2, 255);
                ctx.restore();

                // Salón 2D Canvas Frame
                const floorY = 290;
                drawGlassCard(30, floorY, width - 60, 680, 24, '#0d1527', 'rgba(255, 255, 255, 0.15)');

                // Barra superior de estadísticas del salón
                drawGlassCard(45, floorY + 15, width - 90, 48, 12, 'rgba(30, 41, 59, 0.8)', 'rgba(255, 255, 255, 0.08)');
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 15px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('👑 Sofía & Alejandro', 60, floorY + 45);

                ctx.fillStyle = '#10b981';
                ctx.textAlign = 'right';
                const guestCount = Math.floor(180 + p * 20);
                ctx.fillText(`Confirmados: ${guestCount} / 200`, width - 60, floorY + 45);

                // Dibujar Mesa Imperial (Novios) en el centro superior
                ctx.save();
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#c59b27';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(width / 2 - 120, floorY + 95, 240, 60, 14);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Mesa de Honor (Novios)', width / 2, floorY + 130);

                // Sillas de los novios
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.arc(width / 2 - 45, floorY + 80, 10, 0, Math.PI * 2);
                ctx.arc(width / 2 + 45, floorY + 80, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Dibujar 4 Mesas Redondas con comensales
                const tables = [
                    { name: 'Mesa 1 (Familia)', x: 140, y: floorY + 250, count: 10, color: '#10b981' },
                    { name: 'Mesa 2 (Amigos)', x: width - 140, y: floorY + 250, count: 10, color: '#38bdf8' },
                    { name: 'Mesa 3 (Trabajo)', x: 140, y: floorY + 420, count: 8, color: '#a855f7' },
                    { name: 'Mesa 4 (Primos)', x: width - 140, y: floorY + 420, count: 9, color: '#f59e0b' }
                ];

                tables.forEach(t => {
                    ctx.save();
                    // Mesa redonda
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, 52, 0, Math.PI * 2);
                    ctx.fillStyle = '#1e293b';
                    ctx.fill();
                    ctx.strokeStyle = t.color;
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    // Texto de la mesa
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(t.name, t.x, t.y - 6);
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '11px sans-serif';
                    ctx.fillText(`${t.count} sillas`, t.x, t.y + 12);

                    // Sillas alrededor
                    for (let s = 0; s < t.count; s++) {
                        const angle = (s / t.count) * Math.PI * 2;
                        const sx = t.x + Math.cos(angle) * 66;
                        const sy = t.y + Math.sin(angle) * 66;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 7, 0, Math.PI * 2);
                        ctx.fillStyle = t.color;
                        ctx.fill();
                    }
                    ctx.restore();
                });

                // Animación de cursor arrastrando un comensal a Mesa 4
                const animT = clamp((time - 6.5) / 3.0, 0, 1);
                const curT = easeInOut(animT);
                const startX = width / 2;
                const startY = floorY + 580;
                const endX = width - 140;
                const endY = floorY + 420;

                const curX = lerp(startX, endX, curT);
                const curY = lerp(startY, endY, curT);

                // Tarjeta flotante arrastrada
                drawGlassCard(curX - 85, curY - 24, 170, 48, 12, 'rgba(245, 158, 11, 0.95)', '#ffffff');
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('👤 Mariana Treviño', curX, curY + 5);

                // Cursor simulado
                ctx.save();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(curX + 60, curY + 15);
                ctx.lineTo(curX + 75, curY + 30);
                ctx.lineTo(curX + 68, curY + 31);
                ctx.lineTo(curX + 73, curY + 42);
                ctx.lineTo(curX + 67, curY + 44);
                ctx.lineTo(curX + 62, curY + 33);
                ctx.lineTo(curX + 55, curY + 38);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();

                // Mensaje inferior flotante
                drawGlassCard(width / 2 - 180, 1010, 360, 60, 16, 'rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.6)');
                ctx.fillStyle = '#34d399';
                ctx.textAlign = 'center';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText('✅ Conteo automático de dietas y menús', width / 2, 1046);
            }

            // =========================================================================
            // ESCENA 3: WHATSAPP OFICIAL & BOLETO QR VIP (11s a 17s)
            // =========================================================================
            else if (time >= 11.0 && time < 17.0) {
                const p = (time - 11.0) / 6.0;
                drawGoldBadge('02. WHATSAPP & BOLETO QR', width / 2, 130);

                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('Confirmación Automática', width / 2, 205);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('El invitado confirma y recibe su pase en WhatsApp', width / 2, 245);
                ctx.restore();

                // Marco de Smartphone simulado
                const phoneY = 280;
                const phoneW = 380;
                const phoneH = 720;
                const phoneX = (width - phoneW) / 2;

                drawGlassCard(phoneX, phoneY, phoneW, phoneH, 36, '#0f172a', '#334155');

                // Encabezado de WhatsApp
                drawGlassCard(phoneX + 10, phoneY + 15, phoneW - 20, 60, 16, '#075e54', '#128c7e');
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText('PaseBoda Oficial ✓', phoneX + 30, phoneY + 45);
                ctx.fillStyle = '#a7f3d0';
                ctx.font = '12px sans-serif';
                ctx.fillText('Cuenta de Empresa Oficial Meta', phoneX + 30, phoneY + 63);

                // Burbuja de mensaje de WhatsApp entrante
                drawGlassCard(phoneX + 25, phoneY + 100, phoneW - 50, 180, 18, '#ffffff', '#e2e8f0');
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('💌 Sofía & Alejandro', phoneX + 45, phoneY + 130);
                ctx.font = '13px sans-serif';
                ctx.fillStyle = '#334155';
                ctx.fillText('¡Hola Mariana! Tenemos el placer de invitarte', phoneX + 45, phoneY + 155);
                ctx.fillText('a nuestra boda. Hemos reservado 2 lugares.', phoneX + 45, phoneY + 175);

                // Botón interactivo de WhatsApp "Confirmar"
                drawGlassCard(phoneX + 40, phoneY + 205, phoneW - 80, 42, 10, '#25d366', '#16a34a');
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText('✅  Confirmar Asistencia', phoneX + phoneW / 2, phoneY + 231);

                // Boleto Digital Dorado VIP generado automáticamente abajo
                const ticketY = phoneY + 310;
                const ticketW = phoneW - 40;
                const ticketX = phoneX + 20;

                const ticketGrad = ctx.createLinearGradient(ticketX, ticketY, ticketX + ticketW, ticketY + 280);
                ticketGrad.addColorStop(0, '#1c1917');
                ticketGrad.addColorStop(0.5, '#292524');
                ticketGrad.addColorStop(1, '#0c0a09');

                drawGlassCard(ticketX, ticketY, ticketW, 280, 20, ticketGrad, '#c59b27');

                ctx.fillStyle = '#fbbf24';
                ctx.textAlign = 'center';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText('🎟️ PASE DIGITAL DE ACCESO VIP', ticketX + ticketW / 2, ticketY + 35);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 18px sans-serif';
                ctx.fillText('Familia Treviño', ticketX + ticketW / 2, ticketY + 70);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '14px sans-serif';
                ctx.fillText('Mesa 4 • 2 Asistentes Reservados', ticketX + ticketW / 2, ticketY + 95);

                // Código QR simulado de alta fidelidad
                const qrSize = 120;
                const qrX = ticketX + (ticketW - qrSize) / 2;
                const qrY = ticketY + 115;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(qrX, qrY, qrSize, qrSize);

                // Patrón de QR estilizado
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(qrX + 10, qrY + 10, 32, 32);
                ctx.clearRect(qrX + 18, qrY + 18, 16, 16);
                ctx.fillRect(qrX + 22, qrY + 22, 8, 8);

                ctx.fillRect(qrX + qrSize - 42, qrY + 10, 32, 32);
                ctx.clearRect(qrX + qrSize - 34, qrY + 18, 16, 16);
                ctx.fillRect(qrX + qrSize - 30, qrY + 22, 8, 8);

                ctx.fillRect(qrX + 10, qrY + qrSize - 42, 32, 32);
                ctx.clearRect(qrX + 18, qrY + qrSize - 34, 16, 16);
                ctx.fillRect(qrX + 22, qrY + qrSize - 30, 8, 8);

                ctx.fillRect(qrX + 55, qrY + 55, 14, 14);
                ctx.fillRect(qrX + 75, qrY + 55, 14, 14);
                ctx.fillRect(qrX + 55, qrY + 75, 14, 14);

                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 12px monospace';
                ctx.fillText('#PB-8849-CONFIRMED', ticketX + ticketW / 2, ticketY + 258);
            }

            // =========================================================================
            // ESCENA 4: EL DÍA DEL EVENTO - HOSTESS CHECK-IN QR (17s a 22s)
            // =========================================================================
            else if (time >= 17.0 && time < 22.0) {
                const p = (time - 17.0) / 5.0;
                drawGoldBadge('03. EL DÍA DEL EVENTO', width / 2, 130);

                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('Recepción con Escaneo QR', width / 2, 205);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('Tus invitados entran en 2 segundos desde su celular', width / 2, 245);
                ctx.restore();

                // Interfaz de la App de Hostess
                const hostY = 290;
                drawGlassCard(40, hostY, width - 80, 680, 28, '#0b1329', 'rgba(16, 185, 129, 0.4)');

                // Simulación de visor de cámara con láser de escaneo
                const camY = hostY + 40;
                const camW = width - 140;
                const camH = 280;
                const camX = 70;

                drawGlassCard(camX, camY, camW, camH, 20, '#000000', '#10b981');

                // Esquinas de enfoque de la cámara
                ctx.strokeStyle = '#34d399';
                ctx.lineWidth = 4;
                // Esquina sup izq
                ctx.beginPath(); ctx.moveTo(camX + 20, camY + 50); ctx.lineTo(camX + 20, camY + 20); ctx.lineTo(camX + 50, camY + 20); ctx.stroke();
                // Esquina sup der
                ctx.beginPath(); ctx.moveTo(camX + camW - 50, camY + 20); ctx.lineTo(camX + camW - 20, camY + 20); ctx.lineTo(camX + camW - 20, camY + 50); ctx.stroke();
                // Esquina inf izq
                ctx.beginPath(); ctx.moveTo(camX + 20, camY + camH - 50); ctx.lineTo(camX + 20, camY + camH - 20); ctx.lineTo(camX + 50, camY + camH - 20); ctx.stroke();
                // Esquina inf der
                ctx.beginPath(); ctx.moveTo(camX + camW - 50, camY + camH - 20); ctx.lineTo(camX + camW - 20, camY + camH - 20); ctx.lineTo(camX + camW - 20, camY + camH - 50); ctx.stroke();

                // Línea láser verde animada subiendo y bajando
                const laserY = camY + 40 + Math.abs(Math.sin(time * 3)) * (camH - 80);
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.moveTo(camX + 20, laserY);
                ctx.lineTo(camX + camW - 20, laserY);
                ctx.stroke();
                ctx.shadowBlur = 0; // reset

                // Mensaje en pantalla de la cámara
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.font = 'bold 15px sans-serif';
                ctx.fillText('Apunta la cámara al boleto QR del invitado', width / 2, camY + camH / 2);

                // Resultado de validación exitosa (Pop-up dinámico)
                const popY = hostY + 360;
                drawGlassCard(60, popY, width - 120, 260, 20, 'rgba(6, 78, 59, 0.95)', '#34d399');

                ctx.fillStyle = '#6ee7b7';
                ctx.font = 'bold 24px sans-serif';
                ctx.fillText('✓ ¡ACCESO CONFIRMADO!', width / 2, popY + 45);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 22px sans-serif';
                ctx.fillText('Mariana Treviño + 1', width / 2, popY + 95);

                // Caja de asignación de mesa resaltada
                drawGlassCard(width / 2 - 120, popY + 125, 240, 56, 14, '#0f172a', '#fbbf24');
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 20px sans-serif';
                ctx.fillText('🪑 ASIGNADA: MESA 4', width / 2, popY + 160);

                ctx.fillStyle = '#cbd5e1';
                ctx.font = '14px sans-serif';
                ctx.fillText('Sin listas de papel • Cero filas en puerta', width / 2, popY + 215);
            }

            // =========================================================================
            // ESCENA 5: LLAMADO A LA ACCIÓN / CTA FINAL (22s a 25s)
            // =========================================================================
            else {
                const p = (time - 22.0) / 3.0;

                // Resplandor dorado central
                ctx.save();
                const centerGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 350);
                centerGlow.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
                centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = centerGlow;
                ctx.fillRect(0, 0, width, height);
                ctx.restore();

                drawGoldBadge('PASEBODA • SUITE NUPCIAL', width / 2, 280);

                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('Organiza tu Boda', width / 2, 370);
                ctx.fillText('como los Profesionales', width / 2, 425);

                ctx.fillStyle = '#cbd5e1';
                ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('Plano de Mesas 2D • WhatsApp • QR', width / 2, 485);
                ctx.restore();

                // Botón principal de prueba gratis
                const btnY = 560;
                const btnW = 420;
                const btnH = 84;
                const btnX = (width - btnW) / 2;

                const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
                btnGrad.addColorStop(0, '#c59b27');
                btnGrad.addColorStop(1, '#947118');

                drawGlassCard(btnX, btnY, btnW, btnH, 24, btnGrad, '#fde68a');

                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('15 DÍAS DE PRUEBA GRATIS', width / 2, btnY + 52);
                ctx.restore();

                // Enlace a la web
                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 28px monospace';
                ctx.fillText('👉  paseboda.com', width / 2, 700);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillText('Sin tarjeta de crédito requerida', width / 2, 745);
                ctx.fillText('Diseñado para Novios y Wedding Planners', width / 2, 775);
                ctx.restore();
            }

            // Barra de progreso inferior en todo momento
            const progress = (frame + 1) / totalFrames;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(0, height - 8, width, 8);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(0, height - 8, width * progress, 8);

            // Ceder control al loop del navegador para capturar el frame
            await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }

        recorder.stop();
        await stoppedPromise;

        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        return new Promise(resolve => {
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
        });
    });

    await browser.close();

    console.log('💾 Guardando archivo WebM temporal...');
    fs.writeFileSync(outputPathWebm, Buffer.from(videoBase64, 'base64'));
    const webmSize = fs.statSync(outputPathWebm).size;
    console.log(`✅ WebM generado con éxito (${(webmSize / 1024 / 1024).toFixed(2)} MB).`);

    console.log('🔄 Convirtiendo a MP4 optimizado (H.264/AAC faststart para Instagram/Telegram)...');
    try {
        if (fs.existsSync(outputPathMp4)) fs.unlinkSync(outputPathMp4);
        // Transcodificar con ffmpeg a H.264 compatible universalmente
        const ffmpegCmd = `"${ffmpeg}" -y -i "${outputPathWebm}" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -movflags +faststart "${outputPathMp4}"`;
        execSync(ffmpegCmd, { stdio: 'inherit' });
        const mp4Size = fs.statSync(outputPathMp4).size;
        console.log(`🎉 Video MP4 generado exitosamente: ${(mp4Size / 1024 / 1024).toFixed(2)} MB.`);
    } catch (err) {
        console.error('Error al transcodificar con ffmpeg:', err);
    }

    // Enviar a Telegram
    console.log(`📤 Enviando video por Telegram al chat ${TELEGRAM_CHAT_ID}...`);
    const fileToSend = fs.existsSync(outputPathMp4) ? outputPathMp4 : outputPathWebm;
    const isMp4 = fileToSend.endsWith('.mp4');

    const fileBuffer = fs.readFileSync(fileToSend);
    const blob = new Blob([fileBuffer], { type: isMp4 ? 'video/mp4' : 'video/webm' });
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('video', blob, isMp4 ? 'PaseBoda_Reels_Promo.mp4' : 'PaseBoda_Promo.webm');
    formData.append('width', '720');
    formData.append('height', '1280');
    formData.append('supports_streaming', 'true');
    formData.append('caption', 
        `🎬 <b>¡Video Promocional de PaseBoda Listo!</b> 🚀\n\n` +
        `• <b>Formato:</b> 9:16 Vertical (Reels / TikTok / Meta Ads)\n` +
        `• <b>Duración:</b> 25 segundos\n` +
        `• <b>Escenas Clave:</b>\n` +
        `  1. Gancho Anti-Excel\n` +
        `  2. Plano de Mesas 2D Interactivo\n` +
        `  3. WhatsApp Oficial & Boleto QR VIP\n` +
        `  4. Hostess Check-in con celular en vivo\n` +
        `  5. CTA: 15 Días Gratis en paseboda.com\n\n` +
        `<i>¡Listo para pautar en campañas de Facebook e Instagram!</i>`
    );
    formData.append('parse_mode', 'HTML');

    const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
        method: 'POST',
        body: formData
    });

    const tgData = await tgRes.json();
    console.log('Resultado de envío a Telegram:', tgData);

    if (tgData.ok) {
        console.log('✅ ¡Video enviado exitosamente al Telegram de Luis!');
    } else {
        console.error('❌ Error al enviar a Telegram:', tgData);
    }
}

generateAndSendVideo().catch(console.error);
