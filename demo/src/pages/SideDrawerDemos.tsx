import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  CurrencyCell,
  Input,
  Select,
  StatusCell,
  Switch,
  UserCell,
  formatCurrency,
  useToast,
  type DataTableColumn,
  type DataTableRowAction,
  type DataTableSorting,
  type SelectItem,
} from "@sheenui/theme";
import {
  SideDrawer,
  SideDrawerBody,
  SideDrawerClose,
  SideDrawerContent,
  SideDrawerFooter,
  SideDrawerHeader,
  SideDrawerTrigger,
  sideDrawerSizes,
  type SideDrawerSize,
} from "@sheenui/theme";
import { SideDrawerForm } from "@sheenui/theme";
import { SideDrawerDetail, type SideDrawerDetailMode } from "@sheenui/theme";
import { DescriptionItem, DescriptionList } from "@sheenui/theme";
import { itemAt } from "../lookup";
import { Kbd } from "@sheenui/theme";
import { SegmentedControl } from "@sheenui/theme";
import { Textarea } from "@sheenui/theme";
import { DataTable } from "../layout/lazy-data-table";
import {
  INITIAL_NOTES,
  INITIAL_ORDER,
  ORDER_STATUS,
  OrderDrawer,
  orderTotal,
} from "./SideDrawerDemos/order-detail-demo";
import {
  CUSTOMERS,
  CUSTOMER_STATUS,
  type Customer,
  CustomerDrawer,
  type CustomerEdit,
  type CustomerStatus,
  PLAN_PRICE,
  type Plan,
  customerButton,
  dateFormat,
  orderCustomers,
} from "./SideDrawerDemos/customers-demo";
import { FILES } from "./SideDrawerDemos/inspector-demo";
import { EMAIL, Icon, type Note, dateTimeFormat, icons, wait } from "./SideDrawerDemos/shared";

/* =====================================================================
 * (a) Edit profile form
 * ===================================================================== */

type Profile = { name: string; email: string; role: string; timezone: string; bio: string; notifications: boolean };

const INITIAL_PROFILE: Profile = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  role: "admin",
  timezone: "Asia/Kolkata",
  bio: "Design engineer. Glass, motion and accessible UI.",
  notifications: true,
};

const ROLE_ITEMS: SelectItem[] = [
  { value: "owner", label: "Owner", description: "Billing and every setting" },
  { value: "admin", label: "Admin", description: "Manages people and projects" },
  { value: "editor", label: "Editor", description: "Creates and edits content" },
  { value: "viewer", label: "Viewer", description: "Read-only access" },
];

