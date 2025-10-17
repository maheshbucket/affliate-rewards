import prisma from './prisma'

export const POINT_VALUES = {
  DEAL_SUBMISSION: 10,
  VOTE: 1,
  SHARE: 5,
  CONVERSION: 20,
  COMMENT: 2,
  DAILY_LOGIN: 1,
}

export async function awardPoints(
  userId: string,
  points: number,
  reason: string,
  description?: string
) {
  try {
    // Create point history entry
    await prisma.pointHistory.create({
      data: {
        userId,
        points,
        reason,
        description,
      },
    })

    // Update user's total points
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: points,
        },
      },
    })

    return true
  } catch (error) {
    console.error('Error awarding points:', error)
    return false
  }
}

export async function deductPoints(
  userId: string,
  points: number,
  reason: string,
  description?: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    })

    if (!user || user.points < points) {
      return false
    }

    await prisma.pointHistory.create({
      data: {
        userId,
        points: -points,
        reason,
        description,
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          decrement: points,
        },
      },
    })

    return true
  } catch (error) {
    console.error('Error deducting points:', error)
    return false
  }
}

export async function getUserPoints(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true },
  })
  return user?.points || 0
}

export async function getPointHistory(userId: string, limit: number = 50) {
  return prisma.pointHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getLeaderboard(limit: number = 10) {
  return prisma.user.findMany({
    where: {
      banned: false,
      preferences: {
        showOnLeaderboard: true,
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
    },
    orderBy: {
      points: 'desc',
    },
    take: limit,
  })
}

