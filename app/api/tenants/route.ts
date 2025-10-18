import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isValidSubdomain, isSubdomainAvailable } from '@/lib/tenant'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/tenants - List all tenants (Super Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            deals: true,
            categories: true,
          },
        },
      },
    })

    return NextResponse.json({ tenants })
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}

// POST /api/tenants - Create a new tenant
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only super admins can create tenants
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      name,
      subdomain,
      brandName,
      ownerEmail,
      ownerName,
      primaryColor,
      secondaryColor,
      accentColor,
      description,
      tagline,
      customDomain,
      logo,
      favicon,
    } = body

    // Validate required fields
    if (!name || !subdomain || !brandName || !ownerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate subdomain format
    if (!isValidSubdomain(subdomain)) {
      return NextResponse.json(
        { error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      )
    }

    // Check if subdomain is available
    const available = await isSubdomainAvailable(subdomain)
    if (!available) {
      return NextResponse.json(
        { error: 'Subdomain is already taken' },
        { status: 400 }
      )
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        subdomain: subdomain.toLowerCase(),
        brandName,
        ownerEmail,
        ownerName,
        primaryColor: primaryColor || '#3b82f6',
        secondaryColor: secondaryColor || '#1e40af',
        accentColor: accentColor || '#10b981',
        description,
        tagline,
        customDomain,
        logo,
        favicon,
        status: 'ACTIVE',
      },
    })

    // Create default categories for the tenant
    const defaultCategories = [
      { name: 'Electronics', slug: 'electronics', icon: '📱', order: 1 },
      { name: 'Fashion', slug: 'fashion', icon: '👔', order: 2 },
      { name: 'Home & Garden', slug: 'home-garden', icon: '🏡', order: 3 },
      { name: 'Beauty', slug: 'beauty', icon: '💄', order: 4 },
      { name: 'Sports', slug: 'sports', icon: '⚽', order: 5 },
      { name: 'Travel', slug: 'travel', icon: '✈️', order: 6 },
    ]

    await prisma.category.createMany({
      data: defaultCategories.map(cat => ({
        ...cat,
        tenantId: tenant.id,
      })),
    })

    return NextResponse.json({ 
      tenant,
      message: 'Tenant created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    )
  }
}

