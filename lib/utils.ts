import slugify from 'slugify'

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  })
}

export async function generateUniqueSlug(text: string, checkExists: (slug: string) => Promise<boolean>): Promise<string> {
  let slug = generateSlug(text)
  let counter = 1
  
  while (await checkExists(slug)) {
    slug = `${generateSlug(text)}-${counter}`
    counter++
  }
  
  return slug
}

export function calculateSavings(originalPrice: number, dealPrice: number) {
  const savings = originalPrice - dealPrice
  const savingsPercent = (savings / originalPrice) * 100
  return {
    savings: Math.round(savings * 100) / 100,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(date)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain.replace('www.', '')
  } catch {
    return ''
  }
}

export function buildUtmUrl(baseUrl: string, params: {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
}): string {
  const url = new URL(baseUrl)
  if (params.source) url.searchParams.set('utm_source', params.source)
  if (params.medium) url.searchParams.set('utm_medium', params.medium)
  if (params.campaign) url.searchParams.set('utm_campaign', params.campaign)
  if (params.content) url.searchParams.set('utm_content', params.content)
  if (params.term) url.searchParams.set('utm_term', params.term)
  return url.toString()
}

export function generateShortCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export async function validateAffiliateUrl(url: string, network: string): Promise<boolean> {
  // Basic validation - in production, you'd validate against specific affiliate network patterns
  const patterns: Record<string, RegExp> = {
    AMAZON: /amazon\.com.*tag=/i,
    COMMISSION_JUNCTION: /anrdoezrs\.net|dpbolvw\.net|jdoqocy\.com/i,
    RAKUTEN: /click\.linksynergy\.com|rakuten\.com/i,
    SHAREASALE: /shareasale\.com/i,
    IMPACT: /impact\.com/i,
  }

  const pattern = patterns[network]
  if (!pattern) return true // Custom networks bypass validation

  return pattern.test(url)
}

export function getNetworkFromUrl(url: string): string {
  const domain = extractDomain(url).toLowerCase()
  
  if (domain.includes('amazon')) return 'AMAZON'
  if (domain.includes('linksynergy') || domain.includes('rakuten')) return 'RAKUTEN'
  if (domain.includes('shareasale')) return 'SHAREASALE'
  if (domain.includes('impact')) return 'IMPACT'
  if (domain.includes('anrdoezrs') || domain.includes('dpbolvw') || domain.includes('jdoqocy')) return 'COMMISSION_JUNCTION'
  
  return 'CUSTOM'
}

