import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCapabilities } from "@/lib/capabilities";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const capabilities = getCapabilities();

  if (capabilities.auth.mode === "unconfigured") {
    redirect("/setup");
  }

  if (capabilities.auth.mode === "real") {
    const { isAuthenticatedNextjs } = await import("@/lib/auth/next-auth");
    if (!(await isAuthenticatedNextjs())) {
      redirect("/sign-in");
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}
