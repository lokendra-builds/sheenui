"use client";

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { CopyButton, defaultCopyLabels, type CopyLabels } from "./copy-button";

/**
 * Every user-facing string of `DescriptionList` (accessible names, announcements, placeholders); pass
 * a partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type DescriptionListLabels = CopyLabels & {
  /** Screen-reader text for an empty value (shown as an em dash). */
  empty: string;
  /** Accessible name of a row's copy button. */
  copyValue: (label: string) => string;
};

/**
 * Default English strings of `DescriptionListLabels`; spread it and override single keys to reword.
 * Plain data with no DOM access: safe to read while prerendering. The module is `"use client"`, so a
 * React Server Component receives a client reference instead of the object: read it from a client
 * component.
 */
export const defaultDescriptionListLabels: DescriptionListLabels = {
  ...defaultCopyLabels,
  empty: "Not set",
  copyValue: (label) => `Copy ${label.toLowerCase()}`,
};

/**
 * `inline` puts the term left and the value right (stacks when the list itself is narrow); `stacked`
 * puts the term above the value.
 */
export type DescriptionListLayout = "stacked" | "inline";

type ListContextValue = {
  layout: DescriptionListLayout;
  size: "sm" | "md";
  labels: DescriptionListLabels;
};

const ListContext = createContext<ListContextValue>({
  layout: "inline",
  size: "md",
  labels: defaultDescriptionListLabels,
});

/** One pair, for the `items` shorthand. */
export type DescriptionListEntry = {
  /** Stable key (defaults to the label when it is a string). */
  id?: string;
  /** Holds the term, rendered as the `<dt>`. */
  label: ReactNode;
  /** The value (the `<dd>`). Empty (undefined, null, "") shows an em dash. */
  value?: ReactNode;
  /** Text copied by the row's copy button (shows the button). */
  copyValue?: string;
  /** Shows small muted text under the value. */
  hint?: ReactNode;
};

/**
 * Props of `DescriptionList`: the native `<dl>` props plus its own options, each documented on its
 * field.
 */
export type DescriptionListProps = Omit<ComponentProps<"dl">, "children"> & {
  /** "inline" (default): label left, value right. "stacked": label above value. */
  layout?: DescriptionListLayout;
  /** "plain" (default): no surface. "glass": its own glass card. */
  variant?: "plain" | "glass";
  /** Draws a hairline between rows. Default true. */
  dividers?: boolean;
  /** Sets the row text: "sm" 13px, "md" 14px (default). */
  size?: "sm" | "md";
  /** Works as shorthand for a list of DescriptionItem children. */
  items?: DescriptionListEntry[];
  /** Holds `DescriptionItem` rows, shown after any `items`. */
  children?: ReactNode;
  /** Any UI string (i18n). */
  labels?: Partial<DescriptionListLabels>;
};

/**
 * DescriptionList: key / value pairs for detail views (a record in a side drawer, an order
 * summary, settings read-outs), as a real `<dl>`.
 *
 * Layouts:
 * - "stacked": label above value. Best for narrow panels and long values.
 * - "inline": label on the left, value on the right. The list is its own size container, so it
 *   falls back to stacked when IT is narrow (a 320px drawer), whatever the screen width.
 *
 * Variants: "plain" (no surface, for use inside a glass panel) or "glass" (its own glass card).
 * `dividers` draws a hairline between rows. Each row can have a copy button (`copyValue`):
 * always visible (touch screens can't hover), quieter until its row is hovered. Pass rows as
 * `DescriptionItem` children or with the `items` shorthand; `labels` translates the UI strings.
 *
 * Keyboard: the list itself is not focusable; each copy button is a normal tab stop (Enter or Space copies).
 * Accessibility: `<dl>` with one `<div>` per pair (valid HTML), `<dt>` for the label, `<dd>` for the value.
 * An empty value shows an em dash and reads "Not set" to screen readers; copying announces "Copied" politely.
 * Forced colors keep the dividers visible.
 * Glass and motion: "plain" is flat; "glass" is one `glass-2` surface. No motion beyond the copy button's
 * check-mark swap, which is instant with reduced motion.
 *
 * @example
 * ```tsx
 * import { Badge, DescriptionItem, DescriptionList } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <DescriptionList layout="inline" dividers>
 *         <DescriptionItem label="Email" copyValue="ada@example.com">ada@example.com</DescriptionItem>
 *         <DescriptionItem label="Plan"><Badge>Pro</Badge></DescriptionItem>
 *         <DescriptionItem label="Phone" />
 *       </DescriptionList>
 *
 *       <DescriptionList items={[{ label: "Order", value: "#1042", copyValue: "ord_8Hk2Qx" }]} />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function DescriptionList({
  layout = "inline",
  variant = "plain",
  dividers = true,
  size = "md",
  items,
  labels: labelsProp,
  className,
  children,
  ...props
}: DescriptionListProps) {
  const labels = { ...defaultDescriptionListLabels, ...labelsProp };
  return (
    <ListContext value={{ layout, size, labels }}>
      <dl
        data-slot="description-list"
        data-layout={layout}
        className={cn(
          // Its own size container: "inline" stacks when the list itself is narrow.
          "@container/dl flex w-full min-w-0 flex-col",
          dividers && "divide-y divide-sheen-border forced-colors:divide-[CanvasText]",
          variant === "glass" && "glass-2 rounded-sheen-lg px-4 sm:px-5",
          className,
        )}
        {...props}
      >
        {items?.map((item, index) => (
          <DescriptionItem
            key={item.id ?? (typeof item.label === "string" ? item.label : index)}
            label={item.label}
            copyValue={item.copyValue}
            hint={item.hint}
          >
            {item.value}
          </DescriptionItem>
        ))}
        {children}
      </dl>
    </ListContext>
  );
}

/**
 * Props of `DescriptionItem`: the native `<div>` props plus its own options, each documented on its
 * field.
 */
