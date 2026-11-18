Canonical: https://lokendra-builds.github.io/sheenui/blocks/settings-page

# Settings Page Template for React & Tailwind

URL: https://lokendra-builds.github.io/sheenui/blocks/settings-page
Sidebar name: Settings page

A complete React account-settings page: sticky scroll-spy nav, profile photo upload, notification switches, a danger zone and a glass save bar. Free, MIT.

What it is: A complete React settings page with a scroll-spy side nav, profile upload, notification switches and a glass save bar. Use SettingsPage as an account settings UI with Profile, Notifications, Appearance and Danger sections, where a sticky side nav jumps to each card and focuses its heading.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/settings-page.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Settings page

Files to copy from `theme/src/`:

- `blocks/settings-page.tsx`
- `components/alert-dialog/`
- `components/badge/`
- `components/button/`
- `components/drawer/parts/sheet.tsx`
- `components/input/`
- `components/kbd/`
- `components/navbar/`
- `components/popover/`
- `components/segmented/`
- `components/spinner/`
- `components/switch/`
- `components/textarea/`
- `components/vertical-nav/`
- `blocks/settings-page/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, field-control-shell.tsx, field-size.ts, form.ts, heading.ts, initials.ts, motion-props.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: settings-page. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { SettingsPage } from "@/components/sheenui/blocks/settings-page";
import { type SettingsValues } from "@/components/sheenui/blocks/settings-page/model";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { SettingsPage, type SettingsValues } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| defaultValues | Partial<SettingsValues> | optional, no default | Saved values to start from (and to compare against for the unsaved count). |
| notificationOptions | SettingsNotificationOption[] | defaultSettingsNotificationOptions | Rows of the notifications section (SettingsNotificationOption[], default defaultSettingsNotificationOptions). |
| onSave | ((values: SettingsValues, changed: string[]) => void \| Promise<void>) | optional, no default | Called with all values and the keys that changed. Return a promise for the saving state; throw to show an error. |
| onDeleteAccount | (() => void \| Promise<void>) | optional, no default | Called after the type-to-confirm dialog. Return a promise for its loading state; throw to show the error in the dialog. |
| onExportData | (() => void \| Promise<void>) | optional, no default | Shows the "Export data" row. Return a promise for a loading state. |
| onAvatarChange | ((file: File \| null) => void) | optional, no default | Called with the picked photo file (null when removed). Upload it and put the URL in avatar on save. |
| maxAvatarMb | number | 5 | Sets the largest photo accepted, in MB (number, default 5). |
| sections | SettingsSection[] | ["profile", "notifications", "appearance", "danger"] | Which sections to show, in order (SettingsSection[], default all four: profile, notifications, appearance, danger). |
| usernamePrefix | string | "example.com/" | Text before the username field, e.g. your domain (string, default "example.com/"). |
| stickyTop | string | "1rem" | Distance from the top of the scroller for the sticky navigation (any CSS length, default "1rem"), e.g. under your app bar. |
| warnOnLeave | boolean | true | Ask before leaving the page with unsaved changes (boolean, default true). |
| headingLevel | HeadingLevelOption | 1 | Level of the page title; sections are one level below (1 \| 2 \| 3, default 1). "none" renders every heading as a paragraph with no heading role, for a page shown as an example. |
| title | ReactNode | optional, no default | Page title. Pass null to leave it out. |
| description | ReactNode | optional, no default | Shows text under the page title (ReactNode). |
| labels | Partial<SettingsPageLabels> | defaultSettingsPageLabels | Every other string, for translation: labels={{ title: "…" }}; omitted keys keep the English of defaultSettingsPageLabels. All 64 keys of SettingsPageLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element (string). |

## Example 1 of 2: Account settings

Edit anything: the save bar rises and counts your changes, and the nav shows where they are. Save (or press ⌘S / Ctrl+S), or Discard. The Appearance switches are the real SheenUI preferences and apply at once. Delete account asks you to type the username.

```tsx
import { SettingsPage } from "@/components/sheenui/blocks/settings-page";
import { type SettingsValues } from "@/components/sheenui/blocks/settings-page/model";
// Package build (after the first npm release, or a packed tarball): import { SettingsPage, type SettingsValues } from "@sheenui/theme";

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
}
```

## Example 2 of 2: Your sections, your switches

Pick the sections and pass your own notification options (locked ones stay on). In a narrow column the sidebar turns into a sticky strip of pills: this one is capped at 28rem to show it on any screen.

```tsx
import { SettingsPage } from "@/components/sheenui/blocks/settings-page";
import { type SettingsValues } from "@/components/sheenui/blocks/settings-page/model";
// Package build (after the first npm release, or a packed tarball): import { SettingsPage, type SettingsValues } from "@sheenui/theme";

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
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The sticky section links, then the fields. |
| Enter on a section link | Glide to the section and focus its heading. |
| Ctrl / Cmd + S | Save, once something has changed (a bar with Save and Discard appears). |
| Escape | Cancel the delete-account dialog (it traps focus while open). |

