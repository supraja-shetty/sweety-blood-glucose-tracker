# Sweety – Blood Glucose Tracker

A full-stack blood glucose tracking application built using **React, Vite, Node.js, Express.js and PostgreSQL**.

Sweety helps patients record and manage their daily blood glucose readings, view reports and monitor monthly trends. It also provides a doctor portal where doctors can view assigned patients and their glucose reports.

**GitHub Repository:** https://github.com/supraja-shetty/sweety-blood-glucose-tracker

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT, bcrypt |
| API Communication | Axios |
| Data Visualization | SVG Line Chart |
| Testing | Node.js Built-in Test Runner |
| Version Control | Git, GitHub |

---

## Features

### 1. Authentication and User Management
- Patient registration with name, email and password.
- Secure login using email and password.
- Password hashing using bcrypt.
- JWT-based authentication for protected API routes.
- Role-based access control for patients and doctors.
- Users can access only their own reading records.

### 2. Patient Dashboard
- Personalized dashboard after login.
- Add, view, edit and delete glucose readings.
- Select dates to view reading history and reports.
- Display validation messages and success notifications.
- Friendly empty states when no readings are available.

### 3. Blood Glucose Reading Management

Each reading contains:
- Reading date
- Time slot
- Glucose value in mg/dl

The four supported time slots are:

1. Morning (fasting)
2. After breakfast
3. After lunch
4. After dinner

Patients can create, view, update and delete their own readings.

### 4. Reading History and Pagination
- View previously recorded glucose readings.
- Display reading date, time slot and glucose value.
- Edit and delete existing records.
- Paginated reading history.
- Support for page and limit query parameters.
- Previous and Next navigation.

### 5. Reports and Summary Cards

The application provides three types of reports.

**Daily Report**
- Highest glucose reading.
- Lowest glucose reading.
- Average glucose reading.
- Total number of readings.
- Individual readings with their time slots.

**Month-to-Date Report**
- Covers the first day of the selected month through the selected date.
- Displays highest, lowest and average readings.
- Displays the total number of readings.

**Previous-Month Report**
- Covers the entire previous calendar month.
- Displays highest, lowest and average readings.
- Displays the total number of readings.

All report averages are rounded to one decimal place. Friendly empty states are displayed when no readings are available.

### 6. Monthly Glucose Chart
- Line chart showing glucose readings across the selected month.
- Displays glucose values against calendar days.
- Helps users understand their recorded monthly trends.
- Updates according to the selected month.
- Displays an empty state when no readings are available.

The chart is implemented using SVG.

### 7. Doctor Portal

The application supports separate patient and doctor roles.

Doctor features include:
- Doctor-specific dashboard.
- View the list of assigned patients.
- Display patient names and email addresses.
- Select an assigned patient to view their glucose report.
- View patient reading history and report summaries.
- Restrict access to patients assigned to the logged-in doctor.

Doctor routes require authentication and doctor-role authorization. The backend verifies patient assignments before returning patient information.

### 8. Backend Security and Validation
- Password hashing using bcrypt.
- JWT-protected API endpoints.
- Role-based authorization.
- Patient-specific reading access.
- Parameterized SQL queries.
- Database constraints for duplicate reading prevention.
- Transaction-based validation for the maximum-four-readings rule.
- Backend input validation and error handling.

---

## Validation Rules

| Rule | Expected Behavior |
|---|---|
| Reading value is required | Reject empty values |
| Value must be a whole number | Reject decimal values |
| Value must be between 40 and 600 mg/dl | Reject values outside the range |
| Only one reading per slot per day | Reject duplicate time slots |
| Maximum four readings per day | Reject additional readings |
| Date cannot be in the future | Reject future dates |

Validation is performed on the backend to prevent invalid data from being submitted by bypassing frontend controls.

---

## Reports and Calculations

| Report | Date Range |
|---|---|
| Daily | Selected date |
| Month-to-date | First day of the selected month through the selected date |
| Previous month | Entire previous calendar month |

Each report calculates:

- Highest reading
- Lowest reading
- Average reading
- Total number of readings

**Average calculation:**

`Average = Sum of readings / Number of readings`

The result is rounded to one decimal place.

---

## Project Structure

```text
sweety-blood-glucose-tracker/
│
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   │
│   └── src/
│       ├── App.jsx
│       ├── GlucoseChart.jsx
│       ├── api.js
│       ├── main.jsx
│       └── styles.css
│
├── server/
│   ├── .env.example
│   ├── doctor-setup.sql
│   ├── package.json
│   ├── package-lock.json
│   │
│   ├── src/
│   │   ├── db.js
│   │   ├── index.js
│   │   ├── seed.js
│   │   ├── validation.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── doctor.js
│   │       ├── readings.js
│   │       └── reports.js
│   │
│   └── test/
│       └── validation.test.js
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Install the following:

- Node.js 18 or later
- npm
- PostgreSQL 14 or later
- Git

Verify the installations:

```bash
node --version
npm --version
psql --version
```

---

## Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/supraja-shetty/sweety-blood-glucose-tracker.git
```

Navigate to the project directory:

```bash
cd sweety-blood-glucose-tracker
```

