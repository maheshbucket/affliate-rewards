import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { awardPoints, POINT_VALUES } from '@/lib/points'

export const dynamic = 'force-dynamic'

// POST /api/deals/[slug]/vote - Vote on a deal
export async function POST(
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

    const { value } = await request.json() // 1 for upvote, -1 for downvote

    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: 'Invalid vote value' },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.findUnique({
      where: { slug: params.slug },
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_dealId: {
          userId: session.user.id,
          dealId: deal.id,
        },
      },
    })

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote if clicking same button
        await prisma.vote.delete({
          where: {
            userId_dealId: {
              userId: session.user.id,
              dealId: deal.id,
            },
          },
        })
        return NextResponse.json({ message: 'Vote removed' })
      } else {
        // Update vote
        await prisma.vote.update({
          where: {
            userId_dealId: {
              userId: session.user.id,
              dealId: deal.id,
            },
          },
          data: { value },
        })
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          userId: session.user.id,
          dealId: deal.id,
          value,
        },
      })

      // Award points to voter
      await awardPoints(
        session.user.id,
        POINT_VALUES.VOTE,
        'vote',
        `Voted on deal: ${deal.title}`
      )
    }

    return NextResponse.json({ message: 'Vote recorded' })
  } catch (error) {
    console.error('Error voting on deal:', error)
    return NextResponse.json(
      { error: 'Failed to vote on deal' },
      { status: 500 }
    )
  }
}

