import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_announcements",
  title: "List announcements",
  description:
    "List announcements visible to the signed-in user, newest first, optionally filtered by category or priority.",
  inputSchema: {
    category: z.string().trim().optional().describe("Filter by announcement category."),
    priority: z.string().trim().optional().describe("Filter by priority, e.g. high."),
    publishedOnly: z.boolean().default(true).describe("Only return published announcements."),
    limit: z.number().int().min(1).max(50).default(20).describe("Max rows to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, priority, publishedOnly, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("announcements")
      .select("id, title, content, category, priority, is_published, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (category) query = query.eq("category", category);
    if (priority) query = query.eq("priority", priority);
    if (publishedOnly) query = query.eq("is_published", true);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { announcements: data ?? [] },
    };
  },
});
