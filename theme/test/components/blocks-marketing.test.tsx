// Marketing blocks: HeroSection, FeatureGrid, Testimonials, FaqSection, ContactForm, SiteFooter, NotFound, AnnouncementBanner.

import { describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { AnnouncementBanner } from "../../src/blocks/announcement-banner";
import { ContactForm } from "../../src/blocks/contact-form";
import { FaqSection, faqPageJsonLd, type FaqItem } from "../../src/blocks/faq-section";
import { FeatureGrid } from "../../src/blocks/feature-grid";
import { HeroSection } from "../../src/blocks/hero-section";
import { NotFound } from "../../src/blocks/not-found-page";
import { SiteFooter } from "../../src/blocks/site-footer";
import { Testimonials } from "../../src/blocks/testimonials";
import { describeVariants, renderUi, runAxe } from "../render";

const expectNoViolations = async () => expect((await runAxe()).violations).toEqual([]);

describe("HeroSection", () => {
  it("names the section by its heading and renders actions, media and logos", async () => {
    const onClick = vi.fn();
    renderUi(
      <HeroSection
        title="Catch the light"
        description="A glass library."
        primaryAction={{ label: "Start", onClick }}
        secondaryAction={{ label: "Docs", href: "https://example.com/docs" }}
        media={<div>shot</div>}
        logos={[{ name: "Alder" }, { name: "Cobalt", logo: <svg /> }]}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Catch the light" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "https://example.com/docs");
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("list", { name: "Trusted by teams at" })).toHaveTextContent("Alder");
    expect(screen.getByText("Cobalt")).toBeInTheDocument();
  });

  it("headingLevel none renders no heading and the region is named", () => {
    renderUi(<HeroSection headingLevel="none" title="Plain" />);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByRole("group", { name: "Introduction" })).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(<HeroSection title="Hello" description="Lede" primaryAction={{ label: "Go", href: "#go" }} />, variant);
      await expectNoViolations();
    });
  });
});

describe("FeatureGrid", () => {
  const features = [
    { id: "a", title: "Tokens", description: "CSS variables.", icon: <svg />, highlight: true, href: "#a" },
    { id: "b", title: "Motion", description: "Springs." },
  ];

  it("renders card headings one level below the title and a named link", () => {
    renderUi(<FeatureGrid title="Features" features={features} />);
    expect(screen.getByRole("heading", { level: 2, name: "Features" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Tokens" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn more Tokens" })).toHaveAttribute("href", "#a");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(<FeatureGrid title="Features" features={features} />, variant);
      await expectNoViolations();
    });
  });
});

describe("Testimonials", () => {
  const items = [
    { id: "1", quote: "Great.", name: "Sam Rivera", role: "Lead", rating: 5 as const },
    { id: "2", quote: "Calm.", name: "Jo Lindqvist" },
    { id: "3", quote: "Fast.", name: "Priya Nair" },
    { id: "4", quote: "Neat.", name: "Kofi Mensah" },
  ];

  it("grid: figures with blockquotes and a text rating", () => {
    renderUi(<Testimonials title="Kind words" testimonials={items} />);
    expect(screen.getAllByRole("figure")).toHaveLength(4);
    expect(screen.getByRole("img", { name: "Rated 5 out of 5" })).toBeInTheDocument();
    expect(screen.getByText("SR")).toBeInTheDocument();
  });

  it("marquee: has a pause button that reports through onPausedChange", async () => {
    const onPausedChange = vi.fn();
    renderUi(<Testimonials layout="marquee" rows={2} testimonials={items} onPausedChange={onPausedChange} />);
    const pause = screen.getByRole("button", { name: "Pause the quotes" });
    await userEvent.click(pause);
    expect(onPausedChange).toHaveBeenCalledWith(true);
    expect(screen.getAllByRole("button", { name: /the quotes/ })).toHaveLength(1);
  });

  describeVariants((variant) => {
    it("grid has no axe violations", async () => {
      renderUi(<Testimonials title="Kind words" testimonials={items} />, variant);
      await expectNoViolations();
    });
  });
});

