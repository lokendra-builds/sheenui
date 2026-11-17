import assert from "node:assert/strict";
import { test } from "node:test";

import { findRepeatedNumber, htmlTextContent } from "../../demo/scripts/lib/duplicate-run.mjs";

test("a number rendered as text three times is found", () => {
  assert.equal(findRepeatedNumber("Visitors 12,48012,48012,480 today"), "12,480");
  assert.equal(findRepeatedNumber("rate 98.698.698.6 %"), "98.6");
  assert.equal(findRepeatedNumber("count 48250 48250"), null);
});

test("a number once, or two cells with the same number, is fine", () => {
  assert.equal(findRepeatedNumber("npx shadcn@4.14.1 add v2.12.1"), null); // versions
  assert.equal(findRepeatedNumber("12,480 visitors, 1,200 and 1,200"), null);
  assert.equal(findRepeatedNumber(htmlTextContent("<td>1,200</td><td>1,200</td>")), null);
  assert.equal(findRepeatedNumber(htmlTextContent('<span>12,480</span><span class="sr-only">12,480</span>')), "12,480");
});
