import { type AiChatLabels } from "./types";
import { parseBlocks } from "./markdown";

/* ---------- Small utilities ---------- */

/** Creates the `AbortError` a cancelled request rejects with. */
export function abortError() {
  return new DOMException("Aborted", "AbortError");
}

/** Resolves with `promise`, or rejects as soon as `signal` aborts. */
export function abortable<T>(promise: PromiseLike<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });
    Promise.resolve(promise).then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        // Anything that is not an Error carries no message (the reply then shows the fallback text).
        reject(error instanceof Error ? error : new Error("", { cause: error }));
      },
    );
  });
}

/** Resolves after `ms` milliseconds, or rejects with an abort error when the signal fires first. */
export function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(abortError());
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/** True when a value is an async iterable of strings (a streamed reply). */
export function isAsyncIterable(value: unknown): value is AsyncIterable<string> {
  return value != null && typeof (value as AsyncIterable<string>)[Symbol.asyncIterator] === "function";
}

/** Inline Markdown markers stripped: what a screen reader should hear. */
export function plainInline(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, "$1")
    .trim();
}

/** Longest announcement before it is cut short (at a word boundary). */
export const ANNOUNCE_MAX = 300;

/**
 * A finished reply as one short announcement: plain text, each code block named
 * ("Code, tsx") instead of read line by line, and cut short after about 300 characters.
 */
export function toAnnouncement(markdown: string, labels: AiChatLabels) {
  const parts = parseBlocks(markdown).map((block) => {
    switch (block.type) {
      case "code":
        return `${labels.codeRegion(block.lang)}.`;
      case "h":
        return plainInline(block.text);
      case "ul":
      case "ol":
        return block.items.map(plainInline).join("; ");
      default:
        return block.lines.map(plainInline).join(" ");
    }
  });
  const text = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= ANNOUNCE_MAX) return text;
  const cut = text.slice(0, ANNOUNCE_MAX);
  const space = cut.lastIndexOf(" ");
  return `${(space > ANNOUNCE_MAX * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:]+$/, "")}… ${labels.replyContinues}`;
}

/** Formats a byte count for display in the given locale (for example "1.2 MB"). */
export function formatBytes(bytes: number, locale: string) {
  const mb = bytes >= 1_000_000;
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: mb ? "megabyte" : "kilobyte",
    unitDisplay: "short",
    maximumFractionDigits: mb ? 1 : 0,
  }).format(Math.max(mb ? bytes / 1_000_000 : bytes / 1000, mb ? 0 : 1));
}
