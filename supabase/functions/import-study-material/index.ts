import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { canImportStudyMaterial, isPublicWebUrl } from "./validation.ts";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firecrawl/v2/scrape";
const BodySchema = z.object({ url: z.string().trim().max(2048).refine(isPublicWebUrl) }).strict();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);
    const backendUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!backendUrl || !anonKey) return json({ error: "Service not configured" }, 503);
    const client = createClient(backendUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) return json({ error: "Authentication required" }, 401);
    // Read the existing protected role, never client metadata or browser state.
    const { data: profile, error: profileError } = await client.from("profiles").select("role").eq("user_id", auth.user.id).single();
    if (profileError || !canImportStudyMaterial(profile?.role)) return json({ error: "Only teachers and administrators can import materials" }, 403);
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Enter a public HTTPS page URL" }, 400);
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey || !lovableKey) return json({ error: "Firecrawl is not configured" }, 503);
    const response = await fetch(GATEWAY_URL, {
      method: "POST", signal: AbortSignal.timeout(60000),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": apiKey },
      body: JSON.stringify({ url: parsed.data.url, formats: ["html"], onlyMainContent: true }),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error(`Firecrawl failed [${response.status}]: ${details}`);
      return json({ error: "Provider request failed", status: response.status, details }, response.status);
    }
    const result = await response.json();
    if (!result.success) return json({ error: result.error || "Firecrawl could not extract this page" }, 502);
    const html = result.data?.html;
    if (typeof html !== "string" || !html.trim()) return json({ error: "No educational content found on this page" }, 422);
    if (html.length > 500000) return json({ error: "This page is too large to import" }, 422);
    return json({ title: result.data.metadata?.title || "", html, sourceUrl: parsed.data.url,
      fetchedAt: new Date().toISOString(), creditsUsed: result.creditsUsed ?? result.data?.creditsUsed ?? null });
  } catch (error) {
    console.error("import-study-material failed", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Unable to import this page. Please try again." }, 500);
  }
});