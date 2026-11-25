/**
 * The heading of a docs page's "When to use ..." section, always a complete phrase that names the thing: "When to use the
 * SaaS revenue dashboard", "When to use the particles effect", "When to use Progress" (a single-word component name stands
 * alone, capitalised, without an article; a longer descriptive name keeps "the"). The sidebar name alone is not always one ("SaaS revenue",
 * "Blur in", "File upload"), so the group adds its noun and a few routes carry the phrase by hand.
 */

/** Routes whose sidebar name is not a complete noun phrase on its own, and the phrase that names them. */
const PHRASE: Readonly<Record<string, string>> = {
  "/blocks/ai-chat": "the AI chat block",
  "/blocks/dashboard-stats": "the dashboard stat cards",
  "/blocks/glass-login": "the glass login form",
  "/blocks/lamp-login": "the lamp login form",
  "/blocks/otp-verification": "the OTP verification page",
  "/blocks/payment-checkout": "the payment checkout form",
  "/blocks/pricing": "the pricing section",
  "/blocks/testimonials": "the testimonials section",
  "/charts/beeswarm": "the beeswarm chart",
  "/charts/box-plot": "the box plot and violin chart",
  "/charts/category-bar": "the category bar chart",
  "/charts/cohort-retention": "the cohort retention chart",
  "/charts/dumbbell": "the dumbbell and slope chart",
  "/charts/error-bar-chart": "the error bar chart",
  "/charts/gauge-chart": "the gauge chart",
  "/charts/percent-stacked-bar-chart": "the 100% stacked bar chart",
  "/charts/scatter-plot": "the scatter plot and bubble chart",
  "/charts/sparkbar": "the sparkbar chart",
  "/chat/widget": "the popover chat widget",
  "/forms/file-upload": "the file upload field",
  "/overlays/kbd": "the Kbd component",
};

/** The noun the group of a route adds when the sidebar name does not already end with it. */
const GROUP_NOUN: Readonly<Record<string, string>> = { dashboards: "dashboard", effects: "effect" };

/**
 * @param path the route path, e.g. "/dashboards/saas"
 * @param title the route's sidebar name, e.g. "SaaS revenue"
 */
export function whenHeading(path: string, title: string): string {
  const named = PHRASE[path];
  if (named) return `When to use ${named}`;
  const name = title.replace(/\s*\(.*?\)/g, "").trim();
  if (!name) return "When to use it";
  const noun = GROUP_NOUN[path.split("/")[1] ?? ""];
  const phrase = noun && !new RegExp(`\\b${noun}$`, "i").test(name) ? `${name} ${noun}` : name;
  // One word is the component's own name ("When to use Progress", "Select", "Input", "Tabs"): no article, which would
  // read as a fragment ("the progress"). A descriptive name of several words takes its article ("the data table").
  if (!/\s/.test(phrase)) return `When to use ${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`;
  // Keep acronyms and proper names ("SaaS", "OTP input", "macOS dock") as written; lower-case a plain sentence-case name.
  return `When to use the ${/[A-Z]/.test(phrase.slice(1)) ? phrase : phrase.toLowerCase()}`;
}
