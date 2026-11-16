"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAppAuth } from "@/lib/auth/app-auth";

export function AppHeader() {
  const { status, user, signOut } = useAppAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/#how" className="transition-colors hover:text-foreground">
              How it works
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/setup" className="transition-colors hover:text-foreground">
              Setup
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {status === "authenticated" ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">{user?.name}</span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="size-3.5" /> Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => void signOut()} aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/projects/new">
                  Start a project <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
