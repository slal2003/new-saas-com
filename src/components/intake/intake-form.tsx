"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Download,
  FileCode2,
  FileJson2,
  FlaskConical,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SaveProjectButton } from "@/components/intake/save-project-button";
import { getCapabilities } from "@/lib/capabilities";
import { resolveProjectPlan, slugify } from "@/lib/spec/plan";
import {
  DEFAULT_PROJECT_SPEC,
  DEMO_PROJECT_SPEC,
  deriveAuth,
  safeParseProjectSpec,
  type ProjectSpec,
  type ResolvedProjectSpec,
  type SpecIssue,
} from "@/lib/spec/schema";
import { parseProjectYaml, toProjectYaml } from "@/lib/spec/yaml";

type SelectOption = { value: string; label: string };

function Select({
  id,
  value,
  options,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

function PlanPanel({ spec }: { spec: ResolvedProjectSpec }) {
  const plan = resolveProjectPlan(spec);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={plan.renderable ? "success" : "destructive"}>
          {plan.renderable ? "renderable" : "blocked"}
        </Badge>
        <Badge variant="outline">template {plan.template.id}</Badge>
        <Badge variant="outline">v{plan.template.version}</Badge>
        <Badge variant="outline">{plan.payments}</Badge>
      </div>

      <div className="rounded-lg border border-border bg-background p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Auth</p>
        <p className="mt-1 text-sm font-medium">{plan.auth.provider}</p>
        <p className="mt-1 text-xs text-muted-foreground">{plan.auth.reason}</p>
      </div>

      {plan.blockers.length > 0 && (
        <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <AlertTriangle className="size-3.5" /> Blockers
          </p>
          {plan.blockers.map((blocker) => (
            <p key={blocker} className="text-xs text-destructive">
              {blocker}
            </p>
          ))}
        </div>
      )}

      {plan.warnings.length > 0 && (
        <div className="space-y-1 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <CheckCircle2 className="size-3.5" /> Notes
          </p>
          {plan.warnings.map((warning) => (
            <p key={warning} className="text-xs text-muted-foreground">
              {warning}
            </p>
          ))}
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Modules</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {plan.modules.map((module) => (
            <Badge key={module} variant="subtle">
              {module}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Directories
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {plan.directories.map((directory) => (
            <code key={directory} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
              {directory}
            </code>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Env var names ({plan.envVars.length})
        </p>
        <div className="mt-1.5 max-h-44 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
          {plan.envVars.map((envVar) => (
            <div key={envVar.name} className="flex items-start justify-between gap-2 text-[11px]">
              <code className="break-all">{envVar.name}</code>
              <Badge variant="subtle" className="shrink-0">
                {envVar.visibility}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Cloud className="size-3.5" /> Infrastructure plan (stubbed)
        </p>
        <ol className="mt-1.5 space-y-2">
          {plan.infra.map((step) => (
            <li key={step.id} className="rounded-lg border border-border p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium">{step.title}</p>
                <Badge variant="subtle">{step.provider}</Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-[11px] text-muted-foreground">
          No Cloudflare, Dokploy, Dynadot, Convex Cloud, or Stripe API is called in v0.
        </p>
      </div>
    </div>
  );
}

export function IntakeForm() {
  const capabilities = getCapabilities();
  const [spec, setSpec] = useState<ResolvedProjectSpec>(DEMO_PROJECT_SPEC);
  const [yamlDraft, setYamlDraft] = useState(() => toProjectYaml(DEMO_PROJECT_SPEC));
  const [yamlIssues, setYamlIssues] = useState<SpecIssue[]>([]);
  const [tab, setTab] = useState<"yaml" | "plan">("plan");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const validation = useMemo(() => safeParseProjectSpec(spec), [spec]);
  const issues = validation.success ? [] : validation.issues;
  const validSpec = validation.success ? validation.data : null;
  const issueFor = (path: string) => issues.find((issue) => issue.path === path)?.message;
  const plan = validSpec ? resolveProjectPlan(validSpec) : null;

  function apply(next: ResolvedProjectSpec) {
    setSpec(next);
    setYamlDraft(toProjectYaml(next));
    setYamlIssues([]);
  }

  function update(updates: Partial<ResolvedProjectSpec>) {
    apply({ ...spec, ...updates });
  }

  function changeStructure(structure: ProjectSpec["structure"]) {
    if (structure === "simple") {
      apply({ ...spec, structure, backend: { advanced: "none", database: "convex" } });
    } else {
      apply({ ...spec, structure, backend: { advanced: "fastapi", database: "postgres" } });
    }
  }

  function changeAudience(audience: ProjectSpec["audience"]) {
    apply({ ...spec, audience, auth: deriveAuth(audience) });
  }

  function changeYaml(value: string) {
    setYamlDraft(value);
    const result = parseProjectYaml(value);
    if (result.success) {
      setSpec(result.data);
      setYamlIssues([]);
    } else {
      setYamlIssues(result.issues);
    }
  }

  async function download() {
    if (!validation.success) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const response = await fetch("/api/scaffold", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec: validation.data }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; message?: string; issues?: SpecIssue[] }
          | null;
        const detail = payload?.issues?.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
        throw new Error(payload?.message ?? detail ?? payload?.error ?? "Scaffold download failed.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${slugify(spec.name) || "project"}-v0.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setDownloadError(cause instanceof Error ? cause.message : "Scaffold download failed.");
    } finally {
      setDownloading(false);
    }
  }

  const allIssues = [...issues, ...yamlIssues];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <Badge variant="subtle">Spec intake</Badge>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Build a project</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The form and YAML editor share one zod schema. The renderer only composes versioned
            templates, so the same spec produces the same ZIP.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => apply(DEMO_PROJECT_SPEC)}>
            <Sparkles className="size-3.5" /> Load demo plan
          </Button>
          <Button variant="ghost" size="sm" onClick={() => apply(DEFAULT_PROJECT_SPEC)}>
            <RefreshCw className="size-3.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCode2 className="size-4 text-primary" /> Project fields
            </CardTitle>
            <CardDescription>Unknown fields are rejected; secrets never belong in a spec.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Name" htmlFor="name" error={issueFor("name")}>
              <Input
                id="name"
                value={spec.name}
                onChange={(event) => update({ name: event.target.value })}
                placeholder="northstar-notes"
              />
            </Field>

            <Field
              label="Description"
              htmlFor="description"
              hint="One or two sentences. This lands in README and SETUP."
              error={issueFor("description")}
            >
              <Textarea
                id="description"
                value={spec.description}
                onChange={(event) => update({ description: event.target.value })}
                rows={3}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Structure" htmlFor="structure" error={issueFor("structure")}>
                <Select
                  id="structure"
                  value={spec.structure}
                  onChange={(value) => changeStructure(value as ProjectSpec["structure"])}
                  options={[
                    { value: "simple", label: "simple — Next.js + Convex" },
                    { value: "complex", label: "complex — + services/api" },
                  ]}
                />
              </Field>

              <Field label="Audience" htmlFor="audience" error={issueFor("audience")}>
                <Select
                  id="audience"
                  value={spec.audience}
                  onChange={(value) => changeAudience(value as ProjectSpec["audience"])}
                  options={[
                    { value: "individuals", label: "individuals" },
                    { value: "smb", label: "very small businesses" },
                    { value: "business", label: "business (SSO → Clerk)" },
                  ]}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Advanced backend" htmlFor="advanced" error={issueFor("backend.advanced")}>
                <Select
                  id="advanced"
                  value={spec.backend.advanced}
                  disabled={spec.structure === "simple"}
                  onChange={(value) =>
                    update({
                      backend: {
                        ...spec.backend,
                        advanced: value as ProjectSpec["backend"]["advanced"],
                      },
                    })
                  }
                  options={[
                    { value: "none", label: "none" },
                    { value: "fastapi", label: "FastAPI" },
                    { value: "fastmcp", label: "FastMCP" },
                  ]}
                />
              </Field>

              <Field label="Backend database" htmlFor="database" error={issueFor("backend.database")}>
                <Select
                  id="database"
                  value={spec.backend.database}
                  disabled={spec.structure === "simple"}
                  onChange={(value) =>
                    update({
                      backend: {
                        ...spec.backend,
                        database: value as ProjectSpec["backend"]["database"],
                      },
                    })
                  }
                  options={[
                    { value: "convex", label: "Convex" },
                    { value: "sqlite", label: "SQLite" },
                    { value: "postgres", label: "Postgres" },
                  ]}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Payments" htmlFor="payments" error={issueFor("payments")}>
                <Select
                  id="payments"
                  value={spec.payments}
                  onChange={(value) => update({ payments: value as ProjectSpec["payments"] })}
                  options={[
                    { value: "stripe", label: "Stripe" },
                    { value: "none", label: "none" },
                  ]}
                />
              </Field>

              <Field
                label="Self-hosted Convex"
                htmlFor="convex"
                hint="Self-hosted copies infra/convex into the ZIP."
                error={issueFor("deploy.convex")}
              >
                <Select
                  id="convex"
                  value={spec.deploy.convex}
                  onChange={(value) =>
                    update({
                      deploy: {
                        ...spec.deploy,
                        convex: value as ProjectSpec["deploy"]["convex"],
                      },
                    })
                  }
                  options={[
                    { value: "self-hosted", label: "self-hosted (Dokploy)" },
                    { value: "cloud", label: "Convex Cloud" },
                  ]}
                />
              </Field>
            </div>

            <Field
              label="Domain (optional)"
              htmlFor="domain"
              hint="Hostname only. The domain is not purchased or provisioned."
              error={issueFor("domain")}
            >
              <Input
                id="domain"
                value={spec.domain ?? ""}
                onChange={(event) => update({ domain: event.target.value || undefined })}
                placeholder="notes.example.com"
              />
            </Field>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium">Feature modules</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={spec.features.demo}
                    onChange={(event) =>
                      update({ features: { ...spec.features, demo: event.target.checked } })
                    }
                  />
                  Demo mode shell
                </label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={spec.features.blog}
                    onChange={(event) =>
                      update({ features: { ...spec.features, blog: event.target.checked } })
                    }
                  />
                  Blog module
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="email" error={issueFor("features.email")}>
                  <Select
                    id="email"
                    value={spec.features.email}
                    onChange={(value) =>
                      update({
                        features: {
                          ...spec.features,
                          email: value as ProjectSpec["features"]["email"],
                        },
                      })
                    }
                    options={[
                      { value: "none", label: "none" },
                      { value: "resend", label: "Resend" },
                    ]}
                  />
                </Field>
                <Field label="Analytics" htmlFor="analytics" error={issueFor("features.analytics")}>
                  <Select
                    id="analytics"
                    value={spec.features.analytics}
                    onChange={(value) =>
                      update({
                        features: {
                          ...spec.features,
                          analytics: value as ProjectSpec["features"]["analytics"],
                        },
                      })
                    }
                    options={[
                      { value: "none", label: "none" },
                      { value: "posthog", label: "PostHog" },
                    ]}
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <LockKeyhole className="size-3.5 text-primary" /> Pinned template
              </p>
              <p className="mt-1">
                templateVersion <code className="rounded bg-background px-1 py-0.5">{spec.templateVersion}</code>{" "}
                · auth <code className="rounded bg-background px-1 py-0.5">{spec.auth}</code>. Values are
                derived from audience and the selected template.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileJson2 className="size-4 text-primary" /> Live preview
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={tab === "plan" ? "default" : "outline"}
                    onClick={() => setTab("plan")}
                  >
                    Plan
                  </Button>
                  <Button
                    size="sm"
                    variant={tab === "yaml" ? "default" : "outline"}
                    onClick={() => setTab("yaml")}
                  >
                    YAML
                  </Button>
                </div>
              </div>
              <CardDescription>
                {allIssues.length > 0
                  ? `${allIssues.length} validation issue${allIssues.length === 1 ? "" : "s"}`
                  : "Valid spec · resolved deterministically"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tab === "yaml" ? (
                <div className="space-y-2">
                  <Label htmlFor="yaml">project.yaml</Label>
                  <Textarea
                    id="yaml"
                    value={yamlDraft}
                    onChange={(event) => changeYaml(event.target.value)}
                    rows={22}
                    spellCheck={false}
                    className="font-mono text-xs"
                  />
                </div>
              ) : plan && validSpec ? (
                <PlanPanel spec={validSpec} />
              ) : (
                <p className="text-sm text-muted-foreground">Fix the spec to resolve a plan.</p>
              )}

              {allIssues.length > 0 && (
                <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                  {allIssues.map((issue, index) => (
                    <p key={`${issue.path}-${index}`} className="text-xs text-destructive">
                      <span className="font-mono">{issue.path || "spec"}:</span> {issue.message}
                    </p>
                  ))}
                </div>
              )}

              {downloadError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                  {downloadError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => void download()}
                  disabled={!plan?.renderable || downloading}
                >
                  {downloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Download ZIP
                </Button>
                {capabilities.data.mode === "convex" && <SaveProjectButton spec={validSpec} />}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/setup">
                    <ShieldCheck className="size-3.5" /> Setup
                  </Link>
                </Button>
              </div>

              {plan && !plan.renderable && (
                <p className="text-xs text-muted-foreground">
                  Download unlocks when the plan has no blockers. The complex structure and Clerk are
                  resolved but deferred to a later template.
                </p>
              )}
              {capabilities.demo && (
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <FlaskConical className="size-3.5 text-primary" />
                  Demo mode: downloads work locally; nothing is provisioned.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="rounded-lg border border-border bg-card/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">What the ZIP contains</p>
            <p className="mt-1">
              The template base, generated <code className="rounded bg-muted px-1">project.yaml</code>,{" "}
              <code className="rounded bg-muted px-1">.env.example</code>,{" "}
              <code className="rounded bg-muted px-1">SETUP.md</code>, and a deterministic{" "}
              <code className="rounded bg-muted px-1">template.lock</code> checksum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
