import { Fragment, type ReactNode } from "react";

import { href } from "../router";

const CODE =
  "rounded-sheen-sm bg-sheen-hover px-1 py-px font-sheen-mono text-[0.85em] text-sheen-fg [overflow-wrap:anywhere]";

const TOKEN =
  /\[`([^`]+)`\]\((\/[^)\s]*)\)|`([^`]+)`|\{@link\s+([^\s}|]+)(?:[\s|]+([^}]*))?\}|(?<![\w`])(<\/?[A-Za-z][\w-]*\/?>)/g;

/**
 * Inline rendering of the generated descriptions: `code` becomes <code>, `[`Name`](/route)` (the generator's resolved link) a link, and `{@link Name}` links to the page that documents
 * Name (or is code when no page does). A bare element name such as <mark> or </ins> renders as code as well. Everything else stays plain text, so the props tables never print raw backticks.
 */
export function RichText({
  children,
  pageFor,
}: {
  children: ReactNode;
  pageFor?: (name: string) => string | undefined;
}) {
  // A markdown bullet list ("intro\n- one\n- two", kept by the props generator) renders as a real <ul>, not a run-on paragraph.
  if (typeof children === "string" && children.includes("\n- ")) {
    const [intro = "", ...items] = children.split("\n- ");
    return (
      <>
        {intro && <RichInline pageFor={pageFor}>{intro}</RichInline>}
        <ul className="mt-1.5 list-disc space-y-1 pl-5">
          {items.map((item) => (
            <li key={item}>
              <RichInline pageFor={pageFor}>{item}</RichInline>
            </li>
          ))}
        </ul>
      </>
    );
  }
  return <RichInline pageFor={pageFor}>{children}</RichInline>;
}

function RichInline({
  children,
  pageFor,
}: {
  children: ReactNode;
  /** Export name -> the docs page that covers it, for `{@link Name}`. Left out, such a link renders as code: the route -> exports table (route-exports.ts) is not part of every page's JavaScript. */
  pageFor?: (name: string) => string | undefined;
}) {
  if (typeof children !== "string" || !/[`{<]/.test(children)) return <>{children}</>;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of children.matchAll(TOKEN)) {
    const at = m.index;
    if (at > last) out.push(children.slice(last, at));
    const groups: (string | undefined)[] = m;
    const code = groups[3] ?? groups[6]; // a bare element name (`<mark>`) reads as code too
    if (groups[1] !== undefined) {
      // [`Name`](/route): a link the generator resolved
      out.push(
        <a
          key={key++}
          href={href(groups[2] ?? "/")}
          className="font-sheen-mono text-[0.85em] text-sheen-accent underline underline-offset-2 hover:text-sheen-fg any-pointer-coarse:py-3.5"
        >
          {groups[1]}
        </a>,
      );
    } else if (code !== undefined) {
      out.push(
        <code key={key++} className={CODE}>
          {code}
        </code>,
      );
    } else {
      const name = groups[4] ?? "";
      const label = (groups[5] ?? "").trim() || name;
      const page = pageFor?.(name);
      out.push(
        page ? (
          <a
            key={key++}
            href={href(page)}
            className="font-sheen-mono text-[0.85em] text-sheen-accent underline underline-offset-2 hover:text-sheen-fg any-pointer-coarse:py-3.5"
          >
            {label}
          </a>
        ) : (
          <code key={key++} className={CODE}>
            {label}
          </code>
        ),
      );
    }
    last = at + m[0].length;
  }
  if (last < children.length) out.push(children.slice(last));
  return <Fragment>{out}</Fragment>;
}
