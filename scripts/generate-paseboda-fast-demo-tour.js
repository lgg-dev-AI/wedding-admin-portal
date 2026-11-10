const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:\\Users\\Luis\\.gemini\\antigravity\\scratch\\wedding-admin-portal';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1374411558';

async function generateFastDemoTour() {
    console.log('🚀 Iniciando Generador de Tour Dinámico y Rápido en Modo Demo (35 segundos)...');

    // Cargar capturas reales en Modo Demo
    const shot1Dash = fs.readFileSync(path.join(BASE_DIR, 'demo-shot-1-dashboard.png')).toString('base64');
    const shot2Seating = fs.readFileSync(path.join(BASE_DIR, 'demo-shot-2-seating.png')).toString('base64');
    const shot3Zoom = fs.readFileSync(path.join(BASE_DIR, 'demo-shot-3-seating-zoom.png')).toString('base64');
    const shot4Novios = fs.readFileSync(path.join(BASE_DIR, 'demo-shot-4-novios.png')).toString('base64');
    const shot5Dispatch = fs.readFileSync(path.join(BASE_DIR, 'demo-shot-5-dispatch.png')).toString('base64');
    const shot6Hostess = fs.readFileSync(path.join(BASE_DIR, 'demo-shot-6-hostess.png')).toString('base64');
    const shot7DayOf = fs.readFileSync(path.join(BASE_DIR, 'demo-shot-7-dayof.png')).toString('base64');

    const profileDir = path.join(BASE_DIR, '..', 'chrome-fast-tour-' + Date.now());
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        userDataDir: profileDir,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
    });

    const page = await browser.newPage();
    const width = 1280;
    const height = 720;
    await page.setViewport({ width, height, deviceScaleFactor: 1 });

    console.log('🎥 Renderizando animación ágil sin pausas muertas...');

    const videoBase64 = await page.evaluate(async (s1, s2, s3, s4, s5, s6, s7) => {
        return new Promise(async (resolve) => {
            const width = 1280;
            const height = 720;
            const fps = 30;
            const totalSeconds = 35; // 35 segundos de alto ritmo
            const totalFrames = totalSeconds * fps; // 1050 frames

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            document.body.appendChild(canvas);
            const ctx = canvas.getContext('2d');

            function loadImage(b64) {
                return new Promise((res) => {
                    const img = new Image();
                    img.onload = () => res(img);
                    img.src = 'data:image/png;base64,' + b64;
                });
            }

            const img1 = await loadImage(s1); // Dashboard Modo Demo con banner 15 días
            const img2 = await loadImage(s2); // Seating Overview
            const img3 = await loadImage(s3); // Seating Zoom
            const img4 = await loadImage(s4); // Modo Novios
            const img5 = await loadImage(s5); // WhatsApp & Boletos
            const img6 = await loadImage(s6); // Hostess Express
            const img7 = await loadImage(s7); // Minuta Día D

            // Web Audio API: Canon en Re Mayor a tempo rápido y enérgico
            const actx = new (window.AudioContext || window.webkitAudioContext)();
            const dest = actx.createMediaStreamDestination();

            const chords = [
                [146.83, 220.00, 293.66, 369.99, 440.00], // D major
                [110.00, 220.00, 277.18, 329.63, 440.00], // A major
                [123.47, 185.00, 246.94, 293.66, 369.99], // B minor
                [92.50,  185.00, 220.00, 277.18, 369.99], // F# minor
                [98.00,  196.00, 246.94, 293.66, 392.00], // G major
                [146.83, 220.00, 293.66, 369.99, 440.00], // D major
                [98.00,  196.00, 246.94, 293.66, 392.00], // G major
                [110.00, 220.00, 277.18, 329.63, 440.00]  // A major
            ];

            function playPiano(freq, time, dur = 1.8, vol = 0.22) {
                if (!freq) return;
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(0.001, time);
                gain.gain.exponentialRampToValueAtTime(vol, time + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
                osc.connect(gain);
                gain.connect(dest);
                osc.start(time);
                osc.stop(time + dur + 0.1);
            }

            function playClick(time) {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1400, time);
                gain.gain.setValueAtTime(0.22, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
                osc.connect(gain);
                gain.connect(dest);
                osc.start(time);
                osc.stop(time + 0.09);
            }

            function playBell(time) {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1046.5, time); // C6 brillante
                gain.gain.setValueAtTime(0.3, time);
                gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);
                osc.connect(gain);
                gain.connect(dest);
                osc.start(time);
                osc.stop(time + 1.3);
            }

            // Arpegios musicales rápidos cada 1.8 segundos (tempo dinámico)
            let tMusic = 0.1;
            while (tMusic < totalSeconds) {
                const idx = Math.floor((tMusic / 1.8) % chords.length);
                const ch = chords[idx];
                ch.forEach((n, i) => playPiano(n, tMusic + i * 0.11, 1.8, 0.23));
                tMusic += 1.8;
            }

            // Clics sincronizados con los cortes rápidos
            playClick(3.5);   // Clic hacia Plano 2D
            playClick(7.5);   // Clic zoom a mesas
            playClick(12.0);  // Clic a Modo Novios
            playClick(17.0);  // Clic a Despacho WhatsApp
            playClick(22.0);  // Clic a Hostess Express
            playBell(24.5);   // Validación QR exitosa (Ding!)
            playClick(27.0);  // Clic a Minuta Día D

            // SUBTÍTULOS DINÁMICOS CON RITMO RÁPIDO
            const captionsData = [
                {
                    start: 0.2, end: 3.4,
                    words: [
                        { w: 'Modo Demo Activo:', t: 0.2 },
                        { w: '15 días de prueba gratis', t: 1.0 },
                        { w: 'con todas las métricas en vivo.', t: 2.0 }
                    ]
                },
                {
                    start: 3.6, end: 7.4,
                    words: [
                        { w: 'Plano de Mesas 2D:', t: 3.6 },
                        { w: 'Distribuye tu salón', t: 4.8 },
                        { w: 'y mesas imperiales en minutos.', t: 6.0 }
                    ]
                },
                {
                    start: 7.6, end: 11.8,
                    words: [
                        { w: 'Control de Banquete:', t: 7.6 },
                        { w: 'Asigna comensales', t: 9.0 },
                        { w: 'y dietas sin margen de error.', t: 10.4 }
                    ]
                },
                {
                    start: 12.0, end: 16.8,
                    words: [
                        { w: 'Modo Novios:', t: 12.0 },
                        { w: 'La vista romántica, limpia', t: 13.5 },
                        { w: 'y libre de enredos técnicos.', t: 15.0 }
                    ]
                },
                {
                    start: 17.0, end: 21.8,
                    words: [
                        { w: 'WhatsApp Oficial:', t: 17.0 },
                        { w: 'Envío de boletos digitales VIP', t: 18.5 },
                        { w: 'con código QR único.', t: 20.0 }
                    ]
                },
                {
                    start: 22.0, end: 26.8,
                    words: [
                        { w: 'Hostess en Puerta:', t: 22.0 },
                        { w: 'Escaneo con celular en 2 segundos:', t: 23.5 },
                        { w: 'cero filas en salón.', t: 25.2 }
                    ]
                },
                {
                    start: 27.0, end: 30.8,
                    words: [
                        { w: 'Minuta Día D:', t: 27.0 },
                        { w: 'Cronograma en vivo', t: 28.2 },
                        { w: 'y directorio de proveedores.', t: 29.5 }
                    ]
                },
                {
                    start: 31.0, end: 34.8,
                    words: [
                        { w: 'PaseBoda Suite:', t: 31.0 },
                        { w: 'Prueba 15 días gratis en', t: 32.2 },
                        { w: 'paseboda.com', t: 33.6 }
                    ]
                }
            ];

            const vStream = canvas.captureStream(fps);
            const combined = new MediaStream([
                ...vStream.getVideoTracks(),
                ...dest.stream.getAudioTracks()
            ]);

            const recorder = new MediaRecorder(combined, {
                mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                    ? 'video/webm;codecs=vp9,opus'
                    : 'video/webm',
                videoBitsPerSecond: 4500000
            });

            const chunks = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
            const stopped = new Promise(r => recorder.onstop = r);
            recorder.start();

            function renderCaptions(time) {
                const group = captionsData.find(g => time >= g.start && time < g.end);
                if (!group) return;

                ctx.save();
                const boxY = height - 68;

                // Pastilla flotante con diseño Apple/Stripe
                ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(width / 2 - 360, boxY - 24, 720, 48, 24);
                ctx.fill();
                ctx.stroke();

                const fullText = group.words.map(w => w.w).join(' ');
                ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                const totalW = ctx.measureText(fullText).width;
                let startX = width / 2 - totalW / 2;

                ctx.textAlign = 'left';
                group.words.forEach(item => {
                    const wordW = ctx.measureText(item.w + ' ').width;
                    const isActive = time >= item.t;

                    if (isActive) {
                        ctx.fillStyle = '#fbbf24';
                        ctx.font = '800 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                        ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    }

                    ctx.fillText(item.w, startX, boxY + 6);
                    startX += wordW;
                });
                ctx.restore();
            }

            function drawBadge(title, subtitle, color = '#f59e0b') {
                ctx.save();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(28, 20, 320, 50, 12);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = color;
                ctx.font = 'bold 10px -apple-system, sans-serif';
                ctx.letterSpacing = '1.2px';
                ctx.fillText(subtitle.toUpperCase(), 44, 38);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px -apple-system, sans-serif';
                ctx.fillText(title, 44, 57);
                ctx.restore();
            }

            function drawAnimatedCursor(x, y, isClick = false) {
                ctx.save();
                ctx.translate(x, y);

                if (isClick) {
                    ctx.beginPath();
                    ctx.arc(0, 0, 16, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
                    ctx.fill();
                    ctx.strokeStyle = '#fbbf24';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 16);
                ctx.lineTo(4, 12);
                ctx.lineTo(8, 19);
                ctx.lineTo(11, 18);
                ctx.lineTo(7, 11);
                ctx.lineTo(12, 11);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            // COREOGRAFÍA ÁGIL FRAME A FRAME (35 SEGUNDOS)
            for (let frame = 0; frame < totalFrames; frame++) {
                const time = frame / fps;

                // -------------------------------------------------------------
                // 1. DASHBOARD MODO DEMO (0s - 3.5s)
                // -------------------------------------------------------------
                if (time < 3.5) {
                    const localT = time;
                    const zoom = 1.0 + (localT / 3.5) * 0.12;

                    ctx.save();
                    ctx.translate(width * 0.5, height * 0.4);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-width * 0.5, -height * 0.4);
                    ctx.drawImage(img1, 0, 0, width, height);
                    ctx.restore();

                    drawBadge('Torre de Control en Vivo', 'Prueba 15 Días • Modo Demo');
                    drawAnimatedCursor(480 + localT * 20, 160 + localT * 10, false);
                }

                // -------------------------------------------------------------
                // 2. PLANO 2D OVERVIEW (3.5s - 7.5s)
                // -------------------------------------------------------------
                else if (time >= 3.5 && time < 7.5) {
                    const localT = time - 3.5;
                    const zoom = 1.0 + (localT / 4.0) * 0.15;

                    ctx.save();
                    ctx.translate(width * 0.55, height * 0.5);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-width * 0.55, -height * 0.5);
                    ctx.drawImage(img2, 0, 0, width, height);
                    ctx.restore();

                    drawBadge('Plano de Mesas 2D Interactivo', 'Acomodo de Salón');
                    drawAnimatedCursor(520, 320, localT < 0.4);
                }

                // -------------------------------------------------------------
                // 3. ZOOM A MESAS & DIETAS (7.5s - 12.0s)
                // -------------------------------------------------------------
                else if (time >= 7.5 && time < 12.0) {
                    const localT = time - 7.5;
                    const panX = localT * 25;

                    ctx.save();
                    ctx.translate(-panX, 0);
                    ctx.drawImage(img3, 0, 0, width, height);
                    ctx.restore();

                    drawBadge('Gestión de Sillas & Menús', 'Control de Alergias & Dietas');
                    drawAnimatedCursor(620 + Math.sin(localT * 2) * 60, 360, localT > 2 && localT < 2.4);
                }

                // -------------------------------------------------------------
                // 4. MODO NOVIOS VISTA LIMPIA (12.0s - 17.0s)
                // -------------------------------------------------------------
                else if (time >= 12.0 && time < 17.0) {
                    const localT = time - 12.0;

                    ctx.save();
                    ctx.drawImage(img4, 0, 0, width, height);

                    // Resaltar la vista simplificada de novios
                    ctx.strokeStyle = 'rgba(226, 168, 145, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.roundRect(280, 110, 700, 240, 14);
                    ctx.stroke();
                    ctx.restore();

                    drawBadge('Vista Simplificada de Pareja', 'Alternancia de Roles', '#e2a891');
                    drawAnimatedCursor(380 + localT * 30, 220, localT < 0.4);
                }

                // -------------------------------------------------------------
                // 5. WHATSAPP & BOLETO QR (17.0s - 22.0s)
                // -------------------------------------------------------------
                else if (time >= 17.0 && time < 22.0) {
                    const localT = time - 17.0;

                    ctx.save();
                    ctx.drawImage(img5, 0, 0, width, height);
                    ctx.restore();

                    drawBadge('Despacho Oficial por WhatsApp', 'Boletos VIP con Código QR', '#25d366');
                    drawAnimatedCursor(540, 260, localT > 1.5 && localT < 1.9);
                }

                // -------------------------------------------------------------
                // 6. HOSTESS EXPRESS EN PUERTA (22.0s - 27.0s)
                // -------------------------------------------------------------
                else if (time >= 22.0 && time < 27.0) {
                    const localT = time - 22.0;

                    ctx.save();
                    ctx.drawImage(img6, 0, 0, width, height);

                    // Flash verde de validación al escanear (24.5s)
                    if (time >= 24.3 && time <= 25.8) {
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
                        ctx.fillRect(0, 0, width, height);
                    }
                    ctx.restore();

                    drawBadge('Hostess Express Móvil', 'Recepción & Cero Colados', '#10b981');
                    drawAnimatedCursor(460, 320, localT > 2.2 && localT < 2.6);
                }

                // -------------------------------------------------------------
                // 7. MINUTA DÍA D (27.0s - 31.0s)
                // -------------------------------------------------------------
                else if (time >= 27.0 && time < 31.0) {
                    const localT = time - 27.0;

                    ctx.save();
                    ctx.drawImage(img7, 0, 0, width, height);
                    ctx.restore();

                    drawBadge('Minuta Minuto a Minuto', 'Coordinación con Proveedores');
                    drawAnimatedCursor(400 + localT * 40, 240, false);
                }

                // -------------------------------------------------------------
                // 8. CIERRE COMERCIAL & LLAMADO A LA ACCIÓN (31.0s - 35.0s)
                // -------------------------------------------------------------
                else {
                    const localT = time - 31.0;

                    // Fondo de lujo
                    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
                    bgGrad.addColorStop(0, '#090d16');
                    bgGrad.addColorStop(0.5, '#0f172a');
                    bgGrad.addColorStop(1, '#020617');
                    ctx.fillStyle = bgGrad;
                    ctx.fillRect(0, 0, width, height);

                    ctx.save();
                    const glow = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, 420);
                    glow.addColorStop(0, 'rgba(217, 119, 6, 0.25)');
                    glow.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = glow;
                    ctx.fillRect(0, 0, width, height);
                    ctx.restore();

                    ctx.save();
                    ctx.textAlign = 'center';

                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 13px -apple-system, sans-serif';
                    ctx.letterSpacing = '3px';
                    ctx.fillText('LA PLATAFORMA PARA EVENTOS INOLVIDABLES', width / 2, height / 2 - 100);

                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 54px "Playfair Display", Georgia, serif';
                    ctx.fillText('PaseBoda', width / 2 - 40, height / 2 - 35);
                    ctx.fillStyle = '#fbbf24';
                    ctx.fillText('Suite', width / 2 + 130, height / 2 - 35);

                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '400 18px -apple-system, sans-serif';
                    ctx.fillText('Diseñada para Planners • Amada por los Novios', width / 2, height / 2 + 18);

                    // Botón dorado
                    ctx.fillStyle = '#c59b27';
                    ctx.beginPath();
                    ctx.roundRect(width / 2 - 190, height / 2 + 60, 380, 52, 99);
                    ctx.fill();

                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 17px -apple-system, sans-serif';
                    ctx.fillText('Prueba 15 Días Gratis en paseboda.com', width / 2, height / 2 + 93);
                    ctx.restore();
                }

                // Subtítulos
                renderCaptions(time);

                // Barra de progreso inferior
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(0, height - 6, width, 6);
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(0, height - 6, (frame / totalFrames) * width, 6);

                await new Promise(r => setTimeout(r, 1000 / fps));
            }

            recorder.stop();
            await stopped;

            const blob = new Blob(chunks, { type: 'video/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]);
            };
            reader.readAsDataURL(blob);
        });
    }, shot1Dash, shot2Seating, shot3Zoom, shot4Novios, shot5Dispatch, shot6Hostess, shot7DayOf);

    await browser.close();

    const outWebm = path.join(BASE_DIR, 'PaseBoda_Demo_Dinamico_35s.webm');
    const outMp4 = path.join(BASE_DIR, 'PaseBoda_Demo_Dinamico_35s.mp4');

    fs.writeFileSync(outWebm, Buffer.from(videoBase64, 'base64'));
    const webmStats = fs.statSync(outWebm);
    console.log(`✅ WebM generado: ${(webmStats.size / (1024 * 1024)).toFixed(2)} MB`);

    // Transcodificar con ffmpeg a MP4 H.264
    console.log('🔄 Transcodificando a MP4 con ffmpeg...');
    try {
        if (fs.existsSync(outMp4)) fs.unlinkSync(outMp4);
        const cmd = `"${ffmpeg}" -y -i "${outWebm}" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "${outMp4}"`;
        execSync(cmd, { stdio: 'inherit' });
        const mp4Stats = fs.statSync(outMp4);
        console.log(`🎉 MP4 generado con éxito: ${(mp4Stats.size / (1024 * 1024)).toFixed(2)} MB`);
    } catch (err) {
        console.error('Error al convertir con ffmpeg:', err);
    }

    // Enviar a Telegram
    console.log('📤 Enviando video dinámico a Telegram...');
    const fileToSend = fs.existsSync(outMp4) ? outMp4 : outWebm;
    const isMp4 = fileToSend.endsWith('.mp4');

    const form = new FormData();
    form.append('chat_id', TELEGRAM_CHAT_ID);
    form.append('video', new Blob([fs.readFileSync(fileToSend)], { type: isMp4 ? 'video/mp4' : 'video/webm' }), isMp4 ? 'PaseBoda_Demo_Dinamico_35s.mp4' : 'PaseBoda_Demo_Dinamico_35s.webm');
    form.append('width', '1280');
    form.append('height', '720');
    form.append('supports_streaming', 'true');
    form.append('caption', '⚡ <b>¡Nuevo Tour Dinámico de PaseBoda (Ritmo Rápido en Modo Demo)!</b> 🚀\n\n' +
        '• <b>Modo Demo:</b> Muestra el banner real de prueba de 15 días activa.\n' +
        '• <b>Ritmo Ágil:</b> Cortes rápidos de 3.5 a 4 segundos (cero pausas aburridas ni imágenes estáticas largas).\n' +
        '• <b>Secuencia de Pantallas Reales:</b>\n' +
        '  1. ⏳ Dashboard con banner de 15 Días Gratis\n' +
        '  2. 🪑 Plano de Mesas 2D (Salón completo)\n' +
        '  3. 🔍 Zoom cinemático a comensales y dietas\n' +
        '  4. 👰 Alternancia instantánea a Modo Novios\n' +
        '  5. 💬 Convocatoria WhatsApp & Boletos QR\n' +
        '  6. 📲 Hostess Express con destello verde de validación\n' +
        '  7. ⏱️ Minuta Día D para staff\n' +
        '  8. 🌐 Cierre con llamado a la acción (paseboda.com)');
    form.append('parse_mode', 'HTML');

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
        method: 'POST',
        body: form
    });
    const data = await res.json();
    console.log('Resultado Telegram:', data.ok ? '✅ Video dinámico entregado con éxito' : data);
}

generateFastDemoTour().catch(console.error);
