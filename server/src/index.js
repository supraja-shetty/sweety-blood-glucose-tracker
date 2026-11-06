import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import readingRoutes from "./routes/readings.js";
import reportRoutes from "./routes/reports.js";
import doctorRoutes from "./routes/doctor.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/doctor", doctorRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

const port = process.env.PORT || 5000;
initializeDatabase()
  .then(() => app.listen(port, () => console.log(`Sweety API running on port ${port}`)))
  .catch((error) => { console.error("Database initialization failed:", error); process.exit(1); });
