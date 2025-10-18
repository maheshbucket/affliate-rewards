import { NextRequest, NextResponse } from 'next/server'
import { getCurrentTenant, getTenantMetadata } from '@/lib/tenant'

// GET /api/tenants/current - Get current tenant based on subdomain/domain
export async function GET(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant()

    if (!tenant) {
      return NextResponse.json(
        { error: 'No tenant found for this domain' },
        { status: 404 }
      )
    }

    const metadata = getTenantMetadata(tenant)

    return NextResponse.json({ 
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain,
        customDomain: tenant.customDomain,
        ...metadata,
        timezone: tenant.timezone,
        currency: tenant.currency,
        language: tenant.language,
      }
    })
  } catch (error) {
    console.error('Error fetching current tenant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenant information' },
      { status: 500 }
    )
  }
}

