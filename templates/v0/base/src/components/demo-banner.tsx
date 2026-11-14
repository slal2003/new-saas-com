"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { demoLabel, getCapabilities } from "@/lib/capabilities";

export function DemoBanner() {
  const capabilities = getCapabilities();
  if (!capabilities.demo) return null;

  return (
    <div className="border-b border-primary/30 bg-primary/10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-4 py-2 text-xs text-foreground sm:px-6">
        <AlertTriangle className="size-3.5 text-primary" />
        <span className="font-semibold">Demo mode</span>
        <span className="text-muted-foreground">
          {demoLabel(capabilities) || "integrations"} disabled. This build cannot ship to production.
        </span>
        <Link href="/setup" className="ml-auto font-medium text-primary hover:underline">
          Open setup
        </Link>
      </div>
    </div>
  );
}
