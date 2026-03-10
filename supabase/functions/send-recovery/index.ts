import { createClient } from "https://esm.sh/@supabase/supabase-js@2.88.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "authorization, content-type, apikey" } });
  }

  const { email } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Use admin API to generate recovery link (bypasses rate limits)
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: "https://educsme.lovable.app/reset-password" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Return the recovery link for the admin to share directly
  return new Response(JSON.stringify({ 
    success: true, 
    message: `Recovery link generated for ${email}`,
    action_link: data?.properties?.action_link || null,
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
