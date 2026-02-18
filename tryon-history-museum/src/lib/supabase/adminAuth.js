import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Verify the current request is from a user with admin-panel access.
 * Returns { user, role, isAdmin, isBoardMember, hasAdminAccess }.
 *
 * role values: "admin" | "board_member" | "member" | null
 * hasAdminAccess = true for both admin and board_member
 */
export async function verifyAdmin() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in read-only context
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null, isAdmin: false, isBoardMember: false, hasAdminAccess: false };

  const role = user.app_metadata?.role || "member";
  const isAdmin = role === "admin";
  const isBoardMember = role === "board_member";
  const hasAdminAccess = isAdmin || isBoardMember;
  return { user, role, isAdmin, isBoardMember, hasAdminAccess };
}
