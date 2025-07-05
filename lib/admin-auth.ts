import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Hardcoded admin credentials - in a real app, these would be stored securely
// and potentially in environment variables
const ADMIN_EMAIL = "admin@gravitas.com";
const ADMIN_PASSWORD = "Admin@123456"; // This should be hashed in a real application

export const adminAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check if the credentials match the admin credentials
        if (credentials.email !== ADMIN_EMAIL) {
          return null;
        }

        // In a real application, you would hash the password and compare it
        // For simplicity, we're doing a direct comparison here
        if (credentials.password !== ADMIN_PASSWORD) {
          return null;
        }

        // Return the admin user
        return {
          id: "admin",
          email: ADMIN_EMAIL,
          name: "System Administrator",
          role: "admin"
        };
      }
    })
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
};