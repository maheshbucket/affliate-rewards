import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getCurrentTenant } from '@/lib/tenant'

// Force dynamic rendering (uses headers())
export const dynamic = 'force-dynamic'

// GET /api/deals/[slug] - Get a single deal
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Get current tenant
    const tenant = await getCurrentTenant()
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'No tenant found' },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.findUnique({
      where: { 
        slug_tenantId: {
          slug: params.slug,
          tenantId: tenant.id,
        }
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
        tags: true,
        votes: {
          select: {
            value: true,
            userId: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
          where: {
            parentId: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.deal.update({
      where: { id: deal.id },
      data: {
        views: {
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
        views: {
          increment: 1,
        },
      },
      create: {
        dealId: deal.id,
        views: 1,
        date: new Date(new Date().setHours(0, 0, 0, 0)),
        referralSource: 'direct',
      },
    })

    const voteScore = deal.votes.reduce((sum, vote) => sum + vote.value, 0)

    return NextResponse.json({
      ...deal,
      voteScore,
    })
  } catch (error) {
    console.error('Error fetching deal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    )
  }
}

// PATCH /api/deals/[slug] - Update a deal
export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current tenant
    const tenant = await getCurrentTenant()
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'No tenant found' },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.findUnique({
      where: { 
        slug_tenantId: {
          slug: params.slug,
          tenantId: tenant.id,
        }
      },
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isOwner = deal.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updatedDeal = await prisma.deal.update({
      where: { id: deal.id },
      data: body,
      include: {
        category: true,
        tags: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'update',
        entity: 'deal',
        entityId: deal.id,
        changes: JSON.stringify({ old: deal, new: updatedDeal }),
        performedBy: session.user.id,
      },
    })

    return NextResponse.json(updatedDeal)
  } catch (error) {
    console.error('Error updating deal:', error)
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    )
  }
}

// DELETE /api/deals/[slug] - Delete a deal
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current tenant
    const tenant = await getCurrentTenant()
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'No tenant found' },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.findUnique({
      where: { 
        slug_tenantId: {
          slug: params.slug,
          tenantId: tenant.id,
        }
      },
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isOwner = deal.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.deal.delete({
      where: { id: deal.id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'delete',
        entity: 'deal',
        entityId: deal.id,
        changes: JSON.stringify(deal),
        performedBy: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Deal deleted' })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    )
  }
}

