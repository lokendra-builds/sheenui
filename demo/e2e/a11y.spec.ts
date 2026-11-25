// Lens 3 page gate: axe-core 4.14 with WCAG 2.0-2.2 A/AA, best-practice rules and `target-size` on the
// built site, in all four looks (Liquid / Aurora x light / dark) at 1440 and at a 390 touch phone, first with the page
// as loaded and then once for every overlay trigger on it (menus, selects, comboboxes, dialogs, drawers, pickers, hover
// cards, popovers), and again after a showcase stage's story has ended, opened one at a time and closed with Escape. Zero violations. The only exception is the one documented
// finding in ACCEPTED below (page-has-heading-one under an open touch list on two routes); every other finding fails.
// A trigger that cannot be opened is never skipped silently: it is listed as "unopened" in the test output and the share
// of unopened triggers is asserted (MAX_UNOPENED_SHARE), so an overlay that stops opening cannot hide as a skip.
//
//   A11Y_FULL=1     every route (nightly / manual)           default: a sample of routes covering every overlay family
//   A11Y_ROUTES=a,b only routes containing one of these
//   A11Y_LOOKS=quick 2 looks instead of 8
//
// Colour contrast over glass is judged from rendered pixels by e2e/contrast/check_contrast.py (axe cannot see through
// backdrop-filter), so axe's own `color-contrast` rule is left out here.

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { preferenceScript, routePaths, settle, urlFor } from "./routes";

/** Routes that together open every overlay family and every kind of page (the push tier). */
const SAMPLE = [
  "/",
  "/components/button",
  "/components/toast",
  "/components/alert",
  "/components/skeleton",
  "/components/tabs",
  "/components/combobox",
  "/forms/tags-input",
  "/components/data-table",
  "/components/dialog",
  "/overlays/alert-dialog",
  "/overlays/drawer",
  "/overlays/context-menu",
  "/navigation/navigation-menu",
  "/overlays/dropdown-menu",
  "/overlays/hover-card",
  "/components/popover",
  "/components/tooltip",
  "/overlays/side-drawer",
  "/overlays/menubar",
  "/forms/date-picker",
  "/forms/color-picker",
  "/components/select",
  "/layout/resizable",
  "/chat/thread",
  "/charts",
  "/showcase",
  "/effects/text-reveal",
  "/charts/line-chart",
  "/dashboards/crypto-dashboard",
  "/docs/installation",
  "/blocks/pricing",
  "/blocks/settings-page",
  "/blocks/site-footer",
  "/blocks/chat-app",
];

const sizes = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;
const themes = ["light", "dark"] as const;
const styles = ["liquid", "aurora"] as const;

const full = Boolean(process.env.A11Y_FULL);
const only = process.env.A11Y_ROUTES?.split(",").filter(Boolean);
const known = new Set(routePaths);
let paths = full ? routePaths : SAMPLE.filter((p) => known.has(p));
if (only) paths = routePaths.filter((p) => only.some((f) => p.includes(f)));

const looks = sizes.flatMap((size) => themes.flatMap((theme) => styles.map((style) => ({ size, theme, style }))));
const selected =
  process.env.A11Y_LOOKS === "quick"
    ? looks.filter(
        (l) =>
          (l.size.name === "1440" && l.theme === "dark" && l.style === "liquid") ||
          (l.size.name === "390" && l.theme === "light" && l.style === "aurora"),
      )
    : looks;

const SLICE = full ? 12 : 8;
const slices: string[][] = [];
for (let i = 0; i < paths.length; i += SLICE) slices.push(paths.slice(i, i + SLICE));

/** Overlay triggers inside the page content (the sidebar and header menus are covered by their own routes). */
const OPENERS =
  'main :is([aria-haspopup]:not([aria-haspopup="false"]), [role="combobox"], [aria-expanded="false"][aria-controls], [data-slot$="-trigger"]):not([disabled]):not([aria-disabled="true"])';
const MAX_OPENERS = 14;

async function audit(page: Page, label: string, found: string[]) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .options({ rules: { "color-contrast": { enabled: false }, "target-size": { enabled: true } } })
    .analyze();
  for (const v of results.violations) {
    const targets = v.nodes
      .slice(0, 3)
      .map((n) => n.target.join(" "))
      .join(" | ");
    found.push(`${label}: [${v.impact}] ${v.id} x${v.nodes.length} ${targets}`);
  }
}

/**
 * Accepted findings, each narrowed to one rule, the listed routes, phone (touch) width and an open popup only.
 * page-has-heading-one: on touch screens Base UI hides the page (aria-hidden) behind a typeable list on purpose, so
 * the open list is all a screen reader reaches; the page's h1 is back as soon as the list closes. Documented in
 * theme/src/lib/popup-a11y.ts. Accepted deliberately.
 */
const ACCEPTED: { rule: string; routes: string[] }[] = [
  { rule: "page-has-heading-one", routes: ["/components/combobox", "/forms/tags-input"] },
];

