import React, { useState, useEffect, useMemo } from "react";
import api, { errorMessage } from "./api";

const SLOTS = [
  "Morning (fasting)",
  "After breakfast",
  "After lunch",
  "After dinner"
];

// Get today's date using the computer's local timezone
const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Convert database dates into local YYYY-MM-DD format
const dateOnly = (value) => {
  if (!value) return "";

  // If already in YYYY-MM-DD format, return directly
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const blankForm = () => ({
  date: today(),
  slot: SLOTS[0],
  value: ""
});

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const { data } = await api.post(`/auth/${mode}`, form);

      if (mode === "register") {
        // After sign up, show the login page (keep the email filled in)
        setMode("login");
        setForm({ name: "", email: form.email, password: "" });
        setNotice("Account created successfully. Please log in.");
      } else {
        // After login, open the dashboard
        onLogin(data);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="brand-mark">♥</div>

        <p className="eyebrow">
          YOUR HEALTH, YOUR INSIGHTS
        </p>

        <h1>
          {mode === "login"
            ? "Welcome back"
            : "Create your account"}
        </h1>

        <p className="muted">
          A simple space to record your readings and stay informed about your daily patterns.
        </p>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Your name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              minLength="8"
              required
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="At least 8 characters"
            />
          </label>

          {error && <p className="error">{error}</p>}

          {notice && <div className="alert success">{notice}</div>}

          <button className="primary full" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>

        <p className="switch">
          {mode === "login"
            ? "New to Sweety?"
            : "Already have an account?"}

          {" "}

          <button
            type="button"
            className="text-button"
            onClick={() => {
              setMode(
                mode === "login" ? "register" : "login"
              );
              setError("");
              setNotice("");
            }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </section>
    </main>
  );
}

function Stat({ label, value, unit = "" }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>
        {value ?? "—"}
        {value !== null && value !== undefined ? unit : ""}
      </strong>
    </div>
  );
}


