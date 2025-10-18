import { headers } from 'next/headers'
import prisma from './prisma'
import { Tenant } from '@prisma/client'

/**
 * Get the current tenant from the request headers
 * Middleware sets x-tenant-subdomain header, we look up the tenant here
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  const headersList = headers()
  const tenantSubdomain = headersList.get('x-tenant-subdomain')
  const tenantDomain = headersList.get('x-tenant-domain')

  // Try to find by subdomain first
  if (tenantSubdomain) {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSubdomain, status: 'ACTIVE' },
    })
    if (tenant) return tenant
  }

  // Try to find by custom domain
  if (tenantDomain) {
    const tenant = await prisma.tenant.findUnique({
      where: { customDomain: tenantDomain, status: 'ACTIVE' },
    })
    if (tenant) return tenant
  }

  // Fallback to default tenant if exists (for development)
  if (process.env.DEFAULT_TENANT_SUBDOMAIN) {
    return await prisma.tenant.findUnique({
      where: { 
        subdomain: process.env.DEFAULT_TENANT_SUBDOMAIN,
        status: 'ACTIVE'
      },
    })
  }

  return null
}

/**
 * Get tenant subdomain from headers
 */
export function getTenantSubdomain(): string | null {
  const headersList = headers()
  return headersList.get('x-tenant-subdomain')
}

/**
 * Get tenant by subdomain
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  return await prisma.tenant.findUnique({
    where: { subdomain, status: 'ACTIVE' },
  })
}

/**
 * Get tenant by custom domain
 */
export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  return await prisma.tenant.findUnique({
    where: { customDomain: domain, status: 'ACTIVE' },
  })
}


/**
 * Validate if a subdomain is available
 */
export async function isSubdomainAvailable(subdomain: string, excludeTenantId?: string): Promise<boolean> {
  const existing = await prisma.tenant.findUnique({
    where: { subdomain },
  })

  if (!existing) return true
  if (excludeTenantId && existing.id === excludeTenantId) return true
  
  return false
}

/**
 * Validate subdomain format
 * - Must be 3-63 characters
 * - Only lowercase letters, numbers, and hyphens
 * - Cannot start or end with a hyphen
 */
export function isValidSubdomain(subdomain: string): boolean {
  const regex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/
  
  // Reserved subdomains
  const reserved = [
    'www', 'api', 'admin', 'app', 'mail', 'ftp', 
    'smtp', 'pop', 'imap', 'blog', 'shop', 'store',
    'support', 'help', 'status', 'staging', 'dev'
  ]
  
  if (reserved.includes(subdomain.toLowerCase())) {
    return false
  }
  
  return regex.test(subdomain)
}

/**
 * Create branding CSS variables from tenant
 */
export function getTenantCSSVariables(tenant: Tenant): Record<string, string> {
  return {
    '--color-primary': tenant.primaryColor,
    '--color-secondary': tenant.secondaryColor,
    '--color-accent': tenant.accentColor,
  }
}

/**
 * Get tenant branding metadata
 */
export function getTenantMetadata(tenant: Tenant) {
  return {
    name: tenant.brandName,
    title: tenant.metaTitle || tenant.brandName,
    description: tenant.metaDescription || tenant.description || `${tenant.brandName} - Exclusive Deals and Discounts`,
    logo: tenant.logo,
    favicon: tenant.favicon,
    tagline: tenant.tagline,
    colors: {
      primary: tenant.primaryColor,
      secondary: tenant.secondaryColor,
      accent: tenant.accentColor,
    },
  }
}

