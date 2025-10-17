import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { CategoryNav } from '@/components/CategoryNav'
import { Footer } from '@/components/Footer'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Affiliate Rewards - Best Deals & Discounts Hub',
  description: 'Discover the best affiliate deals and discounts in one place. Earn rewards while you shop and save money!',
  keywords: 'deals, discounts, affiliate, rewards, shopping, savings',
  authors: [{ name: 'Affiliate Rewards' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Affiliate Rewards',
    title: 'Affiliate Rewards - Best Deals & Discounts Hub',
    description: 'Discover the best affiliate deals and discounts in one place. Earn rewards while you shop and save money!',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affiliate Rewards - Best Deals & Discounts Hub',
    description: 'Discover the best affiliate deals and discounts in one place. Earn rewards while you shop and save money!',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <CategoryNav />
            <main className="flex-1 bg-gray-50">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}

