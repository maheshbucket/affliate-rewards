import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Protect admin routes
    if (path.startsWith('/admin')) {
      if (!token || (token.role !== 'ADMIN' && token.role !== 'MODERATOR')) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    // Protect user dashboard
    if (path.startsWith('/dashboard') || path.startsWith('/deals/submit')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/deals/submit/:path*'],
}

