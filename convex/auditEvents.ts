import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

export const record = internalMutation({
  args: {
    ownerId: v.optional(v.id("users")),
    actorId: v.optional(v.id("users")),
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("auditEvents"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditEvents", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listForUser = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
    return await ctx.db
      .query("auditEvents")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .take(limit);
  },
});
