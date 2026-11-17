"use client";

import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "../../components/button/button";
import { resolveLanguage, tokenize, type TokenKind } from "../../components/code-block/tokenize";
import { type AiChatLabels } from "./types";
import { CopyIcon, CheckIcon } from "./icons";

/* ---------- Copy ---------- */

/** The chat's polite live region: nested parts call the function in this context to announce a message to screen readers. */
export const AnnounceContext = createContext<(text: string) => void>(() => undefined);
/** Returns the announce function of the enclosing chat's live region (a no-op outside one). */
export const useContextAnnounce = () => useContext(AnnounceContext);

/** Copies text to the clipboard; reports the result to `onResult` and returns `[copied, copy]`, where `copied` is true for a moment after a success. */
export function useCopy(onResult: (ok: boolean) => void) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onResult(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1600);
      } catch {
        onResult(false);
      }
    },
    [onResult],
  );
  return [copied, copy] as const;
}

/** Class names for each syntax-token kind of the code block, from the theme's `--sheen-code-*` tokens (at least 4.5:1 on glass, light and dark). */
export const tokenClass: Record<TokenKind, string | undefined> = {
  plain: undefined,
  comment: "text-(--sheen-code-comment) italic",
  keyword: "text-(--sheen-code-keyword)",
  string: "text-(--sheen-code-string)",
  number: "text-(--sheen-code-number)",
  literal: "text-(--sheen-code-literal)",
  function: "text-(--sheen-code-function)",
  type: "text-(--sheen-code-type)",
  tag: "text-(--sheen-code-tag)",
  attr: "text-(--sheen-code-attr) italic",
  property: "text-(--sheen-code-property)",
  variable: "text-(--sheen-code-variable)",
  punctuation: "text-(--sheen-code-punctuation)",
};

/**
 * Syntax-highlighted code (the theme's own tokenizer). A scanner, so code that is still
 * streaming in (an unclosed string or comment) simply colours to the end.
 */
export function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const tokens = useMemo(() => (resolveLanguage(lang) === "text" ? null : tokenize(code, lang)), [code, lang]);
  if (!tokens) return <>{code}</>;
  return (
    <>
      {tokens.map((token, i) => {
        const cls = tokenClass[token.kind];
        return cls ? (
          <span key={i} className={cls}>
            {token.text}
          </span>
        ) : (
          <Fragment key={i}>{token.text}</Fragment>
        );
      })}
    </>
  );
}

/** A fenced code block of a chat message: the language label, the code and a copy button. */
export function CodeBlock({
  lang,
  code,
  caret,
  labels,
}: {
  lang: string;
  code: string;
  caret: ReactNode;
  labels: AiChatLabels;
}) {
  const announce = useContextAnnounce();
  const nameId = useId();
  const [copied, copy] = useCopy(
    useCallback((ok: boolean) => announce(ok ? labels.copied : labels.copyFailed), [announce, labels]),
  );
  return (
    <div className="min-w-0 overflow-hidden rounded-sheen-md border border-sheen-border bg-sheen-surface/60">
      <div className="flex items-center justify-between gap-3 border-b border-sheen-border bg-sheen-hover py-1 pe-1 ps-3.5 any-pointer-coarse:min-h-11">
        <span
          aria-hidden
          className="font-sheen-mono text-2xs font-semibold tracking-wide text-sheen-fg-muted lowercase"
        >
          {lang || labels.code}
        </span>
        <span id={nameId} hidden>
          {labels.codeRegion(lang)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-2xs"
          onClick={() => void copy(code)}
          leading={copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          aria-label={copied ? labels.copied : labels.copyCode}
        >
          <span aria-hidden>{copied ? labels.copied : labels.copy}</span>
        </Button>
      </div>
      {/* Focusable so long lines can be scrolled sideways with the keyboard. A named group, not a
          landmark: a reply with several snippets shouldn't fill the landmark list. */}
      <div
        role="group"
        aria-labelledby={nameId}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so long lines can be scrolled without a mouse (WCAG 2.1.1)
        tabIndex={0}
        className="overflow-x-auto overscroll-x-contain [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus"
      >
        <pre className="w-fit min-w-full p-3.5 font-sheen-mono text-[0.8125rem] leading-relaxed [overflow-wrap:normal]">
          <code>
            <HighlightedCode code={code} lang={lang} />
            {caret}
          </code>
        </pre>
      </div>
    </div>
  );
}
