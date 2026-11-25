// node:test for scripts/check-outdated.mjs: the gate must fail closed when the registry is unreachable.
import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluate } from "../check-outdated.mjs";

test("an empty report with exit 0 passes", () => {
  assert.equal(evaluate({ status: 0, stdout: "{}", stderr: "" }).code, 0);
});

test("a held-back documented pin passes", () => {
  const out = JSON.stringify({ typescript: { current: "6.0.3", latest: "7.0.0" } });
  assert.equal(evaluate({ status: 1, stdout: out, stderr: "" }).code, 0);
});

test("an undocumented outdated dependency fails", () => {
  const out = JSON.stringify({ react: { current: "19.0.0", latest: "19.9.0" } });
  const r = evaluate({ status: 1, stdout: out, stderr: "" });
  assert.equal(r.code, 1);
  assert.match(r.lines[0], /react 19\.0\.0 -> 19\.9\.0/);
});

test("an unreachable registry fails closed with a clear message", () => {
  const r = evaluate({
    status: 1,
    stdout: "",
    stderr: "ERR_PNPM_META_FETCH_FAIL getaddrinfo ENOTFOUND registry.npmjs.org",
  });
  assert.equal(r.code, 1);
  assert.match(r.lines[0], /registry unreachable/);
});

test("--offline-ok downgrades an unreachable registry to a warning", () => {
  const r = evaluate({ status: 1, stdout: "{}", stderr: "fetch failed" }, { offlineOk: true });
  assert.equal(r.code, 0);
  assert.match(r.lines[0], /WARNING registry unreachable/);
});
