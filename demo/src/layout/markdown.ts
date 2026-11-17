/**
 * A small Markdown reader for the guides in docs/guides: front matter, headings, paragraphs,
 * bullet and numbered lists (with nested blocks), tables, fenced code, and inline code, bold,
 * italic and links. That is everything the twelve guides and the install reference use; it is
 * not CommonMark (no HTML, images, block quotes or nested emphasis), and the guides stay inside
 * that subset on purpose.
 *
 * The guide pages parse the file's text while the site is prerendered, so the HTML a crawler
 * receives is the finished article; the browser parses the same text once to hydrate it.
 */

export type Inline =
  string | { t: "code"; v: string } | { t: "b" | "i"; c: Inline[] } | { t: "a"; href: string; c: Inline[] };

export type Block =
  | { t: "h"; level: 2 | 3 | 4; id: string; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | { t: "list"; ordered: boolean; start: number; items: Block[][] }
  | { t: "table"; head: Inline[][]; rows: Inline[][][] }
  | { t: "code"; lang: string; code: string };

export type Guide = {
  /** Front matter: title, description, slug, route, targetKeyword, secondaryKeywords, updated, relatedRoutes. */
  meta: Partial<Record<string, string | string[]>>;
  /** The first `# ` heading: the page's h1. */
  title: string;
  blocks: Block[];
};

/* ---------- Inline ---------- */

const ESCAPABLE = /[\\`*_{}[\]()#+\-.!|~<>]/;

function plain(text: string): string {
  return text.replace(/\\([\\`*_{}[\]()#+\-.!|~<>])/g, "$1");
}

/** Index of the closing `close` after `from`, skipping nothing (the guides never nest the same mark). */
function findClose(text: string, close: string, from: number) {
  let i = from;
  while (i < text.length) {
    if (text[i] === "\\") i += 2;
    else if (text.startsWith(close, i)) return i;
    else i++;
  }
  return -1;
}

/** Index of the "]" that closes a link label starting at `from` and is followed by "(", or -1. */
function labelEnd(text: string, from: number) {
  let depth = 1;
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\\") i++;
    else if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end < 0) return -1;
      i = end;
    } else if (ch === "[") depth++;
    else if (ch === "]" && --depth === 0) return text[i + 1] === "(" ? i : -1;
  }
  return -1;
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer) out.push(plain(buffer));
    buffer = "";
  };

  let i = 0;
  while (i < text.length) {
    const ch = text[i] ?? "";
    if (ch === "\\" && i + 1 < text.length && ESCAPABLE.test(text[i + 1] ?? "")) {
      buffer += text.slice(i, i + 2);
      i += 2;
    } else if (ch === "`") {
      let ticks = 1;
      while (text[i + ticks] === "`") ticks++;
      const fence = "`".repeat(ticks);
      const end = text.indexOf(fence, i + ticks);
      if (end < 0) {
        buffer += fence;
        i += ticks;
      } else {
        flush();
        out.push({ t: "code", v: text.slice(i + ticks, end).replace(/^ (.*) $/, "$1") });
        i = end + ticks;
      }
    } else if (ch === "[") {
      // [label](url): the label may hold code spans, bold and italic. A "[" whose "]" is not
      // followed by "(" ("[0, 1]") is plain text.
      const closeLabel = labelEnd(text, i + 1);
      const closeUrl = closeLabel < 0 ? -1 : text.indexOf(")", closeLabel + 2);
      if (closeLabel < 0 || closeUrl < 0) {
        buffer += ch;
        i++;
      } else {
        flush();
        out.push({
          t: "a",
          href: text.slice(closeLabel + 2, closeUrl).trim(),
          c: parseInline(text.slice(i + 1, closeLabel)),
        });
        i = closeUrl + 1;
      }
    } else if (ch === "*" && text[i + 1] === "*") {
      const end = findClose(text, "**", i + 2);
      if (end < 0) {
        buffer += "**";
        i += 2;
      } else {
        flush();
        out.push({ t: "b", c: parseInline(text.slice(i + 2, end)) });
        i = end + 2;
      }
    } else if ((ch === "*" || ch === "_") && text[i + 1] !== " " && !/\w/.test(text[i - 1] ?? " ")) {
      const end = findClose(text, ch, i + 1);
      if (end < 0 || text[end - 1] === " " || (ch === "_" && /\w/.test(text[end + 1] ?? " "))) {
        buffer += ch;
        i++;
      } else {
        flush();
        out.push({ t: "i", c: parseInline(text.slice(i + 1, end)) });
        i = end + 1;
      }
    } else {
      buffer += ch;
      i++;
    }
  }
  flush();
  return out;
}

/** The text of inline content (for heading ids and the table of contents). */
export function inlineText(inline: Inline[]): string {
  return inline
    .map((node) => (typeof node === "string" ? node : node.t === "code" ? node.v : inlineText(node.c)))
    .join("");
}

/* ---------- Blocks ---------- */

const FENCE = /^(\s*)(`{3,})\s*([^`]*)$/;
const BULLET = /^(\s*)([-*+])\s+(.*)$/;
const NUMBERED = /^(\s*)(\d+)[.)]\s+(.*)$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;

function slugify(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
  used.add(id);
  return id;
}

const splitRow = (line: string): string[] => {
  const cells: string[] = [];
  let cell = "";
  let inCode = false;
  const body = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  for (let i = 0; i < body.length; i++) {
    const ch = body[i] ?? "";
    if (ch === "\\" && body[i + 1] === "|") {
      cell += "|";
      i++;
    } else if (ch === "`") {
      inCode = !inCode;
      cell += ch;
    } else if (ch === "|" && !inCode) {
      cells.push(cell.trim());
      cell = "";
    } else cell += ch;
  }
  cells.push(cell.trim());
  return cells;
};

