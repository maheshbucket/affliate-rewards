import { NextResponse } from 'next/server'
import { resolveShortUrl } from '@/lib/shortener'

// GET /s/[code] - Redirect short URL
export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const originalUrl = await resolveShortUrl(params.code)

    if (!originalUrl) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.redirect(originalUrl)
  } catch (error) {
    console.error('Error resolving short URL:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

