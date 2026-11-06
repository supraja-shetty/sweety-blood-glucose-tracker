export const SLOTS = [
  "Morning (fasting)",
  "After breakfast",
  "After lunch",
  "After dinner"
];

export function validateReading({ date, slot, value }) {
  if (value === undefined || value === null || value === "") {
    return "Please enter a glucose value.";
  }
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 40 || numericValue > 600) {
    return "Value must be between 40 and 600 mg/dl.";
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Please enter a valid date.";
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return "Please enter a valid date.";
  }
  const today = new Date().toISOString().slice(0, 10);
  if (date > today) return "Date cannot be in the future.";
  if (!SLOTS.includes(slot)) return "Please select a valid time slot.";
  return null;
}

export function summarizeReadings(readings) {
  if (!readings.length) return { highest: null, lowest: null, average: null, count: 0 };
  const values = readings.map((r) => Number(r.value));
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: Number((sum / values.length).toFixed(1)),
    count: values.length
  };
}
