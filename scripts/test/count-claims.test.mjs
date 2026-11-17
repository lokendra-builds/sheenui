// node:test for the count-claim reader behind seo-check's "counts agree with src/seo/counts.ts" gate.
import assert from "node:assert/strict";
import { test } from "node:test";
import { findCountClaims, textWithSeparators } from "../../demo/scripts/lib/count-claims.mjs";

const claims = (t) => findCountClaims(t).map((c) => `${c.number} ${c.kind}${c.plus ? "+" : ""}`);

test("real count phrases are found, with one adjective allowed", () => {
  assert.deepEqual(claims("86 components, 48 charts and 20 blocks"), ["86 component", "48 chart", "20 block"]);
  assert.deepEqual(claims("86 accessible components"), ["86 component"]);
});

test('"48 chart components" is a charts claim, not a components one', () => {
  assert.deepEqual(claims("including 48 chart components in all"), ["48 chart"]);
});

test("numbers that are not counts do not match", () => {
  assert.deepEqual(claims("React 19.2+ client components styled with Tailwind"), []);
  assert.deepEqual(claims("Tailwind v4 components, 12 of the best charts"), []);
});

test("a plus claim is reported as such", () => {
  assert.deepEqual(claims("100+ components"), ["100 component+"]);
});

test("adjacent elements do not fuse into one number", () => {
  const html = "<div><span>12</span><span>charts</span></div><li>Line chart</li><li>30 people</li><b>KPI</b>";
  assert.deepEqual(claims(textWithSeparators(html)), ["12 chart"]);
  assert.equal(claims(textWithSeparators("<p>48</p><p>1</p><h3>Line chart</h3>")).length, 0);
  assert.deepEqual(claims(textWithSeparators("<p>4</p><p>86</p><p>components</p>")), ["86 component"]);
});

test("scripts and styles are not read as page text", () => {
  assert.equal(textWithSeparators("<p>a</p><script>var x = '5 blocks'</script><p>b</p>"), " a b ");
});
