import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isValidSubdomain, isSubdomainAvailable } from '@/lib/tenant'

// GET /api/tenants/[id] - Get a specific tenant
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
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

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 }
    )
  }
}

// PATCH /api/tenants/[id] - Update a tenant
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
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
      status,
      maxUsers,
      maxDeals,
    } = body

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: params.id },
    })

    if (!existingTenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Validate subdomain if it's being changed
    if (subdomain && subdomain !== existingTenant.subdomain) {
      if (!isValidSubdomain(subdomain)) {
        return NextResponse.json(
          { error: 'Invalid subdomain format' },
          { status: 400 }
        )
      }

      const available = await isSubdomainAvailable(subdomain, params.id)
      if (!available) {
        return NextResponse.json(
          { error: 'Subdomain is already taken' },
          { status: 400 }
        )
      }
    }

    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(subdomain && { subdomain: subdomain.toLowerCase() }),
        ...(brandName && { brandName }),
        ...(ownerEmail && { ownerEmail }),
        ...(ownerName && { ownerName }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(accentColor && { accentColor }),
        ...(description !== undefined && { description }),
        ...(tagline !== undefined && { tagline }),
        ...(customDomain !== undefined && { customDomain }),
        ...(logo !== undefined && { logo }),
        ...(favicon !== undefined && { favicon }),
        ...(status && { status }),
        ...(maxUsers && { maxUsers }),
        ...(maxDeals && { maxDeals }),
      },
    })

    return NextResponse.json({ 
      tenant,
      message: 'Tenant updated successfully'
    })
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    )
  }
}

// DELETE /api/tenants/[id] - Delete a tenant
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
            deals: true,
          },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Optionally prevent deletion if tenant has users/deals
    // if (tenant._count.users > 0 || tenant._count.deals > 0) {
    //   return NextResponse.json(
    //     { error: 'Cannot delete tenant with existing users or deals' },
    //     { status: 400 }
    //   )
    // }

    // Delete tenant (cascade will delete related data)
    await prisma.tenant.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ 
      message: 'Tenant deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    )
  }
}

