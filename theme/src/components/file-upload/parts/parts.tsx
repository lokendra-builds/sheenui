"use client";

import { CheckIcon, CloseIcon, TrashIcon } from "../../status-icons/icons";
import { useEffect, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import { motion, useIsPresent } from "motion/react";

import { cn } from "../../../lib/cn";
import { duration, ease, spring } from "../../../motion/tokens";
import { fileExtension, fileKind, formatBytes, type FileKind } from "../file-utils";
import { type FileUploadItem, type FileUploadLabels } from "./model";

/* ---------- one file ---------- */

/** The tint classes of each file kind. @internal */
export const kindTint: Record<FileKind, string> = {
  image: "bg-sheen-accent-soft text-sheen-accent",
  video: "bg-sheen-accent-soft text-sheen-accent",
  audio: "bg-sheen-accent-soft text-sheen-accent",
  pdf: "bg-sheen-danger-soft text-sheen-danger-text",
  archive: "bg-sheen-warning-soft text-sheen-warning-text",
  sheet: "bg-sheen-success-soft text-sheen-success-text",
  doc: "bg-sheen-accent-soft text-sheen-accent",
  code: "bg-sheen-hover text-sheen-fg",
  text: "bg-sheen-hover text-sheen-fg",
  file: "bg-sheen-hover text-sheen-fg",
};

/** An object URL for `file` (an image thumbnail), created after commit and revoked when the file leaves or the row unmounts. */
export function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file || typeof URL === "undefined") return;
    const created = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- an object URL is a resource: it cannot be created while rendering (it would leak under StrictMode), so it is created in the commit and revoked in this cleanup
    setUrl(created);
    return () => {
      URL.revokeObjectURL(created);
      setUrl(null);
    };
  }, [file]);
  return url;
}

/** One queued file with progress, status and actions. @internal */
export function FileRow({
  ref,
  item,
  previews,
  locale,
  labels,
  reduced,
  onRemove,
  onRetry,
}: {
  /** AnimatePresence (popLayout) measures and lifts the leaving row through this ref. */
  ref?: Ref<HTMLLIElement>;
  item: FileUploadItem;
  previews: boolean;
  locale?: string;
  labels: FileUploadLabels;
  reduced: boolean;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const { file, status, progress } = item;
  const kind = fileKind(file);
  const ext = fileExtension(file.name);
  const size = formatBytes(file.size, locale);
  const present = useIsPresent();
  const preview = useObjectUrl(previews && kind === "image" ? file : null);

  const statusText =
    status === "uploading"
      ? labels.uploading(progress)
      : status === "done"
        ? labels.done
        : status === "error"
          ? (item.error ?? labels.failed)
          : null;

  return (
    <motion.li
      ref={ref}
      data-slot="file-upload-row"
      data-file-row=""
      data-leaving={present ? undefined : ""}
      inert={!present}
      layout={reduced ? false : "position"}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: reduced ? { duration: duration.fast } : spring.gentle }}
      exit={
        reduced
          ? { opacity: 0, transition: { duration: duration.exit } }
          : { opacity: 0, scale: 0.96, transition: { duration: duration.exit, ease: ease.exit } }
      }
      transition={{ layout: spring.snappy }}
      className={cn(
        "glass-1 flex min-w-0 items-center gap-3 rounded-sheen-lg p-2.5 pe-2",
        status === "error" && "border-sheen-danger-text/30",
      )}
    >
      {/* Thumbnail or kind tile: decorative, the name carries the meaning. */}
      <span
        aria-hidden
        className={cn(
          "relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-sheen-md",
          !preview && kindTint[kind],
        )}
      >
        {preview ? (
          <img src={preview} alt="" className="size-full object-cover" draggable={false} />
        ) : (
          <>
            <KindIcon kind={kind} className="size-5" />
            {ext && ext.length <= 4 && (
              <span className="absolute bottom-0.5 text-[0.5625rem] leading-none font-bold tracking-wide uppercase">
                {ext}
              </span>
            )}
          </>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium text-sheen-fg" title={file.name}>
          {file.name}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-sheen-fg-muted tabular-nums">
          <span className="shrink-0">{size}</span>
          {statusText && (
            <>
              <span aria-hidden>·</span>
              <span
                className={cn(
                  "truncate",
                  status === "error" && "font-medium text-sheen-danger-text",
                  status === "done" && "text-sheen-success-text",
                )}
              >
                {statusText}
              </span>
            </>
          )}
        </span>
        {status === "uploading" && (
          <span
            role="progressbar"
            aria-label={labels.progress(file.name)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="relative mt-0.5 h-1 w-full overflow-hidden rounded-sheen-full bg-sheen-hover"
          >
            {/* A full-width bar slid into place (translate, not scale, so its rounded end never squashes). */}
            <span
              className={cn(
                "sheen-fill absolute inset-0 rounded-sheen-full [background-image:var(--sheen-accent-fill)]",
                "[transform:translateX(calc((var(--p)-100)*1%))] rtl:[transform:translateX(calc((100-var(--p))*1%))]",
                "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-slow) motion-ok:ease-sheen-out",
              )}
              style={{ "--p": progress } as CSSProperties}
            />
          </span>
        )}
      </span>

      {status === "done" && (
        <motion.span
          aria-hidden
          initial={reduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: reduced ? { duration: duration.fast } : spring.bouncy }}
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sheen-success-soft text-sheen-success-text"
        >
          <CheckIcon className="size-3.5" />
        </motion.span>
      )}

      <span className="flex shrink-0 items-center">
        {status === "error" && (
          <RowButton label={labels.retry(file.name)} onClick={onRetry}>
            <RetryIcon className="size-4" />
          </RowButton>
        )}
        <RowButton
          label={status === "uploading" ? labels.cancel(file.name) : labels.remove(file.name)}
          onClick={onRemove}
          remove
        >
          {status === "uploading" ? <CloseIcon className="size-4" /> : <TrashIcon className="size-4" />}
        </RowButton>
      </span>
    </motion.li>
  );
}

/** A small icon button in a file row. @internal */
export function RowButton({
  label,
  onClick,
  remove,
  children,
}: {
  label: string;
  onClick: () => void;
  remove?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-file-remove={remove ? "" : undefined}
      onClick={onClick}
      className={cn(
        "relative flex size-9 items-center justify-center rounded-sheen-sm text-sheen-fg-muted",
        "transition-[background-color,color,scale] duration-(--sheen-duration-fast) ease-sheen-out hover:bg-sheen-hover hover:text-sheen-fg motion-ok:active:scale-90",
        "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus",
        "any-pointer-coarse:size-11",
      )}
    >
      {children}
    </button>
  );
}

/* ---------- icons ---------- */

/** The props the file upload icons take. @internal */
export type IconProps = { className?: string };
/** The shared SVG stroke attributes of the file upload icons. @internal */
export const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** The upload icon of the drop zone. @internal */
export function UploadIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M7 18a4.5 4.5 0 0 1-.9-8.9A6 6 0 0 1 17.7 8 4.5 4.5 0 0 1 17 18" />
      <path d="M12 12v8M8.5 15.5 12 12l3.5 3.5" />
    </svg>
  );
}

