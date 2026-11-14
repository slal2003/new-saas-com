import { ConvexReactClient } from "convex/react";
import { getCapabilities } from "@/lib/capabilities";

const capabilities = getCapabilities();
const convexUrl = capabilities.data.convexUrl;

export const convex =
  capabilities.auth.mode === "real" && convexUrl ? new ConvexReactClient(convexUrl) : null;
