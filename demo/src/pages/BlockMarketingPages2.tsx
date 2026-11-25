import { wait } from "../demo-utils";
import { useState } from "react";
import { Button, Input, useToast, type AnnouncementTone, type FooterColumn, type FooterSocial } from "@sheenui/theme";

import { AnnouncementBannerStage, ContactFormStage, NotFoundStage, SiteFooterStage } from "./BlockStages.marketing";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import * as PROPS from "../generated/component-props";
import { BASE_PATH } from "../seo/site";
import { lazyBlock } from "../layout/lazy-block";

const AnnouncementBanner = lazyBlock(
  () => import("../../../theme/src/blocks/announcement-banner").then((m) => m.AnnouncementBanner),
  { minHeight: "24rem" },
);
const ContactForm = lazyBlock(() => import("../../../theme/src/blocks/contact-form").then((m) => m.ContactForm), {
  minHeight: "24rem",
});
const NotFound = lazyBlock(() => import("../../../theme/src/blocks/not-found-page").then((m) => m.NotFound), {
  minHeight: "24rem",
});
const SiteFooter = lazyBlock(() => import("../../../theme/src/blocks/site-footer").then((m) => m.SiteFooter), {
  minHeight: "24rem",
});

const HookFormDemo = lazyBlock(() => import("./BlockMarketingPages2.hook-form").then((m) => m.HookFormDemo), {
  minHeight: "30rem",
});

/** A docs route as a real address under the site base (the Code panel shows the plain path). */
const site = (path: string) => `${BASE_PATH}${path.replace(/^\//, "")}`;

/* =====================================================================
 * Contact form
 * ===================================================================== */

