#!/usr/bin/env tsx

/**
 * Script to create a new tenant
 * Usage: npx tsx scripts/create-tenant.ts
 */

import { PrismaClient } from '@prisma/client'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function main() {
  console.log('🎯 Tenant Creation Wizard\n')

  const name = await question('Company Name: ')
  const subdomain = await question('Subdomain (lowercase, alphanumeric): ')
  const brandName = await question('Brand Name (display name): ')
  const ownerEmail = await question('Owner Email: ')
  const ownerName = await question('Owner Name (optional): ')
  const tagline = await question('Tagline (optional): ')
  const description = await question('Description (optional): ')
  
  // Validate subdomain
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/
  if (!subdomainRegex.test(subdomain)) {
    console.error('❌ Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.')
    rl.close()
    process.exit(1)
  }

  // Check if subdomain exists
  const existing = await prisma.tenant.findUnique({
    where: { subdomain },
  })

  if (existing) {
    console.error(`❌ Subdomain "${subdomain}" is already taken.`)
    rl.close()
    process.exit(1)
  }

  console.log('\n🎨 Branding Colors (press Enter for defaults)')
  const primaryColor = (await question('Primary Color (default: #3b82f6): ')) || '#3b82f6'
  const secondaryColor = (await question('Secondary Color (default: #1e40af): ')) || '#1e40af'
  const accentColor = (await question('Accent Color (default: #10b981): ')) || '#10b981'

  console.log('\n📝 Creating tenant...')

  try {
    const tenant = await prisma.tenant.create({
      data: {
        name,
        subdomain: subdomain.toLowerCase(),
        brandName,
        ownerEmail,
        ownerName: ownerName || undefined,
        tagline: tagline || undefined,
        description: description || undefined,
        primaryColor,
        secondaryColor,
        accentColor,
        status: 'ACTIVE',
      },
    })

    console.log('✅ Tenant created successfully!')
    console.log(`   ID: ${tenant.id}`)
    console.log(`   Subdomain: ${tenant.subdomain}`)

    // Create default categories
    console.log('\n📁 Creating default categories...')
    const categories = [
      { name: 'Electronics', slug: 'electronics', icon: '📱', order: 1 },
      { name: 'Fashion', slug: 'fashion', icon: '👔', order: 2 },
      { name: 'Home & Garden', slug: 'home-garden', icon: '🏡', order: 3 },
      { name: 'Beauty', slug: 'beauty', icon: '💄', order: 4 },
      { name: 'Sports', slug: 'sports', icon: '⚽', order: 5 },
      { name: 'Travel', slug: 'travel', icon: '✈️', order: 6 },
    ]

    await prisma.category.createMany({
      data: categories.map(cat => ({
        ...cat,
        tenantId: tenant.id,
      })),
    })

    console.log('✅ Created 6 default categories')
    console.log('\n🚀 Setup complete!')
    console.log(`\n   Access your tenant at: http://${tenant.subdomain}.localhost:3000`)
    console.log(`   (Make sure to add the subdomain to your /etc/hosts file for local dev)`)
  } catch (error) {
    console.error('❌ Error creating tenant:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

main()

