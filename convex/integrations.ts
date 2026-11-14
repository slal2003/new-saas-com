import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

const providerValidator = v.union(v.literal("cloudflare"), v.literal("dokploy"));

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const integrations = await ctx.db
      .query("integrations")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
    // Secrets never leave the server. Only safe metadata is returned.
    return integrations.map((integration) => ({
      _id: integration._id,
      provider: integration.provider,
      label: integration.label,
      hint: integration.hint,
      lastVerifiedAt: integration.lastVerifiedAt,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    }));
  },
});

export const upsert = mutation({
  args: {
    provider: providerValidator,
    label: v.string(),
    secretCiphertext: v.string(),
    secretIv: v.string(),
    secretSalt: v.string(),
    hint: v.string(),
  },
  returns: v.id("integrations"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_owner_provider", (q) =>
        q.eq("ownerId", userId).eq("provider", args.provider),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        label: args.label,
        secretCiphertext: args.secretCiphertext,
        secretIv: args.secretIv,
        secretSalt: args.secretSalt,
        hint: args.hint,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("integrations", {
      ownerId: userId,
      provider: args.provider,
      label: args.label,
      secretCiphertext: args.secretCiphertext,
      secretIv: args.secretIv,
      secretSalt: args.secretSalt,
      hint: args.hint,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { integrationId: v.id("integrations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const integration = await ctx.db.get(args.integrationId);
    if (!integration || integration.ownerId !== userId) {
      throw new Error("Integration not found.");
    }
    await ctx.db.delete(args.integrationId);
    await ctx.db.insert("auditEvents", {
      ownerId: userId,
      actorId: userId,
      action: "integration.removed",
      targetType: "integration",
      targetId: args.integrationId,
      metadata: { provider: integration.provider },
      createdAt: Date.now(),
    });
    return null;
  },
});
