# Software Specification Document (SSD)

## Architecture
Frontend (React) → Backend (Node/Express) → PostgreSQL

## Modules
- Auth
- Employee
- Subscription
- Lunch Confirmation
- Food Preference
- Menu
- Fine
- Reports
- Notifications

## API Examples

### Login
POST /api/auth/login
{
  "email": "",
  "password": ""
}

### Lunch Confirm
POST /api/lunch/confirm
{
  "employeeId": "",
  "date": "",
  "status": "yes"
}

## Database Tables
- Employee
- Subscription
- LunchConfirmation
- Fine
- Menu

## Business Rules
- Cutoff time: 11:00 AM
- Default status: YES
- Fine if missed update
- Admin override allowed

## Non Functional
- Secure JWT auth
- Role based access
- Fast dashboard (<3s)
