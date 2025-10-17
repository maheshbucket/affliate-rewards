import { DealCard } from '@/components/DealCard'
import { ShareButton } from '@/components/ShareButton'
import prisma from '@/lib/prisma'
import { Flame, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

async function getFeaturedDeals() {
  return prisma.deal.findMany({
    where: {
      status: 'APPROVED',
      featured: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
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
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      featuredOrder: 'asc',
    },
    take: 3,
  })
}

async function getHotDeals() {
  return prisma.deal.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
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
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      clicks: 'desc',
    },
    take: 6,
  })
}

async function getLatestDeals() {
  return prisma.deal.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
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
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 12,
  })
}

export default async function HomePage() {
  const [featuredDeals, hotDeals, latestDeals] = await Promise.all([
    getFeaturedDeals(),
    getHotDeals(),
    getLatestDeals(),
  ])

  const dealsWithScores = (deals: any[]) =>
    deals.map(deal => ({
      ...deal,
      voteScore: deal.votes.reduce((sum: number, vote: any) => sum + vote.value, 0),
    }))

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white mb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Deals & Earn Rewards
          </h1>
          <p className="text-xl mb-6 text-primary-100">
            Your centralized hub for the best affiliate deals. Save money and earn points with every purchase!
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/deals"
              className="px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Browse All Deals
            </Link>
            <ShareButton
              url={siteUrl}
              title="Check out these amazing deals on Affiliate Rewards!"
            />
          </div>
        </div>
      </div>

      {/* Featured Deals */}
      {featuredDeals.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold">Featured Deals</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealsWithScores(featuredDeals).map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </section>
      )}

      {/* Hot Deals */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold">Hot Deals</h2>
          </div>
          <Link
            href="/deals?sortBy=hottest"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealsWithScores(hotDeals).map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      {/* Latest Deals */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold">Latest Deals</h2>
          </div>
          <Link
            href="/deals?sortBy=newest"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dealsWithScores(latestDeals).map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Saving?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of shoppers who are earning rewards while discovering the best deals online. 
          Submit your own deals and climb the leaderboard!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/signup"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Sign Up Free
          </Link>
          <Link
            href="/leaderboard"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </section>
    </div>
  )
}

