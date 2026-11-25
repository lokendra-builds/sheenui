// Open Graph cards: 1200×630 WebPs drawn with satori (JSX-less element trees) and rasterised
// with sharp. Used by scripts/og-images.mjs, which writes them to demo/public/og.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import satori from "satori";
import sharp from "sharp";

const require = createRequire(import.meta.url);

/** satori renders variable fonts at one weight only, so the static Inter faces are used. */
function fonts() {
  const dir = dirname(require.resolve("@fontsource/inter/package.json"));
  return [
    { name: "Inter", data: readFileSync(join(dir, "files/inter-latin-400-normal.woff")), weight: 400, style: "normal" },
    { name: "Inter", data: readFileSync(join(dir, "files/inter-latin-700-normal.woff")), weight: 700, style: "normal" },
  ];
}

const h = (type, style, children) => ({ type, props: { style, children } });

/**
 * The brand pieces from public/brand as data URIs satori can draw: the FULL mark (ribbon S + orbit ring + star, for
 * large cards) and the "Sheenui" wordmark (light text). Each comes with its viewBox size, to keep the aspect ratio.
 */
function brandSvg(name) {
  const file = readFileSync(fileURLToPath(new URL(`../../public/brand/${name}`, import.meta.url)));
  const [, w, hgt] = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/.exec(file.toString("utf8")).map(Number);
  return { uri: `data:image/svg+xml;base64,${file.toString("base64")}`, ratio: w / hgt };
}
const MARK = brandSvg("mark-a1.svg");
const WORDMARK = brandSvg("wordmark-dark.svg");
const MARK_HEIGHT = 124;
const WORDMARK_HEIGHT = 50;

/**
 * @param {{ title: string; eyebrow: string; subtitle?: string }} card
 */
function tree({ title, eyebrow, subtitle }) {
  const long = title.length > 44;
  return h(
    "div",
    {
      width: 1200,
      height: 630,
      display: "flex",
      position: "relative",
      backgroundColor: "#0c0a24",
      backgroundImage: "linear-gradient(135deg, #0c0a24 0%, #1d1650 55%, #2a1458 100%)",
      fontFamily: "Inter",
      color: "white",
      overflow: "hidden",
    },
    [
      // Light sources under the glass.
      h("div", {
        position: "absolute",
        left: -140,
        top: -180,
        width: 620,
        height: 620,
        borderRadius: 999,
        backgroundImage: "radial-gradient(circle at center, rgba(124,92,255,0.95) 0%, rgba(124,92,255,0) 70%)",
      }),
      h("div", {
        position: "absolute",
        right: -120,
        top: 60,
        width: 560,
        height: 560,
        borderRadius: 999,
        backgroundImage: "radial-gradient(circle at center, rgba(255,92,168,0.85) 0%, rgba(255,92,168,0) 70%)",
      }),
      h("div", {
        position: "absolute",
        left: 420,
        bottom: -260,
        width: 640,
        height: 640,
        borderRadius: 999,
        backgroundImage: "radial-gradient(circle at center, rgba(79,209,255,0.75) 0%, rgba(79,209,255,0) 70%)",
      }),
      h("div", {
        position: "absolute",
        right: 150,
        bottom: 90,
        width: 180,
        height: 180,
        borderRadius: 999,
        backgroundImage:
          "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0) 72%)",
      }),
      // The glass card.
      h(
        "div",
        {
          position: "absolute",
          left: 64,
          top: 64,
          right: 64,
          bottom: 64,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 60px",
          borderRadius: 40,
          backgroundColor: "rgba(255,255,255,0.10)",
          border: "1.5px solid rgba(255,255,255,0.28)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
        },
        [
          h("div", { display: "flex", flexDirection: "column" }, [
            h(
              "div",
              { fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "#c9b8ff" },
              eyebrow,
            ),
            h(
              "div",
              {
                marginTop: 22,
                fontSize: long ? 56 : 66,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: -1.5,
                maxWidth: 960,
              },
              title,
            ),
            subtitle
              ? h(
                  "div",
                  { marginTop: 22, fontSize: 28, lineHeight: 1.35, color: "rgba(255,255,255,0.82)", maxWidth: 900 },
                  subtitle,
                )
              : null,
          ]),
          h("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
            h("div", { display: "flex", alignItems: "center" }, [
              {
                type: "img",
                props: {
                  src: MARK.uri,
                  height: MARK_HEIGHT,
                  width: Math.round(MARK_HEIGHT * MARK.ratio),
                  style: { marginLeft: -28, marginTop: -12 },
                },
              },
              {
                type: "img",
                props: {
                  src: WORDMARK.uri,
                  height: WORDMARK_HEIGHT,
                  width: Math.round(WORDMARK_HEIGHT * WORDMARK.ratio),
                  style: { marginLeft: -6, marginTop: 14 },
                },
              },
            ]),
            h("div", { fontSize: 26, color: "rgba(255,255,255,0.85)" }, "React · Tailwind · Motion"),
          ]),
        ],
      ),
    ],
  );
}

let fontCache;

/**
 * Draws one card as a 1200×630 buffer: WebP (about 20-50 KB: the stage is smooth gradients) or, for the pages whose
 * og:image is a JPEG (see `ogFormat` in src/seo/site.ts), a JPEG that every link-preview scraper accepts.
 * @param {{ title: string; eyebrow: string; subtitle?: string }} card
 * @param {"webp" | "jpg"} [format]
 * @returns {Promise<Buffer>}
 */
export async function renderOgCard(card, format = "webp") {
  fontCache ??= fonts();
  const svg = await satori(tree(card), { width: 1200, height: 630, fonts: fontCache });
  const image = sharp(Buffer.from(svg));
  return format === "jpg"
    ? image.jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer()
    : image.webp({ quality: 80, effort: 6, smartSubsample: true }).toBuffer();
}
