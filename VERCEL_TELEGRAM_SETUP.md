# Vercel Telegram invite setup

1. Import this GitHub repository into Vercel.
2. Create a Vercel KV database for persistent invite records.
3. Add every value from .env.vercel.example in Vercel Project Settings, Environment Variables.
4. Deploy the project. Copy the production URL, such as https://your-project.vercel.app.
5. Set the Telegram webhook to:

    https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-project.vercel.app/api/telegram/webhook&secret_token=<YOUR_SECRET>

6. In the app, add a cleaner. The system calls the invite endpoint and returns a unique Telegram link.
7. Send that link to the cleaner. When they press Start, the webhook saves their chat ID to the invite record.

The cleaner must use the unique invite link. No manual chat ID collection is needed.
