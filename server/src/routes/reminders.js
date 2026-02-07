const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const FREE_LIMIT = 5;

const VALID_UNITS = ['days', 'weeks', 'months', 'years'];

function advanceNextDue(intervalValue, intervalUnit) {
  const now = new Date();
  switch (intervalUnit) {
    case 'days':
      now.setDate(now.getDate() + intervalValue);
      break;
    case 'weeks':
      now.setDate(now.getDate() + intervalValue * 7);
      break;
    case 'months':
      now.setMonth(now.getMonth() + intervalValue);
      break;
    case 'years':
      now.setFullYear(now.getFullYear() + intervalValue);
      break;
  }
  return now.toISOString();
}

// All routes require auth
router.use(authenticateToken);

// GET /api/reminders
router.get('/', async (req, res) => {
  const reminders = await req.db('reminders')
    .where({ user_id: req.userId })
    .orderBy('next_due', 'asc');
  res.json(reminders);
});

// POST /api/reminders
router.post('/', [
  body('title').trim().notEmpty(),
  body('interval_value').isInt({ min: 1 }),
  body('interval_unit').isIn(VALID_UNITS),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Title, interval_value (integer >= 1), and interval_unit (days/weeks/months/years) required' });
  }

  const db = req.db;
  const user = await db('users').where({ id: req.userId }).first();

  if (user.plan === 'free') {
    const count = await db('reminders').where({ user_id: req.userId }).count('id as count').first();
    if (count.count >= FREE_LIMIT) {
      return res.status(403).json({ error: `Free plan limited to ${FREE_LIMIT} reminders. Upgrade to create more.` });
    }
  }

  const { title, description, interval_value, interval_unit, notify_email, webhook_url } = req.body;
  const next_due = req.body.next_due || advanceNextDue(interval_value, interval_unit);

  const insertData = {
    user_id: req.userId,
    title,
    description: description || null,
    interval_value,
    interval_unit,
    next_due,
    notify_email: notify_email !== undefined ? notify_email : true,
  };

  // Webhook is a paid feature
  if (user.plan === 'paid' && webhook_url !== undefined) {
    insertData.webhook_url = webhook_url || null;
  }

  const [id] = await db('reminders').insert(insertData);

  const reminder = await db('reminders').where({ id }).first();
  res.status(201).json(reminder);
});

// GET /api/reminders/:id
router.get('/:id', async (req, res) => {
  const reminder = await req.db('reminders')
    .where({ id: req.params.id, user_id: req.userId })
    .first();
  if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
  res.json(reminder);
});

// PUT /api/reminders/:id
router.put('/:id', async (req, res) => {
  const db = req.db;
  const existing = await db('reminders')
    .where({ id: req.params.id, user_id: req.userId })
    .first();
  if (!existing) return res.status(404).json({ error: 'Reminder not found' });

  const { title, description, interval_value, interval_unit, next_due, notify_email, is_active, webhook_url } = req.body;

  const updates = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (interval_value !== undefined) updates.interval_value = interval_value;
  if (interval_unit !== undefined) updates.interval_unit = interval_unit;
  if (next_due !== undefined) updates.next_due = next_due;
  if (notify_email !== undefined) updates.notify_email = notify_email;
  if (is_active !== undefined) updates.is_active = is_active;

  // Webhook is a paid feature
  if (webhook_url !== undefined) {
    const user = await db('users').where({ id: req.userId }).first();
    if (user.plan === 'paid') {
      updates.webhook_url = webhook_url || null;
    }
  }

  await db('reminders').where({ id: req.params.id }).update(updates);
  const reminder = await db('reminders').where({ id: req.params.id }).first();
  res.json(reminder);
});

// DELETE /api/reminders/:id
router.delete('/:id', async (req, res) => {
  const deleted = await req.db('reminders')
    .where({ id: req.params.id, user_id: req.userId })
    .delete();
  if (!deleted) return res.status(404).json({ error: 'Reminder not found' });
  res.json({ success: true });
});

// POST /api/reminders/:id/complete
router.post('/:id/complete', async (req, res) => {
  const db = req.db;
  const reminder = await db('reminders')
    .where({ id: req.params.id, user_id: req.userId })
    .first();
  if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

  const user = await db('users').where({ id: req.userId }).first();

  // Record completion history for paid users
  if (user.plan === 'paid') {
    await db('reminder_history').insert({
      reminder_id: reminder.id,
      completed_at: new Date().toISOString(),
      notes: req.body.notes || null,
    });
  }

  const next_due = advanceNextDue(reminder.interval_value, reminder.interval_unit);

  await db('reminders').where({ id: req.params.id }).update({
    next_due,
    updated_at: new Date().toISOString(),
  });

  const updated = await db('reminders').where({ id: req.params.id }).first();
  res.json(updated);
});

// GET /api/reminders/:id/history (paid)
router.get('/:id/history', async (req, res) => {
  const db = req.db;
  const user = await db('users').where({ id: req.userId }).first();
  if (user.plan !== 'paid') {
    return res.status(403).json({ error: 'History is a paid feature. Upgrade to access.' });
  }

  const reminder = await db('reminders')
    .where({ id: req.params.id, user_id: req.userId })
    .first();
  if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

  const history = await db('reminder_history')
    .where({ reminder_id: reminder.id })
    .orderBy('completed_at', 'desc');

  res.json({ reminder, history });
});

module.exports = router;
