'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, formatRelativeTime, extractDomain } from '@/lib/utils'
import { ThumbsUp, ThumbsDown, MessageCircle, ExternalLink, Clock } from 'lucide-react'

interface DealCardProps {
  deal: {
    id: string
    slug: string
    title: string
    description: string
    originalPrice: number
    dealPrice: number
    savingsPercent: number
    imageUrl?: string | null
    affiliateUrl: string
    expiresAt?: Date | string | null
    category: {
      name: string
      slug: string
    }
    user: {
      name: string | null
      image?: string | null
    }
    voteScore?: number
    _count?: {
      comments: number
    }
    createdAt: Date | string
  }
  onVote?: (value: 1 | -1) => void
  userVote?: number
}

export function DealCard({ deal, onVote, userVote }: DealCardProps) {
  const handleVote = (e: React.MouseEvent, value: 1 | -1) => {
    e.preventDefault()
    e.stopPropagation()
    onVote?.(value)
  }

  const isExpiring = deal.expiresAt && 
    new Date(deal.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <Link href={`/deals/${deal.slug}`}>
        <div className="relative h-48 bg-gray-200">
          {deal.imageUrl ? (
            <Image
              src={deal.imageUrl}
              alt={deal.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {deal.savingsPercent}% OFF
          </div>
          {isExpiring && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expiring Soon
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/deals/${deal.slug}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary-600">
            {deal.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {deal.description}
        </p>
        
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(deal.dealPrice)}
          </span>
          <span className="text-gray-400 line-through">
            {formatPrice(deal.originalPrice)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <Link 
            href={`/category/${deal.category.slug}`}
            className="hover:text-primary-600"
          >
            {deal.category.name}
          </Link>
          <span>{formatRelativeTime(deal.createdAt)}</span>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleVote(e, 1)}
              className={`p-2 rounded hover:bg-gray-100 ${
                userVote === 1 ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <span className="font-semibold">{deal.voteScore || 0}</span>
            <button
              onClick={(e) => handleVote(e, -1)}
              className={`p-2 rounded hover:bg-gray-100 ${
                userVote === -1 ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href={`/deals/${deal.slug}#comments`}
              className="flex items-center gap-1 text-gray-600 hover:text-primary-600"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{deal._count?.comments || 0}</span>
            </Link>
            
            <a
              href={deal.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
              Get Deal
            </a>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          via {extractDomain(deal.affiliateUrl)}
        </div>
      </div>
    </div>
  )
}

