import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Button, ToastProvider, useToast, type Toaster } from "@sheenui/theme";
import { DeferredToaster } from "../layout/DeferredToaster";

import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { ToastScene as ToastSceneData } from "../layout/ShowcaseStage.toast";
import { ToastScene } from "../layout/ShowcaseStage.toast.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { Segmented } from "../layout/Segmented";
import * as PROPS from "../generated/component-props";

type ToastPosition = Exclude<
  NonNullable<ComponentProps<typeof Toaster>["position"]>,
  `${string}-start` | `${string}-end`
>;
type Edge = "top" | "bottom";
type Side = "left" | "center" | "right";

const edges = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
] as const;

const sides = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
] as const;

const swipeHint: Record<Side, string> = { left: "left", center: "sideways", right: "right" };

/** The "Position" sample: shows the position prop only when it is not the default. */
const toastRootCode: (position: string) => string = (position) => {
  const attr = ["top-left", "top-center", "bottom-left", "bottom-center", "bottom-right"].includes(position)
    ? ' position="' + position + '"'
    : "";
  return `
import { ToastProvider, Toaster, useToast } from "@sheenui/theme";

function App() {
  const toast = useToast();
  return <button onClick={() => toast.info("Hello from the toast stack")}>Show a toast</button>;
}

// Once, at the app root (top-right is the default):
export function Root() {
  return (
    <ToastProvider>
      <App />
      <Toaster${attr} />
    </ToastProvider>
  );
}`;
};

