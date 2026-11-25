"use client";

import { GlassLogin } from "@/components/sheenui/blocks/glass-login";
import { useNavigate } from "@/lib/router";
import { LogoMark } from "@/shell/icons";
import { PRODUCT } from "@/shell/nav";
import { ThemeControls } from "@/shell/theme-controls";

/** A sign-in form with no backend: any valid email and password of 8+ characters opens the app. */
export function SignInView() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4">
      <div className="flex w-full max-w-md items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-semibold tracking-tight">
          <LogoMark />
          {PRODUCT}
        </span>
        <ThemeControls iconOnly />
      </div>
      <div className="w-full max-w-md">
        <GlassLogin
          title="Welcome back"
          subtitle="Sign in to continue to your workspace."
          headingLevel={1}
          onSubmit={() => navigate("/overview")}
          signUpHref={null}
        />
      </div>
    </div>
  );
}
