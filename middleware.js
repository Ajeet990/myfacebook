import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import * as jose from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// ✅ List of API routes that don't need authentication
const publicApiRoutes = [
  "/api/public",
  "/api/posts/all", // Example: public posts
  "/api/auth/register",
  "/api/auth/login",
];

export default withAuth(
  async function middleware(req) {
    const { token } = req.nextauth;
    const pathname = req.nextUrl.pathname;

    let decodedUser = null;
    const authHeader = req.headers.get("authorization");

    // ✅ Decode JWT using jose (Edge-compatible)
    if (authHeader?.startsWith("Bearer ")) {
      const jwtToken = authHeader.substring(7).trim();
      try {
        const { payload } = await jose.jwtVerify(jwtToken, secret);
        decodedUser = payload;
      } catch (err) {
        console.error("Invalid token in middleware:", err);
      }
    }

    // ❌ Block API requests without valid JWT unless route is public
    if (pathname.startsWith("/api") && !decodedUser) {
      const isPublic = publicApiRoutes.some((route) =>
        pathname.startsWith(route)
      );
      if (!isPublic) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    // 🔒 Restrict /admin/** to ADMIN role
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/not-found", req.url));
      }
    }

    // 📦 Forward decoded user to API route
    const requestHeaders = new Headers(req.headers);
    if (decodedUser) {
      requestHeaders.set("x-user", JSON.stringify(decodedUser));
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/api/:path*"],
};
