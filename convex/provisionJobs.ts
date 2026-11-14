import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

const statusValidator = v.union(
  v.literal("plan"),
  v.literal("dry_run"),
  v.literal("awaiting_confirmation"),
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
);

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("provisionJobs")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();
  },
});

/**
 * v0 records a plan only. A later worker executes it after a dry-run and a
 * typed confirmation. No external provider API is called here.
 */
export const createPlan = mutation({
  args: {
    projectId: v.id("projects"),
    plan: v.any(),
  },
  returns: v.id("provisionJobs"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== userId) {
      throw new Error("Project not found.");
    }
    const now = Date.now();
    return await ctx.db.insert("provisionJobs", {
      projectId: args.projectId,
      ownerId: userId,
      plan: args.plan,
      status: "plan",
      confirmations: [],
      logs: [{ at: now, level: "info", message: "Provisioning plan recorded (stubbed)." }],
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * A destructive step requires a confirmation equal to the step id, so a
 * generic "yes" cannot start provisioning.
 */
export const confirmStep = mutation({
  args: {
    jobId: v.id("provisionJobs"),
    stepId: v.string(),
    confirmation: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.ownerId !== userId) {
      throw new Error("Provisioning job not found.");
    }
    if (args.confirmation !== args.stepId) {
      throw new Error(`Type "${args.stepId}" to confirm this step.`);
    }
    const now = Date.now();
    await ctx.db.patch(args.jobId, {
      confirmations: [...job.confirmations, args.stepId],
      status: "awaiting_confirmation",
      updatedAt: now,
      logs: [
        ...job.logs,
        { at: now, level: "info", message: `Confirmed step ${args.stepId}.` },
      ],
    });
    await ctx.db.insert("auditEvents", {
      ownerId: userId,
      actorId: userId,
      action: "provision.confirmed",
      targetType: "provisionJob",
      targetId: args.jobId,
      metadata: { stepId: args.stepId },
      createdAt: now,
    });
    return null;
  },
});

export const markStatus = mutation({
  args: {
    jobId: v.id("provisionJobs"),
    status: statusValidator,
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.ownerId !== userId) {
      throw new Error("Provisioning job not found.");
    }
    const now = Date.now();
    await ctx.db.patch(args.jobId, {
      status: args.status,
      updatedAt: now,
      logs: [...job.logs, { at: now, level: "info", message: args.message }],
    });
    return null;
  },
});
