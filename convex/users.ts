import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

const methodValidator = v.object({
  name: v.string(),
  profile: v.any(),
});

export const createUser = internalMutation({
  args: { method: methodValidator },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("users", {
      name: args.method.name === "usernamePassword" ? "New account" : "New account",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const onSignIn = internalMutation({
  args: {
    method: methodValidator,
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { lastSeenAt: Date.now(), updatedAt: Date.now() });
    return null;
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
    return { user, projectCount: projects.length };
  },
});

export const updateProfile = mutation({
  args: { name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const name = args.name.trim();
    if (name.length < 1 || name.length > 80) {
      throw new Error("Display name must be between 1 and 80 characters.");
    }
    await ctx.db.patch(userId, { name, updatedAt: Date.now() });
    return null;
  },
});
