# Recurring Reminders — TODO

## Phase 1 — Foundation
- [x] Init monorepo with root package.json scripts
- [x] Set up server: Express, SQLite, Knex migrations, env config
- [x] Set up client: Vite + Vue 3 + Tailwind + Router

## Phase 2 — Auth
- [x] DB migration for users table
- [x] Auth routes (register, login, me)
- [x] JWT middleware
- [x] Vue login/register pages + auth store

## Phase 3 — Core Reminders (MVP)
- [x] DB migration for reminders table
- [x] CRUD API endpoints for reminders
- [x] Dashboard page — list upcoming/overdue reminders
- [x] Reminder form (create/edit)
- [x] "Mark as done" — advances next_due date
- [x] Free tier limit enforcement (5 reminders)

## Phase 4 — Notifications
- [x] Scheduler service (node-cron, runs hourly)
- [x] Email service (nodemailer + SMTP config)
- [x] Notification log table + logging

## Bugfixes / Improvements
- [x] Fix user email disappearing on page refresh (fetch user on app mount)
- [x] Default datepicker to today's date for new reminders

## Phase 5 — Paid Features
- [x] Reminder history table + API
- [x] History page in frontend
- [ ] SMS service (Twilio stub) — **deferred** (to be added later)
- [x] Webhook service
- [x] Remove reminder limit for paid users (already enforced in Phase 3)

## Dev Shortcuts (remove before production)
- [x] Plan toggle button in nav bar — replace with Stripe Checkout
- [x] "Send notifications" button on dashboard — remove once email is production-ready
- [x] Mailtrap SMTP for email testing — switch to a production email provider (e.g. SendGrid, SES)

## Future — Payments & Deferred
- [ ] Stripe Checkout integration (replace dev plan toggle with real payments)
- [ ] SMS service (Twilio stub)

## Phase 6 — Polish
- [ ] Responsive UI pass
- [ ] Error handling + loading states
- [ ] Settings page (profile, notification prefs)
- [ ] Seed data for demo
