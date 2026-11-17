import { lazyBlock } from "../layout/lazy-block";
import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { SideDrawerScene as SideDrawerSceneData } from "../layout/ShowcaseStage.side-drawer";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";

/*
 * The five demos live in SideDrawerDemos.tsx and load as islands (layout/lazy-block.tsx): the drawer, its form and
 * detail views, Select, Menu, the data table and the sample data are a separate chunk, so this page's initial JS is
 * the docs shell plus the text below (it was 350 KB gzip with everything static, the largest route of the site).
 * The prerendered HTML already shows every demo at full size; the first one is fetched while the page hydrates
 * (`eager`), the others once the browser is idle. The `minHeight` of each is its preview's height on a desktop
 * viewport: the placeholder is only seen during an in-app navigation, before the chunk lands.
 * The code strings stay in this file: scripts/lib/routes-source.mjs reads the first `code={...}` and the
 * `source=` prop of SideDrawerPage from here (llms-full.txt, "Files to copy", the copy test).
 */
const SideDrawerScene = lazyBlock(
  () => import("../layout/ShowcaseStage.side-drawer.scene").then((m) => m.SideDrawerScene),
  { eager: true, minHeight: "22rem" },
);
const demos = () => import("./SideDrawerDemos");
const EditProfileDemo = lazyBlock(() => demos().then((m) => m.EditProfileDemo), {
  minHeight: "12rem",
  eager: true,
});
const OrderDetailDemo = lazyBlock(() => demos().then((m) => m.OrderDetailDemo), { minHeight: "9.5rem" });
const CustomersDemo = lazyBlock(() => demos().then((m) => m.CustomersDemo), { minHeight: "47rem" });
const SizesDemo = lazyBlock(() => demos().then((m) => m.SizesDemo), { minHeight: "9.5rem" });
const InspectorDemo = lazyBlock(() => demos().then((m) => m.InspectorDemo), { minHeight: "22rem" });

/* =====================================================================
 * (a) Edit profile form
 * ===================================================================== */

const editProfileCode = `
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
}`;

/* =====================================================================
 * (b) Order details: view ⇄ edit in the same drawer
 * ===================================================================== */

const orderCode = `
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
}`;

/* =====================================================================
 * (c) Data table → details, walk the rows with J / K
 * ===================================================================== */

const tableCode = `
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
}`;

/* =====================================================================
 * (d) Sizes + resizable
 * ===================================================================== */

const sizesCode = `
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
}`;

/* =====================================================================
 * (e) Non-modal inspector next to a list
 * ===================================================================== */

const inspectorCode = `
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
}`;

/* =====================================================================
 * Page
 * ===================================================================== */

