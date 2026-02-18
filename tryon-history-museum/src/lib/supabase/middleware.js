import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.app_metadata?.role === "admin";

  // Debug: log on /admin and /login routes (remove once confirmed working)
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname === "/login") {
    console.log("[admin-debug] path:", request.nextUrl.pathname);
    console.log("[admin-debug] user:", !!user, "| app_metadata:", JSON.stringify(user?.app_metadata), "| isAdmin:", isAdmin);
  }

  // --- Admin routes: only admin role allowed ---
  if (request.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // --- Admin user on /login or /member/dashboard → send to /admin/dashboard ---
  if (isAdmin && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/member/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // --- Unauthenticated users away from /member routes ---
  if (!user && request.nextUrl.pathname.startsWith("/member")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // --- Non-admin authenticated users away from /login ---
  if (user && !isAdmin && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/member/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
