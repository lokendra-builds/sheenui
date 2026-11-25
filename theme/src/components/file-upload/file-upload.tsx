"use client";

import { AlertIcon } from "../status-icons/icons";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { joinIds, useMergedRef } from "../../lib/form";
import { duration, ease, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { describeAccept, formatBytes, isSameFile, matchesAccept, mimeRejected } from "./file-utils";
import { useControllable } from "../../hooks/use-controllable";
import { useLatest } from "../../hooks/use-latest";

import {
  type FileUploadItem,
  type FileRejectionReason,
  type FileRejection,
  defaultFileUploadLabels,
  type FileUploadProps,
  list,
  newId,
  type DragState,
} from "./parts/model";
import { FileRow, UploadIcon } from "./parts/parts";

export {
  type FileUploadStatus,
  type FileUploadItem,
  type FileRejectionReason,
  type FileRejection,
  type FileUploadHandler,
  type FileUploadLabels,
  defaultFileUploadLabels,
  type FileUploadActions,
  type FileUploadProps,
  toFileUploadItems,
} from "./parts/model";
/**
 * File upload: a glass dropzone plus a live file list. Use it for attachments, avatars and imports; use `Input type="file"` only for a bare native control.
 *
 * - Drop files, click (or press Enter / Space) to browse, or paste while it's focused.
 * - `accept`, `maxSize`, `minSize` and `maxFiles` are checked on drop; rejected files are listed with the reason and announced (`onFilesRejected`). While dragging, the zone already glows red when it can tell (from the MIME type) that a file won't be accepted.
 * - Pass `upload(file, { onProgress, signal })` and each file gets its own progress bar, cancel (aborts the signal), retry on failure and a done tick. Without it, files are just collected (read them from `onValueChange`, or submit them with `name`).
 * - Images get thumbnails (`previews`); everything else a tinted icon with its extension.
 * - Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`; `actionsRef` gives you `addFiles`, `browse` and `clear`; `variant="compact"` is one row for dense forms; `labels` translates every string; `error` shows a message from outside.
 *
 * Keyboard: the zone is a button: Tab focuses it, Enter or Space opens the file dialog, Ctrl/Cmd+V pastes files; each row has Cancel / Retry / Remove buttons as normal tab stops.
 * Accessibility: the zone is named by `label` and its title, described by the hint and any error; additions, removals and upload results are announced politely; rows have named progress bars (`role="progressbar"`); targets are 44px on touch screens.
 * Glass and motion: a `glass-1` zone. The zone's glow fades in and the icon lifts while you drag; rows spring in and the list closes up smoothly when one leaves; progress slides (transform only). Reduced motion: fades and instant jumps, no movement.
 *
 * @example
 * ```tsx
 * import { FileUpload } from "@sheenui/theme";
 *
 * async function send(file: File, onProgress: (fraction: number) => void, signal: AbortSignal) {
 *   await fetch("/api/upload", { method: "POST", body: file, signal });
 *   onProgress(1);
 * }
 *
 * export function Example() {
 *   return (
 *     <FileUpload
 *       label="Attachments"
 *       accept="image/*,.pdf"
 *       maxSize={5 * 1024 * 1024}
 *       maxFiles={3}
 *       upload={async (file, { onProgress, signal }) => { await send(file, onProgress, signal); }}
 *     />
 *   );
 * }
 * ```
 *
 * @see /forms/file-upload
 */
export function FileUpload({
  value,
  defaultValue = [],
  onValueChange,
  upload,
  onFilesAccepted,
  onFilesRejected,
  accept,
  maxSize,
  minSize,
  maxFiles,
  multiple = true,
  capture,
  previews = true,
  variant = "default",
  label,
  description,
  error,
  disabled = false,
  name,
  locale,
  actionsRef,
  preventDropOnDocument = true,
  labels: labelsProp,
  className,
  ref,
  onBlur,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: FileUploadProps) {
  const labels = { ...defaultFileUploadLabels, ...labelsProp };
  const [items, setItems] = useControllable(value, defaultValue, onValueChange);
  const [drag, setDrag] = useState<DragState>(null);
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const reduced = useSheenReducedMotion();

  const id = useId();
  const labelId = `${id}-label`;
  const titleId = `${id}-title`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const mergedZoneRef = useMergedRef(zoneRef, ref);
  const listRef = useRef<HTMLUListElement>(null);
  const dragDepth = useRef(0);
  const controllers = useRef(new Map<string, AbortController>());
  const uploadRef = useLatest(upload);

  const single = !multiple || maxFiles === 1;
  const compact = variant === "compact";

  const announce = (text: string) => {
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(text));
  };

  useEffect(() => {
    const running = controllers.current;
    return () => {
      for (const c of running.values()) c.abort();
    };
  }, []);

  // ---- a near miss shouldn't navigate away to the dropped file ----
  useEffect(() => {
    if (!preventDropOnDocument) return;
    const guard = (event: globalThis.DragEvent) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      const target = event.target as Node | null;
      // Leave other drop targets (inputs, other dropzones) alone.
      if (target instanceof HTMLInputElement || (target instanceof Element && target.closest("[data-sheen-dropzone]")))
        return;
      event.preventDefault();
      if (event.type === "dragover") event.dataTransfer.dropEffect = "none";
    };
    document.addEventListener("dragover", guard);
    document.addEventListener("drop", guard);
    return () => {
      document.removeEventListener("dragover", guard);
      document.removeEventListener("drop", guard);
    };
  }, [preventDropOnDocument]);

  // ---- form submission: mirror the list into the file input ----
  useEffect(() => {
    if (!name || !inputRef.current) return;
    try {
      const dt = new DataTransfer();
      for (const item of items) dt.items.add(item.file);
      inputRef.current.files = dt.files;
    } catch {
      /* very old browsers: the input keeps the last picked files */
    }
  }, [items, name]);

  const patch = useCallback(
    (itemId: string, change: Partial<FileUploadItem>) =>
      setItems((prev) =>
        prev.some((i) => i.id === itemId) ? prev.map((i) => (i.id === itemId ? { ...i, ...change } : i)) : prev,
      ),
    [setItems],
  );

  // `labels` is rebuilt every render: the upload reads the latest strings when it finishes, they never restart it.
  const latestLabelsRef = useLatest(labels);
  const latestAnnounceRef = useLatest(announce);
  const start = useCallback(
    (item: FileUploadItem) => {
      const run = uploadRef.current;
      if (!run) return;
      controllers.current.get(item.id)?.abort();
      const controller = new AbortController();
      controllers.current.set(item.id, controller);
      patch(item.id, { status: "uploading", progress: 0, error: undefined });
      run(item.file, {
        signal: controller.signal,
        onProgress: (percent) => {
          if (controller.signal.aborted) return;
          patch(item.id, { progress: Math.max(0, Math.min(100, Math.round(percent))) });
        },
      }).then(
        () => {
          if (controller.signal.aborted) return;
          controllers.current.delete(item.id);
          patch(item.id, { status: "done", progress: 100 });
          latestAnnounceRef.current(latestLabelsRef.current.uploaded(item.file.name));
        },
        (err: unknown) => {
          if (controller.signal.aborted) return;
          controllers.current.delete(item.id);
          const message = err instanceof Error && err.message ? err.message : latestLabelsRef.current.failed;
          patch(item.id, { status: "error", error: message });
          latestAnnounceRef.current(latestLabelsRef.current.uploadFailed(item.file.name));
        },
      );
    },
    [patch, latestAnnounceRef, latestLabelsRef, uploadRef],
  );

  function addFiles(files: File[]) {
    if (disabled || files.length === 0) return;
    const current = single ? [] : items;
    const accepted: FileUploadItem[] = [];
    const rejected: FileRejection[] = [];
    let slots = single ? 1 : (maxFiles ?? Infinity) - current.length;
    const fmt = (n: number) => formatBytes(n, locale);

    for (const file of files) {
      const reject = (reason: FileRejectionReason, message: string) => rejected.push({ file, reason, message });
      if (!matchesAccept(file, accept)) reject("type", labels.errorType(file.name));
      else if (maxSize !== undefined && file.size > maxSize)
        reject("too-large", labels.errorTooLarge(file.name, fmt(maxSize)));
      else if (minSize !== undefined && file.size < minSize)
        reject("too-small", labels.errorTooSmall(file.name, fmt(minSize)));
      else if ([...current, ...accepted].some((i) => isSameFile(i.file, file)))
        reject("duplicate", labels.errorDuplicate(file.name));
      else if (slots <= 0) reject("too-many", labels.errorTooMany(file.name, single ? 1 : (maxFiles ?? 0)));
      else {
        slots--;
        accepted.push({ id: newId(), file, status: "idle", progress: 0 });
      }
    }

    setRejections(rejected);
    if (rejected.length) onFilesRejected?.(rejected);
    if (accepted.length === 0) return;

    if (single) {
      // A new file replaces the old one: stop its upload first.
      for (const old of items) controllers.current.get(old.id)?.abort();
      controllers.current.clear();
    }
    setItems((prev) => (single ? accepted : [...prev, ...accepted]));
    onFilesAccepted?.(accepted.map((i) => i.file));
    announce(labels.added(accepted.length));
    for (const item of accepted) start(item);
  }

  function remove(item: FileUploadItem) {
    const index = items.findIndex((i) => i.id === item.id);
    controllers.current.get(item.id)?.abort();
    controllers.current.delete(item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    announce(labels.removed(item.file.name));
    // The pressed button leaves with its row: move focus to the next row's button, else the
    // previous one, else the zone (after React commits; leaving rows are skipped).
    requestAnimationFrame(() => {
      const buttons = listRef.current?.querySelectorAll<HTMLElement>(
        "[data-file-row]:not([data-leaving]) [data-file-remove]",
      );
      const target = buttons?.[Math.min(index, buttons.length - 1)] ?? zoneRef.current;
      target?.focus();
    });
  }

  function removeAll(focusZone = true) {
    for (const c of controllers.current.values()) c.abort();
    controllers.current.clear();
    setItems(() => []);
    setRejections([]);
    // The button that was clicked disappears with the list: keep focus somewhere sensible.
    if (focusZone) zoneRef.current?.focus();
  }

  // Latest handlers for actionsRef (they close over this render's state).
  const latestActions = useLatest({ addFiles, browse, removeAll });
  useLayoutEffect(() => {
    if (!actionsRef) return;
    actionsRef.current = {
      addFiles: (files) => latestActions.current.addFiles(files),
      browse: () => latestActions.current.browse(),
      clear: () => latestActions.current.removeAll(false),
    };
    return () => {
      actionsRef.current = null;
    };
  }, [actionsRef, latestActions]);

  // ---- events ----
  const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes("Files");

  function onDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragDepth.current++;
    if (disabled) return;
    const dragged = Array.from(event.dataTransfer.items).filter((i) => i.kind === "file");
    const bad =
      dragged.some((i) => mimeRejected(i.type, accept)) ||
      (single && dragged.length > 1) ||
      (!single && maxFiles !== undefined && dragged.length > maxFiles - items.length);
    setDrag(bad ? "reject" : "accept");
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = disabled ? "none" : "copy";
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDrag(null);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDrag(null);
    addFiles(Array.from(event.dataTransfer.files));
  }

  function browse() {
    if (!disabled) inputRef.current?.click();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      browse();
    }
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    const files = Array.from(event.clipboardData.files);
    if (files.length === 0) return;
    event.preventDefault();
    addFiles(files);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    // Without `name`, clear the input so picking the same file again still fires change.
    if (!name) event.target.value = "";
    addFiles(files);
  }

  // ---- text ----
  const types = describeAccept(accept, { image: labels.images, video: labels.videos, audio: labels.audio });
  const hint = labels.hint({
    types: types.length ? list(types, locale) : null,
    maxSize: maxSize !== undefined ? formatBytes(maxSize, locale) : null,
    maxFiles: single ? 1 : (maxFiles ?? null),
  });
  const totalSize = items.reduce((sum, i) => sum + i.file.size, 0);
  const shownRejections = rejections.slice(0, 3);
  const describedBy = joinIds(ariaDescribedBy, hintId, error && errorId);

  return (
    <div data-slot="file-upload" className={cn("flex w-full min-w-0 flex-col gap-3", className)}>
      {(Boolean(label) || Boolean(description)) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span data-slot="file-upload-label" id={labelId} className="text-sm font-medium text-sheen-fg">
              {label}
            </span>
          )}
          {description && <span className="text-xs text-sheen-fg-muted">{description}</span>}
        </div>
      )}

      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props -- aria-invalid stays (and is tested): the zone is the invalid control; the message is linked through aria-describedby */}
      <div
        ref={mergedZoneRef}
        onBlur={onBlur}
        data-slot="file-upload-dropzone"
        data-sheen-dropzone=""
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        // The limits hint is visible text inside the button, so it belongs in the name (WCAG 2.5.3 Label in Name).
        aria-labelledby={label ? `${labelId} ${titleId} ${hintId}` : `${titleId} ${hintId}`}
        aria-describedby={describedBy}
        aria-invalid={error || ariaInvalid === true || ariaInvalid === "true" ? true : undefined}
        data-drag={drag ?? undefined}
        onClick={browse}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "group/zone glass-1 relative isolate flex w-full cursor-pointer overflow-hidden rounded-sheen-xl border-2 border-dashed border-sheen-accent-border text-center select-none",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          compact
            ? "flex-row items-center gap-3 px-4 py-3 text-start"
            : "flex-col items-center justify-center gap-3 px-6 py-10 sm:py-12",
          "transition-[background-color,border-color] duration-(--sheen-duration-base) ease-sheen-out hover:bg-sheen-hover",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "data-[drag=accept]:border-sheen-accent data-[drag=reject]:border-sheen-danger",
          error && "border-sheen-danger",
          disabled && "cursor-not-allowed opacity-55 hover:bg-transparent",
          "forced-colors:border-[CanvasText] forced-colors:data-[drag=accept]:border-[Highlight]",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={!single}
          capture={capture}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          hidden
          onChange={onInputChange}
        />

        {/* Drag glow: its own layer (opacity + scale only), never the glass zone's wrapper. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 opacity-0 transition-[opacity,scale] duration-(--sheen-duration-slow) ease-sheen-out",
            "bg-[radial-gradient(75%_100%_at_50%_100%,var(--sheen-ring),transparent_70%),radial-gradient(60%_80%_at_50%_0%,var(--sheen-accent-soft),transparent_75%)]",
            "motion-ok:scale-95 group-data-[drag=accept]/zone:opacity-100 motion-ok:group-data-[drag=accept]/zone:scale-100",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-(--sheen-duration-slow) ease-sheen-out",
            "bg-[radial-gradient(80%_100%_at_50%_100%,var(--sheen-danger-soft),transparent_75%)] group-data-[drag=reject]/zone:opacity-100",
          )}
        />

        <span
          aria-hidden
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-sheen-lg bg-sheen-accent-soft text-sheen-accent",
            compact ? "size-10" : "size-14",
            "transition-[translate,scale,background-color,color] duration-(--sheen-duration-snappy) ease-sheen-snappy",
            "motion-ok:group-hover/zone:-translate-y-0.5",
            "motion-ok:group-data-[drag]/zone:-translate-y-1.5 motion-ok:group-data-[drag]/zone:scale-110",
            "group-data-[drag=reject]/zone:bg-sheen-danger-soft group-data-[drag=reject]/zone:text-sheen-danger-text",
          )}
        >
          <UploadIcon className={compact ? "size-5" : "size-7"} />
        </span>

        <span className={cn("flex min-w-0 flex-col gap-1", compact ? "flex-1" : "items-center")}>
          {/* The three titles share one grid cell and cross-fade, so the height never jumps. */}
          <span id={titleId} className="grid text-sm font-medium text-sheen-fg sm:text-base">
            <span
              className={cn(
                "col-start-1 row-start-1 transition-[opacity,visibility] duration-(--sheen-duration-fast)",
                drag && "invisible opacity-0",
              )}
            >
              {labels.title}{" "}
              <span className="font-semibold text-sheen-accent underline decoration-sheen-accent-border underline-offset-4 group-hover/zone:decoration-sheen-accent">
                {labels.browse}
              </span>
            </span>
            {/* Hidden spans use `invisible` (not just opacity-0), so only the visible title is read and counted as visible text. */}
            <span
              className={cn(
                "col-start-1 row-start-1 invisible opacity-0 transition-[opacity,visibility] duration-(--sheen-duration-fast)",
                drag === "accept" && "visible opacity-100",
              )}
            >
              {labels.dragActive}
            </span>
            <span
              className={cn(
                "col-start-1 row-start-1 invisible text-sheen-danger-text opacity-0 transition-[opacity,visibility] duration-(--sheen-duration-fast)",
                drag === "reject" && "visible opacity-100",
              )}
            >
              {labels.dragReject}
            </span>
          </span>
          {/* A real space between the two blocks, so the visible text reads "browse Images" (WCAG 2.5.3 Label in Name compares it to the name). */}{" "}
          <span id={hintId} className="text-xs text-sheen-fg-muted">
            {hint}
          </span>
        </span>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-sheen-danger-text">
          {error}
        </p>
      )}

      {/* Rejections: announced at once (role="alert"). */}
      <div role="alert" className="empty:hidden">
        <AnimatePresence initial={false}>
          {rejections.length > 0 && (
            <motion.div
              key="rejections"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, transition: reduced ? { duration: duration.fast } : spring.snappy }}
              exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }}
              className="flex items-start gap-3 rounded-sheen-lg border border-sheen-danger-text/25 bg-sheen-danger-soft p-3 text-sm text-sheen-danger-text"
            >
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              <ul className="flex min-w-0 flex-1 flex-col gap-1">
                {shownRejections.map((r, i) => (
                  <li key={`${r.file.name}-${i}`} className="min-w-0 [overflow-wrap:anywhere]">
                    <span className="font-semibold">{r.file.name}</span> — {r.message}
                  </li>
                ))}
                {rejections.length > shownRejections.length && (
                  <li>{labels.moreErrors(rejections.length - shownRejections.length)}</li>
                )}
              </ul>
              <button
                type="button"
                onClick={() => setRejections([])}
                className={cn(
                  "relative -my-1 -me-1 shrink-0 rounded-sheen-sm px-2 py-1 text-xs font-semibold",
                  "transition-[background-color] duration-(--sheen-duration-fast) hover:bg-sheen-danger-soft",
                  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus",
                  "any-pointer-coarse:after:absolute any-pointer-coarse:after:-inset-2.5 any-pointer-coarse:after:content-['']",
                )}
              >
                {labels.dismiss}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {!single && (
            <div className="flex items-center justify-between gap-3 px-1 text-xs text-sheen-fg-muted">
              <span className="tabular-nums">{labels.summary(items.length, formatBytes(totalSize, locale))}</span>
              <button
                type="button"
                onClick={() => removeAll()}
                className={cn(
                  "relative rounded-sheen-sm px-2 py-1 font-medium text-sheen-fg-muted",
                  "transition-[background-color,color] duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
                  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus",
                  "any-pointer-coarse:after:absolute any-pointer-coarse:after:-inset-2.5 any-pointer-coarse:after:content-['']",
                )}
              >
                {labels.removeAll}
              </button>
            </div>
          )}
          {/* relative: popLayout lifts a leaving row out of the flow (absolute), so the rest close up at once. */}
          <ul ref={listRef} aria-label={labels.listLabel} className="relative flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((item) => (
                <FileRow
                  key={item.id}
                  item={item}
                  previews={previews}
                  locale={locale}
                  labels={labels}
                  reduced={reduced}
                  onRemove={() => remove(item)}
                  onRetry={() => start(item)}
                />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </div>
  );
}