const TIMEZONE_ITEMS: SelectItem[] = [
  { value: "Asia/Kolkata", label: "India (GMT+5:30)" },
  { value: "Europe/London", label: "London (GMT+0)" },
  { value: "America/New_York", label: "New York (GMT−5)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
];

function validateProfile(values: Profile) {
  const email = values.email.trim();
  return {
    name: values.name.trim() ? undefined : "Enter your full name",
    email: !email
      ? "Enter an email address"
      : EMAIL.test(email)
        ? undefined
        : "Enter an email address like name@example.com",
  };
}

export function EditProfileDemo() {
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const role = ROLE_ITEMS.find((item) => item.value === profile.role);

  return (
    <div className="glass-2 flex w-full max-w-md flex-col gap-4 rounded-sheen-xl p-5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <Avatar name={profile.name} size="lg" />
        <div className="flex min-w-0 flex-[1_1_9rem] flex-col">
          <p className="truncate font-semibold">{profile.name}</p>
          <p className="truncate text-sm text-sheen-fg-muted">{profile.email}</p>
        </div>
        {/* Wraps under the name on a narrow card instead of squeezing it to "Loken...". */}
        <Badge tone="accent" className="ms-auto">
          {role?.label as string}
        </Badge>
      </div>
      <p className="text-sm text-pretty text-sheen-fg-muted">{profile.bio || "No bio yet."}</p>

      <SideDrawer>
        <SideDrawerTrigger render={<Button leading={<Icon d={icons.pencil} />} className="self-start" />}>
          Edit profile
        </SideDrawerTrigger>
        <SideDrawerContent size="md">
          <SideDrawerHeader
            leading={<Avatar name={profile.name} />}
            title="Edit profile"
            description="Your name and photo are visible to everyone in Acme."
          />
          <SideDrawerForm
            initialValues={profile}
            validate={validateProfile}
            onSubmit={async (values) => {
              await wait(900);
              if (values.email.trim().toLowerCase() === "taken@example.com") {
                return { errors: { email: "That email is already used by another account" } };
              }
              setProfile({ ...values, name: values.name.trim(), email: values.email.trim() });
            }}
            successToast="Profile saved"
            successSeal
          >
            {(form) => (
              <>
                <Input label="Full name" autoComplete="name" {...form.field("name")} />
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  description="Try taken@example.com to see a server error."
                  {...form.field("email")}
                />
                <Select
                  label="Role"
                  name="role"
                  items={ROLE_ITEMS}
                  value={form.values.role}
                  onValueChange={(value) => form.setValue("role", value ?? "viewer")}
                />
                <Select
                  label="Time zone"
                  name="timezone"
                  items={TIMEZONE_ITEMS}
                  value={form.values.timezone}
                  onValueChange={(value) => form.setValue("timezone", value ?? "Asia/Kolkata")}
                />
                <Textarea label="Bio" maxLength={160} minRows={3} maxRows={6} {...form.field("bio")} />
                <Switch
                  label="Email notifications"
                  description="Mentions, assignments and a weekly digest."
                  checked={form.values.notifications}
                  onCheckedChange={(on) => form.setValue("notifications", on)}
                />
              </>
            )}
          </SideDrawerForm>
        </SideDrawerContent>
      </SideDrawer>
    </div>
  );
}

export function OrderDetailDemo() {
  const [order, setOrder] = useState(INITIAL_ORDER);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SideDrawerDetailMode>("view");
  const status = ORDER_STATUS[order.status];

  return (
    <div className="glass-2 flex w-full max-w-md flex-col gap-3 rounded-sheen-xl p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">Order #{order.number}</p>
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
      </div>
      <p className="text-sm text-sheen-fg-muted">
        {order.customer} · {formatCurrency(orderTotal(order), "USD", "en-US", 2)}
      </p>
      <SideDrawer
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setMode("view");
        }}
      >
        <SideDrawerTrigger render={<Button variant="glass" leading={<Icon d={icons.eye} />} className="self-start" />}>
          View order
        </SideDrawerTrigger>
        <SideDrawerContent size="lg">
          <OrderDrawer
            order={order}
            notes={notes}
            mode={mode}
            onModeChange={setMode}
            onSave={setOrder}
            onAddNote={(note) => setNotes((list) => [note, ...list])}
            onDeleted={() => setOpen(false)}
          />
        </SideDrawerContent>
      </SideDrawer>
    </div>
  );
}

