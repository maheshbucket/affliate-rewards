import prisma from './prisma'
import { generateShortCode } from './utils'
import axios from 'axios'

export async function createShortUrl(
  originalUrl: string,
  options: {
    userId?: string
    dealId?: string
    platform?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  }
): Promise<string> {
  try {
    // Generate unique short code
    let shortCode = generateShortCode(6)
    let exists = await prisma.share.findUnique({
      where: { shortUrl: shortCode },
    })

    while (exists) {
      shortCode = generateShortCode(6)
      exists = await prisma.share.findUnique({
        where: { shortUrl: shortCode },
      })
    }

    // Create share entry
    await prisma.share.create({
      data: {
        shortUrl: shortCode,
        originalUrl,
        userId: options.userId,
        dealId: options.dealId,
        platform: options.platform || 'direct',
        utmSource: options.utmSource,
        utmMedium: options.utmMedium,
        utmCampaign: options.utmCampaign,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return `${baseUrl}/s/${shortCode}`
  } catch (error) {
    console.error('Error creating short URL:', error)
    throw error
  }
}

export async function createBitlyShortUrl(longUrl: string): Promise<string | null> {
  try {
    if (!process.env.BITLY_ACCESS_TOKEN) {
      console.warn('Bitly access token not configured')
      return null
    }

    const response = await axios.post(
      'https://api-ssl.bitly.com/v4/shorten',
      {
        long_url: longUrl,
        domain: process.env.BITLY_DOMAIN || 'bit.ly',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BITLY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.link
  } catch (error) {
    console.error('Error creating Bitly short URL:', error)
    return null
  }
}

export async function trackShortUrlClick(shortCode: string): Promise<void> {
  try {
    await prisma.share.update({
      where: { shortUrl: shortCode },
      data: {
        clicks: {
          increment: 1,
        },
      },
    })
  } catch (error) {
    console.error('Error tracking short URL click:', error)
  }
}

export async function resolveShortUrl(shortCode: string): Promise<string | null> {
  try {
    const share = await prisma.share.findUnique({
      where: { shortUrl: shortCode },
      select: { originalUrl: true },
    })

    if (share) {
      await trackShortUrlClick(shortCode)
      return share.originalUrl
    }

    return null
  } catch (error) {
    console.error('Error resolving short URL:', error)
    return null
  }
}

export async function getShareAnalytics(dealId: string) {
  return prisma.share.findMany({
    where: { dealId },
    select: {
      id: true,
      platform: true,
      clicks: true,
      createdAt: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
    },
    orderBy: {
      clicks: 'desc',
    },
  })
}

