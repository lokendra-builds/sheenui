"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type SubmitEvent,
} from "react";

import { cn } from "../lib/cn";
import { HEADING_TAGS, headingBelow } from "../lib/heading";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { useLatest } from "../hooks/use-latest";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Textarea } from "../textarea/textarea";
import { VerticalNav, type VerticalNavItem } from "../vertical-nav/vertical-nav";
import { ConfirmDialog } from "../alert-dialog/alert-dialog";
import { useShortcutPlatform } from "../kbd/kbd";
import { matchesShortcut, toAriaKeyShortcuts } from "../kbd/shortcut";
import { isPlainLeftClick } from "../navbar/navbar";

import {
  type SettingsSection,
  type SettingsValues,
  type SettingsNotificationOption,
  type SettingsPageLabels,
  defaultSettingsPageLabels,
  defaultSettingsNotificationOptions,
  type SettingsPageProps,
} from "./settings-page/model";
import { UploadIcon, TrashIcon, sectionIcons } from "./settings-page/icons";
import {
  countFor,
  Section,
  AvatarDrop,
  NotificationSwitches,
  AppearanceSettings,
  DangerRow,
  ExportButton,
  PillNav,
  SaveBar,
} from "./settings-page/parts";

export {
  type SettingsSection,
  type SettingsValues,
  type SettingsNotificationOption,
  type SettingsPageLabels,
  defaultSettingsPageLabels,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- deprecated alias, kept for one release
  defaultSettingsLabels,
  defaultSettingsNotificationOptions,
  type SettingsPageProps,
} from "./settings-page/model";
/**
 * Settings page: a complete account-settings layout.
 *
 *   <SettingsPage defaultValues={user} onSave={(values) => api.save(values)} onDeleteAccount={api.deleteAccount} />
 *
 * - Navigation: a sticky VerticalNav beside the sections; when the block is narrower than
 *   48rem it becomes a sticky, scrollable strip of pills on top. Either way it tracks the
 *   section you are reading (scroll-spy) and a click glides there and focuses its heading.
 * - Profile: photo (click, or drop an image on it), name, username, email, bio with counter.
 * - Notifications: grouped switches; "locked" ones (security) stay on.
 * - Appearance: Light / Dark / System, reduced motion and reduced transparency. These are the
 *   real SheenUI preferences (useTheme & co.): they apply at once and are not part of the form.
 * - Danger zone: export data; delete account behind a type-to-confirm alert dialog.
 * - Save bar: a sticky glass bar rises when anything differs from the saved values, counts
 *   the changes, saves (⌘S / Ctrl+S too) or discards them, shows "Saved", then sinks away.
 *   Leaving the page with unsaved changes asks first (`warnOnLeave`).
 *
 * The layout responds to its own width (container queries), not the window's, so it works in
 * an app shell, a dialog or a docs frame. Motion: the save bar (the glass itself) springs up
 * and leaves quicker without overshoot; the nav highlight slides. Reduced motion: no movement.
 */

/* ---------- Types ---------- */

const EMPTY: SettingsValues = { name: "", username: "", email: "", bio: "", avatar: null, notifications: {} };

type FieldKey = "name" | "username" | "email";
const FIELD_KEYS: FieldKey[] = ["name", "username", "email"];

/**
 * Errors for the profile fields the person can see and has changed. A page without the
 * Profile section has nothing to fix, and values that came from your server as they are
 * (even ones these rules would reject) never block saving something else.
 */
function validate(
  values: SettingsValues,
  saved: SettingsValues,
  L: SettingsPageLabels,
  sections: SettingsSection[],
): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};
  if (!sections.includes("profile")) return errors;
  const edited = (key: FieldKey) => values[key] !== saved[key];
  if (edited("name") && !values.name.trim()) errors.name = L.nameRequired;
  if (edited("username") && !/^[a-z0-9-]{3,30}$/.test(values.username)) errors.username = L.usernameInvalid;
  if (edited("email") && !/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = L.emailInvalid;
  return errors;
}

/** Which SettingsPage handles ⌘S when focus is on <body>: the one used last (or the only one). */
const mountedPages = new Set<string>();
let lastUsedPage: string | null = null;

