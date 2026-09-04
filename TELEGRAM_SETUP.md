# Telegram setup

1. Create a bot with @BotFather and copy its token.
2. Copy .env.example to .env, then set TELEGRAM_BOT_TOKEN.
3. Start the server with node server.js.
4. Each cleaner must open the bot and select Start. Save the numeric Telegram chat ID in the cleaner profile. A username alone cannot receive a bot message.
5. Deploy the server to an HTTPS URL, then register the webhook at:

    https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://YOUR-DOMAIN/api/telegram/webhook

The server sends a job with Confirm and Decline buttons. It records the selected state in memory; connect a database before production use so jobs and confirmations persist across restarts.
