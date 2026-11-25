// The initial-JS budget per page class (performance budget), shared by `pnpm budget` and any profiling script.
//   home                              135 KB gzip
//   plain docs (docs, guides, foundations) 190 KB
//   page with a live example / popup / form (everything else)  210 KB
//   chart page (/charts, /charts/*)   250 KB

/** Budget in KB per class. */
export const BUDGETS_KB = { home: 135, plain: 190, example: 210, chart: 250 };

/** The class of a route path. */
export function classOf(path) {
  if (path === "/") return "home";
  if (/^\/(docs|guides|foundations)(\/|$)/.test(path)) return "plain";
  if (path === "/charts" || path.startsWith("/charts/")) return "chart";
  return "example";
}

/** The budget in KB for a route path. */
export function budgetFor(path) {
  return BUDGETS_KB[classOf(path)];
}

/**
 * Budget in KB per class for the JS the page fetches by 5 s after load (measured by `pnpm budget:measure`: initial files,
 * the shell's idle chunks, and every island chunk). Derived from the 15 Nov 2026 measurement of 167 routes with ~3 to
 * 5 % headroom over the class's heaviest route that is not in FETCHED_OVERRIDES_KB:
 *   home 268 (budget 280) · plain 233 to 267 (270) · example median 295, 99 routes, 17 over 340 (390) · chart 289 to 348 (360).
 * The floor is the 128 KB shell plus ~105 KB the shell itself fetches at idle (motion features, backdrop, toaster, preference bar).
 */
export const FETCHED_BUDGETS_KB = { home: 280, plain: 270, example: 390, chart: 360 };

/**
 * Routes whose island set is the page's subject and that sit over their class: held at today's value plus ~3 %, so they
 * cannot grow, and listed here as the cut targets (a visibility-triggered island loader would be the fix).
 */
export const FETCHED_OVERRIDES_KB = {
  "/overlays/side-drawer": 490,
  "/chat/thread": 450,
  "/blocks/chat-app": 450,
  "/chat/widget": 430,
  "/forms/field": 425,
  "/components/data-table": 425,
  "/docs/forms": 465,
  "/charts": 470,
};

/** The fetched-by-idle budget in KB for a route path. */
export function fetchedBudgetFor(path) {
  return FETCHED_OVERRIDES_KB[path] ?? FETCHED_BUDGETS_KB[classOf(path)];
}
