import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const structureValidator = v.union(v.literal("simple"), v.literal("complex"));
const authProviderValidator = v.union(v.literal("convex-auth"), v.literal("clerk"));
const projectStatusValidator = v.union(
  v.literal("draft"),
  v.literal("scaffolded"),
  v.literal("provisioning"),
  v.literal("ready"),
  v.literal("failed"),
);
const jobStatusValidator = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("ready"),
  v.literal("failed"),
);
const provisionStatusValidator = v.union(
  v.literal("plan"),
  v.literal("dry_run"),
  v.literal("awaiting_confirmation"),
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
);
const logValidator = v.object({
  at: v.number(),
  level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
  message: v.string(),
});

export default defineSchema({
  /** App profile for a Convex Auth user. The auth component owns usernames. */
  users: defineTable({
    name: v.string(),
    imageUrl: v.optional(v.string()),
    lastSeenAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  projects: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    structure: structureValidator,
    auth: authProviderValidator,
    payments: v.union(v.literal("stripe"), v.literal("none")),
    templateVersion: v.string(),
    currentSpecId: v.optional(v.id("specs")),
    status: projectStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_slug", ["ownerId", "slug"])
    .index("by_status", ["status"]),

  /** Immutable snapshots of project.yaml. Never mutate a spec row. */
  specs: defineTable({
    projectId: v.id("projects"),
    ownerId: v.id("users"),
    schemaVersion: v.number(),
    rawYaml: v.string(),
    spec: v.any(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_owner", ["ownerId"]),

  templates: defineTable({
    templateId: v.string(),
    version: v.string(),
    structure: structureValidator,
    checksum: v.string(),
    publishedAt: v.number(),
  })
    .index("by_template_version", ["templateId", "version"])
    .index("by_structure", ["structure"]),

  scaffoldJobs: defineTable({
    projectId: v.id("projects"),
    ownerId: v.id("users"),
    specId: v.id("specs"),
    templateVersion: v.string(),
    structure: structureValidator,
    status: jobStatusValidator,
    artifactStorageId: v.optional(v.id("_storage")),
    logs: v.array(logValidator),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_owner_status", ["ownerId", "status"]),

  /** Provider credentials are stored encrypted; only references leave the server. */
  integrations: defineTable({
    ownerId: v.id("users"),
    provider: v.union(v.literal("cloudflare"), v.literal("dokploy")),
    label: v.string(),
    secretCiphertext: v.string(),
    secretIv: v.string(),
    secretSalt: v.string(),
    hint: v.string(),
    lastVerifiedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_provider", ["ownerId", "provider"]),

  /** Provisioning is plan -> dry-run -> explicit confirm -> execute. Stubbed in v0. */
  provisionJobs: defineTable({
    projectId: v.id("projects"),
    ownerId: v.id("users"),
    plan: v.any(),
    dryRunResult: v.optional(v.any()),
    status: provisionStatusValidator,
    confirmations: v.array(v.string()),
    logs: v.array(logValidator),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_owner", ["ownerId"]),

  auditEvents: defineTable({
    ownerId: v.optional(v.id("users")),
    actorId: v.optional(v.id("users")),
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_created_at", ["createdAt"]),
});
