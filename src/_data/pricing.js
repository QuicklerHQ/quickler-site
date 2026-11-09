// ============================================================================
// SINGLE SOURCE OF TRUTH FOR ALL PRICING.
//
// Change pricing HERE and it updates everywhere on the site that uses the
// pricing shortcodes/filters ({% pricingCards %}, {{ pricing.sentence }}, etc.)
// and anything reading `pricing.*` in a template. No more hunting prose across
// the pages.
//
// TO CHANGE THE MODEL:
//   1. Set `model` to "seat" (or "report", "firm").
//   2. Replace `plans` with the new tiers (keep the same field shape).
//   3. Update `unit`, `perUnitLine`, `included`, `trial` as needed.
//   4. Rebuild. Every page that renders pricing via the shortcodes follows.
//
// CURRENT MODEL (Philip 5 Nov 2026 08:18, via the Money chat): a 14-day free
// trial with everything unlocked and no card to start. Then £75 a month for
// each phone number on the account. Reports, the dashboard, sharing and
// downloads are free for everyone else. No free plan, no freemium, nothing
// priced by who was active that month. Paid accounts have no limits (reports,
// photos, messages). Billed monthly by UK Direct Debit.
//
// Pages that hardcode a custom pricing sentence in prose should instead use
// {{ pricing.sentence }} / {{ pricing.shortSentence }} so they stay in sync.
// ============================================================================

const CURRENCY = "£";

// The pricing model. One of: "report" (per completed report), "seat" (per
// phone number doing checks), "firm" (flat per firm). Drives the wording helpers below.
const model = "seat";

// What one unit is, in the current model. Used in generated sentences.
const unit = {
  singular: "phone number",             // "£75 per phone number"
  plural: "phone numbers",              // "only pay for the phone numbers doing checks"
  perUnitPrice: "£75",                  // headline per-unit price, or "" if not per-unit
  perUnitLine: "£75 per phone number per month",
};

// The plans/tiers. Keep the SAME shape if you switch model:
//   name, price (number, monthly £), quantity (number), quantityLabel (string),
//   note (optional small print). The cards + sentences read these generically.
const plans = [
  {
    name: "Trial",
    price: 0,
    priceSuffix: " for 14 days",
    quantity: 0,
    quantityLabel: "Everything unlocked. No card needed to start. No contract, cancel any time.",
    note: "14-day free trial.",
  },
  {
    name: "Paid",
    price: 75,
    priceSuffix: " per phone number / mo",
    quantity: 0,
    quantityLabel: "£75 per month per phone number & unlimited free dashboard accounts.",
    note: "Reports, the dashboard, sharing and downloads are free for everyone else.",
  },
];

// What's included on every paid account (rendered as the "every plan includes"
// tags).
const included = [
  "14-day free trial, no card needed to start",
  "Everything unlocked",
  "Reports, dashboard, sharing and downloads free for everyone else",
  "Unlimited reports, photos and messages",
  "Human sign-off",
  "Evidence kept with the job",
  "PDF download",
];

// The free trial: 14 days, everything unlocked, no card needed to start.
const trial = {
  days: 14,
  noCard: true,
  signupUrl: "https://app.quickler.co/signup",
};

// The old free plan is gone (Philip 5 Nov 2026). Kept as an object so any
// template that still reads pricing.freeTier gets the trial wording, never a
// free-forever line.
const freeTier = {
  reports: 0,
  photosPerReport: 0,
  line: "14-day free trial. Everything is unlocked. No card needed to start. No contract, cancel any time.",
  shortLine: "14-day free trial. No card needed to start. No contract, cancel any time.",
};

// Fair-use clause. Backs the "unlimited" promise on paid accounts: unlimited is
// for normal working use; if an account runs far above a typical mix we get in
// touch rather than cut off or surprise-charge. Reads as a promise, protects us.
const fairUse =
  "Unlimited reports, photos and messages are for normal working use. We price " +
  "assuming a typical mix of heavy, regular and occasional users across your " +
  "team, with plenty of headroom. If an account runs far above that, month " +
  "after month, we will get in touch to find a plan that fits. We will not cut " +
  "you off and we will not charge you by surprise. It is just a friendly " +
  "conversation about the right plan for how you actually use it.";

// The old "monthly minimum" wording is gone with the per-active-number model;
// the price is £75 per month per phone number & unlimited free dashboard accounts. These two
// keep their names so [[price:minimum]] tokens still resolve, to the price.
const minimumLine = "£75 per month per phone number & unlimited free dashboard accounts.";
const minimumShort = "£75 per month per phone number & unlimited free dashboard accounts.";

// Overflow line for big teams.
const overflowLine = "Big team? Talk to us.";

// Billing line.
const billing = "Billed monthly in arrears by UK Direct Debit, or by purchase order if you need one (email purchaseorder@quickler.co).";

// ---- Generated, reusable wording (so prose never hardcodes numbers) ----
// The trial line, for any template that reads it.
const trialLine = trial.days
  ? `${trial.days}-day free trial.${trial.noCard ? " No card required." : ""}`
  : "";

// A full, dense pricing sentence for prose / SEO bodies / FAQ answers.
const sentence =
  model === "seat"
    ? `Start with a 14-day free trial. Everything is unlocked and you need no card to start. Then £75 per month per phone number & unlimited free dashboard accounts. Paid accounts have no limits: reports, photos and messages are unlimited. ${billing}`
    : `Plans from ${CURRENCY}${plans[0].price}/mo. ${billing}`;

// A short version for tight spots (meta descriptions, cards).
const shortSentence =
  model === "seat"
    ? `14-day free trial, no card needed to start. Then £75 per month per phone number & unlimited free dashboard accounts.`
    : `Plans from ${CURRENCY}${plans[0].price}/mo.`;

// A plain description for guide prose, reads naturally mid-paragraph, no
// trailing full stop. Kept short (5 Nov 2026): pages follow it with their own
// "free for everyone else" and "no card" lines, which it used to repeat.
const bundleList =
  model === "seat"
    ? `£75 per month per phone number & unlimited free dashboard accounts, after a 14-day free trial`
    : plans.map((p) => `${p.name} at ${CURRENCY}${p.price} a month`).join(", ");

// The pricing headline as a sentence fragment, for prose openers.
const perReportLine = unit.perUnitLine;

module.exports = {
  currency: CURRENCY,
  model,
  unit,
  plans,
  included,
  trial,
  trialLine,
  freeTier,
  fairUse,
  minimumLine,
  minimumShort,
  overflowLine,
  billing,
  sentence,
  shortSentence,
  bundleList,
  perReportLine,
};
