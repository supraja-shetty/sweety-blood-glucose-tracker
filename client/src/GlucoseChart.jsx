
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function GlucoseChart({ readings, selectedDate }) {
  const chartData = useMemo(() => {
    const [year, month] = selectedDate.split("-").map(Number);

    const monthReadings = readings.filter((r) => {
      const date = String(r.date).slice(0, 10);
      return date.startsWith(
        `${year}-${String(month).padStart(2, "0")}`
      );
    });

    const grouped = {};

    monthReadings.forEach((r) => {
      const date = String(r.date).slice(0, 10);

      if (!grouped[date]) {
        grouped[date] = {
          date,
          total: 0,
          count: 0
        };
      }

      grouped[date].total += Number(r.value);
      grouped[date].count += 1;
    });

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        date: new Date(
          `${item.date}T00:00:00`
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short"
        }),
        average: Number(
          (item.total / item.count).toFixed(1)
        )
      }));
  }, [readings, selectedDate]);

  return (
    <section className="panel chart-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MONTHLY OVERVIEW</p>
          <h2>Glucose trends</h2>
          <p className="muted">
            Average of recorded readings for each day
          </p>
        </div>
        <span className="pill">mg/dl</span>
      </div>

      {chartData.length === 0 ? (
        <div className="empty">
          No readings available for this month.
        </div>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{
                top: 15,
                right: 20,
                left: 5,
                bottom: 10
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip
                formatter={(value) => [
                  `${value} mg/dl`,
                  "Daily average"
                ]}
              />

              <Line
                type="monotone"
                dataKey="average"
                stroke="#245b50"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default GlucoseChart;
