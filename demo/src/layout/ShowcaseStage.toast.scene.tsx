import { useEffect, useRef } from "react";
import { ToastProvider, useToast } from "@sheenui/theme";
import { DeferredToaster } from "./DeferredToaster";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { ToastScene } from "./ShowcaseStage.toast";

type Step = ToastScene["step"];
type Row = "wait" | "run" | "ok" | "bad";
type Wanted = { key: string; type: "success" | "error"; title: string; text: string; action: string };

const NAMES = [
  ["Build", "4.2s"],
  ["Deploy", "3 regions"],
  ["Health check", "eu-west"],
] as const;

/** The three pipeline rows for a step. */
const rows = (step: Step): Row[] =>
  step >= 5
    ? ["ok", "ok", "ok"]
    : step === 4
      ? ["ok", "run", "wait"]
      : step === 3
        ? ["ok", "bad", "wait"]
        : step === 2
          ? ["ok", "run", "wait"]
          : step === 1
            ? ["ok", "wait", "wait"]
            : ["wait", "wait", "wait"];

/** The toasts that should be showing on a step (all one line of text and one action, so one height). */
const wanted = (step: Step): Wanted[] => {
  const list: Wanted[] = [];
  if (step >= 1)
    list.push({ key: "build", type: "success", title: "Build passed", text: "Compiled in 4.2s.", action: "View log" });
  if (step === 3)
    list.push({
      key: "fail",
      type: "error",
      title: "Deploy failed",
      text: "eu-west did not respond.",
      action: "Retry",
    });
  if (step >= 5)
    list.push({
      key: "live",
      type: "success",
      title: "Release 4.2 is live",
      text: "3 regions healthy.",
      action: "View",
    });
  return list;
};

/** Shows what `step` asks for: missing toasts are added, others dismissed, so any jump (reduced motion) lands right. */
function Toasts({ step, onRetry }: { step: Step; onRetry: () => void }) {
  const toast = useToast();
  const toastRef = useRef(toast);
  const retryRef = useRef(onRetry);
  const shown = useRef(new Map<string, string>());
  useEffect(() => {
    toastRef.current = toast;
    retryRef.current = onRetry;
  });
  useEffect(() => {
    const want = wanted(step);
    for (const [key, id] of shown.current)
      if (!want.some((w) => w.key === key)) {
        toastRef.current.dismiss(id);
        shown.current.delete(key);
      }
    for (const w of want) {
      if (shown.current.has(w.key)) continue;
      const options = {
        persistent: true,
        // Every toast carries an action, so all are the same height: the stack's height then never changes when one
        // leaves, and a bottom-anchored toast does not jump.
        action: { label: w.action, onClick: () => (w.key === "fail" ? retryRef.current() : undefined) },
      };
      shown.current.set(
        w.key,
        w.type === "error"
          ? toastRef.current.error(w.title, w.text, options)
          : toastRef.current.success(w.title, w.text, options),
      );
    }
  }, [step]);
  useEffect(() => {
    const map = shown.current;
    return () => {
      for (const id of map.values()) toastRef.current.dismiss(id);
    };
  }, []);
  return null;
}

/** The pipeline card plus the stage's own toast stack. The Retry action on the failed toast works for the person too. */
export function ToastScene({ scene, ctx }: { scene: ToastScene; ctx: StageContext }) {
  const [step, setStep] = useFollow(scene.step);
  const { setState } = ctx;
  const state: Row[] = rows(step);
  return (
    <ToastProvider>
      <div className="sheen-stage-col">
        <p className="sheen-stage-title">Release 4.2</p>
        <ul className="sheen-stage-steps" aria-label="Pipeline">
          {NAMES.map(([name, note], i) => (
            <li key={name} className="sheen-stage-step" data-s={state[i]}>
              <span aria-hidden className="sheen-stage-dot" />
              <b>{name}</b>
              <em>
                {state[i] === "ok" ? "Passed" : state[i] === "run" ? "Running" : state[i] === "bad" ? "Failed" : note}
              </em>
            </li>
          ))}
        </ul>
      </div>
      <Toasts
        step={step}
        onRetry={() => {
          setStep(5);
          setState("success");
        }}
      />
      {ctx.host ? (
        <DeferredToaster position="bottom-center" container={ctx.host} labels={{ region: "Stage notifications" }} />
      ) : null}
    </ToastProvider>
  );
}
