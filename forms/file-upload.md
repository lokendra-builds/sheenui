Canonical: https://lokendra-builds.github.io/sheenui/forms/file-upload

# React File Upload: Drag & Drop with Progress

URL: https://lokendra-builds.github.io/sheenui/forms/file-upload
Sidebar name: File upload

A glass drag-and-drop file upload for React: validates type, size and count, with thumbnails, per-file progress, cancel and retry. Tailwind CSS v4, MIT.

What it is: A glass drag-and-drop file upload for React that validates files on drop and lists each one with a thumbnail, progress bar, cancel and retry.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/file-upload.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > File upload

Using it in a form? [See the react-hook-form and zod recipe](https://lokendra-builds.github.io/sheenui/docs/forms).

Files to copy from `theme/src/`:

- `components/file-upload/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: file-upload. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { FileUpload } from "@/components/sheenui/file-upload/file-upload";
import { type FileUploadHandler, type FileUploadItem } from "@/components/sheenui/file-upload/parts/model";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, FileUpload, type FileUploadHandler, type FileUploadItem } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| aria-describedby | string | optional, no default | Ids of elements that describe the field, merged with the control's own description and error ids. |
| aria-invalid | boolean \| "true" \| "false" | optional, no default | Marks the field as invalid (also set automatically when error is shown). |
| onBlur | FocusEventHandler<HTMLElement> | optional, no default | Called when focus leaves the control (not when it moves between the control's own parts). |
| name | string | optional, no default | Submits the files with a form (multipart). |
| disabled | boolean | false | Disables the drop zone and its browse button. |
| value | FileUploadItem[] | optional, no default | The file list (controlled). Use toFileUploadItems(files) to wrap existing Files. |
| defaultValue | FileUploadItem[] | [] | Sets the starting list when uncontrolled. |
| onValueChange | ((items: FileUploadItem[]) => void) | optional, no default | Called with the new list whenever files are added, removed or their upload state changes. |
| upload | FileUploadHandler | optional, no default | Uploads one file. Report progress (0–100) and stop when the signal aborts. Throw to fail. |
| onFilesAccepted | ((files: File[]) => void) | optional, no default | Called with the files that passed validation. |
| onFilesRejected | ((rejections: FileRejection[]) => void) | optional, no default | Called with the files that didn't, and why. |
| accept | string | optional, no default | Like the input's accept: "image/*,.pdf". |
| maxSize | number | optional, no default | Sets the largest file size accepted, in bytes. |
| minSize | number | optional, no default | Sets the smallest file size accepted, in bytes. |
| maxFiles | number | 0 | Most files at once. With 1 (or multiple={false}), a new file replaces the old one. |
| multiple | boolean | true | Allows adding several files at once. |
| capture | "user" \| "environment" | optional, no default | Phones: open the camera directly. |
| previews | boolean | true | Shows a thumbnail for each image file. |
| variant | "default" \| "compact" | "default" | "default": tall zone with an icon. "compact": one row, for dense forms. |
| label | ReactNode | optional, no default | Text above the zone; part of the zone's accessible name. |
| description | ReactNode | optional, no default | Muted helper text under the label. |
| error | ReactNode | optional, no default | Error message from outside (e.g. "Add at least one file"). |
| locale | string | optional, no default | Locale for sizes and lists. |
| actionsRef | RefObject<FileUploadActions \| null> | optional, no default | Receives an object of imperative actions, { addFiles, browse, clear }. |
| preventDropOnDocument | boolean | true | Stop a file dropped just outside the zone from opening in the browser tab. |
| labels | Partial<FileUploadLabels> | defaultFileUploadLabels | Every other string, for translation: labels={{ title: "…" }}; omitted keys keep the English of defaultFileUploadLabels. All 29 keys of FileUploadLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer wrapper. |

## Example 1 of 3: Upload with progress

Drop files, click the zone (or press Enter / Space on it), or paste. Images and PDFs up to 5 MB, six at most. A file with “error” in its name fails halfway so you can try Retry. No files handy? Add the samples: two are rejected on purpose.

```tsx
import { useState } from "react";
import { FileUpload } from "@/components/sheenui/file-upload/file-upload";
import { type FileUploadHandler, type FileUploadItem } from "@/components/sheenui/file-upload/parts/model";
// Package build (after the first npm release, or a packed tarball): import { FileUpload, type FileUploadHandler, type FileUploadItem } from "@sheenui/theme";

// Your uploader: report progress, honor the abort signal, throw to fail.
async function uploadWithProgress(
  url: string,
  file: File,
  { onProgress, signal }: { onProgress: (percent: number) => void; signal: AbortSignal },
) {
  // XMLHttpRequest (or fetch + a stream) goes here; call onProgress(0..100) as bytes leave.
  onProgress(100);
  await fetch(url, { method: "POST", body: file, signal });
}

export function Example() {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const uploaded = files.filter((item) => item.status === "done").length;
  const upload: FileUploadHandler = async (file, { onProgress, signal }) => {
    await uploadWithProgress("/api/files", file, { onProgress, signal });
  };

  return (
    <>
      <FileUpload
        label="Attachments"
        accept="image/*,.pdf"
        maxSize={5 * 1024 * 1024}
        maxFiles={6}
        upload={upload}
        onValueChange={setFiles}
      />
      <p>{uploaded} uploaded</p>
    </>
  );
}
```

## Example 2 of 3: Compact, one file

variant="compact" fits dense forms. With maxFiles={1} a new file replaces the old one; capture opens the camera on phones.

```tsx
import { FileUpload } from "@/components/sheenui/file-upload/file-upload";
import { type FileUploadHandler } from "@/components/sheenui/file-upload/parts/model";
// Package build (after the first npm release, or a packed tarball): import { FileUpload, type FileUploadHandler } from "@sheenui/theme";

export function Example() {
  const upload: FileUploadHandler = async (file, { onProgress }) => {
    onProgress(100); // send the file to your server here
  };

  return (
    <FileUpload
      variant="compact"
      label="Profile photo"
      accept="image/png,image/jpeg,image/webp"
      maxFiles={1}
      maxSize={2 * 1024 * 1024}
      capture="user"
      upload={upload}
    />
  );
}
```

## Example 3 of 3: In a form, no upload step

Without upload, files are only collected. With name they submit as multipart form data like a native file input.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { FileUpload } from "@/components/sheenui/file-upload/file-upload";
// Package build (after the first npm release, or a packed tarball): import { Button, FileUpload } from "@sheenui/theme";

export function Example() {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const files = new FormData(e.currentTarget)
        .getAll("documents")
        .filter((f): f is File => f instanceof File && f.size > 0);
      console.log(files.map((f) => f.name).join(", ") || "No files yet");
    }}>
      <FileUpload name="documents" label="Documents" accept=".pdf,.doc,.docx" maxFiles={3} />
      <Button type="submit">Send</Button>
    </form>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focus the drop zone (it is a button). |
| Enter / Space | Open the file dialog. |
| Ctrl / Cmd + V | Paste files while the zone is focused. |
| Tab, then Enter / Space | Cancel, Retry or Remove a file: each row's buttons are normal tab stops. |

## Accessibility

- Dragging is never required: the zone is a real button, and pasting works too.
- Each file row has a progress bar with a name; added, failed and removed files are announced politely.
- Rejected files (type, size, count) show a message linked to the zone. Every string is translatable through labels.
- The zone is named by the label, the prompt and the limits hint together (“Attachments Drop files here, or browse Images, up to 5 MB”), so the visible text is part of its name.

## All exports on this page

- FileUpload — File upload: a glass dropzone plus a live file list.
- defaultFileUploadLabels — Default English strings of FileUploadLabels; spread it and override single keys to reword.
- toFileUploadItems — Wrap Files as idle items, e.g.


## When to use the file upload field

- Use it as a React dropzone for an attachments area on a support ticket or a CSV import screen, where people drop files, click to browse or paste from the clipboard and see a live list with per-file status.
- Use it for uploads with real progress: pass an upload function and each file gets its own progress bar, a cancel button that aborts the signal, a retry button after failure and a done tick.
- Use it for image uploads such as a gallery or avatar picker, where previews gives image files thumbnails and everything else gets a tinted icon with its extension.
- Skip it when you only need a single bare file picker inside a native form; an Input with type="file" is lighter and needs no dropzone, list or upload handling.
- Pair it with its own label, description and error props for labeling, Progress or Toast for wider upload feedback, and Button next to it to open the file dialog or clear the list through actionsRef.


## Frequently asked questions

### How do I limit file types and sizes in a React drag and drop upload?

Use accept, maxSize, minSize and maxFiles, which are checked on drop. Rejected files are listed with the reason, type, too-large, too-small, too-many or duplicate, and announced to screen readers; onFilesRejected gives you the details. While dragging, the zone turns red when the MIME type will not be accepted.

### How does the upload function work?

Pass upload(file, { onProgress, signal }). Call onProgress with a percentage, stop when the signal aborts, resolve on success and reject to mark the file failed. Without it, files are just collected: read them from onValueChange, or submit them with the name prop.

### Is the dropzone usable with a keyboard?

Yes. The zone is a button: Tab focuses it, Enter or Space opens the file dialog, and Ctrl or Cmd plus V pastes files while focused. Each row has Cancel, Retry and Remove buttons as normal tab stops, and additions, removals and results are announced politely.

### Can I control the list or trigger the dialog from code?

Yes. Use value with onValueChange for a controlled list, or defaultValue otherwise. The actionsRef gives you addFiles, browse and clear. variant="compact" renders one row for dense forms, error shows an external message, and labels translates every string.


## Related pages

- [Input group](https://lokendra-builds.github.io/sheenui/forms/input-group)
- [Number field](https://lokendra-builds.github.io/sheenui/forms/number-field)
- [Radio group](https://lokendra-builds.github.io/sheenui/forms/radio-group)
- [Rating](https://lokendra-builds.github.io/sheenui/forms/rating)
- [Segmented control](https://lokendra-builds.github.io/sheenui/forms/segmented-control)
- [Tags input](https://lokendra-builds.github.io/sheenui/forms/tags-input)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
