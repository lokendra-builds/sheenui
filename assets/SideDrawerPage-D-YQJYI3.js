import{t as e}from"./lazy-block-BfzH_8EP.js";import{i as t,n,o as r,r as i}from"./Page-BRuP8nt1.js";import{t as a}from"./ShowcaseStage-6bIrHuoy.js";import{t as o}from"./Example-DaSezASZ.js";import{t as s}from"./vendor-react-D30i__oY.js";import{t as c}from"./preload-helper-BrmCrVM7.js";var l=[[`value`,`string`,``,`The text that is copied.`,!0],[`label`,`string`,`labels.copy`,`Sets the accessible name, e.g. "Copy email address".`,!1],[`size`,`"sm" | "md"`,`"sm"`,`"sm" 28px (rows, chips) or "md" 36px. Both grow to a 44px hit area on touch screens.`,!1],[`labels`,`Partial<CopyLabels>`,`defaultCopyLabels`,'Override the "Copy", "Copied" and failure strings (i18n). Every other string, for translation: `labels={{ copy: "…" }}`; omitted keys keep the English of `defaultCopyLabels`. All 3 keys of `CopyLabels` are listed in the key table under the props table.',!1,{type:`CopyLabels`,const:`defaultCopyLabels`,keys:[[`copy`,`Copy`],[`copied`,`Copied`],[`failed`,`Couldn’t copy. Select the text and copy it manually.`]]}],[`onCopied`,`((value: string) => void)`,``,`Called after a successful copy.`,!1]],u=[[`value`,`string`,``,`The text shown (in mono) and copied, e.g. an id.`,!0],[`label`,`string`,``,`What the value is, for the accessible name: "Order ID" → "Copy Order ID ord_8Hk2Qx".`,!1],[`display`,`string`,``,"Shown instead of `value` (the full value is still copied).",!1],[`labels`,`Partial<CopyLabels>`,`defaultCopyLabels`,'Override the "Copy", "Copied" and failure strings (i18n). Every other string, for translation: `labels={{ copy: "…" }}`; omitted keys keep the English of `defaultCopyLabels`. All 3 keys of `CopyLabels` are listed in the key table under the props table.',!1,{type:`CopyLabels`,const:`defaultCopyLabels`,keys:[[`copy`,`Copy`],[`copied`,`Copied`],[`failed`,`Couldn’t copy. Select the text and copy it manually.`]]}],[`onCopied`,`((value: string) => void)`,``,`Called after a successful copy.`,!1]],d=[[`label`,`ReactNode`,``,"Holds the term, rendered as the `<dt>`.",!0],[`children`,`ReactNode`,``,`The value. Empty (undefined, null, "") shows an em dash.`,!1],[`copyValue`,`string`,``,`Shows a copy button that copies this text.`,!1],[`copyLabel`,`string`,`labels.copyValue(label) when the label is text`,`Sets the accessible name of the copy button.`,!1],[`hint`,`ReactNode`,``,`Shows small muted text under the value.`,!1],[`labelClassName`,`string`,``,"Adds a class name to the `<dt>` element.",!1],[`valueClassName`,`string`,``,"Adds a class name to the `<dd>` element.",!1]],f=[[`layout`,`DescriptionListLayout`,`"inline"`,`"inline" (default): label left, value right. "stacked": label above value.`,!1],[`variant`,`"glass" | "plain"`,`"plain"`,`"plain" (default): no surface. "glass": its own glass card.`,!1],[`dividers`,`boolean`,`true`,`Draws a hairline between rows.`,!1],[`size`,`"sm" | "md"`,`"md"`,`Sets the row text: "sm" 13px, "md" 14px (default).`,!1],[`items`,`DescriptionListEntry[]`,``,`Works as shorthand for a list of DescriptionItem children.`,!1],[`children`,`ReactNode`,``,"Holds `DescriptionItem` rows, shown after any `items`.",!1],[`labels`,`Partial<DescriptionListLabels>`,`defaultDescriptionListLabels`,'Every other string, for translation: `labels={{ copy: "…" }}`; omitted keys keep the English of `defaultDescriptionListLabels`. All 5 keys of `DescriptionListLabels` are listed in the key table under the props table.',!1,{type:`DescriptionListLabels`,const:`defaultDescriptionListLabels`,keys:[[`copy`,`Copy`],[`copied`,`Copied`],[`failed`,`Couldn’t copy. Select the text and copy it manually.`],[`empty`,`Not set`],[`copyValue`,"(label) => `Copy ${label.toLowerCase()}`"]]}]],p=[[`modal`,`boolean | "trap-focus"`,`true`,"Determines if the drawer enters a modal state when open. - `true`: user interaction is limited to just the drawer: focus is trapped, document page scroll is locked, and pointer interactions on outside elements are disabled. - `false`: user interaction with the rest of the document is allowed. - `'trap-focus'`: focus is trapped inside the drawer, but document page scroll is not locked and pointer interactions outside of it remain enabled.",!1],[`defaultOpen`,`boolean`,`false`,"Whether the drawer is initially open. To render a controlled drawer, use the `open` prop instead.",!1],[`onOpenChange`,`((open: boolean, details?: SideDrawerChangeDetails) => void)`,``,'Called when the drawer opens or closes. `details` is Base UI\'s event details; it is undefined when a close guard settled later (e.g. after "Discard?") or `requestClose` closed it.',!1],[`dir`,`"ltr" | "rtl"`,`Base UI's DirectionProvider, then the page's dir`,`Reading direction: the panel slides from the inline end (right in "ltr", left in "rtl").`,!1],[`labels`,`Partial<SideDrawerLabels>`,`defaultSideDrawerLabels`,'Every other string, for translation: `labels={{ close: "…" }}`; omitted keys keep the English of `defaultSideDrawerLabels`. All 6 keys of `SideDrawerLabels` are listed in the key table under the props table.',!1,{type:`SideDrawerLabels`,const:`defaultSideDrawerLabels`,keys:[[`close`,`Close`],[`escapeKey`,`Esc`],[`resize`,`Resize panel`],[`resizeValue`,"(width) => `${Math.round(width)} pixels wide`"],[`resizeWider`,`Make panel wider`],[`resizeNarrower`,`Make panel narrower`]]}]],m=[[`scrollRef`,`Ref<HTMLDivElement>`,``,`Receives the ref to the scrolling element.`,!1],[`wrapperClassName`,`string`,``,`Class for the outer wrapper (holds the scroll shadows).`,!1]],h=[[`children`,`ReactNode`,``,"The sheet's content: usually `DrawerHeader`, `DrawerBody` and `DrawerFooter`.",!1],[`container`,`HTMLElement | ShadowRoot | RefObject<HTMLElement | ShadowRoot | null> | null`,`<body>`,`Where to portal the drawer (defaults to <body>).`,!1],[`viewportClassName`,`string`,``,`Adds extra classes to the full-screen positioning layer.`,!1],[`backdropClassName`,`string`,``,`Class for the dimmed scrim behind a modal drawer.`,!1],[`inset`,`boolean`,`true`,"Float the panel off the screen edges with a full radius, a lit leading edge and an accent aura spilling onto the page (like an iOS 26 sheet). `false` attaches it flush to the edge (the old look).",!1],[`stateLight`,`boolean`,`true`,"Lights the panel while a `SideDrawerForm` inside it saves (accent glow) or has saved or failed (green, red): a lit edge and a light pool on the glass's own layer (`data-state` on the panel). The seal and the lit leading edge stay.",!1],[`size`,`SideDrawerSize`,`"md"`,`Width: sm 24rem · md 32rem · lg 40rem · xl 48rem. Full width under 640px.`,!1],[`resizable`,`boolean`,`false`,`A handle on the free edge to drag (or arrow-key) the width. Hidden under 640px.`,!1],[`defaultWidth`,`number`,``,"Starting width in px when resizable (instead of `size`).",!1],[`minWidth`,`number`,`320`,`Sets the narrowest width in px when resizing.`,!1],[`maxWidth`,`number`,``,`Widest width in px when resizing (never more than the screen minus 3rem).`,!1],[`storageKey`,`string`,``,`Remember the resized width under this key (localStorage, per browser).`,!1],[`onWidthChange`,`((width: number | null) => void)`,``,"Called when a resize ends (pointer up, a key press, a reset). `null` = back to `size`.",!1],[`publishEdge`,`boolean`,`false`,"Publish the panel's width as `--sheen-side-drawer-right` (or `-left`) on `<html>` while it is open, so fixed UI in that corner (a toast stack) can move out of its way. Off by default: an inherited custom property on the root element restyles the whole document on every open and close (200 to 290 ms on a 4x-throttled phone for a 3,500-element page), and nothing in SheenUI reads it.",!1]],g=[[`title`,`ReactNode`,``,`Shows the record's name in the header.`,!1],[`titleText`,`string`,``,"Plain-text title for announcements when `title` is not a string.",!1],[`subtitle`,`ReactNode`,``,`Shows text under the title, such as an email or a date.`,!1],[`avatar`,`ReactNode`,``,`Shows an Avatar or icon before the title.`,!1],[`status`,`ReactNode`,``,`Shows content next to the title, usually a Badge.`,!1],[`recordId`,`string`,``,`An id shown as a copyable chip under the title.`,!1],[`recordIdLabel`,`string`,``,`What the id is, for its accessible name ("Order ID").`,!1],[`actions`,`ReactNode`,``,`Adds extra header buttons, before Edit.`,!1],[`menu`,`ReactNode`,``,`MenuItem elements for the ⋯ menu (Duplicate, Archive, Delete…).`,!1],[`editable`,`boolean`,`on when there is an editor or onEdit`,`Show the Edit button.`,!1],[`onEdit`,`(() => void)`,``,`Called when Edit is pressed (before switching to the editor, if any).`,!1],[`editor`,`ReactNode`,``,`Shown in place of the details while editing: a SideDrawerForm.`,!1],[`mode`,`SideDrawerDetailMode`,``,`Sets the current mode, "view" or "edit", when controlled.`,!1],[`defaultMode`,`SideDrawerDetailMode`,`"view"`,`Sets the starting mode when uncontrolled.`,!1],[`onModeChange`,`((mode: SideDrawerDetailMode) => void)`,``,`Called when the mode changes (Edit pressed, Cancel, a successful save).`,!1],[`tabs`,`SideDrawerDetailTab[]`,``,`Sections as tabs (list in the header, panels in the body).`,!1],[`tab`,`string`,``,`Sets the active tab's value when controlled.`,!1],[`defaultTab`,`string`,`the first`,`Sets the starting tab when uncontrolled.`,!1],[`onTabChange`,`((tab: string) => void)`,``,`Called when another tab is chosen.`,!1],[`children`,`ReactNode`,``,`Body content when there are no tabs.`,!1],[`footer`,`ReactNode`,``,`Extra footer content on the end side (view mode).`,!1],[`navigation`,`SideDrawerRecordNavProps`,``,`Controls for moving to the previous or next record.`,!1],[`recordKey`,`string | number`,``,`Identity of the record: changing it slides the content and announces the move.`,!1],[`loading`,`boolean`,`false`,`The record is loading: the body shows a skeleton.`,!1],[`error`,`ReactNode`,``,"Loading failed: a message (or true), with Retry when `onRetry` is set.",!1],[`onRetry`,`(() => void)`,``,`Called when Retry is pressed (the button shows only when this is set).`,!1],[`empty`,`boolean`,`false`,`No record to show.`,!1],[`labels`,`Partial<SideDrawerDetailLabels>`,`defaultSideDrawerDetailLabels`,'Every other string, for translation: `labels={{ edit: "…" }}`; omitted keys keep the English of `defaultSideDrawerDetailLabels`. All 11 keys of `SideDrawerDetailLabels` are listed in the key table under the props table.',!1,{type:`SideDrawerDetailLabels`,const:`defaultSideDrawerDetailLabels`,keys:[[`edit`,`Edit`],[`moreActions`,`More actions`],[`editing`,`Editing`],[`loading`,`Loading…`],[`sections`,`Sections`],[`errorTitle`,`Couldn’t load this record`],[`retry`,`Try again`],[`emptyTitle`,`Nothing selected`],[`emptyDescription`,`Pick a record to see its details here.`],[`moved`,"(title, position) => `${title}, ${position}`"],[`copy`,`nested object: takes the keys of CopyLabels; empty here, so its own English defaults apply`]]}],[`bodyClassName`,`string`,``,`Adds extra classes to the scrolling body.`,!1]],_=[[`start`,`ReactNode`,``,`Content on the inline start: a hint ("Unsaved changes"), record navigation.`,!1]],v=[[`initialValues`,`TValues`,``,"Starting values. Read once (give the form a `key` to reset it for another record).",!0],[`validate`,`((values: TValues) => SideDrawerFormValidateResult<TValues>)`,``,`Return a message per invalid field. Runs on submit, then again as fields are fixed.`,!1],[`onSubmit`,`(values: TValues) => SideDrawerFormSubmitResult<TValues> | Promise<SideDrawerFormSubmitResult<TValues>>`,``,`Save. Return or resolve { errors } / { error } to show server-side problems, or throw.`,!0],[`onSuccess`,`((values: TValues) => void)`,``,`After a successful save (before the drawer closes / returns to the view).`,!1],[`onCancel`,`(() => void)`,``,`After Cancel (once any discard question is answered).`,!1],[`closeOnFinish`,`boolean`,`true`,`Close the drawer after a successful save (or Cancel). Inside SideDrawerDetail it returns to the view instead.`,!1],[`successToast`,`ReactNode`,``,`Toast title after a successful save (needs a <ToastProvider> above); announced when confirmed inline.`,!1],[`successFeedback`,`"inline" | "auto" | "toast"`,`"auto"`,`How a successful save is confirmed. "auto": a toast when the drawer closes, "✓ Saved" next to the title when it stays open (inside SideDrawerDetail, or closeOnFinish={false}).`,!1],[`successSeal`,`boolean`,`false`,"Confirm a successful save with a seal: the form dims, a check in a success-lit disc folds in and the panel closes (or returns to the view) about a second later, with the `successToast`. With reduced motion the seal only fades in.",!1],[`confirmDiscard`,`boolean`,`true`,`Ask before throwing away changes.`,!1],[`submitLabel`,`ReactNode`,``,`Shorthand for labels.save.`,!1],[`cancelLabel`,`ReactNode`,``,`Shorthand for labels.cancel.`,!1],[`children`,`(form: SideDrawerFormApi<TValues>) => ReactNode`,``,`The fields. Receives the form API.`,!0],[`footerStart`,`ReactNode`,``,`Extra footer content on the inline start (replaces the "Unsaved changes" hint).`,!1],[`bodyClassName`,`string`,``,`Adds extra classes to the scrolling body.`,!1],[`labels`,`Partial<SideDrawerFormLabels>`,`defaultSideDrawerFormLabels`,'Every other string, for translation: `labels={{ save: "…" }}`; omitted keys keep the English of `defaultSideDrawerFormLabels`. All 12 keys of `SideDrawerFormLabels` are listed in the key table under the props table.',!1,{type:`SideDrawerFormLabels`,const:`defaultSideDrawerFormLabels`,keys:[[`save`,`Save`],[`saving`,`Saving…`],[`cancel`,`Cancel`],[`unsaved`,`Unsaved changes`],[`shortcut`,`to save`],[`errorSummary`,'(count) => (count === 1 ? "There is 1 problem to fix" : `There are ${count} problems to fix`)'],[`discardTitle`,`Discard unsaved changes?`],[`discardDescription`,`Your edits will be lost. This can’t be undone.`],[`discard`,`Discard`],[`keepEditing`,`Keep editing`],[`saveFailed`,`Couldn’t save your changes. Please try again.`],[`saved`,`Saved`]]}]],y=[[`children`,`ReactNode`,``,`Below the title row: Tabs, filters, a toolbar.`,!1],[`title`,`ReactNode`,``,`The drawer's name (rendered as its accessible title).`,!1],[`description`,`ReactNode`,``,`One line under the title (rendered as the accessible description).`,!1],[`leading`,`ReactNode`,``,`Shows an avatar or icon before the title.`,!1],[`status`,`ReactNode`,``,`Next to the title: a status Badge, a count.`,!1],[`actions`,`ReactNode`,``,`Shows the buttons before the ×: Edit, a ⋯ menu.`,!1],[`showClose`,`boolean`,`true`,`Shows the × close button in the header.`,!1]],b=[[`className`,`string`,``,`Adds extra classes to the notice.`,!1],[`variant`,`"inline" | "badge"`,`"inline"`,`"inline": check + message, for the title row. "badge": just the check, pinned to the corner of an avatar / icon (its parent must be positioned).`,!1]],x=[[`index`,`number`,``,`0-based index of the record shown.`,!0],[`count`,`number`,``,`How many records there are to walk through.`,!0],[`onIndexChange`,`(index: number) => void`,``,`Called with the new 0-based index when the person moves to another record.`,!0],[`keyboardShortcuts`,`boolean`,`true`,`J (next) / K (previous) while focus is in the drawer and not in a text field.`,!1],[`labels`,`Partial<SideDrawerRecordNavLabels>`,`defaultSideDrawerRecordNavLabels`,'Every other string, for translation: `labels={{ previous: "…" }}`; omitted keys keep the English of `defaultSideDrawerRecordNavLabels`. All 5 keys of `SideDrawerRecordNavLabels` are listed in the key table under the props table.',!1,{type:`SideDrawerRecordNavLabels`,const:`defaultSideDrawerRecordNavLabels`,keys:[[`previous`,`Previous`],[`next`,`Next`],[`previousKey`,`K`],[`nextKey`,`J`],[`position`,"(position, count) => `${position.toLocaleString()} of ${count.toLocaleString()}`"]]}],[`className`,`string`,``,`Adds extra classes to the navigation.`,!1]],S=s(),C=e(()=>c(()=>import(`./ShowcaseStage.side-drawer.scene-DifcnQ45.js`).then(e=>e.SideDrawerScene),[]),{eager:!0,minHeight:`22rem`}),w=()=>c(()=>import(`./SideDrawerDemos-s9OIvGd6.js`),[]),T=e(()=>w().then(e=>e.EditProfileDemo),{minHeight:`12rem`,eager:!0}),E=e(()=>w().then(e=>e.OrderDetailDemo),{minHeight:`9.5rem`}),D=e(()=>w().then(e=>e.CustomersDemo),{minHeight:`47rem`}),O=e(()=>w().then(e=>e.SizesDemo),{minHeight:`9.5rem`}),k=e(()=>w().then(e=>e.InspectorDemo),{minHeight:`22rem`}),A=`
import { useState } from "react";
import {
  Avatar,
  Button,
  Input,
  Select,
  SideDrawer,
  SideDrawerContent,
  SideDrawerForm,
  SideDrawerHeader,
  SideDrawerTrigger,
  Switch,
  Textarea,
} from "@sheenui/theme";
import { Pencil as PencilIcon } from "lucide-react";

const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

const initialProfile = { name: "Ada Lovelace", email: "ada@example.com", role: "editor", bio: "", notifications: true };

// Your API client.
declare const api: { saveProfile(values: typeof initialProfile): Promise<{ emailTaken?: boolean }> };

export function Example() {
  const [profile, setProfile] = useState(initialProfile);

  return (
    <SideDrawer>
      <SideDrawerTrigger render={<Button leading={<PencilIcon />} />}>Edit profile</SideDrawerTrigger>
      <SideDrawerContent size="md">
        <SideDrawerHeader
          leading={<Avatar name={profile.name} />}
          title="Edit profile"
          description="Your name and photo are visible to everyone in Acme."
        />
        <SideDrawerForm
          initialValues={profile}
          validate={(v) => ({
            name: v.name.trim() ? undefined : "Enter your full name",
            email: EMAIL.test(v.email.trim()) ? undefined : "Enter an email address like name@example.com",
          })}
          onSubmit={async (values) => {
            const res = await api.saveProfile(values);
            if (res.emailTaken) return { errors: { email: "That email is already used by another account" } };
            setProfile(values);
          }}
          successToast="Profile saved"
          successSeal
        >
          {(form) => (
            <>
              <Input label="Full name" autoComplete="name" {...form.field("name")} />
              <Input label="Email" type="email" autoComplete="email" {...form.field("email")} />
              <Select label="Role" name="role" items={roles} value={form.values.role}
                onValueChange={(value) => form.setValue("role", value ?? "viewer")} />
              <Textarea label="Bio" maxLength={160} {...form.field("bio")} />
              <Switch label="Email notifications" checked={form.values.notifications}
                onCheckedChange={(on) => form.setValue("notifications", on)} />
            </>
          )}
        </SideDrawerForm>
      </SideDrawerContent>
    </SideDrawer>
  );
}`,j=`
import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  CopyIcon,
  DescriptionItem,
  DescriptionList,
  Input,
  MenuItem,
  MenuSeparator,
  Select,
  SideDrawer,
  SideDrawerContent,
  SideDrawerDetail,
  SideDrawerForm,
  SideDrawerTrigger,
  Textarea,
  Timeline,
  TimelineItem,
  useSideDrawer,
  type SideDrawerDetailMode,
} from "@sheenui/theme";
import { Archive as ArchiveIcon, Trash2 as TrashIcon } from "lucide-react";

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

const initialOrder = {
  id: "ord_8f21",
  number: 1042,
  customer: "Grace Hopper",
  email: "grace@example.com",
  method: "Card ·· 4242",
  status: "shipped",
  address: "1 Compiler Way, Arlington",
  reference: "PO-7781",
};

// Your API client.
declare const api: {
  archiveOrder(id: string): Promise<void>;
  updateOrder(id: string, values: Record<string, string>): Promise<void>;
};

// A component rendered inside the drawer: actions that keep it open confirm in place
// ("✓ Archived" next to the title, announced), where a corner toast would cover the header.
function ArchiveItem({ order }: { order: typeof initialOrder }) {
  const drawer = useSideDrawer();
  return (
    <MenuItem
      icon={<ArchiveIcon />}
      onClick={async () => {
        await api.archiveOrder(order.id);
        drawer?.notify("Archived", { announce: \`Order #\${order.number} archived\` });
      }}
    >
      Archive
    </MenuItem>
  );
}

export function Example() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SideDrawerDetailMode>("view");
  const [order, setOrder] = useState(initialOrder);

  return (
    <SideDrawer
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setMode("view");
      }}
    >
      <SideDrawerTrigger render={<Button variant="glass" />}>View order</SideDrawerTrigger>
      <SideDrawerContent size="lg">
        <SideDrawerDetail
          avatar={<Avatar name={order.customer} />}
          title={\`Order #\${order.number}\`}
          status={<Badge tone="success" dot>Paid</Badge>}
          subtitle={order.customer}
          recordId={order.id}
          recordIdLabel="Order ID"
          menu={
            <>
              <MenuItem icon={<CopyIcon />}>Duplicate</MenuItem>
              <ArchiveItem order={order} />
              <MenuSeparator />
              <MenuItem tone="danger" icon={<TrashIcon />}>Delete…</MenuItem>
            </>
          }
          tabs={[
            {
              value: "overview",
              label: "Overview",
              content: (
                <DescriptionList>
                  <DescriptionItem label="Email" copyValue={order.email}>{order.email}</DescriptionItem>
                  <DescriptionItem label="Payment">{order.method}</DescriptionItem>
                  <DescriptionItem label="Shipping address">{order.address}</DescriptionItem>
                </DescriptionList>
              ),
            },
            {
              value: "activity",
              label: "Activity",
              count: 2,
              content: (
                <Timeline aria-label="Order activity">
                  <TimelineItem title="Order shipped" time="Yesterday" />
                  <TimelineItem title="Payment received" time="2 days ago" />
                </Timeline>
              ),
            },
          ]}
          mode={mode}
          onModeChange={setMode}
          editor={
            <SideDrawerForm
              initialValues={{ status: order.status, address: order.address, reference: order.reference }}
              validate={(v) => ({ address: v.address.trim() ? undefined : "Enter a shipping address" })}
              onSubmit={async (values) => {
                await api.updateOrder(order.id, values);
                setOrder({ ...order, ...values });
              }}
              // Back in the view: "✓ Saved" next to the title, and this is announced.
              successToast="Order updated"
            >
              {(form) => (
                <>
                  <Select
                    label="Status"
                    name="status"
                    items={statuses}
                    value={form.values.status}
                    onValueChange={(value) => form.setValue("status", value ?? "pending")}
                  />
                  <Textarea label="Shipping address" {...form.field("address")} />
                  <Input label="Customer reference" {...form.field("reference")} />
                </>
              )}
            </SideDrawerForm>
          }
        />
      </SideDrawerContent>
    </SideDrawer>
  );
}`,M=`
import { useState } from "react";
import {
  Avatar,
  Badge,
  DataTable,
  SideDrawer,
  SideDrawerContent,
  SideDrawerDetail,
  UserCell,
  type DataTableColumn,
  type SideDrawerDetailMode,
} from "@sheenui/theme";

type Customer = { id: string; name: string; email: string };

const asha: Customer = { id: "c1", name: "Asha Verma", email: "asha@example.com" };
const customers: Customer[] = [
  asha,
  { id: "c2", name: "Ravi Kumar", email: "ravi@example.com" },
  { id: "c3", name: "Meera Iyer", email: "meera@example.com" },
];

export function Example() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<SideDrawerDetailMode>("view");
  const index = customers.findIndex((c) => c.id === openId);
  const current = customers[index] ?? asha;

  const openRecord = (id: string, next: SideDrawerDetailMode = "view") => {
    setOpenId(id);
    setMode(next);
  };
  const rowButton = (id: string | null) =>
    id ? document.querySelector<HTMLElement>(\`[data-customer-id="\${CSS.escape(id)}"]\`) : null;

  const columns: DataTableColumn<Customer>[] = [
    {
      id: "name",
      header: "Customer",
      // The name opens the record (click or Enter).
      cell: ({ row, highlight }) => (
        <button type="button" aria-haspopup="dialog" data-customer-id={row.id} onClick={() => openRecord(row.id)}>
          <UserCell name={row.name} email={row.email} highlight={highlight} />
        </button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        caption="Customers"
        data={customers}
        columns={columns}
        rowActions={[
          { label: "View details", onSelect: (row) => openRecord(row.id) },
          { label: "Edit", onSelect: (row) => openRecord(row.id, "edit") },
        ]}
      />

      <SideDrawer open={openId !== null} onOpenChange={(next) => !next && setOpenId(null)}>
        {/* Back to the row shown last (after J / K), not the one first opened. */}
        <SideDrawerContent size="lg" resizable storageKey="customers" finalFocus={() => rowButton(openId) ?? true}>
          <SideDrawerDetail
            recordKey={current.id}
            avatar={<Avatar name={current.name} />}
            title={current.name}
            status={<Badge tone="success" dot>Active</Badge>}
            subtitle={current.email}
            recordId={current.id}
            recordIdLabel="Customer ID"
            navigation={{
              index,
              count: customers.length,
              onIndexChange: (i) => setOpenId(customers[i]?.id ?? openId),
              labels: { previous: "Previous customer", next: "Next customer" },
            }}
            mode={mode}
            onModeChange={setMode}
            tabs={[{ value: "overview", label: "Overview", content: <p>Plan, usage and billing go here.</p> }]}
            editor={<p>A SideDrawerForm goes here.</p>}
          />
        </SideDrawerContent>
      </SideDrawer>
    </>
  );
}`,N=`
import {
  Button,
  SideDrawer,
  SideDrawerBody,
  SideDrawerClose,
  SideDrawerContent,
  SideDrawerFooter,
  SideDrawerHeader,
  SideDrawerTrigger,
} from "@sheenui/theme";

export function Example() {
  return (
    <>
      <SideDrawer>
        <SideDrawerTrigger render={<Button />}>Open drawer</SideDrawerTrigger>
        {/* sm 24rem · md 32rem · lg 40rem · xl 48rem; full width under 640px */}
        <SideDrawerContent size="lg" resizable storageKey="customers" minWidth={360}>
          <SideDrawerHeader title="Customer" description="Drag its free edge to resize." />
          <SideDrawerBody>
            <p>Customer details go here.</p>
          </SideDrawerBody>
          <SideDrawerFooter>
            <SideDrawerClose render={<Button variant="glass" />}>Done</SideDrawerClose>
          </SideDrawerFooter>
        </SideDrawerContent>
      </SideDrawer>

      {/* The panel is a size container: adapt content to the panel, not the screen. */}
      <div className="grid gap-5 @md/side-drawer:grid-cols-2">
        <p>Left column</p>
        <p>Right column</p>
      </div>
    </>
  );
}`,P=`
import { useState } from "react";
import {
  DescriptionItem,
  DescriptionList,
  SideDrawer,
  SideDrawerContent,
  SideDrawerDetail,
} from "@sheenui/theme";
import { File as FileIcon } from "lucide-react";

const files = [
  { id: "f1", name: "roadmap.pdf", kind: "PDF", path: "/Docs/roadmap.pdf", owner: "Asha" },
  { id: "f2", name: "logo.svg", kind: "Image", path: "/Brand/logo.svg", owner: "Ravi" },
];

export function Example() {
  const [selected, setSelected] = useState<string | null>("f1");
  const [open, setOpen] = useState(true);
  const fileButtons = new Map<string, HTMLElement>(); // filled by the file list (ref callbacks)
  const index = files.findIndex((f) => f.id === selected);
  const file = files[index]; // undefined: nothing selected

  return (
    <SideDrawer open={open} onOpenChange={setOpen} modal={false}>
      {/* Escape / × give focus back to the file shown now, not the one that opened the panel. */}
      <SideDrawerContent size="sm" inset finalFocus={() => (selected && fileButtons.get(selected)) || true}>
        <SideDrawerDetail
          recordKey={file?.id ?? "none"}
          avatar={file && <FileIcon />}
          title={file ? file.name : "Details"}
          subtitle={file?.kind}
          empty={!file}
          labels={{ emptyTitle: "No file selected", emptyDescription: "Pick a file in the list to see its details here." }}
          navigation={
            file && {
              index,
              count: files.length,
              onIndexChange: (i) => setSelected(files[i]?.id ?? null),
              labels: { previous: "Previous file", next: "Next file" },
            }
          }
        >
          {file && (
            <DescriptionList layout="stacked" size="sm">
              <DescriptionItem label="Location" copyValue={file.path}>{file.path}</DescriptionItem>
              <DescriptionItem label="Owner">{file.owner}</DescriptionItem>
            </DescriptionList>
          )}
        </SideDrawerDetail>
      </SideDrawerContent>
    </SideDrawer>
  );
}`;function F(){return(0,S.jsxs)(n,{eyebrow:`Overlay`,title:`Side drawer`,description:`A glass panel that slides in from the right (the left in RTL) to edit a record or show its details without leaving the page. It comes with a validated edit form that guards unsaved changes, a detail view with tabs and previous / next navigation, view ⇄ edit in place, a resizable width and a non-modal inspector mode.`,source:[`theme/src/components/side-drawer/side-drawer.tsx`,`theme/src/components/side-drawer/side-drawer-form.tsx`,`theme/src/components/side-drawer/side-drawer-detail.tsx`,`theme/src/components/description-list/description-list.tsx`],children:[(0,S.jsx)(a,{label:`Side drawer demo`,story:()=>c(()=>import(`./ShowcaseStage.side-drawer-D5iBXrl-.js`),[]),initial:{open:!1,step:0},minHeight:`22rem`,onInterrupt:`keep`,children:(e,t)=>(0,S.jsx)(C,{scene:e,ctx:t})}),(0,S.jsx)(o,{title:`Edit form`,description:`Save with an empty name to see inline errors, the announced summary and focus jumping to the first problem. Edit something, then press Escape, the scrim or × (or swipe it away on a phone): you are asked before your changes are thrown away. ⌘↵ / Ctrl+Enter saves.`,code:A,children:(0,S.jsx)(T,{})}),(0,S.jsx)(o,{title:`Detail view, edit in place`,description:`Header with avatar, status and a copyable id; tabs for Overview, Activity and Notes. Edit swaps the details for a form in the same drawer, and Save or Cancel slides you back. Saving, Duplicate and Archive keep the drawer open, so they confirm in place (a check next to the title, announced) instead of a toast over the header. A half-written note also asks before the drawer closes.`,code:j,children:(0,S.jsx)(E,{})}),(0,S.jsx)(o,{title:`From a data table`,lazyPreview:!0,intrinsicHeight:560,description:`Open a customer from their name (or the row menu: View details / Edit). Walk the rows in the table’s current sort and search order with the arrows in the footer or J / K; a half-written note stays with its customer, and closing asks before dropping it. Each record loads for a moment (skeleton); the 7th fails once to show the error state. Closing returns focus to the row you ended on.`,code:M,variant:`bare`,children:(0,S.jsx)(D,{})}),(0,S.jsx)(o,{title:`Sizes and resizing`,description:`Four widths, and an optional handle on the free edge that remembers where you left it.`,code:N,children:(0,S.jsx)(O,{})}),(0,S.jsx)(o,{title:`Inspector (non-modal)`,lazyPreview:!0,intrinsicHeight:560,description:`modal={false}: no scrim and no focus trap, so the list stays usable while the panel is open. Clicking another file updates it; clicking the shown file again clears the selection (the empty state). Escape closes it while focus is inside it, and focus goes back to the file shown.`,code:P,children:(0,S.jsx)(k,{})}),(0,S.jsx)(r,{rows:[[`Esc`,`Close (asks first when a form has unsaved changes). Inspector: only while focus is inside it.`],[`Ctrl + Enter / ⌘ + Enter`,`Save the form from any field.`],[`J / K`,`Next / previous record (not while typing in a field).`],[`← / → / Home / End`,`On the resize handle: wider / narrower (Shift for bigger steps), min / max.`],[`Tab`,`Moves through the panel; focus stays inside a modal drawer and returns to what opened it.`]]}),(0,S.jsx)(t,{items:[`role="dialog", named by the header title and described by its description. A modal drawer makes the page behind inert and traps focus; modal={false} (an inspector) does neither, and Escape then works only while focus is inside it.`,`On open, focus goes to the element marked data-autofocus, else the first field of a SideDrawerForm (never on touch screens), else the panel itself so screen readers read its title. On close it returns to the opener (or finalFocus).`,`The resize handle is a labeled separator with aria-valuenow, and works with the arrow keys, Home / End and a double-click; Escape cancels a drag. It is hidden under 640 px, where the panel is full width.`,`notify() writes into a polite live region inside the panel, so "Saved" is announced even from a modal drawer. A close guard that keeps the drawer open leaves focus where it is: show your own confirmation so people know why.`,`Under reduced motion the panel fades in place instead of sliding.`]}),(0,S.jsx)(i,{title:`SideDrawer`,of:p,rows:[[`open / defaultOpen`,`boolean`,`false`,`Controlled / initial open state.`],[`disablePointerDismissal`,`boolean`,`modal === false`,`Keep it open on outside presses.`],[`handle`,`SideDrawerHandle`,``,`From createSideDrawerHandle(): open it from triggers rendered elsewhere.`]]}),(0,S.jsx)(i,{title:`SideDrawerContent`,of:h,rows:[[`initialFocus`,`Base UI initialFocus`,`smart`,`Default: [data-autofocus], else the form’s first field (not on touch), else the panel.`],[`finalFocus`,`Base UI finalFocus`,`the opener`,`Sets where focus goes after closing.`]]}),(0,S.jsx)(i,{title:`SideDrawerHeader · Body · Footer`,of:y,rows:[[`SideDrawerBody scrollRef`,`Ref<HTMLDivElement>`,``,`The scrolling element. Scroll shadows show at edges with more to scroll.`],[`SideDrawerFooter start`,`ReactNode`,``,`Content on the inline start (hint, record navigation); children sit at the end.`],[`SideDrawerBody wrapperClassName`,`string`,``,`Class for the outer wrapper (holds the scroll shadows).`]]}),(0,S.jsx)(i,{title:`useSideDrawer() · useSideDrawerCloseGuard()`,rows:[[`notify`,`(message: ReactNode | null, { announce?, duration? }) => void`,`2600 ms`,`A check and the message next to the header’s title, announced politely. For actions that keep the drawer open, where a corner toast would cover the header. null clears it.`],[`requestClose`,`({ force? }) => Promise<boolean>`,``,`Close through the close guards (force skips them). Resolves true when it closed.`],[`open / side / dir / modal`,`boolean / "left" | "right" / "ltr" | "rtl" / boolean | "trap-focus"`,``,`State of the surrounding drawer (null outside one).`],[`useSideDrawerCloseGuard(guard)`,`() => boolean | Promise<boolean>`,``,`Asked before every close (×, Escape, scrim, swipe, Cancel). Return a confirm() promise to ask.`]]}),(0,S.jsx)(i,{title:`SideDrawerForm`,of:v}),(0,S.jsx)(i,{title:`SideDrawerDetail`,of:g}),(0,S.jsx)(i,{title:`SideDrawerRecordNav`,of:x}),(0,S.jsx)(i,{title:`DescriptionList · DescriptionItem`,of:[f,d]}),(0,S.jsx)(i,{of:l,title:`CopyButton props`,as:`h3`}),(0,S.jsx)(i,{of:u,title:`CopyChip props`,as:`h3`}),(0,S.jsx)(i,{of:m,title:`SideDrawerBody props`,as:`h3`}),(0,S.jsx)(i,{of:_,title:`SideDrawerFooter props`,as:`h3`}),(0,S.jsx)(i,{of:b,title:`SideDrawerNotice props`,as:`h3`})]})}export{F as default};