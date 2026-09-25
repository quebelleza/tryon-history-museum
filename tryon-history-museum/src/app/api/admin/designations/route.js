import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

const KINDS = new Set(["fund", "campaign"]);

async function requireAdmin() {
  const { isAdmin } = await verifyAdmin();
  return isAdmin;
}

function values(body) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    kind: body.kind,
    description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : null,
    starts_on: body.starts_on || null,
    ends_on: body.ends_on || null,
    active: body.active !== false,
    updated_at: new Date().toISOString(),
  };
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { data, error } = await createAdminClient()
    .from("giving_designations")
    .select("*")
    .order("active", { ascending: false })
    .order("kind")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ designations: data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const value = values(await request.json());
  if (!value.name || value.name.length > 120 || !KINDS.has(value.kind)) {
    return NextResponse.json({ error: "Provide a name and choose Fund or Campaign." }, { status: 400 });
  }
  const { data, error } = await createAdminClient().from("giving_designations").insert(value).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ designation: data });
}

export async function PATCH(request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await request.json();
  const value = values(body);
  if (!body.id || !value.name || value.name.length > 120 || !KINDS.has(value.kind)) {
    return NextResponse.json({ error: "Provide a valid designation." }, { status: 400 });
  }
  const { data, error } = await createAdminClient()
    .from("giving_designations")
    .update(value)
    .eq("id", body.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ designation: data });
}
