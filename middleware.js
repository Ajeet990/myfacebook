// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";
// import * as jose from "jose";

// const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// const publicApiRoutes = [
//   "/api/public",
//   "/api/posts/all",
//   "/api/register",
//   "/api/auth/login",
//   "/api/get-all-post",
//   "/api/auth", // Add this to allow NextAuth routes
// ];

// export default withAuth(
//   async function middleware(req) {
//     const pathname = req.nextUrl.pathname;

//     // ✅ Allow public APIs and NextAuth routes
//     if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
//       return NextResponse.next();
//     }

//     let decodedUser = null;

//     // ✅ 1. Check Authorization header
//     const authHeader = req.headers.get("authorization");
//     if (authHeader?.startsWith("Bearer ")) {
//       try {
//         const { payload } = await jose.jwtVerify(
//           authHeader.substring(7).trim(),
//           secret
//         );
//         decodedUser = payload;
//       } catch (err) {
//         console.error("Invalid Bearer token:", err);
//       }
//     }

//     // ✅ 2. If no Bearer token, fall back to NextAuth session token (cookies)
//     if (!decodedUser && req.nextauth?.token) {
//       decodedUser = req.nextauth.token;
//     }

//     // ❌ Not authenticated → return JSON for API routes
//     if (pathname.startsWith("/api") && !decodedUser) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // ✅ Attach user to request
//     if (decodedUser) {
//       const requestHeaders = new Headers(req.headers);
//       requestHeaders.set("x-user", JSON.stringify(decodedUser));
//       return NextResponse.next({ request: { headers: requestHeaders } });
//     }

//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ req, token }) => {
//         const pathname = req.nextUrl.pathname;
        
//         // Always allow NextAuth API routes
//         if (pathname.startsWith("/api/auth")) {
//           return true;
//         }
        
//         // Allow public routes
//         const isPublic = publicApiRoutes.some((route) =>
//           pathname.startsWith(route)
//         );
        
//         if (isPublic) {
//           return true;
//         }
        
//         // For API routes, we handle authorization in the middleware function
//         // Return true here to prevent NextAuth from redirecting API calls
//         if (pathname.startsWith("/api")) {
//           return true;
//         }
        
//         // For page routes, require token
//         return !!token;
//       },
//     },
//     pages: {
//       signIn: "/", // Only redirect page routes, not API routes
//     },
//   }
// );

// export const config = {
//   matcher: [
//     "/admin/:path*", 
//     "/profile/:path*", 
//     "/api/((?!auth|public|posts/all|register|get-all-post).+)"
//   ],
// };



// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";
// import * as jose from "jose";

// const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// const publicApiRoutes = [
//   "/api/public",
//   "/api/posts/all",
//   "/api/register",
//   "/api/auth/login",
//   "/api/get-all-post", // ✅ Public endpoint
// ];

// export default withAuth(
//   async function middleware(req) {
//     const pathname = req.nextUrl.pathname;

//     // ✅ Public API routes
//     const isPublic = publicApiRoutes.some((route) =>
//       pathname.startsWith(route)
//     );
//     if (isPublic) return NextResponse.next();

//     const { token } = req.nextauth;
//     let decodedUser = null;
//     const authHeader = req.headers.get("authorization");

//     // ✅ Decode JWT manually if Bearer token exists
//     if (authHeader?.startsWith("Bearer ")) {
//       const jwtToken = authHeader.substring(7).trim();
//       try {
//         const { payload } = await jose.jwtVerify(jwtToken, secret);
//         decodedUser = payload;
//       } catch (err) {
//         console.error("Invalid token in middleware:", err);
//       }
//     }

//     // ❌ Block API requests without valid JWT
//     if (pathname.startsWith("/api") && !decodedUser) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // 🔒 Restrict /admin/**
//     if (pathname.startsWith("/admin")) {
//       if (token?.role !== "ADMIN") {
//         return NextResponse.redirect(new URL("/not-found", req.url));
//       }
//     }

//     // 📦 Forward decoded user
//     const requestHeaders = new Headers(req.headers);
//     if (decodedUser) {
//       requestHeaders.set("x-user", JSON.stringify(decodedUser));
//     }

//     return NextResponse.next({ request: { headers: requestHeaders } });
//   },
//   {
//     callbacks: {
//       // 👇 prevent redirect for APIs
//       authorized: ({ req, token }) => {
//         const pathname = req.nextUrl.pathname;
//         const isPublic = publicApiRoutes.some((route) =>
//           pathname.startsWith(route)
//         );

//         if (pathname.startsWith("/api")) {
//           // for APIs → just check token, no redirects
//           return isPublic || !!token;
//         }

//         // for pages → allow only if token exists
//         return isPublic || !!token;
//       },
//     },
//     // 👇 very important
//     pages: {
//       signIn: "/login", // redirect only for UI, not APIs
//     },
//   }
// );

// export const config = {
//   matcher: ["/admin/:path*", "/profile/:path*", "/api/:path*"],
// };


import { NextResponse } from "next/server";
import * as jose from "jose";
import { getToken } from "next-auth/jwt";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const publicApiRoutes = [
  "/api/public",
  "/api/posts/all", 
  "/api/register",
  "/api/auth",
  "/api/get-all-post",
];

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // ✅ Allow public APIs and NextAuth routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  let decodedUser = null;

  // ✅ 1. Check Authorization header (JWT)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const { payload } = await jose.jwtVerify(
        authHeader.substring(7).trim(),
        secret
      );
      decodedUser = payload;
    } catch (err) {
      console.error("Invalid Bearer token:", err);
    }
  }

  // ✅ 2. If no Bearer token, check NextAuth session
  if (!decodedUser) {
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      if (token) {
        decodedUser = token;
      }
    } catch (err) {
      console.error("Error getting NextAuth token:", err);
    }
  }

  // ❌ Not authenticated
  if (!decodedUser) {
    // For API routes, return 401
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // For page routes, redirect to sign-in
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Attach user to request
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user", JSON.stringify(decodedUser));
  
  return NextResponse.next({ 
    request: { headers: requestHeaders } 
  });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*", 
    "/api/((?!auth|public|posts/all|register|get-all-post).+)"
  ],
};

