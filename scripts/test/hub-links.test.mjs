import assert from "node:assert/strict";
import { test } from "node:test";

import { stubHubLinks } from "../lib/hub-links.mjs";

const SITE = "https://lokendra-builds.github.io/sheenui";

test("a hub link without the trailing slash is reported", () => {
  const text = `[a](${SITE}/charts) <a href="${SITE}/guides">x</a> ${SITE}/blocks#top ${SITE}/effects.`;
  assert.deepEqual(stubHubLinks(text, SITE), [`${SITE}/charts`, `${SITE}/guides`, `${SITE}/blocks`, `${SITE}/effects`]);
});

test("the final form, child pages and other pages pass", () => {
  const text = `${SITE}/charts/ ${SITE}/charts/line-chart ${SITE}/components/button ${SITE}/foundations ${SITE}/charts-x`;
  assert.deepEqual(stubHubLinks(text, SITE), []);
});
