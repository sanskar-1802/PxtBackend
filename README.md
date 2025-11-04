# Backend Bee - Expense Tracker Backend

## Quick start
1. Copy `.env.example` to `.env` and fill EMAIL_USER and EMAIL_PASS (Gmail app password).
2. Ensure MongoDB running locally.
3. Install:
   ```
   npm install
   ```
4. Run in dev:
   ```
   npm run dev
   ```

## Features included
- JWT access + refresh tokens
- Password reset (via Gmail)
- Recurring transactions (cron job runs daily)
- Dashboard summary endpoint
- Notifications (dashboard alerts)
- Budgets & Goals models
- Winston logging
- Jest + Supertest testing scaffold
