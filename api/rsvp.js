// ==========================================================================
// VERCEL SERVERLESS API: LIVE RSVP WEB RELAY (/api/rsvp)
// Recibe confirmaciones de invitaciones web, notifica a Telegram en tiempo real
// y sincroniza con el Wedding Planner CRM & Seating Chart
// ==========================================================================

const DEFAULT_BOT_TOKEN = '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const DEFAULT_CHAT_ID = '1374411558';

global.__weddingRsvpStore = global.__weddingRsvpStore || {
    aleypablo: [
        {
            id: 'rsvp_init_1',
            weddingId: 'aleypablo',
            name: 'Lic. Fernando Valenzuela',
            phone: '+52 55 4433 2211',
            attendance: 'yes',
            passes: 2,
            adultsCount: 2,
            kidsCount: 0,
            companion: 'Sra. Elena de Valenzuela',
            menu: 'Filete Angus / Salmón',
            allergies: 'Sin Gluten',
            song: 'Frank Sinatra - Fly Me to the Moon',
            message: '¡Muchas felicidades a los dos! Nos vemos en Morelos.',
            createdAt: new Date().toISOString()
        }
    ]
};

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function notifyTelegramRsvp(data) {
    const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID;

    if (!token || !chatId) return;

    const {
        weddingTitle = 'Boda Ale & Pablo',
        name = 'Invitado',
        phone = '',
        attendance = 'yes',
        passes = 1,
        adultsCount = 1,
        kidsCount = 0,
        companion = '',
        menu = 'Menú Fijo de Gala',
        allergies = 'Ninguna',
        song = '',
        message = ''
    } = data;

    const isAttending = (attendance === 'yes');
    const statusIcon = isAttending ? '✅ <b>ASISTENCIA CONFIRMADA</b>' : '❌ <b>DECLINÓ ASISTENCIA</b>';
    const passesText = isAttending 
        ? `${passes} pase(s) (${adultsCount} Adulto${adultsCount > 1 ? 's' : ''}${kidsCount > 0 ? `, ${kidsCount} Niño(s)` : ''})`
        : '0 pases (No asistirá)';

    const timeStr = new Date().toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        dateStyle: 'short',
        timeStyle: 'short'
    });

    const msgHtml = `
💌 <b>¡NUEVA CONFIRMACIÓN RSVP EN VIVO!</b>
━━━━━━━━━━━━━━━━━━━━
💒 <b>Boda:</b> ${escapeHtml(weddingTitle)}
📊 <b>Estatus:</b> ${statusIcon}
👤 <b>Invitado Titular:</b> <b>${escapeHtml(name)}</b>
📱 <b>WhatsApp / Tel:</b> ${escapeHtml(phone || 'No proporcionado')}
🎟️ <b>Pases Confirmados:</b> ${escapeHtml(passesText)}
${companion ? `👥 <b>Acompañante:</b> ${escapeHtml(companion)}\n` : ''}🍽️ <b>Preferencia Menú:</b> ${escapeHtml(menu || 'Estándar')}
⚠️ <b>Restricciones / Alergias:</b> <b>${escapeHtml(allergies || 'Ninguna')}</b>
${song ? `🎵 <b>Canción para el DJ:</b> <i>"${escapeHtml(song)}"</i>\n` : ''}${message ? `💬 <b>Dedicatoria:</b> <i>"${escapeHtml(message)}"</i>\n` : ''}🕒 <b>Registrado:</b> ${timeStr} hrs
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Sincronizado automáticamente con el Seating Chart y lista de comensales.</i>
`.trim();

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: msgHtml,
                parse_mode: 'HTML'
            })
        });
    } catch (err) {
        console.error('Error al despachar alerta Telegram RSVP:', err);
    }
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const queryWedding = (req.query && req.query.wedding) || (req.body && req.body.weddingId);
    const weddingId = (queryWedding || 'aleypablo').toString().toLowerCase();

    if (!global.__weddingRsvpStore[weddingId]) {
        global.__weddingRsvpStore[weddingId] = [];
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            ok: true,
            weddingId,
            total: global.__weddingRsvpStore[weddingId].length,
            rsvps: global.__weddingRsvpStore[weddingId]
        });
    }

    if (req.method === 'POST') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
            const {
                name,
                phone,
                attendance = 'yes',
                passes = 1,
                adultsCount = 1,
                kidsCount = 0,
                companion = '',
                menu = '',
                allergies = 'Ninguna',
                song = '',
                message = '',
                weddingTitle = 'Boda Ale & Pablo'
            } = body;

            if (!name) {
                return res.status(400).json({ ok: false, error: 'Nombre de invitado requerido' });
            }

            const cleanName = name.trim();
            const cleanPhone = (phone || '').trim();
            const isAttending = (attendance === 'yes');

            const newRsvp = {
                id: 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                weddingId,
                name: cleanName,
                phone: cleanPhone,
                attendance: isAttending ? 'yes' : 'no',
                status: isAttending ? 'confirmed' : 'declined',
                passes: isAttending ? (parseInt(passes, 10) || 1) : 0,
                adultsCount: isAttending ? (parseInt(adultsCount, 10) || 1) : 0,
                kidsCount: isAttending ? (parseInt(kidsCount, 10) || 0) : 0,
                companion: (companion || '').trim(),
                menu: (menu || 'Menú Fijo de Gala').trim(),
                allergies: (allergies || 'Ninguna').trim(),
                song: (song || '').trim(),
                message: (message || '').trim(),
                createdAt: new Date().toISOString()
            };

            // Guardar en la memoria global de este entorno
            // Si ya existía una confirmación previa del mismo invitado/teléfono, actualizarla
            const existingIdx = global.__weddingRsvpStore[weddingId].findIndex(r => 
                (cleanPhone && r.phone === cleanPhone) || 
                (r.name.toLowerCase() === cleanName.toLowerCase())
            );

            if (existingIdx >= 0) {
                global.__weddingRsvpStore[weddingId][existingIdx] = {
                    ...global.__weddingRsvpStore[weddingId][existingIdx],
                    ...newRsvp,
                    updatedAt: new Date().toISOString()
                };
            } else {
                global.__weddingRsvpStore[weddingId].unshift(newRsvp);
            }

            // Despachar alerta instantánea a Telegram
            await notifyTelegramRsvp({
                ...newRsvp,
                weddingTitle
            });

            return res.status(200).json({
                ok: true,
                message: 'Confirmación registrada exitosamente',
                rsvp: newRsvp
            });
        } catch (err) {
            console.error('Error procesando RSVP POST:', err);
            return res.status(500).json({ ok: false, error: err.message });
        }
    }

    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
};
