import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, formatRelativeTime, extractDomain } from '@/lib/utils'
import { ShareButton } from '@/components/ShareButton'
import { Clock, ExternalLink, Eye, MousePointerClick, Calendar, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import { getCurrentTenant } from '@/lib/tenant'

// Force dynamic rendering (uses headers())
export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

async function getDeal(slug: string) {
  const tenant = await getCurrentTenant()
  
  if (!tenant) {
    return null
  }

  const deal = await prisma.deal.findUnique({
    where: { 
      slug_tenantId: {
        slug,
        tenantId: tenant.id,
      }
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
          userId: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        where: {
          parentId: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!deal) return null

  const voteScore = deal.votes.reduce((sum, vote) => sum + vote.value, 0)

  return { ...deal, voteScore }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const deal = await getDeal(params.slug)

  if (!deal) {
    return {
      title: 'Deal Not Found',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: `${deal.title} | Affiliate Rewards`,
    description: deal.description,
    keywords: deal.tags.map(tag => tag.name).join(', '),
    openGraph: {
      title: deal.title,
      description: deal.description,
      images: deal.imageUrl ? [deal.imageUrl] : [],
      url: `${siteUrl}/deals/${deal.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: deal.title,
      description: deal.description,
      images: deal.imageUrl ? [deal.imageUrl] : [],
    },
  }
}

export default async function DealPage({ params }: PageProps) {
  const deal = await getDeal(params.slug)

  if (!deal || deal.status !== 'APPROVED') {
    notFound()
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const dealUrl = `${siteUrl}/deals/${deal.slug}`

  const isExpiring = deal.expiresAt && 
    new Date(deal.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Image */}
              <div className="relative h-96 bg-gray-200">
                {deal.imageUrl ? (
                  <Image
                    src={deal.imageUrl}
                    alt={deal.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image Available
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                  {deal.savingsPercent}% OFF
                </div>
                {isExpiring && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Expiring Soon
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link
                      href={`/category/${deal.category.slug}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                    >
                      {deal.category.name}
                    </Link>
                    <h1 className="text-3xl font-bold mt-2">{deal.title}</h1>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {deal.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointerClick className="w-4 h-4" />
                    {deal.clicks} clicks
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatRelativeTime(deal.createdAt)}
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed">{deal.description}</p>
                </div>

                {/* Tags */}
                {deal.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {deal.tags.map(tag => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.slug}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Affiliate Link Source */}
                <div className="text-sm text-gray-500 mb-6">
                  Available at: <span className="font-semibold">{extractDomain(deal.affiliateUrl)}</span>
                </div>

                {/* Posted By */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">
                    Posted by <span className="font-semibold">{deal.user.name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div id="comments" className="bg-white rounded-lg shadow-lg mt-8 p-8">
              <h2 className="text-2xl font-bold mb-6">
                Comments ({deal.comments.length})
              </h2>
              {deal.comments.length > 0 ? (
                <div className="space-y-6">
                  {deal.comments.map(comment => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start gap-3">
                        {comment.user.image ? (
                          <Image
                            src={comment.user.image}
                            alt={comment.user.name || 'User'}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="font-bold text-gray-400">
                              {comment.user.name?.[0] || '?'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{comment.user.name}</span>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-primary-600">
                    {formatPrice(deal.dealPrice)}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(deal.originalPrice)}
                  </span>
                </div>
                <p className="text-green-600 font-semibold">
                  Save {formatPrice(deal.savings)} ({deal.savingsPercent}% off)
                </p>
              </div>

              {deal.expiresAt && (
                <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700">
                    <strong>Expires:</strong> {new Date(deal.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              <a
                href={deal.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 bg-primary-600 text-white text-center rounded-lg font-bold text-lg hover:bg-primary-700 transition-colors mb-4"
                onClick={async () => {
                  await fetch(`/api/deals/${deal.slug}/click`, { method: 'POST' })
                }}
              >
                <ExternalLink className="w-5 h-5 inline mr-2" />
                Get This Deal
              </a>

              <ShareButton url={dealUrl} title={deal.title} dealId={deal.id} />

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Vote Score</span>
                  <span className="font-bold text-xl">{deal.voteScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

