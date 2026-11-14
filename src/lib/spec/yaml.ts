import { parse, stringify } from "yaml";
import {
  normalizeProjectSpec,
  safeParseProjectSpec,
  type ResolvedProjectSpec,
  type SpecIssue,
} from "@/lib/spec/schema";

export function toProjectYaml(spec: ResolvedProjectSpec): string {
  const ordered = {
    name: spec.name,
    description: spec.description,
    structure: spec.structure,
    frontend: spec.frontend,
    backend: {
      advanced: spec.backend.advanced,
      database: spec.backend.database,
    },
    audience: spec.audience,
    auth: spec.auth,
    payments: spec.payments,
    ...(spec.domain ? { domain: spec.domain } : {}),
    deploy: {
      provider: spec.deploy.provider,
      convex: spec.deploy.convex,
      dns: spec.deploy.dns,
      registrar: spec.deploy.registrar,
    },
    styling: { theme: spec.styling.theme },
    features: {
      demo: spec.features.demo,
      blog: spec.features.blog,
      email: spec.features.email,
      analytics: spec.features.analytics,
    },
    templateVersion: spec.templateVersion,
  };

  return stringify(ordered, { lineWidth: 0 });
}

export function parseProjectYaml(text: string):
  | { success: true; data: ResolvedProjectSpec; issues: [] }
  | { success: false; data: null; issues: SpecIssue[] } {
  let raw: unknown;
  try {
    raw = parse(text);
  } catch (error) {
    return {
      success: false,
      data: null,
      issues: [
        {
          path: "yaml",
          message: error instanceof Error ? error.message : "Invalid YAML.",
        },
      ],
    };
  }
  return safeParseProjectSpec(raw);
}

export function normalizeYaml(text: string): string {
  const result = parseProjectYaml(text);
  if (!result.success) return text;
  return toProjectYaml(result.data);
}

export { normalizeProjectSpec };