const isTableRule = (line: string | undefined) =>
  !!line && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line);

/** The line at `i`, or "" past the ends (the parser checks bounds first; this keeps strict index access happy). */
const lineAt = (lines: readonly string[], i: number) => lines[i] ?? "";

/** Capture group `n` of a match, or "" when the group did not take part. */
const group = (match: RegExpExecArray, n: number) => match[n] ?? "";

function parseBlocks(lines: string[], used: Set<string>): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lineAt(lines, i);
    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const indent = group(fence, 1).length;
      const ticks = group(fence, 2);
      const lang = group(fence, 3).trim().split(/\s+/)[0] ?? "";
      const body: string[] = [];
      i++;
      while (i < lines.length && !new RegExp(`^\\s*${ticks}\`*\\s*$`).test(lineAt(lines, i))) {
        const raw = lineAt(lines, i);
        body.push(raw.slice(Math.min(indent, raw.length - raw.trimStart().length)));
        i++;
      }
      i++;
      blocks.push({ t: "code", lang, code: body.join("\n") });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = group(heading, 1).length;
      const c = parseInline(group(heading, 2));
      if (level >= 2)
        blocks.push({ t: "h", level: Math.min(level, 4) as 2 | 3 | 4, id: slugify(inlineText(c), used), c });
      i++;
      continue;
    }

    if (line.includes("|") && isTableRule(lines[i + 1])) {
      const head = splitRow(line).map(parseInline);
      const rows: Inline[][][] = [];
      i += 2;
      while (i < lines.length && lineAt(lines, i).trim() && lineAt(lines, i).includes("|")) {
        rows.push(splitRow(lineAt(lines, i)).map(parseInline));
        i++;
      }
      blocks.push({ t: "table", head, rows });
      continue;
    }

    const marker = BULLET.exec(line) ?? NUMBERED.exec(line);
    if (marker) {
      const ordered = /\d/.test(group(marker, 2));
      const kind = ordered ? NUMBERED : BULLET;
      const base = group(marker, 1).length;
      const start = ordered ? Number(group(marker, 2)) : 1;
      const items: Block[][] = [];

      while (i < lines.length) {
        const head = kind.exec(lineAt(lines, i));
        if (!head || group(head, 1).length !== base) break;
        const width = head[0].length - group(head, 3).length; // marker plus spaces: how far continuation lines are indented
        const item: string[] = [group(head, 3)];
        i++;
        while (i < lines.length) {
          const next = lineAt(lines, i);
          if (!next.trim()) {
            // A blank line stays in the item only when the next real line is indented under it.
            let j = i;
            while (j < lines.length && !lineAt(lines, j).trim()) j++;
            const after = lineAt(lines, j);
            if (j < lines.length && after.length - after.trimStart().length >= width) {
              item.push("");
              i++;
              continue;
            }
            break;
          }
          const indent = next.length - next.trimStart().length;
          if (indent >= width) {
            item.push(next.slice(width));
            i++;
          } else if (indent <= base && (kind.test(next) || HEADING.test(next) || FENCE.test(next))) break;
          else if (indent <= base && !item.some((l) => FENCE.test(l))) {
            item.push(next.trim()); // a lazy continuation line
            i++;
          } else break;
        }
        items.push(parseBlocks(item, used));
        while (
          i < lines.length &&
          !lineAt(lines, i).trim() &&
          kind.test(lines[i + 1] ?? "") &&
          (kind.exec(lines[i + 1] ?? "")?.[1]?.length ?? -1) === base
        )
          i++;
      }
      blocks.push({ t: "list", ordered, start, items });
      continue;
    }

    // Paragraph: runs until a blank line or the start of another block.
    const paragraph: string[] = [line.trim()];
    i++;
    while (
      i < lines.length &&
      lineAt(lines, i).trim() &&
      !FENCE.test(lineAt(lines, i)) &&
      !HEADING.test(lineAt(lines, i)) &&
      !BULLET.test(lineAt(lines, i)) &&
      !NUMBERED.test(lineAt(lines, i)) &&
      !(lineAt(lines, i).includes("|") && isTableRule(lines[i + 1]))
    ) {
      paragraph.push(lineAt(lines, i).trim());
      i++;
    }
    blocks.push({ t: "p", c: parseInline(paragraph.join(" ")) });
  }
  return blocks;
}

/** Front matter written as `key: JSON value` lines between two `---` lines. */
function parseFrontMatter(source: string): { meta: Guide["meta"]; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { meta: {}, body: source };
  const meta: Guide["meta"] = {};
  for (const line of (match[1] ?? "").split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim();
    const raw = line.slice(colon + 1).trim();
    try {
      meta[key] = JSON.parse(raw) as string | string[];
    } catch {
      meta[key] = raw;
    }
  }
  return { meta, body: source.slice(match[0].length) };
}

/** Parse one guide's Markdown text. */
export function parseGuide(source: string): Guide {
  const { meta, body } = parseFrontMatter(source.replace(/\r\n/g, "\n"));
  const lines = body.split("\n");
  const h1 = lines.findIndex((line) => /^#\s+\S/.test(line));
  const title =
    h1 < 0 ? String(meta.title ?? "") : inlineText(parseInline(lineAt(lines, h1).replace(/^#\s+/, "").trim()));
  const rest = h1 < 0 ? lines : [...lines.slice(0, h1), ...lines.slice(h1 + 1)];
  return { meta, title, blocks: parseBlocks(rest, new Set()) };
}
