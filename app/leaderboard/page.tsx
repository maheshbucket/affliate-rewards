import prisma from '@/lib/prisma'
import { Trophy, Medal, Award } from 'lucide-react'
import Image from 'next/image'

async function getLeaderboard() {
  return prisma.user.findMany({
    where: {
      banned: false,
    },
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
      _count: {
        select: {
          deals: {
            where: {
              status: 'APPROVED',
            },
          },
        },
      },
    },
    orderBy: {
      points: 'desc',
    },
    take: 50,
  })
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard()

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <Award className="w-6 h-6 text-gray-300" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-600">
            Top contributors ranked by points earned
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {leaderboard.slice(0, 3).map((user, index) => (
            <div
              key={user.id}
              className={`bg-white rounded-lg shadow-lg p-6 text-center ${
                index === 0 ? 'transform scale-110 z-10' : ''
              }`}
            >
              <div className="mb-3">{getRankIcon(index + 1)}</div>
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">
                    {user.name?.[0] || '?'}
                  </span>
                </div>
              )}
              <h3 className="font-bold text-lg">{user.name}</h3>
              <p className="text-2xl font-bold text-primary-600">{user.points}</p>
              <p className="text-sm text-gray-500">
                {user._count.deals} deals submitted
              </p>
            </div>
          ))}
        </div>

        {/* Rest of the Leaderboard */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">All Rankings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-400 w-8">#{index + 1}</span>
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-bold text-gray-400">
                        {user.name?.[0] || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      {user._count.deals} deals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{user.points}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4">How to Earn Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary-600">+10</span>
              <span>Submit an approved deal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary-600">+1</span>
              <span>Vote on a deal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary-600">+5</span>
              <span>Share a deal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary-600">+20</span>
              <span>Generate a conversion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

