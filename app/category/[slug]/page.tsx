import { DealCard } from '@/components/DealCard'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: { slug: string }
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      deals: {
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
      },
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategory(params.slug)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} Deals | Affiliate Rewards`,
    description: category.description || `Browse the best ${category.name} deals and discounts`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  const dealsWithScores = category.deals.map(deal => ({
    ...deal,
    voteScore: deal.votes.reduce((sum, vote) => sum + vote.value, 0),
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {category.icon} {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-600 text-lg">{category.description}</p>
        )}
        <p className="text-gray-500 mt-2">{category.deals.length} deals available</p>
      </div>

      {dealsWithScores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dealsWithScores.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No deals in this category yet</p>
          <a
            href="/deals/submit"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Submit the First Deal
          </a>
        </div>
      )}
    </div>
  )
}

