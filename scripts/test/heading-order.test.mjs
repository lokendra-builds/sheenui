// The heading outline gate of seo:check: one h1, no skipped level.
import assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.resolve(import.meta.dirname, "../../demo/package.json"));
const { parse } = require("node-html-parser");
const { headingOrderErrors } = await import(
  pathToFileURL(path.resolve(import.meta.dirname, "../../demo/scripts/lib/heading-order.mjs")).href
);
const check = (body) => headingOrderErrors(parse(`<html><body>${body}</body></html>`));

test("h1 > h2 > h3 > h2 is a sound outline", () => {
  assert.deepEqual(check("<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2>"), []);
});

test("h1 straight to h3 is a skip", () => {
  const errors = check("<h1>Meteors</h1><h3>Ship the quiet details</h3><h2>On a glass card</h2>");
  assert.equal(errors.length, 1);
  assert.match(errors[0], /skips from h1 \("Meteors"\) to h3 \("Ship the quiet details"\)/);
});

test("no h1, two h1 and a heading before the h1 are reported", () => {
  assert.match(check("<h2>A</h2>").join("\n"), /0 visible <h1>/);
  assert.match(check("<h1>A</h1><h1>B</h1>").join("\n"), /2 visible <h1>/);
  assert.match(check("<h2>A</h2><h1>B</h1>").join("\n"), /first heading is an h2/);
});

test("headings in aria-hidden or hidden subtrees are ignored", () => {
  assert.deepEqual(
    check("<h1>A</h1><div aria-hidden='true'><h3>x</h3></div><div hidden><h4>y</h4></div><h2>B</h2>"),
    [],
  );
});
