// A page must exist at one URL: the hub twin (x.html next to x/index.html) cannot come back.
import assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import path from "node:path";

const { findDuplicatePages, pageFacts } = await import(
  pathToFileURL(path.resolve(import.meta.dirname, "../../demo/scripts/lib/duplicate-pages.mjs")).href
);
const SITE = "https://example.test/sheenui";
const page = (canonical) =>
  `<html><head><link rel="canonical" href="${canonical}"></head><body><h1>Title</h1></body></html>`;
const stub = (canonical) =>
  `<html><head><link rel="canonical" href="${canonical}"><meta http-equiv="refresh" content="0; url=/x/"></head><body><p>moved</p></body></html>`;

test("a hub with its page in the folder and a stub beside it is clean", () => {
  const files = [
    { file: "charts/index.html", html: page(`${SITE}/charts/`) },
    { file: "charts.html", html: stub(`${SITE}/charts/`) },
    { file: "charts/line-chart.html", html: page(`${SITE}/charts/line-chart`) },
    { file: "index.html", html: page(`${SITE}/`) },
  ];
  assert.deepEqual(findDuplicatePages(files, SITE), []);
});

test("the same page at x.html and x/index.html is reported", () => {
  const files = [
    { file: "blocks/index.html", html: page(`${SITE}/blocks/`) },
    { file: "blocks.html", html: page(`${SITE}/blocks/`) },
  ];
  const errors = findDuplicatePages(files, SITE);
  assert.ok(
    errors.some((e) => /same page/.test(e)),
    errors.join("\n"),
  );
  assert.ok(
    errors.some((e) => /served from blocks\/index\.html/.test(e)),
    errors.join("\n"),
  );
});

test("a stub must point at a real page", () => {
  const errors = findDuplicatePages([{ file: "old.html", html: stub(`${SITE}/new`) }], SITE);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /no page/);
});

test("pageFacts tells a stub from a page", () => {
  assert.equal(pageFacts(stub(`${SITE}/a`)).stub, true);
  assert.equal(pageFacts(page(`${SITE}/a`)).page, true);
});
