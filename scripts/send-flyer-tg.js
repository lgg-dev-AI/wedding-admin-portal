const fs = require('fs');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN || '8805191453:AAEMzlCf11tzcD8PK6OL7UtEzIY-UZeWZ0A';
const chatId = process.env.TELEGRAM_CHAT_ID || '1374411558';
const filePath = path.join(__dirname, '../assets/img/flyer_pared_doble_preview.jpg');

async function sendUpdatedFlyer() {
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('photo', blob, 'flyer_pared_doble_preview.jpg');
  form.append('caption', '🎯 <b>¡Preguntas Gancho Integradas!</b> ✨\n\n• Se eliminó el título genérico \"PaseBoda & Sobreboda\" y se colocaron dos preguntas de auto-identificación directa:\n\n1. 🟣 <b>PaseBoda:</b> <i>\"¿Eres Wedding Planner o te vas a casar próximamente?\"</i>\n2. 🟤 <b>Sobreboda:</b> <i>\"¿Ya tienes tu boda planeada, pero te faltan las invitaciones?\"</i>\n\n• Cada pregunta enmarca y conduce la mirada directamente a su columna correspondiente.');
  form.append('parse_mode', 'HTML');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  console.log('Telegram sendPhoto response:', data);
}

sendUpdatedFlyer().catch(console.error);
