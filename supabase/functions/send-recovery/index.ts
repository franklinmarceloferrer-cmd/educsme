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

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: "https://educsme.lovable.app/reset-password" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  // The generateLink call with admin doesn't send the email automatically.
  // Let's use resetPasswordForEmail instead via the public client.
  const publicClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { error: resetError } = await publicClient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://educsme.lovable.app/reset-password",
  });

  if (resetError) {
    return new Response(JSON.stringify({ error: resetError.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true, message: `Recovery email sent to ${email}` }), {
    headers: { "Content-Type": "application/json" },
  });
});