### Step 2: Create the PostgreSQL Database

Open PostgreSQL or pgAdmin and execute:

```sql
CREATE DATABASE sweety;
```

The backend initializes the required database tables when the server starts.

### Step 3: Configure Backend Environment Variables

Navigate to the server folder:

```bash
cd server
```

On Windows:

```cmd
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Configure `server/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/sweety
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Replace `your_password` with your local PostgreSQL password. Use a strong private JWT secret.

### Step 4: Install and Start the Backend

From the `server` directory:

```bash
npm install
npm run dev
```

The backend runs at:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

### Step 5: Configure Frontend Environment Variables

Open another terminal and navigate to the client folder:

```bash
cd client
```

On Windows:

```cmd
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Configure `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 6: Install and Start the Frontend

From the `client` directory:

```bash
npm install
npm run dev
```

Open the Vite URL, normally:

`http://localhost:5173`

Keep both frontend and backend terminals running while using the application.

---

## Environment Variables

### Backend – `server/.env`

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `CLIENT_URL` | Frontend URL allowed by CORS |

### Frontend – `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

**Security:** Actual `.env` files are excluded from Git. Only example environment files are included in the repository.

---

## Demo Account and Seed Data

The project includes a seed script that creates a demo patient account and sample glucose readings.

After configuring the backend environment and initializing the database, run:

```bash
cd server
npm run seed
```

Demo login:

| Field | Value |
|---|---|
| Email | `demo@sweety.test` |
| Password | `SweetyDemo123!` |

The seed script can be executed more than once. It resets the demo account's readings and inserts sample records for the current month.

---

## Doctor Account Setup

To configure a doctor and assign a patient:

1. Start the application and create doctor and patient accounts.
2. Open pgAdmin and connect to the `sweety` database.
3. Open the Query Tool.
4. Open `server/doctor-setup.sql`.
5. Replace the example email addresses with the actual doctor and patient account emails.
6. Execute the SQL statements.

The setup script promotes the selected account to the doctor role and creates the doctor-patient assignment.

Example SQL:

```sql
UPDATE users
SET role = 'doctor'
WHERE email = 'doctor@example.com';

INSERT INTO doctor_patients (doctor_id, patient_id)
SELECT d.id, p.id
FROM users d, users p
WHERE d.email = 'doctor@example.com'
  AND p.email = 'patient@example.com'
  AND d.role = 'doctor'
  AND p.role = 'patient'
ON CONFLICT (doctor_id, patient_id) DO NOTHING;
```

A doctor can access only patients assigned to their account.

---

## API Documentation

All API routes are prefixed with `/api`.

### Authentication

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Register a user |
| POST | `/auth/login` | No | Log in |

### Reading Management

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/readings?page=1&limit=20` | Yes | Get paginated own readings |
| POST | `/readings` | Yes | Create a reading |
| PUT | `/readings/:id` | Yes | Update own reading |
| DELETE | `/readings/:id` | Yes | Delete own reading |

### Reports

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/reports/daily?date=YYYY-MM-DD` | Yes | Get daily report |
| GET | `/reports/month-to-date?date=YYYY-MM-DD` | Yes | Get month-to-date report |
| GET | `/reports/previous-month?date=YYYY-MM-DD` | Yes | Get previous-month report |

### Doctor

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/doctor/patients` | Doctor | List assigned patients |
| GET | `/doctor/patients/:patientId/report` | Doctor | View an assigned patient's report |

Doctor endpoints require authentication, doctor-role authorization and patient-assignment verification.

---

## Testing

The backend includes validation tests using Node.js's built-in test runner.

Run the tests:

```bash
cd server
npm test
```

---

## Database Design

### Users

Stores account and authentication information.

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `name` | User name |
| `email` | Unique email |
| `password_hash` | Hashed password |
| `role` | Patient or doctor |
| `created_at` | Account creation timestamp |

### Readings

Stores patient glucose readings.

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `user_id` | Reference to patient |
| `reading_date` | Reading date |
| `slot` | Daily time slot |
| `value` | Glucose value in mg/dl |
| `created_at` | Creation timestamp |
| `updated_at` | Last update timestamp |

A unique constraint on `(user_id, reading_date, slot)` prevents duplicate readings for the same patient, date and slot.

### Doctor Patients

Stores doctor-patient assignments.

| Column | Purpose |
|---|---|
| `doctor_id` | Reference to doctor |
| `patient_id` | Reference to patient |
| `assigned_at` | Assignment timestamp |

The doctor-patient combination is unique to prevent duplicate assignments.

---

## Notes

### Assumptions
- Maximum four readings per patient per day, one per time slot.
- Glucose values must be between 40 and 600 mg/dl.
- Future dates are not allowed.
- Doctors can access only their assigned patients.

### Future Improvements
- Add frontend and end-to-end testing.
- Improve authentication and application security.


## Author

**Supraja Shetty**

- GitHub: https://github.com/supraja-shetty/
- LinkedIn: https://linkedin.com/in/supraja-shetty-982324268/

---

**Built as a full-stack development assignment using React, Node.js, Express.js and PostgreSQL.**
