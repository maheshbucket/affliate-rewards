import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/analytics - Get platform analytics
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get overall stats
    const [
      totalDeals,
      pendingDeals,
      totalUsers,
      totalViews,
      totalClicks,
      totalConversions,
    ] = await Promise.all([
      prisma.deal.count(),
      prisma.deal.count({ where: { status: 'PENDING' } }),
      prisma.user.count(),
      prisma.deal.aggregate({
        _sum: { views: true },
      }),
      prisma.deal.aggregate({
        _sum: { clicks: true },
      }),
      prisma.deal.aggregate({
        _sum: { conversions: true },
      }),
    ])

    // Get daily analytics
    const dailyAnalytics = await prisma.dealAnalytics.groupBy({
      by: ['date'],
      where: {
        date: {
          gte: startDate,
        },
      },
      _sum: {
        views: true,
        clicks: true,
        conversions: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Get top deals
    const topDeals = await prisma.deal.findMany({
      where: {
        status: 'APPROVED',
      },
      take: 10,
      orderBy: {
        clicks: 'desc',
      },
      include: {
        category: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    // Get referral sources
    const referralSources = await prisma.dealAnalytics.groupBy({
      by: ['referralSource'],
      where: {
        date: {
          gte: startDate,
        },
      },
      _sum: {
        views: true,
        clicks: true,
      },
    })

    return NextResponse.json({
      overview: {
        totalDeals,
        pendingDeals,
        totalUsers,
        totalViews: totalViews._sum.views || 0,
        totalClicks: totalClicks._sum.clicks || 0,
        totalConversions: totalConversions._sum.conversions || 0,
      },
      dailyAnalytics,
      topDeals,
      referralSources,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

