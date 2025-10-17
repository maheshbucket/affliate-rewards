import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/points'

// GET /api/leaderboard - Get points leaderboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const leaderboard = await getLeaderboard(limit)

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

