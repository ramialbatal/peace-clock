// @ts-check
/**
 * English words used by the code (messages.js and app.js). The page's own text is written in English in index.html;
 * fr.js, es.js and ar.js translate both: every key here, plus every data-i18n key in index.html.
 * Placeholders like {pct} are filled by clock-core's t(); keep them, in any order, in every translation.
 */
export default {
  // The answer at the top (messages.js)
  "msg.head.up.t": "The world is spending more on armies and weapons",
  "msg.head.up.x": "Military spending rose {pct} in the latest year.",
  "msg.head.record.x": "Military spending rose {pct} in the latest year, to the highest level ever recorded.",
  "msg.head.down.t": "Military spending is falling",
  "msg.head.down.x": "It fell {pct} in the latest year.",
  "msg.head.flat.t": "Military spending isn't falling",
  "msg.head.flat.x": "It stayed about the same in the latest year.",

  // Where we stand (messages.js)
  "msg.appeal.t": "{days} days",
  "msg.appeal.x": "That's how long it takes the world's armies to spend as much as the UN's whole aid appeal for {year}: {usd}.",
  "msg.lives.t": "{n} lives lost",
  "msg.lives.x": "In {year}.",
  "msg.lives.up.t": "More lives lost",
  "msg.lives.up.x": "About {n} people were killed in wars in {year}, up from {m} the year before.",
  "msg.lives.down.t": "Fewer lives lost, but still far too many",
  "msg.lives.down.x": "About {n} people were killed in wars in {year}, down from {m} the year before.",
  "msg.lives.same.t": "As many lives lost",
  "msg.lives.same.x": "About {n} people were killed in wars in {year}, as many as the year before.",
  "msg.rearm.most": "Most are spending more",
  "msg.rearm.some": "Some are spending more",
  "msg.rearm.none": "None are spending more",
  "msg.rearm.x": "{n} of the {total} biggest spenders raised their military budgets in the latest year.",
  "msg.badge.more": "▲ Spending more",
  "msg.badge.less": "▼ Spending less",
  "msg.badge.steady": "● Steady",
  "msg.place.up": "▲ More deaths",
  "msg.place.down": "▼ Fewer deaths",
  "msg.place.new": "▲ New fighting",

  // Cards and counters (app.js)
  "a.dollars": "${n}",
  "a.trillion": "${n} trillion",
  "a.billion": "${n} billion",
  "a.million": "${n} million",
  "a.rest": "Rest of world",
  "a.soFar": "dollars in {year}",
  "a.shareTitle": "{pct} of the world total",
  "a.share": "{pct} of the world's military spending",
  "a.more": "More",
  "a.perSecond": "Per second",
  "a.gdp": "Share of its economy",
  "a.official": "{year} official",
  "a.expected": "{year} expected",
  "a.change": "Change / yr",
  "a.na": "n/a",
  "a.spark": "{name}: military spending {first} to {last}, {change}",
  "a.history": "Official yearly spending",
  "a.card.appeal": "What could it pay for?",
  "a.card.lives": "Lives lost to war",
  "a.card.rearm": "Are countries rearming?",
  "a.every.min": "at last year's pace: about one every {n} minutes",
  "a.every.sec": "at last year's pace: about one every {n} seconds",
  "a.place.deaths": "{n} killed in {year}",

  // "What can I do?" (js/actions.js)
  "act.aid.t": "Help people caught in war",
  "act.aid.x": "Give to trusted aid groups that work in war zones. In 2025 the UN's aid appeals received only about $12 billion, the lowest in a decade.",
  "act.welcome.t": "Welcome people who fled",
  "act.welcome.x": "Volunteer, donate or simply be a good neighbour to refugees where you live. More than 100 million people have been forced from their homes.",
  "act.leaders.t": "Ask leaders to fund peace",
  "act.leaders.x": "Ask your representatives to invest in diplomacy, aid and peacebuilding, not only weapons. A few days of world military spending would pay for the UN's whole yearly aid appeal.",
};
