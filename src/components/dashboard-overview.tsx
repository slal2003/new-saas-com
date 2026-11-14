"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  Blocks,
  FolderKanban,
  History,
  Plus,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { getCapabilities } from "@/lib/capabilities";
import {
  DEMO_AUDIT_EVENTS,
  DEMO_PROJECTS,
  DEMO_SCAFFOLD_JOBS,
} from "@/lib/demo/fixtures";
import { formatDate, relativeTime } from "@/lib/format";

type OverviewProject = {
  id: string;
  name: string;
  slug: string;
  structure: string;
  status: string;
  updatedAt: number | string;
};

type OverviewJob = {
  id: string;
  projectId: string;
  status: string;
  templateVersion: string;
  createdAt: number | string;
};

type OverviewEvent = {
  id: string;
  action: string;
  targetId: string;
  createdAt: number | string;
};

type OverviewData = {
  source: "fixtures" | "convex";
  projects: OverviewProject[];
  jobs: OverviewJob[];
  events: OverviewEvent[];
  projectNameById: Record<string, string>;
};

function OverviewView({ data }: { data: OverviewData }) {
  const ready = data.projects.filter((project) => project.status === "ready").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Workspace overview</h1>
            <Badge variant={data.source === "convex" ? "success" : "subtle"}>
              {data.source === "convex" ? "live Convex" : "fixtures"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Specs, scaffold jobs, and the audit trail for every project you own.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/projects">
              <FolderKanban className="size-3.5" /> Projects
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/projects/new">
              <Plus className="size-3.5" /> New project
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projects" value={data.projects.length} hint={`${ready} ready`} icon={FolderKanban} />
        <StatCard
          label="Scaffold jobs"
          value={data.jobs.length}
          hint={`${data.jobs.filter((job) => job.status === "ready").length} ready`}
          icon={Blocks}
        />
        <StatCard label="Audit events" value={data.events.length} hint="Latest activity" icon={ScrollText} />
        <StatCard label="Template" value="v0.1.0" hint="Pinned · deterministic" icon={ShieldCheck} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Recent projects</CardTitle>
              <CardDescription>The latest specs and their status.</CardDescription>
            </div>
            <Button variant="link" size="sm" className="gap-1 text-xs" asChild>
              <Link href="/dashboard/projects">
                View all <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.projects.length === 0 ? (
              <EmptyState
                icon={Blocks}
                title="No projects yet"
                description="Build a project from a spec to see it here."
                action={
                  <Button size="sm" asChild>
                    <Link href="/projects/new">Open the intake</Link>
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {data.projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{project.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project.slug} · {project.structure} · updated {relativeTime(project.updatedAt)}
                      </p>
                    </div>
                    <Badge variant={project.status === "ready" ? "success" : "subtle"}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-4 text-primary" /> Scaffold history
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.jobs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No scaffold jobs yet.</p>
              ) : (
                data.jobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {data.projectNameById[job.projectId] ?? "Project"}
                      </p>
                      <p className="text-muted-foreground">
                        v{job.templateVersion} · {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <Badge variant={job.status === "ready" ? "success" : "subtle"}>{job.status}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ScrollText className="size-4 text-primary" /> Audit trail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.events.length === 0 ? (
                <p className="text-xs text-muted-foreground">No events recorded.</p>
              ) : (
                data.events.slice(0, 5).map((event) => (
                  <div key={event.id} className="rounded-md border border-border px-2.5 py-2 text-xs">
                    <p className="font-mono">{event.action}</p>
                    <p className="mt-0.5 truncate text-muted-foreground">
                      {event.targetId} · {relativeTime(event.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FixturesOverview() {
  const projectNameById = Object.fromEntries(DEMO_PROJECTS.map((project) => [project.id, project.name]));
  return (
    <OverviewView
      data={{
        source: "fixtures",
        projects: DEMO_PROJECTS.map((project) => ({
          id: project.id,
          name: project.name,
          slug: project.slug,
          structure: project.structure,
          status: project.status,
          updatedAt: project.updatedAt,
        })),
        jobs: DEMO_SCAFFOLD_JOBS.map((job, index) => ({
          id: job.id,
          projectId: DEMO_PROJECTS[index]?.id ?? "demo-project-1",
          status: job.status,
          templateVersion: job.templateVersion,
          createdAt: job.createdAt,
        })),
        events: DEMO_AUDIT_EVENTS.map((event) => ({
          id: event.id,
          action: event.action,
          targetId: event.target,
          createdAt: event.at,
        })),
        projectNameById,
      }}
    />
  );
}

function ConvexOverview() {
  const projects = useQuery(api.projects.list);
  const jobs = useQuery(api.scaffoldJobs.listForUser);
  const events = useQuery(api.auditEvents.listForUser, { limit: 10 });

  if (projects === undefined || jobs === undefined || events === undefined) {
    return <div className="text-sm text-muted-foreground">Loading workspace…</div>;
  }

  const projectNameById = Object.fromEntries(projects.map((project) => [project._id, project.name]));

  return (
    <OverviewView
      data={{
        source: "convex",
        projects: projects.map((project) => ({
          id: project._id,
          name: project.name,
          slug: project.slug,
          structure: project.structure,
          status: project.status,
          updatedAt: project.updatedAt,
        })),
        jobs: jobs.map((job) => ({
          id: job._id,
          projectId: job.projectId,
          status: job.status,
          templateVersion: job.templateVersion,
          createdAt: job.createdAt,
        })),
        events: events.map((event) => ({
          id: event._id,
          action: event.action,
          targetId: event.targetId,
          createdAt: event.createdAt,
        })),
        projectNameById,
      }}
    />
  );
}

function UnconfiguredOverview() {
  return (
    <EmptyState
      icon={SlidersHorizontal}
      title="Data is not configured"
      description="Set NEXT_PUBLIC_CONVEX_URL to use live data. In development, an empty env file falls back to fixtures."
      action={
        <Button asChild>
          <Link href="/setup">Open setup checklist</Link>
        </Button>
      }
    />
  );
}

export function DashboardOverview() {
  const capabilities = getCapabilities();
  if (capabilities.data.mode === "convex") return <ConvexOverview />;
  if (capabilities.data.mode === "fixtures") return <FixturesOverview />;
  return <UnconfiguredOverview />;
}