describe("FaqSection", () => {
  const items: FaqItem[] = [
    { id: "a", question: "Is it free?", answer: "Yes." },
    { id: "b", question: "SSR?", answer: <p>Yes.</p>, answerText: "Yes, it works." },
    { id: "c", question: "Hidden from data", answer: <p>Rich.</p> },
  ];

  it("faqPageJsonLd returns plain-text questions and skips items with no text", () => {
    expect(faqPageJsonLd(items)).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Is it free?", acceptedAnswer: { "@type": "Answer", text: "Yes." } },
        { "@type": "Question", name: "SSR?", acceptedAnswer: { "@type": "Answer", text: "Yes, it works." } },
      ],
    });
  });

  it("opens a question with the keyboard and reports the open ids", async () => {
    const onValueChange = vi.fn();
    renderUi(<FaqSection title="FAQ" items={items} onValueChange={onValueChange} />);
    expect(screen.getByRole("heading", { level: 3, name: "Is it free?" })).toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: "Is it free?" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(onValueChange).toHaveBeenCalledWith(["a"]);
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(<FaqSection title="FAQ" items={items} defaultValue={["a"]} />, variant);
      await expectNoViolations();
    });
  });
});

describe("ContactForm", () => {
  const fill = async (name: string, email: string, message: string) => {
    await userEvent.click(screen.getByLabelText(/^Name/));
    await userEvent.keyboard(name);
    await userEvent.click(screen.getByLabelText(/^Email/));
    await userEvent.keyboard(email);
    await userEvent.click(screen.getByLabelText(/^Message/));
    await userEvent.keyboard(message);
  };

  it("validates on submit, focuses the first invalid field and does not call onSubmit", async () => {
    const onSubmit = vi.fn();
    renderUi(<ContactForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    await expect.poll(() => document.activeElement).toBe(screen.getByLabelText(/^Name/));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed values, shows the success view, and 'Send another' returns to the form", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onReset = vi.fn();
    renderUi(<ContactForm onSubmit={onSubmit} onReset={onReset} />);
    await fill("Sam Rivera", "sam@example.com", "Hello there, a question.");
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Message sent")).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Sam Rivera",
      email: "sam@example.com",
      message: "Hello there, a question.",
    });
    await userEvent.click(screen.getByRole("button", { name: "Send another message" }));
    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument();
  });

  it("shows the message of a thrown error", async () => {
    renderUi(
      <ContactForm
        onSubmit={() => {
          throw new Error("Server is down");
        }}
      />,
    );
    await fill("Sam", "sam@example.com", "A long enough message");
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Server is down");
  });

  it("validate={false} hands errors and status to the caller", () => {
    renderUi(<ContactForm validate={false} errors={{ email: "Bad address" }} status="submitting" />);
    expect(screen.getByText("Bad address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send message" })).toHaveAttribute("aria-busy", "true");
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(<ContactForm title="Talk to us" />, variant);
      await expectNoViolations();
    });
  });
});

