// node:test for the hub-card and "When to use" heading rules behind seo-check (demo/scripts/lib/hub-cards.mjs).
import assert from "node:assert/strict";
import { test } from "node:test";
import { articleFragment, cardMismatch } from "../../demo/scripts/lib/hub-cards.mjs";

test("a card matches a page that carries its name", () => {
  assert.equal(cardMismatch("Slope chart", ["Dumbbell & slope chart", "Dumbbell and slope chart | SheenUI"]), "");
  assert.equal(cardMismatch("100% stacked bars", ["100% stacked bar chart"]), "");
  assert.equal(cardMismatch("Radial progress", ["Radial progress & gauge"]), "");
});
test("a card that points at another page fails", () => {
  assert.match(cardMismatch("Slope chart", ["Dumbbell chart"]), /slope/);
  assert.match(cardMismatch("Radial progress", ["Charts"]), /radial/);
});
test("the plus one bare lowercase word is a fragment", () => {
  for (const h of [
    "When to use the select",
    "When to use the progress",
    "When to use the input",
    "When to use the tabs",
  ])
    assert.ok(articleFragment(h), h);
});
test("capitalised single names and descriptive names pass", () => {
  for (const h of [
    "When to use Select",
    "When to use Tabs",
    "When to use the data table",
    "When to use the SaaS revenue dashboard",
    "When to use the OTP input",
    "When to use pagination",
    "When to use a sparkline",
  ])
    assert.ok(!articleFragment(h), h);
});
