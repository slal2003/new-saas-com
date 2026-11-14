"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { Loader2, Save } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/spec/plan";
import { toProjectYaml } from "@/lib/spec/yaml";
import {
  PROJECT_SPEC_SCHEMA_VERSION,
  type ResolvedProjectSpec,
} from "@/lib/spec/schema";

export function SaveProjectButton({ spec }: { spec: ResolvedProjectSpec | null }) {
  const createProject = useMutation(api.projects.createFromSpec);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!spec) return;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      await createProject({
        name: spec.name,
        slug: slugify(spec.name),
        description: spec.description,
        structure: spec.structure,
        auth: spec.auth,
        payments: spec.payments,
        templateVersion: spec.templateVersion,
        schemaVersion: PROJECT_SPEC_SCHEMA_VERSION,
        rawYaml: toProjectYaml(spec),
        spec,
      });
      setMessage("Saved to Convex.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the project.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => void save()} disabled={!spec || pending}>
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
        Save to workspace
      </Button>
      {message && (
        <span className="text-xs text-primary">
          {message}{" "}
          <Link href="/dashboard/projects" className="underline">
            View
          </Link>
        </span>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
