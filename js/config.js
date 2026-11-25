// @ts-check
/**
 * Peace Clock settings: data sources, countries and the humanitarian comparison.
 * Change things here first; the code reads everything from this object.
 *
 * Data is fetched live in the browser from Our World in Data's grapher API (`Access-Control-Allow-Origin: *`):
 *  - Military spending: SIPRI Military Expenditure Database, in constant 2024 US dollars.
 *  - Deaths in armed conflicts: Uppsala Conflict Data Program (UCDP), best estimate, by the country where the fighting
 *    happened. All conflict types: between states, within states, between armed groups, and one-sided violence
 *    against civilians.
 *
 * To add a spender, add { code, flag } to `countries` (ISO 3166-1 alpha-3 code; the name comes from the browser in
 * other languages and from the data in English), then add it to llms.txt.
 */

/**
 * @typedef {{ code: string, flag: string, name?: string }} Country
 * @typedef {{ usd: number, year: number, source: string, sourceUrl: string }} Appeal
 * @typedef {{ apiBase: string, spending: { chart: string, column: string, source: string, sourceUrl: string },
 *   share: { chart: string, column: string }, deaths: { chart: string, column: string, source: string, sourceUrl: string },
 *   appeal: Appeal, historyFrom: number, trendYears: number, maxGrowth: number, world: string, countries: Country[],
 *   places: number, regions: Record<string, string> }} Config
 */

/** @type {Config} */
export default {
  apiBase: "https://ourworldindata.org/grapher/",
  spending: {
    chart: "military-spending-sipri", column: "constant_usd",
    source: "SIPRI Military Expenditure Database",
    sourceUrl: "https://ourworldindata.org/grapher/military-spending-sipri"
  },
  share: { chart: "military-spending-as-a-share-of-gdp-sipri", column: "share_gdp" },   // the final address: redirects have no CORS header
  deaths: {
    chart: "deaths-in-armed-conflicts-by-country", column: "number_deaths_ongoing_conflicts__conflict_type_all",
    source: "Uppsala Conflict Data Program (UCDP)",
    sourceUrl: "https://ourworldindata.org/grapher/deaths-in-armed-conflicts-by-country"
  },
  // UPDATE EVERY DECEMBER: the UN's Global Humanitarian Overview for the coming year (total appeal, launch figure).
  // GHO 2026, launched 8 December 2025: "$33 billion to reach 135 million people".
  appeal: {
    usd: 33e9, year: 2026,
    source: "OCHA, Global Humanitarian Overview 2026",
    sourceUrl: "https://www.unocha.org/publications/report/world/press-release-life-life-un-launches-33-billion-aid-appeal-urgent-call-global-solidarity"
  },
  historyFrom: 2015,   // first year shown in the charts
  trendYears: 1,       // spending trend = the latest year-on-year change
  maxGrowth: 0.25,     // cap on the yearly growth used for projecting (25%): wartime budgets can jump
  world: "OWID_WRL",
  places: 10,          // how many places "Where war takes the most lives" lists
  // The biggest military spenders (SIPRI, 2025)
  countries: [
    { code: "USA", flag: "🇺🇸" },
    { code: "CHN", flag: "🇨🇳" },
    { code: "RUS", flag: "🇷🇺" },
    { code: "DEU", flag: "🇩🇪" },
    { code: "IND", flag: "🇮🇳" },
    { code: "GBR", flag: "🇬🇧" },
    { code: "SAU", flag: "🇸🇦" },
    { code: "UKR", flag: "🇺🇦" },
    { code: "FRA", flag: "🇫🇷" },
    { code: "JPN", flag: "🇯🇵" },
    { code: "KOR", flag: "🇰🇷" },
    { code: "ISR", flag: "🇮🇱" },
    { code: "POL", flag: "🇵🇱" },
    { code: "ITA", flag: "🇮🇹" },
    { code: "AUS", flag: "🇦🇺" },
    { code: "TUR", flag: "🇹🇷" },
    { code: "CAN", flag: "🇨🇦" },
    { code: "BRA", flag: "🇧🇷" }
  ],
  // Two-letter codes (for flags and names in every language) of places where armed conflicts have killed people
  // in recent years. A place missing here still shows, with a neutral flag and its English name.
  regions: {
    AFG: "AF", ARG: "AR", ARM: "AM", AZE: "AZ", BDI: "BI", BEN: "BJ", BFA: "BF", BGD: "BD", BRA: "BR", CAF: "CF",
    CMR: "CM", COD: "CD", COG: "CG", COL: "CO", CRI: "CR", ECU: "EC", EGY: "EG", ETH: "ET", HND: "HN", HTI: "HT",
    IDN: "ID", IND: "IN", IRN: "IR", IRQ: "IQ", ISR: "IL", KEN: "KE", KHM: "KH", LBN: "LB", LBY: "LY", MEX: "MX",
    MLI: "ML", MMR: "MM", MOZ: "MZ", NER: "NE", NGA: "NG", PAK: "PK", PHL: "PH", PNG: "PG", PSE: "PS", RUS: "RU",
    SDN: "SD", SOM: "SO", SSD: "SS", SYR: "SY", TCD: "TD", THA: "TH", TUR: "TR", TZA: "TZ", UKR: "UA", YEM: "YE",
    VEN: "VE", GTM: "GT", JAM: "JM", USA: "US", LKA: "LK", DZA: "DZ", TUN: "TN", UGA: "UG", RWA: "RW", GIN: "GN"
  }
};
