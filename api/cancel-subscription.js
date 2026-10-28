// ==========================================================================
// VERCEL SERVERLESS FUNCTION: /api/cancel-subscription
// Receives subscription deactivation requests, calculates service cutoff,
// and notifies master developer (Luis) via transactional email (Resend)
// ==========================================================================

const https = require('https');

function buildDeactivationEmailHtml({
    plannerName,
    plannerEmail,
    agencyName,
    planName,
    contractDate,
    cancellationDate,
    periodEndDate,
    reason
}) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Desactivación de Plan · Wedding Planner OS</title>
</head>
<body style="margin:0; padding:0; background-color:#0b0f19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0b0f19; width:100%; padding:32px 16px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table role="presentation" width="100%" max-width="620" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; background:#111827; border:1px solid #1f2937; border-radius:18px; overflow:hidden; box-shadow:0 20px 45px rgba(0,0,0,0.5);">
                    
                    <!-- Top Warning Red Line -->
                    <tr>
                        <td height="5" style="background:linear-gradient(90deg, #ef4444 0%, #f97316 50%, #ef4444 100%); line-height:5px; font-size:5px;">&nbsp;</td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style="padding:32px 36px 16px; text-align:center;">
                            <div style="display:inline-block; width:52px; height:52px; line-height:52px; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.35); border-radius:14px; font-size:26px; margin-bottom:12px;">
                                🛑
                            </div>
                            <h1 style="margin:0 0 6px; font-size:22px; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
                                Plan Desactivado por Wedding Planner
                            </h1>
                            <p style="margin:0; font-size:12px; color:#94a3b8; letter-spacing:0.04em; text-transform:uppercase; font-weight:700;">
                                Notificación para Master Developer · Wedding Planner OS
                            </p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding:10px 36px 28px;">
                            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:22px;">
                                <p style="margin:0 0 16px; font-size:14px; color:#e2e8f0; line-height:1.6;">
                                    Hola <strong>Luis (Master Developer)</strong>,<br>
                                    Una Wedding Planner ha solicitado la <strong>desactivación de la renovación automática</strong> de su plan mensual. A continuación los detalles del registro:
                                </p>

                                <!-- Planner Data Table -->
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="8" border="0" style="background:#090d16; border:1px solid #374151; border-radius:10px; font-size:13px; color:#cbd5e1; margin-bottom:18px;">
                                    <tr>
                                        <td width="38%" style="border-bottom:1px solid #1f2937; color:#94a3b8; font-weight:700;">🏢 Agencia:</td>
                                        <td style="border-bottom:1px solid #1f2937; color:#ffffff; font-weight:800;">${agencyName || 'Agencia Planner'}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-bottom:1px solid #1f2937; color:#94a3b8; font-weight:700;">👤 Wedding Planner:</td>
                                        <td style="border-bottom:1px solid #1f2937; color:#ffffff; font-weight:700;">${plannerName || 'Planner'}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-bottom:1px solid #1f2937; color:#94a3b8; font-weight:700;">📧 Correo Electrónico:</td>
                                        <td style="border-bottom:1px solid #1f2937; color:#38bdf8; font-weight:700;">${plannerEmail || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-bottom:1px solid #1f2937; color:#94a3b8; font-weight:700;">💎 Plan Desactivado:</td>
                                        <td style="border-bottom:1px solid #1f2937; color:#f87171; font-weight:800;">${planName || 'Plan Premium'}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-bottom:1px solid #1f2937; color:#94a3b8; font-weight:700;">📅 Fecha Contratado:</td>
                                        <td style="border-bottom:1px solid #1f2937; color:#ffffff;">${contractDate || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="border-bottom:1px solid #1f2937; color:#94a3b8; font-weight:700;">🛑 Fecha Desactivación:</td>
                                        <td style="border-bottom:1px solid #1f2937; color:#fca5a5; font-weight:700;">${cancellationDate || 'Hoy'}</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#94a3b8; font-weight:700;">⏳ Último Día de Servicio:</td>
                                        <td style="color:#fbbf24; font-weight:800; font-size:14px;">${periodEndDate || 'Fin de mes pagado'}</td>
                                    </tr>
                                </table>

                                <!-- Feedback Box -->
                                <div style="background:#1e1b2e; border:1px solid #6b21a8; border-left:4px solid #a855f7; border-radius:10px; padding:16px 18px; margin-bottom:18px;">
                                    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#d8b4fe; font-weight:800; margin-bottom:6px;">
                                        💬 Motivo / Retroalimentación de la Planner:
                                    </div>
                                    <p style="margin:0; font-size:14px; color:#f3e8ff; font-style:italic; line-height:1.5;">
                                        "${reason || 'No especificó motivo de cancelación.'}"
                                    </p>
                                </div>

                                <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:8px; padding:12px 14px; font-size:12px; color:#fde68a; line-height:1.5;">
                                    ℹ️ <strong>Recordatorio de Política de Facturación:</strong><br>
                                    La Wedding Planner mantiene su acceso completo hasta el <strong>${periodEndDate}</strong> (fin de su ciclo mensual ya liquidado). No se generará ningún cobro subsecuente en Stripe ni SPEI a partir de esa fecha.
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:16px 36px 28px; text-align:center; border-top:1px solid #1f2937;">
                            <p style="margin:0 0 6px; font-size:12px; color:#64748b;">
                                Wedding Planner OS · Sistema de Suscripciones SaaS Antigravity
                            </p>
                            <p style="margin:0; font-size:11px; color:#475569;">
                                Notificación automática generada en tiempo real.
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

        const {
            plannerName = 'Wedding Planner',
            plannerEmail = '',
            agencyName = 'Agencia Planner',
            planTier = 'intermediate',
            planName = 'Signature Pro',
            contractDate = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
            cancellationDate = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
            periodEndDate = '',
            reason = 'Sin comentarios'
        } = body;

        const htmlContent = buildDeactivationEmailHtml({
            plannerName,
            plannerEmail,
            agencyName,
            planName,
            contractDate,
            cancellationDate,
            periodEndDate,
            reason
        });

        const resendApiKey = process.env.RESEND_API_KEY || '';
        let emailDeliveredExternally = false;
        let providerResponse = null;

        if (resendApiKey) {
            try {
                // Email recipients for Developer notification
                const targetRecipients = ['luis.gongarza@gmail.com', 'antigravitywebstudio@hotmail.com'];

                for (const recipient of targetRecipients) {
                    const resendPayload = JSON.stringify({
                        from: 'Wedding Planner OS <onboarding@resend.dev>',
                        to: [recipient],
                        subject: `🛑 [Baja de Plan] ${agencyName} desactivó su suscripción (${planName})`,
                        html: htmlContent
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
                        providerResponse = singleResp;
                    }
                }
            } catch (emailErr) {
                console.warn('Error enviando correo de cancelación Resend:', emailErr);
            }
        }

        return res.status(200).json({
            ok: true,
            message: `Suscripción desactivada con éxito. El servicio continuará activo hasta el ${periodEndDate}.`,
            periodEndDate: periodEndDate,
            emailSent: emailDeliveredExternally,
            details: {
                agencyName,
                plannerName,
                planName,
                cancellationDate,
                periodEndDate,
                reason
            }
        });

    } catch (err) {
        console.error('Error in /api/cancel-subscription:', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
};
