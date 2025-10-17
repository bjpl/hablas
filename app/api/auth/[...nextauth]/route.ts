import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Admin credentials - In production, use environment variables and hashed passwords
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hablas.co'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-in-production'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@hablas.co" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple credential check - enhance with bcrypt in production
        if (
          credentials?.email === ADMIN_EMAIL &&
          credentials?.password === ADMIN_PASSWORD
        ) {
          return {
            id: '1',
            email: ADMIN_EMAIL,
            name: 'Admin',
            role: 'admin'
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
