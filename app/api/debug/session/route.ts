import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/debug/session - Debug session information
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      session,
      hasSession: !!session,
      hasUser: !!session?.user,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === 'ADMIN',
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

