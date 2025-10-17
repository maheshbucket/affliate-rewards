'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    deals: number
  }
}

export function CategoryNav() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error)
  }, [])

  return (
    <nav className="bg-white border-b border-gray-200 overflow-x-auto">
      <div className="container mx-auto px-4">
        <div className="flex gap-6 py-3">
          <Link
            href="/"
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Deals
          </Link>
          {categories.map(category => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === `/category/${category.slug}`
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
              <span className="ml-2 text-xs text-gray-500">
                ({category._count.deals})
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

