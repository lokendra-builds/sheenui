import { type ReactNode, type RefObject } from "react";

import { type FormControlProps } from "../../../lib/form";

/** Where a file is in its life: collected (`idle`), `uploading`, `done` or `error`. */
export type FileUploadStatus = "idle" | "uploading" | "done" | "error";

/**
 * One file in the `FileUpload` list: its id, the browser `File`, status, 0-100 progress and an error
 * message.
 */
export type FileUploadItem = {
  /** Stable id for keys and callbacks. */
  id: string;
  /** The browser `File`. */
  file: File;
  /** "idle" (collected), "uploading", "done" or "error". */
  status: FileUploadStatus;
  /** 0–100 while uploading. */
  progress: number;
  /** Shown when status is "error". */
  error?: string;
};

/** Why a dropped file was not added: wrong type, too large, too small, too many files or a duplicate. */
export type FileRejectionReason = "type" | "too-large" | "too-small" | "too-many" | "duplicate";

/** A dropped file that was not accepted, with the reason and ready-to-show text from `labels`. */
export type FileRejection = {
  /** The file that was not accepted. */
  file: File;
  /** Why: wrong type, too large, too small, too many files or a duplicate. */
  reason: FileRejectionReason;
  /** Ready-to-show text for the reason (from `labels`). */
  message: string;
};

/**
 * Your upload function: gets one `File`, reports progress with `onProgress(percent)`, stops when
 * `signal` aborts, resolves on success and rejects to mark the file as failed.
 */
export type FileUploadHandler = (
  file: File,
  options: { onProgress: (percent: number) => void; signal: AbortSignal },
) => Promise<void>;

/**
 * Every user-facing string of `FileUpload` (accessible names, announcements, placeholders); pass a
 * partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type FileUploadLabels = {
  /** Main line of the zone, before the browse word. */
  title: string;
  /** The accent "browse" word that ends the title. */
  browse: string;
  /** Title while dragging acceptable files. */
  dragActive: string;
  /** Title while dragging files that won't be accepted. */
  dragReject: string;
  /** Second line. `types` is a ready-made list ("PNG, JPG or PDF"), `maxSize` a formatted size. */
  hint: (info: { types: string | null; maxSize: string | null; maxFiles: number | null }) => string;
  /** Word for "image/*" in the hint. */
  images: string;
  /** Word for "video/*" in the hint. */
  videos: string;
  /** Word for "audio/*" in the hint. */
  audio: string;
  /** Accessible name of the file list. */
  listLabel: string;
  /** Header above the list, e.g. "3 files · 4.2 MB". */
  summary: (count: number, size: string) => string;
  /** The button that clears the list. */
  removeAll: string;
  /** Accessible name of a row's remove button. */
  remove: (name: string) => string;
  /** Accessible name of a row's cancel-upload button. */
  cancel: (name: string) => string;
  /** Accessible name of a row's retry button. */
  retry: (name: string) => string;
  /** Status text while a file uploads. */
  uploading: (percent: number) => string;
  /** Status text of a finished upload. */
  done: string;
  /** Status text of a failed upload. */
  failed: string;
  /** Accessible name of a file's progress bar. */
  progress: (name: string) => string;
  /** Rejection text: the file type is not accepted. */
  errorType: (name: string) => string;
  /** Rejection text: the file is larger than `maxSize`. */
  errorTooLarge: (name: string, max: string) => string;
  /** Rejection text: the file is smaller than `minSize`. */
  errorTooSmall: (name: string, min: string) => string;
  /** Rejection text: more files than `maxFiles`. */
  errorTooMany: (name: string, max: number) => string;
  /** Rejection text: the same file was added twice. */
  errorDuplicate: (name: string) => string;
  /** Shown when more rejections were folded away. */
  moreErrors: (count: number) => string;
  /** The button that dismisses the rejection list. */
  dismiss: string;
  /** Announced (polite) after files are added. */
  added: (count: number) => string;
  /** Announced (polite) after a file is removed. */
  removed: (name: string) => string;
  /** Announced (polite) after a file finishes uploading. */
  uploaded: (name: string) => string;
  /** Announced (polite) after an upload fails. */
  uploadFailed: (name: string) => string;
};

