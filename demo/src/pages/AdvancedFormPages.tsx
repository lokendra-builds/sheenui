import { useRef, useState, type SubmitEvent } from "react";
import { Button, useToast } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import type { RatingScene as RatingSceneData } from "../layout/ShowcaseStage.rating";
import { RatingScene } from "../layout/ShowcaseStage.rating.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { FileUploadScene as FileUploadSceneData } from "../layout/ShowcaseStage.file-upload";
import { FileUploadScene } from "../layout/ShowcaseStage.file-upload.scene";
import { A11yNotes, KeyboardTable } from "./DocSections";
import { DEMO_LOCALE } from "../demo-clock";
import { FileUpload, type FileUploadActions, type FileUploadHandler, type FileUploadItem } from "@sheenui/theme";
import { Rating } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { lazyBlock } from "../layout/lazy-block";

/** Page bodies that pull in Base UI popup code load as islands while the page hydrates. */
const island = { eager: true, minHeight: "80vh" };

/* =====================================================================
 * File upload
 * ===================================================================== */

/** Pretend upload: progress in random steps; any file with "error" in its name fails halfway. */
const fakeUpload: FileUploadHandler = (file, { onProgress, signal }) =>
  new Promise<void>((resolve, reject) => {
    let progress = 0;
    const speed = 5 + Math.random() * 9;
    const timer = window.setInterval(() => {
      progress = Math.min(100, progress + speed * (0.5 + Math.random()));
      onProgress(progress);
      if (file.name.toLowerCase().includes("error") && progress > 55) {
        window.clearInterval(timer);
        reject(new Error("Server rejected the file (demo)"));
      } else if (progress >= 100) {
        window.clearInterval(timer);
        resolve();
      }
    }, 160);
    signal.addEventListener("abort", () => {
      window.clearInterval(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

/** A few demo files: a real PNG (drawn on a canvas), PDFs, one that fails, and two that get rejected. */
async function makeSampleFiles(): Promise<File[]> {
  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 240;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 360, 240);
    g.addColorStop(0, "#6d4aff");
    g.addColorStop(0.55, "#22b8c4");
    g.addColorStop(1, "#f7a8c9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 360, 240);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(250, 80, 60, 0, Math.PI * 2);
    ctx.fill();
  }
  const png = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? new Blob()), "image/png"));
  const bytes = (n: number) => new Uint8Array(n);
  return [
    new File([png], "aurora-gradient.png", { type: "image/png" }),
    new File([bytes(842_000)], "q3-board-report.pdf", { type: "application/pdf" }),
    new File([bytes(120_000)], "invoice-error-demo.pdf", { type: "application/pdf" }),
    new File([bytes(7 * 1024 * 1024)], "launch-teaser.mov", { type: "video/quicktime" }),
    new File([bytes(9 * 1024 * 1024)], "huge-scan.png", { type: "image/png" }),
  ];
}

/** The "File upload" docs page (/forms/file-upload): live examples, props and notes. */
export function FileUploadPage() {
  const actions = useRef<FileUploadActions | null>(null);
  const toast = useToast();
  const [avatar, setAvatar] = useState<FileUploadItem[]>([]);

  return (
    <Page
      eyebrow="Form"
      title="File upload"
      description="A glass dropzone that glows as files hover over it, validates type, size and count on drop, and lists every file with a thumbnail, its own progress bar, cancel, retry and a done tick."
      source={["theme/src/components/file-upload/file-upload.tsx", "theme/src/components/file-upload/file-utils.ts"]}
    >
      <ShowcaseStage<FileUploadSceneData>
        label="File upload demo"
        story={() => import("../layout/ShowcaseStage.file-upload")}
        initial={{ dropped: false }}
        minHeight="40rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <FileUploadScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Upload with progress"
        description="Drop files, click the zone (or press Enter / Space on it), or paste. Images and PDFs up to 5 MB, six at most. A file with “error” in its name fails halfway so you can try Retry. No files handy? Add the samples: two are rejected on purpose."
        controls={
          <Button variant="glass" size="sm" onClick={async () => actions.current?.addFiles(await makeSampleFiles())}>
            Add sample files
          </Button>
        }
        stageClassName="items-start"
        code={`
import { useState } from "react";
import { FileUpload, type FileUploadHandler, type FileUploadItem } from "@sheenui/theme";

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
}`}
      >
        <FileUpload
          label="Attachments"
          locale={DEMO_LOCALE}
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          maxFiles={6}
          upload={fakeUpload}
          actionsRef={actions}
          className="max-w-xl"
        />
      </Example>

      <Example
        title="Compact, one file"
        description='variant="compact" fits dense forms. With maxFiles={1} a new file replaces the old one; capture opens the camera on phones.'
        code={`
import { FileUpload, type FileUploadHandler } from "@sheenui/theme";

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
}`}
      >
        <FileUpload
          variant="compact"
          label="Profile photo"
          locale={DEMO_LOCALE}
          accept="image/png,image/jpeg,image/webp"
          maxFiles={1}
          maxSize={2 * 1024 * 1024}
          capture="user"
          upload={fakeUpload}
          value={avatar}
          onValueChange={setAvatar}
          className="max-w-md"
        />
      </Example>

      <Example
        title="In a form, no upload step"
        description="Without upload, files are only collected. With name they submit as multipart form data like a native file input."
        code={`
import { Button, FileUpload } from "@sheenui/theme";

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
}`}
      >
        <form
          className="flex w-full max-w-md flex-col gap-4"
          onSubmit={(e: SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            const files = new FormData(e.currentTarget)
              .getAll("documents")
              .filter((f): f is File => f instanceof File && f.size > 0);
            toast.success(
              files.length ? `Would send ${files.length} file${files.length === 1 ? "" : "s"}` : "No files yet",
              files.map((f) => f.name).join(", "),
            );
          }}
        >
          <FileUpload
            name="documents"
            label="Documents"
            locale={DEMO_LOCALE}
            accept=".pdf,.doc,.docx"
            maxFiles={3}
            variant="compact"
          />
          <Button type="submit" className="self-start">
            Send
          </Button>
        </form>
      </Example>

      <PropsTable of={PROPS.FileUpload} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the drop zone (it is a button)."],
          ["Enter / Space", "Open the file dialog."],
          ["Ctrl / Cmd + V", "Paste files while the zone is focused."],
          ["Tab, then Enter / Space", "Cancel, Retry or Remove a file: each row's buttons are normal tab stops."],
        ]}
      />
      <A11yNotes
        items={[
          "Dragging is never required: the zone is a real button, and pasting works too.",
          "Each file row has a progress bar with a name; added, failed and removed files are announced politely.",
          "Rejected files (type, size, count) show a message linked to the zone. Every string is translatable through labels.",
          "The zone is named by the label, the prompt and the limits hint together (“Attachments Drop files here, or browse Images, up to 5 MB”), so the visible text is part of its name.",
        ]}
      />
    </Page>
  );
}

