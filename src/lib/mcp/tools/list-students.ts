import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_students",
  title: "List students",
  description:
    "List students visible to the signed-in user, optionally filtered by grade, section, status, or a name/email search.",
  inputSchema: {
    search: z.string().trim().optional().describe("Match against name or email."),
    grade: z.string().trim().optional().describe("Filter by grade."),
    section: z.string().trim().optional().describe("Filter by section."),
    status: z.string().trim().optional().describe("Filter by status, e.g. active."),
    limit: z.number().int().min(1).max(100).default(25).describe("Max rows to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, grade, section, status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("students")
      .select("id, student_id, name, email, grade, section, status, enrollment_date")
      .order("name", { ascending: true })
      .limit(limit);

    if (grade) query = query.eq("grade", grade);
    if (section) query = query.eq("section", section);
    if (status) query = query.eq("status", status);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { students: data ?? [] },
    };
  },
});
