/**
 * A tiny first-in-first-out queue for toast calls made before the viewport exists. Base UI starts a toast's
 * auto-close timer when the toast is added, so a toast added while the (lazy) viewport is still loading could
 * expire unseen. `ToastProvider` holds calls in this queue until its `viewportReady` prop turns true.
 */
export type ToastQueue = {
  /** Hold one call until {@link ToastQueue.flush}. */
  push: (run: () => void) => void;
  /** Run every held call in the order it was pushed, then empty the queue. */
  flush: () => void;
  /** How many calls are waiting. */
  size: () => number;
};

/** Create an empty {@link ToastQueue}. */
export function createToastQueue(): ToastQueue {
  let held: (() => void)[] = [];
  return {
    push: (run) => {
      held.push(run);
    },
    flush: () => {
      const batch = held;
      held = [];
      for (const run of batch) run();
    },
    size: () => held.length,
  };
}

/** What `useToast` needs from a provider that may not have a viewport yet. */
export type ToastGate = {
  /** True once a viewport is mounted (always true for a provider that was not given `viewportReady`). */
  isReady: () => boolean;
  /** Ask the app to load its viewport now (called when a toast is held). */
  request: () => void;
  /** Hold a call until the gate opens. */
  hold: (run: () => void) => void;
  /** A fresh id for a toast that is held, so `add` can return it at once. */
  nextId: () => string;
  /** Called by the provider when its props change. Opening the gate runs the held calls in order. */
  sync: (ready: boolean, onNeeded: (() => void) | undefined) => void;
};

/** Create the gate a `ToastProvider` shares with `useToast`: it holds calls while the viewport is not ready. */
export function createToastGate(ready: boolean): ToastGate {
  const queue = createToastQueue();
  let open = ready;
  let needed: (() => void) | undefined;
  let counter = 0;
  return {
    isReady: () => open,
    request: () => needed?.(),
    hold: queue.push,
    nextId: () => `sheen-held-toast-${(counter += 1)}`,
    sync: (nextReady, onNeeded) => {
      open = nextReady;
      needed = onNeeded;
      if (open) queue.flush();
    },
  };
}
