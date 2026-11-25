// node:test: no file git would push may name or point at the owner's local-only notes. Comments and messages must stand alone.
// Two checks. (1) Structural, needs no names: a pushed file may only mention an upper-case `NAME.md` that is itself pushed.
// (2) Name-based: the owner's private note names live in the git-ignored `.handoff/readme-index.json` (key `privateDocs`,
// plus the notes readme-index already lists); a public clone has no such file, so that check skips with a message.
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
    ].filter((n) => typeof n === "string" && n.endsWith(".md"));
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
    for (const m of text.matchAll(/\b([A-Z][A-Z0-9_]{2,})\.md\b/g)) {
      if (!pushed.has(m[0])) offenders.push(`${file}:${line}: ${m[0]}`);
    }
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