export function CustomersDemo() {
  const toast = useToast();
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  /** Half-written notes, per customer: walking the rows with J / K never loses one. */
  const [drafts, setDrafts] = useState<Partial<Record<string, string>>>({});
  const unsentNotes = customers.filter((c) => drafts[c.id]?.trim()).map((c) => c.name);
  const [sorting, setSorting] = useState<DataTableSorting>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<SideDrawerDetailMode>("view");

  const ordered = useMemo(() => orderCustomers(customers, query, sorting), [customers, query, sorting]);
  const index = ordered.findIndex((c) => c.id === openId);
  const current = customers.find((c) => c.id === openId) ?? null;

  const openRecord = useCallback((id: string, nextMode: SideDrawerDetailMode = "view") => {
    setOpenId(id);
    setMode(nextMode);
    setOpen(true);
  }, []);

  const columns = useMemo<DataTableColumn<Customer>[]>(
    () => [
      {
        id: "name",
        header: "Customer",
        minWidth: 240,
        searchValue: (c) => `${c.name} ${c.email}`,
        exportValue: (c) => c.name,
        // No row-click API on DataTable yet: the name is the button that opens the record.
        cell: ({ row, highlight }) => (
          <button
            type="button"
            aria-haspopup="dialog"
            data-customer-id={row.id}
            onClick={() => openRecord(row.id)}
            className="-m-1.5 flex max-w-full min-w-0 rounded-sheen-md p-1.5 text-start transition-colors hover:bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11"
          >
            <UserCell name={row.name} email={row.email} highlight={highlight} />
          </button>
        ),
      },
      { id: "company", header: "Company" },
      { id: "plan", header: "Plan" },
      {
        id: "status",
        header: "Status",
        searchValue: (c) => CUSTOMER_STATUS[c.status].label,
        cell: ({ row, highlight }) => (
          <StatusCell
            value={row.status}
            label={highlight(CUSTOMER_STATUS[row.status].label)}
            tones={{ active: "success", trial: "accent", past_due: "warning", churned: "danger" }}
          />
        ),
      },
      {
        id: "mrr",
        header: "MRR",
        numeric: true,
        searchable: false,
        cell: ({ row }) => <CurrencyCell value={row.mrr} locale="en-US" />,
      },
      {
        id: "signedUp",
        header: "Signed up",
        searchable: false,
        sortFn: "datetime",
        cell: ({ row }) => (
          <span className="text-sheen-fg-muted tabular-nums">{dateFormat.format(new Date(row.signedUp))}</span>
        ),
      },
    ],
    [openRecord],
  );

  const rowActions = useMemo<DataTableRowAction<Customer>[]>(
    () => [
      { label: "View details", icon: <Icon d={icons.eye} />, onSelect: (row) => openRecord(row.id) },
      { label: "Edit", icon: <Icon d={icons.pencil} />, onSelect: (row) => openRecord(row.id, "edit") },
    ],
    [openRecord],
  );

  function save(id: string, values: CustomerEdit) {
    setCustomers((list) =>
      list.map((c) => {
        if (c.id !== id) return c;
        const plan = values.plan as Plan;
        const status = values.status as CustomerStatus;
        const seats = Number(values.seats);
        return {
          ...c,
          name: values.name.trim(),
          email: values.email.trim(),
          plan,
          status,
          seats,
          mrr: status === "churned" ? 0 : PLAN_PRICE[plan] * seats,
        };
      }),
    );
  }

  // The record is gone: close the panel (the toast then has the corner to itself), and drop the
  // row once the panel has slid away, so it never flashes an empty state on its way out.
  const deleting = useRef<string | null>(null);
  /** Where focus lands after a delete: the row that takes the deleted one's place. */
  const focusAfterDelete = useRef<string | null>(null);
  function remove(id: string) {
    const at = ordered.findIndex((c) => c.id === id);
    focusAfterDelete.current = (itemAt(ordered, at + 1) ?? itemAt(ordered, at - 1))?.id ?? null;
    deleting.current = id;
    setOpen(false);
  }
  function handleOpenChangeComplete(isOpen: boolean) {
    const id = deleting.current;
    if (isOpen || !id) return;
    // After Base UI has placed focus (finalFocus reads deleting.current).
    window.setTimeout(() => {
      deleting.current = null;
      setCustomers((list) => list.filter((c) => c.id !== id));
      setDrafts((all) => Object.fromEntries(Object.entries(all).filter(([key]) => key !== id)));
    });
  }

  return (
    <div className="w-full min-w-0">
      <DataTable
        caption="Customers"
        data={customers}
        columns={columns}
        rowActions={rowActions}
        getRowLabel={(c) => c.name}
        sorting={sorting}
        onSortingChange={setSorting}
        globalFilter={query}
        onGlobalFilterChange={setQuery}
        enableExport={false}
        mobileLayout="cards"
        defaultPageSize={10}
      />
      <SideDrawer open={open} onOpenChange={setOpen} onOpenChangeComplete={handleOpenChangeComplete}>
        {/* Focus returns to the row on show now (after J / K), not the one first opened. */}
        <SideDrawerContent
          size="lg"
          resizable
          storageKey="docs-customers"
          finalFocus={() => customerButton(deleting.current ? focusAfterDelete.current : openId) ?? true}
        >
          {current ? (
            <CustomerDrawer
              customer={current}
              index={index}
              count={ordered.length}
              onIndexChange={(i) => {
                const target = itemAt(ordered, i);
                if (target) setOpenId(target.id);
              }}
              mode={mode}
              onModeChange={setMode}
              notes={notes[current.id] ?? []}
              onAddNote={(note) => setNotes((all) => ({ ...all, [current.id]: [note, ...(all[current.id] ?? [])] }))}
              draft={drafts[current.id] ?? ""}
              onDraftChange={(text) => setDrafts((all) => ({ ...all, [current.id]: text }))}
              unsentNotes={unsentNotes}
              onDiscardNotes={() => setDrafts({})}
              onSave={(values) => save(current.id, values)}
              onDelete={() => {
                remove(current.id);
                toast.success(`${current.name} deleted`);
              }}
            />
          ) : (
            <SideDrawerDetail
              title="Customer"
              empty
              labels={{
                emptyTitle: "Customer not found",
                emptyDescription: "It may have been deleted. Pick another row in the table.",
              }}
            />
          )}
        </SideDrawerContent>
      </SideDrawer>
    </div>
  );
}

