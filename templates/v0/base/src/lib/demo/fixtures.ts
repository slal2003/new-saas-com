export type DemoUser = {
  id: string;
  name: string;
  email: string;
};

export type DemoNote = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
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
  email: "demo@example.local",
};

export const DEMO_NOTES: DemoNote[] = [
  {
    id: "demo-note-1",
    title: "Replace the sample domain",
    body: "The notes table is a placeholder. Rename it, add your fields, and keep queries scoped by ownerId.",
    updatedAt: "2026-11-14T09:20:00.000Z",
  },
  {
    id: "demo-note-2",
    title: "Wire the real Convex deployment",
    body: "Run npx convex dev, copy NEXT_PUBLIC_CONVEX_URL, and switch NEXT_PUBLIC_DATA_MODE=convex.",
    updatedAt: "2026-11-13T16:05:00.000Z",
  },
];

export const DEMO_AUDIT_EVENTS: DemoAuditEvent[] = [
  {
    id: "demo-event-1",
    action: "note.created",
    target: "note:demo-note-1",
    at: "2026-11-14T09:18:00.000Z",
  },
  {
    id: "demo-event-2",
    action: "auth.sign_in",
    target: "user:demo-user",
    at: "2026-11-13T16:04:00.000Z",
  },
];

export const DEMO_STATS = {
  notes: DEMO_NOTES.length,
  events: DEMO_AUDIT_EVENTS.length,
};
