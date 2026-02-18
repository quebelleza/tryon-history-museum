import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Verify the current request is from an admin user.
 * Returns { user, isAdmin } or throws.
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

  if (!user) return { user: null, isAdmin: false };

  const isAdmin = user.app_metadata?.role === "admin";
  return { user, isAdmin };
}
