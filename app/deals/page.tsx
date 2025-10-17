import { DealCard } from '@/components/DealCard'
import prisma from '@/lib/prisma'
import { Filter } from 'lucide-react'

interface PageProps {
  searchParams: {
    category?: string
    search?: string
    sortBy?: string
    page?: string
  }
}

async function getDeals(params: PageProps['searchParams']) {
  const page = parseInt(params.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = {
    status: 'APPROVED',
    OR: [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ],
  }

  if (params.category) {
    where.category = { slug: params.category }
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  let orderBy: any = { createdAt: 'desc' }

  switch (params.sortBy) {
    case 'price_low':
      orderBy = { dealPrice: 'asc' }
      break
    case 'price_high':
      orderBy = { dealPrice: 'desc' }
      break
    case 'ending_soon':
      orderBy = { expiresAt: 'asc' }
      break
  }

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
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
      orderBy,
      skip,
      take: limit,
    }),
    prisma.deal.count({ where }),
  ])

  return {
    deals: deals.map(deal => ({
      ...deal,
      voteScore: deal.votes.reduce((sum, vote) => sum + vote.value, 0),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export default async function DealsPage({ searchParams }: PageProps) {
  const { deals, page, totalPages } = await getDeals(searchParams)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Deals</h1>
        
        <div className="flex items-center gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            defaultValue={searchParams.sortBy || 'newest'}
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="ending_soon">Ending Soon</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {deals.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <a
                  key={pageNum}
                  href={`?page=${pageNum}${searchParams.sortBy ? `&sortBy=${searchParams.sortBy}` : ''}`}
                  className={`px-4 py-2 rounded-lg ${
                    pageNum === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No deals found</p>
        </div>
      )}
    </div>
  )
}

