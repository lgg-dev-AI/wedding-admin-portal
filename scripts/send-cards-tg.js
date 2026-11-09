const fs = require('fs');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const chatId = process.env.TELEGRAM_CHAT_ID || '1374411558';
const filePath = path.join(__dirname, '../assets/img/tarjetas_presentacion_preview.jpg');

async function sendCardsToTg() {
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('photo', blob, 'tarjetas_presentacion_preview.jpg');
  form.append('caption', '💼 <b>¡Tarjetas de Presentación (9x5 cm) Listas!</b> ✨\n\n' +
    '• <b>Tarjeta 1 (PaseBoda):</b> Fondo marfil y morado real. Pregunta gancho: <i>\"¿Eres Wedding Planner o te vas a casar próximamente?\"</i> + Mesas 2D, WhatsApp, Hostess QR y 15 días gratis.\n' +
    '• <b>Tarjeta 2 (Sobreboda):</b> Fondo negro alta costura y oro. Pregunta gancho: <i>\"¿Ya tienes tu boda planeada, pero te faltan las invitaciones?\"</i> + Música, Waze, Regalos y Demos en vivo.\n\n' +
    '🖨️ Incluye plantilla en tamaño Carta con 8 tarjetas por hoja listas para imprimir y recortar.');
  form.append('parse_mode', 'HTML');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  console.log('Telegram sendPhoto response:', data);
}

sendCardsToTg().catch(console.error);
