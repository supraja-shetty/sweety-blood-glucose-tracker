
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requirePatient } from "../middleware/auth.js";
import { validateReading } from "../validation.js";

const router = Router();
router.use(requireAuth, requirePatient);

// GET readings with pagination
router.get("/", async (req, res, next) => {
  try {
    const requestedPage = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    // Count only the logged-in user's readings
    const countResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM readings WHERE user_id=$1",
      [req.user.id]
    );

    const totalItems = countResult.rows[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    const page = Math.min(
      requestedPage,
      Math.max(totalPages, 1)
    );

    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, reading_date AS date, slot, value
       FROM readings
       WHERE user_id=$1
       ORDER BY reading_date DESC, slot ASC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      readings: result.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// Add reading
router.post("/", async (req, res, next) => {
  const validationError = validateReading(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "SELECT pg_advisory_xact_lock($1, hashtext($2))",
      [req.user.id, req.body.date]
    );

    const count = await client.query(
      `SELECT COUNT(*)::int AS count
       FROM readings
       WHERE user_id=$1 AND reading_date=$2`,
      [req.user.id, req.body.date]
    );

    if (count.rows[0].count >= 4) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "You can add only 4 readings per day."
      });
    }

    const result = await client.query(
      `INSERT INTO readings(user_id, reading_date, slot, value)
       VALUES($1,$2,$3,$4)
       RETURNING id, reading_date AS date, slot, value`,
      [
        req.user.id,
        req.body.date,
        req.body.slot,
        Number(req.body.value)
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      reading: result.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        error: `You already have an ${req.body.slot} reading for this date.`
      });
    }

    next(error);
  } finally {
    client.release();
  }
});

// Update reading
router.put("/:id", async (req, res, next) => {
  const validationError = validateReading(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await pool.query(
      `UPDATE readings
       SET reading_date=$1, slot=$2, value=$3, updated_at=NOW()
       WHERE id=$4 AND user_id=$5
       RETURNING id, reading_date AS date, slot, value`,
      [
        req.body.date,
        req.body.slot,
        Number(req.body.value),
        req.params.id,
        req.user.id
      ]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: "Reading not found."
      });
    }

    res.json({ reading: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: `You already have an ${req.body.slot} reading for this date.`
      });
    }

    next(error);
  }
});

// Delete reading
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM readings WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: "Reading not found."
      });
    }

    res.json({ message: "Reading deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
