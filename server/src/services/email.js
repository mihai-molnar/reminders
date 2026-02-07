const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('SMTP not configured — email notifications disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port) || 587,
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  return transporter;
}

async function sendReminderEmail(to, reminder) {
  const transport = getTransporter();
  if (!transport) {
    throw new Error('SMTP not configured');
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await transport.sendMail({
    from,
    to,
    subject: `Reminder: ${reminder.title}`,
    text: [
      `Your reminder "${reminder.title}" is due.`,
      reminder.description ? `\nDetails: ${reminder.description}` : '',
      `\nInterval: Every ${reminder.interval_value} ${reminder.interval_unit}`,
      '\n— Recurring Reminders',
    ].join(''),
  });
}

module.exports = { sendReminderEmail };
