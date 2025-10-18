import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenantId: { label: 'Tenant ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Find user by email and optional tenantId
        let user
        
        if (credentials.tenantId) {
          user = await prisma.user.findUnique({
            where: {
              email_tenantId: {
                email: credentials.email,
                tenantId: credentials.tenantId,
              },
            },
            include: { tenant: true },
          })
        } else {
          // Fallback for development or if tenantId not provided
          user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
            },
            include: { tenant: true },
          })
        }

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        if (user.banned) {
          throw new Error('Account has been banned')
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          tenantId: user.tenantId,
          tenantSubdomain: user.tenant.subdomain,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        
        // Fetch and add tenant information
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { tenant: true },
        })
        
        if (dbUser) {
          token.tenantId = dbUser.tenantId
          token.tenantSubdomain = dbUser.tenant.subdomain
        }
      }
      
      if (trigger === 'update' && session) {
        return { ...token, ...session.user }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as any
        session.user.id = token.id as string
        session.user.tenantId = token.tenantId as string
        session.user.tenantSubdomain = token.tenantSubdomain as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

