"use client";

import { Fragment, useMemo, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { type AiChatLabels } from "./types";
import { CodeBlock } from "./code";

/* ---------- Light Markdown ---------- */

/** One block of the small Markdown subset: a paragraph, heading, bullet or numbered list, or fenced code. */
export type Block =
  | { type: "p"; lines: string[] }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[]; start: number }
  | { type: "code"; lang: string; code: string };

/** Matches a code-fence line (three backticks and an optional language). */
export const FENCE = /^\s*```\s*([\w+#.-]*)\s*$/;
/** Matches the start of a bullet list line. */
export const BULLET = /^\s*[-*•]\s+/;
/** Matches the start of a numbered list line and captures its number. */
export const NUMBERED = /^\s*(\d+)[.)]\s+/;
/** Matches the start of a heading line (one to six `#`). */
export const HEADING = /^#{1,6}\s+/;
/** Matches a blank line. */
export const BLANK = /^\s*$/;

/** Splits Markdown source into blocks (pure, safe to call on the server). */
export function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  /** Line `k` (callers check `k < lines.length`; the fallback only satisfies the index type). */
  const lineAt = (k: number) => lines[k] ?? "";
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lineAt(i);
    const fence = FENCE.exec(line);
    if (fence) {
      // An unclosed fence (mid-stream) runs to the end of the text.
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lineAt(i))) body.push(lineAt(i++));
      i++;
      blocks.push({ type: "code", lang: fence[1] ?? "", code: body.join("\n") });
    } else if (BLANK.test(line)) {
      i++;
    } else if (HEADING.test(line)) {
      blocks.push({ type: "h", text: line.replace(HEADING, "") });
      i++;
    } else if (BULLET.test(line)) {
      const items: string[] = [];
      while (i < lines.length && BULLET.test(lineAt(i))) items.push(lineAt(i++).replace(BULLET, ""));
      blocks.push({ type: "ul", items });
    } else if (NUMBERED.test(line)) {
      const start = Number(NUMBERED.exec(line)?.[1]);
      const items: string[] = [];
      while (i < lines.length && NUMBERED.test(lineAt(i))) items.push(lineAt(i++).replace(NUMBERED, ""));
      blocks.push({ type: "ol", items, start });
    } else {
      const para: string[] = [];
      while (
        i < lines.length &&
        !BLANK.test(lineAt(i)) &&
        !FENCE.test(lineAt(i)) &&
        !BULLET.test(lineAt(i)) &&
        !NUMBERED.test(lineAt(i)) &&
        !HEADING.test(lineAt(i))
      ) {
        para.push(lineAt(i++));
      }
      blocks.push({ type: "p", lines: para });
    }
  }
  return blocks;
}

/** Matches an inline `[text](url)` link; only http, https and mailto targets are allowed. */
export const LINK = /^\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)/;

/**
 * Inline spans: `code`, **bold** and [links](https://…) (http, https and mailto only).
 * In a partial reply (streaming, stopped or failed) an unclosed ` or ** styles the rest of
 * the text, so markers never flash or get left behind.
 */
export function renderInline(text: string, partial: boolean, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let buffer = "";
  let n = 0;
  const flush = () => {
    if (buffer) out.push(buffer);
    buffer = "";
  };
  let i = 0;
  while (i < text.length) {
    const link = text[i] === "[" ? LINK.exec(text.slice(i)) : null;
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end === -1 && !partial) {
        buffer += "`";
        i++;
        continue;
      }
      flush();
      const k = `${key}-${n++}`;
      out.push(
        <code
          key={k}
          className="rounded-[0.375rem] border border-sheen-border bg-sheen-hover px-1.5 py-px font-sheen-mono text-[0.85em] [overflow-wrap:anywhere]"
        >
          {end === -1 ? text.slice(i + 1) : text.slice(i + 1, end)}
        </code>,
      );
      i = end === -1 ? text.length : end + 1;
    } else if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end === -1 && !partial) {
        buffer += "**";
        i += 2;
        continue;
      }
      flush();
      const inner = end === -1 ? text.slice(i + 2) : text.slice(i + 2, end);
      const k = `${key}-${n++}`;
      out.push(
        <strong key={k} className="font-semibold text-sheen-fg">
          {renderInline(inner, partial, k)}
        </strong>,
      );
      i = end === -1 ? text.length : end + 2;
    } else if (link) {
      flush();
      const k = `${key}-${n++}`;
      out.push(
        <a
          key={k}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[0.25rem] font-medium text-sheen-accent underline decoration-sheen-accent/40 underline-offset-[0.2em] hover:decoration-sheen-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
        >
          {link[1]}
        </a>,
      );
      i += link[0].length;
    } else {
      buffer += text[i] ?? "";
      i++;
    }
  }
  flush();
  return out;
}

/** The blinking dot at the end of a streaming reply. */
export function Caret() {
  return (
    <span
      aria-hidden
      className="ms-1 inline-block size-[0.55em] translate-y-[-0.05em] rounded-full bg-sheen-accent align-middle motion-ok:animate-pulse forced-colors:bg-[CanvasText]"
    />
  );
}

/** Renders the supported Markdown subset (paragraphs, headings, lists, code, bold, italic, links) as React elements, never as raw HTML. */
export function Markdown({
  text,
  streaming,
  partial,
  labels,
}: {
  text: string;
  streaming: boolean;
  partial: boolean;
  labels: AiChatLabels;
}) {
  const blocks = useMemo(() => parseBlocks(text), [text]);
  const last = blocks.length - 1;
  const caret = (index: number) => (streaming && index === last ? <Caret /> : null);

  if (blocks.length === 0) return streaming ? <Caret /> : null;

  return (
    <div className="flex min-w-0 flex-col gap-3 text-[0.9375rem] leading-7 text-sheen-fg [overflow-wrap:anywhere]">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "code":
            return <CodeBlock key={index} lang={block.lang} code={block.code} caret={caret(index)} labels={labels} />;
          case "h":
            return (
              <p key={index} className="font-semibold">
                {renderInline(block.text, partial)}
                {caret(index)}
              </p>
            );
          case "ul":
          case "ol": {
            const List = block.type === "ul" ? "ul" : "ol";
            return (
              <List
                key={index}
                start={block.type === "ol" ? block.start : undefined}
                className={cn(
                  "flex flex-col gap-1.5 ps-5",
                  block.type === "ul"
                    ? "list-disc marker:text-sheen-fg-subtle"
                    : "list-decimal marker:font-medium marker:text-sheen-fg-muted",
                )}
              >
                {block.items.map((item, j) => (
                  <li key={j} className="ps-1">
                    {renderInline(item, partial)}
                    {j === block.items.length - 1 && caret(index)}
                  </li>
                ))}
              </List>
            );
          }
          default:
            return (
              <p key={index}>
                {block.lines.map((line, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {renderInline(line, partial)}
                  </Fragment>
                ))}
                {caret(index)}
              </p>
            );
        }
      })}
    </div>
  );
}
