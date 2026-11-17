"use client";

import { useId, useState, type SubmitEvent, type ReactNode } from "react";

import { cn } from "../lib/cn";
import { HEADING_TAGS, headingTag, type HeadingLevelOption } from "../lib/heading";
import { Button } from "../components/button/button";
import { Input } from "../components/input/input";
import { MailIcon } from "./icons";

/** A link of `SiteFooter`. */
export type FooterLink = {
  /** The link text. */
  label: string;
  /** The link target. */
  href: string;
  /** Opens in a new tab with `rel="noreferrer"`. */
  external?: boolean;
};

/** A titled list of links in `SiteFooter`. */
export type FooterColumn = {
  /** Stable key. */
  id: string;
  /** The column heading. */
  title: string;
  /** The links, top to bottom. */
  links: FooterLink[];
};

/** A social link of `SiteFooter`: an icon button named by its label. */
export type FooterSocial = {
  /** Stable key. */
  id: string;
  /** The accessible name, for example "GitHub". */
  label: string;
  /** The profile address. */
  href: string;
  /** The glyph (an inline `<svg>`); it is `aria-hidden`, the label names the link. */
  icon: ReactNode;
};

/** Every string `SiteFooter` renders or announces, so the block can be translated. */
export type SiteFooterLabels = {
  /** Heading of the newsletter form. */
  newsletterTitle: string;
  /** Text under the newsletter heading. */
  newsletterText: string;
  /** Label of the email field (visually hidden, the heading is the visible name). */
  email: string;
  /** Placeholder of the email field. */
  emailPlaceholder: string;
  /** Text of the subscribe button. */
  subscribe: string;
  /** Message under an invalid email. */
  invalidEmail: string;
  /** Message announced after subscribing. */
  subscribed: string;
  /** Message when `onSubscribe` throws an error without a message. */
  genericError: string;
  /** Accessible name of the list of social links. */
  social: string;
  /** Accessible name of the list of legal links. */
  legal: string;
};

/** The English {@link SiteFooterLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultSiteFooterLabels: SiteFooterLabels = {
  newsletterTitle: "Stay in the loop",
  newsletterText: "One short email when something ships. No spam, unsubscribe any time.",
  email: "Email address",
  emailPlaceholder: "you@example.com",
  subscribe: "Subscribe",
  invalidEmail: "Enter a valid email address.",
  subscribed: "Thanks. Check your inbox to confirm.",
  genericError: "Something went wrong. Try again.",
  social: "Social links",
  legal: "Legal",
};

/** Props of `SiteFooter`. */
export type SiteFooterProps = {
  /** The logo and name at the start of the footer (`ReactNode`). */
  brand?: ReactNode;
  /** A line about the product under the brand (`ReactNode`). */
  description?: ReactNode;
  /** The link columns (`FooterColumn[]`). Each one is a `<nav>` named by its title. */
  columns?: FooterColumn[];
  /** Shows the newsletter form and is called with the trimmed email (`(email: string) => void | Promise<void>`). Return a promise to show the loading state; throw to show an error. Without it there is no form. */
  onSubscribe?: (email: string) => void | Promise<void>;
  /** The social icon links (`FooterSocial[]`). */
  socials?: FooterSocial[];
  /** The copyright line in the legal row (`ReactNode`). */
  copyright?: ReactNode;
  /** The legal links in the legal row, for example privacy and terms (`FooterLink[]`). */
  legalLinks?: FooterLink[];
  /**
   * Level of the column and newsletter headings (`1` to `6`); `"none"` renders plain text.
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** Overrides for the block's strings (`Partial<SiteFooterLabels>`). */
  labels?: Partial<SiteFooterLabels>;
  /** Adds extra classes to the `<footer>` (`string`). */
  className?: string;
};

const linkStyle =
  "inline-flex min-h-8 items-center rounded-sheen-sm text-sm text-sheen-fg-muted transition-colors duration-(--sheen-duration-fast) hover:text-sheen-fg focus-visible:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11";

