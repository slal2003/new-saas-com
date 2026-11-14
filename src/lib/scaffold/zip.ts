import JSZip from "jszip";
import type { RenderedScaffold } from "@/lib/scaffold/render";
import { scaffoldFilename } from "@/lib/scaffold/render";

const FIXED_DATE = new Date("2020-01-01T00:00:00.000Z");

function directoriesFor(paths: string[]): string[] {
  const directories = new Set<string>();
  for (const path of paths) {
    const parts = path.split("/");
    parts.pop();
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      directories.add(current);
    }
  }
  return [...directories].sort();
}

export async function buildScaffoldZip(rendered: RenderedScaffold): Promise<Uint8Array> {
  const zip = new JSZip();
  const paths = Object.keys(rendered.files).sort();

  zip.file(`${rendered.slug}/`, null, { dir: true, date: FIXED_DATE });
  for (const directory of directoriesFor(paths)) {
    zip.file(`${rendered.slug}/${directory}/`, null, { dir: true, date: FIXED_DATE });
  }

  for (const path of paths) {
    zip.file(`${rendered.slug}/${path}`, rendered.files[path], {
      date: FIXED_DATE,
      unixPermissions: 0o644,
      createFolders: false,
    });
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
    platform: "UNIX",
    streamFiles: false,
  });

  return new Uint8Array(buffer);
}

export function zipFilename(rendered: RenderedScaffold): string {
  return scaffoldFilename(rendered.slug);
}
