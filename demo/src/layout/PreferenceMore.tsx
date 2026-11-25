import { useEffect, useRef, type ComponentType } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@sheenui/theme";

import { MoreChevron } from "./PreferenceBar";

type ToggleProps = { label: string; pressed: boolean; onChange: (on: boolean) => void };

/** The popover of the header's "More" button (see MoreMenu in PreferenceBar.tsx): loaded on first use, mounted already open. */
export default function PreferenceMore({
  className,
  Toggle,
  reducedMotion,
  setReducedMotion,
  reducedTransparency,
  setReducedTransparency,
  lite,
  setLite,
}: {
  className: string;
  Toggle: ComponentType<ToggleProps>;
  reducedMotion: boolean;
  setReducedMotion: (on: boolean) => void;
  reducedTransparency: boolean;
  setReducedTransparency: (on: boolean) => void;
  lite: boolean;
  setLite: (on: boolean) => void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  // The plain button this replaced held focus: keep it on the real trigger until the popover takes it.
  useEffect(() => trigger.current?.focus({ preventScroll: true }), []);
  return (
    <Popover defaultOpen>
      <PopoverTrigger ref={trigger} className={className}>
        More
        <MoreChevron />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label="More display settings"
        className="flex w-auto flex-col items-stretch gap-2"
      >
        <Toggle label="Reduce motion" pressed={reducedMotion} onChange={setReducedMotion} />
        <Toggle label="Reduce transparency" pressed={reducedTransparency} onChange={setReducedTransparency} />
        <Toggle label="Lite glass" pressed={lite} onChange={setLite} />
      </PopoverContent>
    </Popover>
  );
}
