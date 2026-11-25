// Draws the 1200×630 Open Graph card of every page into demo/public/og/<slug>.webp (plus <slug>.jpg for the pages that
// advertise a JPEG: home, hubs and guides; committed; Vite copies them to dist).
// Title and lede come from the prerendered HTML of a finished build, so run `pnpm build` first (it reads
// DIST_DIR, default "dist"): `pnpm og:build`. Cards are deterministic; re-run after a title or description changes.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";
import { renderOgCard } from "./lib/og.mjs";

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(DEMO, process.env.DIST_DIR ?? "dist");
const OUT = join(DEMO, "public/og");

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("._")) continue; // macOS AppleDouble metadata, not source
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "og" || entry.name === "r" || entry.name === "assets") continue;
      yield* htmlFiles(full);
    } else if (entry.name.endsWith(".html")) yield full;
  }
}

/** First sentence(s) of the description that fit in about 120 characters. */
function lede(text) {
  if (text.length <= 120) return text;
  const cut = text.slice(0, 118);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

mkdirSync(OUT, { recursive: true });
const seen = new Set();
let total = 0;
let max = 0;
for (const file of htmlFiles(DIST)) {
  const root = parse(readFileSync(file, "utf8"));
  const meta = (key) => root.querySelector(`meta[property="${key}"]`)?.getAttribute("content") ?? "";
  const slug = /\/og\/([\w-]+)\.\w+$/.exec(meta("og:image"))?.[1];
  if (!slug || seen.has(slug)) continue;
  seen.add(slug);
  const home = slug === "home";
  const group = slug.includes("-") ? slug.split("-")[0] : "";
  const card = {
    title: meta("og:title"),
    eyebrow: home
      ? "Free · MIT · React 19.2+ + Tailwind CSS v4"
      : group
        ? group.charAt(0).toUpperCase() + group.slice(1)
        : "SheenUI",
    subtitle: home ? "Glass that catches light." : lede(meta("og:description")),
  };
  const buffer = await renderOgCard(card);
  writeFileSync(join(OUT, `${slug}.webp`), buffer);
  // The pages whose og:image is a JPEG (home, hubs, guides: ogFormat in src/seo/site.ts) get the same card as one too.
  const format = /\.(\w+)$/.exec(meta("og:image"))?.[1];
  if (format === "jpg") writeFileSync(join(OUT, `${slug}.jpg`), await renderOgCard(card, "jpg"));
  total += buffer.length;
  max = Math.max(max, buffer.length);
  if (buffer.length > 60 * 1024) console.error(`og: ${slug}.webp is ${(buffer.length / 1024).toFixed(0)} KB (> 60 KB)`);
}
console.log(
  `og: ${seen.size} cards, ${(total / 1048576).toFixed(2)} MB, largest ${(max / 1024).toFixed(0)} KB -> public/og`,
);
