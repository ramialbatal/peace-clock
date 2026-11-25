// @ts-check
/**
 * Peace Clock: the plain-language messages shown to visitors. Pure functions, unit tested.
 * Every message has a tone ("ok", "warn" or "bad": green, amber or red), a short title and, where useful, one
 * sentence. Keep them short, concrete and free of jargon; numbers and method details belong behind "More".
 */
import { shown, shownSign, fmt, pct, message, t, addStrings } from "clock-core";
import en from "./i18n/en.js";

addStrings("en", en);   // the English words; app.js adds the visitor's language on top

/** @typedef {import("clock-core").Tone} Tone */
/** @typedef {import("clock-core").Message} Message */

/** A count of people rounded for a sentence: 244,579 becomes 245,000. @param {number} n */
export const rounded = (n) => (n >= 10000 ? Math.round(n / 1000) * 1000 : Math.round(n));
/** The rounded count, formatted: "245,000". @param {number} n */
export const about = (n) => fmt[0].format(rounded(n));

/**
 * The one-line answer at the top, from the world's military spending trend.
 * @param {number} growth   latest yearly change (0.029 = +2.9%)
 * @param {boolean} record  the latest year is the highest on record
 * @returns {Message}
 */
export function headline(growth, record) {
  const s = shownSign(growth * 100, 1), p = pct(Math.abs(growth * 100), 1);
  if (s > 0) return message("bad", t("msg.head.up.t"), t(record ? "msg.head.record.x" : "msg.head.up.x", { pct: p }));
  if (s < 0) return message("warn", t("msg.head.down.t"), t("msg.head.down.x", { pct: p }));
  return message("warn", t("msg.head.flat.t"), t("msg.head.flat.x"));
}

/**
 * What the money could pay for: days of military spending that would cover the UN's humanitarian appeal.
 * @param {number} days
 * @param {string} usd    the appeal, already formatted ("$33 billion")
 * @param {number} year   the appeal's year
 * @returns {Message}
 */
export function appealStatus(days, usd, year) {
  const d = shown(days, days < 10 ? 1 : 0);
  return message("bad", t("msg.appeal.t", { days: fmt[days < 10 ? 1 : 0].format(d) }), t("msg.appeal.x", { usd, year }));
}

/**
 * Lives lost to war: the latest complete year against the year before.
 * @param {number} last
 * @param {number | null} prev
 * @param {number} year  the latest complete year
 * @returns {Message}
 */
export function livesStatus(last, prev, year) {
  const n = about(last);
  if (prev == null) return message("bad", t("msg.lives.t", { n }), t("msg.lives.x", { year }));
  const s = Math.sign(rounded(last) - rounded(prev));   // compared as displayed
  if (s > 0) return message("bad", t("msg.lives.up.t"), t("msg.lives.up.x", { n, year, m: about(prev) }));
  if (s < 0) return message("warn", t("msg.lives.down.t"), t("msg.lives.down.x", { n, year, m: about(prev) }));
  return message("bad", t("msg.lives.same.t"), t("msg.lives.same.x", { n, year }));
}

/**
 * Are the biggest spenders rearming? From how many spent more in the latest year.
 * @param {number} rising
 * @param {number} total
 * @returns {Message}
 */
export function rearmStatus(rising, total) {
  const text = t("msg.rearm.x", { n: rising, total });
  if (rising * 2 > total) return message("bad", t("msg.rearm.most"), text);
  if (rising > 0) return message("warn", t("msg.rearm.some"), text);
  return message("ok", t("msg.rearm.none"), text);
}

/**
 * Badge on a spender's card: spending more is bad, less is good, as displayed.
 * @param {number | null} growth
 * @returns {{ tone: Tone | "", label: string }}
 */
export function spendBadge(growth) {
  if (growth == null) return { tone: "", label: "" };
  const s = shownSign(growth * 100, 1);
  return s > 0 ? { tone: "bad", label: t("msg.badge.more") } : s < 0 ? { tone: "ok", label: t("msg.badge.less") } : { tone: "warn", label: t("msg.badge.steady") };
}

/**
 * Badge for a place where war kills: more deaths than the year before is bad.
 * @param {number} last
 * @param {number | null} prev
 * @returns {{ tone: Tone | "", label: string }}
 */
export function placeBadge(last, prev) {
  if (prev == null || prev === 0) return { tone: "bad", label: t("msg.place.new") };
  const s = shownSign((last / prev - 1) * 100, 0);
  return s > 0 ? { tone: "bad", label: t("msg.place.up") } : s < 0 ? { tone: "ok", label: t("msg.place.down") } : { tone: "warn", label: t("msg.badge.steady") };
}
