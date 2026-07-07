# Test Login Credentials

Credentials for the Kaunch development environment. Data is seeded from **Lunch Subscription Sheet - June 2026**.

## Admin

```
Email:    admin@kaunch.com
Password: admin123
Role:     admin
Access:   All admin routes (employees, daily sheet, fines, menu, settings, reports)
```

## HR (if created manually)

```
Role:     hr
Access:   Dashboard, Fines, Daily Sheet, Reports
          (not Employees, Meal Plan, Settings)
```

## Employees (53 from subscription sheet)

```
Password: password123   (all employees)
```

**Email format:** `<firstname.lastname>@company.com` (lowercase, spaces → dots)

| Name | Email |
|------|-------|
| Sumaiya | sumaiya@company.com |
| Rijvy | rijvy@company.com |
| Abdul Kaium Khan | abdul.kaium.khan@company.com |
| Anower Ullah | anower.ullah@company.com |
| Tanveer | tanveer@company.com |

Full list is in `backend/src/database/subscriptionSheetData.js`.

## Reset database

```bash
cd backend
npm run db:reset
```

Recreates schema and reloads employees, subscriptions, and lunch confirmations from the sheet.

## June 2026 lunch dates (seed)

| Dates |
|-------|
| 22, 23, 24, 25, 26, 29, 30 Jun 2026 |

- **Yes** in sheet → `confirmed`
- **No** in sheet → `skipped`

## Food preferences (DB values)

Mapped from the Food choice list sheet:

| Sheet category | DB `food_preference` |
|----------------|----------------------|
| No Fish / Only chicken | `no_fish` |
| No Chicken | `no_chicken` |
| Always Fish | `always_fish` |
| No Beef & Mutton | `no_mutton_beef` |
| Not listed | `regular` |

## Testing daily fines

1. Login as **admin@kaunch.com**
2. Go to **Daily Sheet** → select a June 2026 weekday
3. Generate fines after adjusting checkboxes
4. Login as an employee → **History** → **Daily Fine List**

---

**Note:** Test passwords only. Use strong credentials in production.
