import { useEffect, type ComponentProps } from "react";
import { Toaster } from "@sheenui/theme";

type LazyToasterProps = ComponentProps<typeof Toaster> & { onMounted?: () => void };

/**
 * The app's toast viewport as a default export, so App.tsx can load it with lazy() after first paint (and the docs pages
 * through DeferredToaster). `onMounted` tells the provider the viewport exists, so toasts raised before that can start
 * their lifetime. Any other prop goes to the `Toaster`.
 */
export default function LazyToaster({ onMounted, ...props }: LazyToasterProps) {
  useEffect(() => {
    onMounted?.();
  }, [onMounted]);
  return <Toaster {...props} />;
}
