import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";

import { isAdminEmail } from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin?: boolean;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token }) {
      (token as { isAdmin?: boolean }).isAdmin = isAdminEmail(token.email);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = Boolean((token as { isAdmin?: boolean }).isAdmin);
      }
      return session;
    },
  },
});
