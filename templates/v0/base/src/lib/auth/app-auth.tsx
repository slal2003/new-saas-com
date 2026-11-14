"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  useSignInWithUsernamePassword,
  useSignUpWithUsernamePassword,
} from "@convex-dev/auth/methods/username-password/react";
import { api } from "@/convex/_generated/api";
import { getCapabilities, type AuthMode } from "@/lib/capabilities";
import { DEMO_USER, type DemoUser } from "@/lib/demo/fixtures";

export type AppUser = {
  id: string;
  name: string;
  email?: string;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthResult = { ok: true } | { ok: false; error: string };

export type AppAuth = {
  mode: AuthMode;
  status: AuthStatus;
  user: AppUser | null;
  pending: boolean;
  canSignUp: boolean;
  signIn: (username: string, password: string) => Promise<AuthResult>;
  signUp: (username: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AppAuthContext = createContext<AppAuth | null>(null);
const DEMO_SIGNED_OUT_KEY = "{{project.slug}}:demo-signed-out";

function authErrorMessage(error: string): string {
  switch (error) {
    case "INVALID_CREDENTIALS":
      return "The username or password is incorrect.";
    case "USER_NOT_FOUND":
      return "No account matches that username.";
    case "USERNAME_TAKEN":
      return "That username is already taken.";
    case "RATE_LIMITED":
      return "Too many attempts. Wait a moment and try again.";
    case "PASSWORD_TOO_SHORT":
      return "Use a longer password.";
    case "PASSWORD_TOO_LONG":
      return "Use a shorter password.";
    case "USERNAME_TOO_SHORT":
      return "Use a longer username.";
    case "USERNAME_TOO_LONG":
      return "Use a shorter username.";
    case "USERNAME_HAS_INVALID_CHARACTERS":
      return "Use letters, numbers, dots, dashes, or underscores in the username.";
    default:
      return "Sign-in failed. Try again.";
  }
}

function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const signedOut = window.localStorage.getItem(DEMO_SIGNED_OUT_KEY) === "1";
    setUser(signedOut ? null : { ...DEMO_USER });
    setStatus(signedOut ? "unauthenticated" : "authenticated");
  }, []);

  const signIn = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    if (!username.trim() || !password) {
      return { ok: false, error: "Enter any username and password in demo mode." };
    }
    window.localStorage.removeItem(DEMO_SIGNED_OUT_KEY);
    const demoUser: DemoUser = {
      ...DEMO_USER,
      name: username.trim(),
      email: `${username.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".")}@demo.local`,
    };
    setUser(demoUser);
    setStatus("authenticated");
    return { ok: true };
  }, []);

  const signUp = useCallback(
    async (username: string, password: string) => signIn(username, password),
    [signIn],
  );

  const signOut = useCallback(async () => {
    window.localStorage.setItem(DEMO_SIGNED_OUT_KEY, "1");
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AppAuth>(
    () => ({
      mode: "demo",
      status,
      user,
      pending: false,
      canSignUp: true,
      signIn,
      signUp,
      signOut,
    }),
    [status, user, signIn, signUp, signOut],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

function UnconfiguredAuthProvider({ children }: { children: ReactNode }) {
  const signIn = useCallback(
    async (): Promise<AuthResult> => ({
      ok: false,
      error: "Auth is not configured. Open /setup for the missing variables.",
    }),
    [],
  );
  const signOut = useCallback(async () => undefined, []);

  const value = useMemo<AppAuth>(
    () => ({
      mode: "unconfigured",
      status: "unauthenticated",
      user: null,
      pending: false,
      canSignUp: false,
      signIn,
      signUp: signIn,
      signOut,
    }),
    [signIn, signOut],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

function RealAuthProvider({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");
  const { signOut: convexSignOut } = useAuthActions();
  const { signIn: convexSignIn, pending: signInPending } = useSignInWithUsernamePassword(api.auth);
  const { signUp: convexSignUp, pending: signUpPending } = useSignUpWithUsernamePassword(api.auth);

  const signIn = useCallback(
    async (username: string, password: string): Promise<AuthResult> => {
      const result = await convexSignIn({ username, password });
      if (result.status === "complete") return { ok: true };
      return { ok: false, error: authErrorMessage(result.userError.error) };
    },
    [convexSignIn],
  );

  const signUp = useCallback(
    async (username: string, password: string): Promise<AuthResult> => {
      const result = await convexSignUp({ username, password });
      if (result.status === "complete") return { ok: true };
      return { ok: false, error: authErrorMessage(result.userError.error) };
    },
    [convexSignUp],
  );

  const signOut = useCallback(async () => {
    await convexSignOut();
  }, [convexSignOut]);

  const status: AuthStatus =
    isLoading || (isAuthenticated && me === undefined)
      ? "loading"
      : isAuthenticated
        ? "authenticated"
        : "unauthenticated";

  const user: AppUser | null = me
    ? { id: me.user._id, name: me.user.name }
    : isAuthenticated
      ? { id: "unknown", name: "Account" }
      : null;

  const value = useMemo<AppAuth>(
    () => ({
      mode: "real",
      status,
      user,
      pending: signInPending || signUpPending,
      canSignUp: true,
      signIn,
      signUp,
      signOut,
    }),
    [status, user, signInPending, signUpPending, signIn, signUp, signOut],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const capabilities = getCapabilities();
  if (capabilities.auth.mode === "real") {
    return <RealAuthProvider>{children}</RealAuthProvider>;
  }
  if (capabilities.auth.mode === "demo") {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }
  return <UnconfiguredAuthProvider>{children}</UnconfiguredAuthProvider>;
}

export function useAppAuth(): AppAuth {
  const value = useContext(AppAuthContext);
  if (!value) {
    throw new Error("useAppAuth must be used inside AppAuthProvider.");
  }
  return value;
}
