"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Blocks,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppAuth } from "@/lib/auth/app-auth";
import { getCapabilities } from "@/lib/capabilities";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/setup", label: "Setup", icon: Settings },
];

function NavLinks({ pathname, mobile = false }: { pathname: string; mobile?: boolean }) {
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        if (mobile) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function LoadingShell() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user, signOut } = useAppAuth();
  const capabilities = getCapabilities();

  useEffect(() => {
    if (status !== "unauthenticated") return;
    router.replace(capabilities.auth.mode === "unconfigured" ? "/setup" : "/sign-in");
  }, [status, router, capabilities.auth.mode]);

  if (status === "loading") return <LoadingShell />;
  if (status === "unauthenticated") return <LoadingShell />;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card/60 md:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo href="/dashboard" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Workspace
          </p>
          <NavLinks pathname={pathname} />
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {(user?.name ?? "A").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user?.name ?? "Account"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email ?? "local"}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => void signOut()}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
          <p className="px-1 text-[10px] text-muted-foreground">
            new-saas template v{"{{spec.templateVersion}}"} · {capabilities.data.mode} data
          </p>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
          <div className="md:hidden">
            <Logo href="/dashboard" compact />
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <Blocks className="size-4 text-primary" />
            <span>{"{{project.name}}"}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/setup">
                <Settings className="size-3.5" /> Setup
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:pb-12">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <NavLinks pathname={pathname} mobile />
      </nav>
    </div>
  );
}
