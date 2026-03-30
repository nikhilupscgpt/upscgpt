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
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
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

        // For demo purposes: Auto-provision if 'admin' logs in for the first time
        if (!user && credentials.username === 'admin') {
          const hashedPassword = await bcrypt.hash('UPSC2026', 10);
          user = await prisma.user.create({
            data: { username: 'admin', password: hashedPassword, role: 'ADMIN', tier: 'PREMIUM' }
          });
        }

        if (!user) return null;

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (isMatch) {
          const role = credentials.username === 'admin' ? 'ADMIN' : (user.role || 'USER');
          const tier = credentials.username === 'admin' ? 'PREMIUM' : (user.tier || 'FREE');
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
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev_only",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
