import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0]
  
  // Don't extract subdomain for localhost
  if (host === 'localhost' || host === '127.0.0.1') {
    return null
  }

  // Split by dots
  const parts = host.split('.')
  
  // Need at least 3 parts for a subdomain (subdomain.domain.tld)
  if (parts.length < 3) {
    return null
  }

  // Don't treat 'www' as a subdomain
  if (parts[0] === 'www') {
    return null
  }

  return parts[0]
}

function tenantMiddleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  
  // Extract subdomain
  const subdomain = extractSubdomain(hostname)
  
  // Set tenant headers for use in API routes and components
  const requestHeaders = new Headers(req.headers)
  
  if (subdomain) {
    // Pass subdomain, the actual tenant lookup happens in API routes/components
    requestHeaders.set('x-tenant-subdomain', subdomain)
  } else if (hostname) {
    // Check for custom domain
    const customDomain = hostname.split(':')[0]
    requestHeaders.set('x-tenant-domain', customDomain)
  }
  
  // Set default tenant for development
  if (!subdomain && process.env.DEFAULT_TENANT_SUBDOMAIN) {
    requestHeaders.set('x-tenant-subdomain', process.env.DEFAULT_TENANT_SUBDOMAIN)
  }
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Apply tenant detection to all requests
  return tenantMiddleware(req)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