/** The "Contact form" docs page (/blocks/contact-form): live examples, props and notes. */
export function ContactFormPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Block"
      title="Contact form"
      description="Name, email and message on glass with inline validation, a loading button and a success seal that lights green. It validates on its own, or hands that job to react-hook-form."
      source="theme/src/blocks/contact-form.tsx"
    >
      <ContactFormStage />
      <Example
        title="Plain onSubmit"
        stageClassName="min-h-[36rem] p-3 sm:p-10"
        description="Submit it empty to see the messages and the focus move, then fill it in. onSubmit returns a promise, so the button shows its loading light until it settles; throw from it to show an error under the form."
        code={`
import { ContactForm } from "@sheenui/theme";

// Your call; throw to show the error under the form
async function sendMessage(values: { name: string; email: string; message: string }) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error("We could not send that. Try again in a minute.");
}

export function Example() {
  return (
    <ContactForm
      eyebrow="Contact"
      title="Talk to us"
      description="Questions, feedback or a project in mind. We reply within one working day."
      onSubmit={async (values) => {
        await sendMessage(values);
      }}
    />
  );
}`}
      >
        <ContactForm
          headingLevel="none"
          eyebrow="Contact"
          title="Talk to us"
          description="Questions, feedback or a project in mind. We reply within one working day."
          onSubmit={async (values) => {
            await wait(1200);
            toast.success("Message sent", `We will reply to ${values.email}.`);
          }}
        />
      </Example>

      <Example
        title="With react-hook-form"
        stageClassName="min-h-[36rem] p-3 sm:p-10"
        description="validate={false} turns the block's own checks off. fieldProps takes register(...) for each field, errors takes formState.errors, and status follows isSubmitting and isSubmitSuccessful. The state light and the success seal work the same."
        code={`
import { useForm } from "react-hook-form";
import { ContactForm, type ContactFormStatus, type ContactFormValues } from "@sheenui/theme";

declare function sendMessage(values: ContactFormValues): Promise<void>;

export function Example() {
  const { register, handleSubmit, reset, formState } = useForm<ContactFormValues>();
  const { errors, isSubmitting, isSubmitSuccessful } = formState;
  const status: ContactFormStatus = isSubmitting ? "submitting" : isSubmitSuccessful ? "success" : "idle";

  return (
    <ContactForm
      title="Write to us"
      validate={false}
      status={status}
      errors={{ name: errors.name?.message, email: errors.email?.message, message: errors.message?.message }}
      fieldProps={{
        name: register("name", { required: "Enter your name." }),
        email: register("email", {
          required: "Enter your email.",
          pattern: { value: /^\\S+@\\S+\\.\\S+$/, message: "Enter a valid email address." },
        }),
        message: register("message", { required: "Write a message.", minLength: { value: 10, message: "Write at least 10 characters." } }),
      }}
      onSubmit={() => handleSubmit(sendMessage)()}
      onReset={() => reset()}
    />
  );
}`}
      >
        <HookFormDemo />
      </Example>

      <PropsTable of={PROPS.ContactForm} />
      <KeyboardTable
        rows={[
          ["Tab", "Name, email, message, then the send button."],
          ["Enter", "In a single-line field: submit the form."],
          ["Tab after success", "Focus has moved to the success message; Tab reaches 'Send another message'."],
        ]}
      />
      <A11yNotes
        notes={[
          "A real <form> with noValidate. Errors are visible text linked with aria-describedby; a failed check moves focus to the first invalid field.",
          "The success view is a status region and receives focus; the outcome is always text, never light alone.",
          "The form and the success view share one grid cell, so the card never changes height.",
          "The button glows while sending (state light) and the seal's check is drawn once. Reduced motion: the seal fades in and the check appears at once.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Site footer
 * ===================================================================== */

const columns: FooterColumn[] = [
  {
    id: "product",
    title: "Product",
    links: [
      { label: "Features", href: "https://example.com/features" },
      { label: "Pricing", href: "https://example.com/pricing" },
      { label: "Changelog", href: "https://example.com/changelog" },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    links: [
      { label: "Documentation", href: "https://example.com/docs" },
      { label: "Guides", href: "https://example.com/guides" },
      { label: "Status", href: "https://example.com/status", external: true },
    ],
  },
  {
    id: "company",
    title: "Company",
    links: [
      { label: "About", href: "https://example.com/about" },
      { label: "Careers", href: "https://example.com/careers" },
      { label: "Contact", href: "https://example.com/contact" },
    ],
  },
];

const socialGlyph = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const socials: FooterSocial[] = [
  {
    id: "code",
    label: "Source code",
    href: "https://example.com/code",
    icon: socialGlyph("m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"),
  },
  { id: "chat", label: "Community chat", href: "https://example.com/chat", icon: socialGlyph("M4 5h16v11H9l-5 4V5Z") },
  {
    id: "feed",
    label: "News feed",
    href: "https://example.com/feed",
    icon: socialGlyph("M5 19a1 1 0 1 0 0 .01M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14"),
  },
];

/** The "Site footer" docs page (/blocks/site-footer): live examples, props and notes. */
export function SiteFooterPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Block"
      title="Site footer"
      description="A glass footer: brand and blurb, link columns that are navigation landmarks, a newsletter field with validation and a live confirmation, social icon links and a legal row."
      source="theme/src/blocks/site-footer.tsx"
    >
      <SiteFooterStage />
      <Example
        title="Full footer"
        stageClassName="p-3 sm:p-8"
        description="Try the newsletter field with a bad address, then a good one: the message under it is announced. Without onSubscribe the form is not rendered."
        code={`
import { SiteFooter, type FooterColumn } from "@sheenui/theme";

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
}`}
      >
        <SiteFooter
          headingLevel="none"
          brand="Acme"
          description="Tools for small teams who like their software calm."
          columns={columns}
          onSubscribe={async (email) => {
            await wait(900);
            toast.info("Subscribed", email);
          }}
          socials={socials}
          copyright="© 2026 Acme, Inc."
          legalLinks={[
            { label: "Privacy", href: "https://example.com/privacy" },
            { label: "Terms", href: "https://example.com/terms" },
          ]}
        />
      </Example>

      <Example
        title="Minimal"
        stageClassName="p-3 sm:p-8"
        description="Every part is optional: a brand and a legal row make a short footer."
        code={`
import { SiteFooter } from "@sheenui/theme";

export function Example() {
  return (
    <SiteFooter
      brand="Acme"
      copyright="© 2026 Acme, Inc."
      legalLinks={[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }]}
    />
  );
}`}
      >
        <SiteFooter
          headingLevel="none"
          brand="Acme"
          copyright="© 2026 Acme, Inc."
          legalLinks={[
            { label: "Privacy", href: "https://example.com/privacy" },
            { label: "Terms", href: "https://example.com/terms" },
          ]}
        />
      </Example>

      <PropsTable of={PROPS.SiteFooter} />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Column links top to bottom, then the newsletter field and button, the social links and the legal links.",
          ],
          ["Enter", "Follow a link, or submit the newsletter form."],
        ]}
      />
      <A11yNotes
        notes={[
          "A <footer> (the page's contentinfo landmark). Each column is a <nav> named by its heading; with headingLevel 'none' the names fall away with the headings.",
          "Social links are named by their label and their icons are aria-hidden. External links open a new tab with rel='noreferrer'.",
          "The subscribe confirmation is a polite status region that is always in the page, so it is announced when its text appears.",
          "Links and icon buttons grow to 44 px on touch devices. One glass panel holds everything, so there is one backdrop blur.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Not found page
 * ===================================================================== */

/** The "404 page" docs page (/blocks/not-found-page): live examples, props and notes. */
export function NotFoundPage() {
  return (
    <Page
      eyebrow="Block"
      title="404 page"
      description="A not-found block: a large code whose zeros are glass rings, a plain explanation, a slot for your search field, a way back and a few suggested links."
      source="theme/src/blocks/not-found-page.tsx"
    >
      <NotFoundStage />
      <Example
        title="With search and links"
        stageClassName="p-3 sm:p-8"
        description="The search slot takes any node: an Input, a Combobox or a command palette trigger. The block does not search for you. Remember to answer with HTTP status 404 from your router."
        code={`
import { Input, NotFound } from "@sheenui/theme";

export function Example() {
  return (
    <NotFound
      headingLevel={1}
      action={{ label: "Back to home", href: "/" }}
      search={<Input type="search" aria-label="Search the site" placeholder="Search the docs" />}
      links={[
        { label: "Documentation", href: "/docs", description: "Guides and API reference" },
        { label: "Pricing", href: "/pricing", description: "Plans for every team" },
        { label: "Contact", href: "/contact", description: "Talk to a person" },
      ]}
    />
  );
}`}
      >
        <NotFound
          headingLevel="none"
          action={{ label: "Back to home", href: site("/") }}
          search={<Input type="search" aria-label="Search the site" placeholder="Search the docs" />}
          links={[
            { label: "Documentation", href: site("/docs/installation"), description: "Guides and API reference" },
            { label: "Components", href: site("/components/"), description: "Every part, with examples" },
            { label: "Blocks", href: site("/blocks/"), description: "Pages built from the parts" },
          ]}
        />
      </Example>

      <Example
        title="A custom status code and your own wording"
        stageClassName="p-3 sm:p-8"
        description="code takes any short string (each 0 becomes a ring), and labels replaces every sentence, so the same block serves a 403 or a 500."
        code={`
import { NotFound } from "@sheenui/theme";

export function Example() {
  return (
    <NotFound
      code="403"
      action={{ label: "Sign in", onClick: () => console.log("sign in") }}
      labels={{
        codeLabel: "Error 403",
        title: "You need permission for this page",
        description: "Sign in with an account that has access, or ask the owner to invite you.",
      }}
    />
  );
}`}
      >
        <NotFound
          headingLevel="none"
          code="403"
          action={{ label: "Sign in", onClick: () => undefined }}
          labels={{
            codeLabel: "Error 403",
            title: "You need permission for this page",
            description: "Sign in with an account that has access, or ask the owner to invite you.",
          }}
        />
      </Example>

      <PropsTable of={PROPS.NotFound} />
      <KeyboardTable
        rows={[
          ["Tab", "The main action, your search field, then the suggested links in order."],
          ["Enter", "Follow a link or press the action."],
        ]}
      />
      <A11yNotes
        notes={[
          "A <section> named by its heading. A 404 page's heading is its h1: pass headingLevel={1}.",
          "The large code is aria-hidden; labels.codeLabel ('Error 404') is read instead.",
          "Suggested links are a labelled list of real anchors with 44 px targets. The zeros are glass surfaces (keep to two or three), and nothing loops.",
          "Digits settle on a spring and the rings drop in once. Reduced motion removes the movement.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Announcement banner
 * ===================================================================== */

const tones: AnnouncementTone[] = ["accent", "info", "success", "warning", "danger", "neutral"];

/** The "Announcement banner" docs page (/blocks/announcement-banner): live examples, props and notes. */
export function AnnouncementBannerPage() {
  const toast = useToast();
  const [open, setOpen] = useState(true);
  return (
    <Page
      eyebrow="Block"
      title="Announcement banner"
      description="A dismissible top banner on glass with a tone, a link and static copy. It stores nothing: it reports the dismissal through a callback so you can remember it yourself."
      source="theme/src/blocks/announcement-banner.tsx"
    >
      <AnnouncementBannerStage />
      <Example
        title="Remember the dismissal yourself"
        stageClassName="min-h-48 p-3 sm:p-8"
        description="Controlled with open and onOpenChange; onDismiss fires once when the visitor presses the button, which is where you save it (a cookie, localStorage or an account setting) and pass defaultOpen={false} next time."
        controls={
          <Button variant="glass" size="sm" onClick={() => setOpen(true)} disabled={open}>
            Show again
          </Button>
        }
        code={`
import { useState } from "react";
import { AnnouncementBanner } from "@sheenui/theme";

// Your own storage: the banner only reports the dismissal.
const remember = () => window.localStorage.setItem("banner-v2", "dismissed");

export function Example() {
  const [open, setOpen] = useState(true);
  return (
    <AnnouncementBanner
      open={open}
      onOpenChange={setOpen}
      onDismiss={remember}
      link={{ label: "Read the notes", href: "/changelog" }}
    >
      Version 2 is out: new blocks and a faster build.
    </AnnouncementBanner>
  );
}`}
      >
        <AnnouncementBanner
          open={open}
          onOpenChange={setOpen}
          onDismiss={() => toast.info("Dismissed", "Save this choice in your own storage.")}
          link={{ label: "Read the notes", href: "https://example.com/changelog" }}
        >
          Version 2 is out: new blocks and a faster build.
        </AnnouncementBanner>
      </Example>

      <Example
        title="Tones"
        stageClassName="p-3 sm:p-8"
        description="The words carry the meaning; the tone only lights the edge and picks the icon. Set dismissible={false} for a notice that must stay."
        code={`
import { AnnouncementBanner, type AnnouncementTone } from "@sheenui/theme";

const tones: AnnouncementTone[] = ["accent", "info", "success", "warning", "danger", "neutral"];

export function Example() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {tones.map((tone) => (
        <AnnouncementBanner key={tone} tone={tone} dismissible={tone === "accent"}>
          This is a {tone} announcement.
        </AnnouncementBanner>
      ))}
    </div>
  );
}`}
      >
        <div className="grid w-full gap-3">
          {tones.map((tone) => (
            <AnnouncementBanner key={tone} tone={tone} dismissible={tone === "accent"}>
              This is a {tone} announcement.
            </AnnouncementBanner>
          ))}
        </div>
      </Example>

      <PropsTable of={PROPS.AnnouncementBanner} />
      <KeyboardTable
        rows={[
          ["Tab", "The link, then the dismiss button."],
          ["Enter / Space on dismiss", "Dismiss the banner and call onDismiss."],
        ]}
      />
      <A11yNotes
        notes={[
          "A labelled group (labels.region), not a landmark and deliberately not a live region, so it is not read out on every page load. Dismissing moves focus on and announces it politely.",
          "Tone is never the only signal: the text says it and the icon is aria-hidden. Keep the copy static; a live countdown would be a moving target for assistive tech.",
          "The dismiss button has an accessible name and a 44 px target. The banner stores nothing, so there is no hidden persistence to explain.",
          "It slides up by transform and fades on its own surface, faster on the way out. Reduced motion: a short fade.",
        ]}
      />
    </Page>
  );
}
