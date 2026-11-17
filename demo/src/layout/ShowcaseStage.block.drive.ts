/** How a block's scene plays the block: it finds a control by its visible name and presses, fills or types into it. The
 * block is the real one; these helpers only do what a person would (an `input` event, a click), so its own code runs.
 * They work on an `inert` copy too: a programmatic event is not blocked by `inert`, and none of them moves focus. */

export type Drive = { root: HTMLElement; reduced: boolean; sleep: (ms: number) => Promise<void> };
export type Action = (d: Drive) => void | Promise<void>;

const norm = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim().toLowerCase();

const nameOf = (el: Element): string => {
  const label = el.getAttribute("aria-label");
  if (label) return norm(label);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const l = el.labels?.[0]?.textContent;
    if (l) return norm(l);
    return norm(el.placeholder);
  }
  const own = norm(el.textContent);
  if (own) return own;
  // A switch or checkbox with no text of its own is named by the label that wraps it (or the element it points to).
  const by = el.getAttribute("aria-labelledby")?.split(" ")[0];
  return norm((by ? document.getElementById(by)?.textContent : null) ?? el.closest("label")?.textContent);
};

/** The first element of `selector` whose name is `name` (exact, else starts with, else contains). */
export function find(root: ParentNode, selector: string, name: string): HTMLElement | null {
  const wanted = norm(name);
  const all = [...root.querySelectorAll<HTMLElement>(selector)];
  return (
    all.find((el) => nameOf(el) === wanted) ??
    all.find((el) => nameOf(el).startsWith(wanted)) ??
    all.find((el) => nameOf(el).includes(wanted)) ??
    null
  );
}

/** Polls until `get` finds something (a lazily loaded block is not there at once), for at most `ms`. */
async function until<T>(get: () => T | null, sleep: (ms: number) => Promise<void>, ms = 5000): Promise<T | null> {
  for (let waited = 0; waited <= ms; waited += 100) {
    const found = get();
    if (found) return found;
    await sleep(100);
  }
  return null;
}

const CONTROLS =
  'button,[role="tab"],[role="button"],a[href],[role="switch"],[role="radio"],[role="checkbox"],[role="option"],summary';

/**
 * A press as a person makes it: mouse down, mouse up, click. Some parts (tabs, options) act on the mouse down. No pointer
 * event is sent: the stage listens for those to tell a person's touch from its own story.
 */
export function tap(el: HTMLElement) {
  const init = { bubbles: true, cancelable: true, button: 0, view: window } as const;
  el.dispatchEvent(new MouseEvent("mousedown", init));
  el.dispatchEvent(new MouseEvent("mouseup", init));
  el.click();
}

/** Presses the control called `name` (a button, tab, link, switch...). */
export const press =
  (name: string, scope?: string): Action =>
  async ({ root, sleep }) => {
    const el = await until(() => find(scope ? (root.querySelector(scope) ?? root) : root, CONTROLS, name), sleep);
    if (el) tap(el);
  };

/** Sets a field's value the way typing does (React sees an `input` event) and leaves focus alone. */
export function setValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Types `text` into the field called `name`, a letter at a time (all at once under reduced motion). */
export const type =
  (name: string, text: string, perChar = 38): Action =>
  async ({ root, reduced, sleep }) => {
    const el = await until(() => find(root, "input:not([type=checkbox]),textarea", name), sleep);
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
    if (reduced) {
      setValue(el, text);
      return;
    }
    for (let i = 1; i <= text.length; i += 1) {
      setValue(el, text.slice(0, i));
      await sleep(perChar);
    }
  };

/** Several actions in order, as one step. */
export const all =
  (...actions: Action[]): Action =>
  async (d) => {
    for (const a of actions) await a(d);
  };

/** A pause inside a step. */
export const pause =
  (ms: number): Action =>
  ({ reduced, sleep }) =>
    reduced ? undefined : sleep(ms);
