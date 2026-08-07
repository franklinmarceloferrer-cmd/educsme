import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_study_materials",
  title: "List study materials",
  description:
    "List GCSE study materials, optionally filtered by subject or topic, ordered by their study-grid position.",
  inputSchema: {
    subject: z.string().trim().optional().describe("Filter by subject."),
    topic: z.string().trim().optional().describe("Filter by topic."),
    limit: z.number().int().min(1).max(100).default(25).describe("Max rows to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ subject, topic, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("study_materials")
      .select("id, subject, topic, title, content, order_index, updated_at")
      .order("order_index", { ascending: true })
      .limit(limit);

    if (subject) query = query.eq("subject", subject);
    if (topic) query = query.eq("topic", topic);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { materials: data ?? [] },
    };
  },
});
