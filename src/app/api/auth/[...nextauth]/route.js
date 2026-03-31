import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        let user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        // For demo purposes: Admin auto-provision was removed for security.
        // Ensure admin user exists in the database.

        if (!user) return null;

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (isMatch) {
          const role = credentials.username === 'admin' ? 'ADMIN' : (user.role || 'USER');
          const tier = credentials.username === 'admin' ? 'PRO' : (user.tier || 'FREE');
          return { id: user.id, name: user.username, role, tier };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // the 'user' object is only present on initial login
      if (user) {
        token.id = user.id
        token.role = user.role || 'USER'
        token.tier = user.tier || 'FREE'
      }
      // handle updates if needed when session changes
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.tier = token.tier
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is required in production!");
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
