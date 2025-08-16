import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import * as jose from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const publicApiRoutes = [
  "/api/public",
  "/api/posts/all",
  "/api/register",
  "/api/auth/login",
  "/api/get-all-post", // ✅ Public endpoint
];

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;

    // ✅ Allow public API routes without authentication
    const isPublic = publicApiRoutes.some((route) =>
      pathname.startsWith(route)
    );
    if (isPublic) {
      return NextResponse.next();
    }

    const { token } = req.nextauth;
    let decodedUser = null;
    const authHeader = req.headers.get("authorization");

    // ✅ Decode JWT from Authorization header
    if (authHeader?.startsWith("Bearer ")) {
      const jwtToken = authHeader.substring(7).trim();
      try {
        const { payload } = await jose.jwtVerify(jwtToken, secret);
        decodedUser = payload;
      } catch (err) {
        console.error("Invalid token in middleware:", err);
      }
    }

    // ❌ Block API requests without valid JWT
    if (pathname.startsWith("/api") && !decodedUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
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
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        const isPublic = publicApiRoutes.some((route) =>
          pathname.startsWith(route)
        );
        return isPublic || !!token; // ✅ Allow if public OR has token
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/api/:path*"],
};
