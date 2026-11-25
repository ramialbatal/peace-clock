// Unit tests for the plain-language messages. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { headline, appealStatus, livesStatus, rearmStatus, spendBadge, placeBadge, about } from "../js/messages.js";

test("headline: rising spending is bad, with 'record' only when it is one", () => {
  const m = headline(0.029, true);
  assert.deepEqual([m.tone, m.title], ["bad", "The world is spending more on armies and weapons"]);
  assert.equal(m.text, "Military spending rose 2.9% in the latest year, to the highest level ever recorded.");
  assert.equal(headline(0.029, false).text, "Military spending rose 2.9% in the latest year.");
  assert.equal(headline(-0.01, false).title, "Military spending is falling");
  assert.equal(headline(0.0004, false).title, "Military spending isn't falling");   // +0.04% shows as 0.0%
});

test("appealStatus: days of military spending that equal the UN appeal", () => {
  const m = appealStatus(4.23, "$33 billion", 2026);
  assert.equal(m.title, "4.2 days");
  assert.equal(m.text, "That's how long it takes the world's armies to spend as much as the UN's whole aid appeal for 2026: $33 billion.");
  assert.equal(appealStatus(12.4, "$33 billion", 2026).title, "12 days");
});

test("livesStatus compares the counts as displayed (rounded to the thousand)", () => {
  const up = livesStatus(244579, 187023, 2025);
  assert.deepEqual([up.tone, up.title], ["bad", "More lives lost"]);
  assert.equal(up.text, "About 245,000 people were killed in wars in 2025, up from 187,000 the year before.");
  assert.equal(livesStatus(150000, 187023, 2025).tone, "warn");
  assert.equal(livesStatus(187200, 186900, 2025).title, "As many lives lost");   // both show as 187,000
  assert.equal(about(4475), "4,475");
});

test("rearmStatus: most, some or none of the biggest spenders spending more", () => {
  assert.deepEqual([rearmStatus(12, 18).tone, rearmStatus(12, 18).title], ["bad", "Most are spending more"]);
  assert.equal(rearmStatus(12, 18).text, "12 of the 18 biggest spenders raised their military budgets in the latest year.");
  assert.equal(rearmStatus(4, 18).tone, "warn");
  assert.equal(rearmStatus(0, 18).tone, "ok");
});

test("badges: spending more is bad; more deaths is bad", () => {
  assert.deepEqual(spendBadge(0.05), { tone: "bad", label: "▲ Spending more" });
  assert.deepEqual(spendBadge(-0.05), { tone: "ok", label: "▼ Spending less" });
  assert.deepEqual(spendBadge(null), { tone: "", label: "" });
  assert.deepEqual(placeBadge(90000, 60000), { tone: "bad", label: "▲ More deaths" });
  assert.deepEqual(placeBadge(4000, 9000), { tone: "ok", label: "▼ Fewer deaths" });
  assert.deepEqual(placeBadge(500, null), { tone: "bad", label: "▲ New fighting" });
});
