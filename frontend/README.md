# Kaunch Frontend

React + Vite + Tailwind CSS UI for the Kaunch Office Lunch Management System.

## Features

- Kaunch Design System (Emerald / Saffron / Danger palette)
- JWT auth with role-based routing
- Employee: dashboard, subscription, history with **Daily Fine List**
- Admin/HR: dashboard, **Daily Sheet**, fines, reports
- Admin-only: employees, meal plan, settings
- Portal-based **modals** for fine generation confirm + result

## Setup

```bash
npm install
cp .env.example .env
npm run dev    # http://localhost:3000
```

`.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
frontend/src/
├── components/
│   ├── Layout.jsx, Navbar.jsx
│   ├── Modal.jsx              # Portal modal (daily sheet)
│   ├── PageHeader.jsx, StatCard.jsx, EmptyState.jsx
│   ├── StatusBadge.jsx, FoodPreferenceChip.jsx
├── context/AuthContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── employee/
│   │   ├── Dashboard.jsx      # Online lunch confirm
│   │   ├── Subscription.jsx
│   │   └── History.jsx        # Week history + Daily Fine List + personal fines
│   └── admin/
│       ├── Dashboard.jsx
│       ├── DailySheet.jsx     # Physical sheet entry + generate fines
│       ├── Fines.jsx
│       ├── Employees.jsx
│       ├── MenuManagement.jsx
│       ├── Reports.jsx
│       └── Settings.jsx
├── services/                  # Axios API wrappers
└── App.jsx                    # Routes
```

## Routes

| Path | Page | Role |
|------|------|------|
| `/login` | Login | Public |
| `/dashboard` | Employee dashboard | employee |
| `/subscription` | Subscription | employee |
| `/history` | History & fines | employee |
| `/admin` | Admin dashboard | admin, hr |
| `/admin/daily-sheet` | Daily food sheet | admin, hr |
| `/admin/fines` | Fine management | admin, hr |
| `/admin/reports` | Reports | admin, hr |
| `/admin/employees` | Employees | admin |
| `/admin/menu` | Meal plan | admin |
| `/admin/settings` | Cutoff settings | admin |

## Daily Sheet UI Flow

1. Admin selects date → subscribed employees load with checkboxes
2. **Mark all signed** / **Clear all** shortcuts
3. **Save sheet** — persists without generating fines
4. **Generate fines** → confirm modal (if unsigned) → API save + sync → **result modal**
5. Result modal: fine list or “no fines”; optional **View fine list** switches table view
6. Single table area toggles between sheet entry and generated fine list

## Employee History

- **Week selector** — Mon–Fri lunch confirmation status
- **Daily Fine List** — date picker; shows all fined employees after admin generates (highlights current user)
- **Personal fines** — all own fine records with status

## Design System

See [Kaunch_Design_System.md](../Kaunch_Design_System.md).

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#1A6B3C` | Nav, confirmed, CTAs |
| Accent | `#F4A025` | Pending, warnings |
| Danger | `#C0392B` | Fines, skipped |

CSS classes: `btn-primary`, `btn-secondary`, `card`, `data-table`, `badge-confirmed`, `badge-pending`, etc.

## Services

| File | API prefix |
|------|------------|
| `authService.js` | `/auth` |
| `lunchService.js` | `/lunch` (+ `getDailySheet`, `saveDailySheet`) |
| `fineService.js` | `/fines` (+ `generateFinesFromSheet`, `getDailyFines`) |
| `subscriptionService.js` | `/subscriptions` |
| `reportService.js` | `/reports` |
| `settingsService.js` | `/settings` |

## Default Credentials

```
Admin: admin@kaunch.com / admin123
Employee: sumaiya@company.com / password123
```

## Build & Deploy

```bash
npm run build     # output: dist/
npm run preview   # preview production build
```

Set `VITE_API_URL` on Vercel/Netlify to your production API.

## License

MIT
