import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Get current tenant
    const tenant = await getCurrentTenant()
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'No tenant found. Please access via a valid subdomain.' },
        { status: 400 }
      )
    }

    // Check if user exists in this tenant
    const existingUser = await prisma.user.findUnique({
      where: { 
        email_tenantId: {
          email,
          tenantId: tenant.id,
        }
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        points: 0,
        tenantId: tenant.id,
      },
    })

    // Create default preferences
    await prisma.userPreference.create({
      data: {
        userId: user.id,
      },
    })

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          tenantId: user.tenantId,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

