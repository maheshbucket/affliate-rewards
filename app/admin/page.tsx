'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BarChart, Users, FileText, TrendingUp, Clock } from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [pendingDeals, setPendingDeals] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user && session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') {
      router.push('/dashboard')
      return
    }

    if (session?.user) {
      // Fetch analytics
      fetch('/api/admin/analytics')
        .then(res => res.json())
        .then(setAnalytics)

      // Fetch pending deals
      fetch('/api/deals?status=PENDING')
        .then(res => res.json())
        .then(data => setPendingDeals(data.deals))
    }
  }, [status, session, router])

  const handleApprove = async (dealId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await fetch('/api/admin/deals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, status }),
      })

      // Refresh pending deals
      const response = await fetch('/api/deals?status=PENDING')
      const data = await response.json()
      setPendingDeals(data.deals)
    } catch (error) {
      console.error('Error approving deal:', error)
    }
  }

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">{analytics.overview.totalDeals}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Deals</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold">{analytics.overview.pendingDeals}</span>
            </div>
            <p className="text-gray-600 text-sm">Pending Approval</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{analytics.overview.totalUsers}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Users</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">{analytics.overview.totalClicks}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Clicks</p>
          </div>
        </div>
      )}

      {/* Pending Deals */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Pending Deals</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingDeals.length > 0 ? (
            pendingDeals.map(deal => (
              <div key={deal.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{deal.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{deal.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Category: {deal.category.name}</span>
                      <span>Submitted by: {deal.user.name}</span>
                      <span>Price: ${deal.dealPrice}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(deal.id, 'APPROVED')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(deal.id, 'REJECTED')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              No pending deals
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