describe("SiteFooter", () => {
  const columns = [{ id: "p", title: "Product", links: [{ label: "Pricing", href: "https://example.com/p" }] }];

  it("renders a footer with a nav per column, social links and a legal row", () => {
    renderUi(
      <SiteFooter
        brand="Acme"
        columns={columns}
        socials={[{ id: "g", label: "Source code", href: "https://example.com/c", icon: <svg /> }]}
        copyright="© 2026 Acme"
        legalLinks={[{ label: "Privacy", href: "https://example.com/privacy" }]}
      />,
    );
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Product" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Source code" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Legal" })).toHaveTextContent("Privacy");
    expect(screen.queryByRole("button", { name: "Subscribe" })).toBeNull();
  });

  it("newsletter: rejects a bad address, then subscribes and announces", async () => {
    const onSubscribe = vi.fn().mockResolvedValue(undefined);
    renderUi(<SiteFooter onSubscribe={onSubscribe} />);
    const field = screen.getByRole("textbox", { name: "Email address" });
    await userEvent.click(field);
    await userEvent.keyboard("nope{Enter}");
    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(onSubscribe).not.toHaveBeenCalled();
    await userEvent.clear(field);
    await userEvent.keyboard("sam@example.com{Enter}");
    expect(await screen.findByText("Thanks. Check your inbox to confirm.")).toBeInTheDocument();
    expect(onSubscribe).toHaveBeenCalledWith("sam@example.com");
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <SiteFooter
          brand="Acme"
          description="Tools."
          columns={columns}
          onSubscribe={() => undefined}
          copyright="© 2026"
        />,
        variant,
      );
      await expectNoViolations();
    });
  });
});

describe("NotFound", () => {
  it("hides the big code, reads the label, and lists the links", () => {
    renderUi(
      <NotFound
        action={{ label: "Home", href: "https://example.com" }}
        search={<input aria-label="Search" />}
        links={[{ label: "Docs", href: "https://example.com/docs", description: "Guides" }]}
      />,
    );
    expect(screen.getByText("Error 404")).toBeInTheDocument();
    expect(document.querySelector("[data-slot=not-found-code]")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("This page has drifted off");
    expect(screen.getByRole("list", { name: "Popular places" })).toHaveTextContent("Docs");
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(<NotFound action={{ label: "Home", href: "#" }} links={[{ label: "Docs", href: "#d" }]} />, variant);
      await expectNoViolations();
    });
  });
});

describe("AnnouncementBanner", () => {
  it("dismisses with the button, calls onDismiss once and removes the region", async () => {
    const onDismiss = vi.fn();
    const onOpenChange = vi.fn();
    renderUi(
      <AnnouncementBanner
        onDismiss={onDismiss}
        onOpenChange={onOpenChange}
        link={{ label: "Read", href: "https://example.com" }}
      >
        Version 2 is out.
      </AnnouncementBanner>,
    );
    expect(screen.getByRole("group", { name: "Announcement" })).toHaveTextContent("Version 2 is out.");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss announcement" }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect.poll(() => screen.queryByRole("group", { name: "Announcement" })).toBeNull();
  });

  it("dismissing moves focus to the next focusable element and announces it politely", async () => {
    renderUi(
      <div>
        <AnnouncementBanner>News.</AnnouncementBanner>
        <a href="#next">Next link</a>
      </div>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss announcement" }));
    expect(screen.getByRole("link", { name: "Next link" })).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Announcement dismissed");
  });

  it("restoreFocusTo wins over the next focusable element", async () => {
    function Host() {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <div>
          <button ref={ref}>Anchor</button>
          <AnnouncementBanner restoreFocusTo={ref}>News.</AnnouncementBanner>
          <a href="#next">Next link</a>
        </div>
      );
    }
    renderUi(<Host />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss announcement" }));
    expect(screen.getByRole("button", { name: "Anchor" })).toHaveFocus();
  });

  it("defaultOpen={false} renders nothing and dismissible={false} has no button", () => {
    const { unmount } = renderUi(<AnnouncementBanner defaultOpen={false}>Hidden</AnnouncementBanner>);
    expect(screen.queryByText("Hidden")).toBeNull();
    unmount();
    renderUi(<AnnouncementBanner dismissible={false}>Shown</AnnouncementBanner>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  describeVariants((variant) => {
    it.each(["accent", "success", "warning", "danger", "neutral"] as const)(
      "%s tone has no axe violations",
      async (tone) => {
        renderUi(<AnnouncementBanner tone={tone}>Heads up.</AnnouncementBanner>, variant);
        await expectNoViolations();
      },
    );
  });
});
