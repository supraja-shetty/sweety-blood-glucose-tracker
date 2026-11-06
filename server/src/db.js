import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.DATABASE_URL?.includes("localhost") ? {} : { ssl: { rejectUnauthorized: false } })
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor'))
    );
    CREATE TABLE IF NOT EXISTS readings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reading_date DATE NOT NULL,
      slot VARCHAR(30) NOT NULL CHECK (slot IN ('Morning (fasting)', 'After breakfast', 'After lunch', 'After dinner')),
      value INTEGER NOT NULL CHECK (value BETWEEN 40 AND 600),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, reading_date, slot)
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'patient';
    CREATE TABLE IF NOT EXISTS doctor_patients (
      doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (doctor_id, patient_id),
      CHECK (doctor_id <> patient_id)
    );
    CREATE INDEX IF NOT EXISTS readings_user_date_idx ON readings(user_id, reading_date);
  `);
}
