const cron = require('node-cron');
const { sendReminderEmail } = require('./email');
const { sendWebhook } = require('./webhook');

function startScheduler(db) {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', () => {
    processReminders(db);
  });

  console.log('Scheduler started — checking due reminders every hour');
}

async function processReminders(db) {
  const now = new Date().toISOString();

  const dueReminders = await db('reminders')
    .where('next_due', '<=', now)
    .where('is_active', true);

  if (dueReminders.length === 0) return;

  console.log(`Processing ${dueReminders.length} due reminder(s)...`);

  for (const reminder of dueReminders) {
    const user = await db('users').where({ id: reminder.user_id }).first();
    if (!user) continue;

    // Email notifications
    if (reminder.notify_email) {
      try {
        await sendReminderEmail(user.email, reminder);
        await db('notification_log').insert({
          reminder_id: reminder.id,
          type: 'email',
          status: 'sent',
        });
        console.log(`Email sent for reminder #${reminder.id} to ${user.email}`);
      } catch (err) {
        await db('notification_log').insert({
          reminder_id: reminder.id,
          type: 'email',
          status: 'failed',
          error_message: err.message,
        });
        console.error(`Email failed for reminder #${reminder.id}: ${err.message}`);
      }
    }

    // Webhook notifications (paid only)
    if (reminder.webhook_url && user.plan === 'paid') {
      try {
        await sendWebhook(reminder.webhook_url, reminder);
        await db('notification_log').insert({
          reminder_id: reminder.id,
          type: 'webhook',
          status: 'sent',
        });
        console.log(`Webhook sent for reminder #${reminder.id}`);
      } catch (err) {
        await db('notification_log').insert({
          reminder_id: reminder.id,
          type: 'webhook',
          status: 'failed',
          error_message: err.message,
        });
        console.error(`Webhook failed for reminder #${reminder.id}: ${err.message}`);
      }
    }
  }
}

module.exports = { startScheduler, processReminders };
