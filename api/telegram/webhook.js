const { telegram, setInvite, getInvite, addApplication, setRegistration, getRegistration, deleteRegistration, json, makeToken } = require('../_telegram');

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const send = (chatId, text, options = {}) => telegram('sendMessage', { chat_id: chatId, text, ...options });
const dayButtons = () => ({ inline_keyboard: [
  ...dayNames.map(day => [{ text: day, callback_data: `registration-day:${day}` }]),
  [{ text: '✓ Finish availability', callback_data: 'registration-finish' }]
] });
const validHours = value => /^([01]\d|2[0-3]):[0-5]\d\s*-\s*([01]\d|2[0-3]):[0-5]\d$/.test(value);

async function beginRegistration(chatId) {
  await setRegistration(chatId, { step: 'name', chatId: String(chatId), availability: {} });
  await send(chatId, 'Welcome to Cleanly Operations! Let’s register you as a cleaner.\n\nPlease send your full name.');
}

async function handleRegistrationMessage(chatId, text, registration) {
  if (registration.step === 'name') {
    registration.name = text; registration.step = 'phone'; await setRegistration(chatId, registration);
    return send(chatId, 'Thanks. Please send your mobile phone number, including the area code (for example +61 4XX XXX XXX).');
  }
  if (registration.step === 'phone') {
    registration.phone = text; registration.step = 'abn'; await setRegistration(chatId, registration);
    return send(chatId, 'Please send your ABN.');
  }
  if (registration.step === 'abn') {
    registration.abn = text; registration.step = 'availability-days'; await setRegistration(chatId, registration);
    return send(chatId, 'Choose an available day below. You can add as many days as you need.', { reply_markup: dayButtons() });
  }
  if (registration.step === 'availability-hours') {
    if (!validHours(text)) return send(chatId, 'Please use this format: 07:00-15:00');
    registration.availability[registration.selectedDay] = text.replace(/\s/g, '').split('-');
    registration.selectedDay = null; registration.step = 'availability-days'; await setRegistration(chatId, registration);
    return send(chatId, 'Saved. Select another day, or tap “Finish availability”.', { reply_markup: dayButtons() });
  }
  return send(chatId, 'Choose an available day using the buttons, or tap “Finish availability”.', { reply_markup: dayButtons() });
}

async function handleRegistrationCallback(callback) {
  const chatId = callback.message?.chat?.id;
  if (!chatId) return;
  await telegram('answerCallbackQuery', { callback_query_id: callback.id });
  const registration = await getRegistration(chatId);
  if (!registration) return send(chatId, 'Your registration has expired. Open the registration link again to restart.');
  if (callback.data.startsWith('registration-day:')) {
    registration.selectedDay = callback.data.slice('registration-day:'.length); registration.step = 'availability-hours';
    await setRegistration(chatId, registration);
    return send(chatId, `What hours are you available on ${registration.selectedDay}?\n\nSend them like this: 07:00-15:00`);
  }
  if (callback.data === 'registration-finish') {
    if (!Object.keys(registration.availability).length) return send(chatId, 'Please add at least one available day before finishing.', { reply_markup: dayButtons() });
    const application = { id: `cleaner_${makeToken()}`, name: registration.name, phone: registration.phone, abn: registration.abn, availability: registration.availability, telegramChatId: String(chatId), status: 'pending', createdAt: new Date().toISOString() };
    await addApplication(application); await deleteRegistration(chatId);
    return send(chatId, '✅ Registration complete! Your manager will review your details and confirm your rate. We will contact you here on Telegram.');
  }
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) return json(res, 401, { ok: false, error: 'Invalid webhook secret' });
    const callback = req.body?.callback_query;
    if (callback) { await handleRegistrationCallback(callback); return json(res, 200, { ok: true }); }
    const message = req.body?.message;
    if (!message || message.chat?.type !== 'private') return json(res, 200, { ok: true });
    const chatId = message.chat.id;
    const text = (message.text || '').trim();
    if (/^\/(start(?:@\w+)?\s+register|register)$/i.test(text)) { await beginRegistration(chatId); return json(res, 200, { ok: true }); }
    const inviteMatch = text.match(/^\/start(?:@\w+)?\s+cleaner_([A-Za-z0-9_-]+)$/i);
    if (inviteMatch) {
      const invite = await getInvite(inviteMatch[1]);
      if (invite) { invite.status = 'connected'; invite.chatId = String(chatId); invite.connectedAt = new Date().toISOString(); await setInvite(inviteMatch[1], invite); await send(chatId, '✅ You are connected to Cleanly Operations. You will receive job requests here.'); }
      else await send(chatId, 'This invitation is invalid or has expired.');
      return json(res, 200, { ok: true });
    }
    const registration = await getRegistration(chatId);
    if (registration) await handleRegistrationMessage(chatId, text, registration);
    else await send(chatId, 'Welcome to Cleanly Operations. To register as a cleaner, use the registration link sent by your manager.');
    return json(res, 200, { ok: true });
  } catch (error) { return json(res, 500, { ok: false, error: error.message }); }
};
