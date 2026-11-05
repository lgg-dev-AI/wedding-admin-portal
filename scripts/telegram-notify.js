/**
 * TELEGRAM NOTIFICATION SYSTEM FOR ANTIGRAVITY WEDDING SAAS
 * Alertas automáticas en tiempo real para suscripciones, pagos de planes y nuevos registros.
 */

const TELEGRAM_CONFIG_STORAGE_KEY = 'antigravity_telegram_config';
const DEFAULT_TELEGRAM_BOT_TOKEN = '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const DEFAULT_TELEGRAM_CHAT_ID = '1374411558';

/**
 * Obtener configuración actual de Telegram desde localStorage
 */
function getTelegramConfig() {
    try {
        const saved = localStorage.getItem(TELEGRAM_CONFIG_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (!parsed.botToken) {
                parsed.botToken = DEFAULT_TELEGRAM_BOT_TOKEN;
            }
            if (!parsed.chatId) {
                parsed.chatId = DEFAULT_TELEGRAM_CHAT_ID;
            }
            return parsed;
        }
    } catch (e) {
        console.warn('Error reading telegram config:', e);
    }
    return {
        botToken: DEFAULT_TELEGRAM_BOT_TOKEN,
        chatId: DEFAULT_TELEGRAM_CHAT_ID,
        enabled: true,
        notifyOnPayment: true,
        notifyOnNewAgency: true
    };
}

/**
 * Guardar configuración de Telegram en localStorage
 */
function saveTelegramConfig(config) {
    try {
        const current = getTelegramConfig();
        const merged = { ...current, ...config };
        localStorage.setItem(TELEGRAM_CONFIG_STORAGE_KEY, JSON.stringify(merged));
        return true;
    } catch (e) {
        console.error('Error saving telegram config:', e);
        return false;
    }
}

/**
 * Envía un mensaje raw a Telegram a través de la API oficial
 */
async function sendTelegramMessage(text, customToken = null, customChatId = null) {
    const config = getTelegramConfig();
    const botToken = customToken || config.botToken;
    const chatId = customChatId || config.chatId;

    if (!botToken || !chatId) {
        console.log('ℹ️ Telegram notifications: Bot Token o Chat ID no configurados aún.');
        return {
            success: false,
            skipped: true,
            message: 'Bot Token o Chat ID no configurados'
        };
    }

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        if (data.ok) {
            console.log('✅ Telegram alert sent successfully:', data.result?.message_id);
            return { success: true, result: data.result };
        } else {
            console.warn('⚠️ Telegram API returned error:', data.description);
            return { success: false, error: data.description };
        }
    } catch (err) {
        console.error('❌ Failed to dispatch Telegram notification:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Enviar alerta formateada cuando una Wedding Planner se suscribe o paga un plan
 */
async function sendTelegramSubscriptionAlert(paymentData) {
    const config = getTelegramConfig();
    if (config.enabled === false || config.notifyOnPayment === false) {
        return;
    }

    const {
        agencyName = 'Agencia Planner',
        email = 'Sin correo',
        planName = 'Plan Mensual',
        amount = 0,
        currency = 'MXN',
        folio = 'REC-PENDING',
        method = 'Stripe Tarjeta'
    } = paymentData;

    const formattedAmount = `$${Number(amount).toLocaleString('es-MX')} ${currency}`;
    const timestamp = new Date().toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Mexico_City'
    });

    const messageHtml = `
🎉 <b>¡NUEVA SUSCRIPCIÓN ACTIVADA!</b> 💍✨
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Agencia:</b> ${escapeHtml(agencyName)}
📧 <b>Contacto:</b> ${escapeHtml(email)}
💎 <b>Plan Elegido:</b> ${escapeHtml(planName)}
💰 <b>Monto Cobrado:</b> <b>${formattedAmount}</b>
💳 <b>Método:</b> ${escapeHtml(method)}
🧾 <b>Folio Stripe:</b> <code>${escapeHtml(folio)}</code>
📅 <b>Fecha:</b> ${timestamp} hrs
━━━━━━━━━━━━━━━━━━━━
🚀 <i>Accede a tu panel Master Developer para gestionar esta cuenta.</i>
`.trim();

    return await sendTelegramMessage(messageHtml);
}

