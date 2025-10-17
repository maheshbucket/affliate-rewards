import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createShortUrl } from '@/lib/shortener'
import { buildUtmUrl } from '@/lib/utils'
import { awardPoints, POINT_VALUES } from '@/lib/points'
import { generateQRCode } from '@/lib/qrcode'

// POST /api/shares - Create a short URL for sharing
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const {
      url,
      dealId,
      platform = 'direct',
      utmSource,
      utmMedium,
      utmCampaign,
    } = body

    // Build URL with UTM parameters
    const utmUrl = buildUtmUrl(url, {
      source: utmSource || platform,
      medium: utmMedium || 'social',
      campaign: utmCampaign || 'deal_share',
    })

    // Create short URL
    const shortUrl = await createShortUrl(utmUrl, {
      userId: session?.user?.id,
      dealId,
      platform,
      utmSource: utmSource || platform,
      utmMedium: utmMedium || 'social',
      utmCampaign: utmCampaign || 'deal_share',
    })

    // Award points if user is logged in
    if (session?.user && dealId) {
      await awardPoints(
        session.user.id,
        POINT_VALUES.SHARE,
        'share',
        `Shared a deal on ${platform}`
      )
    }

    return NextResponse.json({ shortUrl })
  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    )
  }
}

