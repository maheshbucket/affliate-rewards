import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCurrentTenant } from '@/lib/tenant'
import { generateSlug } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/categories - List all categories
export async function GET() {
  try {
    // Get current tenant
    const tenant = await getCurrentTenant()
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'No tenant found' },
        { status: 400 }
      )
    }

    const categories = await prisma.category.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            deals: {
              where: {
                status: 'APPROVED',
                tenantId: tenant.id,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a category (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current tenant
    const tenant = await getCurrentTenant()
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'No tenant found' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, icon } = body

    const slug = generateSlug(name)

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        tenantId: tenant.id,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