/** The TagsInput page body: its own chunk (see island), so its demos stay out of the route's initial JavaScript. */
export const TagsInputPage = lazyBlock(() => import("./TagsInputPageBody").then((m) => m.TagsInputPage), island);

/* =====================================================================
 * Rating
 * ===================================================================== */

const MOODS = ["Poor", "Fair", "Good", "Great", "Excellent"];

function HeartIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-full"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.9 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.5 3.4 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" />
    </svg>
  );
}

function HeartOutline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.9 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.5 3.4 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" />
    </svg>
  );
}

/** The "Rating" docs page (/forms/rating): live examples, props and notes. */
export function RatingPage() {
  const [half, setHalf] = useState<number | null>(3.5);
  const [stay, setStay] = useState<number | null>(4);

  return (
    <Page
      eyebrow="Form"
      title="Rating"
      description="Stars (or any icon) with hover preview, half steps and a little cascade when the value changes. It's a radio group underneath, so arrow keys work and screen readers hear “4 stars, 4 of 5”."
      source="theme/src/components/rating/rating.tsx"
    >
      <ShowcaseStage<RatingSceneData>
        label="Rating demo"
        story={() => import("../layout/ShowcaseStage.rating")}
        initial={{ value: null }}
        minHeight="14rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <RatingScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Basic"
        description="Hover to preview, click to rate, click the same star again to clear (or press Backspace)."
        // Signature motion, once in view: the stars light up one after another (the cascade), then settle on four.
        autoplay={() => {
          setStay(null);
          const timers = [1, 2, 3, 4, 5].map((n, i) => window.setTimeout(() => setStay(n), 500 + i * 160));
          timers.push(window.setTimeout(() => setStay(4), 2200));
          return () => {
            timers.forEach((t) => window.clearTimeout(t));
            setStay(4);
          };
        }}
        code={`
import { Rating } from "@sheenui/theme";

export function Example() {
  return (
    <Rating label="Rate your stay" defaultValue={4} />
  );
}`}
      >
        <Rating label="Rate your stay" value={stay} onValueChange={setStay} />
      </Example>

      <Example
        title="Half stars with words"
        description="allowHalf gives every star a left and a right half (on touch screens, tap a star again for its half). valueLabels and showValue echo the hovered or chosen value."
        code={`
import { useState } from "react";
import { Rating } from "@sheenui/theme";

export function Example() {
  const [value, setValue] = useState<number | null>(3.5);

  return (
    <Rating
      label="Overall"
      allowHalf
      value={value}
      onValueChange={setValue}
      valueLabels={["Poor", "Fair", "Good", "Great", "Excellent"]}
      showValue
      size="lg"
    />
  );
}`}
      >
        <Rating
          locale={DEMO_LOCALE}
          label="Overall"
          allowHalf
          value={half}
          onValueChange={setHalf}
          valueLabels={MOODS}
          showValue
          size="lg"
        />
      </Example>

      <Example
        title="Read-only and sizes"
        description="Read-only ratings are one image with a full label (“Rated 4.5 out of 5”), not a set of controls."
        code={`
import { Rating } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Rating readOnly value={4.5} size="sm" showValue />
      <Rating readOnly value={4.5} size="md" showValue />
      <Rating readOnly value={4.5} size="lg" showValue />
    </>
  );
}`}
      >
        <div className="flex flex-col items-center gap-3">
          <Rating locale={DEMO_LOCALE} readOnly value={4.5} size="sm" showValue />
          <Rating locale={DEMO_LOCALE} readOnly value={4.5} size="md" showValue />
          <Rating locale={DEMO_LOCALE} readOnly value={4.5} size="lg" showValue />
        </div>
      </Example>

      <Example
        title="Custom icon and tone"
        description="Any SVG that uses currentColor. Labels are yours to translate."
        code={`
import { Rating } from "@sheenui/theme";
import { Heart as HeartIcon } from "lucide-react";

export function Example() {
  return (
    <Rating
      aria-label="Favorite level"
      icon={<HeartIcon fill="currentColor" />}
      emptyIcon={<HeartIcon />}
      tone="danger"
      max={6}
      defaultValue={3}
      labels={{ item: (v) => \`\${v} \${v === 1 ? "heart" : "hearts"}\` }}
    />
  );
}`}
      >
        <Rating
          locale={DEMO_LOCALE}
          aria-label="Favorite level"
          icon={<HeartIcon />}
          emptyIcon={<HeartOutline />}
          tone="danger"
          max={6}
          defaultValue={3}
          labels={{ item: (v) => `${v} ${v === 1 ? "heart" : "hearts"}` }}
        />
      </Example>

      <PropsTable of={PROPS.Rating} />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Enter or leave the group once."],
          ["Arrow keys", "Change the value (and select it)."],
          ["Backspace / Delete", "Clear the value."],
        ]}
      />
      <A11yNotes
        items={[
          'A radiogroup of stars named by aria-label; each item has a spoken name ("3 of 5 stars", customisable through labels).',
          'readOnly shows a score as an image (role="img") whose label states the value (translate it with labels.readOnly).',
          "Pointer, touch and keyboard all select; the group announces how to clear the value.",
        ]}
      />
    </Page>
  );
}
