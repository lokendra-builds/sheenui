import assert from "node:assert/strict";
import { test } from "node:test";
import { findLiterals } from "../check-motion-literals.mjs";

const lib = "theme/src/components/x/x.tsx";
const hits = (text, rel = lib) => findLiterals(rel, text).map((h) => h.split("  ")[1]?.split(":")[0]);

test("flags a literal seconds duration in a Tailwind animate class", () => {
  assert.deepEqual(hits('<i className="motion-ok:animate-[sheen-shine_2.4s_var(--sheen-ease-in-out)_infinite]" />'), [
    "literal seconds duration",
  ]);
});

test("flags seconds in CSS animation and transition shorthands", () => {
  assert.equal(hits("a { animation: spin 1.2s var(--sheen-ease-out) infinite; }", "theme/src/styles/x.css").length, 1);
  assert.equal(hits("a { transition: opacity .5s var(--sheen-ease-out); }", "theme/src/styles/x.css").length, 1);
  assert.equal(hits("a { animation-delay: -9s; }", "theme/src/styles/x.css").length, 1);
});

test("flags keyword easings in Motion props, CSS and Tailwind", () => {
  assert.equal(hits('const t = { duration: duration.fast, ease: "easeOut" };').length, 1);
  assert.equal(hits('const t = { ease: ["easeOut", "easeIn"] };').length >= 1, true);
  assert.equal(hits('<i className="transition-opacity ease-out" />').length, 1);
  assert.equal(hits("a { transition: color var(--sheen-duration-fast) ease; }", "theme/src/styles/x.css").length, 1);
  assert.equal(
    hits("a { animation: x var(--sheen-duration-slow) ease-in-out infinite; }", "theme/src/styles/x.css").length,
    1,
  );
});

test("token references, linear loops, zero seconds, data labels and comments are fine", () => {
  assert.deepEqual(
    findLiterals(
      lib,
      [
        '<i className="animate-[sheen-shine_var(--sheen-duration-loop-slow)_var(--sheen-ease-in-out)_infinite]" />',
        'const t = { duration: 3, ease: "linear" };',
        '<i className="[transition:visibility_0s_linear_var(--sheen-duration-fast)]" />',
        'const row = ["Build", "4.2s"];',
        "// animation: x 2s ease-in-out",
        "{/* a pulse under 5s ease-out */}",
        "const t = { ease: ease.out, transition: { ease: ease.exit } };",
      ].join("\n"),
    ),
    [],
  );
});

test("a token definition is allowed in the styles folder only", () => {
  assert.deepEqual(findLiterals("theme/src/styles/presets/x.css", "  --sheen-duration-ambient: 28s;"), []);
  assert.equal(findLiterals("theme/src/components/x/x.css", "  --sheen-duration-ambient: 28s;").length, 1);
});

test("the existing ms, cubic-bezier and ease-array checks still fire", () => {
  assert.equal(hits("a { transition: opacity 300ms; }", "theme/src/styles/x.css").length, 1);
  assert.equal(
    hits("a { transition-timing-function: cubic-bezier(0.1, 0.2, 0.3, 0.4); }", "theme/src/styles/x.css").length,
    1,
  );
  assert.equal(hits("const t = { ease: [0.1, 0.2, 0.3, 0.4] };").length, 1);
});
