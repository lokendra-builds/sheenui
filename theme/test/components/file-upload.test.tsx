import { expect, it, vi } from "vitest";
import { createRef } from "react";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  FileUpload,
  type FileRejection,
  type FileUploadActions,
  type FileUploadHandler,
} from "../../src/components/file-upload/file-upload";
import { fileKind, formatBytes, matchesAccept, parseAccept } from "../../src/components/file-upload/file-utils";
import { lastArg } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const png = (name = "photo.png", size = 10) => new File([new Uint8Array(size)], name, { type: "image/png" });
const pdf = (name = "doc.pdf", size = 10) => new File([new Uint8Array(size)], name, { type: "application/pdf" });
const AXE = { rules: { region: { enabled: false } } };
const zone = () => screen.getByRole("button", { name: /Drop files here/ });
const list = () => screen.queryByRole("list", { name: "Selected files" });
const names = () =>
  list()
    ? within(list()!)
        .getAllByRole("listitem")
        .map((li) => li.textContent)
    : [];

function setup(props: React.ComponentProps<typeof FileUpload> = {}) {
  const actions = createRef<FileUploadActions | null>();
  return { actions, ui: <FileUpload label="Attachments" actionsRef={actions} {...props} /> };
}

describeVariants((variant) => {
  it("the drop zone is a labelled button whose hint lists the limits", () => {
    renderUi(
      <FileUpload
        label="Attachments"
        accept="image/*,.pdf"
        maxSize={2 * 1024 * 1024}
        maxFiles={3}
        description="Up to three"
      />,
      variant,
    );
    expect(zone()).toBeInTheDocument();
    expect(zone()).toHaveAccessibleName(/Attachments/);
    expect(screen.getByText("Up to three")).toBeInTheDocument();
    // The limits are the zone's description.
    expect(zone()).toHaveAccessibleDescription(/Images or PDF · up to 2 MB · 3 files max/);
  });

  it("is keyboard operable: Enter and Space open the file dialog (browse)", async () => {
    renderUi(<FileUpload label="Attachments" />, variant);
    const input = document.querySelector<HTMLInputElement>("input[type=file]")!;
    const click = vi.spyOn(input, "click").mockImplementation(() => undefined);
    zone().focus();
    await userEvent.keyboard("{Enter}");
    expect(click).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    expect(click).toHaveBeenCalledTimes(2);
  });

  it("added files are listed with names and sizes; accepted files are reported", async () => {
    const onFilesAccepted = vi.fn();
    const onValueChange = vi.fn();
    const { actions, ui } = setup({ onFilesAccepted, onValueChange });
    renderUi(ui, variant);
    actions.current!.addFiles([png("a.png", 1024), pdf("b.pdf", 2048)]);
    await expect.poll(names).toHaveLength(2);
    expect(names()[0]).toContain("a.png");
    expect(names()[1]).toContain("b.pdf");
    expect(screen.getByText(/^2 files · 3 k?B$/i)).toBeInTheDocument();
    expect(onFilesAccepted).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.lastCall![0]).toHaveLength(2);
    await expect.poll(() => document.querySelector("[aria-live=polite]")?.textContent).toContain("2 files added");
  });

  it("dropping files onto the zone adds them", async () => {
    renderUi(<FileUpload label="Attachments" />, variant);
    const data = new DataTransfer();
    data.items.add(png("dropped.png"));
    const target = zone();
    target.dispatchEvent(new DragEvent("dragenter", { dataTransfer: data, bubbles: true, cancelable: true }));
    target.dispatchEvent(new DragEvent("dragover", { dataTransfer: data, bubbles: true, cancelable: true }));
    target.dispatchEvent(new DragEvent("drop", { dataTransfer: data, bubbles: true, cancelable: true }));
    await expect.poll(names).toHaveLength(1);
    expect(names()[0]).toContain("dropped.png");
  });

  it("rejects wrong type, too large, too small, too many and duplicates, with an alert", async () => {
    const onFilesRejected = vi.fn();
    const onFilesAccepted = vi.fn();
    const { actions, ui } = setup({
      accept: "image/*",
      maxSize: 100,
      minSize: 5,
      maxFiles: 2,
      onFilesRejected,
      onFilesAccepted,
    });
    renderUi(ui, variant);
    actions.current!.addFiles([pdf("report.pdf", 20), png("big.png", 500), png("tiny.png", 1), png("ok1.png", 20)]);
    await expect.poll(names).toEqual([expect.stringContaining("ok1.png")]);
    const rejections = onFilesRejected.mock.lastCall![0] as FileRejection[];
    expect(rejections.map((r) => [r.file.name, r.reason])).toEqual([
      ["report.pdf", "type"],
      ["big.png", "too-large"],
      ["tiny.png", "too-small"],
    ]);
    await expect
      .poll(() =>
        screen
          .getAllByRole("alert")
          .map((a) => a.textContent)
          .join(" "),
      )
      .toMatch(/This file type isn’t accepted/);
    // The same file again is a duplicate (matched by name, size and modified time).
    const accepted = (onFilesAccepted.mock.lastCall![0] as File[])[0]!;
    actions.current!.addFiles([accepted]);
    await expect.poll(() => (lastArg(onFilesRejected) as FileRejection[]).map((r) => r.reason)).toEqual(["duplicate"]);
    actions.current!.addFiles([png("ok2.png", 20), png("ok3.png", 20)]);
    await expect.poll(() => (lastArg(onFilesRejected) as FileRejection[]).map((r) => r.reason)).toEqual(["too-many"]);
  });

  it("remove buttons and Remove all clear the list; the zone stays focusable", async () => {
    const { actions, ui } = setup();
    renderUi(ui, variant);
    actions.current!.addFiles([png("a.png"), png("b.png")]);
    await expect.poll(names).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Remove a.png" }));
    await expect.poll(names).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Remove all" }));
    await expect.poll(list).toBeNull();
    actions.current!.addFiles([png("c.png")]);
    await expect.poll(names).toHaveLength(1);
    actions.current!.clear();
    await expect.poll(list).toBeNull();
  });

  it("an upload handler reports progress, completes, and a failing one offers retry", async () => {
    const calls: string[] = [];
    const upload: FileUploadHandler = (file, { onProgress }) => {
      calls.push(file.name);
      onProgress(50);
      return file.name.startsWith("bad") ? Promise.reject(new Error("Server refused")) : Promise.resolve();
    };
    const { actions, ui } = setup({ upload });
    renderUi(ui, variant);
    actions.current!.addFiles([png("good.png"), png("bad.png")]);
    await expect.poll(() => screen.queryByText("Uploaded")).not.toBeNull();
    await expect.poll(() => screen.queryByText("Server refused")).not.toBeNull();
    expect(calls).toEqual(["good.png", "bad.png"]);
    await userEvent.click(screen.getByRole("button", { name: "Retry upload of bad.png" }));
    await expect.poll(() => calls).toEqual(["good.png", "bad.png", "bad.png"]);
  });

  it("an in-flight upload shows a labelled progress bar and can be cancelled", async () => {
    let aborted = false;
    const upload: FileUploadHandler = (_file, { onProgress, signal }) =>
      new Promise((_resolve, reject) => {
        onProgress(40);
        signal.addEventListener("abort", () => {
          aborted = true;
          reject(new DOMException("aborted", "AbortError"));
        });
      });
    const { actions, ui } = setup({ upload });
    renderUi(ui, variant);
    actions.current!.addFiles([png("slow.png")]);
    const bar = await screen.findByRole("progressbar", { name: "Uploading slow.png" });
    await expect.poll(() => bar.getAttribute("aria-valuenow")).toBe("40");
    await userEvent.click(screen.getByRole("button", { name: "Cancel upload of slow.png" }));
    await expect.poll(() => aborted).toBe(true);
  });

  it("maxFiles=1 replaces the previous file; variant=compact renders; error shows an alert", async () => {
    const { actions, ui } = setup({ maxFiles: 1, variant: "compact", error: "Add a file" });
    renderUi(ui, variant);
    expect(screen.getByRole("alert", { name: "" })).toBeDefined();
    expect(screen.getAllByRole("alert").map((a) => a.textContent)).toContain("Add a file");
    expect(zone()).toHaveAttribute("aria-invalid", "true");
    actions.current!.addFiles([png("first.png")]);
    await expect.poll(names).toHaveLength(1);
    actions.current!.addFiles([png("second.png")]);
    await expect.poll(() => names()[0]).toContain("second.png");
    expect(names()).toHaveLength(1);
  });

  it("labels translate the zone and messages (i18n); disabled blocks everything", () => {
    renderUi(
      <>
        <FileUpload label="Dateien" labels={{ title: "Dateien hierher ziehen oder", browse: "auswählen" }} />
        <FileUpload label="Off" disabled labels={{ title: "Gesperrt", browse: "x" }} />
      </>,
      variant,
    );
    expect(screen.getByRole("button", { name: /Dateien hierher ziehen oder/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gesperrt/ })).toHaveAttribute("aria-disabled", "true");
  });

  it("has no axe violations (empty, with files, with an upload error)", async () => {
    const upload: FileUploadHandler = () => Promise.reject(new Error("Nope"));
    const { actions, ui } = setup({ upload, description: "Max 3 files", accept: "image/*" });
    renderUi(ui, variant);
    expect(await runAxe(document.body, AXE)).toHaveNoViolations();
    actions.current!.addFiles([png("a.png", 100)]);
    await expect.poll(() => screen.queryByText("Nope")).not.toBeNull();
    expect(await runAxe(document.body, AXE)).toHaveNoViolations();
  });
});

