import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{r as n}from"./toast-CiFfCngf.js";import{t as r}from"./lazy-block-BfzH_8EP.js";import{i,n as a,o,r as s}from"./Page-BRuP8nt1.js";import{t as c}from"./Example-DaSezASZ.js";import"./demo-clock-CoEY-AlH.js";import{r as l}from"./demo-utils-DKtmFFFD.js";import{r as u}from"./BlockStages.account-BErCSmgv.js";import{t as d}from"./preload-helper-BrmCrVM7.js";var f=[[`defaultValues`,`Partial<SettingsValues>`,``,`Saved values to start from (and to compare against for the unsaved count).`,!1],[`notificationOptions`,`SettingsNotificationOption[]`,`defaultSettingsNotificationOptions`,"Rows of the notifications section (`SettingsNotificationOption[]`, default `defaultSettingsNotificationOptions`).",!1],[`onSave`,`((values: SettingsValues, changed: string[]) => void | Promise<void>)`,``,`Called with all values and the keys that changed. Return a promise for the saving state; throw to show an error.`,!1],[`onDeleteAccount`,`(() => void | Promise<void>)`,``,`Called after the type-to-confirm dialog. Return a promise for its loading state; throw to show the error in the dialog.`,!1],[`onExportData`,`(() => void | Promise<void>)`,``,`Shows the "Export data" row. Return a promise for a loading state.`,!1],[`onAvatarChange`,`((file: File | null) => void)`,``,"Called with the picked photo file (null when removed). Upload it and put the URL in `avatar` on save.",!1],[`maxAvatarMb`,`number`,`5`,"Sets the largest photo accepted, in MB (`number`, default 5).",!1],[`sections`,`SettingsSection[]`,`["profile", "notifications", "appearance", "danger"]`,"Which sections to show, in order (`SettingsSection[]`, default all four: profile, notifications, appearance, danger).",!1],[`usernamePrefix`,`string`,`"example.com/"`,'Text before the username field, e.g. your domain (`string`, default `"example.com/"`).',!1],[`stickyTop`,`string`,`"1rem"`,'Distance from the top of the scroller for the sticky navigation (any CSS length, default `"1rem"`), e.g. under your app bar.',!1],[`warnOnLeave`,`boolean`,`true`,"Ask before leaving the page with unsaved changes (`boolean`, default `true`).",!1],[`headingLevel`,`HeadingLevelOption`,`1`,'Level of the page title; sections are one level below (`1 | 2 | 3`, default 1). `"none"` renders every heading as a paragraph with no heading role, for a page shown as an example.',!1],[`title`,`ReactNode`,``,`Page title. Pass null to leave it out.`,!1],[`description`,`ReactNode`,``,"Shows text under the page title (`ReactNode`).",!1],[`labels`,`Partial<SettingsPageLabels>`,`defaultSettingsPageLabels`,'Every other string, for translation: `labels={{ title: "…" }}`; omitted keys keep the English of `defaultSettingsPageLabels`. All 64 keys of `SettingsPageLabels` are listed in the key table under the props table.',!1,{type:`SettingsPageLabels`,const:`defaultSettingsPageLabels`,keys:[[`title`,`Settings`],[`description`,`Manage your profile, notifications and how SheenUI looks for you.`],[`nav`,`Settings sections`],[`profile`,`Profile`],[`profileDescription`,`This is how others see you across the workspace.`],[`notifications`,`Notifications`],[`notificationsDescription`,`Choose what reaches you, and where.`],[`appearance`,`Appearance`],[`appearanceDescription`,`Saved on this device and applied right away.`],[`danger`,`Danger zone`],[`dangerDescription`,`Irreversible actions. Take a breath first.`],[`photo`,`Profile photo`],[`changePhoto`,`Change profile photo`],[`uploadPhoto`,`Upload photo`],[`removePhoto`,`Remove`],[`photoHint`,`PNG, JPG or WebP, square works best. Or drop an image on the circle.`],[`photoNotImage`,`That file isn't an image. Pick a PNG, JPG or WebP.`],[`photoTooBig`,"(mb) => `Images up to ${mb} MB, please.`"],[`name`,`Display name`],[`namePlaceholder`,`Ada Lovelace`],[`nameRequired`,`Enter the name people should see.`],[`username`,`Username`],[`usernameHint`,`Your profile link. Lowercase letters, numbers and dashes.`],[`usernameInvalid`,`Use 3–30 lowercase letters, numbers or dashes.`],[`email`,`Email`],[`emailHint`,`Used for sign-in and notifications. Never shown publicly.`],[`emailInvalid`,`Enter a valid email address.`],[`bio`,`Bio`],[`bioPlaceholder`,`A sentence or two about you`],[`bioHint`,`Shown on your public profile.`],[`alwaysOn`,`Always on`],[`theme`,`Theme`],[`themeHint`,`System follows your device's light or dark setting.`],[`light`,`Light`],[`dark`,`Dark`],[`system`,`System`],[`reduceMotion`,`Reduce motion`],[`reduceMotionHint`,`Swap slides, springs and parallax for simple fades.`],[`reduceTransparency`,`Reduce transparency`],[`reduceTransparencyHint`,`Solid surfaces instead of frosted glass.`],[`appliesInstantly`,`Applies instantly`],[`exportTitle`,`Export your data`],[`exportDescription`,`Download everything you've created as a ZIP of JSON and CSV files.`],[`exportAction`,`Export data`],[`exportError`,`Couldn't export your data. Try again.`],[`deleteTitle`,`Delete account`],[`deleteDescription`,`Permanently remove your account, workspaces and files. This can't be undone.`],[`deleteAction`,`Delete account`],[`deleteConfirmTitle`,`Delete your account?`],[`deleteConfirmDescription`,`Your profile, workspaces and every file in them will be erased for good. Members of shared workspaces lose access too.`],[`deleteConfirm`,`Delete forever`],[`deleteDialog`,`nested object: takes the keys of ConfirmDialogLabels; empty here, so its own English defaults apply`],[`unsaved`,'(n) => (n === 1 ? "1 unsaved change" : `${n} unsaved changes`)'],[`unsavedShort`,"(n) => `${n} unsaved`"],[`discard`,`Discard`],[`save`,`Save changes`],[`saveShort`,`Save`],[`saving`,`Saving…`],[`saved`,`Changes saved`],[`saveError`,`Couldn't save. Check your connection and try again.`],[`fixErrors`,'(n) => (n === 1 ? "Fix 1 field to save" : `Fix ${n} fields to save`)'],[`announceDirty`,`You have unsaved changes`],[`announceSaved`,`Changes saved`],[`announceDiscarded`,`Changes discarded`]]}],[`className`,`string`,``,"Adds extra classes to the outer element (`string`).",!1]];e();var p=t(),m=r(()=>d(()=>import(`./settings-page-HVqywIHZ.js`).then(e=>e.SettingsPage),[]),{minHeight:`40rem`,eager:!0});r(()=>d(()=>import(`./auth-split-h-621zIe.js`).then(e=>e.AuthSplit),[]),{minHeight:`32rem`,eager:!0});var h={name:`Ada Lovelace`,username:`ada`,email:`ada@example.com`,bio:`Writing the first program, one punch card at a time.`,notifications:{mentions:!0,comments:!0,digest:!0}},g=[{id:`deploys`,group:`Chat`,label:`Deploys`,description:`Post to #releases when production updates.`},{id:`incidents`,group:`Chat`,label:`Incidents`,description:`Page the on-call channel when checks fail.`,locked:!0},{id:`billing`,group:`Email`,label:`Billing receipts`,description:`Monthly invoices to the billing contact.`}];function _(){let e=n();return(0,p.jsxs)(a,{eyebrow:`Block`,title:`Settings page`,description:`A full account-settings layout: a sticky vertical nav with scroll-spy (a strip of pills when narrow), profile with photo upload, grouped notification switches, live appearance preferences, a danger zone behind type-to-confirm, and a glass save bar that rises with the number of unsaved changes. It responds to its own width, so it works in an app shell as well as a full page.`,source:`theme/src/blocks/settings-page.tsx`,children:[(0,p.jsx)(u,{}),(0,p.jsx)(c,{title:`Account settings`,description:`Edit anything: the save bar rises and counts your changes, and the nav shows where they are. Save (or press ⌘S / Ctrl+S), or Discard. The Appearance switches are the real SheenUI preferences and apply at once. Delete account asks you to type the username.`,frame:`example.com/settings`,stageClassName:`h-[46rem] p-0 sm:p-0`,code:`
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
}`,children:(0,p.jsx)(`div`,{className:`h-full w-full overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-6`,children:(0,p.jsx)(m,{defaultValues:h,headingLevel:`none`,onSave:async()=>{await l(900),e.success(`Settings saved`,`Wire onSave to your API.`)},onExportData:async()=>{await l(1200),e.success(`Export ready`,`ada-export.zip would download now.`)},onDeleteAccount:async()=>{await l(1200),e.success(`Account deleted`,`Just kidding: this is a demo.`)}})})}),(0,p.jsx)(c,{title:`Your sections, your switches`,description:`Pick the sections and pass your own notification options (locked ones stay on). In a narrow column the sidebar turns into a sticky strip of pills: this one is capped at 28rem to show it on any screen.`,frame:`example.com/team/alerts`,stageClassName:`h-[38rem] p-0 sm:p-0 justify-center`,code:`
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
}`,children:(0,p.jsx)(`div`,{className:`h-full w-full overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-6`,children:(0,p.jsx)(m,{title:`Team alerts`,description:`Where Acme tells your team about things.`,sections:[`notifications`,`appearance`],labels:{nav:`Team alert sections`,notifications:`Alert channels`,appearance:`Alert appearance`},notificationOptions:g,defaultValues:{notifications:{deploys:!0}},headingLevel:`none`,onSave:async()=>{await l(700),e.success(`Alerts updated`)},className:`mx-auto max-w-md`})})}),(0,p.jsx)(s,{of:f}),(0,p.jsx)(o,{rows:[[`Tab`,`The sticky section links, then the fields.`],[`Enter on a section link`,`Glide to the section and focus its heading.`],[`Ctrl / Cmd + S`,`Save, once something has changed (a bar with Save and Discard appears).`],[`Escape`,`Cancel the delete-account dialog (it traps focus while open).`]]}),(0,p.jsx)(i,{notes:[`The current section link has aria-current.`,`Saving, errors and “unsaved changes” are announced in a polite status region.`,`The browser asks before leaving with unsaved changes.`]})]})}export{_ as default};