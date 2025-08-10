import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth; // Auth token from NextAuth
    const pathname = req.nextUrl.pathname;

    // Restrict /admin/** to ADMIN role
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/not-found", req.url));
      }
    }

    // Restrict /profile/** to logged-in users (already handled by authorized callback)
    // No extra role check needed here

    return NextResponse.next(); // Allow request
  },
  {
    callbacks: {
      // Require authentication for matched routes
      authorized: ({ token }) => !!token,
    },
  }
);

// Apply middleware only to certain routes
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
