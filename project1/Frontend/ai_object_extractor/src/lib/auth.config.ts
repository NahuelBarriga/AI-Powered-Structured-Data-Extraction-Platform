import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/");
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      
      if (isOnDashboard && !isOnLogin) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      // Add user info to JWT token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info from JWT to session
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  providers: [], // Providers will be added in auth.ts
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
