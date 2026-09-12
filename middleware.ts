import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminEmail } from "@/lib/auth/constants";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Block enforcement check
  const isExempt = pathname === "/login" || pathname === "/blocked" || pathname.startsWith("/api/auth/");
  
  if (user && !isExempt) {
    const verifiedCookie = request.cookies.get("access_verified");
    if (!verifiedCookie) {
      // Verify block status via RPC
      const { data: isBlocked } = await supabase.rpc("is_user_blocked", { 
        p_user_id: user.id, 
        p_email: user.email || "" 
      });

      if (isBlocked) {
        await supabase.auth.signOut();
        const blockRedirect = NextResponse.redirect(new URL("/blocked", request.url));
        blockRedirect.cookies.delete("access_verified");
        
        // Ensure auth cookies cleared on redirect response too
        request.cookies.getAll().forEach(cookie => {
          if (cookie.name.startsWith("sb-")) {
            blockRedirect.cookies.delete(cookie.name);
          }
        });

        return blockRedirect;
      } else {
        response.cookies.set("access_verified", "1", { maxAge: 30 });
      }
    }
  }

  const adminEmail = getAdminEmail();
  const isAdminUser = user?.email?.trim().toLowerCase() === adminEmail;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_onboarded, role")
      .eq("id", user.id)
      .maybeSingle();

    const isOnboarded = profile?.is_onboarded === true;
    const isOnboardingPath = pathname.startsWith("/onboarding");
    const isAuthPath = pathname.startsWith("/api/auth") || pathname === "/login" || pathname === "/blocked";

    // If user is authenticated but NOT onboarded AND not admin -> force /onboarding
    if (!isAdminUser && !isOnboarded && !isOnboardingPath && !isAuthPath) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // If user is onboarded and tries to visit /onboarding -> redirect to /home
    if (isOnboarded && isOnboardingPath) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isAdminUser) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return response;
  }

  // Student protected routes
  const protectedStudentRoutes = ["/home", "/schedule", "/attendance", "/stats", "/profile"];
  const isProtectedStudentRoute = protectedStudentRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedStudentRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If authenticated user visits login or root
  if (pathname === "/login" || pathname === "/") {
    if (user) {
      if (isAdminUser) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/home", request.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
