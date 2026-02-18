import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Only administrators can change user roles." },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { auth_user_id, role } = await request.json();

  if (!auth_user_id || !["member", "board_member", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
  }

  const { error } = await supabase.auth.admin.updateUserById(auth_user_id, {
    app_metadata: { role },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, role });
}
