export type DemoUser = {
  id: string;
  name: string;
  email: string;
};

export type DemoProject = {
  id: string;
  name: string;
  slug: string;
  structure: "simple" | "complex";
  auth: "convex-auth" | "clerk";
  templateVersion: string;
  status: "draft" | "scaffolded" | "provisioning" | "ready" | "failed";
  updatedAt: string;
};

export type DemoScaffoldJob = {
  id: string;
  projectName: string;
  status: "queued" | "running" | "ready" | "failed";
  templateVersion: string;
  createdAt: string;
};

export type DemoAuditEvent = {
  id: string;
  action: string;
  target: string;
  at: string;
};

export const DEMO_USER: DemoUser = {
  id: "demo-user",
  name: "Demo Builder",
  email: "demo@new-saas.local",
};

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: "demo-project-1",
    name: "Northstar Notes",
    slug: "northstar-notes",
    structure: "simple",
    auth: "convex-auth",
    templateVersion: "0.1.0",
    status: "ready",
    updatedAt: "2026-11-14T09:20:00.000Z",
  },
  {
    id: "demo-project-2",
    name: "Invoice Pocket",
    slug: "invoice-pocket",
    structure: "simple",
    auth: "convex-auth",
    templateVersion: "0.1.0",
    status: "scaffolded",
    updatedAt: "2026-11-13T16:05:00.000Z",
  },
];

export const DEMO_SCAFFOLD_JOBS: DemoScaffoldJob[] = [
  {
    id: "demo-job-1",
    projectName: "Northstar Notes",
    status: "ready",
    templateVersion: "0.1.0",
    createdAt: "2026-11-14T09:19:00.000Z",
  },
  {
    id: "demo-job-2",
    projectName: "Invoice Pocket",
    status: "queued",
    templateVersion: "0.1.0",
    createdAt: "2026-11-13T16:04:00.000Z",
  },
];

export const DEMO_AUDIT_EVENTS: DemoAuditEvent[] = [
  {
    id: "demo-event-1",
    action: "project.created",
    target: "project:northstar-notes",
    at: "2026-11-14T09:18:00.000Z",
  },
  {
    id: "demo-event-2",
    action: "scaffold.queued",
    target: "scaffoldJob:demo-job-2",
    at: "2026-11-13T16:04:00.000Z",
  },
  {
    id: "demo-event-3",
    action: "provision.plan",
    target: "provisionJob:dry-run-only",
    at: "2026-11-13T15:50:00.000Z",
  },
];

export const DEMO_STATS = {
  projects: DEMO_PROJECTS.length,
  scaffoldJobs: DEMO_SCAFFOLD_JOBS.length,
  readyProjects: DEMO_PROJECTS.filter((project) => project.status === "ready").length,
  auditEvents: DEMO_AUDIT_EVENTS.length,
};
