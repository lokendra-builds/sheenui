/**
 * File helpers for FileUpload: `accept` matching, human-readable sizes and file kinds.
 */

export type FileKind = "image" | "video" | "audio" | "pdf" | "archive" | "sheet" | "doc" | "code" | "text" | "file";

/** Split an `accept` string ("image/*,.pdf, application/zip") into lower-case tokens. */
export function parseAccept(accept: string | undefined): string[] {
  return (accept ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/** Does a MIME type match one token? ("image/png" vs "image/*" or "image/png"). Extension tokens never match a MIME. */
function mimeMatches(mime: string, token: string): boolean {
  if (token.startsWith(".")) return false;
  if (token.endsWith("/*")) return mime.startsWith(token.slice(0, -1));
  return mime === token;
}

/** Whether a file is allowed by an `accept` string, by MIME type or extension. Empty accept allows everything. */
export function matchesAccept(file: { name: string; type: string }, accept: string | undefined): boolean {
  const tokens = parseAccept(accept);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const mime = (file.type || "").toLowerCase();
  return tokens.some((token) =>
    token.startsWith(".") ? name.endsWith(token) : mime !== "" && mimeMatches(mime, token),
  );
}

/**
 * During a drag only MIME types are known (no names). True when a type is known and
 * clearly not accepted; unknown types get the benefit of the doubt until the drop.
 */
export function mimeRejected(mime: string, accept: string | undefined): boolean {
  const tokens = parseAccept(accept);
  if (tokens.length === 0 || !mime) return false;
  // An extension-only accept list can't be checked against a MIME type.
  if (tokens.every((t) => t.startsWith("."))) return false;
  return !tokens.some((t) => mimeMatches(mime.toLowerCase(), t));
}

const UNITS = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;

/** 5242880 → "5 MB" (binary steps, the way most upload limits are set). Locale-aware digits and units. */
export function formatBytes(bytes: number, locale?: string): string {
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: UNITS[unit],
    unitDisplay: unit === 0 ? "long" : "short",
    maximumFractionDigits: value >= 100 || unit === 0 ? 0 : 1,
  }).format(value);
}

/** "report.final.PDF" → "pdf" ("" when there is none). */
export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toLowerCase() : "";
}

/* A Map, not an object literal: "x.constructor" or "x.__proto__" must not find Object.prototype members. */
const EXT_KINDS = new Map<string, FileKind>(
  Object.entries({
    pdf: "pdf",
    zip: "archive",
    rar: "archive",
    "7z": "archive",
    gz: "archive",
    tar: "archive",
    csv: "sheet",
    xls: "sheet",
    xlsx: "sheet",
    numbers: "sheet",
    ods: "sheet",
    doc: "doc",
    docx: "doc",
    pages: "doc",
    odt: "doc",
    rtf: "doc",
    key: "doc",
    ppt: "doc",
    pptx: "doc",
    txt: "text",
    md: "text",
    json: "code",
    js: "code",
    ts: "code",
    tsx: "code",
    jsx: "code",
    css: "code",
    html: "code",
    xml: "code",
    yml: "code",
    yaml: "code",
    py: "code",
    svg: "image",
    heic: "image",
  } satisfies Record<string, FileKind>) as [string, FileKind][],
);

/** A coarse kind for picking an icon and a tint. */
export function fileKind(file: { name: string; type: string }): FileKind {
  const mime = (file.type || "").toLowerCase();
  const byExtension = EXT_KINDS.get(fileExtension(file.name));
  if (byExtension) return byExtension;
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("zip") || mime.includes("compressed")) return "archive";
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "sheet";
  if (mime.includes("word") || mime.includes("document")) return "doc";
  if (mime.startsWith("text/")) return "text";
  return "file";
}

/**
 * Short, human names for the accepted types: "image/*,.pdf" → ["Images", "PDF"].
 * Used for the default hint; pass your own `labels.hint` for full control.
 */
export function describeAccept(
  accept: string | undefined,
  names: { image: string; video: string; audio: string },
): string[] {
  return [
    ...new Set(
      parseAccept(accept).map((token) => {
        if (token === "image/*") return names.image;
        if (token === "video/*") return names.video;
        if (token === "audio/*") return names.audio;
        if (token.startsWith(".")) return token.slice(1).toUpperCase();
        const sub = token.split("/")[1] ?? token;
        return (sub.replace(/^x-/, "").replace(/\+.*$/, "").split(".").pop() ?? sub).toUpperCase();
      }),
    ),
  ];
}

/** Same file picked twice (name, size and modification time all match). */
export function isSameFile(a: File, b: File): boolean {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}
