'use client'

import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { useTenant } from './TenantProvider'

// Format subdomain into "Subdomain Deals" (e.g., "pm" -> "PM Deals")
function formatTenantName(subdomain?: string): string {
  if (!subdomain || subdomain === 'default') return 'Deals'
  const formatted = subdomain
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  return `${formatted} Deals`
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { tenant } = useTenant()
  const displayName = formatTenantName(tenant?.subdomain)

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-primary-400" />
              <span className="text-lg font-bold text-white">
                {displayName}
              </span>
            </div>
            <p className="text-sm">
              {tenant?.tagline || 'Discover the best deals, curated for you. All deals carefully verified and updated daily!'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-primary-400">
                  All Deals
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-primary-400">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/deals/submit" className="hover:text-primary-400">
                  Submit Deal
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-primary-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-primary-400">
                  Affiliate Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary-400">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>
            © {currentYear} {displayName}. All rights reserved.
          </p>
          <p className="mt-2 text-gray-400">
            Disclosure: We may earn affiliate commissions from qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  )
}

