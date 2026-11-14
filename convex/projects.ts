import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

const structureValidator = v.union(v.literal("simple"), v.literal("complex"));
const authValidator = v.union(v.literal("convex-auth"), v.literal("clerk"));

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== userId) {
      throw new Error("Project not found.");
    }
    return project;
  },
});

/**
 * Persists a spec validated by the shared project spec module at the API boundary.
 * The schema lives in exactly one place; Convex stores the validated snapshot.
 */
export const createFromSpec = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    structure: structureValidator,
    auth: authValidator,
    payments: v.union(v.literal("stripe"), v.literal("none")),
    templateVersion: v.string(),
    schemaVersion: v.number(),
    rawYaml: v.string(),
    spec: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const slug = args.slug.trim().toLowerCase();
    if (!SLUG_PATTERN.test(slug)) {
      throw new Error("Slug must contain lowercase letters, numbers, and hyphens.");
    }

    const existing = await ctx.db
      .query("projects")
      .withIndex("by_owner_slug", (q) => q.eq("ownerId", userId).eq("slug", slug))
      .unique();
    if (existing) {
      throw new Error(`You already have a project with slug "${slug}".`);
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      ownerId: userId,
      name: args.name,
      slug,
      description: args.description,
      structure: args.structure,
      auth: args.auth,
      payments: args.payments,
      templateVersion: args.templateVersion,
      status: "scaffolded",
      createdAt: now,
      updatedAt: now,
    });

    const specId = await ctx.db.insert("specs", {
      projectId,
      ownerId: userId,
      schemaVersion: args.schemaVersion,
      rawYaml: args.rawYaml,
      spec: args.spec,
      createdAt: now,
    });

    await ctx.db.patch(projectId, { currentSpecId: specId, updatedAt: now });

    await ctx.db.insert("auditEvents", {
      ownerId: userId,
      actorId: userId,
      action: "project.created",
      targetType: "project",
      targetId: projectId,
      metadata: { slug, templateVersion: args.templateVersion },
      createdAt: now,
    });

    return { projectId, specId };
  },
});
