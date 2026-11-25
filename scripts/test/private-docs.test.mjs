// node:test: no file git would push may name or point at the owner's local-only notes. Comments and messages must stand alone.
// CONTRIBUTING.md and CHANGELOG.md are public (owner, 25 Nov 2026), so naming them is fine; every other upper-case note is private.
// Two checks. (1) Structural, needs no names: a pushed file may only mention an upper-case `NAME.md` that is itself pushed.
// (2) Name-based: the owner's private note names live in the git-ignored `.handoff/readme-index.json` (key `privateDocs`,
// plus the notes readme-index already lists, minus the public ones); a public clone has no such file, so that check skips.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { test } from "node:test";

import { isAppleDouble } from "../lib/fs-filter.mjs";

const ROOT = join(import.meta.dirname, "..", "..");
const ALLOWED = new Set([".gitignore", "scripts/test/private-docs.test.mjs"]);
const TEXT = /\.(mjs|js|ts|tsx|json|css|html|yml|yaml|md|py|sh)$/;
const GENERATED = /^(docs\/guides\/|demo\/public\/r\/|pnpm-lock)/;
const CONFIG = join(ROOT, ".handoff", "readme-index.json");
/** Notes that are pushed on purpose: the name-based check must not treat them as private even if the local config lists them. */
const PUBLIC_NOTES = new Set(["CONTRIBUTING.md", "CHANGELOG.md"]);

/** Upper-case `NAME.md` mentions in one line that are not in the `pushed` set of file names. */
export function unpushedMentions(text, pushed) {
  return [...text.matchAll(/\b([A-Z][A-Z0-9_]{2,})\.md\b/g)].map((m) => m[0]).filter((name) => !pushed.has(name));
}

function pushable() {
  try {
    return execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 1 << 28,
    })
      .split("\n")
      .filter(Boolean);
  } catch {
    return null;
  }
}

function* lines(files) {
  for (const file of files) {
    if (ALLOWED.has(file) || !TEXT.test(file) || file.split("/").some(isAppleDouble)) continue;
    if (GENERATED.test(file) || file === "registry.json") continue;
    let text;
    try {
      text = readFileSync(join(ROOT, file), "utf8");
    } catch {
      continue;
    }
    const all = text.split("\n");
    for (let i = 0; i < all.length; i++) yield { file, line: i + 1, text: all[i] };
  }
}

/** Names of the local-only notes, from the optional git-ignored config; null when it is absent or unreadable. */
function localNames() {
  if (!existsSync(CONFIG)) return null;
  try {
    const cfg = JSON.parse(readFileSync(CONFIG, "utf8"));
    const names = [
      ...(cfg.privateDocs ?? []),
      ...(cfg.notes ?? []).map((n) => n.file),
      cfg.changelog,
      cfg.openTasks?.file,
    ].filter((n) => typeof n === "string" && n.endsWith(".md") && !PUBLIC_NOTES.has(n));
    return [...new Set(names)];
  } catch {
    return null;
  }
}

test("public files only mention upper-case notes that are pushed too", (t) => {
  const files = pushable();
  if (!files) return t.skip("not a git checkout");
  const pushed = new Set(files.map((f) => basename(f)));
  const offenders = [];
  for (const { file, line, text } of lines(files)) {
    for (const name of unpushedMentions(text, pushed)) offenders.push(`${file}:${line}: ${name}`);
  }
  assert.deepEqual(offenders, []);
});

test("public files never name the private notes listed in the local config", (t) => {
  const files = pushable();
  if (!files) return t.skip("not a git checkout");
  const names = localNames();
  if (!names?.length)
    return t.skip("no .handoff/readme-index.json here (a public clone has no private notes to check against)");
  const pattern = new RegExp(
    `\\b(${names.map((n) => n.replace(/\.md$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\.md\\b`,
  );
  const offenders = [];
  for (const { file, line, text } of lines(files)) {
    if (pattern.test(text)) offenders.push(`${file}:${line}: ${text.trim().slice(0, 100)}`);
  }
  assert.deepEqual(offenders, []);
});

test("CONTRIBUTING.md and CHANGELOG.md are public files; a link to a note that is not pushed still fails", (t) => {
  const files = pushable();
  if (!files) return t.skip("not a git checkout");
  const pushed = new Set(files.map((f) => basename(f)));
  assert.ok(
    pushed.has("CONTRIBUTING.md") && pushed.has("CHANGELOG.md"),
    "CONTRIBUTING.md and CHANGELOG.md must be pushed",
  );
  assert.deepEqual(unpushedMentions("see [CONTRIBUTING.md](CONTRIBUTING.md) and CHANGELOG.md", pushed), []);
  assert.deepEqual(unpushedMentions("see [NOTES_PRIVATE.md](NOTES_PRIVATE.md)", pushed), [
    "NOTES_PRIVATE.md",
    "NOTES_PRIVATE.md",
  ]);
});
