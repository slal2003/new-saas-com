import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

export const listForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== userId) {
      throw new Error("Project not found.");
    }
    return await ctx.db
      .query("specs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const latestForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== userId) {
      throw new Error("Project not found.");
    }
    const specs = await ctx.db
      .query("specs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(1);
    return specs[0] ?? null;
  },
});
