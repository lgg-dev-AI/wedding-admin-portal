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

    console.log('📸 Capturando tomas reales de alta definición...');
    const shotDash = await page.screenshot({ encoding: 'base64' });

    // Seating Overview
    await page.evaluate(() => { if (typeof showTab === 'function') showTab('seating'); });
    await new Promise(r => setTimeout(r, 800));
    const shotSeating = await page.screenshot({ encoding: 'base64' });

    // Seating Zoom
    await page.evaluate(() => {
        const area = document.getElementById('seatingCanvasArea') || document.querySelector('.seating-viewport') || document.querySelector('.seating-container');
        if (area) {
            area.style.transform = 'scale(1.25)';
            area.style.transformOrigin = 'center center';
        }
    });
    await new Promise(r => setTimeout(r, 500));
    const shotZoom = await page.screenshot({ encoding: 'base64' });

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
            gain.gain.setValueAtTime(0.2, time);
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
            gain.gain.setValueAtTime(0.3, time);
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

        // Clics sincronizados con transiciones
        playClick(4.2);   // Clic a Mesas 2D
        playClick(9.2);   // Clic Zoom Mesas
        playClick(14.2);  // Clic Modo Novios
        playClick(19.2);  // Clic WhatsApp
        playClick(24.2);  // Clic Hostess
        playChime(26.8);  // Ding de validación exitosa

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

    console.log('🖼️ Precargando capturas en la memoria del navegador...');
    await page.evaluate(async (s1, s2, s3, s4, s5, s6) => {
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
            await loadImage(s5),
            await loadImage(s6)
        ];
    }, shotDash, shotSeating, shotZoom, shotNovios, shotDispatch, shotHostess);

    // Renderizar fotogramas ultra fluidos (34 segundos a 30 FPS = 1020 fotogramas exactos)
    console.log('🎞️ Renderizando 1,020 fotogramas exactos (Frame-by-Frame, 0 caídas de FPS)...');
    const framesDir = path.join(BASE_DIR, 'render_frames_' + Date.now());
    fs.mkdirSync(framesDir, { recursive: true });

    // Evaluación en página para generar el lote de fotogramas sin pérdida de tiempo
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

            const [imgDash, imgSeating, imgZoom, imgNovios, imgDispatch, imgHostess] = window.__tourImages;

            // Subtítulos
            const captionsData = [
                { start: 0.2, end: 4.2, words: [{ w: 'Modo Demo:', t: 0.2 }, { w: 'Prueba de 15 Días Gratis', t: 1.0 }, { w: 'con métricas en vivo.', t: 2.2 }] },
                { start: 4.4, end: 9.2, words: [{ w: 'Plano 2D Interactivo:', t: 4.4 }, { w: 'Distribuye tu salón', t: 5.8 }, { w: 'y mesas imperiales en minutos.', t: 7.2 }] },
                { start: 9.4, end: 14.2, words: [{ w: 'Control de Banquete:', t: 9.4 }, { w: 'Conteo automático de sillas,', t: 10.8 }, { w: 'dietas y alergias.', t: 12.4 }] },
                { start: 14.4, end: 19.2, words: [{ w: 'Modo Novios:', t: 14.4 }, { w: 'La vista romántica, limpia', t: 15.8 }, { w: 'y libre de enredos técnicos.', t: 17.4 }] },
                { start: 19.4, end: 24.2, words: [{ w: 'WhatsApp Oficial:', t: 19.4 }, { w: 'Boletos VIP digitales', t: 20.8 }, { w: 'con código QR único.', t: 22.4 }] },
                { start: 24.4, end: 29.2, words: [{ w: 'Hostess en Puerta:', t: 24.4 }, { w: 'Escaneo con celular en 2 seg:', t: 25.8 }, { w: 'cero filas en el salón.', t: 27.4 }] },
                { start: 29.4, end: 33.8, words: [{ w: 'PaseBoda Suite:', t: 29.4 }, { w: 'Prueba 15 días gratis en', t: 30.8 }, { w: 'paseboda.com', t: 32.2 }] }
            ];

            function renderCaptions(time) {
                const group = captionsData.find(g => time >= g.start && time < g.end);
                if (!group) return;

                ctx.save();
                const boxY = height - 68;
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
                    ctx.fillStyle = isActive ? '#fbbf24' : 'rgba(255, 255, 255, 0.4)';
                    ctx.font = isActive ? '800 16px -apple-system, sans-serif' : '600 16px -apple-system, sans-serif';
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
                ctx.roundRect(28, 20, 330, 50, 12);
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

            function drawCursor(x, y, isClick = false) {
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
                ctx.moveTo(0, 0); ctx.lineTo(0, 16); ctx.lineTo(4, 12); ctx.lineTo(8, 19); ctx.lineTo(11, 18); ctx.lineTo(7, 11); ctx.lineTo(12, 11);
                ctx.closePath();
                ctx.fill(); ctx.stroke();
                ctx.restore();
            }

            const results = [];

            for (let f = startFrame; f < endFrame; f++) {
                const time = f / fps;

                // 1. DASHBOARD MODO DEMO (0s - 4.5s)
                if (time < 4.5) {
                    const localT = time;
                    const zoom = 1.0 + (localT / 4.5) * 0.12;
                    ctx.save();
                    ctx.translate(width * 0.5, height * 0.4);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-width * 0.5, -height * 0.4);
                    ctx.drawImage(imgDash, 0, 0, width, height);
                    ctx.restore();
                    drawBadge('Torre de Control en Vivo', 'Prueba 15 Días • Modo Demo');
                    drawCursor(480 + localT * 25, 160 + localT * 12, false);
                }
                // 2. PLANO 2D OVERVIEW (4.5s - 9.5s)
                else if (time >= 4.5 && time < 9.5) {
                    const localT = time - 4.5;
                    const zoom = 1.0 + (localT / 5.0) * 0.14;
                    ctx.save();
                    ctx.translate(width * 0.55, height * 0.5);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-width * 0.55, -height * 0.5);
                    ctx.drawImage(imgSeating, 0, 0, width, height);
                    ctx.restore();
                    drawBadge('Plano de Mesas 2D Interactivo', 'Acomodo de Salón');
                    drawCursor(520, 320, localT < 0.4);
                }
                // 3. ZOOM A MESAS & DIETAS (9.5s - 14.5s)
                else if (time >= 9.5 && time < 14.5) {
                    const localT = time - 9.5;
                    const panX = localT * 28;
                    ctx.save();
                    ctx.translate(-panX, 0);
                    ctx.drawImage(imgZoom, 0, 0, width, height);
                    ctx.restore();
                    drawBadge('Gestión de Sillas & Menús', 'Control de Alergias & Dietas');
                    drawCursor(620 + Math.sin(localT * 2) * 60, 360, localT > 2 && localT < 2.4);
                }
                // 4. MODO NOVIOS VISTA LIMPIA (14.5s - 19.5s)
                else if (time >= 14.5 && time < 19.5) {
                    const localT = time - 14.5;
                    ctx.save();
                    ctx.drawImage(imgNovios, 0, 0, width, height);
                    ctx.strokeStyle = 'rgba(226, 168, 145, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.roundRect(280, 110, 700, 240, 14);
                    ctx.stroke();
                    ctx.restore();
                    drawBadge('Vista Simplificada de Pareja', 'Alternancia de Roles', '#e2a891');
                    drawCursor(380 + localT * 30, 220, localT < 0.4);
                }
                // 5. WHATSAPP & BOLETO QR (19.5s - 24.5s)
                else if (time >= 19.5 && time < 24.5) {
                    const localT = time - 19.5;
                    ctx.save();
                    ctx.drawImage(imgDispatch, 0, 0, width, height);
                    ctx.restore();
                    drawBadge('Despacho Oficial por WhatsApp', 'Boletos VIP con Código QR', '#25d366');
                    drawCursor(540, 260, localT > 1.5 && localT < 1.9);
                }
                // 6. HOSTESS EXPRESS EN PUERTA (24.5s - 29.5s)
                else if (time >= 24.5 && time < 29.5) {
                    const localT = time - 24.5;
                    ctx.save();
                    ctx.drawImage(imgHostess, 0, 0, width, height);
                    if (time >= 26.6 && time <= 28.0) {
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
                        ctx.fillRect(0, 0, width, height);
                    }
                    ctx.restore();
                    drawBadge('Hostess Express Móvil', 'Recepción & Cero Colados', '#10b981');
                    drawCursor(460, 320, localT > 2.1 && localT < 2.5);
                }
                // 7. CIERRE COMERCIAL (29.5s - 34.0s)
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
    form.append('caption', '✨ <b>¡Nuevo Tour Ultra Fluido de PaseBoda (34s)!</b> 🚀\n\n' +
        '• <b>Tecnología:</b> Renderizado Frame-by-Frame a 30 FPS exactos (Cero tirones, cero frames duplicados).\n' +
        '• <b>Modo Demo Vivo:</b> Boda de Sofía & Alejandro con métricas, mesas y banner superior de 15 Días Gratis.\n' +
        '• <b>Audio PCM:</b> Canon en Re Mayor acústico + Clics sutiles + Chime de validación.\n' +
        '• <b>Subtítulos:</b> Sincronizados palabra por palabra con resaltado en oro.\n\n' +
        '<i>¡Listo para pautas publicitarias y presentaciones comerciales!</i>');
    form.append('parse_mode', 'HTML');

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
        method: 'POST',
        body: form
    });
    const data = await res.json();
    console.log('Resultado Telegram:', data.ok ? '✅ Entregado exitosamente' : data);
}

runUltraFluidTour().catch(console.error);
