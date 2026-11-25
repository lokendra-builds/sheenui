/**
 * Export a chart as SVG, PNG or CSV, entirely in the browser.
 *
 * Charts are drawn with CSS variables (var(--sheen-chart-1), light-dark() tokens, Tailwind
 * classes), which mean nothing outside the page. serializeChartSvg() clones the SVG and writes
 * every resolved colour, stroke and font onto the clone as plain inline styles, so the file
 * looks exactly like the chart did, in the theme it was exported from.
 */

import { downloadBlob, downloadCsv, toCsv, type CsvValue } from "../../lib/csv";
import { num, type ChartRow, type ChartSeries } from "./chart-utils";

/** A format a chart can be downloaded as: `png`, `svg` or `csv`. */
export type ChartExportFormat = "png" | "svg" | "csv";

/** Options for turning a chart's SVG into a standalone file: background, padding and an optional title. */
export type SerializeChartOptions = {
  /** Background fill. Default: the theme's solid surface colour. null = transparent. */
  background?: string | null;
  /** Space around the chart (px), so labels drawn just outside the plot aren't cut. Default 16. */
  padding?: number;
  /** A title line drawn above the chart. */
  title?: string;
};

const SHAPE_PROPS = [
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "opacity",
] as const;
const TEXT_PROPS = [
  "fill",
  "fill-opacity",
  "opacity",
  "font-family",
  "font-size",
  "font-weight",
  "letter-spacing",
  "text-anchor",
  "dominant-baseline",
] as const;
const STOP_PROPS = ["stop-color", "stop-opacity"] as const;
const GROUP_PROPS = ["opacity"] as const;

function propsFor(tag: string): readonly string[] {
  if (tag === "text" || tag === "tspan" || tag === "textPath") return TEXT_PROPS;
  if (tag === "stop") return STOP_PROPS;
  if (tag === "g" || tag === "svg" || tag === "a") return GROUP_PROPS;
  if (
    tag === "path" ||
    tag === "rect" ||
    tag === "circle" ||
    tag === "line" ||
    tag === "polyline" ||
    tag === "polygon" ||
    tag === "ellipse"
  )
    return SHAPE_PROPS;
  return [];
}

/** Resolve a CSS colour expression (tokens, light-dark(), color-mix()) against `context`. */
export function resolveCssColor(expression: string, context: Element = document.documentElement): string {
  const probe = document.createElement("span");
  probe.style.color = expression;
  probe.style.display = "none";
  context.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

/** The chart's SVG inside `root`: the one marked as a chart, else the largest. */
export function findChartSvg(root: Element | null): SVGSVGElement | null {
  if (!root) return null;
  if (root instanceof SVGSVGElement) return root;
  const marked = root.querySelector<SVGSVGElement>(
    'svg[aria-roledescription="chart"], svg[role="figure"], svg[role="img"], svg[role="group"]',
  );
  if (marked) return marked;
  let best: SVGSVGElement | null = null;
  let area = 0;
  root.querySelectorAll<SVGSVGElement>("svg").forEach((svg) => {
    const r = svg.getBoundingClientRect();
    if (r.width * r.height > area) {
      area = r.width * r.height;
      best = svg;
    }
  });
  return best;
}

/** A standalone SVG document of `svg`, with every style resolved. */
export function serializeChartSvg(svg: SVGSVGElement, { background, padding = 16, title }: SerializeChartOptions = {}) {
  // A chart whose panel is hidden (its card is on the Table tab) measures 0 × 0: fall back to
  // the size it was drawn at, which the chart keeps on its width / height attributes.
  const box = svg.getBoundingClientRect();
  const attr = (name: "width" | "height") => Number.parseFloat(svg.getAttribute(name) ?? "") || 0;
  const width = Math.max(1, Math.round(box.width || attr("width")));
  const height = Math.max(1, Math.round(box.height || attr("height")));
  const clone = svg.cloneNode(true) as SVGSVGElement;

  // Walk the original and the clone together and copy the computed styles across.
  const originals = [svg, ...Array.from(svg.querySelectorAll("*"))];
  const copies = [clone, ...Array.from(clone.querySelectorAll("*"))];
  originals.forEach((el, i) => {
    const copy = copies[i] as (SVGElement | HTMLElement) | undefined;
    if (!copy) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none") {
      copy.setAttribute("display", "none");
      return;
    }
    if (cs.visibility === "hidden") copy.setAttribute("visibility", "hidden");
    for (const prop of propsFor(el.tagName)) {
      const v = cs.getPropertyValue(prop);
      if (!v) continue;
      // Both as an inline style (wins in browsers) and as the presentation attribute: tools that
      // ignore style attributes (some vector editors) still get the resolved value, and no
      // attribute is left holding a var() the file can't resolve.
      copy.style.setProperty(prop, v);
      if (copy.hasAttribute(prop)) copy.setAttribute(prop, v);
    }
    // Glows (drop-shadow filters) only when they actually draw something.
    // eslint-disable-next-line sheen/no-hardcoded-colors -- a string to match in the computed filter (an invisible drop-shadow), not a colour used by the chart
    if (cs.filter && cs.filter !== "none" && !cs.filter.includes("rgba(0, 0, 0, 0)"))
      copy.style.setProperty("filter", cs.filter);
    copy.removeAttribute("class");
    copy.removeAttribute("tabindex");
    copy.removeAttribute("data-slot");
  });

  const titleH = title ? 30 : 0;
  const W = width + padding * 2;
  const H = height + padding * 2 + titleH;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(W));
  clone.setAttribute("height", String(H));
  clone.setAttribute("viewBox", `${-padding} ${-padding - titleH} ${W} ${H}`);
  clone.removeAttribute("role");
  clone.removeAttribute("aria-roledescription");
  clone.removeAttribute("aria-details");
  clone.style.removeProperty("outline");
  clone.style.setProperty("overflow", "visible");

  const ns = "http://www.w3.org/2000/svg";
  const fg = resolveCssColor("var(--sheen-fg)", svg);
  const bg = background === null ? null : (background ?? resolveCssColor("var(--sheen-surface-solid)", svg));
  if (bg) {
    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", String(-padding));
    rect.setAttribute("y", String(-padding - titleH));
    rect.setAttribute("width", String(W));
    rect.setAttribute("height", String(H));
    rect.setAttribute("fill", bg);
    clone.insertBefore(rect, clone.firstChild);
  }
  if (title) {
    const text = document.createElementNS(ns, "text");
    text.setAttribute("x", "0");
    text.setAttribute("y", String(-titleH + 6));
    text.setAttribute("dominant-baseline", "hanging");
    text.setAttribute("fill", fg);
    text.setAttribute("font-family", getComputedStyle(svg).fontFamily || "system-ui, sans-serif");
    text.setAttribute("font-size", "15");
    text.setAttribute("font-weight", "600");
    text.textContent = title;
    clone.appendChild(text);
  }
  const markup = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
  return { markup, width: W, height: H };
}

