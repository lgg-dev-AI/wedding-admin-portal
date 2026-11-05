// ==========================================================================
// VERCEL SERVERLESS API: SHARED WHATSAPP RADAR LOCKS RELAY (/api/radar-locks)
// GESTIÓN CENTRALIZADA DE CONCURRENCIA PERSISTENTE: PASEBODA ⇄ ATELIER STUDIO
// ==========================================================================

const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1374411558';
const PERSISTENT_STORE_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1aa11ef9b3c8b';

// Fallback en memoria si la nube de persistencia no responde
global.__sharedRadarLocks = global.__sharedRadarLocks || [
    {
        id: 'lock_paseboda_active',
        source: 'paseboda',
        weddingName: 'Boda Valentina & Sebastián (Convocatoria)',
        templateName: 'paseboda_invitacion_1',
        startTimestamp: 1793852466586,
        endTimestamp: 1793856066586,
        durationMinutes: 60,
        cooldownMinutes: 30,
        protectedEndTimestamp: 1793857866586, // Protegido hasta 11:51 PM
        guestsCount: 42,
        sentCount: 39,
        failedCount: 3,
        status: 'with_errors',
        recipientLog: []
    }
];

function fetchCloudStore() {
    return new Promise((resolve) => {
        try {
            https.get(PERSISTENT_STORE_URL, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed && parsed.data && Array.isArray(parsed.data.locks)) {
                            global.__sharedRadarLocks = parsed.data.locks;
                            return resolve(parsed.data.locks);
                        }
                    } catch (e) {}
                    resolve(global.__sharedRadarLocks);
                });
            }).on('error', () => resolve(global.__sharedRadarLocks));
        } catch (e) {
            resolve(global.__sharedRadarLocks);
        }
    });
}

function saveCloudStore(locks) {
    global.__sharedRadarLocks = locks;
    return new Promise((resolve) => {
        try {
            const payload = JSON.stringify({
                name: 'paseboda_radar_locks',
                data: { locks: locks }
            });

            const req = https.request(PERSISTENT_STORE_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            }, (res) => {
                resolve(true);
            });

            req.on('error', () => resolve(false));
            req.write(payload);
            req.end();
        } catch (e) {
            resolve(false);
        }
    });
}

function sendTelegramNotification(text) {
    return new Promise((resolve) => {
        try {
            const payload = JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            });

            const req = https.request({
                hostname: 'api.telegram.org',
                path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            }, (res) => {
                resolve(true);
            });

            req.on('error', () => resolve(false));
            req.write(payload);
            req.end();
        } catch (e) {
            resolve(false);
        }
    });
}

