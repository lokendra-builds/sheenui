import { describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";
import { useControllable } from "../../src/hooks/use-controllable";
import { Pagination } from "../../src";
import { resetWarnOnce } from "../../src/lib/warn-once";

describe("useControllable", () => {
  it("uncontrolled: owns the state, reports changes, skips no-ops", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllable<number>(undefined, 1, onChange));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    act(() => result.current[1](2));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("uncontrolled: chained functional updaters build on each other", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllable<number>(undefined, 0, onChange));
    act(() => {
      result.current[1]((n) => n + 1);
      result.current[1]((n) => n + 1);
    });
    expect(result.current[0]).toBe(2);
    expect(onChange.mock.calls).toEqual([[1], [2]]);
  });

  it("controlled, owner rejects: the same request is reported again every time", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllable<number>(1, 0, onChange));
    act(() => result.current[1](2));
    act(() => result.current[1](2));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(result.current[0]).toBe(1);
    expect(result.current[2].current).toBe(1);
  });

  it("controlled, owner rejects: an updater builds on the prop, not on the rejected request", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllable<number>(5, 0, onChange));
    act(() => result.current[1]((n) => n + 1));
    act(() => result.current[1]((n) => n + 1));
    expect(onChange.mock.calls).toEqual([[6], [6]]);
  });

  it("controlled, owner accepts: follows the prop and does not report a value equal to it", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ v }) => useControllable<number>(v, 0, onChange), {
      initialProps: { v: 1 },
    });
    act(() => result.current[1](2));
    rerender({ v: 2 });
    expect(result.current[0]).toBe(2);
    act(() => result.current[1](2));
    expect(onChange).toHaveBeenCalledTimes(1);
    act(() => result.current[1]((n) => n + 1));
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it("null is a valid controlled value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllable<string | null>(null, "x", onChange));
    expect(result.current[0]).toBeNull();
    act(() => result.current[1]("a"));
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("a controlled Pagination whose owner ignores onPageChange keeps calling it", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={5} onPageChange={onPageChange} />);
    const next = screen.getByRole("button", { name: /next/i });
    await userEvent.click(next);
    await userEvent.click(next);
    expect(onPageChange).toHaveBeenCalledTimes(2);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
  });

  it("warns once in development when a component switches between controlled and uncontrolled", () => {
    resetWarnOnce();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = renderHook(({ v }: { v: number | undefined }) => useControllable<number>(v, 0), {
      initialProps: { v: undefined as number | undefined },
    });
    expect(warn).not.toHaveBeenCalled();
    rerender({ v: 3 });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain("uncontrolled to controlled");
    rerender({ v: undefined });
    rerender({ v: 4 });
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});