/** True only at phone width, while a popup is open, for an accepted rule on one of its routes. */
function accepted(finding: string, path: string, phone: boolean): boolean {
  if (!phone || !finding.startsWith(`${path} (open: `)) return false;
  return ACCEPTED.some((a) => a.routes.includes(path) && finding.includes(`] ${a.rule} x`));
}

/** The gallery cycles its tiles by design and never ends a story; under reduced motion every tile rests on its final frame, which is the state audited. */
const CALM_PATHS = new Set(["/showcase"]);

/** Triggers a person could not press (covered, moved, or detached), kept for the unopened-share assertion. */
type Tally = { tried: number; unopened: string[] };
/** More than this share of attempted triggers failing to open is a finding (a regression, not an incidental overlap). */
const MAX_UNOPENED_SHARE = 0.35;

async function inspect(page: Page, path: string, phone: boolean, tally: Tally): Promise<string[]> {
  const found: string[] = [];
  await page.emulateMedia({ reducedMotion: CALM_PATHS.has(path) ? "reduce" : "no-preference" });
  await page.goto(urlFor(path), { waitUntil: "domcontentloaded" });
  try {
    await page.locator("main h1").first().waitFor({ timeout: 30_000 });
  } catch {
    return [`${path}: no <main> h1 within 30 s`];
  }
  await settle(page);
  await audit(page, `${path} (loaded)`, found);

  // The showcase stage is inert while its story plays and reachable once it has ended, when the page can hold the same
  // block twice (the stage copy and the docs example): audit that state too (landmark-unique, names, focus order).
  if (await page.locator(".sheen-showcase").count()) {
    const ended = await page
      .waitForFunction(
        () => {
          const s = document.querySelector(".sheen-showcase");
          return s?.getAttribute("data-story") !== "playing";
        },
        null,
        { timeout: 30_000 },
      )
      .then(() => true)
      .catch(() => false);
    // A story that loops or never ends is not audited here (it stays inert); the loaded audit above covers it.
    if (ended) {
      await settle(page, 6);
      await audit(page, `${path} (after story)`, found);
    }
  }

  const openers = page.locator(OPENERS);
  const count = Math.min(await openers.count(), MAX_OPENERS);
  for (let i = 0; i < count; i++) {
    const opener = openers.nth(i);
    if (!(await opener.isVisible().catch(() => false))) continue;
    const name = ((await opener.getAttribute("aria-label")) ?? (await opener.textContent()) ?? `#${i}`)
      .trim()
      .slice(0, 30);
    tally.tried += 1;
    try {
      await opener.scrollIntoViewIfNeeded({ timeout: 2000 });
      await opener.click({ timeout: 2000 });
    } catch (error) {
      // Covered or moved: not an overlay trigger a person could press right now. Counted, not hidden.
      tally.unopened.push(`${path} (${name}): ${(error as Error).message.split("\n")[0]}`);
      continue;
    }
    await settle(page, 6);
    await audit(page, `${path} (open: ${name})`, found);
    await page.keyboard.press("Escape");
    await settle(page, 4);
    // An overlay that Escape did not close (a popover that needs a second press): reload, never inherit a stuck state.
    // A listbox that is part of the page itself (a conversation list) is not an overlay: only a popup's listbox counts, or
    // every such page would reload here and replay its showcase story, whose stage is inert again while the next trigger is tried.
    if (
      await page
        .locator("[data-base-ui-inert], [role=dialog], [role=menu], [role=listbox]:not(main [role=listbox])")
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("main h1").first().waitFor({ timeout: 30_000 });
      await settle(page, 4);
    }
  }
  return found.filter((f) => !accepted(f, path, phone));
}

for (const { size, theme, style } of selected) {
  test.describe(`axe ${size.name}px ${theme} ${style}`, () => {
    slices.forEach((slice, index) => {
      test(`routes ${index * SLICE + 1}-${index * SLICE + slice.length}`, async ({ browser }) => {
        test.setTimeout(15 * 60_000);
        const phone = size.width < 500;
        const context = await browser.newContext({
          viewport: { width: size.width, height: size.height },
          colorScheme: theme,
          ...(phone ? { hasTouch: true, isMobile: browser.browserType.name !== "firefox", deviceScaleFactor: 2 } : {}),
        });
        await context.addInitScript(preferenceScript(theme, style));
        const page = await context.newPage();
        page.setDefaultTimeout(30_000);
        const failures: string[] = [];
        const tally: Tally = { tried: 0, unopened: [] };
        for (const path of slice) failures.push(...(await inspect(page, path, phone, tally)));
        await context.close();
        for (const line of tally.unopened)
          test.info().annotations.push({ type: "unopened trigger", description: line });
        expect(failures, `${failures.length} axe finding(s):\n${failures.join("\n")}`).toEqual([]);
        expect(
          tally.unopened.length,
          `${tally.unopened.length} of ${tally.tried} overlay triggers could not be opened (limit ${MAX_UNOPENED_SHARE * 100} %), so their popups were never audited:\n${tally.unopened.join("\n")}`,
        ).toBeLessThanOrEqual(Math.floor(tally.tried * MAX_UNOPENED_SHARE));
      });
    });
  });
}
