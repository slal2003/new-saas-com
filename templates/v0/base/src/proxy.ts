import { NextResponse, type NextRequest } from "next/server";
import { getCapabilities } from "@/lib/capabilities";

let handler: ((request: NextRequest) => Promise<NextResponse>) | null = null;

async function getProxyHandler() {
  if (!handler) {
    const { convexAuthNextjsProxy } = await import("@/lib/auth/next-auth");
    handler = convexAuthNextjsProxy(async (request, ctx) => {
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        const authenticated = await ctx.isAuthenticated();
        if (!authenticated) {
          return NextResponse.redirect(new URL("/sign-in", request.url));
        }
      }
    });
  }
  return handler;
}

export default async function proxy(request: NextRequest) {
  const capabilities = getCapabilities();
  if (capabilities.auth.mode !== "real") {
    return NextResponse.next();
  }
  const handle = await getProxyHandler();
  return handle(request);
}

export const config = {
  // Keep /auth out of the matcher: those routes manage their own cookies.
  matcher: ["/dashboard/:path*"],
};
