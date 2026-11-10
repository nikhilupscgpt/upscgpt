import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { countHits, recordHit, clearHits } from "@/lib/rateLimit"

const OTP_FAIL_WINDOW_MS = 15 * 60 * 1000
const OTP_MAX_FAILS_PER_EMAIL = 5
const OTP_MAX_FAILS_PER_IP = 30
const PW_FAIL_WINDOW_MS = 15 * 60 * 1000
const PW_MAX_FAILS_PER_IDENTIFIER = 10
const PW_MAX_FAILS_PER_IP = 50
const TOKEN_REFRESH_MS = 5 * 60 * 1000

// Thrown from authorize(); next-auth v4 surfaces it as `result.error` on the client.
export const OTP_TOO_MANY_ATTEMPTS = "TooManyAttempts"

/** Client IP from next-auth v4's authorize `req` (headers is a plain object there, not Headers). */
function getAuthorizeIp(req) {
  const h = req?.headers
  if (!h) return "unknown"
  const get = (name) => (typeof h.get === "function" ? h.get(name) : h[name])
  const first = (v) => (Array.isArray(v) ? v[0] : v)?.split(",")[0]?.trim()
  return (
    first(get("x-real-ip")) ||
    first(get("x-vercel-forwarded-for")) ||
    first(get("x-forwarded-for")) ||
    "unknown"
  )
}

/** Re-read role/tier/expiry from the DB into the token (shared by update + periodic refresh). */
async function refreshTokenFromDb(token) {
  const dbUser = await prisma.user.findUnique({
    where: { id: token.id },
    select: { role: true, tier: true, validUntil: true, username: true }
  })
  if (dbUser) {
    const isSuperAdmin = dbUser.username?.toLowerCase() === 'admin'
    token.role = isSuperAdmin ? 'ADMIN' : (dbUser.role || 'USER')
    token.tier = (isSuperAdmin || token.role === 'ADMIN' || token.role === 'FACULTY')
      ? 'PRO'
      : (dbUser.tier || 'FREE')
    token.validUntil = dbUser.validUntil ? dbUser.validUntil.toISOString() : null
  } else {
    // User was deleted: strip all privileges.
    token.role = 'USER'
    token.tier = 'FREE'
    token.validUntil = null
  }
  token.refreshedAt = Date.now()
}

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
      async authorize(credentials, req) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : ""
        const code = typeof credentials?.otp === "string" ? credentials.otp.trim() : ""
        if (!email || !code) return null;

        const ip = getAuthorizeIp(req)
        const [emailFails, ipFails] = await Promise.all([
          countHits({ bucket: 'otp-fail', key: email, windowMs: OTP_FAIL_WINDOW_MS }),
          countHits({ bucket: 'otp-fail-ip', key: ip, windowMs: OTP_FAIL_WINDOW_MS }),
        ])
        if (emailFails >= OTP_MAX_FAILS_PER_EMAIL) {
          // Burn any outstanding code so it can't be guessed; user must request a new one.
          await prisma.verificationToken.deleteMany({ where: { identifier: email } }).catch(() => {})
          throw new Error(OTP_TOO_MANY_ATTEMPTS)
        }
        if (ipFails >= OTP_MAX_FAILS_PER_IP) {
          throw new Error(OTP_TOO_MANY_ATTEMPTS)
        }

        const verificationToken = await prisma.verificationToken.findFirst({
          where: {
            identifier: email,
            code,
            type: 'EMAIL_OTP',
            expires: { gt: new Date() }
          }
        });

        if (!verificationToken) {
          await Promise.all([
            recordHit({ bucket: 'otp-fail', key: email }),
            recordHit({ bucket: 'otp-fail-ip', key: ip }),
          ])
          return null;
        }

        await clearHits({ bucket: 'otp-fail', key: email })

        // OTP is valid, now find or create the user
        // Case-insensitive so accounts created with mixed-case emails (e.g. via Google) still match.
        let user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } }
        });

        if (!user) {
          // Create new user if not exists
          user = await prisma.user.create({
            data: {
              email,
              username: email.split('@')[0] + Math.floor(Math.random() * 1000),
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
      async authorize(credentials, req) {
        const identifier = credentials?.username?.trim();
        const password = credentials?.password;
        if (!identifier || !password) return null;

        const idKey = identifier.toLowerCase()
        const ip = getAuthorizeIp(req)
        const [idFails, ipFails] = await Promise.all([
          countHits({ bucket: 'pw-fail', key: idKey, windowMs: PW_FAIL_WINDOW_MS }),
          countHits({ bucket: 'pw-fail-ip', key: ip, windowMs: PW_FAIL_WINDOW_MS }),
        ])
        if (idFails >= PW_MAX_FAILS_PER_IDENTIFIER || ipFails >= PW_MAX_FAILS_PER_IP) {
          throw new Error(OTP_TOO_MANY_ATTEMPTS)
        }
        const recordFailure = () => Promise.all([
          recordHit({ bucket: 'pw-fail', key: idKey }),
          recordHit({ bucket: 'pw-fail-ip', key: ip }),
        ])

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: { equals: identifier, mode: 'insensitive' } },
              { email: { equals: identifier, mode: 'insensitive' } }
            ]
          }
        });

        if (!user || !user.password) {
          await recordFailure()
          return null;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          await clearHits({ bucket: 'pw-fail', key: idKey })
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
        await recordFailure()
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
        token.refreshedAt = Date.now()
      }

      if (trigger === "update") {
        // Data sent by the browser is untrusted: only the display name may come from it.
        // Role, tier and expiry are always re-read from the database.
        if (session && typeof session.name === "string" && session.name.trim()) {
          token.name = session.name.trim().slice(0, 100)
        }
        if (token.id) {
          try {
            await refreshTokenFromDb(token)
          } catch (err) {
            console.error('[auth] token refresh on update failed:', err?.message)
          }
        }
      } else if (
        token.id &&
        (!token.refreshedAt || Date.now() - token.refreshedAt > TOKEN_REFRESH_MS)
      ) {
        // Periodic refresh so role/tier changes (or deletion) apply within ~5 minutes.
        try {
          await refreshTokenFromDb(token)
        } catch (err) {
          // DB unavailable: keep the current token; the expiry check below still applies.
          console.error('[auth] periodic token refresh failed:', err?.message)
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
