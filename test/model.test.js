// Unit tests for the Peace Clock calculations. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { SEC_PER_YEAR } from "clock-core";
import { spendingEntry, isRecord, daysToPay, deathsEntry, topPlaces, risingCount, oneEvery } from "../js/model.js";

test("spendingEntry projects the latest year-on-year change", () => {
  const e = spendingEntry({ 2024: 100, 2025: 110 }, 1, 0.25);
  assert.equal(e.lastYear, 2025);
  assert.ok(Math.abs(e.growth - 0.1) < 1e-9);
});

test("isRecord: only when the latest year beats every earlier one", () => {
  assert.equal(isRecord({ 2023: 1, 2024: 2, 2025: 3 }), true);
  assert.equal(isRecord({ 2023: 5, 2024: 2, 2025: 3 }), false);
  assert.equal(isRecord({ 2025: 3 }), false);
});

test("daysToPay: the UN appeal against a day of world military spending", () => {
  const days = daysToPay(2.85e12, 33e9);
  assert.ok(days > 4 && days < 4.4, String(days));
  assert.equal(daysToPay(0, 1), Infinity);
});

test("deathsEntry ignores the current, partial year", () => {
  const d = deathsEntry({ 2024: 187000, 2025: 245000, 2026: 108000 }, 2026);
  assert.deepEqual([d?.lastYear, d?.last, d?.prev], [2025, 245000, 187000]);
  assert.ok(Math.abs((d?.perSecond ?? 0) - 245000 / SEC_PER_YEAR) < 1e-9);
  assert.equal(deathsEntry({ 2026: 5 }, 2026), null);
  assert.equal(deathsEntry({ 2025: 5 }, 2026)?.prev, null);
});

test("topPlaces: most deaths first, latest complete year only, no zero rows", () => {
  const top = topPlaces({ A: { 2024: 10, 2025: 50 }, B: { 2025: 80 }, C: { 2025: 0 }, D: { 2023: 999 }, E: { 2026: 999 } }, 5, 2026);
  assert.deepEqual(top.map((p) => p.code), ["B", "A"]);
  assert.equal(top[1].prev, 10);
  assert.equal(topPlaces({ A: { 2025: 1 }, B: { 2025: 2 } }, 1, 2026).length, 1);
});

test("risingCount judges growth as displayed", () => {
  assert.equal(risingCount([{ growth: 0.02 }, { growth: -0.01 }, { growth: 0.0004 }]), 1);   // +0.04% shows as 0.0%
});

test("oneEvery: minutes for slow paces, seconds for fast ones", () => {
  assert.deepEqual(oneEvery(245000), { unit: "min", n: 2 });
  assert.deepEqual(oneEvery(1e6), { unit: "sec", n: 32 });
});
