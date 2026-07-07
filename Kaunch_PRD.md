# Product Requirements Document (PRD)

## Project Name
**Kaunch** — Office Lunch Management System (OLMS)

## Version
**v2.0** — Final system (June 2026)

## Product Overview

Kaunch manages office lunch subscriptions, daily meal confirmations, menu planning, and fines. The fine system is **half-manual, half-automated**: employees may confirm lunch online before cutoff, while admin/HR also processes a **physical daily sign-off sheet** and generates fines from that data.

## Goals

- Automate lunch subscription and confirmation where possible
- Reduce food waste through accurate headcounts
- Track lunch history per employee
- Apply fines fairly using a verifiable physical sheet + system record
- Give employees transparency into published fine lists
- Provide admin reporting and exports

## User Roles

| Role | Description |
|------|-------------|
| **Employee** | Confirms lunch, manages subscription, views history and fines |
| **Admin** | Full system access — employees, menu, settings, fines, daily sheet, reports |
| **HR** | Operational access — dashboard, fines, daily sheet, reports (no employee/menu/settings CRUD) |

## Core Features

### 1. Lunch Confirmation (Employee — Online)
- Confirm or skip lunch before configurable cutoff (default 11:00 AM)
- Select menu item when confirming (based on daily menu + food preference)
- Locked after cutoff for same-day changes
- Stored in `lunch_confirmations`

### 2. Subscription Management
- Monthly plans: **Full**, **Half** (first 15 days), **None**
- Monthly food choice aligned with preference categories
- Only subscribed employees appear on the daily fine sheet

### 3. Menu Management (Admin)
- Daily menu: regular weekdays vs Friday options
- Protein, sides, cost fields
- Required before employee can confirm online for that date

### 4. Daily Food Sheet & Fine Generation (Admin/HR) — **Primary fine workflow**

**Physical process:**
1. Office collects a sheet where employees sign that they enjoyed today's food.
2. Admin/HR opens **Daily Sheet** in the app for that date.
3. Admin checks employees who signed.
4. Admin clicks **Generate fines**.

**System behavior:**
- Saves sheet → `lunch_confirmations` (`confirmed` = signed, `skipped` = not signed)
- Syncs fines:
  - Signed → remove pending fine for that date if any
  - Not signed → create ৳50 pending fine (if none exists)
- Shows **confirm modal** (if unsigned employees) then **result modal**
- Switches to fine list view only when fines exist
- Employees see published list on **History → Daily Fine List**

### 5. Fine Management (Admin/HR)
- Monthly fine overview with stats
- Mark fines as paid (updates employee `fine_balance`)
- Manual single-fine creation (admin API)

### 6. Employee History
- Week view of lunch confirmations (Mon–Fri)
- **Daily Fine List** — all employees fined on a selected date
- Personal fines table with amounts and status

### 7. Reports & Dashboard
- Admin dashboard: today confirmed/skipped, monthly fines
- Daily/monthly reports, CSV export

### 8. Settings (Admin)
- Configurable cutoff time (drives cron schedule)

### 9. Notifications (Optional)
- 10:00 AM daily reminder
- 15-minute warning before cutoff
- Fine notification email (auto-cron path)
- Requires SMTP configuration in `.env`

## Automated Fine Cron (Secondary)

A cron job after cutoff can auto-fine subscribed employees who did not confirm **online**. This supplements but does not replace the sheet workflow. Running **Generate fines** from the daily sheet reconciles pending fines (removes fines for signed employees).

## Non-Functional Requirements

- JWT authentication, bcrypt passwords
- Role-based route and API authorization
- Responsive web UI (Kaunch Design System)
- PostgreSQL persistence
- WCAG-oriented badges and contrast

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express, JWT, bcrypt, Nodemailer, node-cron |
| Database | PostgreSQL |
| Deployment | Vercel (FE), Railway/Render (BE), Neon/Supabase (DB) |

## Data Sources

- `Lunch Subscription Sheet - June 2026.md` — employee names, daily Yes/No
- `Lunch Subscription Sheet - Food choice list.md` — dietary preferences
- `backend/src/database/subscriptionSheetData.js` — structured seed module

## Out of Scope (v2.0)

- Mobile native app
- SMS notifications
- Payment gateway integration
- Employee fine dispute workflow in-app
- Multi-office / multi-tenant

## Success Metrics

- Admin can process daily sheet and publish fines in under 5 minutes
- Employees can see published fine list same day
- Fine balance stays consistent when fines marked paid
- Subscription sheet employees load correctly from seed

---

**Document status:** Final for v2.0 implementation (June 2026)
