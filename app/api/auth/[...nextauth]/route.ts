import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "gravitas",
    collections: {
      Users: "users",
      Accounts: "accounts",
      Sessions: "sessions",
      VerificationTokens: "verification_tokens",
    },
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback:", { user, account, profile });
      return true;
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token });
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log("JWT callback:", { token, user, account });
      if (account && user) {
        token.id = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  debug: true,
  events: {
    async signIn(message: any) {
      console.log("SignIn event:", message);
    },
    async signOut(message: any) {
      console.log("SignOut event:", message);
    },
  },
});

export { handler as GET, handler as POST };