import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

const Google = typeof GoogleProvider === "function" ? GoogleProvider : GoogleProvider?.default
const Credentials = typeof CredentialsProvider === "function" ? CredentialsProvider : CredentialsProvider?.default

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(Google ? [Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })] : []),
    Credentials({
      id: "otp",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;

        const verificationToken = await prisma.verificationToken.findFirst({
          where: {
            identifier: credentials.email,
            code: credentials.otp,
            type: 'EMAIL_OTP',
            expires: { gt: new Date() }
          }
        });

        if (!verificationToken) return null;

        // OTP is valid, now find or create the user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          // Create new user if not exists
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              username: credentials.email.split('@')[0] + Math.floor(Math.random() * 1000),
              role: 'USER',
              tier: 'FREE'
            }
          });
        }

        // Consume the OTP
        await prisma.verificationToken.delete({
          where: { token: verificationToken.token }
        });

        return { 
          id: user.id, 
          email: user.email, 
          name: user.username, 
          role: user.role, 
          tier: user.tier,
          validUntil: user.validUntil ? user.validUntil.toISOString() : null
        };
      }
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const identifier = credentials?.username?.trim();
        const password = credentials?.password;
        if (!identifier || !password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: { equals: identifier, mode: 'insensitive' } },
              { email: { equals: identifier, mode: 'insensitive' } }
            ]
          }
        });

        if (!user || !user.password) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const isSuperAdmin = user.username?.toLowerCase() === 'admin';
          const role = isSuperAdmin ? 'ADMIN' : (user.role || 'USER');
          const tier = (isSuperAdmin || role === 'ADMIN' || role === 'FACULTY') ? 'PRO' : (user.tier || 'FREE');
          return {
            id: user.id,
            name: user.name || user.username,
            email: user.email,
            role,
            tier,
            validUntil: user.validUntil ? user.validUntil.toISOString() : null
          };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role || 'USER'
        token.tier = user.tier || 'FREE'
        token.validUntil = user.validUntil
          ? (typeof user.validUntil === 'string' ? user.validUntil : user.validUntil.toISOString())
          : null
      }
      
      if (trigger === "update" && session) {
        token.name = session.name || token.name
        token.role = session.role || token.role
        token.tier = session.tier || token.tier
        if (session.validUntil !== undefined) {
          token.validUntil = session.validUntil
        }
      }

      // Auto-check expiry if token has validUntil in the past
      if (
        token.tier === 'PRO' &&
        token.role !== 'ADMIN' &&
        token.validUntil &&
        new Date(token.validUntil) < new Date()
      ) {
        token.tier = 'FREE'
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.tier = token.tier
        session.user.validUntil = token.validUntil || null
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
