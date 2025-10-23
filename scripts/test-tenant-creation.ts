#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testTenantCreation() {
  try {
    console.log('🧪 Testing tenant creation...\n')
    
    const testSubdomain = 'test-' + Date.now()
    
    console.log(`Creating tenant with subdomain: ${testSubdomain}`)
    
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        subdomain: testSubdomain,
        brandName: 'Test Deals',
        ownerEmail: 'test@example.com',
        ownerName: 'Test Owner',
        tagline: 'Test tagline',
        description: 'Test description',
        status: 'ACTIVE',
      },
    })
    
    console.log('✅ Tenant created:', tenant.id)
    
    // Create test categories
    console.log('Creating test categories...')
    
    const categories = await prisma.category.createMany({
      data: [
        { name: 'Test Cat 1', slug: 'test-1', tenantId: tenant.id, order: 1 },
        { name: 'Test Cat 2', slug: 'test-2', tenantId: tenant.id, order: 2 },
      ],
    })
    
    console.log('✅ Categories created:', categories.count)
    
    // Clean up
    console.log('\nCleaning up...')
    await prisma.category.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
    
    console.log('✅ Test completed successfully!')
    console.log('\n💡 Tenant creation works! The error might be:')
    console.log('   1. Missing required fields in the form')
    console.log('   2. Subdomain validation issue')
    console.log('   3. Duplicate subdomain')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error('Code:', error.code)
    console.error('\n💡 This is the actual error you\'re seeing!')
  } finally {
    await prisma.$disconnect()
  }
}

testTenantCreation()