function FooterAnchor({ link, className }: { link: FooterLink; className?: string }) {
  return (
    <a
      href={link.href}
      className={cn(linkStyle, className)}
      {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {link.label}
    </a>
  );
}

function Newsletter({
  onSubscribe,
  labels,
  Title,
}: {
  onSubscribe: (email: string) => void | Promise<void>;
  labels: SiteFooterLabels;
  Title: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  const titleId = useId();
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const email = ((new FormData(form).get("email") as string | null) ?? "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(labels.invalidEmail);
      setDone(false);
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      await onSubscribe(email);
      setDone(true);
      form.reset();
    } catch (cause) {
      setDone(false);
      setError(cause instanceof Error && cause.message ? cause.message : labels.genericError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-slot="site-footer-newsletter" className="flex flex-col gap-3">
      <Title id={titleId} className="text-sm font-semibold text-sheen-fg">
        {labels.newsletterTitle}
      </Title>
      <p className="text-sm text-pretty text-sheen-fg-muted">{labels.newsletterText}</p>
      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className="flex flex-col gap-2 @sm:flex-row @sm:items-start"
      >
        <Input
          aria-label={labels.email}
          name="email"
          type="email"
          placeholder={labels.emailPlaceholder}
          autoCapitalize="none"
          spellCheck={false}
          leading={<MailIcon />}
          error={error}
          className="min-w-0 flex-1"
          onChange={() => {
            if (error) setError(undefined);
          }}
        />
        <Button type="submit" variant="primary" loading={busy} className="shrink-0">
          {labels.subscribe}
        </Button>
      </form>
      {/* A polite live region that is always present, so the confirmation is announced when its text appears. */}
      <p role="status" className={cn("text-sm text-sheen-success-text", !done && "sr-only")}>
        {done ? labels.subscribed : ""}
      </p>
    </div>
  );
}

/**
 * A site footer on glass: the brand and a line about it, link columns, an optional newsletter form, social icon links and
 * a legal row. Use it as the last block of a marketing page; every part is optional, so a short footer can be just the
 * brand and the legal row.
 *
 * Props (see `SiteFooterProps`): `brand`, `description`, `columns` (`{ id, title, links }[]`), `onSubscribe(email)`,
 * `socials` (`{ id, label, href, icon }[]`), `copyright`, `legalLinks`, `headingLevel` (`2`), `labels`
 * (`Partial<SiteFooterLabels>`), `className`.
 *
 * Keyboard: Tab walks the columns' links top to bottom, then the newsletter field and button, the social links and the
 * legal links; Enter submits the newsletter form. A failed check keeps focus in the field with its message linked.
 * Accessibility: a `<footer>` (the page's contentinfo landmark); each column is a `<nav>` named by its heading; social
 * links are named by `label` and their icons are `aria-hidden`; the subscribe confirmation is a live `status`; links
 * grow to 44 px on touch devices.
 * Glass and motion: one glass panel (a single backdrop blur) holding all the content; a few hover colour fades, no movement.
 * Reduced transparency makes the panel opaque.
 *
 * @example
 * ```tsx
 * import { SiteFooter } from "@sheenui/theme";
 *
 * // `subscribe` is your own function; throw from it to show the error under the field.
 * declare function subscribe(email: string): Promise<void>;
 *
 * export function Example() {
 *   return (
 *     <SiteFooter
 *       brand="Acme"
 *       description="Tools for small teams."
 *       columns={[
 *         { id: "product", title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }] },
 *         { id: "company", title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
 *       ]}
 *       onSubscribe={async (email) => {
 *         await subscribe(email);
 *       }}
 *       copyright="© 2026 Acme"
 *       legalLinks={[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/site-footer
 */
export function SiteFooter({
  brand,
  description,
  columns = [],
  onSubscribe,
  socials = [],
  copyright,
  legalLinks = [],
  headingLevel = 2,
  labels,
  className,
}: SiteFooterProps) {
  const L = { ...defaultSiteFooterLabels, ...labels };
  const Heading = HEADING_TAGS[headingLevel];
  const idBase = useId();
  const hasTop = Boolean(brand) || Boolean(description) || Boolean(onSubscribe) || columns.length > 0;
  const hasBottom = Boolean(copyright) || legalLinks.length > 0 || socials.length > 0;

  return (
    <footer
      data-slot="site-footer"
      className={cn(
        "@container glass-2 relative isolate w-full min-w-0 rounded-sheen-xl px-6 py-10 @3xl:px-10 @3xl:py-12",
        className,
      )}
    >
      {/* The lit top edge of the panel: a hairline that fades to both sides. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--sheen-glass-highlight),transparent)]"
      />
      {hasTop && (
        <div className="grid gap-10 @4xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] @4xl:gap-16">
          <div className="flex min-w-0 flex-col gap-6">
            {(brand ?? description) && (
              <div className="flex flex-col gap-3">
                {brand && <div className="font-sheen-display text-xl font-semibold tracking-tight">{brand}</div>}
                {description && <p className="max-w-xs text-sm text-pretty text-sheen-fg-muted">{description}</p>}
              </div>
            )}
            {onSubscribe && <Newsletter onSubscribe={onSubscribe} labels={L} Title={headingTag(headingLevel, 0)} />}
          </div>

          {columns.length > 0 && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 @2xl:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
              {columns.map((column) => (
                <div
                  key={column.id}
                  role="group"
                  aria-labelledby={`${idBase}-${column.id}`}
                  className="flex min-w-0 flex-col gap-3"
                >
                  <Heading id={`${idBase}-${column.id}`} className="text-sm font-semibold text-sheen-fg">
                    {column.title}
                  </Heading>
                  <ul className="flex list-none flex-col gap-0.5 p-0">
                    {column.links.map((link) => (
                      <li key={link.href + link.label}>
                        <FooterAnchor link={link} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {hasBottom && (
        <div
          className={cn(
            "flex flex-col gap-4 @2xl:flex-row @2xl:items-center @2xl:justify-between",
            hasTop && "mt-10 border-t border-sheen-border pt-6",
          )}
        >
          <div className="flex flex-col gap-1 @2xl:flex-row @2xl:items-center @2xl:gap-6">
            {copyright && <p className="text-sm text-sheen-fg-muted">{copyright}</p>}
            {legalLinks.length > 0 && (
              <ul aria-label={L.legal} className="flex list-none flex-wrap gap-x-5 p-0">
                {legalLinks.map((link) => (
                  <li key={link.href + link.label}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          {socials.length > 0 && (
            <ul aria-label={L.social} className="flex list-none gap-1 p-0">
              {socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noreferrer"
                    className="flex size-11 items-center justify-center rounded-sheen-full text-sheen-fg-muted transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus [&_svg]:size-5"
                  >
                    <span aria-hidden className="flex">
                      {social.icon}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </footer>
  );
}
