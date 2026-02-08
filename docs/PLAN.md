# Recurring Reminder App

## Context

Built-in reminder apps are weak for recurring, long-term tasks (water filter changes, domain renewals, car maintenance). This app provides a focused experience for managing repeating reminders with notifications.

## Stack

- **Frontend:** Vue 3 (Composition API) + Vue Router + Pinia + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite (via Knex.js with migrations)
- **Auth:** Email/password + JWT
- **Payments:** Stripe Checkout (one-time payment for paid plan upgrade)
- **Structure:** Monorepo — `/client` and `/server`

---

## Folder Structure

```
recurring-reminders/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ReminderCard.vue
│   │   │   ├── ReminderForm.vue
│   │   │   ├── ReminderList.vue
│   │   │   ├── NotificationBadge.vue
│   │   │   └── AppNav.vue
│   │   ├── pages/
│   │   │   ├── Dashboard.vue
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   ├── Settings.vue
│   │   │   ├── ReminderDetail.vue
│   │   │   ├── UpgradeSuccess.vue   # post-checkout landing
│   │   │   └── History.vue          # paid
│   │   ├── stores/
│   │   │   ├── auth.js
│   │   │   └── reminders.js
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── lib/
│   │   │   └── api.js               # axios instance
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── reminders.js
│   │   │   ├── payments.js              # Stripe Checkout + webhook
│   │   │   └── notifications.js
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verification
│   │   ├── services/
│   │   │   ├── scheduler.js          # node-cron job
│   │   │   ├── email.js              # nodemailer
│   │   │   ├── sms.js                # paid - Twilio
│   │   │   └── webhook.js            # paid
│   │   ├── db/
│   │   │   ├── knexfile.js
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   └── index.js
│   ├── reminders.db                  # SQLite file (gitignored)
│   └── package.json
├── .gitignore
├── .env.example
└── package.json                      # root scripts (dev, install)
```

---

## Database Schema

### users
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | PK, autoincrement |
| email | TEXT | unique, not null |
| password_hash | TEXT | bcrypt |
| plan | TEXT | 'free' or 'paid', default 'free' |
| stripe_customer_id | TEXT | nullable, unique |
| created_at | DATETIME | default now |

### reminders
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | PK, autoincrement |
| user_id | INTEGER | FK → users.id |
| title | TEXT | e.g. "Change water filter" |
| description | TEXT | nullable |
| interval_value | INTEGER | e.g. 3 |
| interval_unit | TEXT | 'days', 'weeks', 'months', 'years' |
| next_due | DATETIME | when it's next due |
| notify_email | BOOLEAN | default true |
| notify_sms | BOOLEAN | default false (paid) |
| webhook_url | TEXT | nullable (paid) |
| is_active | BOOLEAN | default true |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### reminder_history (paid)
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | PK |
| reminder_id | INTEGER | FK → reminders.id |
| completed_at | DATETIME | when user marked it done |
| notes | TEXT | nullable |

### notification_log
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | PK |
| reminder_id | INTEGER | FK → reminders.id |
| type | TEXT | 'email', 'sms', 'webhook' |
| sent_at | DATETIME | |
| status | TEXT | 'sent', 'failed' |

---

## API Endpoints

### Auth
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — returns JWT
- `GET /api/auth/me` — current user info

### Reminders
- `GET /api/reminders` — list all (with ?status=overdue,upcoming)
- `POST /api/reminders` — create (enforce limit of 5 for free tier)
- `GET /api/reminders/:id` — detail
- `PUT /api/reminders/:id` — update
- `DELETE /api/reminders/:id` — delete
- `POST /api/reminders/:id/complete` — mark done, advance next_due

### History (paid)
- `GET /api/reminders/:id/history` — completion history

### Payments
- `POST /api/payments/create-checkout-session` — creates Stripe Checkout session, returns URL
- `POST /api/payments/webhook` — Stripe webhook handler (verifies signature, upgrades user on checkout.session.completed)

### Settings
- `PUT /api/settings/profile` — update email/password
- `PUT /api/settings/notifications` — default notification prefs

---

## Recurrence Logic

When a user marks a reminder as "done":

```
next_due = now + (interval_value × interval_unit)
```

Example: "Every 3 months" completed on Jan 15 → next_due = Apr 15.

The scheduler (node-cron) runs every hour:
1. Query reminders where `next_due <= now` and `is_active = true`
2. For each due reminder, send notifications (email/sms/webhook)
3. Log to notification_log
4. Overdue reminders show in dashboard with visual indicator

---

## Key Packages

### Server
- `express` — API framework
- `knex` + `better-sqlite3` — DB + migrations
- `bcrypt` — password hashing
- `jsonwebtoken` — JWT
- `node-cron` — scheduler
- `nodemailer` — email
- `express-validator` — input validation
- `stripe` — Stripe Checkout + webhooks
- `cors`, `helmet`, `dotenv`

### Client
- `vue` + `vue-router` + `pinia` — framework + state
- `axios` — HTTP client
- `tailwindcss` — styling
- `@vueuse/core` — composables (optional)
- `date-fns` — date formatting

---

## Implementation Order

### Phase 1 — Foundation
1. Init monorepo with root package.json scripts
2. Set up server: Express, SQLite, Knex migrations, env config
3. Set up client: Vite + Vue 3 + Tailwind + Router

### Phase 2 — Auth
4. DB migration for users table
5. Auth routes (register, login, me)
6. JWT middleware
7. Vue login/register pages + auth store

### Phase 3 — Core Reminders (MVP)
8. DB migration for reminders table
9. CRUD API endpoints for reminders
10. Dashboard page — list upcoming/overdue reminders
11. Reminder form (create/edit)
12. "Mark as done" — advances next_due date
13. Free tier limit enforcement (5 reminders)

### Phase 4 — Notifications
14. Scheduler service (node-cron, runs hourly)
15. Email service (nodemailer + SMTP config)
16. Notification log table + logging

### Phase 5 — Paid Features
17. Reminder history table + API
18. History page in frontend
19. SMS service (Twilio stub)
20. Webhook service
21. Remove reminder limit for paid users

### Payments — Stripe Checkout
22. Stripe Checkout integration (create-checkout-session + webhook endpoints)
23. Upgrade success page in frontend
24. Replace dev plan toggle with real Upgrade button

### Phase 6 — Polish
22. Responsive UI pass
23. Error handling + loading states
24. Settings page (profile, notification prefs)
25. Seed data for demo

---

## Verification

1. **Auth flow:** Register → login → JWT stored → protected routes work
2. **CRUD:** Create reminder → shows on dashboard → edit → delete
3. **Recurrence:** Mark done → next_due advances correctly
4. **Overdue:** Set a reminder due in the past → shows as overdue on dashboard
5. **Scheduler:** Run scheduler manually → sends test email for due reminders
6. **Free limit:** Create 6th reminder on free plan → gets rejected
7. **History (paid):** Complete a reminder → appears in history log
8. **Stripe upgrade:** Click Upgrade → complete Stripe Checkout with test card 4242... → redirected to success page → plan shows "Paid plan"
