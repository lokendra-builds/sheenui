"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import type { HeadingTag } from "../../lib/heading";
import {
  useMotionPreference,
  useReducedTransparency,
  useSheenReducedMotion,
  useTheme,
  type ThemeChoice,
} from "../../hooks/use-preferences";
import { duration, ease, spring } from "../../motion/tokens";
import { Badge } from "../../components/badge/badge";
import { Button } from "../../components/button/button";
import { Switch } from "../../components/switch/switch";
import { SegmentedControl } from "../../components/segmented/segmented";
import { type VerticalNavItem } from "../../components/vertical-nav/vertical-nav";
import { KbdShortcut } from "../../components/kbd/kbd";
import { isPlainLeftClick } from "../../components/navbar/navbar";

import { type SettingsSection, type SettingsNotificationOption, type SettingsPageLabels } from "./model";
import { SunIcon, MoonIcon, MonitorIcon, CameraIcon, DownloadIcon, CheckCircleIcon, LockIcon } from "./icons";
import { initials } from "../../lib/initials";

/** Changed-field count for a nav badge (undefined when nothing changed there). */
export function countFor(section: SettingsSection, changed: string[]) {
  const n = changed.filter((key) =>
    section === "notifications" ? key.startsWith("notifications.") : !key.startsWith("notifications."),
  ).length;
  return n > 0 ? n : undefined;
}

/* ---------- Pieces ---------- */

