import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPoints, getPointHistory } from '@/lib/points'

// GET /api/user/points - Get user points and history
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const points = await getUserPoints(session.user.id)
    const history = await getPointHistory(session.user.id)

    return NextResponse.json({
      points,
      history,
    })
  } catch (error) {
    console.error('Error fetching user points:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user points' },
      { status: 500 }
    )
  }
}

