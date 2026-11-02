// ==========================================================================
// VERCEL SERVERLESS FUNCTION: /api/send-briefing
// Performs 8-block automated audit, generates luxury standalone HTML dossier,
// attaches document & delivers 8-block audit to Telegram (Luis: 1374411558),
// and dispatches email with attached dossier via Resend.
// ==========================================================================

const https = require('https');
const { auditBriefingData, formatTelegramAuditSummary } = require('./briefing-auditor');
const { buildDossierHtml } = require('./briefing-dossier-builder');

function buildBriefingEmailHtml(data, audit) {
    const {
        couple = 'Pareja',
        date = 'Sin fecha',
        cityVenue = 'Sin recinto',
        planner = 'Planner',
        plannerEmail = '',
        phone = '',
        theme = 'Elegante',
        masterDrive = ''
    } = data;

    const auditBlocksHtml = (audit?.blocks || []).map(b => `
        <div style="background:#090d16; border:1px solid ${b.ok ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.4)'}; border-radius:10px; padding:12px 16px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong style="color:${b.ok ? '#34d399' : '#fbbf24'}; font-size:13px;">${b.ok ? '✓' : '⚠️'} ${b.num}. ${b.title}</strong>
                <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:${b.ok ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color:${b.ok ? '#34d399' : '#fbbf24'}; font-weight:700;">${b.ok ? 'Válido' : 'Revisar'}</span>
            </div>
            <div style="font-size:12px; color:#cbd5e1; line-height:1.4;">${b.summary}</div>
        </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expediente de Boda · ${couple} · PaseBoda</title>
</head>
<body style="margin:0; padding:0; background-color:#0b0f19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0b0f19; width:100%; padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" max-width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; background:#111827; border:1px solid #1f2937; border-radius:18px; overflow:hidden; box-shadow:0 20px 45px rgba(0,0,0,0.5);">
                    
                    <!-- Top Rose Gold Accent Line -->
                    <tr>
                        <td height="5" style="background:linear-gradient(90deg, #d97706 0%, #e2a891 50%, #d97706 100%); line-height:5px; font-size:5px;">&nbsp;</td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style="padding:32px 36px 20px; text-align:center;">
                            <div style="display:inline-block; width:56px; height:56px; line-height:56px; background:linear-gradient(135deg, rgba(217,119,6,0.2) 0%, rgba(226,168,145,0.2) 100%); border:1px solid rgba(226,168,145,0.4); border-radius:16px; font-size:28px; margin-bottom:12px;">
                                💍
                            </div>
                            <h1 style="margin:0 0 6px; font-size:24px; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
                                Pase<span style="color:#e2a891;">Boda</span> · Nuevo Briefing
                            </h1>
                            <p style="margin:0; font-size:12px; color:#94a3b8; letter-spacing:0.08em; text-transform:uppercase; font-weight:700;">
                                Expediente Técnico con Auditoría de 8 Bloques
                            </p>
                        </td>
                    </tr>

                    <!-- Highlight Card -->
                    <tr>
                        <td style="padding:10px 36px 20px;">
                            <div style="background:linear-gradient(135deg, rgba(217,119,6,0.12) 0%, rgba(15,23,42,0.8) 100%); border:1.5px solid rgba(217,119,6,0.35); border-radius:14px; padding:20px; text-align:center; margin-bottom:20px;">
                                <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.12em; color:#fbbf24; font-weight:800; display:block; margin-bottom:6px;">Expediente de Boda Registrado:</span>
                                <h2 style="margin:0 0 8px; font-size:26px; color:#ffffff; font-weight:800; letter-spacing:-0.01em;">
                                    ${couple}
                                </h2>
                                <p style="margin:0; font-size:14px; color:#cbd5e1;">
                                    📅 <strong>Fecha:</strong> ${date} &nbsp;·&nbsp; 📍 ${cityVenue}
                                </p>
                                <div style="margin-top:10px; display:inline-block; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:800; background:${audit?.isFullPass ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}; color:${audit?.isFullPass ? '#34d399' : '#fbbf24'}; border:1px solid ${audit?.isFullPass ? '#10b981' : '#f59e0b'};">
                                    Auditoría: ${audit?.score || '8/8'} Bloques Aprobados (${audit?.status || 'Válido'})
                                </div>
                            </div>

                            ${masterDrive ? `
                            <div style="text-align:center; margin-bottom:24px;">
                                <a href="${masterDrive}" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #d97706 0%, #b45309 100%); color:#ffffff; font-weight:800; font-size:14px; padding:12px 28px; border-radius:10px; text-decoration:none; box-shadow:0 6px 18px rgba(217,119,6,0.35);">
                                    📸 Abrir Carpeta de Fotos en Google Drive ↗
                                </a>
                            </div>
                            ` : ''}

                            <!-- 8-Block Audit Summary in Email -->
                            <div style="margin-bottom:24px;">
                                <h3 style="margin:0 0 12px; font-size:14px; text-transform:uppercase; letter-spacing:0.08em; color:#f59e0b;">
                                    🧠 Auditoría Automatizada de los 8 Bloques:
                                </h3>
                                ${auditBlocksHtml}
                            </div>

                            <!-- Document Attachment Notice -->
                            <div style="background:#090d16; border:1px dashed #334155; border-radius:10px; padding:14px; text-align:center; font-size:12px; color:#94a3b8;">
                                📎 <strong>Archivo adjunto:</strong> Se incluyó el expediente completo en este correo listo para descarga y visualización.
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:18px 36px 28px; background:#0b0f19; border-top:1px solid #1f2937; text-align:center;">
                            <p style="margin:0 0 6px; font-size:12px; color:#64748b;">
                                PaseBoda · Plataforma de Gestión Nupcial &amp; Invitaciones Web
                            </p>
                            <p style="margin:0; font-size:11px; color:#475569;">
                                © 2026 Antigravity Web Studio · <a href="https://paseboda.com" style="color:#94a3b8; text-decoration:underline;">paseboda.com</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// Send push notification & document file directly to Luis via Telegram
async function triggerTelegramNotification(data, audit, dossierHtml) {
    const botToken = '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
    const chatId = '1374411558';

    const {
        couple = 'Pareja',
        planner = 'Planner',
        date = 'Fecha por confirmar'
    } = data;

    const cleanCouple = couple.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    const fileName = `Dossier_Briefing_${cleanCouple || 'Boda'}.html`;

    // 1. Send the full 8-Block Audit Report as a structured text message
    const auditText = formatTelegramAuditSummary(couple, planner, date, audit);
    
    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: auditText,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });
    } catch (msgErr) {
        console.warn('[Telegram sendMessage Error]:', msgErr);
    }

    // 2. Send the actual Document File (.html dossier) ready to open with 1-tap in Telegram
    try {
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('caption', `📎 <b>Expediente Oficial Adjunto:</b> Boda ${couple} (${audit.score} Aprobados)`);
        form.append('parse_mode', 'HTML');
        
        const blob = new Blob([dossierHtml], { type: 'text/html' });
        form.append('document', blob, fileName);

        const docRes = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
            method: 'POST',
            body: form
        });
        const docJson = await docRes.json();
        return { ok: docJson && docJson.ok };
    } catch (docErr) {
        console.warn('[Telegram sendDocument Error]:', docErr);
        return { ok: false, error: docErr.message };
    }
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) {}
        }
        body = body || {};

        const couple = body.couple || 'Pareja de Gala';
        const planner = body.planner || 'Wedding Planner';
        const plannerEmail = body.plannerEmail || '';
        const date = body.date || 'Fecha por confirmar';

        // 1. Run 8-Block Intelligent Audit
        const audit = auditBriefingData(body);

        // 2. Build luxury standalone HTML dossier document
        const dossierHtml = buildDossierHtml(body, audit);
        const cleanCouple = couple.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
        const dossierFileName = `Dossier_Briefing_${cleanCouple || 'Boda'}.html`;

        // 3. Dispatch to Telegram (8-Block report + Attached Dossier File)
        let telegramResult = { ok: false };
        try {
            telegramResult = await triggerTelegramNotification(body, audit, dossierHtml);
        } catch (tgErr) {
            console.warn('Telegram trigger error:', tgErr);
        }

        // 4. Dispatch email via Resend with attached Dossier
        const resendApiKey = process.env.RESEND_API_KEY;
        let emailDeliveredExternally = false;

        if (resendApiKey) {
            try {
                const emailHtml = buildBriefingEmailHtml(body, audit);
                const targetRecipients = ['antigravitywebstudio@hotmail.com', 'luis.gongarza@gmail.com'];
                if (plannerEmail && !targetRecipients.includes(plannerEmail)) {
                    targetRecipients.push(plannerEmail);
                }

                for (const recipient of targetRecipients) {
                    const resendPayload = JSON.stringify({
                        from: 'PaseBoda <onboarding@resend.dev>',
                        to: [recipient],
                        subject: `💍 [Expediente Auditado] Boda ${couple} · Planner ${planner} (${audit.score} Bloques)`,
                        html: emailHtml,
                        attachments: [
                            {
                                filename: dossierFileName,
                                content: Buffer.from(dossierHtml).toString('base64')
                            }
                        ]
                    });

                    const singleResp = await new Promise((resolve) => {
                        const rReq = https.request('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${resendApiKey}`,
                                'Content-Type': 'application/json',
                                'Content-Length': Buffer.byteLength(resendPayload)
                            }
                        }, (rRes) => {
                            let data = '';
                            rRes.on('data', chunk => data += chunk);
                            rRes.on('end', () => resolve({ status: rRes.statusCode, data }));
                        });
                        rReq.on('error', (err) => resolve({ error: err.message }));
                        rReq.write(resendPayload);
                        rReq.end();
                    });

                    if (singleResp && singleResp.status >= 200 && singleResp.status < 300) {
                        emailDeliveredExternally = true;
                    }
                }
            } catch (pErr) {
                console.warn('Resend email error:', pErr);
            }
        }

        return res.status(200).json({
            ok: true,
            message: `Briefing para ${couple} auditado y procesado exitosamente`,
            couple,
            planner,
            audit,
            emailDelivered: emailDeliveredExternally,
            telegramSent: telegramResult.ok,
            destination: 'antigravitywebstudio@hotmail.com'
        });

    } catch (err) {
        console.error('Error in /api/send-briefing:', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
};
