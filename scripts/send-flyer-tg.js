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
  form.append('caption', '🖼️ <b>¡Subtítulos Ampliados y Destacados!</b> ✨\n\n• Se aumentó la escala tipográfica a <b>1.18rem</b> con peso bold italic en:\n  1. <i>\"Pases Digitales & Suite Logística\"</i> (PaseBoda)\n  2. <i>\"Invitaciones Web Interactivas\"</i> (Sobreboda)\n\n• Mucho más legible y visible a más de 2 metros de distancia.');
  form.append('parse_mode', 'HTML');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  console.log('Telegram sendPhoto response:', data);
}

sendUpdatedFlyer().catch(console.error);
