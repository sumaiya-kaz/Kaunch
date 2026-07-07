# Kaunch — Quick Start Commands

Quick reference for developing and operating Kaunch.

## Initial Setup (First Time)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: DB credentials, JWT_SECRET
createdb kaunch_db
npm run migrate
npm run seed          # optional: load subscription sheet data
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

- Backend: http://localhost:5000  
- Frontend: http://localhost:3000

## Daily Development

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Database

```bash
# Reset everything (schema + sheet seed)
cd backend
npm run db:reset

# Seed only
npm run seed

# Verify data
npm run db:verify

# psql
psql -U postgres -d kaunch_db
```

## Test Credentials

```
Admin:  admin@kaunch.com / admin123
Employee: sumaiya@company.com / password123
```

See [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md).

## Test Daily Sheet Workflow

1. Login as admin → **Daily Sheet**
2. Select date → check employees who signed
3. Click **Generate fines**
4. Confirm modal → result modal
5. Login as employee → **History** → **Daily Fine List**

### API (with token)

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kaunch.com","password":"admin123"}' | jq -r .token)

# Get sheet for today
curl -s "http://localhost:5000/api/lunch/sheet?date=2026-06-29" \
  -H "Authorization: Bearer $TOKEN"

# Generate fines
curl -s -X POST http://localhost:5000/api/fines/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-06-29"}'
```

## API Endpoints (Final)

### Auth
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Lunch
- `POST /api/lunch/confirm` — employee online confirm
- `GET /api/lunch/today`
- `GET /api/lunch/history`
- `GET /api/lunch/all` — admin/hr
- `GET /api/lunch/pending` — admin/hr
- `GET /api/lunch/sheet` — admin/hr daily sheet
- `POST /api/lunch/sheet` — admin/hr save sheet

### Fines
- `POST /api/fines/generate` — admin/hr sync from sheet
- `GET /api/fines/daily?date=` — daily published list
- `GET /api/fines/my` — employee fines
- `GET /api/fines` — admin/hr monthly list
- `PUT /api/fines/:id/status` — admin mark paid

### Reports
- `GET /api/reports/dashboard`
- `GET /api/reports/export`

## Environment Variables

### Backend `.env`
```
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=kaunch_db
JWT_SECRET=your_secret_key
CUTOFF_TIME=11:00
DEFAULT_FINE_AMOUNT=50
TIMEZONE=Asia/Dhaka
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

## Cron Jobs

| Time | Job |
|------|-----|
| 10:00 AM | Daily lunch reminder email |
| Cutoff − 15 min | Warning email |
| Cutoff + 5 min | Auto-fine (online confirmation path) |

Cutoff is configurable in **Admin → Settings** and via `CUTOFF_TIME` in `.env`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port in use | `netstat -ano \| findstr :5000` then kill PID (Windows) |
| DB connection | Check PostgreSQL running + `.env` credentials |
| Modal/API fails | Restart backend after route changes |
| Frontend 401 | Re-login; check `VITE_API_URL` |

---

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for full setup instructions.