/* =====================================================================
 * (d) Sizes + resizable
 * ===================================================================== */

const SIZE_ITEMS = (Object.keys(sideDrawerSizes) as SideDrawerSize[]).map((value) => ({
  value,
  label: value.toUpperCase(),
  "aria-label": `${value}, ${sideDrawerSizes[value]} rem`,
}));

/** Live width of the panel it sits in. */
function PanelWidth() {
  const ref = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const panel = ref.current?.closest<HTMLElement>("[data-slot='side-drawer']");
    if (!panel) return;
    const observer = new ResizeObserver(() => setWidth(Math.round(panel.getBoundingClientRect().width)));
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);
  return (
    <span ref={ref} className="font-sheen-mono text-3xl font-semibold tracking-tight tabular-nums">
      {width}px
    </span>
  );
}

export function SizesDemo() {
  const [size, setSize] = useState<SideDrawerSize>("md");
  const [resizable, setResizable] = useState(true);

  return (
    <div className="flex flex-col items-center gap-5">
      <SegmentedControl
        aria-label="Drawer size"
        items={SIZE_ITEMS}
        value={size}
        onValueChange={(value) => setSize(value as SideDrawerSize)}
      />
      <Switch label="Resizable" checked={resizable} onCheckedChange={setResizable} />
      <SideDrawer>
        <SideDrawerTrigger render={<Button />}>Open {size.toUpperCase()} drawer</SideDrawerTrigger>
        <SideDrawerContent size={size} resizable={resizable} storageKey={resizable ? `docs-size-${size}` : undefined}>
          <SideDrawerHeader
            title={`${size.toUpperCase()} · ${sideDrawerSizes[size]}rem`}
            description="Full width on phones; always leaves 3rem of the page visible."
          />
          <SideDrawerBody>
            <div className="flex flex-col gap-6">
              <div className="glass-1 flex flex-col items-start gap-1 rounded-sheen-lg p-4">
                <span className="text-xs font-medium text-sheen-fg-muted">Panel width</span>
                <PanelWidth />
              </div>
              {resizable ? (
                <DescriptionList layout="inline" size="sm">
                  <DescriptionItem label="Drag">
                    The handle on the panel’s free edge (the left, or the right in RTL)
                  </DescriptionItem>
                  <DescriptionItem label="Keyboard">
                    Focus the handle (Tab), then <Kbd>←</Kbd> <Kbd>→</Kbd>; with <Kbd>Shift</Kbd> for bigger steps
                  </DescriptionItem>
                  <DescriptionItem label="Min / max">
                    <Kbd>Home</Kbd> / <Kbd>End</Kbd>
                  </DescriptionItem>
                  <DescriptionItem label="Reset">Double-click the handle</DescriptionItem>
                  <DescriptionItem label="Remembered" hint="Per size, in this browser (localStorage).">
                    storageKey="docs-size-{size}"
                  </DescriptionItem>
                </DescriptionList>
              ) : (
                <p className="text-sm text-sheen-fg-muted">
                  Turn on “Resizable” to get a drag handle on the panel’s free edge.
                </p>
              )}
            </div>
          </SideDrawerBody>
          <SideDrawerFooter>
            <SideDrawerClose render={<Button variant="glass" />}>Done</SideDrawerClose>
          </SideDrawerFooter>
        </SideDrawerContent>
      </SideDrawer>
    </div>
  );
}