/** The icon of a file kind. @internal */
export function KindIcon({ kind, className }: { kind: FileKind } & IconProps) {
  const paths: Record<FileKind, ReactNode> = {
    image: (
      <>
        <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m20.5 16-4.5-4.5-8 8" />
      </>
    ),
    video: (
      <>
        <rect x="3" y="6" width="13" height="12" rx="2.5" />
        <path d="m16 10.5 5-3v9l-5-3" />
      </>
    ),
    audio: (
      <>
        <path d="M9 17V5l10-2v12" />
        <circle cx="6.5" cy="17" r="2.5" />
        <circle cx="16.5" cy="15" r="2.5" />
      </>
    ),
    pdf: <DocShape extra={<path d="M8.5 13h7M8.5 16.5h4.5" />} />,
    archive: <DocShape extra={<path d="M11 7h2M11 10h2M11 13h2M10.5 16h3v2.5h-3z" />} />,
    sheet: <DocShape extra={<path d="M8 12h8M8 15.5h8M12 12v6" />} />,
    doc: <DocShape extra={<path d="M8.5 12h7M8.5 15h7M8.5 18h4" />} />,
    code: <DocShape extra={<path d="m10 12.5-2 2 2 2M14 12.5l2 2-2 2" />} />,
    text: <DocShape extra={<path d="M8.5 12h7M8.5 15h7" />} />,
    file: <DocShape />,
  };
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn(className, "-translate-y-1")} {...stroke}>
      {paths[kind]}
    </svg>
  );
}

/** The page outline shared by the document icons. @internal */
export function DocShape({ extra }: { extra?: ReactNode }) {
  return (
    <>
      <path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8z" />
      <path d="M14 3v5h5" />
      {extra}
    </>
  );
}

/** The retry icon of a failed upload. @internal */
export function RetryIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}
