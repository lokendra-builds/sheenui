import { useState } from "react";
import { Button, useToast } from "@sheenui/theme";
import type { NotificationItem } from "@sheenui/theme";
import type { SettingsNotificationOption } from "@sheenui/theme";
import { lazyBlock } from "../layout/lazy-block";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { DEMO_LOCALE, demoNowMs, useDemoNow } from "../demo-clock";
import * as PROPS from "../generated/component-props";
import {
  GearIcon,
  NotificationCenter,
  NotificationPanel,
  SearchIcon,
  arrivals,
  germanItems,
  germanLabels,
  sampleNotifications,
  withInviteActions,
} from "./BlockAccountPages/notification-center";
import { wait } from "./BlockAccountPages/shared";
import { AuthSplitStage, NotificationCenterStage, SettingsPageStage } from "./BlockStages.account";

const SettingsPage = lazyBlock(() => import("../../../theme/src/blocks/settings-page").then((m) => m.SettingsPage), {
  minHeight: "40rem",
  eager: true,
});

const AuthSplit = lazyBlock(() => import("../../../theme/src/blocks/auth-split").then((m) => m.AuthSplit), {
  minHeight: "32rem",
  eager: true,
});

/** Faux app content under the app bar (decorative), so the notification panel has something to float over. */
function FauxAppContent() {
  return (
    <div aria-hidden className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] sm:gap-4">
      <div className="glass-1 flex min-w-0 flex-col gap-4 rounded-sheen-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="h-3 w-28 rounded-full bg-sheen-hover" />
          <span className="h-5 w-14 rounded-full bg-sheen-accent-soft" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2 rounded-sheen-md border border-sheen-border p-3">
              <span className="h-2 w-2/3 rounded-full bg-sheen-hover" />
              <span className="h-4 w-1/2 rounded-full bg-sheen-accent-soft" />
            </div>
          ))}
        </div>
        <div className="flex h-24 items-end gap-1.5 border-b border-sheen-border">
          {[42, 64, 50, 78, 58, 92, 70, 54, 84, 74, 96, 66].map((h, i) => (
            <span key={i} className="flex-1 rounded-t-[4px] bg-sheen-accent-soft" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="glass-1 flex min-w-0 flex-col gap-3.5 rounded-sheen-lg p-4">
        <span className="h-3 w-24 rounded-full bg-sheen-hover" />
        {[80, 64, 72, 56].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="size-8 shrink-0 rounded-full bg-sheen-hover" />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="h-2 rounded-full bg-sheen-hover" style={{ width: `${w}%` }} />
              <span className="h-2 w-2/5 rounded-full bg-sheen-hover" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The "Notification center" docs page (/blocks/notification-center): live examples, props and notes. */
export function NotificationCenterPage() {
  const now = useDemoNow();
  const toast = useToast();
  const [items, setItems] = useState<NotificationItem[]>(sampleNotifications);
  const [arrival, setArrival] = useState(0);

  function answer(id: string, accepted: boolean) {
    setItems((list) =>
      list.map((item) =>
        item.id === id
          ? {
              ...item,
              read: true,
              actions: undefined,
              kind: accepted ? "success" : "system",
              title: accepted ? (
                <>
                  You joined the <b>Northwind</b> workspace
                </>
              ) : (
                <>
                  You declined the invite to <b>Northwind</b>
                </>
              ),
            }
          : item,
      ),
    );
    toast.success(accepted ? "Invite accepted" : "Invite declined");
  }

  function simulate() {
    const next = arrivals[arrival % arrivals.length];
    if (!next) return;
    setArrival((n) => n + 1);
    setItems((list) => [{ ...next, id: `new-${Date.now()}`, time: new Date(demoNowMs()) }, ...list]);
  }

  return (
    <Page
      eyebrow="Block"
      title="Notification center"
      description="A bell with a live unread count that opens a glass inbox: All, Unread and Mentions tabs, rows grouped by day with sticky headings, avatars badged by what happened, inline actions, mark read or unread, and dismiss with undo. On touch screens, swipe a row left to dismiss it. Arrow keys move through the list and Delete dismisses."
      source="theme/src/blocks/notification-center.tsx"
    >
      <NotificationCenterStage />
      <Example
        title="Bell and inbox"
        description="Open the bell, then try “Simulate a notification”: the bell rings, the count pops and the new row glows once. Hover a row for its actions, accept the invite, or press Delete on a focused row (Undo or ⌘Z / Ctrl+Z brings it back). On a phone the inbox opens as a sheet from the bottom of the screen."
        stageClassName="flex-col items-stretch justify-start gap-4 p-3 sm:p-6"
        controls={
          <>
            <Button size="sm" onClick={simulate}>
              Simulate a notification
            </Button>
            <Button size="sm" variant="glass" onClick={() => setItems(sampleNotifications())}>
              Reset
            </Button>
          </>
        }
        code={`
import { useState } from "react";

import { NotificationCenter, type NotificationItem } from "@sheenui/theme";

const router = { push: (to: string) => window.location.assign(to) };

const api = {
  deleteNotification: (id: string) => fetch("/api/notifications/" + id, { method: "DELETE" }),
};

export function Example() {
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: "n1",
      kind: "mention",
      actor: { name: "Ada Lovelace", avatar: "/ada.jpg" },
      title: <><b>Ada Lovelace</b> mentioned you in <b>Q3 roadmap</b></>,
      description: "“@you could you sanity-check the contrast numbers?”",
      time: "2026-10-30T09:41:00Z",
      href: "#demo-q3-roadmap-c12",
    },
    // …
  ]);

  return (
    <NotificationCenter
      notifications={items}
      onNotificationsChange={setItems}
      onSelect={(n) => {
        if (n.href) router.push(n.href);
      }}
      // Delete on the server once Undo is no longer possible.
      onDismissCommit={(n) => api.deleteNotification(n.id)}
      viewAllHref="/notifications"
    />
  );
}`}
      >
        <div className="glass-2 flex w-full min-w-0 items-center gap-2 rounded-sheen-xl px-3 py-2 sm:gap-3 sm:px-4">
          <span className="truncate text-sm font-semibold tracking-tight">Acme</span>
          <span className="ms-auto hidden h-9 min-w-0 flex-1 items-center gap-2 rounded-sheen-full bg-sheen-hover px-3 text-sm text-sheen-fg-muted sm:flex sm:max-w-64">
            <SearchIcon className="shrink-0" />
            <span className="truncate">Search…</span>
          </span>
          <NotificationCenter
            headingLevel="none"
            notifications={withInviteActions(items, answer)}
            onNotificationsChange={setItems}
            onSelect={(n) =>
              toast.info("Opened notification", typeof n.title === "string" ? n.title : "Wire onSelect to your router.")
            }
            viewAllHref="#"
            now={now}
            locale={DEMO_LOCALE}
            className="ms-auto sm:ms-0"
          />
          <span
            aria-hidden
            className="sheen-fill flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]"
          >
            YO
          </span>
        </div>
        <FauxAppContent />
      </Example>

      <Example
        title="Inline panel"
        description="NotificationPanel is the same inbox without the bell, as a glass card for a notifications page, a drawer or a dashboard column. Add your own header controls next to “Mark all as read”."
        stageClassName="p-3 sm:p-8"
        code={`
import { NotificationPanel, Button, type NotificationItem } from "@sheenui/theme";

const items: NotificationItem[] = [
  {
    id: "n1",
    kind: "mention",
    actor: { name: "Ada Lovelace" },
    title: <><b>Ada Lovelace</b> mentioned you in <b>Q3 roadmap</b></>,
    description: "“@you could you sanity-check the contrast numbers?”",
    time: "2026-10-30T09:41:00Z",
  },
  { id: "n2", kind: "success", title: "Deploy finished", time: "2026-10-30T08:12:00Z", read: true },
];

export function Example() {
  return (
    <NotificationPanel
      defaultNotifications={items}
      defaultTab="unread"
      viewAllHref="/notifications"
      headerActions={
        <Button variant="ghost" size="icon" aria-label="Notification settings" render={<a href="#demo-settings-notifications" />}>
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
          </svg>
        </Button>
      }
      className="h-[30rem]"
    />
  );
}`}
      >
        <NotificationPanel
          defaultNotifications={sampleNotifications()}
          defaultTab="unread"
          viewAllHref="#"
          headingLevel="none"
          headerActions={
            <Button variant="ghost" size="icon" aria-label="Notification settings" className="size-8">
              <GearIcon />
            </Button>
          }
          now={now}
          locale={DEMO_LOCALE}
          className="h-[30rem]"
        />
      </Example>

      <Example
        title="Any language"
        description="Every string is a label, and day headings and times come from Intl for the locale: Heute, Gestern, then weekdays. Mark everything read on the Ungelesen tab to reach the empty state."
        stageClassName="p-3 sm:p-8"
        code={`
import { NotificationPanel, type NotificationItem } from "@sheenui/theme";

const items: NotificationItem[] = [
  {
    id: "n1",
    kind: "mention",
    actor: { name: "Ada Lovelace" },
    title: <><b>Ada Lovelace</b> hat Sie in <b>Q3-Fahrplan</b> erwähnt</>,
    description: "“@you kannst du die Kontrastwerte prüfen?”",
    time: "2026-10-30T09:41:00Z",
  },
  { id: "n2", kind: "success", title: "Deployment abgeschlossen", time: "2026-10-30T08:12:00Z", read: true },
];

export function Example() {
  return (
    <NotificationPanel
      defaultNotifications={items}
      locale="de-DE"
      labels={{
        title: "Mitteilungen",
        markAllRead: "Alle gelesen",
        all: "Alle", unread: "Ungelesen", mentions: "Erwähnungen",
        today: "Heute", yesterday: "Gestern",
        emptyUnreadTitle: "Alles erledigt",
        // …every other string
      }}
    />
  );
}`}
      >
        <div lang="de" className="contents">
          <NotificationPanel
            defaultNotifications={germanItems()}
            now={now}
            locale="de-DE"
            labels={germanLabels}
            headingLevel="none"
            className="h-[26rem]"
          />
        </div>
      </Example>

      <PropsTable title="NotificationCenter" of={PROPS.NotificationCenter} />
      <PropsTable
        title="NotificationItem"
        rows={[
          ["id", "string", "", "Stable identifier of the notification, used as the React key and in callbacks."],
          ["title", "ReactNode", "", "The sentence; wrap names in <b>. Also the row’s accessible name."],
          [
            "time",
            "Date | string | number",
            "",
            "When it happened. An unreadable value never breaks the inbox: the item is listed last, under “Undated”.",
          ],
          [
            "actor",
            "{ name, avatar? }",
            "",
            "Shown as an avatar (initials without an image). Leave out for system notices.",
          ],
          [
            "kind",
            '"mention" | "comment" | "reaction" | "invite" | "assign" | "system" | "success" | "warning"',
            "",
            "Badge on the avatar, or the icon of a system notice.",
          ],
          ["description", "ReactNode", "", "A quote or detail, clamped to two lines."],
          ["read", "boolean", "false", "Read rows lose the dot and tint."],
          ["mention", "boolean", 'kind === "mention"', "Lists the notification under the Mentions tab."],
          ["href", "string", "", "Opening the row follows this link."],
          ["actions", "ReactNode", "", "Buttons under the text (Accept / Decline …)."],
        ]}
      />
      <PropsTable title="NotificationPanel" of={PROPS.NotificationPanel} />
      <KeyboardTable
        rows={[
          ["Enter / Space on the bell", "Open the panel."],
          ["Escape", "Close the panel and return focus to the bell."],
          ["Tab", "Enter the tabs, then the list."],
          ["↑ / ↓", "Previous / next notification."],
          ["Home / End", "First / last notification."],
          ["Enter", "Open the notification (it is marked read first)."],
          ["Delete", "Dismiss it; focus moves on."],
          ["Ctrl / Cmd + Z", "Undo the dismissal."],
        ]}
      />
      <A11yNotes
        notes={[
          "The bell is named “Notifications, 3 unread” and the count is text; the panel is a labeled popover.",
          "Dismissals (with the undo shortcut), arrivals and “all read” are announced politely.",
          "Swipe-to-dismiss on touch always has the dismiss button as an alternative.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Settings page
 * ===================================================================== */

const profile = {
  name: "Ada Lovelace",
  username: "ada",
  email: "ada@example.com",
  bio: "Writing the first program, one punch card at a time.",
  notifications: { mentions: true, comments: true, digest: true },
};

const teamOptions: SettingsNotificationOption[] = [
  { id: "deploys", group: "Chat", label: "Deploys", description: "Post to #releases when production updates." },
  {
    id: "incidents",
    group: "Chat",
    label: "Incidents",
    description: "Page the on-call channel when checks fail.",
    locked: true,
  },
  { id: "billing", group: "Email", label: "Billing receipts", description: "Monthly invoices to the billing contact." },
];

/** The "Settings page" docs page (/blocks/settings-page): live examples, props and notes. */
export function SettingsBlockPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Block"
      title="Settings page"
      description="A full account-settings layout: a sticky vertical nav with scroll-spy (a strip of pills when narrow), profile with photo upload, grouped notification switches, live appearance preferences, a danger zone behind type-to-confirm, and a glass save bar that rises with the number of unsaved changes. It responds to its own width, so it works in an app shell as well as a full page."
      source="theme/src/blocks/settings-page.tsx"
    >
      <SettingsPageStage />
      <Example
        title="Account settings"
        description="Edit anything: the save bar rises and counts your changes, and the nav shows where they are. Save (or press ⌘S / Ctrl+S), or Discard. The Appearance switches are the real SheenUI preferences and apply at once. Delete account asks you to type the username."
        frame="example.com/settings"
        stageClassName="h-[46rem] p-0 sm:p-0"
        code={`
import { SettingsPage, type SettingsValues } from "@sheenui/theme";

// Your API; each call throws on failure so the page can show the error
async function call(path: string, method: string, body?: unknown) {
  const res = await fetch("/api/" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Request failed");
}

const api = {
  updateProfile: (values: SettingsValues) => call("profile", "PUT", values),
  exportData: () => call("export", "POST"),
  deleteAccount: () => call("account", "DELETE"),
};

export function Example() {
  return (
    <SettingsPage
      defaultValues={{
        name: "Ada Lovelace",
        username: "ada",
        email: "ada@example.com",
        bio: "Writing the first program, one punch card at a time.",
        notifications: { mentions: true, comments: true, digest: true },
      }}
      onSave={async (values) => {
        // A second argument lists the changed fields: ["name", "notifications.digest", …]
        await api.updateProfile(values);
      }}
      onExportData={() => api.exportData()}
      onDeleteAccount={() => api.deleteAccount()}
      stickyTop="5rem" // below your app bar
    />
  );
}`}
      >
        <div className="h-full w-full overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-6">
          <SettingsPage
            defaultValues={profile}
            headingLevel="none"
            onSave={async () => {
              await wait(900);
              toast.success("Settings saved", "Wire onSave to your API.");
            }}
            onExportData={async () => {
              await wait(1200);
              toast.success("Export ready", "ada-export.zip would download now.");
            }}
            onDeleteAccount={async () => {
              await wait(1200);
              toast.success("Account deleted", "Just kidding: this is a demo.");
            }}
          />
        </div>
      </Example>

      <Example
        title="Your sections, your switches"
        description="Pick the sections and pass your own notification options (locked ones stay on). In a narrow column the sidebar turns into a sticky strip of pills: this one is capped at 28rem to show it on any screen."
        frame="example.com/team/alerts"
        stageClassName="h-[38rem] p-0 sm:p-0 justify-center"
        code={`
import { SettingsPage, type SettingsValues } from "@sheenui/theme";

async function save(values: SettingsValues) {
  const res = await fetch("/api/alerts", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error("Could not save");
}

export function Example() {
  return (
    <SettingsPage
      title="Team alerts"
      description="Where Acme tells your team about things."
      sections={["notifications", "appearance"]}
      notificationOptions={[
        { id: "deploys", group: "Chat", label: "Deploys", description: "Post to #releases when production updates." },
        { id: "incidents", group: "Chat", label: "Incidents", locked: true },
        { id: "billing", group: "Email", label: "Billing receipts" },
      ]}
      defaultValues={{ notifications: { deploys: true } }}
      onSave={save}
      className="max-w-md"
    />
  );
}`}
      >
        <div className="h-full w-full overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-6">
          <SettingsPage
            title="Team alerts"
            description="Where Acme tells your team about things."
            sections={["notifications", "appearance"]}
            labels={{ nav: "Team alert sections", notifications: "Alert channels", appearance: "Alert appearance" }}
            notificationOptions={teamOptions}
            defaultValues={{ notifications: { deploys: true } }}
            headingLevel="none"
            onSave={async () => {
              await wait(700);
              toast.success("Alerts updated");
            }}
            className="mx-auto max-w-md"
          />
        </div>
      </Example>

      <PropsTable of={PROPS.SettingsPage} />
      <KeyboardTable
        rows={[
          ["Tab", "The sticky section links, then the fields."],
          ["Enter on a section link", "Glide to the section and focus its heading."],
          ["Ctrl / Cmd + S", "Save, once something has changed (a bar with Save and Discard appears)."],
          ["Escape", "Cancel the delete-account dialog (it traps focus while open)."],
        ]}
      />
      <A11yNotes
        notes={[
          "The current section link has aria-current.",
          "Saving, errors and “unsaved changes” are announced in a polite status region.",
          "The browser asks before leaving with unsaved changes.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Auth split
 * ===================================================================== */

export function AuthSplitPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Block"
      title="Auth split"
      description="A split-screen sign-up page: a dark brand panel with a drifting aurora, a pointer light, selling points, numbers and rotating testimonials, beside a glass form with social sign-up, a live password-strength meter and checklist, terms, and a “check your inbox” finish. Side by side from 56rem of its own width; narrower, the form leads."
      source="theme/src/blocks/auth-split.tsx"
    >
      <AuthSplitStage />
      <Example
        title="Sign up"
        description="Type a password and watch the meter and checklist; try “password1”. Submit empty to see the errors, then fill it in for the success state. Hover the testimonial to hold it."
        frame="example.com/signup"
        stageClassName="p-0 sm:p-0"
        code={`
import { AuthSplit } from "@sheenui/theme";

// Your API; each call throws on failure so the form shows the message
async function post(path: string, body: unknown) {
  const res = await fetch("/api/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Request failed");
}

const api = {
  signUp: (values: { name: string; email: string; password: string }) => post("sign-up", values),
  resendConfirmation: (email: string) => post("resend-confirmation", { email }),
};

const signInWith = (provider: "github" | "google") => window.location.assign("/auth/" + provider);

export function Example() {
  return (
    <AuthSplit
      onSubmit={async ({ name, email, password }) => {
        await api.signUp({ name, email, password }); // throw to show the message in the form
      }}
      onSocial={(provider) => signInWith(provider)}
      onResend={(email) => api.resendConfirmation(email)}
      termsHref="/terms"
      privacyHref="/privacy"
      signInHref="/login"
      className="min-h-dvh"
    />
  );
}`}
      >
        <AuthSplit
          headingLevel="none"
          onSubmit={async (values) => {
            await wait(1100);
            if (values.email.endsWith("@example.com")) throw new Error("An account with this email already exists.");
          }}
          onSocial={(provider) =>
            toast.info(
              `Continue with ${provider === "github" ? "GitHub" : "Google"}`,
              "Wire onSocial to your OAuth flow.",
            )
          }
          onResend={async () => {
            await wait(900);
            toast.success("Confirmation sent again");
          }}
        />
      </Example>

      <Example
        title="Reversed, with your own story"
        description="Form on the left, one testimonial (no rotation controls), your headline and features, no numbers."
        frame="example.com/join"
        stageClassName="p-0 sm:p-0"
        code={`
import { AuthSplit, type AuthSplitValues } from "@sheenui/theme";

async function joinWaitlist({ name, email }: AuthSplitValues) {
  const res = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  if (!res.ok) throw new Error("Could not join the waitlist");
}

export function Example() {
  return (
    <AuthSplit
      reverse
      title="Join the beta"
      subtitle="We’re letting in a few teams each week."
      headline="Your design system, minus the busywork."
      description="Tokens, components and docs that stay in sync."
      features={["Design tokens to code in one click", "Every component AA in both themes"]}
      stats={[]}
      testimonials={[{ quote: "Our handoff meetings are gone.", name: "Ines Duarte", role: "Design lead, Fieldnote", rating: 5 }]}
      signInHref={null}
      onSubmit={joinWaitlist}
    />
  );
}`}
      >
        <AuthSplit
          reverse
          headingLevel="none"
          title="Join the beta"
          subtitle="We’re letting in a few teams each week."
          headline="Your design system, minus the busywork."
          description="Tokens, components and docs that stay in sync, so designers and engineers argue about ideas instead of hex codes."
          features={[
            "Design tokens to code in one click",
            "Every component AA in both themes",
            "Docs that write their own props tables",
          ]}
          stats={[]}
          testimonials={[
            {
              quote: "Our handoff meetings are gone. We just open the docs together.",
              name: "Ines Duarte",
              role: "Design lead, Fieldnote",
              rating: 5,
            },
          ]}
          signInHref={null}
          labels={{ testimonials: "Beta feedback" }}
          onSubmit={() => wait(900)}
        />
      </Example>

      <PropsTable of={PROPS.AuthSplit} />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Name, email, password (with its reveal button and strength checklist), the terms checkbox, submit, then the social buttons.",
          ],
          ["Enter", "Submit the form. A failed check moves focus to the first invalid field."],
          ["Enter / Space on the pause button or a dot", "Pause the testimonials / show that one."],
        ]}
      />
      <A11yNotes
        notes={[
          'A real <form> with linked error text (role="alert" for a failed submit) and polite status regions; the success screen takes focus.',
          'The password-strength bar is a role="meter" and the checklist is text, so strength never rests on color.',
          "Testimonials rotate with a pause button and dots, both reachable by keyboard; rotation is manual-only with reduced motion.",
        ]}
      />
    </Page>
  );
}
