import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("notes")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: { title: v.string(), body: v.string() },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("Title is required.");
    const now = Date.now();
    return await ctx.db.insert("notes", {
      ownerId: userId,
      title,
      body: args.body,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { noteId: v.id("notes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note || note.ownerId !== userId) throw new Error("Note not found.");
    await ctx.db.delete(args.noteId);
    return null;
  },
});
