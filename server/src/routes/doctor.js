import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireDoctor } from "../middleware/auth.js";
import { summarizeReadings } from "../validation.js";

const router = Router();
router.use(requireAuth, requireDoctor);

// A doctor can see only patients explicitly assigned to their account.
router.get("/patients", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM doctor_patients dp JOIN users u ON u.id = dp.patient_id
       WHERE dp.doctor_id = $1 AND u.role = 'patient'
       ORDER BY u.name`, [req.user.id]
    );
    res.json({ patients: result.rows });
  } catch (error) { next(error); }
});

router.get("/patients/:patientId/report", async (req, res, next) => {
  try {
    const patientId = Number.parseInt(req.params.patientId, 10);
    if (!Number.isInteger(patientId) || patientId < 1) return res.status(400).json({ error: "Invalid patient." });
    const assigned = await pool.query(
      `SELECT 1 FROM doctor_patients WHERE doctor_id=$1 AND patient_id=$2`,
      [req.user.id, patientId]
    );
    if (!assigned.rowCount) return res.status(403).json({ error: "This patient is not assigned to your account." });
    const readings = await pool.query(
      `SELECT id, reading_date AS date, slot, value FROM readings
       WHERE user_id=$1 ORDER BY reading_date DESC, slot ASC`, [patientId]
    );
    res.json({ readings: readings.rows, ...summarizeReadings(readings.rows) });
  } catch (error) { next(error); }
});

export default router;
