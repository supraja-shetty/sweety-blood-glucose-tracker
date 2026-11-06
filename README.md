# Sweety – Blood Glucose Tracker

A fresher-friendly full-stack app built with **React + Vite**, **Node.js + Express**, and **PostgreSQL**.

## Features
- Register and log in; passwords are hashed with bcrypt.
- JWT-protected API. Users can access only their own readings.
- Create, list, edit, and delete glucose readings.
- One reading per time slot per day, maximum four per day.
- Daily, month-to-date, and previous-month reports.
- Backend validation tests using Node's built-in test runner.
- Demo seed script.

## Requirements
- Node.js 18+
- PostgreSQL 14+

## 1. Database setup
Create a PostgreSQL database:

```sql
CREATE DATABASE sweety;
```

The server automatically creates the `users` and `readings` tables at startup using `server/src/db.js`.

## 2. Configure environment
Copy `server/.env.example` to `server/.env` and set your PostgreSQL connection values and a long random JWT secret.

Example:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/sweety
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Install and run the server
```bash
cd server
npm install
npm run dev
```
The API runs at `http://localhost:5000`.

## 4. Install and run the client
Open another terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## 5. Run tests
```bash
cd server
npm test
```

## 6. Seed demo data
After configuring `server/.env` and starting/initializing the database:
```bash
cd server
npm run seed
```
Demo login:
- Email: `demo@sweety.test`
- Password: `SweetyDemo123!`

The seed script is safe to run more than once: it resets readings for the demo account and inserts sample records for the current month.

## API overview
All routes are prefixed with `/api`.

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Log in |
| GET | `/readings` | Yes | List own readings |
| POST | `/readings` | Yes | Add reading |
| PUT | `/readings/:id` | Yes | Update own reading |
| DELETE | `/readings/:id` | Yes | Delete own reading |
| GET | `/reports/daily?date=YYYY-MM-DD` | Yes | Daily summary and slot details |
| GET | `/reports/month-to-date?date=YYYY-MM-DD` | Yes | From month start through selected date |
| GET | `/reports/previous-month?date=YYYY-MM-DD` | Yes | Entire previous calendar month |

## Validation and assumptions
- Dates are stored as PostgreSQL `DATE` values and interpreted as calendar dates, not timestamps.
- The four slot labels are fixed and case-sensitive.
- A reading value must be an integer from 40 through 600 mg/dl.
- A date later than today's server date is rejected.
- The database has a unique constraint on `(user_id, reading_date, slot)` as a second line of protection against duplicate slots.
- The maximum-four-per-day rule is checked in a transaction with a per-user/day advisory lock to reduce race conditions.
- Reports include all readings in their requested date range and round the average to one decimal place.
- This is an educational tracking app, not a medical device. It does not provide diagnosis or treatment advice.

## What I would improve with more time
- Add pagination and a monthly chart.
- Add refresh-token/session management, rate limiting, and stronger account recovery.
- Add end-to-end tests and CI.
- Deploy the API, database, and frontend with managed secrets and HTTPS.
