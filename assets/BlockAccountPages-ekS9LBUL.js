import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{r as i}from"./toast-PePh6sao.js";import{t as a}from"./lazy-block-BfzH_8EP.js";import{i as o,n as s,o as c,r as l}from"./Page-DQ8sr8qt.js";import{t as u}from"./Example-DMEbQwm9.js";import{o as d,s as f,t as p}from"./demo-clock-CoEY-AlH.js";import{a as m,c as h,d as g,f as _,i as v,l as y,n as b,o as x,s as S,u as C}from"./BlockStages.account-Bp8j6vSz.js";import{t as w}from"./preload-helper-BrmCrVM7.js";var T=[[`notifications`,`NotificationItem[]`,``,`The notifications to show, when you control the list yourself (pair it with the change callbacks).`,!1],[`defaultNotifications`,`NotificationItem[]`,``,`Sets the starting list when uncontrolled.`,!1],[`onNotificationsChange`,`((next: NotificationItem[]) => void)`,``,`Called with the whole new list after any change (read, unread, dismiss, undo).`,!1],[`onSelect`,`((item: NotificationItem) => void)`,``,`Called when a notification is opened (it is marked as read first).`,!1],[`onDismiss`,`((item: NotificationItem) => void)`,``,`Called as soon as a notification is dismissed (button, Delete key or swipe). Undo can still bring it back: see onRestore.`,!1],[`onRestore`,`((item: NotificationItem) => void)`,``,`Called when Undo brings a dismissed notification back.`,!1],[`onDismissCommit`,`((item: NotificationItem) => void)`,``,`Called once a dismissal can no longer be undone: the undo bar timed out, another notification was dismissed, or the inbox closed. Delete it on your server here.`,!1],[`viewAllHref`,`string`,``,`Shows a "View all notifications" link at the bottom.`,!1],[`headerActions`,`ReactNode`,``,`Extra controls in the header, after "Mark all as read" (e.g. a settings link).`,!1],[`defaultTab`,`NotificationTab`,`"all"`,`The tab that is selected when the panel first renders.`,!1],[`now`,`Date`,`the real clock, refreshed every 30 seconds`,`The current time for "5m ago" and the day groups. On a prerendered or server-rendered page pass a fixed date, so the HTML matches what the browser renders when it hydrates.`,!1],[`locale`,`string`,`the browser's`,`Sets the BCP 47 locale for day headings and times.`,!1],[`labels`,`Partial<NotificationCenterLabels>`,`defaultNotificationCenterLabels`,'Every other string, for translation: `labels={{ trigger: "…" }}`; omitted keys keep the English of `defaultNotificationCenterLabels`. All 30 keys of `NotificationCenterLabels` are listed in the key table under the props table.',!1,{type:`NotificationCenterLabels`,const:`defaultNotificationCenterLabels`,keys:[[`trigger`,'(n) => (n > 0 ? `Notifications, ${n} unread` : "Notifications")'],[`title`,`Notifications`],[`markAllRead`,`Mark all as read`],[`close`,`Close notifications`],[`tabs`,`Filter notifications`],[`all`,`All`],[`unread`,`Unread`],[`mentions`,`Mentions`],[`today`,`Today`],[`yesterday`,`Yesterday`],[`undated`,`Undated`],[`justNow`,`Just now`],[`unreadState`,`unread`],[`markRead`,`Mark as read`],[`markUnread`,`Mark as unread`],[`dismiss`,`Dismiss`],[`swipeDismiss`,`Dismiss`],[`dismissed`,`Notification dismissed`],[`undo`,`Undo`],[`viewAll`,`View all notifications`],[`emptyAllTitle`,`No notifications yet`],[`emptyAllDescription`,`When teammates mention you, comment or invite you, it shows up here.`],[`emptyUnreadTitle`,`You're all caught up`],[`emptyUnreadDescription`,`Nothing new since you last looked. Enjoy the quiet.`],[`emptyMentionsTitle`,`No mentions`],[`emptyMentionsDescription`,`When someone @mentions you, you'll find it here.`],[`announceNew`,'(n) => (n === 1 ? "1 new notification" : `${n} new notifications`)'],[`announceAllRead`,`All notifications marked as read`],[`announceDismissed`,"(shortcut) => `Notification dismissed. Press ${shortcut} to undo.`"],[`announceRestored`,`Notification restored`]]}],[`headingLevel`,`HeadingLevelOption`,`2`,'Heading level of the panel title (`2 | 3 | 4`, default 2); day groups sit one level below. `"none"` renders paragraphs with no heading role (for an example).',!1],[`open`,`boolean`,``,`Whether the panel is open (controlled).`,!1],[`defaultOpen`,`boolean`,`false`,"Whether the panel is open at first when `open` is not controlled (`boolean`, default `false`).",!1],[`onOpenChange`,`((open: boolean) => void)`,``,`Called when the panel opens or closes.`,!1],[`side`,`"top" | "bottom" | "left" | "right"`,`"bottom"`,'Which side of the bell the panel opens on (`"top" | "bottom" | "left" | "right"`, default `"bottom"`).',!1],[`align`,`"center" | "end" | "start"`,`"end"`,'Sets the alignment against the bell (`"start" | "center" | "end"`, default `"end"`).',!1],[`max`,`number`,`99`,'Counts above this show as "99+" (`number`, default 99).',!1],[`className`,`string`,``,`Classes for the bell button (the outer element; the panel is portaled).`,!1],[`panelClassName`,`string`,``,`Adds extra classes to the glass panel.`,!1]],E=[[`notifications`,`NotificationItem[]`,``,`The notifications to show, when you control the list yourself (pair it with the change callbacks).`,!1],[`defaultNotifications`,`NotificationItem[]`,``,`Sets the starting list when uncontrolled.`,!1],[`onNotificationsChange`,`((next: NotificationItem[]) => void)`,``,`Called with the whole new list after any change (read, unread, dismiss, undo).`,!1],[`onSelect`,`((item: NotificationItem) => void)`,``,`Called when a notification is opened (it is marked as read first).`,!1],[`onDismiss`,`((item: NotificationItem) => void)`,``,`Called as soon as a notification is dismissed (button, Delete key or swipe). Undo can still bring it back: see onRestore.`,!1],[`onRestore`,`((item: NotificationItem) => void)`,``,`Called when Undo brings a dismissed notification back.`,!1],[`onDismissCommit`,`((item: NotificationItem) => void)`,``,`Called once a dismissal can no longer be undone: the undo bar timed out, another notification was dismissed, or the inbox closed. Delete it on your server here.`,!1],[`viewAllHref`,`string`,``,`Shows a "View all notifications" link at the bottom.`,!1],[`headerActions`,`ReactNode`,``,`Extra controls in the header, after "Mark all as read" (e.g. a settings link).`,!1],[`defaultTab`,`NotificationTab`,`"all"`,`The tab that is selected when the panel first renders.`,!1],[`now`,`Date`,`the real clock, refreshed every 30 seconds`,`The current time for "5m ago" and the day groups. On a prerendered or server-rendered page pass a fixed date, so the HTML matches what the browser renders when it hydrates.`,!1],[`locale`,`string`,`the browser's`,`Sets the BCP 47 locale for day headings and times.`,!1],[`labels`,`Partial<NotificationCenterLabels>`,`defaultNotificationCenterLabels`,'Every other string, for translation: `labels={{ trigger: "…" }}`; omitted keys keep the English of `defaultNotificationCenterLabels`. All 30 keys of `NotificationCenterLabels` are listed in the key table under the props table.',!1,{type:`NotificationCenterLabels`,const:`defaultNotificationCenterLabels`,keys:[[`trigger`,'(n) => (n > 0 ? `Notifications, ${n} unread` : "Notifications")'],[`title`,`Notifications`],[`markAllRead`,`Mark all as read`],[`close`,`Close notifications`],[`tabs`,`Filter notifications`],[`all`,`All`],[`unread`,`Unread`],[`mentions`,`Mentions`],[`today`,`Today`],[`yesterday`,`Yesterday`],[`undated`,`Undated`],[`justNow`,`Just now`],[`unreadState`,`unread`],[`markRead`,`Mark as read`],[`markUnread`,`Mark as unread`],[`dismiss`,`Dismiss`],[`swipeDismiss`,`Dismiss`],[`dismissed`,`Notification dismissed`],[`undo`,`Undo`],[`viewAll`,`View all notifications`],[`emptyAllTitle`,`No notifications yet`],[`emptyAllDescription`,`When teammates mention you, comment or invite you, it shows up here.`],[`emptyUnreadTitle`,`You're all caught up`],[`emptyUnreadDescription`,`Nothing new since you last looked. Enjoy the quiet.`],[`emptyMentionsTitle`,`No mentions`],[`emptyMentionsDescription`,`When someone @mentions you, you'll find it here.`],[`announceNew`,'(n) => (n === 1 ? "1 new notification" : `${n} new notifications`)'],[`announceAllRead`,`All notifications marked as read`],[`announceDismissed`,"(shortcut) => `Notification dismissed. Press ${shortcut} to undo.`"],[`announceRestored`,`Notification restored`]]}],[`headingLevel`,`HeadingLevelOption`,`2`,'Heading level of the panel title (`2 | 3 | 4`, default 2); day groups sit one level below. `"none"` renders paragraphs with no heading role (for an example).',!1],[`className`,`string`,`32rem`,`Classes for the glass card (set its height here; it defaults to 32rem).`,!1]],D=e(t()),O=n();a(()=>w(()=>import(`./settings-page-liP5TBCk.js`).then(e=>e.SettingsPage),[]),{minHeight:`40rem`,eager:!0}),a(()=>w(()=>import(`./auth-split-BnEQlilF.js`).then(e=>e.AuthSplit),[]),{minHeight:`32rem`,eager:!0});function k(){return(0,O.jsxs)(`div`,{"aria-hidden":!0,className:`grid w-full grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] sm:gap-4`,children:[(0,O.jsxs)(`div`,{className:`glass-1 flex min-w-0 flex-col gap-4 rounded-sheen-lg p-4`,children:[(0,O.jsxs)(`div`,{className:`flex items-center justify-between gap-3`,children:[(0,O.jsx)(`span`,{className:`h-3 w-28 rounded-full bg-sheen-hover`}),(0,O.jsx)(`span`,{className:`h-5 w-14 rounded-full bg-sheen-accent-soft`})]}),(0,O.jsx)(`div`,{className:`grid grid-cols-3 gap-2`,children:[0,1,2].map(e=>(0,O.jsxs)(`div`,{className:`flex flex-col gap-2 rounded-sheen-md border border-sheen-border p-3`,children:[(0,O.jsx)(`span`,{className:`h-2 w-2/3 rounded-full bg-sheen-hover`}),(0,O.jsx)(`span`,{className:`h-4 w-1/2 rounded-full bg-sheen-accent-soft`})]},e))}),(0,O.jsx)(`div`,{className:`flex h-24 items-end gap-1.5 border-b border-sheen-border`,children:[42,64,50,78,58,92,70,54,84,74,96,66].map((e,t)=>(0,O.jsx)(`span`,{className:`flex-1 rounded-t-[4px] bg-sheen-accent-soft`,style:{height:`${e}%`}},t))})]}),(0,O.jsxs)(`div`,{className:`glass-1 flex min-w-0 flex-col gap-3.5 rounded-sheen-lg p-4`,children:[(0,O.jsx)(`span`,{className:`h-3 w-24 rounded-full bg-sheen-hover`}),[80,64,72,56].map((e,t)=>(0,O.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,O.jsx)(`span`,{className:`size-8 shrink-0 rounded-full bg-sheen-hover`}),(0,O.jsxs)(`span`,{className:`flex min-w-0 flex-1 flex-col gap-1.5`,children:[(0,O.jsx)(`span`,{className:`h-2 rounded-full bg-sheen-hover`,style:{width:`${e}%`}}),(0,O.jsx)(`span`,{className:`h-2 w-2/5 rounded-full bg-sheen-hover`})]})]},t))]})]})}function A(){let e=f(),t=i(),[n,a]=(0,D.useState)(g),[w,A]=(0,D.useState)(0);function j(e,n){a(t=>t.map(t=>t.id===e?{...t,read:!0,actions:void 0,kind:n?`success`:`system`,title:n?(0,O.jsxs)(O.Fragment,{children:[`You joined the `,(0,O.jsx)(`b`,{children:`Northwind`}),` workspace`]}):(0,O.jsxs)(O.Fragment,{children:[`You declined the invite to `,(0,O.jsx)(`b`,{children:`Northwind`})]})}:t)),t.success(n?`Invite accepted`:`Invite declined`)}function M(){let e=h[w%h.length];e&&(A(e=>e+1),a(t=>[{...e,id:`new-${Date.now()}`,time:new Date(d())},...t]))}return(0,O.jsxs)(s,{eyebrow:`Block`,title:`Notification center`,description:`A bell with a live unread count that opens a glass inbox: All, Unread and Mentions tabs, rows grouped by day with sticky headings, avatars badged by what happened, inline actions, mark read or unread, and dismiss with undo. On touch screens, swipe a row left to dismiss it. Arrow keys move through the list and Delete dismisses.`,source:`theme/src/blocks/notification-center.tsx`,children:[(0,O.jsx)(b,{}),(0,O.jsxs)(u,{title:`Bell and inbox`,description:`Open the bell, then try “Simulate a notification”: the bell rings, the count pops and the new row glows once. Hover a row for its actions, accept the invite, or press Delete on a focused row (Undo or ⌘Z / Ctrl+Z brings it back). On a phone the inbox opens as a sheet from the bottom of the screen.`,stageClassName:`flex-col items-stretch justify-start gap-4 p-3 sm:p-6`,controls:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(r,{size:`sm`,onClick:M,children:`Simulate a notification`}),(0,O.jsx)(r,{size:`sm`,variant:`glass`,onClick:()=>a(g()),children:`Reset`})]}),code:`
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
}`,children:[(0,O.jsxs)(`div`,{className:`glass-2 flex w-full min-w-0 items-center gap-2 rounded-sheen-xl px-3 py-2 sm:gap-3 sm:px-4`,children:[(0,O.jsx)(`span`,{className:`truncate text-sm font-semibold tracking-tight`,children:`Acme`}),(0,O.jsxs)(`span`,{className:`ms-auto hidden h-9 min-w-0 flex-1 items-center gap-2 rounded-sheen-full bg-sheen-hover px-3 text-sm text-sheen-fg-muted sm:flex sm:max-w-64`,children:[(0,O.jsx)(S,{className:`shrink-0`}),(0,O.jsx)(`span`,{className:`truncate`,children:`Search…`})]}),(0,O.jsx)(m,{headingLevel:`none`,notifications:_(n,j),onNotificationsChange:a,onSelect:e=>t.info(`Opened notification`,typeof e.title==`string`?e.title:`Wire onSelect to your router.`),viewAllHref:`#`,now:e,locale:p,className:`ms-auto sm:ms-0`}),(0,O.jsx)(`span`,{"aria-hidden":!0,className:`sheen-fill flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]`,children:`YO`})]}),(0,O.jsx)(k,{})]}),(0,O.jsx)(u,{title:`Inline panel`,description:`NotificationPanel is the same inbox without the bell, as a glass card for a notifications page, a drawer or a dashboard column. Add your own header controls next to “Mark all as read”.`,stageClassName:`p-3 sm:p-8`,code:`
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
}`,children:(0,O.jsx)(x,{defaultNotifications:g(),defaultTab:`unread`,viewAllHref:`#`,headingLevel:`none`,headerActions:(0,O.jsx)(r,{variant:`ghost`,size:`icon`,"aria-label":`Notification settings`,className:`size-8`,children:(0,O.jsx)(v,{})}),now:e,locale:p,className:`h-[30rem]`})}),(0,O.jsx)(u,{title:`Any language`,description:`Every string is a label, and day headings and times come from Intl for the locale: Heute, Gestern, then weekdays. Mark everything read on the Ungelesen tab to reach the empty state.`,stageClassName:`p-3 sm:p-8`,code:`
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
}`,children:(0,O.jsx)(`div`,{lang:`de`,className:`contents`,children:(0,O.jsx)(x,{defaultNotifications:y(),now:e,locale:`de-DE`,labels:C,headingLevel:`none`,className:`h-[26rem]`})})}),(0,O.jsx)(l,{title:`NotificationCenter`,of:T}),(0,O.jsx)(l,{title:`NotificationItem`,rows:[[`id`,`string`,``,`Stable identifier of the notification, used as the React key and in callbacks.`],[`title`,`ReactNode`,``,`The sentence; wrap names in <b>. Also the row’s accessible name.`],[`time`,`Date | string | number`,``,`When it happened. An unreadable value never breaks the inbox: the item is listed last, under “Undated”.`],[`actor`,`{ name, avatar? }`,``,`Shown as an avatar (initials without an image). Leave out for system notices.`],[`kind`,`"mention" | "comment" | "reaction" | "invite" | "assign" | "system" | "success" | "warning"`,``,`Badge on the avatar, or the icon of a system notice.`],[`description`,`ReactNode`,``,`A quote or detail, clamped to two lines.`],[`read`,`boolean`,`false`,`Read rows lose the dot and tint.`],[`mention`,`boolean`,`kind === "mention"`,`Lists the notification under the Mentions tab.`],[`href`,`string`,``,`Opening the row follows this link.`],[`actions`,`ReactNode`,``,`Buttons under the text (Accept / Decline …).`]]}),(0,O.jsx)(l,{title:`NotificationPanel`,of:E}),(0,O.jsx)(c,{rows:[[`Enter / Space on the bell`,`Open the panel.`],[`Escape`,`Close the panel and return focus to the bell.`],[`Tab`,`Enter the tabs, then the list.`],[`↑ / ↓`,`Previous / next notification.`],[`Home / End`,`First / last notification.`],[`Enter`,`Open the notification (it is marked read first).`],[`Delete`,`Dismiss it; focus moves on.`],[`Ctrl / Cmd + Z`,`Undo the dismissal.`]]}),(0,O.jsx)(o,{notes:[`The bell is named “Notifications, 3 unread” and the count is text; the panel is a labeled popover.`,`Dismissals (with the undo shortcut), arrivals and “all read” are announced politely.`,`Swipe-to-dismiss on touch always has the dismiss button as an alternative.`]})]})}export{A as default};