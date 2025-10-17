'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Trophy, TrendingUp, Eye, MousePointerClick, Award } from 'lucide-react'
import { DealCard } from '@/components/DealCard'

interface UserStats {
  points: number
  dealsSubmitted: number
  dealsApproved: number
  totalViews: number
  totalClicks: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>({
    points: 0,
    dealsSubmitted: 0,
    dealsApproved: 0,
    totalViews: 0,
    totalClicks: 0,
  })
  const [deals, setDeals] = useState([])
  const [pointHistory, setPointHistory] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }

    if (session?.user) {
      // Fetch user stats and deals
      fetch('/api/user/points')
        .then(res => res.json())
        .then(data => {
          setStats(prev => ({ ...prev, points: data.points }))
          setPointHistory(data.history)
        })

      fetch('/api/deals?userId=' + session.user.id)
        .then(res => res.json())
        .then(data => setDeals(data.deals))
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-600">
          Track your deals, points, and rewards performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold">{stats.points}</span>
          </div>
          <p className="text-gray-600 text-sm">Total Points</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold">{stats.dealsApproved}</span>
          </div>
          <p className="text-gray-600 text-sm">Approved Deals</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">{stats.totalViews}</span>
          </div>
          <p className="text-gray-600 text-sm">Total Views</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <MousePointerClick className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold">{stats.totalClicks}</span>
          </div>
          <p className="text-gray-600 text-sm">Total Clicks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Points Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Points Activity
          </h2>
          <div className="space-y-3">
            {pointHistory.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-sm">{item.reason}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <span className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))}
            {pointHistory.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                No point activity yet
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Your Deals</h2>
          {deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deals.slice(0, 4).map((deal: any) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't submitted any deals yet</p>
              <button
                onClick={() => router.push('/deals/submit')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
              >
                Submit Your First Deal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

