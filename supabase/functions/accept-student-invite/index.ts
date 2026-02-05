import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AcceptInviteRequest {
  token: string;
  password: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client for user creation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { token, password }: AcceptInviteRequest = await req.json();

    if (!token || !password) {
      return new Response(
        JSON.stringify({ error: "Token e senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "A senha deve ter pelo menos 6 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Validate token - find pending invite
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("student_invites")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      console.error("Invite not found or expired:", inviteError);
      return new Response(
        JSON.stringify({ error: "Convite inválido, expirado ou já utilizado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check if email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === invite.email.toLowerCase()
    );

    if (emailExists) {
      return new Response(
        JSON.stringify({ error: "Este email já está registrado no sistema" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password: password,
      email_confirm: true, // Auto-confirm since invite is validated
      user_metadata: {
        display_name: invite.name,
      },
    });

    if (authError || !authData.user) {
      console.error("Error creating user:", authError);
      return new Response(
        JSON.stringify({ error: "Erro ao criar conta: " + (authError?.message || "Erro desconhecido") }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Create student record
    const studentId = invite.student_id || `STU-${Date.now().toString(36).toUpperCase()}`;
    
    const { error: studentError } = await supabaseAdmin
      .from("students")
      .insert({
        student_id: studentId,
        name: invite.name,
        email: invite.email,
        grade: invite.grade,
        section: invite.section,
        enrollment_date: new Date().toISOString().split("T")[0],
        status: "active",
      });

    if (studentError) {
      console.error("Error creating student record:", studentError);
      // Don't fail completely - user is created, student record can be fixed later
    }

    // 5. Update invite status to accepted
    const { error: updateError } = await supabaseAdmin
      .from("student_invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (updateError) {
      console.error("Error updating invite status:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Conta criada com sucesso! Você já pode fazer login.",
        email: invite.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
