import { NextResponse } from "next/server";
import { findSecretLikeKeys, safeParseProjectSpec } from "@/lib/spec/schema";
import { renderScaffold } from "@/lib/scaffold/render";
import { buildScaffoldZip, zipFilename } from "@/lib/scaffold/zip";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const specInput =
    body && typeof body === "object" && "spec" in body
      ? (body as { spec: unknown }).spec
      : undefined;

  if (!specInput) {
    return NextResponse.json({ error: "Missing `spec`." }, { status: 400 });
  }

  const secretKeys = findSecretLikeKeys(specInput);
  if (secretKeys.length > 0) {
    return NextResponse.json(
      {
        error: "Specs must reference env var names, not secrets.",
        keys: secretKeys,
      },
      { status: 400 },
    );
  }

  const parsed = safeParseProjectSpec(specInput);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid project spec.", issues: parsed.issues },
      { status: 400 },
    );
  }

  try {
    const rendered = await renderScaffold(parsed.data);
    const zip = await buildScaffoldZip(rendered);
    const filename = zipFilename(rendered);

    return new Response(Buffer.from(zip), {
      status: 200,
      headers: {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "private, no-store",
        "x-scaffold-slug": rendered.slug,
        "x-template-version": rendered.lock.template.version,
        "x-template-checksum": rendered.lock.checksum,
      },
    });
  } catch (cause) {
    return NextResponse.json(
      { error: "Could not render the scaffold.", message: cause instanceof Error ? cause.message : "Unknown error." },
      { status: 422 },
    );
  }
}