/** The "Toast" docs page (/components/toast): live examples, props and notes. */
export function ToastPage() {
  const [position, setPosition] = useState<ToastPosition>("top-right");

  return (
    <Page
      eyebrow="Component"
      title="Toast"
      description="Glass notifications that stack, fan out on hover and can be swiped away. They sit top-right by default; any corner or edge center works. Screen readers announce them automatically."
      source="theme/src/components/toast/toast.tsx"
    >
      <ShowcaseStage<ToastSceneData>
        label="Toast demo"
        story={() => import("../layout/ShowcaseStage.toast")}
        initial={{ step: 0 }}
        minHeight="27rem"
        className="sheen-stage-toast"
        replayAt="top"
        onInterrupt="keep"
      >
        {(scene, ctx) => <ToastScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      {/* A page-local provider + Toaster, so the position picker below moves only these demos'
          toasts (the app's own Toaster stays where it is). The Toaster renders inside the stage of the demo
          that was used last (`container`), so a toast appears beside the button that fired it. */}
      <ToastProvider>
        <ToastDemos position={position} onPositionChange={setPosition} />
      </ToastProvider>

      <PropsTable
        of={[PROPS.ToastProvider, PROPS.Toaster]}
        rows={[
          ["ToastProvider timeout", "number (ms)", "5000", "How long a toast stays up. 0 keeps it until dismissed."],
          ["ToastProvider limit", "number", "3", "How many toasts show at once; older ones are hidden, not dropped."],
          ["<Toaster />", "component", "", "Renders the stack. Place it once, inside the provider."],
          [
            "useToast()",
            "{ info, success, warning, error, loading, promise, update, dismiss }",
            "",
            "info / success / warning / error / loading take (title, description?, options?) and return the toast id.",
          ],
          [
            "options",
            "ToastOptions",
            "",
            "id, duration (ms; 0 or persistent keeps it; a toast with an action stays until dismissed), action ({ label, onClick }), position (per toast, shown by a Toaster with onlyPositioned), priority, onClose.",
          ],
          [
            "promise",
            "(promise, { loading, success, error }, options?) => Promise",
            "",
            "One toast that shows loading, then success or error; success and error may be functions of the result.",
          ],
          [
            "update",
            "(id: string, changes: ToastUpdate) => void",
            "",
            "Change a showing toast: type, title, description, duration, action.",
          ],
          ["dismiss", "(id?: string) => void", "", "Close one toast by id, or all of them when called without one."],
        ]}
      />
      <KeyboardTable
        rows={[
          [
            "F6",
            "Move focus to the toast region (announced once with every toast that has an action). Tab then reaches each Action and Dismiss button.",
          ],
          ["Tab", "Reach each toast's Dismiss button while the stack is open."],
          ["Enter / Space", "Dismiss the focused toast."],
          ["Escape", "Dismiss the focused toast."],
        ]}
      />
      <A11yNotes
        items={[
          'Toasts are announced through a polite live region (errors too) and never steal focus. A toast with an action adds a hidden line to that announcement: "Press F6, then Tab to reach Undo."',
          "A toast with an action stays until it is dismissed (WCAG 2.2.1); an explicit duration on it is raised to at least 20 s. Timers also pause while a toast is hovered or focused. Still offer the same action somewhere in the page (an Undo in the list, say).",
          "The stack expands, and each toast pauses its timer, while it is hovered or holds focus, so there is time to read.",
          "Every action in a toast needs a visible label; swipe towards the nearest edge dismisses it on touch.",
        ]}
      />
    </Page>
  );
}

function ToastDemos({
  position,
  onPositionChange,
}: {
  position: ToastPosition;
  onPositionChange: (p: ToastPosition) => void;
}) {
  const toast = useToast();
  // The stage (the framed preview) of the demo used last: the stack renders inside it. Null = the page.
  const [stage, setStage] = useState<HTMLElement | null>(null);
  const [edge, side] = position.split("-") as [Edge, Side];
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const move = (next: ToastPosition) => {
    if (next === position) return;
    onPositionChange(next);
    // Clear the old stack so the sample toast lands on its own in the new spot.
    toast.dismiss();
    const [e, s] = next.split("-") as [Edge, Side];
    toast.info(
      `Toasts now appear ${e} ${s}`,
      `Swipe one ${e === "top" ? "up" : "down"} or ${swipeHint[s]} to dismiss it.`,
    );
  };

  const stackThree = () => {
    timers.current.forEach(clearTimeout);
    const fire = [
      () => toast.info("Syncing 12 files", "This can take a moment."),
      () => toast.success("Backup finished", "All 12 files are safe."),
      () => toast.error("1 file was skipped", "report.pdf is open in another app."),
    ];
    timers.current = fire.map((f, i) => window.setTimeout(f, i * 160));
  };

  return (
    <>
      <DeferredToaster container={stage} position={position} labels={{ region: "Demo notifications" }} />
      <Example
        title="Position"
        autoplayMode="manual"
        autoplay={() => {
          stackThree();
          return () => timers.current.forEach(clearTimeout);
        }}
        description={`Pick an edge and a side, then stack a few. The newest toast sits at the edge and older ones peek out behind it; hover the stack (or press F6) to fan it out. Swipe a toast ${edge === "top" ? "up" : "down"} or ${swipeHint[side]} to dismiss it.`}
        controls={
          <>
            <Segmented label="Toast edge" options={edges} value={edge} onValueChange={(e) => move(`${e}-${side}`)} />
            <Segmented label="Toast side" options={sides} value={side} onValueChange={(s) => move(`${edge}-${s}`)} />
          </>
        }
        code={toastRootCode(position)}
        stageClassName="min-h-80"
      >
        <InStage onUse={setStage} initial>
          <Button onClick={stackThree}>Stack three</Button>
          <Button variant="glass" onClick={() => toast.dismiss()}>
            Dismiss all
          </Button>
        </InStage>
      </Example>

      <Example
        title="Types"
        description="Success, error and info each get their own icon color. Fire a few in a row to see them stack."
        code={`
import { useToast } from "@sheenui/theme";

const toast = useToast();
toast.success("Changes saved", "Your profile is up to date.");
toast.error("Upload failed", "The file is larger than 10 MB.");
toast.info("New version available");
toast.dismiss(); // close them all`}
        stageClassName="min-h-80"
      >
        <InStage onUse={setStage}>
          <Button onClick={() => toast.success("Changes saved", "Your profile is up to date.")}>Success</Button>
          <Button variant="danger" onClick={() => toast.error("Upload failed", "The file is larger than 10 MB.")}>
            Error
          </Button>
          <Button variant="glass" onClick={() => toast.info("New version available", "Refresh to get the latest.")}>
            Info
          </Button>
        </InStage>
      </Example>

      <Example
        title="Promise, action, persistent and update"
        description="toast.promise shows one toast that turns into success or error. An action adds a button such as Undo. persistent keeps a toast until it is dismissed, and update edits one by id."
        code={`
import { useToast } from "@sheenui/theme";

export function Example() {
  const toast = useToast();

  const save = () =>
    toast.promise(new Promise<string>((resolve) => setTimeout(() => resolve("report.pdf"), 1500)), {
      loading: "Saving report…",
      success: (name) => \`\${name} saved\`,
      error: "Could not save",
    });

  const remove = () =>
    toast.warning("Message deleted", undefined, { action: { label: "Undo", onClick: () => toast.success("Restored") } });

  const upload = () => {
    const id = toast.loading("Uploading…", "0 of 3 files");
    setTimeout(() => toast.update(id, { type: "success", title: "Upload complete", description: "3 of 3 files", duration: 4000 }), 1800);
  };

  return (
    <>
      <button onClick={save}>Promise</button>
      <button onClick={remove}>Action</button>
      <button onClick={upload}>Update by id</button>
      <button onClick={() => toast.info("Stays until closed", undefined, { persistent: true })}>Persistent</button>
    </>
  );
}`}
        stageClassName="min-h-80"
      >
        <InStage onUse={setStage}>
          <Button
            onClick={() =>
              void toast.promise(new Promise<string>((resolve) => setTimeout(() => resolve("report.pdf"), 1500)), {
                loading: "Saving report…",
                success: (name) => `${name} saved`,
                error: "Could not save",
              })
            }
          >
            Promise
          </Button>
          <Button
            variant="glass"
            onClick={() =>
              toast.warning("Message deleted", undefined, {
                action: { label: "Undo", onClick: () => toast.success("Restored") },
              })
            }
          >
            Action
          </Button>
          <Button
            variant="glass"
            onClick={() => {
              const id = toast.loading("Uploading…", "0 of 3 files");
              setTimeout(
                () =>
                  toast.update(id, {
                    type: "success",
                    title: "Upload complete",
                    description: "3 of 3 files",
                    duration: 4000,
                  }),
                1800,
              );
            }}
          >
            Update by id
          </Button>
          <Button variant="glass" onClick={() => toast.info("Stays until closed", undefined, { persistent: true })}>
            Persistent
          </Button>
        </InStage>
      </Example>
    </>
  );
}

/**
 * Wraps a demo's buttons: using one points the page's Toaster at this demo's stage (the framed preview that is the
 * wrapper's parent), so the toast stack plays next to the button that fired it. `initial` makes it the first stage.
 */
function InStage({
  children,
  onUse,
  initial = false,
}: {
  children: ReactNode;
  onUse: (stage: HTMLElement | null) => void;
  initial?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (initial) onUse(ref.current?.parentElement ?? null);
  }, [initial, onUse]);
  return (
    <div ref={ref} className="contents" onClickCapture={() => onUse(ref.current?.parentElement ?? null)}>
      {children}
    </div>
  );
}
