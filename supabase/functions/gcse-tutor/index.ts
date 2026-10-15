import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";
const MAX_INPUT_LENGTH = 1000;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "explanation", "keyPoints", "questions"],
  properties: {
    title: { type: "string" },
    explanation: { type: "string" },
    keyPoints: { type: "array", items: { type: "string" } },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "difficulty", "answer"],
        properties: {
          question: { type: "string" },
          difficulty: { type: "string", enum: ["foundation", "higher"] },
          answer: { type: "string" },
        },
      },
    },
  },
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function readFinalText(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let text = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      const event = JSON.parse(data);
      if (event.type === "response.output_text.delta") text += event.delta;
      if (event.type === "response.failed" || event.type === "error") {
        throw new Error(event.response?.error?.message ?? event.message ?? "AI request failed");
      }
    }
  }
  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Not authenticated" }, 401);
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return json({ error: "Not authenticated" }, 401);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured" }, 500);

  let payload: { subject?: unknown; prompt?: unknown; language?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  const subject = typeof payload.subject === "string" ? payload.subject.trim().slice(0, 100) : "";
  const language = payload.language === "pt" ? "Portuguese" : "English";
  if (!prompt || prompt.length > MAX_INPUT_LENGTH) {
    return json({ error: `Please enter a topic or question (max ${MAX_INPUT_LENGTH} characters).` }, 400);
  }

  const instructions =
    `You are a friendly, accurate GCSE tutor for UK students aged 14-16. ` +
    `Explain the topic clearly at GCSE level with a worked example where useful, ` +
    `list 3-5 key points, and write 4 practice questions (mix of foundation and higher) with concise model answers. ` +
    `Use plain text (no markdown symbols). Reply in ${language}.`;

  try {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      signal: req.signal,
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: MODEL,
        instructions,
        input: `${subject ? `Subject: ${subject}\n` : ""}Topic or question: ${prompt}`,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        text: { format: { type: "json_schema", name: "gcse_lesson", strict: true, schema: SCHEMA } },
      }),
    });

    if (!response.ok || !response.body) {
      const errText = await response.text();
      let message = "The AI tutor is unavailable right now.";
      try {
        message = JSON.parse(errText)?.error?.message ?? JSON.parse(errText)?.message ?? message;
      } catch { /* keep default */ }
      if (response.status === 429) message = "Too many requests — please wait a moment and try again.";
      if (response.status === 402) message = "AI credits have run out. Please contact the school administrator.";
      console.error("Gateway error", response.status, errText);
      return json({ error: message }, response.status);
    }

    const text = await readFinalText(response.body);
    if (!text) return json({ error: "The AI could not answer this request." }, 502);
    return json({ lesson: JSON.parse(text) });
  } catch (error) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    console.error("gcse-tutor failed", error);
    return json({ error: "Something went wrong generating your lesson." }, 500);
  }
});
