# Vercel Telegram invite setup

1. Import this GitHub repository into Vercel.
2. Create a Vercel KV database for persistent invite records.
3. Add every value from .env.vercel.example in Vercel Project Settings, Environment Variables.
4. Deploy the project. Copy the production URL, such as https://your-project.vercel.app.
5. Set the Telegram webhook to:

    https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-project.vercel.app/api/telegram/webhook&secret_token=<YOUR_SECRET>

6. In the app, add a cleaner. The system calls the invite endpoint and returns a unique Telegram link.
7. Send that link to the cleaner. When they press Start, the webhook saves their chat ID to the invite record.

## Cleaner registration through Telegram

After the project is deployed, open **Team** in the admin portal and select **Cleaner registration link**. It copies `https://t.me/cleanly_perth_bot?start=register`. Send this Telegram link to a cleaner. The bot collects their name, mobile number, ABN and weekly availability without showing a Vercel page. New applications appear in **Team**; enter the agreed hourly rate and select **Approve & add** to add them to the team. The same Vercel KV database stores these applications. When you first open Team, enter the `ADMIN_APPLICATIONS_KEY` you set in Vercel. This prevents applicants' details from being publicly readable.

The cleaner must use the unique invite link. No manual chat ID collection is needed.
