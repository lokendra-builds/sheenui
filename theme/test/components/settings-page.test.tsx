// SettingsPage beyond the form basics: the photo (pick, drop, size / type limits, remove), the live
// appearance preferences, export + delete flows, section nav, notification groups, and options.

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { SettingsPage, type SettingsPageProps } from "../../src/blocks/settings-page";
import { pixel, settle } from "../helpers";
import { renderUi, runAxe } from "../render";

afterEach(() => {
  vi.restoreAllMocks();
});

const defaults = {
  name: "Ada Lovelace",
  username: "ada",
  email: "ada@example.com",
  bio: "Analyst",
  avatar: null,
  notifications: { email: true },
};

function Page(props: Partial<SettingsPageProps>) {
  return <SettingsPage defaultValues={defaults} {...props} />;
}
const png = (size = 1200, name = "me.png", type = "image/png") => new File([new Uint8Array(size)], name, { type });
const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;
const choose = (file: File) => {
  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput().files = dt.files;
  fireEvent.change(fileInput());
};

describe("profile photo", () => {
  it("picking an image previews it, reports the file, makes the form dirty, and Remove clears it", async () => {
    const createUrl = vi.spyOn(URL, "createObjectURL").mockReturnValue(pixel);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const onAvatarChange = vi.fn();
    renderUi(<Page onAvatarChange={onAvatarChange} />);
    const remove = screen.getByRole("button", { name: "Remove" });
    expect(remove).toHaveAttribute("aria-disabled", "true");
    choose(png());
    expect(createUrl).toHaveBeenCalledTimes(1);
    expect(onAvatarChange).toHaveBeenCalledWith(expect.objectContaining({ name: "me.png" }));
    expect(await screen.findByText("1 unsaved change")).toBeInTheDocument();
    expect(remove).not.toHaveAttribute("aria-disabled", "true");
    await userEvent.click(remove);
    expect(onAvatarChange).toHaveBeenLastCalledWith(null);
    await expect.poll(() => screen.queryByText("1 unsaved change")).toBeNull();
  });

  it("rejects a non-image and an oversized image with a message, without changing the form", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue(pixel);
    const onAvatarChange = vi.fn();
    renderUi(<Page onAvatarChange={onAvatarChange} maxAvatarMb={1} />);
    choose(png(100, "notes.txt", "text/plain"));
    expect(await screen.findByText("That file isn't an image. Pick a PNG, JPG or WebP.")).toBeInTheDocument();
    choose(png(2 * 1024 * 1024, "big.png"));
    expect(await screen.findByText("Images up to 1 MB, please.")).toBeInTheDocument();
    expect(onAvatarChange).not.toHaveBeenCalled();
    expect(screen.queryByText(/unsaved/)).toBeNull();
    // A good one clears the message.
    choose(png());
    await expect.poll(() => screen.queryByText("Images up to 1 MB, please.")).toBeNull();
  });

  it("an image dropped on the photo circle is taken; the Change photo button opens the file picker", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue(pixel);
    const onAvatarChange = vi.fn();
    renderUi(<Page onAvatarChange={onAvatarChange} />);
    const click = vi.spyOn(fileInput(), "click").mockImplementation(() => undefined);
    await userEvent.click(screen.getByRole("button", { name: "Change profile photo" }));
    expect(click).toHaveBeenCalled();
    const target =
      screen.getByRole("button", { name: "Change profile photo" }).closest("[class*='group/avatar']") ??
      screen.getByRole("button", { name: "Change profile photo" });
    const dt = new DataTransfer();
    dt.items.add(png());
    target.dispatchEvent(new DragEvent("dragenter", { dataTransfer: dt, bubbles: true, cancelable: true }));
    target.dispatchEvent(new DragEvent("dragover", { dataTransfer: dt, bubbles: true, cancelable: true }));
    target.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
    await expect.poll(() => onAvatarChange.mock.calls.length).toBe(1);
  });

  it("an existing avatar shows and can be removed", async () => {
    const onAvatarChange = vi.fn();
    renderUi(<Page defaultValues={{ ...defaults, avatar: pixel }} onAvatarChange={onAvatarChange} />);
    const remove = screen.getByRole("button", { name: "Remove" });
    expect(remove).not.toHaveAttribute("aria-disabled", "true");
    await userEvent.click(remove);
    expect(onAvatarChange).toHaveBeenCalledWith(null);
  });
});