it("file-utils: accept parsing, matching, sizes and kinds", () => {
  expect(parseAccept("image/*, .PDF")).toEqual(["image/*", ".pdf"]);
  expect(parseAccept(undefined)).toEqual([]);
  expect(matchesAccept({ name: "a.png", type: "image/png" }, "image/*")).toBe(true);
  expect(matchesAccept({ name: "a.pdf", type: "application/pdf" }, "image/*,.pdf")).toBe(true);
  expect(matchesAccept({ name: "a.txt", type: "text/plain" }, "image/*")).toBe(false);
  expect(matchesAccept({ name: "a.txt", type: "text/plain" }, undefined)).toBe(true);
  expect(formatBytes(0, "en-US")).toBe("0 bytes");
  expect(formatBytes(1536, "en-US")).toBe("1.5 kB");
  expect(formatBytes(5 * 1024 * 1024, "en-US")).toBe("5 MB");
  expect(fileKind({ name: "a.png", type: "image/png" })).toBe("image");
  expect(fileKind({ name: "a.zip", type: "" })).toBe("archive");
  expect(fileKind({ name: "a.ts", type: "" })).toBe("code");
  expect(fileKind({ name: "a.unknown", type: "" })).toBe("file");
});

it("the drop zone's accessible name contains its visible text (axe label-content-name-mismatch)", async () => {
  renderUi(<FileUpload label="Attachments" accept="image/*" />);
  expect(zone()).toHaveAccessibleName(/Attachments.*Drop files here.*Images/);
  expect(await runAxe(document.body, AXE)).toHaveNoViolations();
});
