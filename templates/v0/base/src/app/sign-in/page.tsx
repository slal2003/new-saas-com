"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppAuth } from "@/lib/auth/app-auth";

export default function SignInPage() {
  const router = useRouter();
  const { mode, status, canSignUp, pending, signIn, signUp } = useAppAuth();
  const [formMode, setFormMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = formMode === "signin" ? await signIn(username, password) : await signUp(username, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <Card>
          <CardHeader>
            <div className="mb-1 flex items-center justify-between gap-2">
              <CardTitle className="text-xl">
                {formMode === "signin" ? "Sign in" : "Create an account"}
              </CardTitle>
              {mode === "demo" && <Badge variant="subtle">demo auth</Badge>}
              {mode === "real" && <Badge variant="success">Convex Auth v2</Badge>}
            </div>
            <CardDescription>
              {mode === "demo"
                ? "Demo mode: any username and password work. Sessions stay in this browser."
                : mode === "real"
                  ? "Username and password, managed inside Convex. No external auth service."
                  : "Auth is not configured yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "unconfigured" ? (
              <div className="space-y-4">
                <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  This deployment has no auth backend. Open <Link href="/setup" className="font-medium text-primary hover:underline">/setup</Link>{" "}
                  to see the missing settings.
                </p>
                <Button className="w-full" asChild>
                  <Link href="/setup">Open setup checklist</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="username"
                      autoComplete="username"
                      className="pl-9"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete={formMode === "signin" ? "current-password" : "new-password"}
                      className="pl-9"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                    {error}
                  </p>
                )}

                <Button className="w-full" type="submit" disabled={pending}>
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
                  {formMode === "signin" ? "Sign in" : "Create account"}
                </Button>

                {canSignUp && (
                  <button
                    type="button"
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setFormMode(formMode === "signin" ? "signup" : "signin");
                      setError(null);
                    }}
                  >
                    {formMode === "signin"
                      ? "Need an account? Create one with a username."
                      : "Already have an account? Sign in."}
                  </button>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