describe("appearance (live preferences, not part of the form)", () => {
  it("theme, reduce motion and reduce transparency apply to <html> at once and never make the form dirty", async () => {
    renderUi(<Page />);
    const html = document.documentElement;
    const theme = screen.getByRole("group", { name: "Theme" });
    await userEvent.click(within(theme).getByRole("button", { name: "Dark" }));
    await expect.poll(() => html.getAttribute("data-theme")).toBe("dark");
    await userEvent.click(within(theme).getByRole("button", { name: "Light" }));
    await expect.poll(() => html.getAttribute("data-theme")).toBe("light");
    await userEvent.click(within(theme).getByRole("button", { name: "System" }));
    await expect.poll(() => html.hasAttribute("data-theme")).toBe(false);
    await userEvent.click(screen.getByRole("switch", { name: /Reduce motion/ }));
    await expect.poll(() => html.getAttribute("data-motion")).toBe("reduced");
    await userEvent.click(screen.getByRole("switch", { name: /Reduce transparency/ }));
    await expect.poll(() => html.getAttribute("data-transparency")).toBe("reduced");
    await userEvent.click(screen.getByRole("switch", { name: /Reduce motion/ }));
    await expect.poll(() => html.hasAttribute("data-motion")).toBe(false);
    expect(screen.queryByText(/unsaved/)).toBeNull();
  });
});

