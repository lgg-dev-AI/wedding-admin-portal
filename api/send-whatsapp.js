// ==========================================================================
// VERCEL SERVERLESS FUNCTION: META WHATSAPP CLOUD API DIRECT DISPATCH
// LINEA OFICIAL REGISTRADA: +1 364 212 1213 (ANTIGRAVITY WEB STUDIO)
// ==========================================================================

const https = require('https');

const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || '1386603407867954';
const WABA_ID = process.env.META_WABA_ID || '2076905906364029';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAAZBXEyuLd6cBSlrXbP3YamgCxhzI004IfWyJEiuNuJvEStc1xkyRx03wdawBKmlYU4O7fSH5IMKwFjas8Xd5w1BjVGNpR27MxYScnhYocDvpPQLHqDHeJJUAXPWNuSwZCeXYpCBzOtx1M6hQmJX4H4Efe7SDSl2OAxkAJ4KYghecQ2Etci0c1Q3gxI2Q50wZDZD';

function sendMetaWhatsApp(toPhone, messageBody, templatePayload = null, extraData = {}) {
    return new Promise((resolve, reject) => {
        let cleanDigits = (toPhone || '').replace(/[^0-9]/g, '');
        if (cleanDigits.length === 10) {
            cleanDigits = '521' + cleanDigits;
        } else if (cleanDigits.length === 12 && cleanDigits.startsWith('52') && !cleanDigits.startsWith('521')) {
            cleanDigits = '521' + cleanDigits.substring(2);
        }

        // Si no se especifica plantilla válida, construir fallback a la plantilla oficial de Meta aprobada (notificacion_reservas_bodas)
        // para garantizar entrega inmediata fuera de la ventana de 24h
        let payloadObj;
        if (templatePayload && templatePayload.name) {
            payloadObj = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanDigits,
                type: 'template',
                template: {
                    name: templatePayload.name,
                    language: { code: templatePayload.language || 'es_MX' },
                    components: templatePayload.components || []
                }
            };
        } else {
            // Auto-fallback a plantilla aprobada oficial
            const pCount = extraData.passes || 1;
            const pText = pCount > 1 ? `${pCount} pases` : '1 pase';
            payloadObj = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanDigits,
                type: 'template',
                template: {
                    name: 'notificacion_reservas_bodas',
                    language: { code: 'es_MX' },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: extraData.name || 'Invitado de Honor' },
                                { type: 'text', text: pText },
                                { type: 'text', text: extraData.couple || 'Sofía & Alejandro' },
                                { type: 'text', text: extraData.date || '24 de Octubre, 2027' },
                                { type: 'text', text: extraData.venue || 'Hacienda Fundadores' },
                                { type: 'text', text: extraData.liveUrl || 'https://aura-wedding-experience.vercel.app' }
                            ]
                        }
                    ]
                }
            };
        }

        const payload = JSON.stringify(payloadObj);

        const options = {
            hostname: 'graph.facebook.com',
            port: 443,
            path: `/v21.0/${PHONE_NUMBER_ID}/messages`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let resData = '';
            res.on('data', chunk => resData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(resData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const msgId = (parsed.messages && parsed.messages[0]) ? parsed.messages[0].id : 'OK';
                        resolve({ success: true, messageId: msgId, to: cleanDigits, details: parsed });
                    } else {
                        const errMsg = (parsed.error && parsed.error.message) ? parsed.error.message : resData;
                        resolve({ success: false, statusCode: res.statusCode, error: errMsg, code: parsed.error?.code, details: parsed });
                    }
                } catch (e) {
                    resolve({ success: false, statusCode: res.statusCode, error: resData });
                }
            });
        });

        req.on('error', err => reject(err));
        req.write(payload);
        req.end();
    });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) {}
        }
        body = body || {};

        const { to, message, template, batch } = body;

        // Disparo en lote
        if (Array.isArray(batch) && batch.length > 0) {
            const results = [];
            for (const item of batch) {
                if (!item.to) continue;
                try {
                    const r = await sendMetaWhatsApp(item.to, item.message, item.template || template, item);
                    results.push({ to: item.to, guestId: item.guestId, name: item.name, ...r });
                } catch (err) {
                    results.push({ to: item.to, guestId: item.guestId, name: item.name, success: false, error: err.message });
                }
            }
            return res.status(200).json({ success: true, batchResults: results });
        }

        // Disparo individual
        if (!to) {
            return res.status(400).json({ error: 'Falta el parámetro requerido: "to"' });
        }

        const result = await sendMetaWhatsApp(to, message, template, body);
        return res.status(result.success ? 200 : 400).json(result);

    } catch (err) {
        console.error('Meta Cloud API dispatch error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
