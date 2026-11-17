# Fixture guide

A complete module, compiled as written (copied-files form, resolved through the registry mapping):

```tsx
import { Button } from "@/components/sheenui/button/button";
// Package build (after the first npm release, or a packed tarball): import { Button } from "@sheenui/theme";

export function Good() {
  return <Button>Save</Button>;
}
```

A fragment, wrapped by the convention (SheenUI names it uses are imported automatically):

```tsx fragment
<Button>Save</Button>;
```

Another library's API, counted but not compiled:

```tsx external
import { Dialog } from "radix-ui";

export const Radix = <Dialog.Root asChild />;
```

```css
.not-a-sample { color: red; }
```

A broken sample, which must fail the check:

```tsx
import { Button } from "@sheenui/theme";

export function Broken() {
  return <Button tone="not-a-tone">Save</Button>;
}
```
