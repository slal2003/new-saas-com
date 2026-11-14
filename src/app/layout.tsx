import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DemoBanner } from "@/components/demo-banner";
import { Providers } from "@/components/providers";
import { getCapabilities } from "@/lib/capabilities";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://new-saas.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "New SaaS — spec to scaffold",
    template: "%s · New SaaS",
  },
  description:
    "Turn a validated project.yaml into a deterministic Next.js + Convex SaaS base, with auth, demo mode, and a stubbed infrastructure plan.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ececee" },
    { media: "(prefers-color-scheme: dark)", color: "#1a181d" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const capabilities = getCapabilities();

  const body =
    capabilities.auth.mode === "real" ? (
      await (async () => {
        const { ConvexAuthNextjsServerProvider } = await import("@/lib/auth/next-auth");
        return (
          <ConvexAuthNextjsServerProvider>
            <Providers>{children}</Providers>
          </ConvexAuthNextjsServerProvider>
        );
      })()
    ) : (
      <Providers>{children}</Providers>
    );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Lora:ital,wght@0,400..700;1,400..700&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <DemoBanner />
        {body}
      </body>
    </html>
  );
}