## Accessibility

- The current section link has aria-current.
- Saving, errors and “unsaved changes” are announced in a polite status region.
- The browser asks before leaving with unsaved changes.

## All exports on this page

- SettingsPage — Props (see SettingsPageProps): defaultValues, notificationOptions, onSave(values, changed), onDeleteAccount, onExportData.
- defaultSettingsLabels — The former name of defaultSettingsPageLabels, kept as an alias for one release.
- defaultSettingsNotificationOptions — The sample Push and Email notification switches shown when notificationOptions is omitted; replace them with your own.
- defaultSettingsPageLabels — The English SettingsPageLabels used when labels is omitted; a partial labels prop is merged over them.


## When to use the settings page

- Use SettingsPage for the account area of a SaaS app, where someone updates a profile photo, flips notification switches, picks a theme and finds the risky actions in a Danger card at the bottom. The side nav follows the scroll and moves focus to the card you jump to, so keyboard users land in the right place. Use it as a settings layout template with grouped preference rows.
- Use it when edits should be explicit, since a save bar with Save and Discard appears only after something changes and Ctrl or Cmd plus S saves from the keyboard.
- Use it for apps that let people export data, upload an avatar up to maxAvatarMb (default 5), or delete their account behind a confirmation dialog.
- Skip it when a single setting should apply the moment it is toggled, such as a theme switch in a header; a lone Switch or SegmentedControl is enough without a save flow.
- Pair it with VerticalNav and ConfirmDialog, which it builds on, and with useTheme and useMotionPreference if your own app needs to read the preferences it exposes.


## Frequently asked questions

### How do I build a settings page in React with SettingsPage?

Pass defaultValues and an onSave(values, changed) handler; throw inside it to show an error in the save bar. Add onDeleteAccount, onExportData and onAvatarChange(file) to enable those actions. The sections prop picks which sections to show, and the default is all four.

### What happens if someone leaves with unsaved changes?

With warnOnLeave (default true), the browser asks before the page unloads while changes are pending. Unsaved changes, saving and errors are announced in a polite status region. The save bar offers Save and Discard, and Ctrl or Cmd plus S saves too.

### How does the sticky section navigation behave for keyboard users?

Tab walks the section links, and Enter glides to the section and focuses its heading. The current link carries aria-current. Position it with stickyTop, which defaults to 1rem, and use headingLevel (default 1) to match your page structure.

### How does the delete-account confirmation work?

Delete opens a type-to-confirm ConfirmDialog, so focus is trapped inside and Escape cancels it. You supply onDeleteAccount to perform the action, and labels lets you translate the dialog text. The save bar springs up and leaves faster without overshoot, and reduced motion removes the movement.


## Related pages

- [Switch](https://lokendra-builds.github.io/sheenui/components/switch)
- [Textarea](https://lokendra-builds.github.io/sheenui/forms/textarea)
- [Hero section](https://lokendra-builds.github.io/sheenui/blocks/hero-section)
- [Feature grid](https://lokendra-builds.github.io/sheenui/blocks/feature-grid)
- [Testimonials](https://lokendra-builds.github.io/sheenui/blocks/testimonials)
- [FAQ section](https://lokendra-builds.github.io/sheenui/blocks/faq-section)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
