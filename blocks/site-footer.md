Canonical: https://lokendra-builds.github.io/sheenui/blocks/site-footer

# React Site Footer with Newsletter and Socials

URL: https://lokendra-builds.github.io/sheenui/blocks/site-footer
Sidebar name: Site footer

A React site footer block on glass with link columns, a newsletter field with validation, social icon links and a legal row. Accessible, MIT.

What it is: SiteFooter is a React site footer block on one glass panel: brand and blurb, link columns that are navigation landmarks, a newsletter field with validation, social icon links and a legal row. Every part is optional.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/site-footer.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Site footer

Files to copy from `theme/src/`:

- `blocks/{site-footer.tsx, icons.tsx}`
- `components/button/`
- `components/input/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, heading.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: site-footer. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { type FooterColumn, SiteFooter } from "@/components/sheenui/blocks/site-footer";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type FooterColumn, SiteFooter } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| brand | ReactNode | optional, no default | The logo and name at the start of the footer (ReactNode). |
| description | ReactNode | optional, no default | A line about the product under the brand (ReactNode). |
| columns | FooterColumn[] | [] | The link columns (FooterColumn[]). Each one is a <nav> named by its title. |
| onSubscribe | ((email: string) => void \| Promise<void>) | optional, no default | Shows the newsletter form and is called with the trimmed email ((email: string) => void \| Promise<void>). Return a promise to show the loading state; throw to show an error. Without it there is no form. |
| socials | FooterSocial[] | [] | The social icon links (FooterSocial[]). |
| copyright | ReactNode | optional, no default | The copyright line in the legal row (ReactNode). |
| legalLinks | FooterLink[] | [] | The legal links in the legal row, for example privacy and terms (FooterLink[]). |
| headingLevel | HeadingLevelOption | 2 | Level of the column and newsletter headings (1 to 6); "none" renders plain text. |
| labels | Partial<SiteFooterLabels> | defaultSiteFooterLabels | Every other string, for translation: labels={{ newsletterTitle: "…" }}; omitted keys keep the English of defaultSiteFooterLabels. All 10 keys of SiteFooterLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the <footer> (string). |

## Example 1 of 2: Full footer

Try the newsletter field with a bad address, then a good one: the message under it is announced. Without onSubscribe the form is not rendered.

```tsx
import { SiteFooter, type FooterColumn } from "@/components/sheenui/blocks/site-footer";
// Package build (after the first npm release, or a packed tarball): import { SiteFooter, type FooterColumn } from "@sheenui/theme";

// Your call; throw to show the error under the field
async function subscribe(email: string) {
  const res = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("We could not subscribe that address.");
}

const columns: FooterColumn[] = [
  { id: "product", title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }] },
  { id: "company", title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
];

export function Example() {
  return (
    <SiteFooter
      brand="Acme"
      description="Tools for small teams who like their software calm."
      columns={columns}
      onSubscribe={async (email) => {
        await subscribe(email);
      }}
      socials={[
        {
          id: "code",
          label: "Source code",
          href: "https://example.com/code",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m8 8-4 4 4 4M16 8l4 4-4 4" />
            </svg>
          ),
        },
      ]}
      copyright="© 2026 Acme, Inc."
      legalLinks={[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }]}
    />
  );
}
```

## Example 2 of 2: Minimal

Every part is optional: a brand and a legal row make a short footer.

```tsx
import { SiteFooter } from "@/components/sheenui/blocks/site-footer";
// Package build (after the first npm release, or a packed tarball): import { SiteFooter } from "@sheenui/theme";

export function Example() {
  return (
    <SiteFooter
      brand="Acme"
      copyright="© 2026 Acme, Inc."
      legalLinks={[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }]}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Column links top to bottom, then the newsletter field and button, the social links and the legal links. |
| Enter | Follow a link, or submit the newsletter form. |

## Accessibility

- A <footer> (the page's contentinfo landmark). Each column is a <nav> named by its heading; with headingLevel 'none' the names fall away with the headings.
- Social links are named by their label and their icons are aria-hidden. External links open a new tab with rel='noreferrer'.
- The subscribe confirmation is a polite status region that is always in the page, so it is announced when its text appears.
- Links and icon buttons grow to 44 px on touch devices. One glass panel holds everything, so there is one backdrop blur.

## All exports on this page

- SiteFooter — A site footer on glass: the brand and a line about it, link columns, an optional newsletter form, social icon links and a legal row.
- defaultSiteFooterLabels — The English SiteFooterLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the site footer

- Use SiteFooter as the last block of a marketing page, with three or four columns of links, a short description of the product and a legal row with the privacy and terms links.
- Use onSubscribe(email) to show the newsletter form; return a promise for the loading state or throw to show an error, and the confirmation is announced in a polite status region.
- Use socials with a label and an icon for each profile; the label names the link and the icon is aria-hidden, so the row stays accessible.
- Skip the newsletter form when you have no list yet; leave out onSubscribe and the form is not rendered at all, so there is no dead field.
- Pair it with HeroSection and FeatureGrid above it, and keep it to one glass panel so a page stays within the backdrop-blur budget.


## Frequently asked questions

### How do I build a site footer in React with SiteFooter?

Pass brand, description, columns as { id, title, links } and legalLinks, plus copyright. Add onSubscribe for the newsletter form and socials for icon links. Every prop is optional, so a short footer can be just a brand and a legal row.

### How does the newsletter field validate and report?

On submit it checks the address and shows an error under the field linked with aria-describedby; a valid one calls onSubscribe, shows a loading button and then announces labels.subscribed in a status region that is always present, so screen readers hear it.

### Are the footer columns accessible?

The component is a footer element, the page's contentinfo landmark. Each link column is a nav named by its heading, social links are named by their label, and every link grows to 44 px on touch devices. With headingLevel set to none the headings become plain text.

### Can links open in a new tab?

Yes. Set external: true on a link and it opens in a new tab with rel="noreferrer". Social links always do. Keep external links to places that need it, because a new tab is a surprise for keyboard and screen reader users.


## Related pages

- [Hero section](https://lokendra-builds.github.io/sheenui/blocks/hero-section)
- [Input](https://lokendra-builds.github.io/sheenui/components/input)
- [Navbar](https://lokendra-builds.github.io/sheenui/navigation/navbar)
- [404 page](https://lokendra-builds.github.io/sheenui/blocks/not-found-page)
- [Announcement banner](https://lokendra-builds.github.io/sheenui/blocks/announcement-banner)
- [Glass login](https://lokendra-builds.github.io/sheenui/blocks/glass-login)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
