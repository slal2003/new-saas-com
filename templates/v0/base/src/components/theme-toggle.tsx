"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const THEMES = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme ?? "system") : "system";
  const Icon = current === "dark" ? Moon : current === "light" ? Sun : Laptop;
  const label = current === "dark" ? "Dark" : current === "light" ? "Light" : "System";

  function cycle() {
    const index = THEMES.indexOf(current as (typeof THEMES)[number]);
    setTheme(THEMES[(index + 1) % THEMES.length]);
  }

  return (
    <Button variant="outline" size="sm" onClick={cycle} aria-label={`Theme: ${label}`}>
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
