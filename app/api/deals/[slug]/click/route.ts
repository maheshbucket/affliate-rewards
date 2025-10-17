import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/deals/[slug]/click - Track deal clicks
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const deal = await prisma.deal.findUnique({
      where: { slug: params.slug },
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Increment click count
    await prisma.deal.update({
      where: { id: deal.id },
      data: {
        clicks: {
          increment: 1,
        },
      },
    })

    // Track analytics
    await prisma.dealAnalytics.upsert({
      where: {
        dealId_date_referralSource: {
          dealId: deal.id,
          date: new Date(new Date().setHours(0, 0, 0, 0)),
          referralSource: 'direct',
        },
      },
      update: {
        clicks: {
          increment: 1,
        },
      },
      create: {
        dealId: deal.id,
        clicks: 1,
        date: new Date(new Date().setHours(0, 0, 0, 0)),
        referralSource: 'direct',
      },
    })

    return NextResponse.json({ 
      message: 'Click tracked',
      redirectUrl: deal.affiliateUrl 
    })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    )
  }
}

