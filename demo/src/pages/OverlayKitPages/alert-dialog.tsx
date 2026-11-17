import { wait } from "../../demo-utils";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, useSheenReducedMotion, useToast } from "@sheenui/theme";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  ConfirmDialog,
  useConfirm,
} from "@sheenui/theme";
import { Icon, icons } from "./shared";

/* =====================================================================
 * Alert dialog
 * ===================================================================== */

export function DeleteProjectDemo({ fail }: { fail: boolean }) {
  const toast = useToast();
  return (
    <ConfirmDialog
      trigger={
        <Button variant="danger" leading={<Icon d={icons.trash} className="size-4" />}>
          Delete project
        </Button>
      }
      title="Delete “Aurora”?"
      description="The project, its 24 deployments and every environment variable are removed for the whole team. This can’t be undone."
      confirmLabel="Delete project"
      labels={{ pending: "Deleting…" }}
      onConfirm={async () => {
        await wait(1400);
        if (fail) throw new Error("The server is busy right now. Nothing was deleted; try again in a minute.");
        toast.success("Project deleted", "Aurora and its deployments are gone.");
      }}
    />
  );
}

export function TypeToConfirmDemo() {
  const toast = useToast();
  return (
    <ConfirmDialog
      trigger={<Button variant="glass">Delete repository</Button>}
      title="Delete sheenui/theme?"
      description="All issues, pull requests and 1,284 stars go with it. Forks are not deleted."
      confirmationText="sheenui/theme"
      confirmLabel="Delete this repository"
      labels={{ pending: "Deleting…" }}
      onConfirm={async () => {
        await wait(1200);
        toast.success("Repository deleted");
      }}
    />
  );
}

const initialKeys = [
  { id: "k1", name: "Production deploy", hint: "sk_live_…4f2a", used: "2 min ago" },
  { id: "k2", name: "Staging", hint: "sk_test_…9c1e", used: "Yesterday" },
  { id: "k3", name: "CI pipeline", hint: "sk_test_…07bd", used: "3 days ago" },
  { id: "k4", name: "Local dev (Mira)", hint: "sk_test_…e6a0", used: "Last month" },
];

export function UseConfirmDemo() {
  const toast = useToast();
  const reduced = useSheenReducedMotion();
  const [confirm, confirmDialog] = useConfirm();
  const [keys, setKeys] = useState(initialKeys);

  async function revoke(key: (typeof initialKeys)[number]) {
    const ok = await confirm({
      tone: "warning",
      title: `Revoke “${key.name}”?`,
      description: `Apps using ${key.hint} stop working immediately. You can create a new key at any time.`,
      confirmLabel: "Revoke key",
      labels: { pending: "Revoking…" },
      onConfirm: () => wait(700),
    });
    if (!ok) return;
    setKeys((list) => list.filter((k) => k.id !== key.id));
    toast.success("Key revoked", key.name);
  }

  return (
    <div className="glass-2 w-full max-w-lg rounded-sheen-lg p-2">
      <ul className="flex flex-col">
        <AnimatePresence initial={false}>
          {keys.map((key) => (
            <motion.li
              key={key.id}
              layout={!reduced}
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: 0.15 } }
                  : { opacity: 0, x: 24, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }
              }
              className="flex items-center gap-3 rounded-sheen-md px-3 py-2.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-sheen-full bg-sheen-accent-soft text-sheen-accent">
                <Icon d={icons.key} className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{key.name}</span>
                <span className="truncate font-sheen-mono text-xs text-sheen-fg-muted">
                  {key.hint} · {key.used}
                </span>
              </span>
              <Button size="sm" variant="ghost" onClick={() => void revoke(key)} aria-label={`Revoke ${key.name}`}>
                Revoke
              </Button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {keys.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-4 py-8 text-center text-sm text-sheen-fg-muted">
          No API keys left.
          <Button size="sm" variant="glass" onClick={() => setKeys(initialKeys)}>
            Restore demo keys
          </Button>
        </div>
      )}
      {confirmDialog}
    </div>
  );
}

export function ComposedDemo() {
  const toast = useToast();
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="glass" />}>Close editor</AlertDialogTrigger>
      <AlertDialogContent tone="warning">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You edited 3 fields in “Billing details”. Leaving now loses those edits.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction onClick={() => toast.info("Changes discarded")}>Discard changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
