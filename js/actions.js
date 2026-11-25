// @ts-check
/**
 * "What can I do?": three actions behind a button under the answer (clock-core wireActions). One for everyday life,
 * one close to home, one to ask of leaders. Each has a source; its words are the act.<key>.t / act.<key>.x keys in
 * js/i18n/*.js (every language). Keep claims to what the source says.
 */
/** @type {import("clock-core").Action[]} */
export default [
  { icon: "🕊️", key: "aid", source: "OCHA, Global Humanitarian Overview 2026", url: "https://www.unocha.org/publications/report/world/press-release-life-life-un-launches-33-billion-aid-appeal-urgent-call-global-solidarity" },
  { icon: "🤝", key: "welcome", source: "UNHCR, Global Trends", url: "https://www.unhcr.org/global-trends" },
  { icon: "🗳️", key: "leaders", source: "SIPRI Military Expenditure Database", url: "https://www.sipri.org/databases/milex" },
];
