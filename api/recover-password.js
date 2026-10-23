// ==========================================================================
// VERCEL SERVERLESS FUNCTION: /api/recover-password
// Generates professional HTML email and dispatches transactional recovery
// ==========================================================================

const https = require('https');

function buildRecoveryEmailHtml({ name, email, password, portalUrl, loginUrl }) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña · Wedding Planner OS</title>
</head>
<body style="margin:0; padding:0; background-color:#0b0f19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0b0f19; width:100%; padding:32px 16px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background:#111827; border:1px solid #1f2937; border-radius:18px; overflow:hidden; box-shadow:0 20px 45px rgba(0,0,0,0.5);">
                    
                    <!-- Top Gold Accent Line -->
                    <tr>
                        <td height="4" style="background:linear-gradient(90deg, #d97706 0%, #fbbf24 50%, #d97706 100%); line-height:4px; font-size:4px;">&nbsp;</td>
                    </tr>

                    <!-- Header with Brand -->
                    <tr>
                        <td style="padding:36px 36px 20px; text-align:center;">
                            <div style="display:inline-block; width:52px; height:52px; line-height:52px; background:linear-gradient(135deg, rgba(217,119,6,0.2) 0%, rgba(251,191,36,0.1) 100%); border:1px solid rgba(251,191,36,0.3); border-radius:14px; font-size:26px; margin-bottom:14px;">
                                💎
                            </div>
                            <h1 style="margin:0 0 6px; font-size:22px; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
                                Wedding Planner OS
                            </h1>
                            <p style="margin:0; font-size:13px; color:#94a3b8; letter-spacing:0.04em; text-transform:uppercase; font-weight:600;">
                                Antigravity Developer &amp; Planner Suite
                            </p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding:10px 36px 28px;">
                            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:24px; text-align:left;">
                                <p style="margin:0 0 14px; font-size:15px; color:#f1f5f9; line-height:1.6;">
                                    Hola <strong style="color:#fbbf24;">${name || 'Wedding Planner'}</strong>,
                                </p>
                                <p style="margin:0 0 20px; font-size:14px; color:#cbd5e1; line-height:1.6;">
                                    Recibimos una solicitud para recuperar tu contraseña de acceso a la plataforma <strong>Wedding Planner OS</strong> vinculada a tu correo <strong>${email}</strong>.
                                </p>

                                <!-- Credentials Box -->
                                <div style="background:#090d16; border:1px solid #374151; border-left:4px solid #d97706; border-radius:10px; padding:18px 20px; margin:20px 0;">
                                    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.12em; color:#94a3b8; font-weight:700; margin-bottom:6px;">
                                        Tu Contraseña de Acceso Registrada:
                                    </div>
                                    <div style="font-family:'Courier New', Courier, monospace; font-size:24px; font-weight:800; color:#fbbf24; letter-spacing:2px; word-break:break-all;">
                                        ${password}
                                    </div>
                                    <div style="margin-top:8px; font-size:12px; color:#64748b;">
                                        Usuario / Correo: <span style="color:#94a3b8;">${email}</span>
                                    </div>
                                </div>

                                <!-- CTA Button -->
                                <div style="text-align:center; margin:28px 0 10px;">
                                    <a href="${loginUrl}" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #d97706 0%, #b45309 100%); color:#ffffff; font-weight:700; font-size:14px; padding:14px 32px; border-radius:10px; text-decoration:none; box-shadow:0 8px 20px rgba(217,119,6,0.35); letter-spacing:0.02em;">
                                        ✨ Iniciar Sesión en Wedding OS →
                                    </a>
                                </div>
                            </div>

                            <!-- Security Notice -->
                            <div style="margin-top:22px; padding:14px 18px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:10px; font-size:12px; color:#fca5a5; line-height:1.5;">
                                🔒 <strong>Aviso de Seguridad TI:</strong> Si tú no solicitaste este recordatorio de contraseña, puedes ignorar este correo de forma segura. Te sugerimos cambiar tu contraseña dentro de tu panel de control si sospechas actividad inusual.
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:20px 36px 32px; background:#0b0f19; border-top:1px solid #1f2937; text-align:center;">
                            <p style="margin:0 0 6px; font-size:12px; color:#64748b;">
                                Este es un correo automático de seguridad generado por <strong>Wedding Planner OS</strong>.
                            </p>
                            <p style="margin:0; font-size:11px; color:#475569;">
                                © 2026 Antigravity Web Studio · Todos los derechos reservados · <a href="${portalUrl}" style="color:#94a3b8; text-decoration:underline;">wedding-admin-portal.vercel.app</a>
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
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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
        const { email, name, password } = body || {};

        if (!email || !password) {
            return res.status(400).json({ ok: false, error: 'Faltan parámetros requeridos: email y password' });
        }

        const portalUrl = 'https://wedding-admin-portal.vercel.app';
        const loginUrl = `${portalUrl}`;

        const htmlContent = buildRecoveryEmailHtml({
            name: name || 'Planner',
            email: email,
            password: password,
            portalUrl: portalUrl,
            loginUrl: loginUrl
        });

        // Check if an external transactional provider key is configured (Resend, SendGrid, etc.)
        // Resend API Integration
        const resendApiKey = process.env.RESEND_API_KEY || '';
        let emailDeliveredExternally = false;
        let providerResponse = null;

        if (resendApiKey) {
            try {
                // If the user email is developer Luis (antigravitywebstudio@hotmail.com),
                // Resend testing sandbox routes to the account owner email luis.gongarza@gmail.com,
                // and also attempts direct delivery.
                const targetRecipients = [email];
                if (email.toLowerCase() === 'antigravitywebstudio@hotmail.com') {
                    if (!targetRecipients.includes('luis.gongarza@gmail.com')) {
                        targetRecipients.push('luis.gongarza@gmail.com');
                    }
                }

                for (const recipient of targetRecipients) {
                    const resendPayload = JSON.stringify({
                        from: 'Wedding Planner OS <onboarding@resend.dev>',
                        to: [recipient],
                        subject: '🔐 Tu Contraseña de Acceso · Wedding Planner OS',
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
            } catch (pErr) {
                console.warn('External email provider error:', pErr);
            }
        }

        return res.status(200).json({
            ok: true,
            message: `Correo de recuperación preparado exitosamente para ${email}`,
            email: email,
            deliveredExternally: emailDeliveredExternally,
            providerDetails: providerResponse,
            emailPreviewHtml: htmlContent
        });

    } catch (err) {
        console.error('Error in /api/recover-password:', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
};
