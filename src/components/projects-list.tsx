"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Blocks, FolderKanban, Plus, SlidersHorizontal } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { getCapabilities } from "@/lib/capabilities";
import { DEMO_PROJECTS } from "@/lib/demo/fixtures";
import { relativeTime } from "@/lib/format";

type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  structure: string;
  auth: string;
  status: string;
  templateVersion: string;
  updatedAt: number | string;
};

function ProjectsView({ projects, source }: { projects: ProjectRow[]; source: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Projects</h1>
            <Badge variant={source === "convex" ? "success" : "subtle"}>{source}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Every project keeps immutable spec snapshots and a template version pin.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="size-4" /> New project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Blocks}
          title="No projects yet"
          description="Build a project from a validated spec to create the first one."
          action={
            <Button asChild>
              <Link href="/projects/new">Open the intake</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="size-4 text-primary" />
                      {project.name}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge variant={project.status === "ready" ? "success" : "subtle"}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{project.structure}</Badge>
                  <Badge variant="outline">{project.auth}</Badge>
                  <Badge variant="outline">v{project.templateVersion}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">{project.slug}</span>
                  <span>updated {relativeTime(project.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FixturesProjects() {
  return (
    <ProjectsView
      source="fixtures"
      projects={DEMO_PROJECTS.map((project) => ({
        id: project.id,
        name: project.name,
        slug: project.slug,
        description:
          project.id === "demo-project-1"
            ? "A focused note-taking SaaS for independent consultants."
            : "A tiny invoicing app with Stripe subscriptions.",
        structure: project.structure,
        auth: project.auth,
        status: project.status,
        templateVersion: project.templateVersion,
        updatedAt: project.updatedAt,
      }))}
    />
  );
}

function ConvexProjects() {
  const projects = useQuery(api.projects.list);
  if (projects === undefined) {
    return <p className="text-sm text-muted-foreground">Loading projects…</p>;
  }
  return (
    <ProjectsView
      source="convex"
      projects={projects.map((project) => ({
        id: project._id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        structure: project.structure,
        auth: project.auth,
        status: project.status,
        templateVersion: project.templateVersion,
        updatedAt: project.updatedAt,
      }))}
    />
  );
}

export function ProjectsList() {
  const capabilities = getCapabilities();
  if (capabilities.data.mode === "convex") return <ConvexProjects />;
  if (capabilities.data.mode === "fixtures") return <FixturesProjects />;
  return (
    <EmptyState
      icon={SlidersHorizontal}
      title="Data is not configured"
      description="Set NEXT_PUBLIC_CONVEX_URL to list live projects, or use development with an empty env file for fixtures."
      action={
        <Button asChild>
          <Link href="/setup">Open setup checklist</Link>
        </Button>
      }
    />
  );
}
