const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  const db = req.db;
  const user = await db('users').where({ id: req.userId }).first();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.plan === 'paid') {
    return res.status(400).json({ error: 'Already on paid plan' });
  }

  // Reuse existing Stripe customer or create a new one
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: String(user.id) },
    });
    customerId = customer.id;
    await db('users').where({ id: user.id }).update({ stripe_customer_id: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/upgrade/success`,
    cancel_url: `${process.env.CLIENT_URL}/`,
    metadata: { userId: String(user.id) },
  });

  res.json({ url: session.url });
});

// POST /api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (userId) {
      const db = req.db;
      await db('users').where({ id: parseInt(userId, 10) }).update({ plan: 'paid' });
      console.log(`User ${userId} upgraded to paid plan`);
    }
  }

  res.json({ received: true });
});

module.exports = router;
