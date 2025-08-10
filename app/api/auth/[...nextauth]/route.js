import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

import prisma from "@/app/lib/prisma";

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
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  adapter: {
    async createSession(session) {
      return await prisma.session.create({ data: session });
    },
    async getSessionAndUser(sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      return { session, user: session?.user };
    },
    async deleteSession(sessionToken) {
      return await prisma.session.delete({ where: { sessionToken } });
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
