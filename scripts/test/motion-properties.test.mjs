import assert from "node:assert/strict";
import { test } from "node:test";
import { check, componentOf } from "../check-motion-properties.mjs";
import { scanSource } from "../lib/motion-scan.mjs";

const props = (file, text) => scanSource(file, text).map((h) => h.property);

test("Tailwind transition utilities: only non-compositor properties are reported", () => {
  assert.deepEqual(props("a.tsx", '<i className="transition-[color,opacity,translate] x" />'), []);
  assert.deepEqual(props("a.tsx", '<i className="motion-ok:transition-[height,opacity] x" />'), ["height"]);
  assert.deepEqual(props("a.tsx", '<i className="transition-[box-shadow,border-color]" />'), ["box-shadow"]);
  assert.deepEqual(props("a.tsx", '<i className="transition-all duration-(--sheen-duration-fast)" />'), ["all"]);
  assert.deepEqual(props("a.tsx", '<i className="transition-shadow" />'), ["box-shadow"]);
});

test("CSS transitions, transition-property lists and keyframes", () => {
  assert.deepEqual(props("a.css", "a { transition: width 1s, transform 1s; }"), ["width"]);
  assert.deepEqual(props("a.css", "a { transition-property: opacity, top; }"), ["top"]);
  assert.deepEqual(
    props("a.css", "@keyframes k { from { transform: none; opacity: 0 } to { box-shadow: 0 0 0 4px red } }"),
    ["box-shadow"],
  );
  assert.deepEqual(props("a.css", "@keyframes k { to { transform: none; opacity: 1; color: red } }"), []);
});

test("Motion props flag layout keys on motion elements only", () => {
  assert.deepEqual(props("a.tsx", "<motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} />"), [
    "height",
    "height",
  ]);
  assert.deepEqual(props("a.tsx", "<motion.rect animate={{ scaleX: 1, x: 4, opacity: 1 }} />"), []);
  assert.deepEqual(props("a.tsx", "<motion.circle animate={{ cx: 4 }} />"), ["cx"]);
  assert.deepEqual(props("a.tsx", "<Stage initial={{ left: 50 }} />"), []);
  assert.deepEqual(props("a.tsx", 'const v = { hidden: { opacity: 0, filter: "blur(8px)" } };'), ["filter"]);
});

test("comments are ignored", () => {
  assert.deepEqual(props("a.css", "/* transition: width 1s */ a { color: red }"), []);
  assert.deepEqual(props("a.tsx", "// transition-[height]\nconst a = 1;"), []);
});

test("componentOf maps files to component names", () => {
  assert.equal(componentOf("theme/src/components/input/input.tsx"), "input");
  assert.equal(componentOf("theme/src/components/charts/population-pyramid.tsx"), "population-pyramid");
  assert.equal(componentOf("theme/src/styles/motion.css"), "styles");
  assert.equal(componentOf("demo/src/index.css"), "demo");
});

const hit = {
  file: "theme/src/components/input/input.tsx",
  line: 3,
  property: "box-shadow",
  via: "tailwind transition",
};
const entry = {
  component: "input",
  property: "box-shadow",
  file: hit.file,
  cap: "150 ms",
  reason: "Focus ring fade, paint-only, nothing moves.",
};

test("check: a hit with a precise exception passes", () => {
  assert.deepEqual(check([hit], [entry]), []);
});

test("check: a hit with no exception fails", () => {
  assert.equal(check([hit], []).length, 1);
});

test("check: an exception for another file or property does not cover the hit", () => {
  assert.equal(
    check([hit], [{ ...entry, file: "theme/src/components/select/select.tsx", component: "select" }]).length >= 1,
    true,
  );
  assert.equal(check([hit], [{ ...entry, property: "filter" }]).length >= 1, true);
});

test("check: a stale exception fails", () => {
  const problems = check([], [entry]);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /stale/);
});

test("check: blanket wildcards are only allowed for colour properties; entries need a file and a cap", () => {
  assert.equal(check([], [{ component: "*", property: "filter", reason: "Some long enough reason." }]).length, 1);
  assert.deepEqual(check([], [{ component: "*", property: "color", reason: "Paint-only state feedback." }]), []);
  assert.equal(
    check([hit], [{ component: "input", property: "box-shadow", reason: "Focus ring fade, paint-only." }]).length >= 1,
    true,
  );
});
