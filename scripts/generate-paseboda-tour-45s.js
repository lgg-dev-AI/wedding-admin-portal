const puppeteer = require('C:/Users/Luis/.gemini/antigravity/scratch/node_modules/puppeteer');
const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:\\Users\\Luis\\.gemini\\antigravity\\scratch\\wedding-admin-portal';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1374411558';

async function generateTour45s() {
    console.log('🎬 Iniciando Generador de Tour Real Profesional PaseBoda (45 segundos)...');

    // Cargar capturas reales del sistema en Base64
    const dashB64 = fs.readFileSync(path.join(BASE_DIR, 'audit-1-dashboard.png')).toString('base64');
    const seatingB64 = fs.readFileSync(path.join(BASE_DIR, 'audit-2-seating.png')).toString('base64');
    const dispatchB64 = fs.readFileSync(path.join(BASE_DIR, 'audit-3-dispatch.png')).toString('base64');
    const hostessB64 = fs.readFileSync(path.join(BASE_DIR, 'audit-4-hostess.png')).toString('base64');
    const noviosB64 = fs.readFileSync(path.join(BASE_DIR, 'audit-6-novios.png')).toString('base64');

    const profileDir = path.join(BASE_DIR, '..', 'chrome-tour-profile-' + Date.now());
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

    console.log('🎥 Renderizando coreografía cinemática y audio nupcial...');

    const videoBase64 = await page.evaluate(async (dashData, seatingData, dispatchData, hostessData, noviosData) => {
        return new Promise(async (resolve) => {
            const width = 1280;
            const height = 720;
            const fps = 30;
            const totalSeconds = 45; // 45 segundos exactos
            const totalFrames = totalSeconds * fps; // 1350 frames

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

            const imgDash = await loadImage(dashData);
            const imgSeating = await loadImage(seatingData);
            const imgDispatch = await loadImage(dispatchData);
            const imgHostess = await loadImage(hostessData);
            const imgNovios = await loadImage(noviosData);

            // Web Audio API: Canon en Re Mayor Acústico (Guitarras & Piano romántico)
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

            function playPianoPluck(freq, time, dur = 2.6, vol = 0.22) {
                if (!freq) return;
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(0.001, time);
                gain.gain.exponentialRampToValueAtTime(vol, time + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
                osc.connect(gain);
                gain.connect(dest);
                osc.start(time);
                osc.stop(time + dur + 0.1);

                const oscH = actx.createOscillator();
                const gainH = actx.createGain();
                oscH.type = 'sine';
                oscH.frequency.setValueAtTime(freq * 2, time);
                gainH.gain.setValueAtTime(vol * 0.35, time + 0.02);
                gainH.gain.exponentialRampToValueAtTime(0.0001, time + dur * 0.6);
                oscH.connect(gainH);
                gainH.connect(dest);
                oscH.start(time);
                oscH.stop(time + dur + 0.1);
            }

            function playSoftClick(time) {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, time);
                gain.gain.setValueAtTime(0.18, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
                osc.connect(gain);
                gain.connect(dest);
                osc.start(time);
                osc.stop(time + 0.1);
            }

            function playChime(time) {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(987.77, time);
                gain.gain.setValueAtTime(0.28, time);
                gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);
                osc.connect(gain);
                gain.connect(dest);
                osc.start(time);
                osc.stop(time + 1.5);
            }

            // Programar acordes musicales durante los 45s
            let tMusic = 0.2;
            while (tMusic < totalSeconds) {
                const idx = Math.floor((tMusic / 2.5) % chords.length);
                const ch = chords[idx];
                ch.forEach((n, i) => playPianoPluck(n, tMusic + i * 0.16, 2.7, 0.24));
                tMusic += 2.5;
            }

            // Clics y efectos en las transiciones
            playSoftClick(9.0);   // Clic en Plano 2D
            playSoftClick(19.0);  // Clic en Modo Novios
            playSoftClick(28.0);  // Clic en WhatsApp & Hostess
            playChime(34.5);      // Validación QR Hostess (Ding!)

            // SUBTÍTULOS ANIMADOS PALABRA POR PALABRA
            const captionsData = [
                {
                    start: 0.5, end: 8.8,
                    words: [
                        { w: 'Torre de Control:', t: 0.5 },
                        { w: 'Métricas de asistencia,', t: 1.8 },
                        { w: 'gráficas de pacing', t: 3.6 },
                        { w: 'y confirmaciones', t: 5.4 },
                        { w: 'en tiempo real.', t: 7.0 }
                    ]
                },
                {
                    start: 9.2, end: 18.8,
                    words: [
                        { w: 'Plano de Mesas 2D:', t: 9.2 },
                        { w: 'Distribuye tu salón,', t: 11.0 },
                        { w: 'acomoda invitados', t: 13.0 },
                        { w: 'y gestiona menús', t: 15.0 },
                        { w: 'en segundos.', t: 16.8 }
                    ]
                },
                {
                    start: 19.2, end: 27.8,
                    words: [
                        { w: 'Alternancia de Roles:', t: 19.2 },
                        { w: 'Modo Novios sin estrés', t: 21.0 },
                        { w: 'frente a la suite técnica', t: 23.2 },
                        { w: 'para Wedding Planners.', t: 25.5 }
                    ]
                },
                {
                    start: 28.2, end: 37.8,
                    words: [
                        { w: 'Recepción Inteligente:', t: 28.2 },
                        { w: 'Boletos QR por WhatsApp', t: 30.2 },
                        { w: 'y escaneo Hostess', t: 32.5 },
                        { w: 'para cero filas en puerta.', t: 35.0 }
                    ]
                },
                {
                    start: 38.2, end: 44.8,
                    words: [
                        { w: 'PaseBoda Suite:', t: 38.2 },
                        { w: 'Comienza hoy tus 15 días', t: 40.0 },
                        { w: 'de prueba gratis en', t: 41.8 },
                        { w: 'paseboda.com', t: 43.2 }
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

            function renderWordByWord(time) {
                const curGroup = captionsData.find(g => time >= g.start && time < g.end);
                if (!curGroup) return;

                ctx.save();
                ctx.textAlign = 'center';
                const boxY = height - 76;

                // Contenedor Glassmorphism para subtítulos
                ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
                ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(width / 2 - 380, boxY - 26, 760, 52, 26);
                ctx.fill();
                ctx.stroke();

                // Medición y renderizado de palabras con resaltado activo
                const fullText = curGroup.words.map(w => w.w).join(' ');
                ctx.font = '600 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                const totalW = ctx.measureText(fullText).width;
                let startX = width / 2 - totalW / 2;

                ctx.textAlign = 'left';
                curGroup.words.forEach(item => {
                    const wordW = ctx.measureText(item.w + ' ').width;
                    const isActive = time >= item.t;

                    if (isActive) {
                        ctx.fillStyle = '#fbbf24'; // Dorado brillante palabra activa
                        ctx.font = '800 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; // Blanco tenue
                        ctx.font = '600 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    }

                    ctx.fillText(item.w, startX, boxY + 6);
                    startX += wordW;
                });
                ctx.restore();
            }

            function drawBadge(title, color = '#d97706', subtitle = 'PASEBODA PRO') {
                ctx.save();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(30, 24, 340, 56, 14);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = color;
                ctx.font = 'bold 11px -apple-system, sans-serif';
                ctx.letterSpacing = '1.5px';
                ctx.fillText(subtitle, 48, 44);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 15px -apple-system, sans-serif';
                ctx.fillText(title, 48, 65);
                ctx.restore();
            }

            function drawCursor(x, y, isClicking = false) {
                ctx.save();
                ctx.translate(x, y);

                if (isClicking) {
                    ctx.beginPath();
                    ctx.arc(0, 0, 18, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
                    ctx.fill();
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 18);
                ctx.lineTo(5, 14);
                ctx.lineTo(10, 22);
                ctx.lineTo(13, 20);
                ctx.lineTo(8, 12);
                ctx.lineTo(14, 12);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            // RENDERIZADO FRAME A FRAME (45 SEGUNDOS)
            for (let frame = 0; frame < totalFrames; frame++) {
                const time = frame / fps;

                // -------------------------------------------------------------
                // ESCENA 1 (0s - 9s): TORRE DE CONTROL (DASHBOARD REAL)
                // -------------------------------------------------------------
                if (time < 9.0) {
                    const localT = time;
                    const zoom = 1.0 + Math.min(0.2, (localT / 9.0) * 0.2);

                    ctx.save();
                    ctx.translate(width * 0.45, height * 0.35);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-width * 0.45, -height * 0.35);
                    ctx.drawImage(imgDash, 0, 0, width, height);
                    ctx.restore();

                    drawBadge('Torre de Control & KPIs en Vivo', '#10b981', '01. DASHBOARD GENERAL');

                    // Cursor simulando inspección de métricas
                    const curX = 350 + Math.sin(localT * 1.5) * 80;
                    const curY = 160 + Math.cos(localT * 1.2) * 40;
                    drawCursor(curX, curY, false);
                }

                // -------------------------------------------------------------
                // ESCENA 2 (9s - 19s): PLANO DE MESAS 2D INTERACTIVO
                // -------------------------------------------------------------
                else if (time >= 9.0 && time < 19.0) {
                    const localT = time - 9.0;
                    const zoomProg = Math.min(1, localT / 5.0);
                    const scale = 1.0 + zoomProg * 0.25;

                    ctx.save();
                    ctx.translate(width * 0.55, height * 0.52);
                    ctx.scale(scale, scale);
                    ctx.translate(-width * 0.55, -height * 0.52);
                    ctx.drawImage(imgSeating, 0, 0, width, height);
                    ctx.restore();

                    drawBadge('Plano de Mesas 2D Interactivo', '#f59e0b', '02. SALÓN & AVALÚO');

                    // Cursor animado arrastrando comensal a mesa
                    let curX = 460;
                    let curY = 380;
                    if (localT > 2 && localT < 8) {
                        const p = (localT - 2) / 6;
                        curX = 460 + Math.sin(p * Math.PI) * 160;
                        curY = 380 + Math.sin(p * Math.PI * 1.5) * 80;
                    }
                    drawCursor(curX, curY, localT > 4 && localT < 4.5);
                }

                // -------------------------------------------------------------
                // ESCENA 3 (19s - 28s): ALTERNANCIA DE ROLES (MODO NOVIOS)
                // -------------------------------------------------------------
                else if (time >= 19.0 && time < 28.0) {
                    const localT = time - 19.0;

                    ctx.save();
                    ctx.drawImage(imgNovios, 0, 0, width, height);
                    ctx.restore();

                    drawBadge('Modo Novios: Vista Romántica & Simplificada', '#e2a891', '03. ALTERNANCIA DE ROLES');

                    // Resaltador elegante sobre las métricas de novios
                    ctx.save();
                    ctx.strokeStyle = 'rgba(226, 168, 145, 0.7)';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.roundRect(260, 100, 720, 260, 16);
                    ctx.stroke();
                    ctx.restore();

                    const curProg = Math.min(1, localT / 6.0);
                    const cx = 320 + Math.sin(curProg * Math.PI) * 140;
                    const cy = 200 + curProg * 100;
                    drawCursor(cx, cy, localT > 2.8 && localT < 3.2);
                }

                // -------------------------------------------------------------
                // ESCENA 4 (28s - 38s): DESPACHO WHATSAPP & HOSTESS QR
                // -------------------------------------------------------------
                else if (time >= 28.0 && time < 38.0) {
                    const localT = time - 28.0;

                    ctx.save();
                    if (localT < 5.0) {
                        // Vista de Despacho masivo por WhatsApp
                        ctx.drawImage(imgDispatch, 0, 0, width, height);
                        drawBadge('Convocatoria & Boletos QR por WhatsApp', '#25d366', '04. LOGÍSTICA & ACCESO');
                        drawCursor(480, 240, localT > 2 && localT < 2.5);
                    } else {
                        // Vista de Hostess Express en vivo
                        ctx.drawImage(imgHostess, 0, 0, width, height);
                        drawBadge('Hostess Express: Check-in QR con Celular', '#10b981', '04. RECEPCIÓN EN PUERTA');

                        // Efecto de Validación Verde exitosa a los 34.5s
                        if (time >= 34.2 && time <= 36.5) {
                            ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
                            ctx.fillRect(0, 0, width, height);
                        }
                    }
                    ctx.restore();
                }

                // -------------------------------------------------------------
                // ESCENA 5 (38s - 45s): CIERRE COMERCIAL & LLAMADO A LA ACCIÓN
                // -------------------------------------------------------------
                else {
                    const localT = time - 38.0;

                    // Fondo degradado slate de lujo
                    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
                    bgGrad.addColorStop(0, '#090d16');
                    bgGrad.addColorStop(0.5, '#0f172a');
                    bgGrad.addColorStop(1, '#020617');
                    ctx.fillStyle = bgGrad;
                    ctx.fillRect(0, 0, width, height);

                    // Resplandor central dorado
                    ctx.save();
                    const glow = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, 450);
                    glow.addColorStop(0, 'rgba(217, 119, 6, 0.22)');
                    glow.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = glow;
                    ctx.fillRect(0, 0, width, height);
                    ctx.restore();

                    ctx.save();
                    ctx.textAlign = 'center';

                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 13px -apple-system, sans-serif';
                    ctx.letterSpacing = '4px';
                    ctx.fillText('LA SUITE NUPCIAL DEFINITIVA', width / 2, height / 2 - 110);

                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 54px "Playfair Display", Georgia, serif';
                    ctx.fillText('PaseBoda', width / 2 - 45, height / 2 - 40);
                    ctx.fillStyle = '#fbbf24';
                    ctx.fillText('Suite', width / 2 + 130, height / 2 - 40);

                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '400 19px -apple-system, sans-serif';
                    ctx.fillText('Diseñada para Planners. Amada por los Novios.', width / 2, height / 2 + 18);

                    // Botón de llamado a la acción
                    ctx.fillStyle = 'linear-gradient(135deg, #c59b27 0%, #947118 100%)';
                    ctx.beginPath();
                    ctx.roundRect(width / 2 - 200, height / 2 + 65, 400, 54, 99);
                    ctx.fillStyle = '#c59b27';
                    ctx.fill();

                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 18px -apple-system, sans-serif';
                    ctx.fillText('Prueba 15 Días Gratis en paseboda.com', width / 2, height / 2 + 99);
                    ctx.restore();
                }

                // Subtítulos dinámicos palabra por palabra abajo
                renderWordByWord(time);

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
    }, dashB64, seatingB64, dispatchB64, hostessB64, noviosB64);

    await browser.close();

    const outWebm = path.join(BASE_DIR, 'PaseBoda_Tour_Profesional_45s.webm');
    const outMp4 = path.join(BASE_DIR, 'PaseBoda_Tour_Profesional_45s.mp4');

    fs.writeFileSync(outWebm, Buffer.from(videoBase64, 'base64'));
    const webmStats = fs.statSync(outWebm);
    console.log(`✅ WebM generado: ${(webmStats.size / (1024 * 1024)).toFixed(2)} MB`);

    // Transcodificar a MP4 (H.264/AAC faststart)
    console.log('🔄 Transcodificando a MP4 H.264 con ffmpeg...');
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
    console.log('📤 Enviando video por Telegram al chat ' + TELEGRAM_CHAT_ID + '...');
    const fileToSend = fs.existsSync(outMp4) ? outMp4 : outWebm;
    const isMp4 = fileToSend.endsWith('.mp4');

    const form = new FormData();
    form.append('chat_id', TELEGRAM_CHAT_ID);
    form.append('video', new Blob([fs.readFileSync(fileToSend)], { type: isMp4 ? 'video/mp4' : 'video/webm' }), isMp4 ? 'PaseBoda_Tour_Profesional_45s.mp4' : 'PaseBoda_Tour_Profesional_45s.webm');
    form.append('width', '1280');
    form.append('height', '720');
    form.append('supports_streaming', 'true');
    form.append('caption', '🎬 <b>¡Tour Demostrativo Profesional de PaseBoda (45s)!</b> 🚀\n\n' +
        '• <b>Calidad:</b> 1280x720 HD con Interfaz Real del Software\n' +
        '• <b>Música:</b> Canon en Re Mayor Acústico + Efectos de Sonido\n' +
        '• <b>Subtítulos:</b> Sincronizados palabra por palabra\n\n' +
        '<b>Coreografía de Pantallas:</b>\n' +
        '  1. 📊 Torre de Control (Dashboard real con KPIs)\n' +
        '  2. 🪑 Plano de Mesas 2D (Zoom cinemático y cursor interactivo)\n' +
        '  3. 👰 Alternancia de Roles (Vista limpia para Novios)\n' +
        '  4. 📲 Despacho WhatsApp & Validación Hostess QR en puerta\n' +
        '  5. 🌐 Cierre con llamado a la acción (paseboda.com)');
    form.append('parse_mode', 'HTML');

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
        method: 'POST',
        body: form
    });
    const data = await res.json();
    console.log('Resultado Telegram:', data.ok ? '✅ Video entregado con éxito' : data);
}

generateTour45s().catch(console.error);
