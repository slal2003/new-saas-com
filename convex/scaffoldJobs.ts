import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

const structureValidator = v.union(v.literal("simple"), v.literal("complex"));

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("scaffoldJobs")
      .withIndex("by_owner_status", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { jobId: v.id("scaffoldJobs") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.ownerId !== userId) {
      throw new Error("Scaffold job not found.");
    }
    return job;
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    specId: v.id("specs"),
    templateVersion: v.string(),
    structure: structureValidator,
  },
  returns: v.id("scaffoldJobs"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== userId) {
      throw new Error("Project not found.");
    }
    const spec = await ctx.db.get(args.specId);
    if (!spec || spec.projectId !== args.projectId) {
      throw new Error("Spec not found for this project.");
    }
    const now = Date.now();
    const jobId = await ctx.db.insert("scaffoldJobs", {
      projectId: args.projectId,
      ownerId: userId,
      specId: args.specId,
      templateVersion: args.templateVersion,
      structure: args.structure,
      status: "queued",
      logs: [{ at: now, level: "info", message: "Scaffold job queued." }],
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("auditEvents", {
      ownerId: userId,
      actorId: userId,
      action: "scaffold.queued",
      targetType: "scaffoldJob",
      targetId: jobId,
      metadata: { projectId: args.projectId, templateVersion: args.templateVersion },
      createdAt: now,
    });
    return jobId;
  },
});

export const markStatus = internalMutation({
  args: {
    jobId: v.id("scaffoldJobs"),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("ready"),
      v.literal("failed"),
    ),
    message: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Scaffold job not found.");
    const now = Date.now();
    await ctx.db.patch(args.jobId, {
      status: args.status,
      error: args.error,
      updatedAt: now,
      logs: [
        ...job.logs,
        {
          at: now,
          level: args.status === "failed" ? "error" : "info",
          message: args.message ?? `Status changed to ${args.status}.`,
        },
      ],
    });
    return null;
  },
});
