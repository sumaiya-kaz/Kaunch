# Kaunch Backend API

Node.js + Express REST API for the Kaunch Office Lunch Management System.

## Features

- JWT authentication with role-based access (`employee`, `admin`, `hr`)
- Employee CRUD (admin)
- Online lunch confirmation with cutoff enforcement
- **Daily food sheet** — admin/hr bulk attendance from physical sign-off sheet
- **Fine generation from sheet** — sync fines with signed/unsigned employees
- Subscription and menu management
- Reporting and CSV export
- Email notifications (Nodemailer)
- Cron jobs for reminders and optional auto-fines

## Tech Stack

Node.js · Express · PostgreSQL · JWT · bcrypt · Nodemailer · node-cron

## Setup

```bash
npm install
cp .env.example .env
createdb kaunch_db
npm run migrate
npm run seed      # optional: subscription sheet data
npm run dev       # http://localhost:5000
```

## Project Structure

```
backend/src/
├── config/database.js
├── controllers/     # auth, employee, lunch, subscription, fine, menu, report, settings
├── database/        # schema.sql, migrate.js, seed.js, subscriptionSheetData.js
├── middlewares/     # auth, errorHandler
├── models/          # SQL data access
├── routes/
├── services/        # notificationService.js, cronScheduler.js
├── utils/           # cutoffTime, menuUtils, foodChoice
└── server.js
```

## API Endpoints

### Authentication
| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| GET | `/api/auth/profile` | Authenticated |
| PUT | `/api/auth/profile` | Authenticated |
| PUT | `/api/auth/change-password` | Authenticated |

### Employees
| Method | Path | Access |
|--------|------|--------|
| GET | `/api/employees` | Admin |
| GET | `/api/employees/:id` | Admin |
| POST | `/api/employees` | Admin |
| PUT | `/api/employees/:id` | Admin |
| DELETE | `/api/employees/:id` | Admin |

### Lunch
| Method | Path | Access |
|--------|------|--------|
| POST | `/api/lunch/confirm` | Employee |
| GET | `/api/lunch/today` | Employee |
| GET | `/api/lunch/history` | Employee |
| GET | `/api/lunch/all` | Admin, HR |
| GET | `/api/lunch/pending` | Admin, HR |
| GET | `/api/lunch/stats` | Admin, HR |
| GET | `/api/lunch/sheet?date=` | Admin, HR — load daily sheet |
| POST | `/api/lunch/sheet` | Admin, HR — save sheet entries |

**Sheet POST body:**
```json
{
  "date": "2026-06-29",
  "entries": [
    { "employee_id": 1, "enjoyed": true },
    { "employee_id": 2, "enjoyed": false }
  ]
}
```

### Subscriptions
| Method | Path | Access |
|--------|------|--------|
| POST | `/api/subscriptions` | Employee |
| GET | `/api/subscriptions/my` | Employee |
| GET | `/api/subscriptions` | Admin |
| PUT | `/api/subscriptions/food-choice` | Employee |
| PUT | `/api/subscriptions/:id/deactivate` | Admin |

### Fines
| Method | Path | Access |
|--------|------|--------|
| POST | `/api/fines` | Admin — manual single fine |
| POST | `/api/fines/generate` | Admin, HR — **sync from daily sheet** |
| GET | `/api/fines` | Admin, HR — list by month/year |
| GET | `/api/fines/my` | Authenticated — own fines |
| GET | `/api/fines/daily?date=` | Authenticated — published daily list |
| GET | `/api/fines/stats` | Admin, HR |
| GET | `/api/fines/:id` | Authenticated |
| PUT | `/api/fines/:id/status` | Admin — mark paid |

**Generate POST body:**
```json
{ "date": "2026-06-29", "amount": 50 }
```

**Generate response:**
```json
{
  "success": true,
  "message": "Generated 3 fine(s) for 2026-06-29",
  "fines": [...],
  "activeFines": [...],
  "created": 3,
  "revoked": 0
}
```

**Generate logic:**
- For each active full/half subscriber on that date:
  - `confirmed` on sheet → delete pending fine for that date; reduce balance
  - not `confirmed` → create pending fine if none exists

### Menu
| Method | Path | Access |
|--------|------|--------|
| POST | `/api/menu` | Admin |
| GET | `/api/menu/today` | Authenticated |
| GET | `/api/menu/date/:date` | Authenticated |
| GET | `/api/menu/range` | Authenticated |
| PUT | `/api/menu/:id` | Admin |
| DELETE | `/api/menu/:id` | Admin |

### Reports
| Method | Path | Access |
|--------|------|--------|
| GET | `/api/reports/dashboard` | Admin, HR |
| GET | `/api/reports/daily` | Admin, HR |
| GET | `/api/reports/monthly` | Admin, HR |
| GET | `/api/reports/export` | Admin, HR |

### Settings
| Method | Path | Access |
|--------|------|--------|
| GET | `/api/settings/cutoff` | Admin |
| PUT | `/api/settings/cutoff` | Admin |

## Cron Jobs

| Schedule | Job |
|----------|-----|
| 10:00 AM daily | `sendDailyReminders()` |
| Cutoff − 15 min | `sendWarningReminders()` |
| Cutoff + 5 min | `calculateDailyFines()` — online confirmation path |

Cutoff loaded from `app_settings` / `CUTOFF_TIME` env; rescheduled via `cronScheduler.js`.

## Environment Variables

```
PORT=5000
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
JWT_SECRET, JWT_EXPIRE
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM
CUTOFF_TIME=11:00
DEFAULT_FINE_AMOUNT=50
TIMEZONE=Asia/Dhaka
FRONTEND_URL=http://localhost:3000
```

## Default Credentials

```
Admin: admin@kaunch.com / admin123
Employee: sumaiya@company.com / password123
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Production start |
| `npm run migrate` | Run schema migration |
| `npm run seed` | Seed from subscription sheet |
| `npm run db:reset` | Migrate + seed |
| `npm run db:verify` | Print data counts |

## License

MIT
