# Copilot Implementation Guide (CID)

## Tech Stack
- React + Tailwind + Context API
- Node + Express + JWT
- PostgreSQL

## Folder Structure

Frontend:
src/components
src/pages
src/services
src/context

Backend:
src/controllers
src/routes
src/models
src/middlewares

## Rules
- Cutoff time 11:00 AM (backend enforced)
- Default lunch YES
- Fine = 50 BDT default
- Role based routing required

## Pages
Employee:
- Dashboard
- Lunch Confirm
- Subscription
- History

Admin:
- Dashboard
- Employees
- Reports
- Menu
- Fines

## API Contract
POST /login
POST /lunch/confirm
GET /lunch/history
POST /subscription
POST /fine/calc

## State Management
Use Context API only

## Important
- Modular code only
- Backend validation mandatory
- No business logic in frontend
