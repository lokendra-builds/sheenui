import assert from "node:assert/strict";
import { test } from "node:test";
import { fragmentReason } from "./fragment-check.mjs";

const PASS = [
  "Sets the size.",
  "Shows the label next to the icon.",
  "Renders the icon before the label.",
  "Called when the value changes.",
  "The size of the row, in px, is fixed.",
  "Extra classes are merged onto the outer element.",
  "Hides the caption on narrow screens and keeps the layout stable at every width.",
  "Shown when the list is empty.",
  "Is shown only on touch screens.",
  "Called when the page changes.",
  "Sets the starting position when uncontrolled.",
];
const FAIL = [
  "Text and row size.",
  "Icon before the label.",
  "Alignment along that side.",
  "Row size.",
  "Extra classes for the outer element.",
  "State value order.",
  "Size.",
  "Initial position when uncontrolled.",
  "Initial page size (uncontrolled).",
  "The search text (controlled).",
  "Visually hidden caption naming the table.",
  "Icon rendered before the children.",
  "Files shown above a user message.",
];

test("sentences with a finite verb pass", () => {
  for (const d of PASS) assert.equal(fragmentReason(d), "", d);
});
test("verbless fragments and noun homographs fail", () => {
  for (const d of FAIL) assert.notEqual(fragmentReason(d), "", d);
});
test("a doubled word fails", () => {
  assert.match(fragmentReason("Shows a a 16:9 media block on top."), /doubled word/);
});
