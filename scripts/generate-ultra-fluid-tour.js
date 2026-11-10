const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE_DIR = 'C:\\Users\\Luis\\.gemini\\antigravity\\scratch\\wedding-admin-portal';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1374411558';

// Servidor local para capturar las pantallas reales con datos vivos
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

async function runUltraFluidTour() {
    console.log('🚀 Iniciando Generación de Video Ultra Fluido (Frame-by-Frame, Cero Tirones, 60 FPS / 30 FPS exactos)...');

    const port = 5250;
    const srv = await startLocalServer(port);
    console.log(`✅ Servidor local listo en puerto ${port}`);

    const uniqueProfile = path.join(BASE_DIR, '.chrome_profile_' + Date.now());
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        userDataDir: uniqueProfile,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

    // Configurar MODO DEMO REAL con Sofía & Alejandro (Aura)
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

    // Activar boda aura y banner dorado de prueba de 15 días
    await page.evaluate(() => {
        if (typeof switchWedding === 'function') switchWedding('aura');
        const b = document.getElementById('demoFloatingBanner');
        if (b) {
            b.style.display = 'flex';
            const t = document.getElementById('demoBannerText');
            if (t) {
                t.innerHTML = '<strong>⏳ PRUEBA DE 15 DÍAS (AURA WEDDINGS):</strong> Te restan <strong>15 días</strong>. Mesas 2D, CRM y boletos activos. <span style="color:#fbbf24; font-weight:800; margin-left:8px;">PaseBoda Pro</span>';
            }
        }
    });

    console.log('📸 Capturando tomas reales de alta definición a pantalla completa (100% nativa)...');
    const shotDash = await page.screenshot({ encoding: 'base64' });

    // Seating Overview (100% escala nativa sin mutaciones)
    await page.evaluate(() => { if (typeof showTab === 'function') showTab('seating'); });
    await new Promise(r => setTimeout(r, 800));
    const shotSeating = await page.screenshot({ encoding: 'base64' });

    // Modo Novios
    await page.evaluate(() => { if (typeof setRole === 'function') setRole('couple'); });
    await new Promise(r => setTimeout(r, 800));
    const shotNovios = await page.screenshot({ encoding: 'base64' });

    // WhatsApp Despacho & Boletos
    await page.evaluate(() => {
        if (typeof setRole === 'function') setRole('planner');
        if (typeof showTab === 'function') showTab('dispatch');
    });
    await new Promise(r => setTimeout(r, 800));
    const shotDispatch = await page.screenshot({ encoding: 'base64' });

    // Hostess Express
    await page.evaluate(() => { if (typeof showTab === 'function') showTab('hostess'); });
    await new Promise(r => setTimeout(r, 800));
    const shotHostess = await page.screenshot({ encoding: 'base64' });

    console.log('🎵 Generando audio con OfflineAudioContext (Canon en Re Mayor + SFX)...');
    
    // Generar Audio WAV ultra sincronizado con OfflineAudioContext
    const audioWavBase64 = await page.evaluate(async () => {
        const sampleRate = 44100;
        const totalDuration = 34; // 34 segundos
        const offlineCtx = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);

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

        function playPiano(freq, time, dur = 1.6, vol = 0.24) {
            if (!freq) return;
            const osc = offlineCtx.createOscillator();
            const gain = offlineCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.001, time);
            gain.gain.exponentialRampToValueAtTime(vol, time + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
            osc.connect(gain);
            gain.connect(offlineCtx.destination);
            osc.start(time);
            osc.stop(time + dur + 0.1);
        }

        function playClick(time) {
            const osc = offlineCtx.createOscillator();
            const gain = offlineCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, time);
            gain.gain.setValueAtTime(0.22, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
            osc.connect(gain);
            gain.connect(offlineCtx.destination);
            osc.start(time);
            osc.stop(time + 0.08);
        }

        function playChime(time) {
            const osc = offlineCtx.createOscillator();
            const gain = offlineCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1046.5, time); // C6
            gain.gain.setValueAtTime(0.32, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);
            osc.connect(gain);
            gain.connect(offlineCtx.destination);
            osc.start(time);
            osc.stop(time + 1.3);
        }

        // Arpegios musicales fluidos
        let t = 0.1;
        while (t < totalDuration) {
            const idx = Math.floor((t / 1.7) % chords.length);
            const ch = chords[idx];
            ch.forEach((n, i) => playPiano(n, t + i * 0.10, 1.7, 0.22));
            t += 1.7;
        }

        // Clics sincronizados con interacciones reales
        playClick(4.2);   // Clic a Plano 2D
        playClick(9.2);   // Clic Mesa 3 (inicia close-up)
        playClick(11.8);  // Clic detalle silla / alergia
        playClick(14.0);  // Clic Modo Novios
        playClick(18.8);  // Clic Despacho WhatsApp
        playClick(21.8);  // Clic previsualizar Boleto VIP QR
        playClick(23.8);  // Clic Hostess Express
        playChime(26.8);  // Ding de validación exitosa en puerta

        const rendered = await offlineCtx.startRendering();

        // Convertir AudioBuffer a WAV (PCM 16-bit estéreo)
        function bufferToWave(abuffer, len) {
            const numOfChan = abuffer.numberOfChannels;
            const length = len * numOfChan * 2 + 44;
            const out = new DataView(new ArrayBuffer(length));
            const channels = [];
            let sample = 0;
            let offset = 0;
            let pos = 0;

            function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
            function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

            // RIFF chunk
            setUint32(0x46464952); // "RIFF"
            setUint32(length - 8);
            setUint32(0x45564157); // "WAVE"
            // fmt chunk
            setUint32(0x20746d66); // "fmt "
            setUint32(16); // subchunk1size (16 for PCM)
            setUint16(1); // PCM
            setUint16(numOfChan);
            setUint32(abuffer.sampleRate);
            setUint32(abuffer.sampleRate * 2 * numOfChan);
            setUint16(numOfChan * 2);
            setUint16(16); // 16-bit
            // data chunk
            setUint32(0x61746164); // "data"
            setUint32(length - pos - 4);

            for (let i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

            while (offset < len) {
                for (let i = 0; i < numOfChan; i++) {
                    sample = Math.max(-1, Math.min(1, channels[i][offset]));
                    sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                    out.setInt16(pos, sample, true);
                    pos += 2;
                }
                offset++;
            }
            return out.buffer;
        }

        const wavData = bufferToWave(rendered, rendered.length);
        const bytes = new Uint8Array(wavData);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    });

    const wavPath = path.join(BASE_DIR, 'tour_soundtrack.wav');
    fs.writeFileSync(wavPath, Buffer.from(audioWavBase64, 'base64'));
    console.log(`✅ Audio WAV puro generado: ${(fs.statSync(wavPath).size / 1024).toFixed(1)} KB`);

    console.log('🖼️ Precargando capturas a pantalla completa en la memoria del navegador...');
    await page.evaluate(async (s1, s2, s3, s4, s5) => {
        function loadImage(b64) {
            return new Promise((res) => {
                const img = new Image();
                img.onload = () => res(img);
                img.src = 'data:image/png;base64,' + b64;
            });
        }
        window.__tourImages = [
            await loadImage(s1),
            await loadImage(s2),
            await loadImage(s3),
            await loadImage(s4),
            await loadImage(s5)
        ];
    }, shotDash, shotSeating, shotNovios, shotDispatch, shotHostess);

    // Renderizar fotogramas ultra fluidos (34 segundos a 30 FPS = 1020 fotogramas exactos)
    console.log('🎞️ Renderizando 1,020 fotogramas exactos (100% Pantalla Completa, Cero Close-ups forzados)...');
    const framesDir = path.join(BASE_DIR, 'render_frames_' + Date.now());
    fs.mkdirSync(framesDir, { recursive: true });

    const frameCount = 34 * 30; // 1020 fotogramas
    const batchSize = 60; // 2 segundos por lote en memoria
    let currentFrame = 0;

    for (let batch = 0; batch < frameCount; batch += batchSize) {
        const startF = batch;
        const endF = Math.min(frameCount, batch + batchSize);

        const framesBatch = await page.evaluate(async (startFrame, endFrame) => {
            const width = 1280;
            const height = 720;
            const fps = 30;
            const totalDuration = 34;
            const totalFrames = fps * totalDuration;

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            const [imgDash, imgSeating, imgNovios, imgDispatch, imgHostess] = window.__tourImages;

            // Subtítulos
            const captionsData = [
                { start: 0.2, end: 4.4, words: [{ w: 'Torre de Control:', t: 0.2 }, { w: 'Métricas de asistencia,', t: 1.0 }, { w: 'confirmados y banquete en vivo.', t: 2.2 }] },
                { start: 4.5, end: 9.4, words: [{ w: 'Plano 2D Interactivo:', t: 4.5 }, { w: 'Vista completa de tu salón,', t: 5.8 }, { w: 'pista y mesas imperiales.', t: 7.2 }] },
                { start: 9.5, end: 13.9, words: [{ w: 'Detalle de Mesas:', t: 9.5 }, { w: 'Conteo de sillas, dietas', t: 10.8 }, { w: 'y control de alergias.', t: 12.0 }] },
                { start: 14.0, end: 18.9, words: [{ w: 'Modo Novios:', t: 14.0 }, { w: 'La vista romántica y limpia', t: 15.2 }, { w: 'que los novios consultan.', t: 16.8 }] },
                { start: 19.0, end: 23.9, words: [{ w: 'WhatsApp Oficial:', t: 19.0 }, { w: 'Boletos VIP digitales con', t: 20.4 }, { w: 'código QR individual.', t: 22.0 }] },
                { start: 24.0, end: 28.9, words: [{ w: 'Hostess en Puerta:', t: 24.0 }, { w: 'Escaneo con celular en 2 seg:', t: 25.4 }, { w: 'cero filas en el salón.', t: 27.0 }] },
                { start: 29.0, end: 33.8, words: [{ w: 'PaseBoda Suite:', t: 29.0 }, { w: 'Prueba 15 días gratis en', t: 30.5 }, { w: 'paseboda.com', t: 32.0 }] }
            ];

            function renderCaptions(time) {
                const group = captionsData.find(g => time >= g.start && time < g.end);
                if (!group) return;

                ctx.save();
                const boxY = height - 58;
                ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(width / 2 - 360, boxY - 22, 720, 44, 22);
                ctx.fill();
                ctx.stroke();

                const fullText = group.words.map(w => w.w).join(' ');
                ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                const totalW = ctx.measureText(fullText).width;
                let startX = width / 2 - totalW / 2;

                ctx.textAlign = 'left';
                group.words.forEach(item => {
                    const wordW = ctx.measureText(item.w + ' ').width;
                    const isActive = time >= item.t;
                    ctx.fillStyle = isActive ? '#fbbf24' : 'rgba(255, 255, 255, 0.45)';
                    ctx.font = isActive ? '800 15px -apple-system, sans-serif' : '600 15px -apple-system, sans-serif';
                    ctx.fillText(item.w, startX, boxY + 6);
                    startX += wordW;
                });
                ctx.restore();
            }

            // Píldora minimalista en esquina superior derecha que NUNCA tapa los menús ni el contenido
            function drawMinimalTag(title, color = '#fbbf24') {
                ctx.save();
                ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                const tagW = ctx.measureText(title.toUpperCase()).width + 24;
                const tagX = width - tagW - 20;
                const tagY = 16;
                ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.roundRect(tagX, tagY, tagW, 26, 13);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = color;
                ctx.textAlign = 'left';
                ctx.letterSpacing = '0.5px';
                ctx.fillText(title.toUpperCase(), tagX + 12, tagY + 17);
                ctx.restore();
            }

            function drawCursor(x, y, isClick = false) {
                ctx.save();
                ctx.translate(x, y);
                if (isClick) {
                    ctx.beginPath();
                    ctx.arc(0, 0, 18, 0, Math.PI * 2);
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
                ctx.moveTo(0, 0); ctx.lineTo(0, 16); ctx.lineTo(4, 12); ctx.lineTo(8, 19); ctx.lineTo(11, 18); ctx.lineTo(7, 11); ctx.lineTo(12, 11);
                ctx.closePath();
                ctx.fill(); ctx.stroke();
                ctx.restore();
            }

            const results = [];

            for (let f = startFrame; f < endFrame; f++) {
                const time = f / fps;

                // 1. DASHBOARD MODO DEMO: 100% PANTALLA COMPLETA NATIVA (0s - 4.5s)
                if (time < 4.5) {
                    ctx.drawImage(imgDash, 0, 0, width, height);
                    drawMinimalTag('Torre de Control • Modo Demo');
                    // Cursor viaja desde el centro hacia el menú lateral "Plano 2D"
                    const p = Math.min(1, Math.max(0, (time - 1.5) / 2.7));
                    const curX = 640 + (105 - 640) * p;
                    const curY = 220 + (230 - 220) * p;
                    drawCursor(curX, curY, time >= 4.15 && time <= 4.35);
                }
                // 2. PLANO 2D OVERVIEW: 100% PANTALLA COMPLETA NATIVA (4.5s - 9.5s)
                else if (time >= 4.5 && time < 9.5) {
                    const localT = time - 4.5;
                    ctx.drawImage(imgSeating, 0, 0, width, height);
                    drawMinimalTag('Plano 2D Interactivo • Salón Completo');
                    // Cursor viaja desde el menú lateral hacia la Mesa 3 en el centro del salón
                    const p = Math.min(1, Math.max(0, localT / 4.7));
                    const curX = 105 + (670 - 105) * p;
                    const curY = 230 + (340 - 230) * p;
                    drawCursor(curX, curY, time >= 9.15 && time <= 9.35);
                }
                // 3. AQUÍ SÍ CLOSE-UP: DETALLE DE MESA 3 & ALERGIAS (9.5s - 14.0s)
                else if (time >= 9.5 && time < 14.0) {
                    const localT = time - 9.5;
                    // Zoom suave que entra al hacer clic en Mesa 3, se mantiene y se aleja suavemente antes del corte
                    let zoom = 1.0;
                    if (localT < 1.0) {
                        zoom = 1.0 + Math.sin((localT / 1.0) * Math.PI / 2) * 0.35;
                    } else if (localT >= 1.0 && localT < 3.3) {
                        zoom = 1.35;
                    } else {
                        const outT = (localT - 3.3) / 1.2;
                        zoom = 1.35 - Math.sin(Math.min(1, outT) * Math.PI / 2) * 0.35;
                    }
                    ctx.save();
                    ctx.translate(width * 0.52, height * 0.48);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-width * 0.52, -height * 0.48);
                    ctx.drawImage(imgSeating, 0, 0, width, height);
                    ctx.restore();

                    drawMinimalTag('Detalle de Mesa 3 • Alergias & Sillas');
                    // Cursor inspecciona las sillas de la mesa y luego se desplaza a "Modo Novios"
                    if (localT < 3.0) {
                        const curX = 670 + Math.sin(localT * 3) * 35;
                        const curY = 340 + Math.cos(localT * 3) * 20;
                        drawCursor(curX, curY, localT >= 2.2 && localT <= 2.4);
                    } else {
                        const p = Math.min(1, (localT - 3.0) / 1.4);
                        const curX = 670 + (880 - 670) * p;
                        const curY = 340 + (50 - 340) * p;
                        drawCursor(curX, curY, time >= 13.9 && time <= 14.1);
                    }
                }
                // 4. MODO NOVIOS: 100% PANTALLA COMPLETA NATIVA (14.0s - 19.0s)
                else if (time >= 14.0 && time < 19.0) {
                    const localT = time - 14.0;
                    ctx.drawImage(imgNovios, 0, 0, width, height);
                    drawMinimalTag('Modo Novios • Vista Romántica', '#f472b6');
                    // Cursor navega la interfaz limpia de la pareja y luego va a "Despacho WhatsApp"
                    const p = Math.min(1, Math.max(0, (localT - 2.5) / 2.3));
                    const curX = 580 + (105 - 580) * p;
                    const curY = 260 + (275 - 260) * p;
                    drawCursor(curX, curY, time >= 18.75 && time <= 18.95);
                }
                // 5. DESPACHO WHATSAPP & BOLETO QR: 100% PANTALLA COMPLETA NATIVA (19.0s - 24.0s)
                else if (time >= 19.0 && time < 24.0) {
                    const localT = time - 19.0;
                    ctx.drawImage(imgDispatch, 0, 0, width, height);
                    drawMinimalTag('WhatsApp Cloud • Boletos QR', '#22c55e');
                    // Cursor revisa lista y hace clic en "Ver Boleto QR", luego baja a Hostess
                    let curX = 105, curY = 275;
                    if (localT < 2.8) {
                        const p = Math.min(1, localT / 2.0);
                        curX = 105 + (720 - 105) * p;
                        curY = 275 + (320 - 275) * p;
                        drawCursor(curX, curY, localT >= 2.7 && localT <= 2.9);
                    } else {
                        const p = Math.min(1, (localT - 2.8) / 2.0);
                        curX = 720 + (105 - 720) * p;
                        curY = 320 + (325 - 320) * p;
                        drawCursor(curX, curY, time >= 23.75 && time <= 23.95);
                    }
                }
                // 6. HOSTESS EXPRESS EN PUERTA: 100% PANTALLA COMPLETA NATIVA (24.0s - 29.0s)
                else if (time >= 24.0 && time < 29.0) {
                    const localT = time - 24.0;
                    ctx.drawImage(imgHostess, 0, 0, width, height);
                    drawMinimalTag('Hostess Express • Recepción', '#10b981');
                    // Simulación de escaneo QR y confirmación en puerta
                    drawCursor(480 + Math.sin(localT * 2) * 15, 270, localT >= 2.6 && localT <= 2.9);
                    if (time >= 26.6 && time <= 28.2) {
                        // Sutil destello esmeralda en el contorno de la pantalla indicando check-in validado
                        ctx.save();
                        ctx.strokeStyle = '#10b981';
                        ctx.lineWidth = 6;
                        ctx.strokeRect(3, 3, width - 6, height - 6);
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
                        ctx.fillRect(0, 0, width, height);
                        ctx.restore();
                    }
                }
                // 7. CIERRE COMERCIAL (29.0s - 34.0s)
                else {
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

                    ctx.fillStyle = '#c59b27';
                    ctx.beginPath();
                    ctx.roundRect(width / 2 - 190, height / 2 + 60, 380, 52, 99);
                    ctx.fill();

                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 17px -apple-system, sans-serif';
                    ctx.fillText('Prueba 15 Días Gratis en paseboda.com', width / 2, height / 2 + 93);
                    ctx.restore();
                }

                renderCaptions(time);

                // Barra progreso
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(0, height - 6, width, 6);
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(0, height - 6, (f / (totalFrames - 1)) * width, 6);

                results.push(canvas.toDataURL('image/jpeg', 0.92));
            }
            return results;
        }, startF, endF);

        // Guardar cada fotograma como archivo JPEG secuencial
        framesBatch.forEach((b64, idx) => {
            const frameNum = String(currentFrame + idx).padStart(4, '0');
            const data = b64.replace(/^data:image\/jpeg;base64,/, '');
            fs.writeFileSync(path.join(framesDir, `frame_${frameNum}.jpg`), Buffer.from(data, 'base64'));
        });

        currentFrame += framesBatch.length;
        process.stdout.write(`\r  Fotogramas renderizados: ${currentFrame} / ${frameCount}`);
    }

    console.log('\n✅ 1,020 fotogramas exportados sin pérdida.');
    await browser.close();
    try { fs.rmSync(uniqueProfile, { recursive: true, force: true }); } catch (e) {}
    srv.close();

    // Ensamblar video con FFmpeg: 30 FPS CONSTANTES, 0 FRAMES DUPLICADOS
    const outMp4 = path.join(BASE_DIR, 'PaseBoda_Tour_UltraFluido_30s.mp4');
    if (fs.existsSync(outMp4)) fs.unlinkSync(outMp4);

    console.log('🔄 Ensamblando con FFmpeg a 30 FPS exactos (sincronización perfecta)...');
    const ffmpegCmd = `"${ffmpeg}" -y -framerate 30 -i "${path.join(framesDir, 'frame_%04d.jpg')}" -i "${wavPath}" -c:v libx264 -preset fast -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "${outMp4}"`;
    execSync(ffmpegCmd, { stdio: 'inherit' });

    const stats = fs.statSync(outMp4);
    console.log(`🎉 Video MP4 Ultra Fluido terminado: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    // Limpiar carpeta de fotogramas temporales
    try {
        fs.rmSync(framesDir, { recursive: true, force: true });
        if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
    } catch (e) {}

    // Enviar a Telegram
    console.log('📤 Enviando video Ultra Fluido a Telegram...');
    const form = new FormData();
    form.append('chat_id', TELEGRAM_CHAT_ID);
    form.append('video', new Blob([fs.readFileSync(outMp4)], { type: 'video/mp4' }), 'PaseBoda_Tour_UltraFluido_30s.mp4');
    form.append('width', '1280');
    form.append('height', '720');
    form.append('supports_streaming', 'true');
    form.append('caption', '✨ <b>¡Nuevo Tour PaseBoda Suite (Pantalla Completa 100%)!</b> 🚀\n\n' +
        '• <b>Vista Nativa:</b> Toda la pantalla visible al 100% sin recortes (sidebar, métricas, mesas y banner de 15 días).\n' +
        '• <b>Zoom Justificado:</b> Único close-up enfocado en Mesa 3 para ver sillas y alergias; todo lo demás a pantalla completa.\n' +
        '• <b>Fluidez Total:</b> 30 FPS constantes (1,020 fotogramas sin tirones).\n' +
        '• <b>Audio Acústico:</b> Canon en Re Mayor + Clics sincronizados + Chime de puerta.\n\n' +
        '<i>¡Listo para revisar en tu celular!</i>');
    form.append('parse_mode', 'HTML');

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
        method: 'POST',
        body: form
    });
    const data = await res.json();
    console.log('Resultado Telegram:', data.ok ? '✅ Entregado exitosamente' : data);
}

runUltraFluidTour().catch(console.error);
