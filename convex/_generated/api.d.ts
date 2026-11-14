/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * Regenerate with `npx convex codegen` after `npx convex dev`.
 * @module
 */

import type * as auditEvents from "../auditEvents.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as integrations from "../integrations.js";
import type * as lib_auth from "../lib/auth.js";
import type * as projects from "../projects.js";
import type * as provisionJobs from "../provisionJobs.js";
import type * as scaffoldJobs from "../scaffoldJobs.js";
import type * as specs from "../specs.js";
import type * as templates from "../templates.js";
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
  auditEvents: typeof auditEvents;
  auth: typeof auth;
  http: typeof http;
  integrations: typeof integrations;
  "lib/auth": typeof lib_auth;
  projects: typeof projects;
  provisionJobs: typeof provisionJobs;
  scaffoldJobs: typeof scaffoldJobs;
  specs: typeof specs;
  templates: typeof templates;
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
