"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { usePathname as useNextPathname, useRouter } from "next/navigation";

/** The router adapter: the app imports these three, so only this file knows which router runs. */
export function AppLink({ href = "/", ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href?: string }) {
  return <Link href={href} {...props} />;
}

export function usePathname() {
  return useNextPathname();
}

export function useNavigate() {
  const router = useRouter();
  return (to: string) => router.push(to);
}
