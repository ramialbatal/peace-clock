// @ts-check
/**
 * Peace Clock: loads the data, renders the page and runs the live counters.
 * Calculations live in model.js (pure, tested); settings in config.js; the picture behind the header in scene.js.
 *
 * Sections: Data · Rendering helpers · Page (render) · Boot.
 */
import * as C from "clock-core";
import CFG from "./config.js";
import actions from "./actions.js";
import { spendingEntry, isRecord, daysToPay, deathsEntry, topPlaces, risingCount, oneEvery } from "./model.js";
import { headline, appealStatus, livesStatus, rearmStatus, spendBadge, placeBadge, about } from "./messages.js";
import { peaceScene } from "./scene.js";

const { YEAR, fmt, setText, escapeHtml, t } = C;
/** @param {string} id */
const $ = (id) => /** @type {HTMLElement} */ (document.getElementById(id));
/** @typedef {import("clock-core").Series} Series */

// ---- Data ------------------------------------------------------------------------
/** The full CSV of an Our World in Data chart (all places, all years). @param {string} chart */
const csvUrl = (chart) => `${CFG.apiBase}${chart}.csv?v=1&csvType=full&useColumnShortNames=true`;

const codes = [CFG.world, ...CFG.countries.map((c) => c.code)];

const loadData = C.once(async () => {
  const [spend, share, deaths] = await Promise.all([CFG.spending.chart, CFG.share.chart, CFG.deaths.chart].map((c) => C.fetchCsv(csvUrl(c))));
  const cols = { code: "code", year: "year", fromYear: CFG.historyFrom };
  const data = {
    spending: C.seriesByCode(spend, { ...cols, value: CFG.spending.column, wanted: codes }),
    share: C.seriesByCode(share, { ...cols, value: CFG.share.column, wanted: codes }),
    // Every country where fighting killed people (codes of real countries are three capital letters)
    deaths: C.seriesByCode(deaths, { ...cols, value: CFG.deaths.column, fromYear: YEAR - 3,
      where: (/** @type {Record<string, string>} */ r) => /^[A-Z]{3}$/.test(r.code ?? "") || r.code === CFG.world }),
    names: C.namesByCode(deaths, { code: "code", name: "entity" }),
    spendNames: C.namesByCode(spend, { code: "code", name: "entity", wanted: codes }),
  };
  if (!data.spending[CFG.world]) throw new Error("World military spending missing from response");
  if (!data.deaths[CFG.world]) throw new Error("World conflict deaths missing from response");
  const missing = CFG.countries.filter((c) => !data.spending[c.code]).map((c) => c.code);
  if (missing.length) console.warn("No military spending data for:", missing.join(", "));
  return { data, fetchedAt: new Date() };
});

// ---- Rendering helpers ---------------------------------------------------------------
/** "$2.8 trillion", "$929 billion", "$58 million", in the visitor's language. @param {number} usd */
function money(usd) {
  const a = Math.abs(usd);
  // French says "2 771 milliards": its "a.trillion" is empty, so it falls through to billions
  if (a >= 1e12 && t("a.trillion")) return t("a.trillion", { n: fmt[2].format(usd / 1e12) });
  if (a >= 1e9) return t("a.billion", { n: fmt[a >= 1e10 ? 0 : 1].format(usd / 1e9) });
  return t("a.million", { n: fmt[0].format(usd / 1e6) });
}

/** For spending, down is good. @param {number} x @param {number} d decimals shown */
const goodBadClass = (x, d) => C.changeClass(x, d, "down");

/** @param {C.Projection} e @param {string} name */
function sparkFor(e, name) {
  const vals = e.years.map((y) => e.series[y]);
  const first = e.years[0], last = e.years[e.years.length - 1];
  const change = (vals[vals.length - 1] / vals[0] - 1) * 100;
  return C.sparkline(e.years, vals, {
    caption: `${first}-${String(last).slice(2)}`, change, changeText: C.signedPct(change, 0), good: "down",
    label: t("a.spark", { name, first, last, change: C.signedPct(change, 0) })
  });
}

/** @param {C.Projection} e */
function historyTable(e) {
  const rows = e.years.slice().reverse().map((y) => {
    const prev = e.series[y - 1];
    const ch = prev ? (e.series[y] / prev - 1) * 100 : null;
    return `<tr><th>${y}</th><td>${money(e.series[y])}</td><td class="${ch == null ? "" : goodBadClass(ch, 1)}">${
      ch == null ? "" : C.signedPct(ch, 1)}</td></tr>`;
  }).join("");
  return `<div class="history" hidden><table><caption>${t("a.history")}</caption>${rows}</table></div>`;
}

