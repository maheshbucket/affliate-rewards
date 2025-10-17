import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { generateUniqueSlug, calculateSavings, validateAffiliateUrl } from '@/lib/utils'
import { awardPoints, POINT_VALUES } from '@/lib/points'

export const dynamic = 'force-dynamic'

const createDealSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  originalPrice: z.number().positive('Original price must be positive'),
  dealPrice: z.number().positive('Deal price must be positive'),
  affiliateUrl: z.string().url('Invalid URL'),
  affiliateNetwork: z.enum(['AMAZON', 'COMMISSION_JUNCTION', 'RAKUTEN', 'SHAREASALE', 'IMPACT', 'CUSTOM']),
  categoryId: z.string(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/deals - List deals with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const status = searchParams.get('status') || 'APPROVED'

    const skip = (page - 1) * limit

    const where: any = {
      status: status as any,
    }

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Filter out expired deals
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ]

    let orderBy: any = { createdAt: 'desc' }

    switch (sortBy) {
      case 'hottest':
        orderBy = { votes: { _count: 'desc' } }
        break
      case 'price_low':
        orderBy = { dealPrice: 'asc' }
        break
      case 'price_high':
        orderBy = { dealPrice: 'desc' }
        break
      case 'ending_soon':
        orderBy = { expiresAt: 'asc' }
        break
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: true,
          votes: {
            select: {
              value: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ])

    // Calculate vote scores
    const dealsWithScores = deals.map(deal => ({
      ...deal,
      voteScore: deal.votes.reduce((sum, vote) => sum + vote.value, 0),
    }))

    return NextResponse.json({
      deals: dealsWithScores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}

// POST /api/deals - Create a new deal
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = createDealSchema.parse(body)

    // Validate affiliate URL
    const isValidAffiliate = await validateAffiliateUrl(data.affiliateUrl, data.affiliateNetwork)
    if (!isValidAffiliate) {
      return NextResponse.json(
        { error: 'Invalid affiliate URL for the selected network' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(
      data.title,
      async (slug) => {
        const existing = await prisma.deal.findUnique({ where: { slug } })
        return !!existing
      }
    )

    // Calculate savings
    const { savings, savingsPercent } = calculateSavings(data.originalPrice, data.dealPrice)

    // Create deal
    const deal = await prisma.deal.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        originalPrice: data.originalPrice,
        dealPrice: data.dealPrice,
        savings,
        savingsPercent,
        affiliateUrl: data.affiliateUrl,
        affiliateNetwork: data.affiliateNetwork,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        categoryId: data.categoryId,
        userId: session.user.id,
        status: 'PENDING', // Requires approval
        metaTitle: data.title,
        metaDescription: data.description.substring(0, 160),
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Handle tags
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-')
        
        let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } })
        
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, slug: tagSlug },
          })
        }

        await prisma.deal.update({
          where: { id: deal.id },
          data: {
            tags: {
              connect: { id: tag.id },
            },
          },
        })
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'create',
        entity: 'deal',
        entityId: deal.id,
        changes: JSON.stringify(deal),
        performedBy: session.user.id,
      },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating deal:', error)
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    )
  }
}

