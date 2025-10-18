import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { awardPoints, POINT_VALUES } from '@/lib/points'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/admin/deals/approve - Approve a deal
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { dealId, status } = await request.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        status,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      },
      include: {
        user: true,
      },
    })

    // Award points to deal creator if approved
    if (status === 'APPROVED') {
      await awardPoints(
        deal.userId,
        POINT_VALUES.DEAL_SUBMISSION,
        'deal_approved',
        `Deal approved: ${deal.title}`
      )
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: status.toLowerCase(),
        entity: 'deal',
        entityId: deal.id,
        changes: JSON.stringify({ status }),
        performedBy: session.user.id,
      },
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error approving deal:', error)
    return NextResponse.json(
      { error: 'Failed to approve deal' },
      { status: 500 }
    )
  }
}

