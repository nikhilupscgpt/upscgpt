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
          tier: user.tier 
        };
      }
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
      if (user) {
        token.id = user.id
        token.role = user.role || 'USER'
        token.tier = user.tier || 'FREE'
      }
      
      if (trigger === "update" && session) {
        token.name = session.name || token.name
        token.role = session.role || token.role
        token.tier = session.tier || token.tier
      }

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