/** The "Side drawer" docs page (/overlays/side-drawer): live examples, props and notes. */
export function SideDrawerPage() {
  return (
    <Page
      eyebrow="Overlay"
      title="Side drawer"
      description="A glass panel that slides in from the right (the left in RTL) to edit a record or show its details without leaving the page. It comes with a validated edit form that guards unsaved changes, a detail view with tabs and previous / next navigation, view ⇄ edit in place, a resizable width and a non-modal inspector mode."
      source={[
        "theme/src/components/side-drawer/side-drawer.tsx",
        "theme/src/components/side-drawer/side-drawer-form.tsx",
        "theme/src/components/side-drawer/side-drawer-detail.tsx",
        "theme/src/components/description-list/description-list.tsx",
      ]}
    >
      <ShowcaseStage<SideDrawerSceneData>
        label="Side drawer demo"
        story={() => import("../layout/ShowcaseStage.side-drawer")}
        initial={{ open: false, step: 0 }}
        minHeight="22rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <SideDrawerScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Edit form"
        description="Save with an empty name to see inline errors, the announced summary and focus jumping to the first problem. Edit something, then press Escape, the scrim or × (or swipe it away on a phone): you are asked before your changes are thrown away. ⌘↵ / Ctrl+Enter saves."
        code={editProfileCode}
      >
        <EditProfileDemo />
      </Example>

      <Example
        title="Detail view, edit in place"
        description="Header with avatar, status and a copyable id; tabs for Overview, Activity and Notes. Edit swaps the details for a form in the same drawer, and Save or Cancel slides you back. Saving, Duplicate and Archive keep the drawer open, so they confirm in place (a check next to the title, announced) instead of a toast over the header. A half-written note also asks before the drawer closes."
        code={orderCode}
      >
        <OrderDetailDemo />
      </Example>

      <Example
        title="From a data table"
        lazyPreview
        intrinsicHeight={560}
        description="Open a customer from their name (or the row menu: View details / Edit). Walk the rows in the table’s current sort and search order with the arrows in the footer or J / K; a half-written note stays with its customer, and closing asks before dropping it. Each record loads for a moment (skeleton); the 7th fails once to show the error state. Closing returns focus to the row you ended on."
        code={tableCode}
        variant="bare"
      >
        <CustomersDemo />
      </Example>

      <Example
        title="Sizes and resizing"
        description="Four widths, and an optional handle on the free edge that remembers where you left it."
        code={sizesCode}
      >
        <SizesDemo />
      </Example>

      <Example
        title="Inspector (non-modal)"
        lazyPreview
        intrinsicHeight={560}
        description="modal={false}: no scrim and no focus trap, so the list stays usable while the panel is open. Clicking another file updates it; clicking the shown file again clears the selection (the empty state). Escape closes it while focus is inside it, and focus goes back to the file shown."
        code={inspectorCode}
      >
        <InspectorDemo />
      </Example>

      <KeyboardTable
        rows={[
          ["Esc", "Close (asks first when a form has unsaved changes). Inspector: only while focus is inside it."],
          ["Ctrl + Enter / ⌘ + Enter", "Save the form from any field."],
          ["J / K", "Next / previous record (not while typing in a field)."],
          ["← / → / Home / End", "On the resize handle: wider / narrower (Shift for bigger steps), min / max."],
          ["Tab", "Moves through the panel; focus stays inside a modal drawer and returns to what opened it."],
        ]}
      />

      <A11yNotes
        items={[
          'role="dialog", named by the header title and described by its description. A modal drawer makes the page behind inert and traps focus; modal={false} (an inspector) does neither, and Escape then works only while focus is inside it.',
          "On open, focus goes to the element marked data-autofocus, else the first field of a SideDrawerForm (never on touch screens), else the panel itself so screen readers read its title. On close it returns to the opener (or finalFocus).",
          "The resize handle is a labeled separator with aria-valuenow, and works with the arrow keys, Home / End and a double-click; Escape cancels a drag. It is hidden under 640 px, where the panel is full width.",
          'notify() writes into a polite live region inside the panel, so "Saved" is announced even from a modal drawer. A close guard that keeps the drawer open leaves focus where it is: show your own confirmation so people know why.',
          "Under reduced motion the panel fades in place instead of sliding.",
        ]}
      />

      <PropsTable
        title="SideDrawer"
        of={PROPS.SideDrawer}
        rows={[
          ["open / defaultOpen", "boolean", "false", "Controlled / initial open state."],
          ["disablePointerDismissal", "boolean", "modal === false", "Keep it open on outside presses."],
          [
            "handle",
            "SideDrawerHandle",
            "",
            "From createSideDrawerHandle(): open it from triggers rendered elsewhere.",
          ],
        ]}
      />
      <PropsTable
        title="SideDrawerContent"
        of={PROPS.SideDrawerContent}
        rows={[
          [
            "initialFocus",
            "Base UI initialFocus",
            "smart",
            "Default: [data-autofocus], else the form’s first field (not on touch), else the panel.",
          ],
          ["finalFocus", "Base UI finalFocus", "the opener", "Sets where focus goes after closing."],
        ]}
      />
      <PropsTable
        title="SideDrawerHeader · Body · Footer"
        of={PROPS.SideDrawerHeader}
        rows={[
          [
            "SideDrawerBody scrollRef",
            "Ref<HTMLDivElement>",
            "",
            "The scrolling element. Scroll shadows show at edges with more to scroll.",
          ],
          [
            "SideDrawerFooter start",
            "ReactNode",
            "",
            "Content on the inline start (hint, record navigation); children sit at the end.",
          ],
          ["SideDrawerBody wrapperClassName", "string", "", "Class for the outer wrapper (holds the scroll shadows)."],
        ]}
      />
      <PropsTable
        title="useSideDrawer() · useSideDrawerCloseGuard()"
        rows={[
          [
            "notify",
            "(message: ReactNode | null, { announce?, duration? }) => void",
            "2600 ms",
            "A check and the message next to the header’s title, announced politely. For actions that keep the drawer open, where a corner toast would cover the header. null clears it.",
          ],
          [
            "requestClose",
            "({ force? }) => Promise<boolean>",
            "",
            "Close through the close guards (force skips them). Resolves true when it closed.",
          ],
          [
            "open / side / dir / modal",
            'boolean / "left" | "right" / "ltr" | "rtl" / boolean | "trap-focus"',
            "",
            "State of the surrounding drawer (null outside one).",
          ],
          [
            "useSideDrawerCloseGuard(guard)",
            "() => boolean | Promise<boolean>",
            "",
            "Asked before every close (×, Escape, scrim, swipe, Cancel). Return a confirm() promise to ask.",
          ],
        ]}
      />
      <PropsTable title="SideDrawerForm" of={PROPS.SideDrawerForm} />
      <PropsTable title="SideDrawerDetail" of={PROPS.SideDrawerDetail} />
      <PropsTable title="SideDrawerRecordNav" of={PROPS.SideDrawerRecordNav} />
      <PropsTable title="DescriptionList · DescriptionItem" of={[PROPS.DescriptionList, PROPS.DescriptionItem]} />
      <PropsTable of={PROPS.CopyButton} title="CopyButton props" as="h3" />
      <PropsTable of={PROPS.CopyChip} title="CopyChip props" as="h3" />
      <PropsTable of={PROPS.SideDrawerBody} title="SideDrawerBody props" as="h3" />
      <PropsTable of={PROPS.SideDrawerFooter} title="SideDrawerFooter props" as="h3" />
      <PropsTable of={PROPS.SideDrawerNotice} title="SideDrawerNotice props" as="h3" />
    </Page>
  );
}
