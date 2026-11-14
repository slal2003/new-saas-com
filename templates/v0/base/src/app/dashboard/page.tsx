"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  CheckCircle2,
  Plus,
  ScrollText,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppAuth } from "@/lib/auth/app-auth";
import { getCapabilities } from "@/lib/capabilities";
import { DEMO_AUDIT_EVENTS, DEMO_NOTES } from "@/lib/demo/fixtures";
import { relativeTime } from "@/lib/format";

type NoteRow = { id: string; title: string; body: string; updatedAt: number | string };

function NotesView({
  notes,
  source,
  children,
}: {
  notes: NoteRow[];
  source: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
            <Badge variant={source === "convex" ? "success" : "subtle"}>{source}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            This is the generic base. Replace the sample notes with your domain.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/setup">
            <SlidersHorizontal className="size-3.5" /> Setup
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Notes" value={notes.length} hint="Sample records" icon={BookOpen} />
        <StatCard label="Audit events" value={DEMO_AUDIT_EVENTS.length} hint="Demo feed" icon={ScrollText} />
        <StatCard label="Auth" value="Convex Auth v2" hint="No external service" icon={CheckCircle2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sample notes</CardTitle>
            <CardDescription>Queries are scoped by the signed-in identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {children}
            {notes.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No notes yet"
                description="Create one to exercise the mutation path, or replace this table with your domain."
              />
            ) : (
              notes.map((note) => (
                <div key={note.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{note.title}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {relativeTime(note.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{note.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ScrollText className="size-4 text-primary" /> Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_AUDIT_EVENTS.map((event) => (
              <div key={event.id} className="rounded-md border border-border px-2.5 py-2 text-xs">
                <p className="font-mono">{event.action}</p>
                <p className="mt-0.5 truncate text-muted-foreground">
                  {event.target} · {relativeTime(event.at)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FixturesDashboard() {
  return (
    <NotesView
      source="fixtures"
      notes={DEMO_NOTES.map((note) => ({
        id: note.id,
        title: note.title,
        body: note.body,
        updatedAt: note.updatedAt,
      }))}
    />
  );
}

function ConvexDashboard() {
  const notes = useQuery(api.notes.list);
  const createNote = useMutation(api.notes.create);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (notes === undefined) {
    return <p className="text-sm text-muted-foreground">Loading dashboard…</p>;
  }

  async function addNote() {
    setError(null);
    if (!title.trim()) {
      setError("A title is required.");
      return;
    }
    try {
      await createNote({ title, body });
      setTitle("");
      setBody("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the note.");
    }
  }

  return (
    <NotesView
      source="convex"
      notes={notes.map((note) => ({
        id: note._id,
        title: note.title,
        body: note.body,
        updatedAt: note.updatedAt,
      }))}
    >
      <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
        <Input
          placeholder="Note title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Textarea
          placeholder="Body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button size="sm" onClick={() => void addNote()}>
          <Plus className="size-3.5" /> Add note
        </Button>
      </div>
    </NotesView>
  );
}

function UnconfiguredDashboard() {
  return (
    <EmptyState
      icon={SlidersHorizontal}
      title="Data is not configured"
      description="Set NEXT_PUBLIC_CONVEX_URL for live data, or run in development with an empty env file for fixtures."
      action={
        <Button asChild>
          <Link href="/setup">Open setup</Link>
        </Button>
      }
    />
  );
}

export default function DashboardPage() {
  const capabilities = getCapabilities();
  const { user } = useAppAuth();

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Signed in as {user?.name ?? "account"} · {capabilities.data.mode} data
      </p>
      {capabilities.data.mode === "convex" ? (
        <ConvexDashboard />
      ) : capabilities.data.mode === "fixtures" ? (
        <FixturesDashboard />
      ) : (
        <UnconfiguredDashboard />
      )}
    </div>
  );
}
