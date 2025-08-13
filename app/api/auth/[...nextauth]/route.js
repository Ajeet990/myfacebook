import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/app/lib/prisma";
import { encode } from "next-auth/jwt";
import jwt from "jsonwebtoken";


export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  // ✅ Stateless JWT session
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  },

  jwt: {
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // Store expiry timestamp inside token
        const maxAge = 60 * 60 * 24 * 7; // 7 days
        token.exp = Math.floor(Date.now() / 1000) + maxAge; // seconds
      }

      // Log token expiry
      if (token.exp) {
        console.log("🔐 Token will expire at:", new Date(token.exp * 1000).toISOString());
      }

      return token;
    },

async session({ session, token }) {
  if (token?.id) session.user.id = token.id;
  if (token?.role) session.user.role = token.role;
  if (token?.exp) session.user.tokenExpiry = token.exp;

  // Sign the token to get an encoded JWT string
  const encodedToken = jwt.sign(token, process.env.JWT_SECRET, { algorithm: "HS256" });

  // Send the encoded JWT to the client
  session.accessToken = encodedToken;

  console.log("📦 Session object sent to client:", session);
  return session;
},
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
