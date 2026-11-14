import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { DEMO_PROJECT_SPEC } from "@/lib/spec/schema";
import { renderScaffold } from "@/lib/scaffold/render";
import { buildScaffoldZip, zipFilename } from "@/lib/scaffold/zip";

describe("scaffold ZIP", () => {
  it("produces a ZIP with a stable filename", async () => {
    const rendered = await renderScaffold(DEMO_PROJECT_SPEC);
    const zip = await buildScaffoldZip(rendered);

    expect(zip.byteLength).toBeGreaterThan(1000);
    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);
    expect(zipFilename(rendered)).toBe("northstar-notes-v0.zip");
  });

  it("uses a fixed date for every entry", async () => {
    const rendered = await renderScaffold(DEMO_PROJECT_SPEC);
    const zip = await buildScaffoldZip(rendered);
    const parsed = await JSZip.loadAsync(zip);

    for (const entry of Object.values(parsed.files)) {
      expect(entry.date.toISOString()).toBe("2020-01-01T00:00:00.000Z");
    }
  });

  it("is deterministic for a fixed template", async () => {
    const first = await renderScaffold(DEMO_PROJECT_SPEC);
    const second = await renderScaffold(DEMO_PROJECT_SPEC);
    const firstZip = await buildScaffoldZip(first);
    const secondZip = await buildScaffoldZip(second);
    expect(Buffer.from(secondZip).equals(Buffer.from(firstZip))).toBe(true);
  });
});
