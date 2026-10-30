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
// CURRENT MODEL: per PHONE NUMBER. £75 per phone number per month. A phone
// number counts when it did at least one check that month. Numbers that do no
// checks are free, and so is everyone who only gets the reports by email or
// uses the dashboard. The first phone number is always charged (£75 minimum). Everything is
// unlimited on paid (Records, photos, messages, Checks). Free tier: 10
// Records a month, up to 10 photos per Record, unlimited users, free forever.
// There is NO trial. Billed monthly in arrears by UK Direct Debit.
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
    name: "Free",
    price: 0,
    priceSuffix: "/mo",
    quantity: 10,
    quantityLabel: "Records a month",
    note: "Up to 10 photos per Record. Unlimited users. Free forever.",
  },
  {
    name: "Paid",
    price: 75,
    priceSuffix: " per phone number / mo",
    quantity: 0,
    quantityLabel: "Only pay for the numbers doing checks. Numbers with no checks are free.",
    note: "Unlimited Records, photos and Checks.",
  },
];

// What's included on every paid account (rendered as the "every plan includes"
// tags).
const included = [
  "Only pay for the phone numbers doing checks",
  "Numbers with no checks are free",
  "Unlimited reports and photos",
  "Unlimited Checks",
  "Human sign-off",
  "Evidence kept with the job",
  "PDF download",
];

// The free trial. days: 0 disables all trial wording. The free tier (below) is
// how people try Quickler now, not a time-limited trial.
const trial = {
  days: 0,
  noCard: true,
  signupUrl: "https://app.quickler.co/signup",
};

// The free tier: how people try Quickler. No clock, no card.
const freeTier = {
  reports: 10,
  photosPerReport: 10,
  line: "Free forever: 10 Records a month, up to 10 photos per Record, unlimited users. No card to start.",
  shortLine: "Free forever: 10 Records a month. No card, no trial clock.",
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

// The monthly minimum. There is always one billable phone number to keep the
// account live, whether or not anyone files a report that month. So a paid
// account never costs less than £75 in a month. State this plainly so the first
// bill is never a surprise.
const minimumLine =
  "There is a £75 minimum each month. One phone number is always charged to keep " +
  "your account live, whether or not anyone files a report that month. Above " +
  "that minimum you only pay for the people who actually worked.";
const minimumShort = "£75 a month minimum, then £75 per phone number above that.";

// Overflow line for big teams.
const overflowLine = "Big team? Talk to us.";

// Billing line.
const billing = "Billed monthly in arrears by UK Direct Debit.";

// ---- Generated, reusable wording (so prose never hardcodes numbers) ----
// Trial is off; trialLine stays empty so any template reading it renders nothing.
const trialLine = trial.days
  ? `${trial.days}-day free trial.${trial.noCard ? " No card required." : ""}`
  : "";

// A full, dense pricing sentence for prose / SEO bodies / FAQ answers.
const sentence =
  model === "seat"
    ? `${unit.perUnitLine}. A phone number counts when it did at least one check that month, so you add your whole team and only pay for who actually works. ${minimumLine} Everything is unlimited on a paid account: Records, photos, messages and Checks. ${freeTier.line} ${billing}`
    : `Plans from ${CURRENCY}${plans[0].price}/mo. ${billing}`;

// A short version for tight spots (meta descriptions, cards).
const shortSentence =
  model === "seat"
    ? `${unit.perUnitPrice} per phone number per month, ${CURRENCY}75 minimum. Only pay for who works. ${freeTier.shortLine}`
    : `Plans from ${CURRENCY}${plans[0].price}/mo.`;

// A plain description for guide prose, reads naturally mid-paragraph, no
// trailing full stop.
const bundleList =
  model === "seat"
    ? `${unit.perUnitPrice} per phone number per month with a ${CURRENCY}75 monthly minimum, plus a free tier of ${freeTier.reports} Records a month, and numbers that do no checks are always free`
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