/**
 * Enviar alerta cuando una nueva Wedding Planner es registrada en el SaaS
 */
async function sendTelegramNewAgencyAlert(clientData) {
    const config = getTelegramConfig();
    if (config.enabled === false || config.notifyOnNewAgency === false) {
        return;
    }

    const {
        agencyName = 'Nueva Agencia',
        plannerName = '',
        email = '',
        phone = '',
        planTier = 'essential',
        monthlyFee = 0
    } = clientData;

    let tierLabel = (planTier === 'elite') ? 'Atelier Elite ($3,290/mes)' : 'Signature Pro ($1,990/mes)';

    const timestamp = new Date().toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Mexico_City'
    });

    const messageHtml = `
✨ <b>¡NUEVA AGENCIA REGISTRADA!</b> 🏛️
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Agencia:</b> ${escapeHtml(agencyName)}
👤 <b>Planner:</b> ${escapeHtml(plannerName || agencyName)}
📧 <b>Email:</b> ${escapeHtml(email)}
📱 <b>WhatsApp:</b> ${escapeHtml(phone || 'No registrado')}
💎 <b>Plan Inicial:</b> ${escapeHtml(tierLabel)}
💵 <b>Cuota Mensual:</b> $${Number(monthlyFee).toLocaleString('es-MX')} MXN
📅 <b>Fecha de Alta:</b> ${timestamp} hrs
━━━━━━━━━━━━━━━━━━━━
🔐 <i>Aprovisionada en PaseBoda</i>
`.trim();

    return await sendTelegramMessage(messageHtml);
}

/**
 * Enviar alerta cuando una Wedding Planner envía o actualiza el Briefing de una boda
 * Realiza auditoría de 8 bloques y despacha mensaje estructurado + archivo del expediente a Telegram.
 */
