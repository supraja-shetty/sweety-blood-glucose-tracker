import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { pool, initializeDatabase } from "./db.js";
dotenv.config();

await initializeDatabase();
try {
  const hash = await bcrypt.hash("SweetyDemo123!", 12);
  const userResult = await pool.query(
    `INSERT INTO users(name,email,password_hash) VALUES('Sweety Demo','demo@sweety.test',$1)
     ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
    [hash]
  );
  const userId = userResult.rows[0].id;
  await pool.query("DELETE FROM readings WHERE user_id=$1", [userId]);
  const today = new Date();
  const date = today.toISOString().slice(0, 10);
  const samples = [
    ["Morning (fasting)", 105],
    ["After breakfast", 142],
    ["After lunch", 136],
    ["After dinner", 128]
  ];
  for (const [slot, value] of samples) {
    await pool.query(
      "INSERT INTO readings(user_id,reading_date,slot,value) VALUES($1,$2,$3,$4)",
      [userId, date, slot, value]
    );
  }
  console.log("Seeded demo@sweety.test / SweetyDemo123!");
} finally {
  await pool.end();
}
