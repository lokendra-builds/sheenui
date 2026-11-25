import { useEffect, useRef } from "react";
import { FileUpload, type FileUploadActions, type FileUploadHandler } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { FileUploadScene } from "./ShowcaseStage.file-upload";

/** A fake upload: progress climbs in a few steps (no network). */
const send: FileUploadHandler = async (_file, { onProgress, signal }) => {
  for (let i = 1; i <= 8; i += 1) {
    await new Promise<void>((resolve) => {
      const timer = window.setTimeout(resolve, 170);
      signal.addEventListener("abort", () => window.clearTimeout(timer), { once: true });
    });
    if (signal.aborted) return;
    onProgress(i / 8);
  }
};

const sample = () => [
  new File([new Uint8Array(842_000)], "q3-board-report.pdf", { type: "application/pdf" }),
  new File([new Uint8Array(120_000)], "brand-notes.pdf", { type: "application/pdf" }),
];

/** The live FileUpload on its stage: the story drops two files on it; the person can drop their own. */
export function FileUploadScene({ scene, ctx }: { scene: FileUploadScene; ctx: StageContext }) {
  const actions = useRef<FileUploadActions | null>(null);
  const dropped = useRef(false);
  const { setState } = ctx;
  useEffect(() => {
    if (!scene.dropped || dropped.current) return;
    dropped.current = true;
    actions.current?.addFiles(sample());
  }, [scene.dropped]);
  return (
    <div className="sheen-stage-col">
      <FileUpload
        label="Attachments"
        description="PDF or images, up to 5 MB."
        accept="image/*,.pdf"
        maxSize={5 * 1024 * 1024}
        maxFiles={4}
        upload={send}
        actionsRef={actions}
        locale="en-US"
        onFilesAccepted={() => setState("working")}
        onValueChange={(items) => {
          if (items.length > 0 && items.every((i) => i.status === "done")) setState("success");
        }}
        className="sheen-stage-wide text-start"
      />
    </div>
  );
}
