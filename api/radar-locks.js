// ==========================================================================
// VERCEL SERVERLESS API: SHARED WHATSAPP RADAR LOCKS RELAY (/api/radar-locks)
// GESTIÓN CENTRALIZADA DE CONCURRENCIA PERSISTENTE: PASEBODA ⇄ ATELIER STUDIO
// ==========================================================================

const https = require('https');
const fs = require('fs');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1374411558';
const TMP_FILE = '/tmp/shared_radar_locks.json';

const DEFAULT_LOCKS = [
    {
        id: 'lock_paseboda_manana_2am',
        source: 'paseboda',
        weddingName: 'Boda Valentina y Sebastián (Programación 2:00 AM)',
        templateName: 'paseboda_invitacion_1',
        startTimestamp: 1793865600000, // 05 Nov 2026 02:00:00 GMT-6
        endTimestamp: 1793869200000,   // 05 Nov 2026 03:00:00 GMT-6 (1h de envío)
        durationMinutes: 60,
        cooldownMinutes: 30,
        protectedEndTimestamp: 1793871000000, // 03:30 AM libre
        guestsCount: 42,
        sentCount: 0,
        failedCount: 0,
        status: 'scheduled',
        recipientLog: []
    },
    {
        id: 'lock_atelier_1793857500000',
        source: 'atelier',
        weddingName: 'Boda Isabella & Maximiliano (Atelier Studio)',
        templateName: 'muestras_op1_invitacion',
        startTimestamp: 1793857500000,
        endTimestamp: 1793861100000,
        durationMinutes: 60,
        cooldownMinutes: 30,
        protectedEndTimestamp: 1793862900000,
        guestsCount: 45,
        sentCount: 0,
        failedCount: 0,
        status: 'scheduled',
        recipientLog: []
    },
    {
        id: 'lock_paseboda_active',
        source: 'paseboda',
        weddingName: 'Boda Valentina & Sebastián (Convocatoria)',
        templateName: 'paseboda_invitacion_1',
        startTimestamp: 1793852466586,
        endTimestamp: 1793856066586,
        durationMinutes: 60,
        cooldownMinutes: 30,
        protectedEndTimestamp: 1793857866586,
        guestsCount: 42,
        sentCount: 39,
        failedCount: 3,
        status: 'with_errors',
        recipientLog: []
    }
];

function loadPersistentLocks() {
    try {
        if (fs.existsSync(TMP_FILE)) {
            const raw = fs.readFileSync(TMP_FILE, 'utf8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                global.__sharedRadarLocks = parsed;
                return parsed;
            }
        }
    } catch (e) {}

    if (!global.__sharedRadarLocks || global.__sharedRadarLocks.length === 0) {
        global.__sharedRadarLocks = DEFAULT_LOCKS;
    }
    return global.__sharedRadarLocks;
}

function savePersistentLocks(locks) {
    global.__sharedRadarLocks = locks;
    try {
        fs.writeFileSync(TMP_FILE, JSON.stringify(locks));
    } catch (e) {}
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const now = Date.now();
    let currentLocks = loadPersistentLocks();

    // 1. GET: Retornar lista de bloqueos en memoria persistente
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            serverTimestamp: now,
            locks: currentLocks
        });
    }

    // 2. POST: Registrar nuevo bloqueo o actualización de despacho
    if (req.method === 'POST') {
        try {
            const body = req.body || {};
            const {
                id,
                source,           // 'atelier' o 'paseboda'
                weddingName,      // Nombre del evento o campaña
                templateName,     // Plantilla Meta
                startTimestamp,   // Timestamp ms inicio
                durationMinutes,  // 60 o 120 min
                cooldownMinutes,  // 30 min por defecto
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
            const COOLDOWN_BUFFER_MIN = Number(cooldownMinutes) || 30;
            const cooldownMs = COOLDOWN_BUFFER_MIN * 60 * 1000;
            const protectedEndMs = endMs + cooldownMs;
            const lockId = id || `lock_${source}_${Date.now()}`;

            // Chequeo de colisión considerando la duración del despacho + 30 min de cooldown
            for (const item of currentLocks) {
                if (item.id === lockId) continue;
                
                const itemCooldownMs = (item.cooldownMinutes || 30) * 60 * 1000;
                const itemProtectedEndMs = item.endTimestamp + itemCooldownMs;

                // Conflicto de traslape: nuevo inicio < fin protegido existente Y fin protegido nuevo > inicio existente
                if (startMs < itemProtectedEndMs && protectedEndMs > item.startTimestamp) {
                    const freeTimeStr = new Date(itemProtectedEndMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Monterrey' });
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

            const idx = currentLocks.findIndex(l => l.id === lockId);
            if (idx >= 0) {
                currentLocks[idx] = newLock;
            } else {
                currentLocks.unshift(newLock);
            }
            savePersistentLocks(currentLocks);

            // Alerta formal a Telegram a Luis con desglose de Cooldown de 30 min
            const startStr = new Date(startMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Monterrey' });
            const endStr = new Date(endMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Monterrey' });
            const freeStr = new Date(protectedEndMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Monterrey' });
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
            savePersistentLocks(currentLocks);
            return res.status(200).json({ success: true, message: `Bloqueo ${idToDelete} eliminado.`, locks: currentLocks });
        }
        return res.status(400).json({ success: false, error: 'Se requiere id para eliminar.' });
    }

    return res.status(405).json({ error: 'Método no permitido.' });
};
