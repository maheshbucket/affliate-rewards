#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateBranding() {
  try {
    console.log('🎨 Updating Default Tenant Branding...\n')
    
    // Update the default tenant
    const tenant = await prisma.tenant.update({
      where: { subdomain: 'default' },
      data: {
        name: 'Deals',
        brandName: 'Deals',
        tagline: 'Discover the Best Deals, Curated for You',
        description: 'Your trusted source for the best deals across electronics, fashion, home goods, and more. All deals are carefully curated and verified.',
        metaTitle: 'Best Deals - Curated Daily Discounts & Offers',
        metaDescription: 'Find the best deals on electronics, fashion, home & garden, beauty, sports, and travel. All deals curated and verified daily.',
      }
    })
    
    console.log('✅ Updated tenant:', tenant.name)
    console.log('   Brand Name:', tenant.brandName)
    console.log('   Tagline:', tenant.tagline)
    console.log('\n🎉 Branding updated successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateBranding()

