import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create or get default tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'default' },
    update: {},
    create: {
      name: 'Deals',
      subdomain: 'default',
      brandName: 'Deals',
      tagline: 'Discover the Best Deals, Curated for You',
      description: 'Your trusted source for the best deals across electronics, fashion, home goods, and more. All deals are carefully curated and verified.',
      metaTitle: 'Best Deals - Curated Daily Discounts & Offers',
      metaDescription: 'Find the best deals on electronics, fashion, home & garden, beauty, sports, and travel. All deals curated and verified daily.',
      ownerEmail: 'admin@example.com',
      ownerName: 'Admin',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#10b981',
      status: 'ACTIVE',
    },
  })

  console.log('Created/found default tenant:', tenant.subdomain)

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123456', 12)
  
  const admin = await prisma.user.upsert({
    where: { 
      email_tenantId: {
        email: 'admin@example.com',
        tenantId: tenant.id,
      }
    },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      points: 0,
      tenantId: tenant.id,
    },
  })

  console.log('Created admin user:', admin.email)

  // Create default preferences for admin
  await prisma.userPreference.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
    },
  })

  // Create categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: '💻', order: 1 },
    { name: 'Fashion', slug: 'fashion', icon: '👔', order: 2 },
    { name: 'Home & Garden', slug: 'home-garden', icon: '🏡', order: 3 },
    { name: 'Health & Beauty', slug: 'health-beauty', icon: '💄', order: 4 },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: '⚽', order: 5 },
    { name: 'Books & Media', slug: 'books-media', icon: '📚', order: 6 },
    { name: 'Toys & Games', slug: 'toys-games', icon: '🎮', order: 7 },
    { name: 'Food & Grocery', slug: 'food-grocery', icon: '🍔', order: 8 },
    { name: 'Travel', slug: 'travel', icon: '✈️', order: 9 },
    { name: 'Automotive', slug: 'automotive', icon: '🚗', order: 10 },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { 
        slug_tenantId: {
          slug: category.slug,
          tenantId: tenant.id,
        }
      },
      update: {},
      create: {
        ...category,
        tenantId: tenant.id,
      },
    })
  }

  console.log('Created categories')

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { key: 'points_per_deal' },
    update: {},
    create: {
      key: 'points_per_deal',
      value: '10',
    },
  })

  await prisma.systemSettings.upsert({
    where: { key: 'points_per_vote' },
    update: {},
    create: {
      key: 'points_per_vote',
      value: '1',
    },
  })

  await prisma.systemSettings.upsert({
    where: { key: 'points_per_share' },
    update: {},
    create: {
      key: 'points_per_share',
      value: '5',
    },
  })

  console.log('Created system settings')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

