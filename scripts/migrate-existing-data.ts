#!/usr/bin/env tsx

/**
 * Script to migrate existing single-tenant data to multi-tenant structure
 * This should be run ONCE after deploying the multi-tenant schema
 * 
 * Usage: npx tsx scripts/migrate-existing-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting multi-tenant migration...\n')

  // Check if any tenants exist
  const existingTenants = await prisma.tenant.count()
  
  if (existingTenants > 0) {
    console.log(`⚠️  Found ${existingTenants} existing tenant(s).`)
    console.log('This script should only be run once on a fresh multi-tenant deployment.')
    
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    
    const answer = await new Promise<string>((resolve) => {
      rl.question('Do you want to continue anyway? (yes/no): ', resolve)
    })
    
    rl.close()
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('Migration cancelled.')
      process.exit(0)
    }
  }

  try {
    // Create a default tenant for existing data
    console.log('1️⃣ Creating default tenant...')
    
    const defaultTenant = await prisma.tenant.create({
      data: {
        name: 'Default Organization',
        subdomain: 'default',
        brandName: 'Affiliate Rewards',
        ownerEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
        ownerName: 'Admin',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        accentColor: '#10b981',
        status: 'ACTIVE',
        description: 'Default tenant for existing data',
      },
    })

    console.log(`✅ Created default tenant: ${defaultTenant.id}`)

    // Count existing records
    const counts = {
      users: await prisma.user.count(),
      categories: await prisma.category.count(),
      deals: await prisma.deal.count(),
      shares: await prisma.share.count(),
    }

    console.log('\n📊 Found existing records:')
    console.log(`   Users: ${counts.users}`)
    console.log(`   Categories: ${counts.categories}`)
    console.log(`   Deals: ${counts.deals}`)
    console.log(`   Shares: ${counts.shares}`)

    if (counts.users === 0 && counts.categories === 0 && counts.deals === 0 && counts.shares === 0) {
      console.log('\n✅ No existing data to migrate. Creating default categories...')
      
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
          tenantId: defaultTenant.id,
        })),
      })

      console.log('✅ Created 6 default categories')
    } else {
      console.log('\n2️⃣ Migrating existing data to default tenant...')

      // Note: The actual migration would need to be done via raw SQL
      // because Prisma doesn't support updating without the required fields
      console.log('\n⚠️  Migration requires manual SQL execution.')
      console.log('Please run the following SQL commands in your database:\n')

      console.log(`-- Migrate Users`)
      console.log(`UPDATE "User" SET "tenantId" = '${defaultTenant.id}' WHERE "tenantId" IS NULL;\n`)

      console.log(`-- Migrate Categories`)
      console.log(`UPDATE "Category" SET "tenantId" = '${defaultTenant.id}' WHERE "tenantId" IS NULL;\n`)

      console.log(`-- Migrate Deals`)
      console.log(`UPDATE "Deal" SET "tenantId" = '${defaultTenant.id}' WHERE "tenantId" IS NULL;\n`)

      console.log(`-- Migrate Shares`)
      console.log(`UPDATE "Share" SET "tenantId" = '${defaultTenant.id}' WHERE "tenantId" IS NULL;\n`)

      console.log('\nAfter running these commands, your existing data will be associated with the default tenant.')
      console.log(`You can then access it at: http://default.localhost:3000`)
    }

    console.log('\n✅ Migration setup complete!')
    console.log(`\n📝 Next steps:`)
    console.log(`1. If you had existing data, run the SQL commands shown above`)
    console.log(`2. Set DEFAULT_TENANT_SUBDOMAIN=default in your .env file`)
    console.log(`3. Add to /etc/hosts: 127.0.0.1 default.localhost`)
    console.log(`4. Access your site at http://default.localhost:3000`)
    console.log(`5. Create additional tenants via /admin/tenants or npx tsx scripts/create-tenant.ts`)

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