/** Keys that differ from the saved values ("notifications.mentions" for a single switch). */
function changedKeys(values: SettingsValues, saved: SettingsValues, options: SettingsNotificationOption[]) {
  const keys: string[] = [];
  for (const key of ["name", "username", "email", "bio", "avatar"] as const) {
    if (values[key] !== saved[key]) keys.push(key);
  }
  for (const option of options) {
    if (Boolean(values.notifications[option.id]) !== Boolean(saved.notifications[option.id]))
      keys.push(`notifications.${option.id}`);
  }
  return keys;
}

/** Nearest ancestor that scrolls vertically (null = the page), so scroll-spy works inside app shells too. */
function scrollParent(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null;
  while (node && node !== document.body && node !== document.documentElement) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return null;
}

/* ---------- Component ---------- */

/**
 * Props (see `SettingsPageProps`): `defaultValues`, `notificationOptions`, `onSave(values, changed)`,
 * `onDeleteAccount`, `onExportData`, `onAvatarChange(file)`, `maxAvatarMb` (`5`), `sections` (all four),
 * `usernamePrefix` (`"example.com/"`), `stickyTop` (`"1rem"`), `warnOnLeave` (`true`), `headingLevel`
 * (`1`), `title`, `description`, `labels`, `className`.
 * Keyboard: Tab walks the sticky section links (Enter glides to a section and focuses its heading) and
 * then the fields; once something changes, a save bar appears with Save and Discard, and Ctrl or
 * Cmd + S saves too; the delete dialog traps focus and Escape cancels it.
 * Accessibility: the current section link has `aria-current`; saving, errors and "unsaved changes" are
 * announced in a polite status region; the browser asks before leaving with unsaved changes.
 * Glass and motion: glass cards for the sections and a sticky glass save bar that springs up and leaves
 * quicker without overshoot. Reduced motion removes the movement.
 *
 * @example
 * ```tsx
 * import { SettingsPage, type SettingsValues } from "@sheenui/theme";
 *
 * const post = (url: string, body?: unknown) => fetch(url, { method: "POST", body: body ? JSON.stringify(body) : undefined });
 *
 * export function Example() {
 *   return (
 *     <SettingsPage
 *       defaultValues={{ name: "Ada Lovelace", email: "ada@example.com" }}
 *       onSave={async (values, changed) => {
 *         await post("/api/settings", values); // throw to show an error in the save bar
 *       }}
 *       onDeleteAccount={async () => {
 *         await post("/api/account/delete");
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/settings-page
 */
