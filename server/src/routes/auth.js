import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();
const makeToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users(name, email, password_hash) VALUES($1, $2, $3) RETURNING id, name, email, role",
      [name.trim(), normalizedEmail, passwordHash]
    );
    const user = result.rows[0];
    res.status(201).json({ token: makeToken(user), user });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "An account with this email already exists." });
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
    const result = await pool.query("SELECT id, name, email, password_hash, role FROM users WHERE email = $1", [email.trim().toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    res.json({ token: makeToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { next(error); }
});

export default router;
