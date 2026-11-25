import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { Avatar, AvatarGroup } from "../../src/components/avatar/avatar";
import { pixel } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("without an image shows named initials (first two words, upper-cased)", () => {
    renderUi(
      <>
        <Avatar name="ada lovelace" />
        <Avatar name="Madonna" />
        <Avatar name="Grace Brewster Murray Hopper" />
      </>,
      variant,
    );
    expect(screen.getByRole("img", { name: "ada lovelace" })).toHaveTextContent("AL");
    expect(screen.getByRole("img", { name: "Madonna" })).toHaveTextContent("M");
    expect(screen.getByRole("img", { name: "Grace Brewster Murray Hopper" })).toHaveTextContent("GB");
  });

  it("shows the photo once it loads, with the name as alt text", async () => {
    renderUi(<Avatar name="Ada Lovelace" src={pixel} />, variant);
    const img = await screen.findByRole("img", { name: "Ada Lovelace" });
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("alt", "Ada Lovelace");
  });

  it("falls back to initials when the image fails to load", async () => {
    renderUi(<Avatar name="Alan Turing" src="/definitely-missing.png" />, variant);
    // The fallback waits 400 ms before appearing so a fast image does not flash initials.
    const fallback = await screen.findByRole("img", { name: "Alan Turing" });
    expect(fallback).toHaveTextContent("AT");
  });

  it("announces status as a named image and varies it by shape (offline is hollow)", () => {
    renderUi(
      <>
        <Avatar name="A One" status="online" />
        <Avatar name="B Two" status="away" size="lg" />
        <Avatar name="C Three" status="offline" size="sm" />
      </>,
      variant,
    );
    expect(screen.getByRole("img", { name: "online" })).toHaveAttribute("title", "Online");
    expect(screen.getByRole("img", { name: "away" })).toHaveAttribute("title", "Away");
    const offline = screen.getByRole("img", { name: "offline" });
    expect(offline.className).toContain("border-2");
  });

  it("AvatarGroup stacks avatars and forwards props", () => {
    renderUi(
      <AvatarGroup data-testid="group" aria-label="Project members" role="group">
        <Avatar name="A One" />
        <Avatar name="B Two" />
      </AvatarGroup>,
      variant,
    );
    const group = screen.getByRole("group", { name: "Project members" });
    expect(group.children).toHaveLength(2);
  });

  it("has no axe violations", async () => {
    renderUi(
      <AvatarGroup>
        <Avatar name="Ada Lovelace" status="online" />
        <Avatar name="Alan Turing" src={pixel} status="away" size="lg" />
        <Avatar name="Grace Hopper" size="sm" status="offline" />
      </AvatarGroup>,
      variant,
    );
    await screen.findByRole("img", { name: "Alan Turing" });
    expect(await runAxe()).toHaveNoViolations();
  });
});
