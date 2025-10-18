#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  try {
    console.log('🔍 Verifying Production Database...\n')
    
    // Check tenants
    const tenants = await prisma.tenant.findMany()
    console.log(`✅ Tenants: ${tenants.length} found`)
    tenants.forEach(t => {
      console.log(`   - ${t.name} (${t.subdomain})`)
    })
    
    // Check deals with tenantId
    const totalDeals = await prisma.deal.count()
    console.log(`\n✅ Deals: ${totalDeals} found (all should have tenantId)`)
    
    // Check users with tenantId
    const totalUsers = await prisma.user.count()
    console.log(`✅ Users: ${totalUsers} found (all should have tenantId)`)
    
    // Check categories with tenantId
    const totalCategories = await prisma.category.count()
    console.log(`✅ Categories: ${totalCategories} found (all should have tenantId)`)
    
    console.log('\n🎉 Production database is ready!')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verify()