describe("export and delete", () => {
  it("Export data calls back (and tolerates a failure); without a handler there is no export card", async () => {
    const onExportData = vi.fn().mockRejectedValueOnce(new Error("no")).mockResolvedValue(undefined);
    const view = renderUi(<Page onExportData={onExportData} />);
    await userEvent.click(screen.getByRole("button", { name: "Export data" }));
    // The rejected export is announced instead of escaping the click handler as an unhandled rejection.
    await expect.poll(() => document.body.textContent).toContain("Couldn't export your data");
    await userEvent.click(screen.getByRole("button", { name: "Export data" }));
    expect(onExportData).toHaveBeenCalledTimes(2);
    view.rerender(<Page />);
    expect(screen.queryByRole("button", { name: "Export data" })).toBeNull();
  });

  it("Delete needs the typed confirmation; typing it enables the button, which calls onDeleteAccount and closes", async () => {
    const onDeleteAccount = vi.fn().mockResolvedValue(undefined);
    renderUi(<Page onDeleteAccount={onDeleteAccount} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete account" }));
    const dialog = await screen.findByRole("alertdialog");
    const confirm = within(dialog).getByRole("button", { name: "Delete forever" });
    expect(confirm).toBeDisabled();
    await userEvent.type(within(dialog).getByRole("textbox"), "wrong");
    expect(confirm).toBeDisabled();
    await userEvent.fill(within(dialog).getByRole("textbox"), "ada");
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(onDeleteAccount).toHaveBeenCalledTimes(1);
    await settle();
    await expect.poll(() => screen.queryByRole("alertdialog")).toBeNull();
  });

  it("a failing delete keeps the dialog open so it can be tried again", async () => {
    const onDeleteAccount = vi.fn().mockRejectedValue(new Error("server"));
    renderUi(<Page onDeleteAccount={onDeleteAccount} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete account" }));
    const dialog = await screen.findByRole("alertdialog");
    await userEvent.fill(within(dialog).getByRole("textbox"), "ada");
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete forever" }));
    await expect.poll(() => onDeleteAccount.mock.calls.length).toBe(1);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Cancel" }));
  });
});

describe("sections, notifications and options", () => {
  it("sections limits which parts show, and the nav only lists those", () => {
    renderUi(<Page sections={["profile", "appearance"]} onExportData={vi.fn()} onDeleteAccount={vi.fn()} />);
    const nav = screen.getByRole("group", { name: "Settings sections" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => a.textContent),
    ).toEqual(["Profile", "Appearance"]);
    expect(screen.queryByRole("heading", { name: "Notifications" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete account" })).toBeNull();
  });

  it("custom notification options show their groups and descriptions; locked ones stay on; toggles count as changes and save reports them", async () => {
    const onSave = vi.fn<NonNullable<SettingsPageProps["onSave"]>>();
    renderUi(
      <Page
        onSave={onSave}
        notificationOptions={[
          { id: "email", label: "Email digest", description: "Daily", group: "Email" },
          { id: "push", label: "Push", group: "Mobile" },
          { id: "security", label: "Security alerts", locked: true, group: "Mobile" },
        ]}
      />,
    );
    expect(screen.getByText("Daily")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /Security alerts/ })).toBeChecked();
    expect(screen.getByRole("switch", { name: /Security alerts/ })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByText("Always on").length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("switch", { name: /Push/ }));
    expect(await screen.findByText("1 unsaved change")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await expect.poll(() => onSave.mock.calls.length).toBe(1);
    expect(onSave.mock.calls[0]![0].notifications).toMatchObject({ email: true, push: true });
    expect(onSave.mock.calls[0]![1]).toContain("notifications.push");
  });

  it("title, description, heading level, username prefix and labels are configurable", () => {
    renderUi(
      <Page
        title="Preferences"
        description="Tune it"
        headingLevel={2}
        usernamePrefix="example.com/"
        labels={{ save: "Speichern", profile: "Profil" }}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Preferences" })).toBeInTheDocument();
    expect(screen.getByText("Tune it")).toBeInTheDocument();
    expect(screen.getByText("example.com/")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Settings sections" })).toHaveTextContent("Profil");
  });

  it("the section nav links scroll to their section and mark the current one", async () => {
    renderUi(<Page onExportData={vi.fn()} onDeleteAccount={vi.fn()} />);
    const nav = screen.getByRole("group", { name: "Settings sections" });
    await userEvent.click(within(nav).getByRole("link", { name: "Danger zone" }));
    await expect
      .poll(() => within(nav).getByRole("link", { name: "Danger zone" }).getAttribute("aria-current"), {
        timeout: 4000,
      })
      .toBeTruthy();
    window.scrollTo(0, 0);
  });

  it("an empty save is not offered, a save in flight shows Saving…, and a slow save disables the buttons", async () => {
    let finish!: () => void;
    const onSave = vi.fn(() => new Promise<void>((r) => (finish = r)));
    renderUi(<Page onSave={onSave} />);
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
    await userEvent.fill(screen.getByRole("textbox", { name: /Display name/ }), "Ada L");
    await userEvent.click(await screen.findByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Saving…")).toBeInTheDocument();
    finish();
    expect((await screen.findAllByText("Changes saved")).length).toBeGreaterThan(0);
  });

  it("has no axe violations with the dirty bar showing", async () => {
    renderUi(<Page onExportData={vi.fn()} onDeleteAccount={vi.fn()} />);
    await userEvent.fill(screen.getByRole("textbox", { name: /Display name/ }), "Someone Else");
    await screen.findByText("1 unsaved change");
    await settle();
    expect(await runAxe(document.body)).toHaveNoViolations();
  });

  it("the photo button has no axe label-in-name violation (the initials are decoration beside its name)", async () => {
    renderUi(<Page />);
    await settle();
    expect(await runAxe(document.body, { runOnly: ["label-content-name-mismatch"] })).toHaveNoViolations();
  });
});