export function InspectorDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(FILES[0]?.id ?? null);
  const index = FILES.findIndex((f) => f.id === selected);
  const file = FILES.find((f) => f.id === selected);
  // Focus goes back to the file shown last (or picked last), not the one that first opened it.
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const lastPicked = useRef(FILES[0]?.id ?? "");
  const select = (id: string) => {
    lastPicked.current = id;
    setSelected(id);
  };

  return (
    <div className="glass-2 w-full max-w-xl rounded-sheen-xl p-2">
      <ul aria-label="Files" className="flex flex-col">
        {FILES.map((item) => {
          const active = open && item.id === selected;
          return (
            <li key={item.id}>
              <button
                ref={(element) => {
                  if (element) buttons.current.set(item.id, element);
                  else buttons.current.delete(item.id);
                }}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  // Pressing the shown file again clears the selection (the panel's empty state).
                  if (active) {
                    setSelected(null);
                    return;
                  }
                  select(item.id);
                  setOpen(true);
                }}
                className="flex w-full min-w-0 items-center gap-3 rounded-sheen-md px-3 py-2.5 text-start transition-colors hover:bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus aria-pressed:bg-sheen-accent-soft forced-colors:aria-pressed:outline-2 forced-colors:aria-pressed:outline-[Highlight] any-pointer-coarse:min-h-11"
              >
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-sheen-md bg-sheen-hover text-sheen-fg-muted"
                >
                  <Icon d={icons.file} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium [overflow-wrap:anywhere]">{item.name}</span>
                  <span className="text-xs text-sheen-fg-muted [overflow-wrap:anywhere]">
                    {item.kind} · {item.size}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <SideDrawer open={open} onOpenChange={setOpen} modal={false}>
        <SideDrawerContent
          size="sm"
          inset
          finalFocus={() => buttons.current.get(selected ?? lastPicked.current) ?? true}
        >
          <SideDrawerDetail
            recordKey={file?.id ?? "none"}
            avatar={
              file && (
                <span
                  aria-hidden
                  className="grid size-10 place-items-center rounded-sheen-md bg-sheen-accent-soft text-sheen-accent"
                >
                  <Icon d={icons.file} className="size-5" />
                </span>
              )
            }
            title={file ? file.name : "Details"}
            subtitle={file?.kind}
            empty={!file}
            labels={{
              emptyTitle: "No file selected",
              emptyDescription: "Pick a file in the list to see its details here.",
            }}
            navigation={
              file
                ? {
                    index,
                    count: FILES.length,
                    onIndexChange: (i) => {
                      const next = itemAt(FILES, i);
                      if (next) select(next.id);
                    },
                    labels: { previous: "Previous file", next: "Next file" },
                  }
                : undefined
            }
          >
            {file && (
              <DescriptionList layout="stacked" size="sm">
                <DescriptionItem label="Location" copyValue={`${file.path}/${file.name}`}>
                  {file.path}
                </DescriptionItem>
                <DescriptionItem label="Size">{file.size}</DescriptionItem>
                <DescriptionItem label="Owner">
                  <span className="flex items-center gap-2">
                    <Avatar name={file.owner} size="sm" />
                    {file.owner}
                  </span>
                </DescriptionItem>
                <DescriptionItem label="Modified">{dateTimeFormat.format(new Date(file.modified))}</DescriptionItem>
                <DescriptionItem label="Shared with">
                  {file.shared === 1 ? "1 person" : `${file.shared} people`}
                </DescriptionItem>
              </DescriptionList>
            )}
          </SideDrawerDetail>
        </SideDrawerContent>
      </SideDrawer>
    </div>
  );
}
