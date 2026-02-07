async function sendWebhook(url, reminder) {
  const payload = {
    event: 'reminder.due',
    reminder: {
      id: reminder.id,
      title: reminder.title,
      description: reminder.description,
      next_due: reminder.next_due,
      interval_value: reminder.interval_value,
      interval_unit: reminder.interval_unit,
    },
    sent_at: new Date().toISOString(),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Webhook returned ${res.status}`);
  }
}

module.exports = { sendWebhook };