module.exports = async (req, res) => {
    // CORS headers para permitir llamadas desde Atelier Studio o PaseBoda
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const now = Date.now();
    let currentLocks = await fetchCloudStore();

    // 1. GET: Retornar lista de bloqueos activos y futuros
    if (req.method === 'GET') {
        // Filtrar bloqueos finalizados hace más de 48 horas para mantener backlog ordenado
        currentLocks = currentLocks.filter(l => (l.endTimestamp || 0) > (now - 48 * 60 * 60 * 1000));
        return res.status(200).json({
            success: true,
            serverTimestamp: now,
            locks: currentLocks
        });
    }

    // 2. POST: Registrar nuevo bloqueo o actualización de despacho
    if (req.method === 'POST') {
        try {
            let body = req.body;
            if (typeof body === 'string') {
                try { body = JSON.parse(body); } catch(e) {}
            }
            body = body || {};

            const {
                id,
                source,           // 'atelier' o 'paseboda'
                weddingName,      // Nombre del evento o campaña
                templateName,     // Plantilla Meta
                startTimestamp,   // Timestamp ms inicio
                durationMinutes,  // 60 o 120 min
                guestsCount,      // Total invitados
                sentCount,
                failedCount,
                status,           // 'scheduled', 'in_progress', 'completed', 'with_errors'
                recipientLog
            } = body;

            if (!source || !startTimestamp) {
                return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos (source, startTimestamp).' });
            }

            const startMs = Number(startTimestamp);
            const durMin = Number(durationMinutes) || (Number(guestsCount) > 50 ? 120 : 60);
            const endMs = startMs + (durMin * 60 * 1000);
            const COOLDOWN_BUFFER_MIN = 30; // 30 minutos obligatorios de enfriamiento/protección
            const cooldownMs = COOLDOWN_BUFFER_MIN * 60 * 1000;
            const protectedEndMs = endMs + cooldownMs;
            const lockId = id || `lock_${source}_${Date.now()}`;

            // Chequeo de colisión considerando la duración del despacho + 30 min de cooldown
            for (const item of currentLocks) {
                if (item.id === lockId) continue; // Si es actualización del mismo bloqueo, ignorar
                
                const itemCooldownMs = (item.cooldownMinutes || 30) * 60 * 1000;
                const itemProtectedEndMs = (item.endTimestamp || 0) + itemCooldownMs;

                // Conflicto: nuevo inicio < fin protegido existente Y fin protegido nuevo > inicio existente
                if (startMs < itemProtectedEndMs && protectedEndMs > item.startTimestamp) {
                    const freeTimeStr = new Date(itemProtectedEndMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                    return res.status(409).json({
                        success: false,
                        collision: true,
                        message: `⚠️ Horario no disponible. Línea en uso por ${item.source === 'atelier' ? 'Atelier Studio' : 'PaseBoda'} (incluye 30 min de cooldown preventivo). Próximo turno libre a partir de las ${freeTimeStr} hrs.`,
                        nextFreeTimeStr: freeTimeStr,
                        conflictingLock: item
                    });
                }
            }

            const newLock = {
                id: lockId,
                source: source === 'atelier' ? 'atelier' : 'paseboda',
                weddingName: weddingName || (source === 'atelier' ? 'Campaña Atelier Studio' : 'Boda PaseBoda'),
                templateName: templateName || (source === 'atelier' ? 'muestras_op1_invitacion' : 'paseboda_invitacion_1'),
                startTimestamp: startMs,
                endTimestamp: endMs,
                cooldownMinutes: COOLDOWN_BUFFER_MIN,
                protectedEndTimestamp: protectedEndMs,
                durationMinutes: durMin,
                guestsCount: Number(guestsCount) || 1,
                sentCount: Number(sentCount) || 0,
                failedCount: Number(failedCount) || 0,
                status: status || 'scheduled',
                recipientLog: recipientLog || []
            };

            // Reemplazar si ya existía o agregar al inicio
            const idx = currentLocks.findIndex(l => l.id === lockId);
            if (idx >= 0) {
                currentLocks[idx] = newLock;
            } else {
                currentLocks.unshift(newLock);
            }

            // Persistir de inmediato en la nube central compartida
            await saveCloudStore(currentLocks);

            // Enviar alerta formal a Telegram a Luis con desglose de Cooldown de 30 min
            const startStr = new Date(startMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            const endStr = new Date(endMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            const freeStr = new Date(protectedEndMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            const sourceIcon = source === 'atelier' ? '🎨 Atelier Studio' : '💍 PaseBoda';
            const durLabel = durMin >= 120 ? '2 horas' : '1 hora';

            const telegramMsg = `📅 <b>ENVÍO REGISTRADO EN EL RADAR</b>\n` +
                `• <b>Plataforma:</b> ${sourceIcon}\n` +
                `• <b>Evento:</b> ${newLock.weddingName}\n` +
                `• <b>Invitados:</b> ${newLock.guestsCount} personas\n` +
                `• <b>Ventana de Envío:</b> ${startStr} a ${endStr} hrs\n` +
                `• 🔒 <b>LÍNEA BLOQUEADA POR:</b> ${durLabel} (+ 30 min cooldown)\n` +
                `• 🛡️ <b>Margen de Enfriamiento:</b> ${endStr} a ${freeStr} hrs\n` +
                `• ⏳ <b>Servicio disponible de nuevo a las:</b> <b>${freeStr} hrs</b>\n` +
                `• 📡 <b>Estado:</b> ${newLock.status.toUpperCase()}`;

            await sendTelegramNotification(telegramMsg);

            return res.status(200).json({
                success: true,
                message: 'Bloqueo registrado y alerta de Telegram enviada exitosamente.',
                lock: newLock,
                locks: currentLocks
            });
        } catch (e) {
            return res.status(500).json({ success: false, error: e.message });
        }
    }

    // 3. DELETE: Eliminar bloqueo
    if (req.method === 'DELETE') {
        const idToDelete = (req.query && req.query.id) || (req.body && req.body.id);
        if (idToDelete) {
            currentLocks = currentLocks.filter(l => l.id !== idToDelete);
            await saveCloudStore(currentLocks);
            return res.status(200).json({ success: true, message: `Bloqueo ${idToDelete} eliminado.`, locks: currentLocks });
        }
        return res.status(400).json({ success: false, error: 'Se requiere id para eliminar.' });
    }

    return res.status(405).json({ error: 'Método no permitido.' });
};