async function sendTelegramBriefingAlert(briefingData) {
    const config = getTelegramConfig();
    if (config.enabled === false) return;

    const botToken = config.botToken || DEFAULT_TELEGRAM_BOT_TOKEN;
    const chatId = config.chatId || DEFAULT_TELEGRAM_CHAT_ID;

    const {
        couple = 'Pareja',
        date = 'Sin fecha',
        planner = 'Planner',
        phone = '',
        plannerEmail = '',
        cityVenue = 'Sin recinto',
        theme = 'Elegante',
        masterDrive = '',
        itinerary = {},
        dressCode = {},
        giftRegistry = {},
        rsvp = {},
        transport = {}
    } = briefingData || {};

    // 1. Auditoría de 8 Bloques en cliente
    const blocks = [];
    
    // B1: Datos Generales
    const b1Ok = !!(couple && couple.length >= 4 && date && planner && phone && plannerEmail && cityVenue);
    blocks.push({
        num: 1, title: 'Datos Generales & Contacto', ok: b1Ok,
        summary: b1Ok ? `${couple} · ${date} · ${planner}` : 'Faltan campos de contacto o recinto'
    });

    // B2: Temática
    const b2Ok = !!theme;
    blocks.push({
        num: 2, title: 'Temática & Estilo Visual', ok: b2Ok,
        summary: b2Ok ? `Línea: ${theme.toUpperCase()}` : 'Sin estilo seleccionado'
    });

    // B3: Fotos & Drive
    const b3Ok = !!(masterDrive && /^https?:\/\//i.test(masterDrive));
    blocks.push({
        num: 3, title: 'Blueprint Fotos (15 Tomas)', ok: b3Ok,
        summary: b3Ok ? 'Repositorio de imágenes adjunto' : 'Pendiente link de fotos/Drive'
    });

    // B4: Itinerario
    const b4Ok = !!(itinerary?.ceremony?.start || itinerary?.reception?.dinner);
    blocks.push({
        num: 4, title: 'Itinerario & Cronograma', ok: b4Ok,
        summary: b4Ok ? `Ceremonia ${itinerary?.ceremony?.start || '--:--'} · Banquete ${itinerary?.reception?.dinner || '--:--'}` : 'Horarios pendientes'
    });

    // B5: Dress Code
    const b5Ok = !!(dressCode?.type);
    blocks.push({
        num: 5, title: 'Código de Vestimenta', ok: b5Ok,
        summary: b5Ok ? `Etiqueta: ${dressCode.type}` : 'Nivel de etiqueta no definido'
    });

    // B6: Mesa de Regalos
    const clabeClean = (giftRegistry?.clabe || '').replace(/\s+/g, '');
    const b6Ok = (clabeClean.length === 18) || !!giftRegistry?.store || !!giftRegistry?.amazon || !!giftRegistry?.envelope;
    blocks.push({
        num: 6, title: 'Mesa de Regalos & Cuenta', ok: b6Ok,
        summary: clabeClean.length === 18 ? `CLABE 18 dígitos validada (${giftRegistry.bank || 'Banco'})` : (b6Ok ? 'Mesa en tienda o sobre activa' : 'Sin mesa de regalos')
    });

    // B7: RSVP & Menú
    const b7Ok = !!(rsvp?.deadline);
    blocks.push({
        num: 7, title: 'RSVP, Menú & Alergias', ok: b7Ok,
        summary: b7Ok ? `Límite: ${rsvp.deadline} · ${rsvp.kidsPolicy === 'adults_only' ? 'Solo Adultos' : 'Niños permitidos'}` : 'Fecha límite de confirmación pendiente'
    });

    // B8: Transporte
    const hasShuttle = transport?.hasShuttle === 'yes' || transport?.hasShuttle === true;
    blocks.push({
        num: 8, title: 'Transporte & Hoteles', ok: true,
        summary: hasShuttle ? `Shuttles activos desde ${transport.pickup || 'punto acordado'}` : 'Sin shuttles programados'
    });

    const approvedCount = blocks.filter(b => b.ok).length;
    const isFullPass = approvedCount === blocks.length;
    const score = `${approvedCount}/${blocks.length}`;

    const timestamp = new Date().toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Mexico_City'
    });

    // 2. Construir mensaje de texto enriquecido con checks
    let auditLines = [];
    auditLines.push(`💍 <b>NUEVO BRIEFING RECIBIDO · PASEBODA</b> 📋`);
    auditLines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    auditLines.push(`👰🤵 <b>Pareja:</b> ${escapeHtml(couple)}`);
    auditLines.push(`📅 <b>Fecha:</b> ${escapeHtml(date)}`);
    auditLines.push(`✨ <b>Planner:</b> ${escapeHtml(planner)} ${phone ? '(' + escapeHtml(phone) + ')' : ''}`);
    auditLines.push(`📧 <b>Email:</b> ${escapeHtml(plannerEmail || 'N/A')}`);
    auditLines.push(`🏰 <b>Recinto:</b> ${escapeHtml(cityVenue)}`);
    auditLines.push(`🕒 <b>Registrado:</b> ${timestamp} hrs`);
    auditLines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    auditLines.push(`🧠 <b>AUDITORÍA INTELIGENTE DE 8 BLOQUES:</b>\n`);

    blocks.forEach(b => {
        const icon = b.ok ? '✅' : '⚠️';
        auditLines.push(`${icon} <b>${b.num}. ${b.title}:</b>`);
        auditLines.push(`   └ <i>${b.summary}</i>`);
    });

    auditLines.push(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    auditLines.push(`🎯 <b>SCORE: ${score} BLOQUES APROBADOS</b>`);
    auditLines.push(isFullPass ? `✨ <b>STATUS: LISTO PARA PRODUCCIÓN</b>` : `⚠️ <b>STATUS: REVISAR OBSERVACIONES</b>`);
    auditLines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    auditLines.push(`📎 <i>Se adjuntó el expediente en archivo para abrir con 1 tap.</i>`);

    const fullMessage = auditLines.join('\n');

    // 3. Despachar mensaje de auditoría
    await sendTelegramMessage(fullMessage, botToken, chatId);

    // 4. Generar y enviar el archivo del expediente (sendDocument)
    try {
        const cleanCouple = couple.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
        const fileName = `Dossier_Briefing_${cleanCouple || 'Boda'}.html`;
        
        const docHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Expediente · ${escapeHtml(couple)} · PaseBoda</title>
<style>
body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#0b0f19; color:#f8fafc; padding:24px; margin:0; }
.card { max-width:760px; margin:0 auto; background:#111827; border:1px solid #1f2937; border-radius:16px; padding:32px; box-shadow:0 20px 40px rgba(0,0,0,0.5); }
h1 { margin:0 0 8px; color:#fff; font-size:24px; }
.badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; background:rgba(16,185,129,0.2); color:#34d399; margin-bottom:20px; }
.block { background:#090d16; border:1px solid #1e293b; border-radius:10px; padding:14px; margin-bottom:12px; }
.block h3 { margin:0 0 6px; font-size:14px; color:#d97706; }
.val { font-size:13px; color:#cbd5e1; }
a { color:#38bdf8; }
</style>
</head>
<body>
<div class="card">
    <div style="border-bottom:2px solid #d97706; padding-bottom:12px; margin-bottom:20px;">
        <span style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#e2a891; font-weight:800;">PaseBoda · Expediente Oficial</span>
        <h1>${escapeHtml(couple)}</h1>
        <div class="badge">Auditoría: ${score} Bloques Aprobados</div>
    </div>
    <div class="block"><h3>1. Datos Generales</h3><div class="val">Fecha: ${escapeHtml(date)}<br>Recinto: ${escapeHtml(cityVenue)}<br>Planner: ${escapeHtml(planner)} (${escapeHtml(phone)})<br>Email: ${escapeHtml(plannerEmail)}</div></div>
    <div class="block"><h3>2. Estilo & Temática</h3><div class="val">Línea: ${escapeHtml(theme)}</div></div>
    <div class="block"><h3>3. Blueprint Fotos</h3><div class="val">${masterDrive ? '<a href="' + escapeHtml(masterDrive) + '" target="_blank">Abrir Google Drive</a>' : 'No adjunto'}</div></div>
    <div class="block"><h3>4. Itinerario</h3><div class="val">Ceremonia: ${escapeHtml(itinerary?.ceremony?.start || '--')} (${escapeHtml(itinerary?.ceremony?.venue || cityVenue)})<br>Banquete: ${escapeHtml(itinerary?.reception?.dinner || '--')}</div></div>
    <div class="block"><h3>5. Dress Code</h3><div class="val">Etiqueta: ${escapeHtml(dressCode?.type || 'Formal')}<br>Reservados: ${escapeHtml(dressCode?.reserved || 'Blanco novias')}</div></div>
    <div class="block"><h3>6. Mesa de Regalos</h3><div class="val">Banco: ${escapeHtml(giftRegistry?.bank || 'N/A')}<br>CLABE: ${escapeHtml(giftRegistry?.clabe || 'N/A')}<br>Lluvia de Sobres: ${giftRegistry?.envelope ? 'Sí' : 'No'}</div></div>
    <div class="block"><h3>7. RSVP & Menú</h3><div class="val">Límite RSVP: ${escapeHtml(rsvp?.deadline || 'N/A')}<br>Política Niños: ${rsvp?.kidsPolicy === 'adults_only' ? 'Solo Adultos' : 'Niños permitidos'}</div></div>
    <div class="block"><h3>8. Transporte & Hoteles</h3><div class="val">Shuttles: ${hasShuttle ? 'Sí (' + escapeHtml(transport?.pickup || '') + ')' : 'No'}<br>Hotel: ${escapeHtml(transport?.hotel1 || 'N/A')}</div></div>
</div>
</body>
</html>`;

        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('caption', `📎 <b>Expediente Adjunto:</b> Boda ${escapeHtml(couple)} (${score} Bloques)`);
        form.append('parse_mode', 'HTML');
        
        const blob = new Blob([docHtml], { type: 'text/html' });
        form.append('document', blob, fileName);

        await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
            method: 'POST',
            body: form
        });
    } catch (docErr) {
        console.warn('Error sending dossier document to Telegram:', docErr);
    }

    return { success: true };
}

/**
 * Enviar alerta de prueba desde la UI de Master Developer
 */
async function testTelegramNotification() {
    const tokenInput = document.getElementById('telegramBotTokenInput');
    const chatInput = document.getElementById('telegramChatIdInput');
    const statusBox = document.getElementById('telegramTestStatus');

    const botToken = tokenInput ? tokenInput.value.trim() : '';
    const chatId = chatInput ? chatInput.value.trim() : '';

    if (!botToken || !chatId) {
        if (statusBox) {
            statusBox.style.display = 'block';
            statusBox.style.background = '#fef2f2';
            statusBox.style.color = '#991b1b';
            statusBox.style.border = '1px solid #fecaca';
            statusBox.innerHTML = '⚠️ Por favor ingresa el <b>Bot Token</b> y tu <b>Chat ID</b> antes de probar.';
        }
        return;
    }

    if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.style.background = '#eff6ff';
        statusBox.style.color = '#1e40af';
        statusBox.style.border = '1px solid #bfdbfe';
        statusBox.innerHTML = '⏳ Enviando mensaje de prueba a tu Telegram...';
    }

    const testMessage = `
🔔 <b>¡CONEXIÓN TELEGRAM EXITOSA!</b> 🚀
━━━━━━━━━━━━━━━━━━━━
🤖 Tu Bot de notificaciones para <b>PaseBoda</b> está activo y conectado correctamente.
✨ A partir de ahora recibirás alertas instantáneas cada vez que un Wedding Planner se suscriba a un plan o realice un pago.
━━━━━━━━━━━━━━━━━━━━
📅 ${new Date().toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City' })} hrs
`.trim();

    const res = await sendTelegramMessage(testMessage, botToken, chatId);

    if (statusBox) {
        if (res.success) {
            statusBox.style.background = '#ecfdf5';
            statusBox.style.color = '#065f46';
            statusBox.style.border = '1px solid #a7f3d0';
            statusBox.innerHTML = '✅ <b>¡Mensaje recibido!</b> Revisa tu Telegram, el bot te acaba de enviar la notificación.';
            // Guardar configuración
            saveTelegramConfig({ botToken, chatId, enabled: true });
            renderTelegramConfigUI();
        } else {
            statusBox.style.background = '#fef2f2';
            statusBox.style.color = '#991b1b';
            statusBox.style.border = '1px solid #fecaca';
            statusBox.innerHTML = `❌ Error de Telegram: <b>${escapeHtml(res.error || 'Verifica el Token y Chat ID')}</b><br><small>Recuerda haber iniciado conversación con el bot primero presionando <b>/start</b> en Telegram.</small>`;
        }
    }
}

/**
 * Detectar automáticamente el Chat ID leyendo el último mensaje recibido por el bot
 */
async function autoDetectTelegramChatId() {
    const tokenInput = document.getElementById('telegramBotTokenInput');
    const chatInput = document.getElementById('telegramChatIdInput');
    const statusBox = document.getElementById('telegramTestStatus');

    const botToken = (tokenInput && tokenInput.value.trim()) || DEFAULT_TELEGRAM_BOT_TOKEN;

    if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.style.background = '#eff6ff';
        statusBox.style.color = '#1e40af';
        statusBox.style.border = '1px solid #bfdbfe';
        statusBox.innerHTML = '🔍 Buscando mensajes recientes en tu bot <b>@WeddingOs_bot</b>...';
    }

    try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
        const data = await res.json();

        if (!data.ok) {
            throw new Error(data.description || 'Error al conectar con Telegram API');
        }

        const updates = data.result || [];
        if (updates.length === 0) {
            if (statusBox) {
                statusBox.style.background = '#fef3c7';
                statusBox.style.color = '#92400e';
                statusBox.style.border = '1px solid #fde68a';
                statusBox.innerHTML = `
                    👋 <b>Aún no has iniciado conversación con el bot.</b><br>
                    1. Abre Telegram y ve a tu bot: <a href="https://t.me/WeddingOs_bot" target="_blank" style="color:#0284c7; font-weight:bold; text-decoration:underline;">@WeddingOs_bot</a>.<br>
                    2. Presiona <b>START</b> o envíale un mensaje (ej. <i>hola</i>).<br>
                    3. Vuelve a hacer clic aquí en <b>"🔍 Detectar mi Chat ID"</b>.
                `;
            }
            return;
        }

        // Buscar el último mensaje válido
        const lastMsg = updates.reverse().find(u => u.message && u.message.chat);
        if (!lastMsg || !lastMsg.message || !lastMsg.message.chat) {
            throw new Error('No se encontraron chats en las actualizaciones recientes.');
        }

        const detectedChatId = String(lastMsg.message.chat.id);
        const senderName = lastMsg.message.chat.first_name || lastMsg.message.chat.username || 'Usuario Telegram';

        if (chatInput) {
            chatInput.value = detectedChatId;
        }

        saveTelegramConfig({ botToken, chatId: detectedChatId, enabled: true });
        renderTelegramConfigUI();

        if (statusBox) {
            statusBox.style.background = '#ecfdf5';
            statusBox.style.color = '#065f46';
            statusBox.style.border = '1px solid #a7f3d0';
            statusBox.innerHTML = `✅ <b>¡Chat ID detectado con éxito!</b><br>Usuario: <b>${escapeHtml(senderName)}</b> (ID: <code>${detectedChatId}</code>).<br>Ahora puedes hacer clic en <b>"📲 Enviar Alerta de Prueba"</b> para comprobar el envío.`;
        }
    } catch (err) {
        if (statusBox) {
            statusBox.style.background = '#fef2f2';
            statusBox.style.color = '#991b1b';
            statusBox.style.border = '1px solid #fecaca';
            statusBox.innerHTML = `❌ Error detectando Chat ID: <b>${escapeHtml(err.message)}</b>`;
        }
    }
}

/**
 * Guardar datos desde el formulario en Settings
 */
function handleSaveTelegramSettings() {
    const tokenInput = document.getElementById('telegramBotTokenInput');
    const chatInput = document.getElementById('telegramChatIdInput');
    const statusBox = document.getElementById('telegramTestStatus');

    const botToken = tokenInput ? tokenInput.value.trim() : '';
    const chatId = chatInput ? chatInput.value.trim() : '';

    saveTelegramConfig({ botToken, chatId, enabled: true });

    if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.style.background = '#ecfdf5';
        statusBox.style.color = '#065f46';
        statusBox.style.border = '1px solid #a7f3d0';
        statusBox.innerHTML = '💾 Configuración de Telegram guardada correctamente.';
        setTimeout(() => {
            if (statusBox) statusBox.style.display = 'none';
        }, 3500);
    }

    renderTelegramConfigUI();
}

/**
 * Renderizar el estado visual de Telegram en Master Developer
 */
function renderTelegramConfigUI() {
    const config = getTelegramConfig();
    const tokenInput = document.getElementById('telegramBotTokenInput');
    const chatInput = document.getElementById('telegramChatIdInput');
    const badge = document.getElementById('telegramStatusBadge');

    if (tokenInput && !tokenInput.value) {
        tokenInput.value = config.botToken || '';
    }
    if (chatInput && !chatInput.value) {
        chatInput.value = config.chatId || '';
    }

    if (badge) {
        if (config.botToken && config.chatId) {
            badge.className = 'badge-accent';
            badge.style.background = '#10b981';
            badge.style.color = '#ffffff';
            badge.innerText = '🟢 Bot Conectado';
        } else {
            badge.className = 'badge-accent';
            badge.style.background = '#f59e0b';
            badge.style.color = '#ffffff';
            badge.innerText = '🟡 Configuración Pendiente';
        }
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Enviar alerta formateada cuando una Wedding Planner cancela o desactiva su plan
 */
async function sendTelegramPlanDeactivationAlert(deactivationData) {
    const config = getTelegramConfig();
    if (config.enabled === false) return;

    const {
        agencyName = 'Agencia Planner',
        plannerName = 'Wedding Planner',
        email = 'Sin correo',
        planName = 'Plan Mensual',
        contractDate = 'N/A',
        cancellationDate = 'Hoy',
        periodEndDate = 'Fin de ciclo',
        reason = 'Sin especificar'
    } = deactivationData;

    const messageHtml = `
🛑 <b>¡PLAN DESACTIVADO POR WEDDING PLANNER!</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Agencia:</b> ${escapeHtml(agencyName)}
👤 <b>Planner:</b> ${escapeHtml(plannerName)}
📧 <b>Email:</b> ${escapeHtml(email)}
💎 <b>Plan Desactivado:</b> <b>${escapeHtml(planName)}</b>
📅 <b>Fecha Contratación:</b> ${escapeHtml(contractDate)}
🛑 <b>Fecha Desactivación:</b> ${escapeHtml(cancellationDate)}
⏳ <b>Último Día de Servicio:</b> <b>${escapeHtml(periodEndDate)}</b>
━━━━━━━━━━━━━━━━━━━━
💬 <b>Feedback / Motivo:</b>
<i>"${escapeHtml(reason)}"</i>
━━━━━━━━━━━━━━━━━━━━
ℹ️ <i>El servicio continuará activo hasta el fin de ciclo sin cobros adicionales.</i>
`.trim();

    return await sendTelegramMessage(messageHtml);
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderTelegramConfigUI, 600);
});

/**
 * Notificación oficial de inicio de despacho de WhatsApp en lote
 */
async function notifyTelegramDispatchStarted({ weddingName, guestCount, estMinutes, lockDurationStr, availableAtStr }) {
    const text = `🔔 <b>ENVÍO INICIADO: Boda ${weddingName || 'PaseBoda'}</b>\n` +
        `• Invitados: <b>${guestCount} personas</b>\n` +
        `• Tiempo estimado de envío: <b>${estMinutes} minutos</b> (cadencia humana 10s–15s)\n` +
        `• 🔒 <b>LÍNEA BLOQUEADA POR: ${lockDurationStr}</b>\n` +
        `• ⏳ <b>Servicio disponible de nuevo a las: ${availableAtStr} hrs.</b> (No se procesará nada más hasta esa hora).`;

    return await sendTelegramMessage(text);
}

/**
 * Notificación oficial de programación de despacho futuro
 */
async function notifyTelegramDispatchScheduled({ weddingName, guestCount, scheduleDateTimeStr, lockDurationStr }) {
    const text = `📅 <b>ENVÍO PROGRAMADO: Boda ${weddingName || 'PaseBoda'}</b>\n` +
        `• Invitados: <b>${guestCount} personas</b>\n` +
        `• Fecha y Hora: <b>${scheduleDateTimeStr} hrs</b>\n` +
        `• 🔒 <b>LÍNEA BLOQUEADA POR: ${lockDurationStr}</b> (Canal reservado automáticamente).`;

    return await sendTelegramMessage(text);
}

// Exportar globalmente
window.notifyTelegramDispatchStarted = notifyTelegramDispatchStarted;
window.notifyTelegramDispatchScheduled = notifyTelegramDispatchScheduled;

