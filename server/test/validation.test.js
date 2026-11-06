import test from "node:test";
import assert from "node:assert/strict";
import { validateReading, summarizeReadings } from "../src/validation.js";

const today = new Date().toISOString().slice(0, 10);
const valid = { date: today, slot: "Morning (fasting)", value: 100 };

test("accepts a valid reading", () => {
  assert.equal(validateReading(valid), null);
});
test("requires a glucose value", () => {
  assert.equal(validateReading({ ...valid, value: "" }), "Please enter a glucose value.");
});
test("rejects values outside 40 to 600 and decimals", () => {
  assert.match(validateReading({ ...valid, value: 39 }), /between 40 and 600/);
  assert.match(validateReading({ ...valid, value: 600.5 }), /between 40 and 600/);
});
test("rejects future dates", () => {
  assert.equal(validateReading({ ...valid, date: "2999-01-01" }), "Date cannot be in the future.");
});
test("calculates report summary", () => {
  assert.deepEqual(summarizeReadings([{ value: 100 }, { value: 121 }, { value: 110 }]),
    { highest: 121, lowest: 100, average: 110.3, count: 3 });
});
test("returns an empty report summary", () => {
  assert.deepEqual(summarizeReadings([]), { highest: null, lowest: null, average: null, count: 0 });
});
