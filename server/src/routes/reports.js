import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requirePatient } from "../middleware/auth.js";
import { summarizeReadings } from "../validation.js";

const router = Router();
router.use(requireAuth, requirePatient);

function validDate(date) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

async function report(req, res, start, end, includeSlots = false) {
  const result = await pool.query(
    `SELECT id, reading_date AS date, slot, value FROM readings
     WHERE user_id=$1 AND reading_date >= $2 AND reading_date <= $3
     ORDER BY reading_date ASC, slot ASC`,
    [req.user.id, start, end]
  );
  const readings = result.rows;
  res.json({
    startDate: start, endDate: end,
    ...summarizeReadings(readings),
    ...(includeSlots ? { readings } : {})
  });
}

router.get("/daily", async (req, res, next) => {
  try {
    const date = req.query.date;
    if (!validDate(date)) return res.status(400).json({ error: "Please provide a valid date (YYYY-MM-DD)." });
    await report(req, res, date, date, true);
  } catch (error) { next(error); }
});

router.get("/month-to-date", async (req, res, next) => {
  try {
    const date = req.query.date;
    if (!validDate(date)) return res.status(400).json({ error: "Please provide a valid date (YYYY-MM-DD)." });
    const start = `${date.slice(0, 7)}-01`;
    await report(req, res, start, date);
  } catch (error) { next(error); }
});

router.get("/previous-month", async (req, res, next) => {
  try {
    const date = req.query.date;
    if (!validDate(date)) return res.status(400).json({ error: "Please provide a valid date (YYYY-MM-DD)." });
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - 1);
    const start = d.toISOString().slice(0, 10);
    d.setUTCMonth(d.getUTCMonth() + 1);
    d.setUTCDate(0);
    const end = d.toISOString().slice(0, 10);
    await report(req, res, start, end);
  } catch (error) { next(error); }
});

export default router;