/** The chart as a PNG (2× by default, for sharp slides and docs). */
export async function chartPngBlob(
  svg: SVGSVGElement,
  { scale, ...options }: SerializeChartOptions & { scale?: number } = {},
) {
  const { markup, width, height } = serializeChartSvg(svg, options);
  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const k = scale ?? Math.min(3, Math.max(2, window.devicePixelRatio || 1));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * k);
    canvas.height = Math.round(height * k);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");
    ctx.scale(k, k);
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Latin letters that Unicode decomposition (NFKD) leaves whole, spelled out in ASCII ("Größe" → "grosse"). */
const LATIN_ASCII: Record<string, string> = {
  ß: "ss",
  æ: "ae",
  œ: "oe",
  ø: "o",
  đ: "d",
  ð: "d",
  ł: "l",
  þ: "th",
  ı: "i",
};

/** File-name-safe slug: "Revenue by channel" → "revenue-by-channel" ("Größe" → "grosse", "Café" → "cafe"). */
export function chartFileName(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[ßæœøđðłþı]/g, (c) => LATIN_ASCII[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "chart";
}

/** Download the chart inside `root` as an SVG or PNG file. Returns false when no chart was found. */
export async function exportChartImage(
  root: Element | null,
  format: "png" | "svg",
  filename: string,
  options: SerializeChartOptions & { scale?: number } = {},
) {
  const svg = findChartSvg(root);
  if (!svg) return false;
  const base = chartFileName(filename);
  if (format === "svg") {
    const { markup } = serializeChartSvg(svg, options);
    downloadBlob(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }), `${base}.svg`);
  } else {
    downloadBlob(await chartPngBlob(svg, options), `${base}.png`);
  }
  return true;
}

/** Options of `chartCsv`: the rows, the index key, the series and the header texts. */
export type ChartCsvOptions = {
  data: readonly ChartRow[];
  index: string;
  series: readonly (ChartSeries & { compareKey?: string })[];
  /** Sets the header of the first column. Default: `index`. */
  indexLabel?: string;
  /** Header texts (`previous`: suffix of previous-period columns). Default `defaultChartCsvLabels`. */
  labels?: Partial<ChartCsvLabels>;
};

/** Header texts of `chartCsv`: `previous` is the suffix added to a previous-period column. */
export type ChartCsvLabels = { previous: string };

/** The English header texts of `chartCsv`; pass `labels` to override any of them. */
export const defaultChartCsvLabels: ChartCsvLabels = { previous: " (previous)" };

/** The chart's data as CSV text: raw numbers (not formatted), one column per series. */
export function chartCsv({ data, index, series, indexLabel, labels }: ChartCsvOptions) {
  const previousLabel = labels?.previous ?? defaultChartCsvLabels.previous;
  const headers = [indexLabel ?? index];
  for (const s of series) {
    headers.push(s.label);
    if (s.compareKey) headers.push(`${s.label}${previousLabel}`);
  }
  const rows: CsvValue[][] = data.map((row) => {
    const out: CsvValue[] = [row[index] ?? ""];
    for (const s of series) {
      out.push(num(row[s.key]));
      if (s.compareKey) out.push(row[s.compareKey] === undefined ? null : num(row[s.compareKey]));
    }
    return out;
  });
  return toCsv(headers, rows);
}

/** CSV from a rendered table (the chart's table view): what you see is what you get. */
export function tableCsv(table: HTMLTableElement) {
  const rows = Array.from(table.rows).map((tr) =>
    Array.from(tr.cells).map((cell) => cell.textContent.replace(/\s+/g, " ").trim()),
  );
  const [headers = [], ...body] = rows;
  return toCsv(headers, body);
}

export { downloadBlob, downloadCsv };