export type DescriptionItemProps = Omit<ComponentProps<"div">, "children"> & {
  /** Holds the term, rendered as the `<dt>`. */
  label: ReactNode;
  /** The value. Empty (undefined, null, "") shows an em dash. */
  children?: ReactNode;
  /** Shows a copy button that copies this text. */
  copyValue?: string;
  /** Sets the accessible name of the copy button. Defaults to labels.copyValue(label) when the label is text. */
  copyLabel?: string;
  /** Shows small muted text under the value. */
  hint?: ReactNode;
  /** Adds a class name to the `<dt>` element. */
  labelClassName?: string;
  /** Adds a class name to the `<dd>` element. */
  valueClassName?: string;
};

function isEmpty(value: ReactNode) {
  return value === undefined || value === null || value === false || value === "";
}

/**
 * One label / value pair of a `DescriptionList`: a `<div>` holding a `<dt>` and a `<dd>`. The value is the
 * `children`; empty values (undefined, null, false, "") show an em dash that reads "Not set" to screen readers.
 *
 * - `copyValue` adds a copy button for that text (`copyLabel` names it; it defaults to "Copy <label>" when the label is text).
 * - `hint` is small muted text under the value; `labelClassName` and `valueClassName` style the `<dt>` and `<dd>`.
 * - It reads `layout`, `size` and `labels` from the surrounding `DescriptionList`.
 *
 * Keyboard: only the copy button is a tab stop. Accessibility: valid `dl > div > dt + dd` markup. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { DescriptionItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DescriptionItem label="Customer" hint="Since 2023" copyValue="cus_1042">
 *       Ada Lovelace
 *     </DescriptionItem>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function DescriptionItem({
  label,
  children,
  copyValue,
  copyLabel,
  hint,
  labelClassName,
  valueClassName,
  className,
  ...props
}: DescriptionItemProps) {
  const { layout, size, labels } = useContext(ListContext);
  const inline = layout === "inline";
  const text = size === "sm" ? "text-[0.8125rem]" : "text-sm";
  const name = copyLabel ?? (typeof label === "string" ? labels.copyValue(label) : labels.copy);

  return (
    <div
      data-slot="description-item"
      className={cn(
        "group/dl-row grid min-w-0 grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-1",
        size === "sm" ? "py-2.5" : "py-3",
        // Inline: label | value, once the list is at least 24rem wide.
        inline && "@sm/dl:grid-cols-[minmax(7rem,2fr)_minmax(0,3fr)] @sm/dl:items-baseline",
        className,
      )}
      {...props}
    >
      <dt className={cn("min-w-0 font-medium text-sheen-fg-muted [overflow-wrap:anywhere]", text, labelClassName)}>
        {label}
      </dt>
      <dd className={cn("flex min-w-0 items-start gap-2 text-sheen-fg", text, valueClassName)}>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 [overflow-wrap:anywhere]">
          {isEmpty(children) ? (
            <span>
              <span aria-hidden className="text-sheen-fg-subtle">
                —
              </span>
              <span className="sr-only">{labels.empty}</span>
            </span>
          ) : (
            <div className="min-w-0">{children}</div>
          )}
          {hint && <span className="text-xs text-sheen-fg-muted">{hint}</span>}
        </div>
        {copyValue !== undefined && (
          <CopyButton
            value={copyValue}
            label={name}
            labels={labels}
            // Always there (touch screens can't hover), quieter until the row is hovered.
            className="-my-1 text-sheen-fg-subtle group-hover/dl-row:text-sheen-fg-muted"
          />
        )}
      </dd>
    </div>
  );
}