export function SettingsPage({
  defaultValues,
  notificationOptions = defaultSettingsNotificationOptions,
  onSave,
  onDeleteAccount,
  onExportData,
  onAvatarChange,
  maxAvatarMb = 5,
  sections = ["profile", "notifications", "appearance", "danger"],
  usernamePrefix = "example.com/",
  stickyTop = "1rem",
  warnOnLeave = true,
  headingLevel = 1,
  title,
  description,
  labels,
  className,
}: SettingsPageProps) {
  const L = { ...defaultSettingsPageLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const uid = useId();
  const sectionId = (section: SettingsSection) => `${uid}-${section}`;
  const TitleTag = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const SectionTag = HEADING_TAGS[headingBelow(headingLevel, 1)];
  const GroupTag = HEADING_TAGS[headingBelow(headingLevel, 2)];

  // Starting values only: later prop changes don't reset what the person is editing.
  const [initial] = useState<SettingsValues>(() => {
    const notifications: Record<string, boolean> = {};
    for (const option of notificationOptions)
      notifications[option.id] = option.locked ? true : Boolean(defaultValues?.notifications?.[option.id]);
    return { ...EMPTY, ...defaultValues, notifications };
  });

  const [saved, setSaved] = useState<SettingsValues>(initial);
  const [values, setValues] = useState<SettingsValues>(initial);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [announcement, setAnnouncement] = useState("");
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // The control the person last changed a value with: focus returns there when the save bar's buttons leave.
  const lastEdited = useRef<HTMLElement | null>(null);
  // How the save bar was last used: a tap must not send focus into a text field (that opens the keyboard).
  const barInput = useRef<"keyboard" | "mouse" | "touch">("keyboard");
  const objectUrls = useRef<Set<string>>(new Set());
  const fieldRefs = {
    name: useRef<HTMLInputElement>(null),
    username: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
  };

  const changed = useMemo(() => changedKeys(values, saved, notificationOptions), [values, saved, notificationOptions]);
  const dirty = changed.length > 0;
  const errors = validate(values, saved, L, sections);
  const visibleError = (key: FieldKey) => (touched[key] || submitted ? errors[key] : undefined);
  const errorCount = Object.keys(errors).length;

  // The newest values, for code that runs after an await.
  const latestRef = useLatest(values);

  const announce = useCallback((text: string) => {
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(text));
  }, []);

  // "You have unsaved changes" once, when the first change is made.
  const wasDirty = useRef(false);
  useEffect(() => {
    if (dirty && !wasDirty.current) announce(L.announceDirty);
    wasDirty.current = dirty;
  }, [dirty, announce, L.announceDirty]);

  // Free object URLs of photos picked in this session.
  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  // Leaving with unsaved changes: the browser asks first.
  useEffect(() => {
    if (!warnOnLeave || !dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [warnOnLeave, dirty]);

  // ⌘S / Ctrl+S: with focus inside this page it always belongs to the page (never the browser's
  // "Save page" dialog); with focus on <body>, only the page used last (or the only one) takes it.
  const platform = useShortcutPlatform();
  const dirtyRef = useLatest(dirty);
  useEffect(() => {
    mountedPages.add(uid);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !matchesShortcut(event, "mod+s", platform)) return;
      const active = document.activeElement;
      const inside = Boolean(active && rootRef.current?.contains(active));
      const onBody = !active || active === document.body;
      const mine = lastUsedPage === uid || (lastUsedPage === null && mountedPages.size === 1);
      if (!inside && !(onBody && mine)) return;
      event.preventDefault();
      if (dirtyRef.current) formRef.current?.requestSubmit();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      mountedPages.delete(uid);
      if (lastUsedPage === uid) lastUsedPage = null;
    };
  }, [uid, platform, dirtyRef]);

  function set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      formRef.current?.contains(active) &&
      !active.closest("[data-slot='settings-save-bar']")
    ) {
      lastEdited.current = active;
    }
    setValues((v) => ({ ...v, [key]: value }));
    if (status === "error" || status === "saved") setStatus("idle");
  }

  // This page's own bar only: another SettingsPage on the screen has its own.
  const focusInBar = () => {
    const bar = document.activeElement?.closest("[data-slot='settings-save-bar']");
    return Boolean(bar && rootRef.current?.contains(bar));
  };

  /**
   * The save bar's buttons are about to go: put focus back where the person was editing, so it
   * never drops to <body>. After a tap, the heading of that section instead (focusing a text
   * field would open the on-screen keyboard).
   */
  function returnFocus() {
    const field = lastEdited.current?.isConnected ? lastEdited.current : null;
    const textEntry = field?.matches("input:not([type='checkbox']):not([type='radio']), textarea") ?? false;
    const heading = (field?.closest("section") ?? rootRef.current)?.querySelector<HTMLElement>(
      "[data-slot='settings-section-title']",
    );
    const target = field && !(textEntry && barInput.current === "touch") ? field : heading;
    target?.focus({ preventScroll: true });
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (status === "saving" || !dirty) return;
    setSubmitted(true);
    if (errorCount > 0) {
      const first = FIELD_KEYS.find((key) => errors[key]);
      if (first) fieldRefs[first].current?.focus();
      return;
    }
    // What is being saved: edits made while the request runs stay unsaved.
    const snapshot = values;
    setStatus("saving");
    try {
      await onSave?.(snapshot, changed);
      setSaved(snapshot);
      setSubmitted(false);
      setTouched({});
      announce(L.announceSaved);
      if (changedKeys(latestRef.current, snapshot, notificationOptions).length > 0) {
        // Typed on while it saved: those changes are still unsaved, so the bar keeps its buttons.
        setStatus("idle");
        return;
      }
      // "Changes saved" replaces Discard and Save: move focus before they unmount.
      if (focusInBar()) returnFocus();
      setStatus("saved");
    } catch {
      setStatus("error");
      announce(L.saveError);
    }
  }

  // "Changes saved" lingers briefly, then the bar sinks away.
  useEffect(() => {
    if (status !== "saved") return;
    const timer = window.setTimeout(() => {
      if (focusInBar()) returnFocus();
      setStatus("idle");
    }, 1600);
    return () => window.clearTimeout(timer);
    // returnFocus only reads refs.
  }, [status]);

  function discard() {
    if (focusInBar()) returnFocus();
    setValues(saved);
    setTouched({});
    setSubmitted(false);
    setStatus("idle");
    setAvatarError(null);
    announce(L.announceDiscarded);
  }

  /* ----- Photo ----- */

  const fileInput = useRef<HTMLInputElement>(null);
  function pickPhoto(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError(L.photoNotImage);
      return;
    }
    if (file.size > maxAvatarMb * 1024 * 1024) {
      setAvatarError(L.photoTooBig(maxAvatarMb));
      return;
    }
    setAvatarError(null);
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    set("avatar", url);
    onAvatarChange?.(file);
  }

  /* ----- Scroll-spy ----- */

  const [active, setActive] = useState<SettingsSection>(sections[0] ?? "profile");
  const lockUntil = useRef(0);
  // True while a nav click glides to a section: the pill strip then follows instantly, because a
  // second smooth scroll would cancel the first in Chromium.
  const [gliding, setGliding] = useState(false);
  const glideTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(glideTimer.current), []);

  // `sections` is compared by value; the section ids come from `uid`, read when the observers are built.
  const sectionsKey = sections.join();
  const idOf = useEffectEvent((section: SettingsSection) => sectionId(section));
  useEffect(() => {
    const list = sectionsKey.split(",") as SettingsSection[];
    const elements = list.map((s) => document.getElementById(idOf(s))).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const root = scrollParent(rootRef.current);
    const inBand = new Map<string, boolean>();
    let lastFullyVisible = false;
    const pick = () => {
      if (performance.now() < lockUntil.current) return;
      const last = list[list.length - 1];
      // At the very bottom the last section may never reach the reading band: once it is fully in view, it wins.
      if (lastFullyVisible && last) {
        setActive(last);
        return;
      }
      const first = list.find((s) => inBand.get(idOf(s)));
      if (first) setActive(first);
    };
    // Raw observers on purpose (not observeIntersection): both watch a custom scroll root and the band one
    // keeps one observer over many targets, reading every entry.
    // The "reading band": 15–45% down the scroller.
    const band = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) inBand.set(entry.target.id, entry.isIntersecting);
        pick();
      },
      { root, rootMargin: "-15% 0px -55% 0px" },
    );
    const tail = new IntersectionObserver(
      ([entry]) => {
        lastFullyVisible = Boolean(entry && entry.intersectionRatio > 0.98);
        pick();
      },
      { root, threshold: [0, 0.99] },
    );
    elements.forEach((el) => band.observe(el));
    const lastEl = elements[elements.length - 1];
    if (lastEl && elements.length > 1) tail.observe(lastEl);
    return () => {
      band.disconnect();
      tail.disconnect();
    };
  }, [sectionsKey]);

  function goTo(section: SettingsSection) {
    const el = document.getElementById(sectionId(section));
    if (!el) return;
    setActive(section);
    // Hold the highlight on the target while the smooth scroll passes the sections in between.
    lockUntil.current = performance.now() + (reduced ? 100 : 900);
    setGliding(true);
    window.clearTimeout(glideTimer.current);
    glideTimer.current = window.setTimeout(() => setGliding(false), reduced ? 100 : 900);
    // Scroll only the nearest real scroller (or the page). scrollIntoView would also shift
    // overflow: hidden ancestors, knocking an app shell's layout out of place.
    const scroller = scrollParent(el);
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const behavior = reduced ? "auto" : "smooth";
    if (scroller) {
      const top =
        el.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top -
        scroller.clientTop +
        scroller.scrollTop -
        margin;
      scroller.scrollTo({ top, behavior });
    } else {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - margin, behavior });
    }
    el.querySelector<HTMLElement>("[data-slot='settings-section-title']")?.focus({ preventScroll: true });
  }

  const navItems: (VerticalNavItem & { value: SettingsSection })[] = sections.map((s) => ({
    value: s,
    label: L[s],
    icon: sectionIcons[s],
    href: `#${sectionId(s)}`,
    badge: s === "profile" || s === "notifications" ? countFor(s, changed) : undefined,
  }));

  const pageTitle = title === undefined ? L.title : title;
  const pageDescription = description === undefined ? L.description : description;

  return (
    <div
      ref={rootRef}
      data-slot="settings-page"
      onPointerDownCapture={() => {
        lastUsedPage = uid;
      }}
      onFocusCapture={() => {
        lastUsedPage = uid;
      }}
      style={{ "--settings-top": stickyTop } as CSSProperties}
      className={cn("@container/settings w-full min-w-0", className)}
    >
      {pageTitle !== null && (
        <header role="none" className="mb-6 flex flex-col gap-1.5 @3xl/settings:mb-8">
          <TitleTag className="text-2xl font-semibold tracking-tight text-balance @3xl/settings:text-3xl">
            {pageTitle}
          </TitleTag>
          {pageDescription && <p className="max-w-2xl text-sm text-pretty text-sheen-fg-muted">{pageDescription}</p>}
        </header>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 @3xl/settings:grid-cols-[14.5rem_minmax(0,1fr)] @3xl/settings:gap-8">
        {/* Wide: the sidebar. */}
        <VerticalNav
          aria-label={L.nav}
          landmark={false}
          sections={[{ items: navItems }]}
          value={active}
          onValueChange={(value) => goTo(value as SettingsSection)}
          renderLink={(props) => (
            // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- href, children and the rest arrive through the spread from VerticalNav (a real, natively focusable anchor); the rules cannot see them
            <a
              {...props}
              // In-page scroll-spy: "current location", not "current page".
              aria-current={props["aria-current"] ? "location" : undefined}
              // High contrast drops the highlight pill and the accent bar: underline the current section instead.
              className={cn(
                props.className,
                "forced-colors:aria-[current=location]:underline forced-colors:aria-[current=location]:decoration-2 forced-colors:aria-[current=location]:underline-offset-4",
              )}
              onClick={(event) => {
                const plain = isPlainLeftClick(event);
                // VerticalNav's handler selects the item (it ignores clicks that were already prevented)…
                props.onClick(event);
                // …then, in-page, glide there instead of jumping (and keep the URL as it is).
                if (plain) event.preventDefault();
              }}
            />
          )}
          className="sticky top-(--settings-top) z-20 hidden h-auto w-full self-start @3xl/settings:flex"
        />

        {/* Narrow: a sticky strip of pills. */}
        <PillNav
          items={navItems}
          value={active}
          label={L.nav}
          onSelect={goTo}
          instant={gliding}
          className="sticky top-(--settings-top) z-30 @3xl/settings:hidden"
        />

        <form
          ref={formRef}
          noValidate
          onSubmit={handleSubmit}
          className="flex min-w-0 flex-col gap-5 @3xl/settings:gap-6"
        >
          {sections.map((section) => {
            if (section === "profile")
              return (
                <Section
                  key={section}
                  id={sectionId(section)}
                  title={L.profile}
                  description={L.profileDescription}
                  Tag={SectionTag}
                >
                  <div className="flex items-start gap-4 @md/settings:items-center @md/settings:gap-5">
                    <AvatarDrop
                      name={values.name}
                      src={values.avatar}
                      label={L.changePhoto}
                      onClick={() => fileInput.current?.click()}
                      onFile={pickPhoto}
                    />
                    <div className="flex min-w-0 flex-col gap-2">
                      <p className="text-sm font-medium">{L.photo}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="glass"
                          size="sm"
                          leading={<UploadIcon />}
                          onClick={() => fileInput.current?.click()}
                        >
                          {L.uploadPhoto}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          // aria-disabled, not disabled: after removing, focus stays on the button.
                          aria-disabled={!values.avatar || undefined}
                          data-unavailable={values.avatar ? undefined : ""}
                          className="data-unavailable:pointer-events-none data-unavailable:opacity-55"
                          onClick={() => {
                            if (!values.avatar) return;
                            set("avatar", null);
                            setAvatarError(null);
                            onAvatarChange?.(null);
                          }}
                        >
                          {L.removePhoto}
                        </Button>
                      </div>
                      <p
                        className={cn(
                          "text-xs",
                          avatarError ? "font-medium text-sheen-danger-text" : "text-sheen-fg-muted",
                        )}
                        role={avatarError ? "alert" : undefined}
                      >
                        {avatarError ?? L.photoHint}
                      </p>
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                        tabIndex={-1}
                        aria-hidden
                        className="sr-only"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          pickPhoto(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)] gap-4 @xl/settings:grid-cols-2">
                    <Input
                      ref={fieldRefs.name}
                      label={L.name}
                      name="name"
                      autoComplete="name"
                      aria-required
                      placeholder={L.namePlaceholder}
                      value={values.name}
                      onChange={(e) => set("name", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      error={visibleError("name")}
                    />
                    <Input
                      ref={fieldRefs.username}
                      label={L.username}
                      name="username"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      aria-required
                      leading={<span className="font-sheen-mono text-xs text-sheen-fg-subtle">{usernamePrefix}</span>}
                      value={values.username}
                      onChange={(e) => set("username", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                      onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                      description={L.usernameHint}
                      error={visibleError("username")}
                    />
                  </div>
                  <Input
                    ref={fieldRefs.email}
                    label={L.email}
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-required
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    description={L.emailHint}
                    error={visibleError("email")}
                  />
                  <Textarea
                    label={L.bio}
                    name="bio"
                    placeholder={L.bioPlaceholder}
                    description={L.bioHint}
                    maxLength={160}
                    minRows={3}
                    maxRows={6}
                    value={values.bio}
                    onChange={(e) => set("bio", e.target.value)}
                  />
                </Section>
              );

            if (section === "notifications")
              return (
                <Section
                  key={section}
                  id={sectionId(section)}
                  title={L.notifications}
                  description={L.notificationsDescription}
                  Tag={SectionTag}
                >
                  <NotificationSwitches
                    options={notificationOptions}
                    values={values.notifications}
                    onChange={(id, on) => set("notifications", { ...values.notifications, [id]: on })}
                    alwaysOn={L.alwaysOn}
                    GroupTag={GroupTag}
                  />
                </Section>
              );

            if (section === "appearance")
              return (
                <Section
                  key={section}
                  id={sectionId(section)}
                  title={L.appearance}
                  description={L.appearanceDescription}
                  Tag={SectionTag}
                  aside={
                    <Badge tone="accent" dot>
                      {L.appliesInstantly}
                    </Badge>
                  }
                >
                  <AppearanceSettings L={L} />
                </Section>
              );

            return (
              <Section
                key={section}
                id={sectionId(section)}
                title={L.danger}
                description={L.dangerDescription}
                Tag={SectionTag}
                tone="danger"
              >
                {onExportData && (
                  <DangerRow title={L.exportTitle} description={L.exportDescription}>
                    <ExportButton
                      onExport={onExportData}
                      label={L.exportAction}
                      errorText={L.exportError}
                      announce={announce}
                    />
                  </DangerRow>
                )}
                <DangerRow title={L.deleteTitle} description={L.deleteDescription}>
                  <ConfirmDialog
                    trigger={
                      <Button variant="danger" leading={<TrashIcon />}>
                        {L.deleteAction}
                      </Button>
                    }
                    tone="danger"
                    title={L.deleteConfirmTitle}
                    description={L.deleteConfirmDescription}
                    confirmLabel={L.deleteConfirm}
                    confirmationText={saved.username || "delete"}
                    onConfirm={onDeleteAccount}
                    labels={L.deleteDialog}
                  />
                </DangerRow>
              </Section>
            );
          })}

          <SaveBar
            count={changed.length}
            visible={dirty || status === "saved"}
            status={status}
            errorCount={submitted ? errorCount : 0}
            L={L}
            onDiscard={discard}
            onInputKind={(kind) => {
              barInput.current = kind;
            }}
            shortcut={toAriaKeyShortcuts("mod+s", platform)}
          />
        </form>
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
