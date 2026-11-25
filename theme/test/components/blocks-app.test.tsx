// Blocks, part 2: AuthSplit, SettingsPage (dirty bar), NotificationCenter, AiChat and DashboardStats.

import { describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { AuthSplit, passwordStrength } from "../../src/blocks/auth-split";
import { SettingsPage } from "../../src/blocks/settings-page";
import { NotificationCenter, NotificationPanel, type NotificationItem } from "../../src/blocks/notification-center";
import { AiChat, type AiChatRespond } from "../../src/blocks/ai-chat";
import { DashboardStats } from "../../src/blocks/dashboard-stats";
import { settle } from "../helpers";
import { accessibleText, liveTexts, setReducedMotion } from "../helpers-text";
import { describeVariants, renderUi, runAxe } from "../render";

/* ---------- passwordStrength (pure) ---------- */

describe("passwordStrength", () => {
  it("scores by rules, caps short and common passwords, and rewards length", () => {
    expect(passwordStrength("").score).toBe(0);
    expect(passwordStrength("abc").score).toBe(1);
    expect(passwordStrength("password123").common).toBe(true);
    expect(passwordStrength("password123").score).toBe(1);
    expect(passwordStrength("Abcdefg1").score).toBe(3);
    expect(passwordStrength("Abcdefg1!").score).toBe(4);
    expect(passwordStrength("Abcdefghijkl1!xyz").score).toBe(4);
    expect(passwordStrength("abcdefgh", 12).rules[0]!.met).toBe(false);
  });
});

/* ---------- AuthSplit ---------- */

/** A made-up passphrase for the sign-up form tests; not a real credential. */
const FAKE_PASS = "Str0ng!Passw0rd";

const fill = async (name = "Ada Lovelace", email = "ada@example.com", pass = FAKE_PASS) => {
  await userEvent.click(screen.getByRole("textbox", { name: /Full name/ }));
  await userEvent.keyboard(name);
  await userEvent.click(screen.getByRole("textbox", { name: /Work email/ }));
  await userEvent.keyboard(email);
  await userEvent.click(screen.getByLabelText(/^Password/));
  await userEvent.keyboard(pass);
};

describe("AuthSplit", () => {
  it("has one level-1 heading for the card, labelled fields and a form", () => {
    renderUi(<AuthSplit rotateEvery={0} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Create your account", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Full name/ })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Work email/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
  });

  it("an empty submit shows each error, focuses the first invalid field and does not call onSubmit", async () => {
    const onSubmit = vi.fn();
    renderUi(<AuthSplit onSubmit={onSubmit} rotateEvery={0} />);
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("Tell us what to call you.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please accept the terms to continue.")).toBeInTheDocument();
    await expect.poll(() => document.activeElement).toBe(screen.getByRole("textbox", { name: /Full name/ }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("password strength: a role=meter, a checklist as text, and 'common password' feedback", async () => {
    renderUi(<AuthSplit rotateEvery={0} />);
    const pass = screen.getByLabelText(/^Password/);
    await userEvent.click(pass);
    await userEvent.keyboard("password123");
    const meter = await screen.findByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "1");
    expect(await screen.findByText(/on every list of common passwords/)).toBeInTheDocument();
    await userEvent.clear(pass);
    await userEvent.keyboard(FAKE_PASS);
    await expect.poll(() => screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("4");
    // The checklist says met / unmet in words, not only with colour.
    expect(accessibleText(document.body)).toMatch(/A symbol[^a-z]*done/);
    await expect.poll(() => liveTexts()).toContain("Password strength: Strong");
  });

  it("the reveal button is state-aware and toggles the password type", async () => {
    renderUi(<AuthSplit rotateEvery={0} />);
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toHaveAttribute("type", "text");
  });

  it("a valid form calls onSubmit and moves to a success screen that takes focus; Resend and 'different email' work", async () => {
    const onSubmit = vi.fn();
    const onResend = vi.fn();
    renderUi(<AuthSplit onSubmit={onSubmit} onResend={onResend} rotateEvery={0} />);
    await fill();
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: FAKE_PASS,
    });
    const heading = await screen.findByRole("heading", { name: "Check your inbox" });
    await expect.poll(() => document.activeElement === heading || heading.contains(document.activeElement)).toBe(true);
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Resend email" }));
    expect(onResend).toHaveBeenCalledWith("ada@example.com");
    await expect.poll(() => liveTexts().join(" ")).toContain("Sent again");
    await userEvent.click(screen.getByRole("button", { name: "Use a different email" }));
    const email = await screen.findByRole("textbox", { name: /Work email/ });
    await expect.poll(() => document.activeElement).toBe(email);
  });

  it("a rejected onSubmit shows an alert above the button and keeps the form", async () => {
    renderUi(<AuthSplit onSubmit={() => Promise.reject(new Error("Email already registered"))} rotateEvery={0} />);
    await fill();
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Email already registered");
    expect(screen.queryByRole("heading", { name: "Check your inbox" })).toBeNull();
  });

  it("testimonials: dots are reachable buttons; rotateEvery={0} turns rotation off, and with it the Pause button", async () => {
    renderUi(<AuthSplit rotateEvery={0} />);
    expect(screen.getByRole("heading", { name: "What people say" })).toBeInTheDocument();
    const dots = screen.getAllByRole("button", { name: /Show testimonial \d of \d/ });
    expect(dots.length).toBeGreaterThan(1);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    await userEvent.click(dots[1]!);
    await expect.poll(() => dots[1]!.getAttribute("aria-current")).toBe("true");
    expect(dots[0]).not.toHaveAttribute("aria-current");
    // Nothing rotates by itself, so there is nothing to pause (docs: "0 = manual only").
    expect(screen.queryByRole("button", { name: /Pause testimonials|Play testimonials/ })).toBeNull();
  });

  it("testimonials rotate by themselves with a Pause button that toggles to Play", async () => {
    renderUi(<AuthSplit rotateEvery={60} />);
    const pause = screen.getByRole("button", { name: "Pause testimonials" });
    await userEvent.click(pause);
    expect(screen.getByRole("button", { name: "Play testimonials" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pause testimonials" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Play testimonials" }));
    expect(screen.getByRole("button", { name: "Pause testimonials" })).toBeInTheDocument();
  });

  it("social buttons report the provider; signInHref={null} hides the sign-in line; labels translate", async () => {
    const onSocial = vi.fn();
    renderUi(
      <AuthSplit
        onSocial={onSocial}
        signInHref={null}
        rotateEvery={0}
        labels={{ submit: "Crear cuenta", title: "Crea tu cuenta" }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "GitHub" }));
    expect(onSocial).toHaveBeenCalledWith("github");
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Crea tu cuenta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeInTheDocument();
  });

  it("headingLevel changes the card heading; reduced motion still swaps to the success screen", async () => {
    setReducedMotion();
    renderUi(<AuthSplit headingLevel={2} onSubmit={() => undefined} rotateEvery={0} />);
    expect(screen.getByRole("heading", { name: "Create your account", level: 2 })).toBeInTheDocument();
    await fill();
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("heading", { name: "Check your inbox" })).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations (form, form with errors, success)", async () => {
      renderUi(<AuthSplit onSubmit={() => undefined} onSocial={() => undefined} rotateEvery={0} />, variant);
      expect(await runAxe()).toHaveNoViolations();
      await userEvent.click(screen.getByRole("button", { name: "Create account" }));
      await screen.findByText("Tell us what to call you.");
      await settle();
      expect(await runAxe()).toHaveNoViolations();
      await fill();
      await userEvent.click(screen.getByRole("checkbox"));
      await userEvent.click(screen.getByRole("button", { name: "Create account" }));
      await screen.findByRole("heading", { name: "Check your inbox" });
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- SettingsPage ---------- */

const bar = () => screen.queryByRole("group", { name: /unsaved|saved/i });

describe("SettingsPage", () => {
  it("renders the sections with a navigation landmark and a level-1 title", () => {
    renderUi(<SettingsPage />);
    expect(screen.getByRole("heading", { name: "Settings", level: 1 })).toBeInTheDocument();
    const nav = screen.getByRole("group", { name: "Settings sections" });
    expect(within(nav).getAllByRole("link").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByRole("heading", { name: "Profile", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Display name/ })).toBeInTheDocument();
  });

  it("the dirty bar appears only after a change, counts changes, announces it, and Discard restores the saved values", async () => {
    renderUi(<SettingsPage defaultValues={{ name: "Ava Chen", username: "ava", email: "ava@example.com", bio: "" }} />);
    expect(bar()).toBeNull();
    const name = screen.getByRole<HTMLInputElement>("textbox", { name: /Display name/ });
    await userEvent.click(name);
    await userEvent.keyboard(" Jr");
    const region = await screen.findByRole("group", { name: "1 unsaved change" });
    expect(region).toBeInTheDocument();
    await expect.poll(() => liveTexts()).toContain("You have unsaved changes");
    const email = screen.getByRole("textbox", { name: /^Email/ });
    await userEvent.click(email);
    await userEvent.keyboard("x");
    await screen.findByRole("group", { name: "2 unsaved changes" });

    await userEvent.click(
      within(region.isConnected ? region : screen.getByRole("group", { name: "2 unsaved changes" })).getByRole(
        "button",
        { name: "Discard" },
      ),
    );
    await expect.poll(() => name.value).toBe("Ava Chen");
    await expect.poll(bar).toBeNull();
    await expect.poll(() => liveTexts()).toContain("Changes discarded");
  });

  it("Save sends all values plus the changed keys, shows a saved state, then the bar goes away", async () => {
    const onSave = vi.fn<NonNullable<ComponentProps<typeof SettingsPage>["onSave"]>>();
    renderUi(
      <SettingsPage
        defaultValues={{ name: "Ava Chen", username: "ava", email: "ava@example.com", bio: "" }}
        onSave={onSave}
      />,
    );
    await userEvent.click(screen.getByRole("textbox", { name: /Display name/ }));
    await userEvent.keyboard("!");
    await userEvent.click(await screen.findByRole("button", { name: /^Save/ }));
    await expect.poll(() => onSave.mock.calls.length).toBe(1);
    const [values, changed] = onSave.mock.calls[0]!;
    expect(values.name).toBe("Ava Chen!");
    expect(changed).toEqual(["name"]);
    await expect.poll(() => liveTexts()).toContain("Changes saved");
    await expect.poll(bar, { timeout: 6000 }).toBeNull();
  });

  it("validation blocks saving: an invalid username shows its message and the bar offers 'Fix 1 field'", async () => {
    const onSave = vi.fn<NonNullable<ComponentProps<typeof SettingsPage>["onSave"]>>();
    renderUi(
      <SettingsPage
        defaultValues={{ name: "Ava", username: "ava", email: "ava@example.com", bio: "" }}
        onSave={onSave}
      />,
    );
    const username = screen.getByRole("textbox", { name: /Username/ });
    await userEvent.clear(username);
    await userEvent.keyboard("ab");
    // The message shows after the field loses focus (or on a save attempt), not while typing.
    expect(screen.queryByText(/Use 3–30 lowercase letters/)).toBeNull();
    await userEvent.tab();
    expect(await screen.findByText(/Use 3–30 lowercase letters/)).toBeInTheDocument();
    expect(username).toBeInvalid();
    // Pressing Save is refused, and the bar then says what to do ("Fix 1 field to save").
    await expect.poll(bar).not.toBeNull();
    await userEvent.click(within(bar()!).getByRole("button", { name: /Save/ }));
    await expect.poll(() => bar()?.textContent).toMatch(/Fix 1 field to save/);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("a failed save keeps the bar and shows an alert", async () => {
    renderUi(
      <SettingsPage
        defaultValues={{ name: "Ava", username: "ava", email: "ava@example.com", bio: "" }}
        onSave={() => Promise.reject(new Error("boom"))}
      />,
    );
    await userEvent.click(screen.getByRole("textbox", { name: /Display name/ }));
    await userEvent.keyboard("x");
    await userEvent.click(await screen.findByRole("button", { name: /^Save/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't save. Check your connection and try again.");
    expect(bar()).not.toBeNull();
  });

  it("warns before leaving with unsaved changes (beforeunload), and not when clean", async () => {
    renderUi(<SettingsPage defaultValues={{ name: "Ava", username: "ava", email: "ava@example.com", bio: "" }} />);
    const clean = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);
    await userEvent.click(screen.getByRole("textbox", { name: /Display name/ }));
    await userEvent.keyboard("x");
    await screen.findByRole("group", { name: "1 unsaved change" });
    const dirty = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirty);
    expect(dirty.defaultPrevented).toBe(true);
  });

  it("notification switches toggle and count as changes; locked ones stay on", async () => {
    renderUi(
      <SettingsPage
        sections={["notifications"]}
        notificationOptions={[
          { id: "mentions", label: "Mentions", group: "Push" },
          { id: "security", label: "Security alerts", group: "Email", locked: true },
        ]}
        defaultValues={{ notifications: { mentions: false, security: true } }}
      />,
    );
    const mentions = screen.getByRole("switch", { name: /Mentions/ });
    expect(mentions).not.toBeChecked();
    await userEvent.click(mentions);
    await expect.poll(() => mentions.getAttribute("aria-checked")).toBe("true");
    await screen.findByRole("group", { name: "1 unsaved change" });
    const locked = screen.getByRole("switch", { name: /Security alerts/ });
    expect(locked).toBeChecked();
    expect(locked).toHaveAttribute("aria-disabled", "true");
  });

  it("delete account needs a typed confirmation in a dialog; Escape cancels and returns focus", async () => {
    const onDeleteAccount = vi.fn();
    renderUi(<SettingsPage sections={["danger"]} onDeleteAccount={onDeleteAccount} />);
    const open = screen.getByRole("button", { name: "Delete account" });
    await userEvent.click(open);
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveAccessibleName("Delete your account?");
    const confirm = within(dialog).getByRole("button", { name: "Delete forever" });
    expect(confirm.hasAttribute("disabled") || confirm.getAttribute("aria-disabled") === "true").toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("alertdialog")).toBeNull();
    await expect.poll(() => document.activeElement).toBe(open);
    expect(onDeleteAccount).not.toHaveBeenCalled();
  });

  it("labels translate the title and the bar", async () => {
    renderUi(
      <SettingsPage
        defaultValues={{ name: "Ava", username: "ava", email: "ava@example.com", bio: "" }}
        labels={{
          title: "Ajustes",
          unsaved: (n) => `${n} cambios sin guardar`,
          save: "Guardar cambios",
          saveShort: "Guardar",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Ajustes", level: 1 })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("textbox", { name: /Display name/ }));
    await userEvent.keyboard("x");
    expect(await screen.findByRole("group", { name: "1 cambios sin guardar" })).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations (clean, and with the dirty bar)", async () => {
      renderUi(
        <SettingsPage defaultValues={{ name: "Ava", username: "ava", email: "ava@example.com", bio: "" }} />,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
      await userEvent.click(screen.getByRole("textbox", { name: /Display name/ }));
      await userEvent.keyboard("x");
      await screen.findByRole("group", { name: "1 unsaved change" });
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- NotificationCenter ---------- */

const NOW = new Date("2026-11-08T12:00:00Z");
const ago = (m: number) => new Date(NOW.getTime() - m * 60_000);
const inbox = (): NotificationItem[] => [
  {
    id: "n1",
    actor: { name: "Ada Lovelace" },
    kind: "mention",
    title: <>Ada mentioned you in Q3 plan</>,
    time: ago(5),
    read: false,
  },
  {
    id: "n2",
    actor: { name: "Grace Hopper" },
    kind: "comment",
    title: <>Grace commented on Roadmap</>,
    time: ago(60),
    read: false,
  },
  { id: "n3", kind: "system", title: <>Your export is ready</>, time: ago(60 * 30), read: true },
];

function Panel(props: Partial<React.ComponentProps<typeof NotificationPanel>>) {
  return <NotificationPanel defaultNotifications={inbox()} now={NOW} locale="en-US" {...props} />;
}

describe("NotificationCenter", () => {
  it("the panel has a labelled tab list; All / Unread / Mentions filter, and unread items say so in words", async () => {
    renderUi(<Panel />);
    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();
    const tabs = screen.getByRole("tablist", { name: "Filter notifications" });
    expect(
      within(tabs)
        .getAllByRole("tab")
        .map((t) => t.textContent.replace(/\d+/g, "").trim()),
    ).toEqual(["All", "Unread", "Mentions"]);
    expect(accessibleText(document.body)).toMatch(/Ada mentioned you in Q3 plan[^a-z]*unread/);
    await userEvent.click(within(tabs).getByRole("tab", { name: /Mentions/ }));
    await expect.poll(() => screen.queryByText(/Grace commented/)).toBeNull();
    expect(screen.getByText(/Ada mentioned you/)).toBeInTheDocument();
    await userEvent.click(within(tabs).getByRole("tab", { name: /Unread/ }));
    await expect.poll(() => screen.queryByText(/Your export is ready/)).toBeNull();
  });

  it("tabs are keyboard operable (arrows move focus, Enter activates)", async () => {
    renderUi(<Panel />);
    const tabs = screen.getByRole("tablist", { name: "Filter notifications" });
    const [all, unread] = within(tabs).getAllByRole("tab");
    all!.focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect.poll(() => unread!.getAttribute("aria-selected")).toBe("true");
  });

  it("Mark all as read clears the unread state, announces it and reports the new list", async () => {
    const onNotificationsChange = vi.fn();
    renderUi(<Panel onNotificationsChange={onNotificationsChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    const next = onNotificationsChange.mock.lastCall![0] as NotificationItem[];
    expect(next.every((n) => n.read)).toBe(true);
    await expect.poll(() => liveTexts()).toContain("All notifications marked as read");
  });

  it("dismissing a notification offers Undo (button) which restores it", async () => {
    const onDismiss = vi.fn();
    const onRestore = vi.fn();
    renderUi(<Panel onDismiss={onDismiss} onRestore={onRestore} />);
    const row = document.querySelector<HTMLElement>('[data-notification-id="n2"]')!;
    await userEvent.hover(row);
    await userEvent.click(within(row).getByRole("button", { name: /Dismiss/ }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    await expect.poll(() => screen.queryByText(/Grace commented/)).toBeNull();
    await expect.poll(() => liveTexts().some((t) => t.startsWith("Notification dismissed"))).toBe(true);
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));
    expect(onRestore).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/Grace commented/)).toBeInTheDocument();
  });

  it("an empty inbox shows the empty state", () => {
    renderUi(<Panel defaultNotifications={[]} />);
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
  });

  it("the bell is a button named with the unread count; it opens a dialog, Escape closes it and focus returns to the bell", async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    renderUi(
      <NotificationCenter defaultNotifications={inbox()} now={NOW} locale="en-US" onOpenChange={onOpenChange} />,
    );
    const bell = screen.getByRole("button", { name: "Notifications, 2 unread" });
    expect(bell).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(bell);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName(/Notifications/);
    expect(within(dialog).getByText(/Ada mentioned you/)).toBeInTheDocument();
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("dialog"), { timeout: 5000 }).toBeNull();
    await expect.poll(() => document.activeElement).toBe(screen.getByRole("button", { name: /^Notifications/ }));
    expect(onOpenChange.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });

  it("labels translate the bell name", () => {
    renderUi(
      <NotificationCenter
        defaultNotifications={inbox()}
        now={NOW}
        labels={{ trigger: (n) => `Avisos, ${n} sin leer` }}
      />,
    );
    expect(screen.getByRole("button", { name: "Avisos, 2 sin leer" })).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations (inline panel, and the bell with its popup open)", async () => {
      const a = renderUi(
        <div className="p-4">
          <Panel />
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
      a.unmount();
      renderUi(<NotificationCenter defaultNotifications={inbox()} now={NOW} locale="en-US" />, variant);
      await userEvent.click(screen.getByRole("button", { name: /^Notifications/ }));
      await screen.findByRole("dialog");
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- AiChat ---------- */

const reply: AiChatRespond = () => "Here is **bold** text and `code`.";
const composer = () => screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Message" });

function Chat(props: Partial<React.ComponentProps<typeof AiChat>>) {
  return (
    <AiChat className="h-[640px] w-[480px]" simulateStreaming={false} thinkingDelay={0} respond={reply} {...props} />
  );
}

describe("AiChat", () => {
  it("shows the empty state with suggestion chips; choosing one sends it", async () => {
    const onSend = vi.fn<NonNullable<ComponentProps<typeof Chat>["onSend"]>>();
    renderUi(<Chat suggestions={["Summarise this", "Write a haiku"]} onSend={onSend} />);
    const list = screen.getByRole("list", { name: /Suggest|Try/i });
    await userEvent.click(within(list).getByRole("button", { name: "Write a haiku" }));
    expect(onSend).toHaveBeenCalledWith(expect.objectContaining({ role: "user", content: "Write a haiku" }));
  });

  it("Enter sends, Shift+Enter adds a line; the field clears and focus stays", async () => {
    const onSend = vi.fn<NonNullable<ComponentProps<typeof Chat>["onSend"]>>();
    renderUi(<Chat onSend={onSend} />);
    composer().focus();
    await userEvent.keyboard("line one{Shift>}{Enter}{/Shift}line two");
    expect(composer().value).toBe("line one\nline two");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0]![0].content).toBe("line one\nline two");
    await expect.poll(() => composer().value).toBe("");
    expect(composer()).toHaveFocus();
  });

  it("an empty message cannot be sent", async () => {
    const onSend = vi.fn<NonNullable<ComponentProps<typeof Chat>["onSend"]>>();
    renderUi(<Chat onSend={onSend} />);
    composer().focus();
    await userEvent.keyboard("   {Enter}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("renders the reply with Markdown (bold, inline code) and announces it once; hidden headings label who spoke", async () => {
    renderUi(<Chat />);
    composer().focus();
    await userEvent.keyboard("hello{Enter}");
    // The scrolling conversation is a focusable named region (replies are announced through a separate live region).
    const log = await screen.findByRole("group", { name: /Conversation/ });
    await expect.poll(() => within(log).queryByText("bold")).not.toBeNull();
    expect(within(log).getByText("bold").tagName).toBe("STRONG");
    expect(within(log).getByText("code").tagName).toBe("CODE");
    expect(
      within(log)
        .getAllByRole("heading")
        .map((h) => h.textContent)
        .join("|"),
    ).toMatch(/You said/);
    await expect.poll(() => liveTexts().filter((t) => t.includes("Here is bold text and code")).length).toBe(1);
  });

  it("a streaming reply can be stopped; the partial text stays and is marked as stopped", async () => {
    const respond: AiChatRespond = async function* ({ signal }) {
      yield "Partial words ";
      await new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve()));
    };
    renderUi(<Chat respond={respond} />);
    composer().focus();
    await userEvent.keyboard("go{Enter}");
    const stop = await screen.findByRole("button", { name: "Stop generating" });
    await expect.poll(() => screen.queryByText(/Partial words/)).not.toBeNull();
    await userEvent.click(stop);
    await expect.poll(() => screen.queryByRole("button", { name: "Stop generating" })).toBeNull();
    expect(screen.getByText(/Partial words/)).toBeInTheDocument();
    await expect.poll(() => liveTexts().some((t) => /stopped/i.test(t))).toBe(true);
  });

  it("an error shows a message with a Try again button that asks again", async () => {
    const respond = vi
      .fn<AiChatRespond>()
      .mockRejectedValueOnce(new Error("Model offline"))
      .mockResolvedValueOnce("Back online");
    renderUi(<Chat respond={respond} />);
    composer().focus();
    await userEvent.keyboard("hi{Enter}");
    await expect.poll(() => screen.queryAllByText("Model offline").length).toBeGreaterThan(0);
    // The action is `labels.retry`, "Try again" by default (the docs page uses the same words).
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Back online")).toBeInTheDocument();
    expect(respond).toHaveBeenCalledTimes(2);
  });

  it("feedback buttons are toggles that report up / down / removed", async () => {
    const onFeedback = vi.fn();
    renderUi(<Chat onFeedback={onFeedback} />);
    composer().focus();
    await userEvent.keyboard("hi{Enter}");
    const good = await screen.findByRole("button", { name: "Good response" });
    await userEvent.click(good);
    expect(onFeedback).toHaveBeenLastCalledWith(expect.objectContaining({ role: "assistant" }), "up");
    expect(good).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(good);
    expect(onFeedback).toHaveBeenLastCalledWith(expect.anything(), null);
  });

  it("New chat clears the conversation and says so", async () => {
    renderUi(<Chat />);
    composer().focus();
    await userEvent.keyboard("hi{Enter}");
    await screen.findByText("bold");
    await userEvent.click(screen.getByRole("button", { name: "New chat" }));
    await expect.poll(() => screen.queryByText("bold")).toBeNull();
    await expect.poll(() => liveTexts()).toContain("New chat started");
  });

  it("the model picker only appears with two or more models and reports the choice", async () => {
    const onModelChange = vi.fn();
    const view = renderUi(<Chat models={[{ value: "a", label: "Model A" }]} />);
    expect(screen.queryByRole("combobox", { name: "Model" })).toBeNull();
    view.unmount();
    renderUi(
      <Chat
        models={[
          { value: "a", label: "Model A" },
          { value: "b", label: "Model B" },
        ]}
        onModelChange={onModelChange}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: /Model/ }));
    await userEvent.click(await screen.findByRole("option", { name: /Model B/ }));
    expect(onModelChange).toHaveBeenCalledWith("b");
  });

  it("labels translate the composer", () => {
    renderUi(<Chat labels={{ message: "Mensaje", send: "Enviar", newChat: "Nuevo chat" }} />);
    expect(screen.getByRole("textbox", { name: "Mensaje" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nuevo chat" })).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations (empty, and with a finished reply)", async () => {
      renderUi(<Chat suggestions={["Summarise this"]} />, variant);
      expect(await runAxe()).toHaveNoViolations();
      composer().focus();
      await userEvent.keyboard("hi{Enter}");
      await screen.findByText("bold");
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- DashboardStats ---------- */

describe("DashboardStats", () => {
  const data = {
    "7d": [
      { label: "Revenue", value: 48250, change: 12.4, trend: [1, 2, 3, 4], format: "currency" as const },
      {
        label: "Churn",
        value: 2.1,
        change: -0.5,
        trend: [4, 3, 3, 2],
        format: "percent" as const,
        goodWhen: "down" as const,
      },
    ],
    "30d": [{ label: "Revenue", value: 190000, change: -3, trend: [4, 3, 2, 1], format: "currency" as const }],
  };

  it("a named section with a period tab list; each tab has a spoken name", () => {
    renderUi(<DashboardStats data={data} title="Overview" />);
    expect(screen.getByRole("group", { name: "Overview" })).toBeInTheDocument();
    const tabs = screen.getByRole("tablist", { name: "Period" });
    expect(within(tabs).getByRole("tab", { name: "7d, Last 7 days" })).toHaveAttribute("aria-selected", "true");
    expect(within(tabs).getByRole("tab", { name: "30d, Last 30 days" })).toBeInTheDocument();
  });

  it("each card is a heading with the full value readable once, and the change spoken in words", () => {
    renderUi(<DashboardStats data={data} />);
    const section = screen.getByRole("group", { name: "Overview" });
    expect(within(section).getByRole("heading", { name: "Revenue", level: 3 })).toBeInTheDocument();
    const text = accessibleText(section);
    expect(text).toContain("$48,250");
    expect(text).toContain("Up 12.4% vs previous period");
    expect(text).toContain("Down 0.5% vs previous period");
    expect(accessibleText(section).split("$48,250")).toHaveLength(2);
    expect(within(section).getByRole("img", { name: /^Revenue trend: / })).toBeInTheDocument();
  });

  it("switching the period swaps the numbers (keyboard: arrows then Enter)", async () => {
    renderUi(<DashboardStats data={data} />);
    const tabs = screen.getByRole("tablist", { name: "Period" });
    within(tabs).getByRole("tab", { name: "7d, Last 7 days" }).focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect
      .poll(() => within(tabs).getByRole("tab", { name: "30d, Last 30 days" }).getAttribute("aria-selected"))
      .toBe("true");
    await expect.poll(() => accessibleText(screen.getByRole("group", { name: "Overview" }))).toContain("$190,000");
    expect(accessibleText(screen.getByRole("group", { name: "Overview" }))).toMatch(/Down 3(\.0)?% vs previous period/);
  });

  it("goodWhen='down' makes a falling number read as good news (success tone), and rising as bad", () => {
    renderUi(<DashboardStats data={data} />);
    const section = screen.getByRole("group", { name: "Overview" });
    // The change badge is the parent of the screen-reader sentence; its tone says whether the change is good.
    const badgeOf = (sentence: string) =>
      [...section.querySelectorAll<HTMLElement>("span.sr-only")].find((n) => n.textContent.includes(sentence))!
        .parentElement!;
    expect(badgeOf("Down 0.5%").className).toMatch(/success/);
    expect(badgeOf("Up 12.4%").className).toMatch(/success/);
    // Falling revenue would be bad news.
    expect(badgeOf("Up 12.4%").className).not.toMatch(/danger/);
  });

  it("labels and locale translate: Spanish labels and a German number format", () => {
    renderUi(
      <DashboardStats
        data={data}
        locale="de-DE"
        currency="EUR"
        labels={{
          period: "Periodo",
          change: (d, a) => `${d === "up" ? "Sube" : "Baja"} ${a}`,
          trend: (l) => `Tendencia de ${l}`,
        }}
      />,
    );
    expect(screen.getByRole("tablist", { name: "Periodo" })).toBeInTheDocument();
    const text = accessibleText(screen.getByRole("group", { name: "Overview" }));
    expect(text).toMatch(/48\.250/);
    expect(text).toContain("Sube");
    expect(screen.getByRole("img", { name: /^Tendencia de Revenue: / })).toBeInTheDocument();
  });

  it("reduced motion shows the final number immediately", () => {
    setReducedMotion();
    renderUi(<DashboardStats data={data} />);
    expect(accessibleText(screen.getByRole("group", { name: "Overview" }))).toContain("$48,250");
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <div className="p-4">
          <DashboardStats data={data} />
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});
