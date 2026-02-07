const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { authenticateToken, signToken } = require('../middleware/auth');

const router = express.Router();

const validate = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

// POST /api/auth/register
router.post('/register', validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Valid email and password (min 6 chars) required' });
  }

  const { email, password } = req.body;
  const db = req.db;

  const existing = await db('users').where({ email }).first();
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const [id] = await db('users').insert({ email, password_hash });

  const token = signToken(id);
  res.status(201).json({
    token,
    user: { id, email, plan: 'free' },
  });
});

// POST /api/auth/login
router.post('/login', validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Valid email and password required' });
  }

  const { email, password } = req.body;
  const db = req.db;

  const user = await db('users').where({ email }).first();
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, plan: user.plan },
  });
});

// POST /api/auth/toggle-plan (dev only — swap between free/paid)
router.post('/toggle-plan', authenticateToken, async (req, res) => {
  const db = req.db;
  const user = await db('users').where({ id: req.userId }).first();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newPlan = user.plan === 'free' ? 'paid' : 'free';
  await db('users').where({ id: req.userId }).update({ plan: newPlan });

  res.json({ user: { id: user.id, email: user.email, plan: newPlan } });
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  const db = req.db;
  const user = await db('users').where({ id: req.userId }).first();
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: { id: user.id, email: user.email, plan: user.plan },
  });
});

module.exports = router;
