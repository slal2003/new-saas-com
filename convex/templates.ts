import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("templates").order("desc").collect();
  },
});

export const get = query({
  args: { templateId: v.string(), version: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_template_version", (q) =>
        q.eq("templateId", args.templateId).eq("version", args.version),
      )
      .unique();
  },
});

export const register = internalMutation({
  args: {
    templateId: v.string(),
    version: v.string(),
    structure: v.union(v.literal("simple"), v.literal("complex")),
    checksum: v.string(),
  },
  returns: v.id("templates"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("templates")
      .withIndex("by_template_version", (q) =>
        q.eq("templateId", args.templateId).eq("version", args.version),
      )
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("templates", {
      ...args,
      publishedAt: Date.now(),
    });
  },
});
