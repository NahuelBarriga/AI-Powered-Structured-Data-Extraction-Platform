import { auth } from "@/src/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // Redirect to login if not authenticated and trying to access protected routes //!turn on later
  // if (!session && !isLoginPage) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // // Redirect to home if authenticated and trying to access login page
  // if (session && isLoginPage) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next();
}

// Specify which routes should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
