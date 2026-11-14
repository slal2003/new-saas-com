/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * Regenerate with `npx convex codegen` after `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as notes from "../notes.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type { ComponentApi as AuthCoreApi } from "@convex-dev/auth/_generated/component.js";
import type { ComponentApi as AuthPasswordApi } from "@convex-dev/auth/components/password/_generated/component.js";
import type { ComponentApi as AuthUsernameApi } from "@convex-dev/auth/components/username/_generated/component.js";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  notes: typeof notes;
  users: typeof users;
}>;

export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  auth: AuthCoreApi<"auth">;
  authPassword: AuthPasswordApi<"authPassword">;
  authUsername: AuthUsernameApi<"authUsername">;
};
