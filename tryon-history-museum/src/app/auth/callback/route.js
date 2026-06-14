import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/member/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Link authenticated user to existing members row (if not already linked)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const adminClient = createAdminClient();
        const { data: member } = await adminClient
          .from("members")
          .select("id")
          .eq("email", user.email)
          .is("auth_user_id", null)
          .maybeSingle();
        if (member) {
          await adminClient
            .from("members")
            .update({ auth_user_id: user.id })
            .eq("id", member.id);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
