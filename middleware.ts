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

  const adminEmail = getAdminEmail();
  const isAdminUser = user?.email?.trim().toLowerCase() === adminEmail;

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
  const protectedStudentRoutes = ["/home", "/schedule", "/attendance", "/topics", "/stats", "/profile"];
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