/** Joins items into a localised list. @internal */
export const list = (items: string[], locale?: string) => {
  try {
    return new Intl.ListFormat(locale, { type: "disjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
};

/**
 * Default English strings of `FileUploadLabels`; spread it and override single keys to reword. Plain
 * data with no DOM access: safe to read while prerendering. The module is `"use client"`, so a React
 * Server Component receives a client reference instead of the object: read it from a client component.
 */
export const defaultFileUploadLabels: FileUploadLabels = {
  title: "Drop files here, or",
  browse: "browse",
  dragActive: "Drop to add your files",
  dragReject: "Some of these files can’t be added",
  hint: ({ types, maxSize, maxFiles }) =>
    [types, maxSize && `up to ${maxSize}`, maxFiles && maxFiles > 1 && `${maxFiles} files max`]
      .filter(Boolean)
      .join(" · ") || "Any file type",
  images: "Images",
  videos: "Videos",
  audio: "Audio",
  listLabel: "Selected files",
  summary: (count, size) => `${count} ${count === 1 ? "file" : "files"} · ${size}`,
  removeAll: "Remove all",
  remove: (name) => `Remove ${name}`,
  cancel: (name) => `Cancel upload of ${name}`,
  retry: (name) => `Retry upload of ${name}`,
  uploading: (percent) => `Uploading… ${percent}%`,
  done: "Uploaded",
  failed: "Upload failed",
  progress: (name) => `Uploading ${name}`,
  errorType: () => "This file type isn’t accepted.",
  errorTooLarge: (_, max) => `Larger than ${max}.`,
  errorTooSmall: (_, min) => `Smaller than ${min}.`,
  errorTooMany: (_, max) => `Only ${max} ${max === 1 ? "file" : "files"} allowed.`,
  errorDuplicate: () => "Already added.",
  moreErrors: (count) => `and ${count} more`,
  dismiss: "Dismiss",
  added: (count) => `${count} ${count === 1 ? "file" : "files"} added`,
  removed: (name) => `${name} removed`,
  uploaded: (name) => `${name} uploaded`,
  uploadFailed: (name) => `${name} failed to upload`,
};

/** Imperative actions, e.g. to add files pasted anywhere on the page. */
export type FileUploadActions = {
  /** Validate and add files, exactly as if they were dropped. */
  addFiles: (files: File[]) => void;
  /** Open the system file dialog. */
  browse: () => void;
  /** Remove every file (and cancel uploads). */
  clear: () => void;
};

/** Props of `FileUpload`; each option is documented on its field. */
export type FileUploadProps = Omit<FormControlProps<HTMLDivElement>, "required"> & {
  /** The file list (controlled). Use `toFileUploadItems(files)` to wrap existing `File`s. */
  value?: FileUploadItem[];
  /** Sets the starting list when uncontrolled. */
  defaultValue?: FileUploadItem[];
  /** Called with the new list whenever files are added, removed or their upload state changes. */
  onValueChange?: (items: FileUploadItem[]) => void;
  /** Uploads one file. Report progress (0–100) and stop when the signal aborts. Throw to fail. */
  upload?: FileUploadHandler;
  /** Called with the files that passed validation. */
  onFilesAccepted?: (files: File[]) => void;
  /** Called with the files that didn't, and why. */
  onFilesRejected?: (rejections: FileRejection[]) => void;
  /** Like the input's accept: "image/*,.pdf". */
  accept?: string;
  /** Sets the largest file size accepted, in bytes. */
  maxSize?: number;
  /** Sets the smallest file size accepted, in bytes. */
  minSize?: number;
  /** Most files at once. With 1 (or `multiple={false}`), a new file replaces the old one. */
  maxFiles?: number;
  /** Allows adding several files at once. Default true. */
  multiple?: boolean;
  /** Phones: open the camera directly. */
  capture?: "user" | "environment";
  /** Shows a thumbnail for each image file. Default true. */
  previews?: boolean;
  /** "default": tall zone with an icon. "compact": one row, for dense forms. */
  variant?: "default" | "compact";
  /** Text above the zone; part of the zone's accessible name. */
  label?: ReactNode;
  /** Muted helper text under the label. */
  description?: ReactNode;
  /** Error message from outside (e.g. "Add at least one file"). */
  error?: ReactNode;
  /** Disables the drop zone and its browse button. */
  disabled?: boolean;
  /** Submits the files with a form (multipart). */
  name?: string;
  /** Locale for sizes and lists. */
  locale?: string;
  /** Receives an object of imperative actions, `{ addFiles, browse, clear }`. */
  actionsRef?: RefObject<FileUploadActions | null>;
  /** Stop a file dropped just outside the zone from opening in the browser tab. Default true. */
  preventDropOnDocument?: boolean;
  /** Override any UI string (i18n). */
  labels?: Partial<FileUploadLabels>;
  /** Adds extra classes to the outer wrapper. */
  className?: string;
};

let uid = 0;
/** Creates a unique id for a queued file. @internal */
export const newId = () => `sheen-file-${Date.now().toString(36)}-${(uid++).toString(36)}`;

/** Wrap Files as idle items, e.g. for `defaultValue`. */
export function toFileUploadItems(files: File[]): FileUploadItem[] {
  return files.map((file) => ({ id: newId(), file, status: "idle", progress: 0 }));
}

/** The drag state: none, accepting or rejecting. @internal */
export type DragState = null | "accept" | "reject";
