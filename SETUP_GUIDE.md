# Kaunch Setup Guide

Step-by-step guide to set up and run Kaunch (Office Lunch Management System).

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Seed Data](#seed-data)
6. [Email Configuration](#email-configuration)
7. [Testing the Application](#testing-the-application)
8. [Troubleshooting](#troubleshooting)

## System Requirements

- **Node.js** v16+
- **PostgreSQL** v12+
- **Git** (optional)

Recommended: VS Code, Postman, pgAdmin

## Database Setup

### Create database

**Windows (PowerShell):**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres kaunch_db
```

**macOS/Linux:**
```bash
createdb -U postgres kaunch_db
```

**pgAdmin:** Create database named `kaunch_db`.

### Verify
```bash
psql -U postgres -d kaunch_db -c "\dt"
```
Empty database before migrate is expected.

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

### `.env` example
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=kaunch_db

JWT_SECRET=your_very_secure_random_secret
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=Kaunch <noreply@kaunch.com>

CUTOFF_TIME=11:00
DEFAULT_FINE_AMOUNT=50
TIMEZONE=Asia/Dhaka
FRONTEND_URL=http://localhost:3000
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Migrate & seed
```bash
npm run migrate
npm run seed        # loads 53 employees from subscription sheet
```

### Start server
```bash
npm run dev
```

Expected:
```
🚀 Kaunch Backend server running on port 5000
⏰ Cutoff time: 11:00 AM (11:00)
```

Health check: http://localhost:5000/health

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open http://localhost:3000

## Seed Data

Data is loaded from the office lunch subscription sheets:

- `Lunch Subscription Sheet - June 2026.md`
- `Lunch Subscription Sheet - Food choice list.md`
- `backend/src/database/subscriptionSheetData.js`

```bash
cd backend
npm run db:reset    # drop tables, migrate, seed
```

See [DATABASE_TEST_DATA.md](DATABASE_TEST_DATA.md).

## Email Configuration

Optional for development. Without SMTP, the backend logs email content to the console.

**Gmail:**
1. Enable 2FA on Google account
2. Create app password at https://myaccount.google.com/apppasswords
3. Set `EMAIL_USER` and `EMAIL_PASSWORD` in backend `.env`
4. Restart backend

## Testing the Application

### 1. Admin login
```
URL: http://localhost:3000/login
Email: admin@kaunch.com
Password: admin123
```

**Admin features to verify:**
- Dashboard — today's stats
- **Daily Sheet** — sheet entry + generate fines + modals
- Fines — monthly list, mark paid
- Employees, Meal Plan, Settings, Reports

### 2. Employee login
```
Email: sumaiya@company.com
Password: password123
```

**Employee features:**
- Dashboard — confirm lunch, fine balance
- Subscription — full/half month
- History — week confirmations, **Daily Fine List**, personal fines

### 3. Daily sheet fine flow (recommended test)

1. Admin → **Daily Sheet** → pick a date with active subscriptions
2. Uncheck 1–2 employees → **Generate fines**
3. Confirm in modal → see result modal with fine list
4. Employee → **History** → select same date in Daily Fine List

### 4. API smoke test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kaunch.com","password":"admin123"}'
```

## Troubleshooting

### Database connection refused
- Ensure PostgreSQL service is running
- Verify `DB_*` values in `.env`
- Database name must be `kaunch_db` (unless you changed it everywhere)

### Migration fails
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS kaunch_db;"
psql -U postgres -c "CREATE DATABASE kaunch_db;"
cd backend && npm run migrate && npm run seed
```

### Port in use
Change `PORT` in backend `.env` or kill the process on 5000/3000.

### Generate fines / modal not working
- Restart backend after code changes
- Ensure logged in as **admin** or **hr**
- Check browser console and backend terminal for API errors

### Styles missing
```bash
cd frontend
rm -rf node_modules && npm install && npm run dev
```

## Production

**Backend:** Set `NODE_ENV=production`, strong `JWT_SECRET`, production DB URL, SMTP.

**Frontend:** `npm run build` → deploy `dist/` with `VITE_API_URL` pointing to production API.

---

**Setup complete.** See [README.md](README.md) for feature overview and [QUICK_START.md](QUICK_START.md) for daily commands.
