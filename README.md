# Kaunch — Office Lunch Management System

Full-stack application for managing office lunch subscriptions, daily confirmations, menu planning, and **half-manual fine tracking** based on a physical food-enjoyment sign-off sheet.

## Overview

Kaunch supports two complementary daily workflows:

1. **Employee self-service** — subscribed employees confirm or skip lunch online before the configurable cutoff (default 11:00 AM).
2. **Admin daily sheet** — admin/HR receives a physical sheet where employees sign that they enjoyed today's food, enters attendance in the system, and **generates fines** for anyone who did not sign.

Employees can view the published daily fine list and their personal fine history after admin generates fines for a date.

## Key Features

### For Employees
- Daily lunch confirmation (Yes/No) before cutoff, with menu choice
- Monthly subscription (full / half month) and food preference
- Week-based lunch history
- **Daily Fine List** — office-wide fines for a selected date (after admin publishes)
- Personal fines table and fine balance on dashboard
- Email reminders (when configured)

### For Admin & HR
- Real-time admin dashboard (today's confirmations, monthly fines)
- **Daily Sheet** (`/admin/daily-sheet`) — enter physical sign-off sheet, generate fines, result modal
- Fine management — monthly view, mark fines as paid
- Reports and CSV export
- Employee management, meal plan, and settings (**admin only**)

### Automated (optional supplement)
- Daily reminder emails at 10:00 AM
- Warning emails 15 minutes before cutoff
- Automatic fine cron after cutoff (online confirmation path — may overlap with sheet workflow; sheet generate syncs/corrects pending fines)

## Architecture

```
Kaunch/
├── backend/          # Node.js + Express API (port 5000)
├── frontend/         # React + Vite + Tailwind (port 3000)
└── *.md              # PRD, design system, setup guides, sheet data
```

### Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Axios |
| Backend | Node.js, Express, JWT, bcrypt, Nodemailer, node-cron |
| Database | PostgreSQL 12+ |

## Quick Start

### Prerequisites
- Node.js v16+
- PostgreSQL 12+
- npm

### Backend
```bash
cd backend
npm install
cp .env.example .env   # edit DB + JWT credentials
createdb kaunch_db
npm run migrate
npm run dev            # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev            # http://localhost:3000
```

See [QUICK_START.md](QUICK_START.md) and [SETUP_GUIDE.md](SETUP_GUIDE.md) for details.

## Default Credentials

```
Admin:
  Email: admin@kaunch.com
  Password: admin123

Employee (53 from subscription sheet):
  Email: <firstname.lastname>@company.com
  Password: password123
```

See [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md).

## Daily Fine Workflow (Primary)

```
Physical sheet collected → Admin opens Daily Sheet
  → Check employees who signed (enjoyed food)
  → Save sheet (optional) or Generate fines
  → Confirm modal (if anyone unsigned)
  → System saves sheet + syncs fines
  → Result modal (fines list or “no fines”)
  → Employees see Daily Fine List on History page
```

**Fine sync rules on generate:**
- **Signed** → no fine; any pending fine for that date is removed
- **Not signed** → ৳50 fine applied (default, configurable)
- Duplicate fines for the same employee + date are skipped

## Business Rules

| Rule | Default |
|------|---------|
| Cutoff time | 11:00 AM (admin-configurable in Settings) |
| Default fine | ৳50 (`DEFAULT_FINE_AMOUNT` in `.env`) |
| Subscription types | Full month, Half month (first 15 days), None |
| Sheet scope | Active full/half subscribers for that month |
| Food preferences | `regular`, `no_fish`, `no_chicken`, `no_mutton_beef`, `always_fish` |

## Roles & Routes

| Role | Access |
|------|--------|
| **employee** | `/dashboard`, `/subscription`, `/history` |
| **admin** | All `/admin/*` routes |
| **hr** | Dashboard, Fines, Daily Sheet, Reports (not Employees, Meal Plan, Settings) |

## Database Tables

- `employees` — accounts, roles, food preference, fine balance
- `subscriptions` — monthly full/half/none + monthly food choice
- `menu_items` — daily menu (regular / Friday)
- `lunch_confirmations` — daily status (`confirmed` / `skipped` / `pending`); also stores admin sheet entries
- `fines` — fine records (`pending` / `paid`)
- `app_settings` — e.g. cutoff time

## API Highlights

| Endpoint | Purpose |
|----------|---------|
| `POST /api/lunch/confirm` | Employee online confirmation |
| `GET /api/lunch/sheet?date=` | Load daily sheet (admin/hr) |
| `POST /api/lunch/sheet` | Save sheet entries (admin/hr) |
| `POST /api/fines/generate` | Sync fines from sheet (admin/hr) |
| `GET /api/fines/daily?date=` | Daily fine list (all authenticated users) |
| `GET /api/fines/my` | Employee's own fines |
| `PUT /api/fines/:id/status` | Mark fine paid (admin) |

Full reference: [backend/README.md](backend/README.md).

## Seed Data

Employee and attendance data comes from the office **Lunch Subscription Sheet** (June 2026):

```bash
cd backend
npm run db:reset    # migrate + seed from sheet
```

See [DATABASE_TEST_DATA.md](DATABASE_TEST_DATA.md).

## Documentation Index

| File | Contents |
|------|----------|
| [Kaunch_PRD.md](Kaunch_PRD.md) | Product requirements |
| [Kaunch_Design_System.md](Kaunch_Design_System.md) | UI tokens, screens, components |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Step-by-step setup |
| [QUICK_START.md](QUICK_START.md) | Command cheat sheet |
| [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md) | Login credentials |
| [DATABASE_TEST_DATA.md](DATABASE_TEST_DATA.md) | Seed data summary |
| [frontend/README.md](frontend/README.md) | Frontend structure |
| [backend/README.md](backend/README.md) | API reference |

## Deployment

- **Frontend:** Vercel, Netlify — set `VITE_API_URL`
- **Backend:** Railway, Render — set DB, JWT, email env vars
- **Database:** Neon, Supabase, Railway PostgreSQL

## License

MIT

---

**Version:** 2.0.0  
**Last Updated:** June 2026  
**Status:** Production ready
