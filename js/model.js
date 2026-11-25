// @ts-check
/**
 * Peace Clock calculations. Pure functions (no page, no network), unit tested in test/model.test.js.
 * Spending uses clock-core's projection (latest year-on-year change, capped). Deaths are never projected with a
 * trend: the clock assumes this year continues at the pace of the latest complete year.
 */
import { project, shownSign, SEC_PER_YEAR, YEAR } from "clock-core";

/** @typedef {import("clock-core").Series} Series */

/**
 * Military spending for one place: clock-core's projection to this year.
 * @param {Series} series  constant US dollars by year
 * @param {number} trendYears
 * @param {number} maxGrowth
 */
export const spendingEntry = (series, trendYears, maxGrowth) => project(series, trendYears, maxGrowth);

/**
 * True when the latest year is the highest on record.
 * @param {Series} series
 */
export function isRecord(series) {
  const years = Object.keys(series).map(Number).sort((a, b) => a - b);
  if (years.length < 2) return false;
  const last = series[years[years.length - 1]];
  return years.slice(0, -1).every((y) => series[y] < last);
}

/**
 * How many days of the world's military spending pay for a sum (the UN's yearly humanitarian appeal).
 * @param {number} annual  world military spending this year, US dollars
 * @param {number} usd     the sum to pay for
 */
export const daysToPay = (annual, usd) => (annual > 0 ? usd / (annual / (SEC_PER_YEAR / 86400)) : Infinity);

/**
 * Deaths in armed conflicts for one place, from complete years only (the current year's figure is partial).
 * @param {Series} series  deaths by year
 * @param {number} [year]  the current year
 * @returns {{ lastYear: number, last: number, prev: number | null, perSecond: number } | null}
 */
export function deathsEntry(series, year = YEAR) {
  const years = Object.keys(series).map(Number).filter((y) => y < year).sort((a, b) => a - b);
  if (!years.length) return null;
  const lastYear = years[years.length - 1], last = series[lastYear];
  const prev = series[lastYear - 1] ?? null;
  return { lastYear, last, prev, perSecond: last / SEC_PER_YEAR };
}

/**
 * The places where the most people were killed in the latest complete year, most first.
 * @param {Record<string, Series>} byCode  deaths by place code (world and regions left out by the caller)
 * @param {number} n
 * @param {number} [year]
 */
export function topPlaces(byCode, n, year = YEAR) {
  const entries = Object.entries(byCode).map(([code, s]) => ({ code, d: deathsEntry(s, year) }));
  const lastYear = Math.max(...entries.map((e) => e.d?.lastYear ?? 0));
  return entries
    .filter((e) => e.d && e.d.lastYear === lastYear && e.d.last > 0)
    .map((e) => ({ code: e.code, ...(/** @type {NonNullable<ReturnType<typeof deathsEntry>>} */ (e.d)) }))
    .sort((a, b) => b.last - a.last)
    .slice(0, n);
}

/**
 * How many places spent more in the latest year than the year before, judged as displayed (one decimal of %).
 * @param {{ growth: number }[]} entries
 */
export const risingCount = (entries) => entries.filter((e) => shownSign(e.growth * 100, 1) > 0).length;

/**
 * Seconds between two deaths at a yearly pace, rounded for display as minutes when over a minute.
 * @param {number} perYear
 * @returns {{ unit: "min" | "sec", n: number }}
 */
export function oneEvery(perYear) {
  const sec = SEC_PER_YEAR / perYear;
  return sec >= 90 ? { unit: "min", n: Math.round(sec / 60) } : { unit: "sec", n: Math.max(1, Math.round(sec)) };
}
