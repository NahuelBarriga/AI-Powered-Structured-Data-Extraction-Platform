import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call your backend API to authenticate
          const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const { token, user } = response.data;

          if (token && user) {
            // Return user object with token
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              accessToken: token,
            };
          }

          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      // Store access token in JWT on sign in
      if (user && account) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Make access token available in session
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
});
