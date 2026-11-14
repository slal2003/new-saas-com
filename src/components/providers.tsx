"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AppAuthProvider } from "@/lib/auth/app-auth";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppAuthProvider>{children}</AppAuthProvider>
    </ThemeProvider>
  );
}