/** A flag emoji from a two-letter code ("" gives a white flag). @param {string} region */
const flagOf = (region) => (region ? String.fromCodePoint(...[...region].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "🏳️");

// ---- Page ------------------------------------------------------------------------------
const T0 = Date.now();

/** @param {Awaited<ReturnType<typeof loadData>>["data"]} data */
function render(data) {
  const world = spendingEntry(data.spending[CFG.world], CFG.trendYears, CFG.maxGrowth);
  const wRate = world.annual / C.SEC_PER_YEAR;
  const lives = /** @type {NonNullable<ReturnType<typeof deathsEntry>>} */ (deathsEntry(data.deaths[CFG.world]));

  const entries = CFG.countries.filter((c) => data.spending[c.code]).map((c) => {
    const e = spendingEntry(data.spending[c.code], CFG.trendYears, CFG.maxGrowth);
    const name = C.regionName(C.flagRegion(c.flag), c.name || data.spendNames[c.code] || c.code);
    const sh = data.share[c.code];
    const shYears = sh ? Object.keys(sh).map(Number) : [];
    return { ...c, ...e, name, gdp: shYears.length ? sh[Math.max(...shYears)] : null, rest: false, hasSeries: true };
  });
  const row = C.restOfWorld(world, entries);
  const all = [...entries, { code: "ROW", flag: "🌐", name: t("a.rest"), rest: true, hasSeries: false, ...row, growth: null, gdp: null }];

  // The answer and the counters' labels
  C.fill("latest", world.lastYear);
  C.fill("first", world.years[0]);
  C.fill("trend-from", world.trendFrom);
  C.fill("lives-year", lives.lastYear);
  C.showAnswer(headline(world.growth, isRecord(world.series)));
  $("world-rate").textContent = fmt[0].format(wRate);
  $("world-annual").textContent = money(world.annual);
  $("world-official").textContent = money(world.lastValue);
  $("world-growth").textContent = C.signedPct(world.growth * 100, 1);
  $("lives-last").textContent = about(lives.last);
  const every = oneEvery(lives.last);
  $("lives-every").textContent = t(every.unit === "min" ? "a.every.min" : "a.every.sec", { n: every.n });

  // Where we stand
  const A = CFG.appeal, days = daysToPay(world.annual, A.usd);
  $("status-cards").innerHTML = [
    C.statusCard({ label: t("a.card.appeal"), msg: appealStatus(days, money(A.usd), A.year) }),
    C.statusCard({ label: t("a.card.lives"), msg: livesStatus(lives.last, lives.prev, lives.lastYear) }),
    C.statusCard({ label: t("a.card.rearm"), msg: rearmStatus(risingCount(entries), entries.length) }),
  ].join("");
  C.fill("appeal-year", A.year);
  document.querySelectorAll("[data-appeal-source]").forEach((el) => { el.textContent = A.source; if (el instanceof HTMLAnchorElement) el.href = A.sourceUrl; });
  const ratio = (A.usd / world.annual) * 100;
  $("appeal-usd").textContent = money(A.usd);
  $("appeal-ratio").textContent = t("a.dollars", { n: fmt[2].format(ratio) });
  $("cmp-mil").textContent = money(world.annual);
  $("cmp-aid").textContent = money(A.usd);
  $("cmp-aid-bar").style.width = Math.max(ratio, 0.6) + "%";
  $("analogy-coins").textContent = fmt[1].format(ratio);

  // The biggest spenders
  const grid = $("grid");
  grid.innerHTML = "";
  const cards = all.map((e) => {
    const share = (e.annual / world.annual) * 100;
    const el = document.createElement("article");
    el.className = "card" + (e.rest ? " rest" : "");
    const badge = spendBadge(e.growth);
    el.innerHTML = `
      <header>
        <span class="flag" aria-hidden="true">${e.flag}</span>
        <h3>${escapeHtml(e.name)}</h3>
        ${C.badge(badge.tone, badge.label)}
      </header>
      <div class="ytd"><span class="num">0</span> <small>${t("a.soFar", { year: YEAR })}</small></div>
      <div class="bar" title="${escapeHtml(t("a.shareTitle", { pct: C.pct(share, 1) }))}"><i style="width:${Math.min(Math.max(share, 0), 100)}%"></i></div>
      <p class="share">${escapeHtml(t("a.share", { pct: C.pct(share, 0) }))}</p>
      <details class="more-info">
        <summary>${t("a.more")}</summary>
        ${e.hasSeries ? sparkFor(/** @type {C.Projection} */ (e), e.name) : ""}
        <dl>
          <div><dt>${t("a.perSecond")}</dt><dd>${t("a.dollars", { n: fmt[0].format(e.annual / C.SEC_PER_YEAR) })}</dd></div>
          <div><dt>${t("a.gdp")}</dt><dd>${e.gdp != null ? C.pct(e.gdp, 1) : t("a.na")}</dd></div>
          <div><dt>${t("a.official", { year: e.lastYear })}</dt><dd>${money(e.lastValue)}</dd></div>
          <div><dt>${t("a.expected", { year: YEAR })}</dt><dd>${money(e.annual)}</dd></div>
          <div><dt>${t("a.change")}</dt><dd class="${e.growth == null ? "" : goodBadClass(e.growth * 100, 1)}">${C.trendText(e.growth)}</dd></div>
        </dl>
        ${e.hasSeries ? `<button type="button" class="more" aria-expanded="false">${t("core.yearly")} <span aria-hidden="true">▾</span></button>${historyTable(/** @type {C.Projection} */ (e))}` : ""}
      </details>`;
    C.wireHistory(el);
    grid.appendChild(el);
    return { e, el, num: el.querySelector(".num") };
  });
  const sortSel = /** @type {HTMLSelectElement} */ ($("sort"));
  /** @type {Record<string, (c: typeof cards[number]) => number | string>} */
  const keys = {
    total: (c) => c.e.annual,
    gdp: (c) => c.e.gdp ?? NaN,
    growth: (c) => c.e.growth ?? NaN,
    name: (c) => c.e.name
  };
  const sortCards = () => C.sortInto(grid, cards, keys[sortSel.value]);
  sortSel.onchange = sortCards;
  sortCards();
  C.wireShowAll(grid, $("show-all"), cards.length);

  // Where war takes the most lives
  const byPlace = Object.fromEntries(Object.entries(data.deaths).filter(([code]) => code !== CFG.world));
  const places = topPlaces(byPlace, CFG.places);
  const max = places[0]?.last ?? 1;
  $("places").innerHTML = places.map((p) => {
    const region = CFG.regions[p.code] ?? "";
    const name = C.regionName(region, data.names[p.code] ?? p.code);
    const b = placeBadge(p.last, p.prev);
    return `<li class="place">
        <span class="flag" aria-hidden="true">${flagOf(region)}</span>
        <span class="place-name">${escapeHtml(name)}</span>
        ${C.badge(b.tone, b.label)}
        <span class="place-bar" aria-hidden="true"><i style="width:${Math.max((p.last / max) * 100, 1.5)}%"></i></span>
        <span class="place-num">${escapeHtml(t("a.place.deaths", { n: about(p.last), year: p.lastYear }))}</span>
      </li>`;
  }).join("");

  C.startTicker((now) => {
    const frac = C.yearFraction(now), elapsed = (now - T0) / 1000;
    setText($("world-num"), C.digits(fmt[0].format(world.annual * frac)), true);
    setText($("world-since"), fmt[0].format(wRate * elapsed));
    setText($("lives-num"), C.digits(fmt[0].format(Math.floor(lives.last * frac))), true);
    setText($("world-pct"), fmt[2].format(frac * 100));
    $("world-bar").style.width = frac * 100 + "%";
    for (const c of cards) setText(c.num, fmt[0].format(c.e.annual * frac));
  });
}

// ---- Boot --------------------------------------------------------------------------------
async function show() {
  try {
    const { data, fetchedAt } = await loadData();
    render(data);
    $("fetched-at").textContent = fetchedAt.toLocaleString(C.locale());
    C.setState("ready");
  } catch (err) {
    console.error(err);
    C.stopTicker();
    C.setState("error", err instanceof Error ? err.message : String(err));
  }
}

// Language first (the inline script in index.html chose it), so everything below is drawn in it.
await C.startLanguage((code) => import(`./i18n/${code}.js`), document.querySelector("header.top .wrap"));
C.startStats();
C.wireEmbed(document.querySelector("footer.foot"));
C.wireActions(actions);
C.startScene(document.querySelector("canvas.scene"), peaceScene(), { groundAt: document.querySelector("header.top") });
C.wireHelp();
C.fill("year", YEAR);
show();
