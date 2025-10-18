import { NextResponse } from 'next/server'
import { resolveShortUrl } from '@/lib/shortener'
import { getCurrentTenant } from '@/lib/tenant'

// GET /s/[code] - Redirect short URL
export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    // Get current tenant
    const tenant = await getCurrentTenant()
    
    if (!tenant) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const originalUrl = await resolveShortUrl(params.code, tenant.id)

    if (!originalUrl) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.redirect(originalUrl)
  } catch (error) {
    console.error('Error resolving short URL:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

