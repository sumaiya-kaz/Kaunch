# Kaunch Database — Seed & Test Data

The database can be populated from the office **Lunch Subscription Sheet** (June 2026) via the seed script.

## Summary (after `npm run seed`)

| Item | Count |
|------|-------|
| Employees (from sheet) | 53 |
| Admin | 1 |
| Subscriptions (June 2026) | ~52 active |
| Lunch confirmations | 53 × 7 weekdays |
| Menu items | 0 (admin creates via Meal Plan) |
| Fines | 0 initially (created via Daily Sheet or cron) |

Exact counts may vary; run `npm run db:verify` for current state.

## Data sources

| File | Purpose |
|------|---------|
| `Lunch Subscription Sheet - June 2026.md` | Employee names, daily Yes/No |
| `Lunch Subscription Sheet - Food choice list.md` | Dietary preferences |
| `backend/src/database/subscriptionSheetData.js` | Structured module for seed |
| `backend/src/database/seed.js` | Seed orchestration |

## Commands

```bash
cd backend
npm run migrate     # create tables
npm run seed        # load sheet data
npm run db:reset    # migrate + seed (full reset)
npm run db:verify   # print current counts
```

## Schema tables

| Table | Purpose |
|-------|---------|
| `employees` | Auth, role, `food_preference`, `fine_balance` |
| `subscriptions` | Monthly full/half/none, `monthly_food_choice` |
| `menu_items` | Daily menu |
| `lunch_confirmations` | Online confirm + **admin daily sheet** entries |
| `fines` | Fine records; created by sheet generate or cron |
| `app_settings` | Cutoff time etc. |

## Lunch confirmations vs daily sheet

- **Seed data** maps sheet Yes/No → `confirmed` / `skipped` for June 2026 dates.
- **Runtime (admin)** uses Daily Sheet UI → `POST /api/lunch/sheet` with same status values.
- Notes on sheet save: `"Signed on daily food sheet — enjoyed meal"` or `"Not signed on daily food sheet"`.

## Fines

Fines are **not** seeded by default. They are created when:

1. **Admin generates from Daily Sheet** (`POST /api/fines/generate`) — primary workflow
2. **Auto cron** after cutoff — fines employees who did not confirm online

Generate from sheet **syncs** fines: removes pending fines for signed employees; adds fines for unsigned.

## Login

- **Admin:** admin@kaunch.com / admin123
- **Employees:** `<name>@company.com` / password123

See [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md).

## Useful SQL

```sql
-- Today's sheet-related confirmations
SELECT e.name, lc.status, lc.notes
FROM lunch_confirmations lc
JOIN employees e ON e.id = lc.employee_id
WHERE lc.date = '2026-06-29';

-- Pending fines
SELECT e.name, f.date, f.amount, f.reason
FROM fines f
JOIN employees e ON e.id = f.employee_id
WHERE f.status = 'pending';

-- Active June subscriptions
SELECT e.name, s.subscription_type
FROM subscriptions s
JOIN employees e ON e.id = s.employee_id
WHERE s.month = 6 AND s.year = 2026 AND s.is_active = TRUE;
```
