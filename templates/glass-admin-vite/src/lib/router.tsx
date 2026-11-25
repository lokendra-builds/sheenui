import type { ComponentProps } from "react";
import { Link, useLocation, useNavigate as useRouterNavigate } from "react-router";

/** The router adapter: the app imports these three, so only this file knows which router runs. */
export function AppLink({ href = "/", ...props }: Omit<ComponentProps<typeof Link>, "to"> & { href?: string }) {
  return <Link to={href} {...props} />;
}

export function usePathname() {
  return useLocation().pathname;
}

export function useNavigate() {
  const navigate = useRouterNavigate();
  return (to: string) => void navigate(to);
}
