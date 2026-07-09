# Micro Frontend — Kaunch + Attenda

Option 1 setup: **reverse proxy shell** (`office-portal`) routes traffic to each app. Kaunch and Attenda keep their own UI, logic, and backends.

## Architecture

```
http://localhost:8080/          → office-portal (landing page)
http://localhost:8080/lunch/    → Kaunch frontend (:3000)
http://localhost:8080/lunch/api → Kaunch API (:5000)
http://localhost:8080/attendance/    → Attenda frontend (:5173)
http://localhost:8080/attendance/api → Attenda API (:5280)
```

## Quick start (portal mode)

### 1. Install portal gateway

```bash
cd office-portal
npm install
```

### 2. Start all services (5 terminals)

**Terminal 1 — Kaunch API**
```bash
cd backend
npm run dev
```

**Terminal 2 — Kaunch frontend (portal mode)**
```bash
cd frontend
npm run dev:portal
```

**Terminal 3 — Attenda API**
```bash
cd ../Attenda/src/Attenda.Api
dotnet run
```

**Terminal 4 — Attenda frontend (portal mode)**
```bash
cd ../../Attenda/client
npm run dev:portal
```

**Terminal 5 — Office portal**
```bash
cd ../../Kaunch/office-portal
npm run dev
```

### 3. Open the portal

- **Home:** http://localhost:8080
- **Kaunch:** http://localhost:8080/lunch/
- **Attenda:** http://localhost:8080/attendance/

## Standalone mode (unchanged)

Each app still runs on its own without the portal:

| App | URL |
|-----|-----|
| Kaunch | http://localhost:3000 |
| Attenda | http://localhost:5173 |

Use `npm run dev` (not `dev:portal`) in each frontend.

## What changed

| Layer | Change |
|-------|--------|
| Kaunch / Attenda UI | **No changes** to pages, dashboards, or nav |
| Kaunch / Attenda logic | **No changes** to business logic |
| Infrastructure only | Optional `VITE_BASE_PATH` + router basename for subpath hosting |
| New | `office-portal/` reverse proxy + landing page |

## Production build

```bash
# Kaunch
cd frontend && npm run build:portal

# Attenda
cd Attenda/client && npm run build:portal

# Serve dist folders via nginx (see office-portal/nginx.conf.example)
```

## Environment files

| File | Purpose |
|------|---------|
| `frontend/.env.portal` | Kaunch portal settings (`/lunch/`) |
| `Attenda/client/.env.portal` | Attenda portal settings (`/attendance/`) |
| `office-portal/.env` | Proxy target URLs (copy from `.env.example`) |

## Notes

- Each app has its **own login** (separate JWT issuers).
- Switch apps via the portal home page or direct URLs.
- Backends stay independent (Node.js + .NET).