/** One titled settings section with its description and body. @internal */
export function Section({
  id,
  title,
  description,
  Tag,
  tone,
  aside,
  children,
}: {
  id: string;
  title: string;
  description: string;
  Tag: HeadingTag;
  tone?: "danger";
  aside?: ReactNode;
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      role="group"
      aria-labelledby={headingId}
      className={cn(
        "glass-2 rounded-sheen-xl",
        // Clear the sticky pill strip (narrow) or the top offset (wide) when scrolled to.
        "scroll-mt-[calc(var(--settings-top)+4.5rem)] @3xl/settings:scroll-mt-(--settings-top)",
        tone === "danger" && "border-sheen-danger-text/30",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-sheen-border px-5 py-4 @xl/settings:px-6 @xl/settings:py-5">
        <div className="flex min-w-0 flex-col gap-1">
          <Tag
            id={headingId}
            tabIndex={-1}
            data-slot="settings-section-title"
            className={cn(
              "text-lg font-semibold tracking-tight outline-none",
              tone === "danger" && "text-sheen-danger-text",
            )}
          >
            {title}
          </Tag>
          <p className="text-sm text-pretty text-sheen-fg-muted">{description}</p>
        </div>
        {aside}
      </div>
      <div
        className={cn(
          "flex flex-col gap-5 px-5 py-5 @xl/settings:px-6 @xl/settings:py-6",
          tone === "danger" && "gap-0 py-0 @xl/settings:py-0",
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** The avatar picker: a drop target with preview and remove. @internal */
export function AvatarDrop({
  name,
  src,
  label,
  onClick,
  onFile,
}: {
  name: string;
  src: string | null;
  label: string;
  onClick: () => void;
  onFile: (file: File | undefined) => void;
}) {
  const [over, setOver] = useState(false);
  const reduced = useSheenReducedMotion();
  const [broken, setBroken] = useState<string | null>(null);
  const showImage = src && broken !== src;

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setOver(false);
    onFile(event.dataTransfer.files[0]);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onDragEnter={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      data-over={over || undefined}
      className={cn(
        "group/avatar relative isolate size-20 shrink-0 cursor-pointer rounded-sheen-full",
        "shadow-[0_0_0_3px_var(--sheen-bg),0_0_0_4px_var(--sheen-accent-border),0_12px_32px_-12px_var(--sheen-accent-glow)]",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheen-focus",
        "motion-ok:transition-[scale] motion-ok:duration-(--sheen-duration-snappy) motion-ok:ease-sheen-snappy motion-ok:active:scale-95 motion-ok:data-over:scale-105",
        "data-over:shadow-[0_0_0_3px_var(--sheen-bg),0_0_0_5px_var(--sheen-accent),0_12px_32px_-12px_var(--sheen-accent-glow)]",
        "forced-colors:border forced-colors:border-[ButtonText]",
      )}
    >
      {/* Named from content (not an aria-label): the visible initials are decoration and the name never disagrees with them (WCAG 2.5.3). */}
      <span className="sr-only">{label}</span>
      <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <AnimatePresence initial={false} mode="popLayout">
          {showImage ? (
            <motion.img
              key={src}
              src={src}
              alt=""
              onError={() => setBroken(src)}
              initial={reduced ? false : { scale: 1.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }}
              transition={reduced ? { duration: 0 } : spring.gentle}
              className="size-full object-cover"
            />
          ) : (
            <motion.span
              key="initials"
              aria-hidden
              initial={reduced ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }}
              transition={reduced ? { duration: 0 } : spring.gentle}
              className="sheen-fill flex size-full items-center justify-center text-2xl font-semibold tracking-tight text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]"
            >
              {initials(name) || "?"}
            </motion.span>
          )}
        </AnimatePresence>
        {/* Hover / focus / drag-over: a scrim with a camera, so it reads as "change". */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-sheen-scrim text-sheen-accent-fg opacity-0",
            "transition-opacity duration-(--sheen-duration-fast) group-hover/avatar:opacity-100 group-focus-visible/avatar:opacity-100 group-data-over/avatar:opacity-100",
            "forced-colors:hidden",
          )}
        >
          <CameraIcon className="size-6" />
        </span>
      </span>
      {/* Small camera chip, always visible: touch screens have no hover. */}
      <span
        aria-hidden
        className="sheen-fill absolute -end-0.5 -bottom-0.5 flex size-7 items-center justify-center rounded-sheen-full text-sheen-accent-fg [background-image:var(--sheen-accent-fill)] shadow-[0_0_0_3px_var(--sheen-bg)]"
      >
        <CameraIcon className="size-3.5" strokeWidth="2" />
      </span>
    </button>
  );
}

/** The grid of notification channel switches. @internal */
export function NotificationSwitches({
  options,
  values,
  onChange,
  alwaysOn,
  GroupTag,
}: {
  options: SettingsNotificationOption[];
  values: Record<string, boolean>;
  onChange: (id: string, on: boolean) => void;
  alwaysOn: string;
  GroupTag: HeadingTag;
}) {
  const uid = useId();
  const groups: { name: string | undefined; options: SettingsNotificationOption[] }[] = [];
  for (const option of options) {
    const group = groups.find((g) => g.name === option.group);
    if (group) group.options.push(option);
    else groups.push({ name: option.group, options: [option] });
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group, gi) => {
        const headingId = `${uid}-g${gi}`;
        return (
          <div
            key={group.name ?? gi}
            role="group"
            aria-labelledby={group.name ? headingId : undefined}
            className="flex flex-col"
          >
            {group.name && (
              <GroupTag
                id={headingId}
                className="mb-1 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-subtle uppercase"
              >
                {group.name}
              </GroupTag>
            )}
            <ul className="flex flex-col divide-y divide-sheen-border">
              {group.options.map((option) => {
                const labelId = `${uid}-${option.id}`;
                const descId = `${labelId}-d`;
                return (
                  <li key={option.id}>
                    {/* The whole row is the click target; the switch is named by its title only. */}
                    <label
                      className={cn(
                        "flex items-center justify-between gap-4 py-3.5",
                        option.locked ? "cursor-not-allowed" : "cursor-pointer",
                      )}
                    >
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span id={labelId} className="flex flex-wrap items-center gap-2 text-sm font-medium">
                          {option.label}
                          {option.locked && (
                            <Badge className="h-5 gap-1 px-2 text-2xs">
                              <LockIcon className="size-3" />
                              {alwaysOn}
                            </Badge>
                          )}
                        </span>
                        {option.description && (
                          <span id={descId} className="text-xs text-pretty text-sheen-fg-muted">
                            {option.description}
                          </span>
                        )}
                      </span>
                      <Switch
                        checked={option.locked ? true : Boolean(values[option.id])}
                        onCheckedChange={(on) => onChange(option.id, on)}
                        disabled={option.locked}
                        aria-labelledby={labelId}
                        aria-describedby={option.description ? descId : undefined}
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** The appearance section: theme, density and accent choices. @internal */
export function AppearanceSettings({ L }: { L: SettingsPageLabels }) {
  const { theme, setTheme } = useTheme();
  const [motionReduced, setMotionReduced] = useMotionPreference();
  const [transparencyReduced, setTransparencyReduced] = useReducedTransparency();
  const uid = useId();

  const rows: { id: string; label: string; hint: string; checked: boolean; onChange: (on: boolean) => void }[] = [
    {
      id: "motion",
      label: L.reduceMotion,
      hint: L.reduceMotionHint,
      checked: motionReduced,
      onChange: setMotionReduced,
    },
    {
      id: "transparency",
      label: L.reduceTransparency,
      hint: L.reduceTransparencyHint,
      checked: transparencyReduced,
      onChange: setTransparencyReduced,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-3 @xl/settings:flex-row @xl/settings:items-center @xl/settings:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p id={`${uid}-theme`} className="text-sm font-medium">
            {L.theme}
          </p>
          <p id={`${uid}-theme-hint`} className="text-xs text-sheen-fg-muted">
            {L.themeHint}
          </p>
        </div>
        <SegmentedControl
          aria-labelledby={`${uid}-theme`}
          value={theme}
          onValueChange={(value) => setTheme(value as ThemeChoice)}
          items={[
            // Icons step aside when the block is very narrow, so every label fits.
            { value: "light", label: L.light, icon: <SunIcon className="hidden @xs/settings:block" /> },
            { value: "dark", label: L.dark, icon: <MoonIcon className="hidden @xs/settings:block" /> },
            { value: "system", label: L.system, icon: <MonitorIcon className="hidden @xs/settings:block" /> },
          ]}
          className="w-full @xl/settings:w-80"
          fullWidth
        />
      </div>
      <ul className="-my-1 flex flex-col divide-y divide-sheen-border border-t border-sheen-border">
        {rows.map((row) => (
          <li key={row.id}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- the label wraps the Switch component, which renders the real control (role="switch" plus its input) */}
            <label className="flex cursor-pointer items-center justify-between gap-4 py-3.5">
              <span className="flex min-w-0 flex-col gap-0.5">
                <span id={`${uid}-${row.id}`} className="text-sm font-medium">
                  {row.label}
                </span>
                <span id={`${uid}-${row.id}-d`} className="text-xs text-pretty text-sheen-fg-muted">
                  {row.hint}
                </span>
              </span>
              <Switch
                checked={row.checked}
                onCheckedChange={row.onChange}
                aria-labelledby={`${uid}-${row.id}`}
                aria-describedby={`${uid}-${row.id}-d`}
              />
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}

/** One destructive action row with its confirmation dialog. @internal */
export function DangerRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-sheen-border py-5 last:border-b-0 @xl/settings:flex-row @xl/settings:items-center @xl/settings:justify-between @xl/settings:gap-6">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-pretty text-sheen-fg-muted">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** The button that exports the user's data. @internal */
export function ExportButton({
  onExport,
  label,
  errorText,
  announce,
}: {
  onExport: () => void | Promise<void>;
  label: string;
  /** Spoken (polite live region) when the export promise rejects. */
  errorText: string;
  announce: (text: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="glass"
      leading={<DownloadIcon />}
      loading={busy}
      onClick={async () => {
        const result = onExport();
        if (!(result instanceof Promise)) return;
        setBusy(true);
        try {
          await result;
        } catch {
          // The caller's promise failed: say so instead of leaking an unhandled rejection from the click handler.
          announce(errorText);
        } finally {
          setBusy(false);
        }
      }}
    >
      {label}
    </Button>
  );
}

/* ---------- Narrow navigation: a sticky strip of pills ---------- */

/** The section navigation as a row of pills. @internal */
export function PillNav({
  items,
  value,
  label,
  onSelect,
  instant,
  className,
}: {
  items: (VerticalNavItem & { value: SettingsSection })[];
  value: SettingsSection;
  label: string;
  onSelect: (section: SettingsSection) => void;
  /** Scroll the strip without smoothing (another smooth scroll is running). */
  instant: boolean;
  className?: string;
}) {
  const reduced = useSheenReducedMotion();
  const pillId = useId();
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  // Keep the active pill in view (scrolling the strip only, never the page).
  useEffect(() => {
    const scroller = scrollerRef.current;
    const pill = scroller?.querySelector<HTMLElement>("[aria-current='location']");
    // Hidden (wide layout) or nothing to scroll: leave it alone.
    if (!scroller || !pill || scroller.clientWidth === 0 || scroller.scrollWidth <= scroller.clientWidth) return;
    const left = pill.offsetLeft - 24;
    const right = pill.offsetLeft + pill.offsetWidth + 24 - scroller.clientWidth;
    const wanted = scroller.scrollLeft > left ? left : scroller.scrollLeft < right ? right : null;
    if (wanted === null) return;
    const target = Math.min(scroller.scrollWidth - scroller.clientWidth, Math.max(0, wanted));
    if (Math.abs(target - scroller.scrollLeft) < 1) return;
    scroller.scrollTo({ left: target, behavior: reduced || instant ? "auto" : "smooth" });
  }, [value, reduced, instant]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const next = { left: scroller.scrollLeft > 1, right: scroller.scrollLeft < max - 1 };
      setFade((f) => (f.left === next.left && f.right === next.right ? f : next));
    };
    measure();
    scroller.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => {
      scroller.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, []);

  return (
    // The glass is this outer track; the edge fade (a mask) sits on the scroller inside it, never on the glass.
    <div role="group" aria-label={label} className={cn("glass-1 min-w-0 rounded-sheen-full p-1", className)}>
      <ul
        ref={scrollerRef}
        style={
          {
            "--fade-l": fade.left ? "1.5rem" : "0px",
            "--fade-r": fade.right ? "1.5rem" : "0px",
          } as CSSProperties
        }
        className={cn(
          "flex gap-1 overflow-x-auto overscroll-x-contain rounded-[inherit] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // Phone width: the pills would not fit in one row, and a scrolling strip shows the last label cut in half under the
          // fade. Two equal columns instead: every label whole, nothing to scroll.
          "@max-md/settings:grid @max-md/settings:grid-cols-2 @max-md/settings:overflow-visible",
          "[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-l),#000_calc(100%_-_var(--fade-r)),transparent)]",
          // Room for focus rings inside the clip.
          "p-0.5",
        )}
      >
        {items.map((item) => {
          const current = item.value === value;
          return (
            <li key={item.value} className="shrink-0 @max-md/settings:min-w-0">
              <a
                href={item.href}
                aria-current={current ? "location" : undefined}
                onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                  if (!isPlainLeftClick(event)) return;
                  event.preventDefault();
                  onSelect(item.value);
                }}
                className={cn(
                  "relative isolate flex h-9 items-center gap-2 rounded-sheen-full px-3.5 text-sm font-medium whitespace-nowrap @max-md/settings:justify-center",
                  "touch-manipulation [-webkit-tap-highlight-color:transparent] any-pointer-coarse:h-11",
                  "transition-colors duration-(--sheen-duration-fast)",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
                  current ? "text-sheen-fg" : "text-sheen-fg-muted hover:text-sheen-fg",
                  "forced-colors:aria-[current=location]:underline forced-colors:aria-[current=location]:decoration-2 forced-colors:aria-[current=location]:underline-offset-4",
                )}
              >
                {current && (
                  <motion.span
                    aria-hidden
                    layoutId={reduced ? undefined : pillId}
                    transition={spring.snappy}
                    className="absolute inset-0 -z-10 rounded-[inherit] bg-sheen-indicator shadow-(--sheen-indicator-shadow)"
                  />
                )}
                <span className={cn("flex", current && "text-sheen-accent")}>{item.icon}</span>
                {item.label}
                {item.badge !== undefined && (
                  <span className="rounded-sheen-full bg-sheen-surface/90 [background-image:linear-gradient(var(--sheen-accent-soft),var(--sheen-accent-soft))] px-1.5 text-2xs font-semibold text-sheen-accent tabular-nums forced-colors:border forced-colors:border-[CanvasText]">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Save bar ---------- */

/** The sticky bar that offers to save or discard pending changes. @internal */
export function SaveBar({
  count,
  visible,
  status,
  errorCount,
  L,
  onDiscard,
  onInputKind,
  shortcut,
}: {
  count: number;
  visible: boolean;
  status: "idle" | "saving" | "saved" | "error";
  errorCount: number;
  L: SettingsPageLabels;
  onDiscard: () => void;
  /** How the bar is being used (decides where focus goes when its buttons leave). */
  onInputKind: (kind: "keyboard" | "mouse" | "touch") => void;
  shortcut: string;
}) {
  const reduced = useSheenReducedMotion();
  const saved = status === "saved";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="save-bar"
          data-slot="settings-save-bar"
          role="group"
          aria-label={saved ? L.saved : L.unsaved(count)}
          // This IS the glass element, so it may fade: it springs up, then leaves quicker and never overshoots.
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: reduced ? { duration: duration.fast } : spring.gentle }}
          exit={{ opacity: 0, y: reduced ? 0 : 16, transition: { duration: duration.exit, ease: ease.exit } }}
          onPointerDown={(event) => onInputKind(event.pointerType === "mouse" ? "mouse" : "touch")}
          onKeyDown={() => onInputKind("keyboard")}
          className={cn(
            "glass-3 sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex items-center gap-3 rounded-sheen-xl py-2.5 ps-4 pe-2.5",
            "shadow-[var(--sheen-glass-rim),0_24px_48px_-16px_var(--sheen-shadow-far)]",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5 text-sm">
            {saved ? (
              <motion.span
                key="saved"
                initial={reduced ? false : { scale: 0.6, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={spring.bouncy}
                className="flex text-sheen-success-text"
              >
                <CheckCircleIcon className="size-5" />
              </motion.span>
            ) : (
              <span aria-hidden className={cn("relative flex size-2 shrink-0", status === "error" && "hidden")}>
                <span
                  className="absolute inset-0 rounded-full bg-sheen-warning opacity-60 motion-ok:animate-ping"
                  style={{ animationIterationCount: 3 }}
                />
                <span className="relative size-2 rounded-full bg-sheen-warning" />
              </span>
            )}
            <p
              className={cn(
                "min-w-0 font-medium @xl/settings:whitespace-nowrap",
                status === "error" ? "text-sheen-danger-text" : saved ? "text-sheen-success-text" : "text-sheen-fg",
              )}
            >
              {saved ? (
                L.saved
              ) : status === "error" ? (
                <span role="alert">{L.saveError}</span>
              ) : errorCount > 0 ? (
                <span className="text-sheen-danger-text">{L.fixErrors(errorCount)}</span>
              ) : (
                <>
                  <span className="whitespace-nowrap @xl/settings:hidden">
                    <Count value={count} reduced={reduced}>
                      {L.unsavedShort(count)}
                    </Count>
                  </span>
                  <span className="hidden @xl/settings:inline">
                    <Count value={count} reduced={reduced}>
                      {L.unsaved(count)}
                    </Count>
                  </span>
                </>
              )}
            </p>
          </div>
          {!saved && (
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (status !== "saving") onDiscard();
                }}
                // aria-disabled, not disabled: if focus is here when ⌘S starts a save, it stays here.
                aria-disabled={status === "saving" || undefined}
                data-unavailable={status === "saving" ? "" : undefined}
                className="any-pointer-coarse:h-10 data-unavailable:pointer-events-none data-unavailable:opacity-55"
              >
                {L.discard}
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={status === "saving"}
                aria-keyshortcuts={shortcut}
                className="any-pointer-coarse:h-10"
              >
                {status === "saving" ? (
                  L.saving
                ) : (
                  <>
                    <span className="@md/settings:hidden">{L.saveShort}</span>
                    <span className="hidden @md/settings:inline">{L.save}</span>
                  </>
                )}
                <KbdShortcut
                  keys="mod+s"
                  announce={false}
                  className="hidden opacity-80 @2xl/settings:inline-flex [&_kbd]:border-sheen-accent-fg/30 [&_kbd]:bg-sheen-accent-fg/15 [&_kbd]:text-sheen-accent-fg"
                />
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The changed-count text, popping briefly when the number changes. */
export function Count({ value, reduced, children }: { value: number; reduced: boolean; children: ReactNode }) {
  return (
    <motion.span
      key={value}
      initial={reduced ? false : { y: -4 }}
      animate={{ y: 0 }}
      transition={spring.bouncy}
      className="inline-block tabular-nums"
    >
      {children}
    </motion.span>
  );
}
