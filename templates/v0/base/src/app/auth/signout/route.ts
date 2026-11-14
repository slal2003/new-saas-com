import { NextResponse } from "next/server";
import { serverAuth } from "@/lib/auth/server-auth";
import { getCapabilities } from "@/lib/capabilities";

export async function POST(request: Request) {
  if (getCapabilities().auth.mode !== "real") {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 503 });
  }
  return serverAuth.signOutHandler(request);
}
