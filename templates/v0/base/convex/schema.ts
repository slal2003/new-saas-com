import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /** App profile for a Convex Auth user. The auth component owns usernames. */
  users: defineTable({
    name: v.string(),
    imageUrl: v.optional(v.string()),
    lastSeenAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  /** Sample domain table. Replace with your product's entities. */
  notes: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    body: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),
});