function DoctorDashboard({ user, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/doctor/patients")
      .then(({ data }) => setPatients(data.patients || []))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const openReport = async (patient) => {
    setSelected(patient); setReport(null); setError("");
    try {
      const { data } = await api.get(`/doctor/patients/${patient.id}/report`);
      setReport(data);
    } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span>♥</span> sweety</a>
        <div className="top-actions"><span className="welcome">Dr. {user.name}</span><button className="outline small" onClick={onLogout}>Log out</button></div>
      </header>
      <main className="container">
        <section className="hero"><div><p className="eyebrow">DOCTOR PORTAL</p><h1>Assigned patients</h1><p className="muted">View reports only for patients assigned to your account.</p></div><div className="hero-heart">♥</div></section>
        {error && <div className="alert error">{error}</div>}
        <section className="panel">
          <div className="section-heading"><div><p className="eyebrow">PATIENT LIST</p><h2>Your patients</h2></div><span className="muted">{patients.length} assigned</span></div>
          {loading ? <p className="empty">Loading patients…</p> : patients.length === 0 ? <p className="empty">No patients have been assigned yet.</p> : (
            <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Email</th><th>Action</th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id}><td>{patient.name}</td><td>{patient.email}</td><td><button className="text-button" onClick={() => openReport(patient)}>View report</button></td></tr>)}</tbody></table></div>
          )}
        </section>
        {selected && <section className="panel"><div className="section-heading"><div><p className="eyebrow">PATIENT REPORT</p><h2>{selected.name}</h2><p className="muted">{selected.email}</p></div></div>
          {!report ? <p className="empty">Loading report…</p> : report.readings.length === 0 ? <p className="empty">No readings available for this patient.</p> : <div className="table-wrap"><table><thead><tr><th>Date</th><th>Time slot</th><th>Value</th></tr></thead><tbody>{report.readings.map((r) => <tr key={r.id}><td>{dateOnly(r.date)}</td><td>{r.slot}</td><td><strong>{r.value} mg/dl</strong></td></tr>)}</tbody></table></div>}
        </section>}
      </main>
      <footer className="footer">Sweety · Patient information is limited to assigned patients</footer>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("sweety_token");
    const user = localStorage.getItem("sweety_user");

    try {
      return token && user
        ? { token, user: JSON.parse(user) }
        : null;
    } catch {
      return null;
    }
  });

  const [readings, setReadings] = useState([]);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const [form, setForm] = useState(blankForm());
  const [editing, setEditing] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today());

  const [daily, setDaily] = useState(null);
  const [mtd, setMtd] = useState(null);
  const [previous, setPrevious] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (data) => {
    localStorage.setItem("sweety_token", data.token);
    localStorage.setItem(
      "sweety_user",
      JSON.stringify(data.user)
    );

    setSession({
      token: data.token,
      user: data.user
    });
  };

  const logout = () => {
    localStorage.removeItem("sweety_token");
    localStorage.removeItem("sweety_user");

    setSession(null);
    setReadings([]);
    setDaily(null);
    setMtd(null);
    setPrevious(null);
    setForm(blankForm());
    setEditing(null);
  };

  // Load readings and reports
  async function loadAll() {
    if (!session) return;

    setLoading(true);
    setError("");

    try {
      const [r, d, m, p] = await Promise.all([
        api.get(`/readings?page=${page}&limit=20`),
        api.get(`/reports/daily?date=${selectedDate}`),
        api.get(`/reports/month-to-date?date=${selectedDate}`),
        api.get(`/reports/previous-month?date=${selectedDate}`)
      ]);

      setReadings(r.data.readings || []);
      setPagination(r.data.pagination);

      setDaily(d.data);
      setMtd(m.data);
      setPrevious(p.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [session, selectedDate, page]);

  // Format selected date for display
  const dailyLabel = useMemo(() => {
    return new Date(
      `${selectedDate}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }, [selectedDate]);

  // Add or update a reading
  const saveReading = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    try {
      if (editing) {
        await api.put(`/readings/${editing}`, form);
      } else {
        await api.post("/readings", form);
      }

      setNotice(
        editing
          ? "Reading updated successfully."
          : "Reading added successfully."
      );

      setForm(blankForm());
      setEditing(null);

      await loadAll();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  // Edit a reading
  const editReading = (r) => {
    setEditing(r.id);

    setForm({
      date: dateOnly(r.date),
      slot: r.slot,
      value: String(r.value)
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete a reading
  const deleteReading = async (id) => {
    if (!window.confirm("Delete this reading?")) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await api.delete(`/readings/${id}`);

      setNotice("Reading deleted successfully.");

      await loadAll();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  // Daily readings come from the daily report (independent of the history page)
  const dailyRows = daily?.readings || [];

  if (!session) {
    return <Auth onLogin={handleLogin} />;
  }

  if (session.user.role === "doctor") {
    return <DoctorDashboard user={session.user} onLogout={logout} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span>♥</span> sweety
        </a>

        <div className="top-actions">
          <span className="welcome">
            Hi, {session.user.name}
          </span>

          <button
            className="outline small"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">
              YOUR HEALTH, YOUR INSIGHTS
            </p>

            <h1>Track Better. Live Healthier.</h1>

            <p className="muted">
              Keep your glucose readings organized and discover your daily health trends.
            </p>
          </div>

          <div className="hero-heart">♥</div>
        </section>

        {error && (
          <div className="alert error">{error}</div>
        )}

        {notice && (
          <div className="alert success">{notice}</div>
        )}

        {/* Add Reading Form */}
        <section className="panel form-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DAILY ENTRY</p>

              <h2>
                {editing ? "Edit reading" : "Add a reading"}
              </h2>
            </div>

            <span className="pill">mg/dl</span>
          </div>

          <form
            className="reading-form"
            onSubmit={saveReading}
          >
            <label>
              Date

              <input
                type="date"
                max={today()}
                required
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value
                  })
                }
              />
            </label>

            <label>
              Time slot

              <select
                value={form.slot}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slot: e.target.value
                  })
                }
              >
                {SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Glucose value

              <input
                type="number"
                min="40"
                max="600"
                step="1"
                required
                value={form.value}
                placeholder="e.g. 110"
                onChange={(e) =>
                  setForm({
                    ...form,
                    value: e.target.value
                  })
                }
              />
            </label>

            <div className="form-buttons">
              <button className="primary">
                {editing ? "Save changes" : "Add reading"}
              </button>

              {editing && (
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    setEditing(null);
                    setForm(blankForm());
                    setError("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Reports */}
        <section className="report-section">
          <div className="section-heading report-heading">
            <div>
              <p className="eyebrow">YOUR OVERVIEW</p>
              <h2>Reports</h2>
            </div>

            <label className="date-select">
              Selected date

              <input
                type="date"
                max={today()}
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(e.target.value)
                }
              />
            </label>
          </div>

          <div className="report-grid">
            <ReportCard
              title={`Daily · ${dailyLabel}`}
              data={daily}
            />

            <ReportCard
              title="Month to date"
              subtitle={`${mtd?.startDate || "—"} – ${mtd?.endDate || "—"}`}
              data={mtd}
            />

            <ReportCard
              title="Previous month"
              subtitle={`${previous?.startDate || "—"} – ${previous?.endDate || "—"}`}
              data={previous}
            />
          </div>

          {/* Monthly Glucose Chart */}
          <GlucoseChart
            readings={readings}
            selectedDate={selectedDate}
          />
        </section>

        {/* Reading History */}
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">READING HISTORY</p>
              <h2>All readings</h2>
            </div>

            <span className="muted">
              {pagination.totalItems} total readings
            </span>
          </div>

          {loading ? (
            <p className="empty">Loading your readings…</p>
          ) : readings.length === 0 ? (
            <div className="empty">
              <span>♡</span>
              <strong>No readings recorded yet</strong>
              <p>Add your first reading above to get started.</p>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time slot</th>
                      <th>Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {readings.map((r) => (
                      <tr key={r.id}>
                        <td>{dateOnly(r.date)}</td>
                        <td>{r.slot}</td>

                        <td>
                          <strong>{r.value} mg/dl</strong>
                        </td>

                        <td className="row-actions">
                          <button
                            className="text-button"
                            onClick={() => editReading(r)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => deleteReading(r.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="pagination">
                <button
                  className="outline small"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((current) => current - 1)}
                >
                  ← Previous
                </button>

                <span>
                  Page {pagination.page} of{" "}
                  {Math.max(pagination.totalPages, 1)}
                </span>

                <button
                  className="outline small"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </section>

        <footer>
          Your daily health journal · Sweety
        </footer>
      </main>
    </div>
  );
}

// Report Card Component
function ReportCard({ title, subtitle, data }) {
  return (
    <article className="report-card">
      <div className="report-card-title">
        <h3>{title}</h3>

        {subtitle && <small>{subtitle}</small>}
      </div>

      {!data || data.count === 0 ? (
        <p className="report-empty">
          No readings in this period.
        </p>
      ) : (
        <>
          <div className="stats">
            <Stat
              label="Highest"
              value={data.highest}
            />

            <Stat
              label="Lowest"
              value={data.lowest}
            />

            <Stat
              label="Average"
              value={data.average}
            />
          </div>

          <p className="count">
            {data.count} reading
            {data.count === 1 ? "" : "s"}
          </p>
        </>
      )}
    </article>
  );
}
// Monthly Glucose Chart Component (plain SVG - no extra packages needed)
const SLOT_COLORS = ["#e11d48", "#f59e0b", "#0ea5e9", "#7c3aed"];

function GlucoseChart({ readings, selectedDate }) {
  const [year, month] = selectedDate.split("-").map(Number);
  const monthKey = selectedDate.slice(0, 7); // YYYY-MM
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" }
  );

  // Only the readings that belong to the selected month
  const points = readings
    .map((r) => {
      const date = dateOnly(r.date);

      return {
        date,
        day: Number(date.slice(8, 10)),
        slot: r.slot,
        value: Number(r.value)
      };
    })
    .filter((p) => p.date.slice(0, 7) === monthKey);

  // Chart size and spacing
  const W = 720;
  const H = 320;
  const m = { top: 20, right: 20, bottom: 40, left: 48 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;

  const values = points.map((p) => p.value);
  const yMin = points.length
    ? Math.max(0, Math.floor((Math.min(...values) - 10) / 10) * 10)
    : 0;
  const yMax = points.length
    ? Math.ceil((Math.max(...values) + 10) / 10) * 10
    : 100;

  const x = (day) =>
    daysInMonth === 1
      ? m.left + innerW / 2
      : m.left + ((day - 1) / (daysInMonth - 1)) * innerW;

  const y = (value) =>
    m.top + (1 - (value - yMin) / (yMax - yMin)) * innerH;

  const yTicks = Array.from(
    { length: 5 },
    (_, i) => Math.round(yMin + ((yMax - yMin) * i) / 4)
  );

  const xTicks = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  ).filter((d) => d === 1 || d % 5 === 0);

  const selectedDay = Number(selectedDate.slice(8, 10));

  return (
    <section className="panel" style={{ marginTop: "1.25rem" }}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">MONTHLY TREND</p>
          <h2>Monthly glucose chart</h2>
        </div>

        <span className="muted">{monthLabel}</span>
      </div>

      {points.length === 0 ? (
        <div className="empty">
          <span>♡</span>

          <strong>No readings this month yet</strong>

          <p>Add a reading to see your glucose chart.</p>
        </div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Line chart of glucose readings for ${monthLabel}`}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            {/* Horizontal grid lines and Y axis labels */}
            {yTicks.map((t) => (
              <g key={t}>
                <line
                  x1={m.left}
                  x2={W - m.right}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="currentColor"
                  strokeOpacity="0.12"
                />
                <text
                  x={m.left - 8}
                  y={y(t) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="currentColor"
                  fillOpacity="0.65"
                >
                  {t}
                </text>
              </g>
            ))}

            {/* X axis labels (days of the month) */}
            {xTicks.map((d) => (
              <text
                key={d}
                x={x(d)}
                y={H - m.bottom + 18}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                fillOpacity="0.65"
              >
                {d}
              </text>
            ))}

            <text
              x={m.left + innerW / 2}
              y={H - 6}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
              fillOpacity="0.65"
            >
              Day of month
            </text>

            <text
              x={12}
              y={m.top + innerH / 2}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
              fillOpacity="0.65"
              transform={`rotate(-90 12 ${m.top + innerH / 2})`}
            >
              mg/dl
            </text>

            {/* Selected date marker */}
            <line
              x1={x(selectedDay)}
              x2={x(selectedDay)}
              y1={m.top}
              y2={m.top + innerH}
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeDasharray="4 4"
            />

            {/* One line per time slot */}
            {SLOTS.map((slot, i) => {
              const slotPoints = points
                .filter((p) => p.slot === slot)
                .sort((a, b) => a.day - b.day);

              return (
                <g key={slot}>
                  {slotPoints.length > 1 && (
                    <polyline
                      fill="none"
                      stroke={SLOT_COLORS[i]}
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={slotPoints
                        .map((p) => `${x(p.day)},${y(p.value)}`)
                        .join(" ")}
                    />
                  )}

                  {slotPoints.map((p) => (
                    <circle
                      key={`${p.date}-${p.slot}`}
                      cx={x(p.day)}
                      cy={y(p.value)}
                      r="4"
                      fill={SLOT_COLORS[i]}
                    >
                      <title>
                        {`${p.date} · ${slot}: ${p.value} mg/dl`}
                      </title>
                    </circle>
                  ))}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem 1.25rem",
              marginTop: "0.75rem",
              fontSize: "0.85rem"
            }}
          >
            {SLOTS.map((slot, i) => (
              <span
                key={slot}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}
              >
                <span
                  style={{
                    width: "0.75rem",
                    height: "0.75rem",
                    borderRadius: "50%",
                    background: SLOT_COLORS[i],
                    display: "inline-block"
                  }}
                />
                {slot}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
