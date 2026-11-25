// node:test: no file git would push may contain a real-looking email address. Demo and test data use reserved
// example domains only (RFC 2606), so no real person, company or government domain is ever named.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { isAppleDouble } from "../lib/fs-filter.mjs";

const ROOT = join(import.meta.dirname, "..", "..");
const ALLOWED_DOMAIN = /^(example\.(com|org|net)|[a-z0-9.-]+\.example|users\.noreply\.github\.com)$/i;
const SKIP_FILE = /\.(png|jpe?g|webp|avif|gif|ico|svg|woff2?|ttf|otf|mp4|webm|mov|pdf|zip|tgz)$/i;
// `icon@2x.png`, `chunk@1.js`: a file name, not an address.
const FILE_TLD = /\.(png|jpe?g|webp|avif|gif|svg|js|mjs|cjs|ts|tsx|css|json|html|md|woff2?)$/i;
const EMAIL = /[A-Za-z0-9._%+-]+@((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,})/g;

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

test("emails in pushed files use reserved example domains only", (t) => {
  const files = pushable();
  if (!files) return t.skip("not a git checkout");
  const offenders = [];
  for (const file of files) {
    if (SKIP_FILE.test(file) || file.split("/").some(isAppleDouble)) continue;
    let text;
    try {
      text = readFileSync(join(ROOT, file), "utf8");
    } catch {
      continue;
    }
    text.split("\n").forEach((line, i) => {
      for (const m of line.matchAll(EMAIL)) {
        if (FILE_TLD.test(m[1]) || ALLOWED_DOMAIN.test(m[1])) continue;
        offenders.push(`${file}:${i + 1}: ${m[0]}`);
      }
    });
  }
  assert.deepEqual(offenders, []);
});
