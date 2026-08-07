import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_announcement",
  title: "Create announcement",
  description:
    "Create a new announcement authored by the signed-in user. Requires permission to publish announcements.",
  inputSchema: {
    title: z.string().trim().min(1).max(200).describe("Announcement title."),
    content: z.string().trim().min(1).describe("Announcement body text."),
    category: z.string().trim().default("general").describe("Announcement category."),
    priority: z
      .enum(["low", "medium", "high"])
      .default("medium")
      .describe("Announcement priority."),
    isPublished: z.boolean().default(false).describe("Publish immediately or keep as draft."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, content, category, priority, isPublished }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("announcements")
      .insert({
        author_id: ctx.getUserId(),
        title,
        content,
        category,
        priority,
        is_published: isPublished,
      })
      .select()
      .single();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { announcement: data },
    };
  },
});
