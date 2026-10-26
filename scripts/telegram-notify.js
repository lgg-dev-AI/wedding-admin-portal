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

    let tierLabel = 'Essential ($800/mes)';
    if (planTier === 'intermediate') tierLabel = 'Signature Pro ($1,990/mes)';
    if (planTier === 'elite') tierLabel = 'Atelier Elite ($3,290/mes)';

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
🔐 <i>Aprovisionada en Antigravity Wedding SaaS</i>
`.trim();

    return await sendTelegramMessage(messageHtml);
}

/**
 * Enviar alerta cuando una Wedding Planner envía o actualiza el Briefing de una boda
 */
async function sendTelegramBriefingAlert(briefingData) {
    const config = getTelegramConfig();
    if (config.enabled === false) return;

    const {
        couple = 'Pareja',
        date = 'Sin fecha',
        planner = 'Planner',
        phone = '',
        cityVenue = 'Sin recinto',
        theme = 'Elegante',
        masterDrive = '',
        menuType = 'choice'
    } = briefingData || {};

    const menuLabel = (menuType === 'fixed') ? 'Menú Fijo de Gala (Sin elección)' : 'A Elección de Invitados';
    const timestamp = new Date().toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Mexico_City'
    });

    const messageHtml = `
💌 <b>¡NUEVO FORMULARIO DE BRIEFING RECIBIDO!</b> 📋
━━━━━━━━━━━━━━━━━━━━
👰🤵 <b>Pareja:</b> ${escapeHtml(couple)}
📅 <b>Fecha Boda:</b> ${escapeHtml(date)}
🏰 <b>Recinto:</b> ${escapeHtml(cityVenue)}
✨ <b>Planner:</b> ${escapeHtml(planner)} ${phone ? '(' + escapeHtml(phone) + ')' : ''}
🎨 <b>Temática:</b> ${escapeHtml(theme)}
🍽️ <b>Modalidad Menú:</b> ${escapeHtml(menuLabel)}
📁 <b>Material / Drive:</b> ${masterDrive ? '<a href="' + escapeHtml(masterDrive) + '">Ver Fotos/Drive</a>' : 'No proporcionado'}
🕒 <b>Recibido:</b> ${timestamp} hrs
━━━━━━━━━━━━━━━━━━━━
💡 <i>Listo para comenzar el diseño de la invitación en Antigravity Studio.</i>
`.trim();

    return await sendTelegramMessage(messageHtml);
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
🤖 Tu Bot de notificaciones para <b>Antigravity Wedding SaaS</b> está activo y conectado correctamente.
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

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderTelegramConfigUI, 600);
});
