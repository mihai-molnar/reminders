require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const knex = require('knex');
const knexConfig = require('./db/knexfile');
const { startScheduler, processReminders } = require('./services/scheduler');

const app = express();
const db = knex(knexConfig);

app.use(helmet());
app.use(cors());
// Skip JSON parsing for Stripe webhook (needs raw body for signature verification)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Make db accessible to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/payments', require('./routes/payments'));

// POST /api/notifications/trigger — manually run the scheduler (dev only)
app.post('/api/notifications/trigger', async (req, res) => {
  await processReminders(db);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startScheduler(db);
});
