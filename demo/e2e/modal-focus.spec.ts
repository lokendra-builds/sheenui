// A modal keeps keyboard focus: with a Dialog, AlertDialog, Drawer or SideDrawer open, 40 Tab and 40 Shift+Tab presses
// in a row (sent without waiting between them, the way a held key or a script sends them) never put focus anywhere
// outside the popup, and Escape then closes it. Every modal trigger in the docs examples of the four pages is opened
// (the showcase stage copy too, once its story has ended and it is no longer `inert`), at 1440 and at a 390 phone, in each browser,
// and a modal opened from inside a modal is checked too. Base UI's own focus guards only hand focus back on the next
// animation frame, so this fails if the library stops wrapping Tab at the ends of the popup itself.

import { expect, test, type Page } from "@playwright/test";

import { settle, urlFor } from "./routes";

const ROUTES = ["/components/dialog", "/overlays/alert-dialog", "/overlays/drawer", "/overlays/side-drawer"];
/** The side-drawer page lists a dozen table rows that open the same record drawer: the first few cover it. */
const MAX_MODALS_PER_PAGE = 6;
const TRIGGERS = 'main button[aria-haspopup="dialog"]:visible:not([inert] *)';
// Open popups of the page itself: the showcase stage can hold an open copy of the same block, but it is `inert`.
const POPUP = ":is([role=dialog],[role=alertdialog]):not([inert] *)";

/** Where focus is, relative to the innermost open popup. */
async function whereIsFocus(page: Page) {
  return page.evaluate((popupSelector) => {
    const popups = [...document.querySelectorAll<HTMLElement>(popupSelector)].filter((el) =>
      el.closest("[data-base-ui-portal]"),
    );
    const popup = popups.at(-1);
    const active = document.activeElement;
    const guard = active?.hasAttribute("data-base-ui-focus-guard") ?? false;
    const label = `${active?.tagName.toLowerCase()}${guard ? "[focus-guard]" : ""} "${(active?.textContent ?? "").trim().slice(0, 30)}"`;
    return { inside: !!popup && !!active && popup.contains(active) && !guard, label };
  }, POPUP);
}

/** True when the page behind is held back (a modal: Base UI marks it `data-base-ui-inert`, plus `aria-hidden` or `inert`), false for a non-modal popup. */
async function isModal(page: Page) {
  return page.evaluate(() => {
    const root = document.getElementById("root");
    return (
      root?.getAttribute("aria-hidden") === "true" ||
      root?.hasAttribute("inert") === true ||
      root?.hasAttribute("data-base-ui-inert") === true
    );
  });
}

/** Escape closes the popup. A tooltip on the focused control (a record-nav button, say) takes the first Escape, so allow one more. */
async function escapeCloses(page: Page, what: string, left: number) {
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press("Escape");
    if ((await page.locator(POPUP).count()) <= left) break;
    await page.waitForTimeout(400);
    if ((await page.locator(POPUP).count()) <= left) break;
  }
  await expect(page.locator(POPUP), `${what}: Escape did not close the modal`).toHaveCount(left);
}

async function pressMany(page: Page, key: "Tab" | "Shift+Tab", times: number, what: string) {
  for (let i = 1; i <= times; i++) {
    await page.keyboard.press(key);
    const { inside, label } = await whereIsFocus(page);
    expect(inside, `${what}: ${key} press ${i} left the popup, focus is on ${label}`).toBe(true);
  }
}

async function exercise(page: Page, what: string) {
  await expect(page.locator(POPUP).last()).toBeVisible();
  await settle(page);
  await expect
    .poll(async () => (await whereIsFocus(page)).inside, { message: `${what}: focus did not start inside the popup` })
    .toBe(true);
  await pressMany(page, "Tab", 40, what);
  await pressMany(page, "Shift+Tab", 40, what);
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`modal focus trap at ${viewport.width}px`, () => {
    test.use({ viewport });
    test.setTimeout(300_000);

    for (const route of ROUTES) {
      test(`${route}: Tab never leaves an open modal and Escape closes it`, async ({ page }) => {
        await page.goto(urlFor(route));
        await settle(page);
        // The showcase stage is `inert` while its story plays. Once the story has ended its copy of the component is
        // live and is opened and checked like the docs examples (it used to leave focus on the trigger behind the popup).
        await page
          .waitForFunction(() => !document.querySelector('[inert] button[aria-haspopup="dialog"]'), null, {
            timeout: 30_000,
          })
          .catch(() => undefined); // still playing: the stage copy is skipped, the examples below are checked
        // The examples hydrate after the first paint: wait for one before counting.
        await expect(page.locator(TRIGGERS).first(), `${route} lists no dialog trigger in its examples`).toBeVisible({
          timeout: 15_000,
        });
        const total = await page.locator(TRIGGERS).count();
        expect(total, `${route} lists no dialog trigger in its examples`).toBeGreaterThan(0);
        let modals = 0;
        for (let i = 0; i < total; i++) {
          // The stage copy goes back to `inert` whenever its story replays, which changes the list: stop at its end.
          if (modals >= MAX_MODALS_PER_PAGE || i >= (await page.locator(TRIGGERS).count())) break;
          const trigger = page.locator(TRIGGERS).nth(i);
          const name = ((await trigger.textContent()) ?? "").trim() || `trigger ${i}`;
          // A click that lands before React has hydrated the example does nothing: click again until it opens.
          await expect(async () => {
            if ((await page.locator(POPUP).count()) === 0) await trigger.click({ timeout: 3000 });
            await expect(page.locator(POPUP).last()).toBeVisible({ timeout: 3000 });
          }).toPass({ timeout: 20_000 });
          await settle(page);
          if (!(await isModal(page))) {
            await page.keyboard.press("Escape");
            await expect(page.locator(POPUP)).toHaveCount(0);
            continue; // a non-modal example: the page behind is meant to stay reachable
          }
          modals++;
          await exercise(page, `${route} "${name}"`);
          // A modal opened from inside the modal.
          const nested = page.locator(`${POPUP} button[aria-haspopup="dialog"]:visible`).first();
          if (await nested.count()) {
            await nested.click();
            await expect(page.locator(POPUP)).toHaveCount(2);
            await exercise(page, `${route} "${name}" > nested`);
            await escapeCloses(page, `${route} "${name}" > nested`, 1);
          }
          await escapeCloses(page, `${route} "${name}"`, 0);
        }
        expect(modals, `${route}: no modal example was exercised`).toBeGreaterThan(0);
      });
    }
  });
}
