import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Creating sample deals...\n')
  
  // Get admin user
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  })

  if (!admin) {
    console.log('❌ Admin user not found')
    return
  }

  // Get categories
  const electronics = await prisma.category.findUnique({ where: { slug: 'electronics' } })
  const fashion = await prisma.category.findUnique({ where: { slug: 'fashion' } })
  const homeGarden = await prisma.category.findUnique({ where: { slug: 'home-garden' } })

  const sampleDeals = [
    {
      title: 'Apple AirPods Pro (2nd Gen) - 30% Off Limited Time',
      description: 'Get the latest AirPods Pro with active noise cancellation, adaptive transparency, and personalized spatial audio. Amazing deal for a limited time only! Features include MagSafe charging case, up to 6 hours of listening time, and sweat and water resistance.',
      originalPrice: 249.00,
      dealPrice: 174.30,
      affiliateUrl: 'https://www.amazon.com/dp/B0CHWRXH8B?tag=yourtag-20',
      affiliateNetwork: 'AMAZON' as const,
      categoryId: electronics?.id || '',
      imageUrl: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',
      status: 'APPROVED' as const,
      featured: true,
      featuredOrder: 1,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Samsung 55" 4K Smart TV - Massive 40% Discount',
      description: 'Experience stunning 4K resolution with this Samsung Smart TV. Features include built-in streaming apps, voice control, HDR support, and sleek design. Perfect for movie nights and gaming!',
      originalPrice: 799.99,
      dealPrice: 479.99,
      affiliateUrl: 'https://www.amazon.com/dp/B0BLS54321?tag=yourtag-20',
      affiliateNetwork: 'AMAZON' as const,
      categoryId: electronics?.id || '',
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
      status: 'APPROVED' as const,
      featured: true,
      featuredOrder: 2,
      expiresAt: null
    },
    {
      title: 'Nike Air Max Running Shoes - 25% Off All Colors',
      description: 'Premium running shoes with Air Max cushioning technology. Lightweight, breathable, and available in multiple colors. Perfect for runners of all levels. Limited stock available!',
      originalPrice: 140.00,
      dealPrice: 105.00,
      affiliateUrl: 'https://www.amazon.com/dp/B0NIKE123?tag=yourtag-20',
      affiliateNetwork: 'AMAZON' as const,
      categoryId: fashion?.id || '',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      status: 'APPROVED' as const,
      featured: true,
      featuredOrder: 3,
      expiresAt: null
    },
    {
      title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker - Flash Sale',
      description: '7-in-1 functionality: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer. 6 quart capacity perfect for families. Over 13 built-in smart programs.',
      originalPrice: 119.99,
      dealPrice: 79.99,
      affiliateUrl: 'https://www.amazon.com/dp/B00FLYWNYQ?tag=yourtag-20',
      affiliateNetwork: 'AMAZON' as const,
      categoryId: homeGarden?.id || '',
      imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800',
      status: 'APPROVED' as const,
      featured: false,
      expiresAt: null
    },
    {
      title: 'Dyson V11 Cordless Vacuum - Best Price Ever!',
      description: 'Powerful suction, intelligent cleaning modes, up to 60 minutes of runtime. Perfect for homes with pets. Includes multiple attachments and charging dock.',
      originalPrice: 599.99,
      dealPrice: 449.99,
      affiliateUrl: 'https://www.amazon.com/dp/B07V3D1234?tag=yourtag-20',
      affiliateNetwork: 'AMAZON' as const,
      categoryId: homeGarden?.id || '',
      imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
      status: 'APPROVED' as const,
      featured: false,
      expiresAt: null
    },
    {
      title: 'Sony WH-1000XM5 Wireless Headphones - $70 Off',
      description: 'Industry-leading noise cancellation, exceptional sound quality, 30-hour battery life, and premium comfort. Perfect for travel, work, and entertainment.',
      originalPrice: 399.99,
      dealPrice: 329.99,
      affiliateUrl: 'https://www.amazon.com/dp/B0BSONY567?tag=yourtag-20',
      affiliateNetwork: 'AMAZON' as const,
      categoryId: electronics?.id || '',
      imageUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800',
      status: 'APPROVED' as const,
      featured: false,
      expiresAt: null
    }
  ]

  for (const dealData of sampleDeals) {
    const savings = dealData.originalPrice - dealData.dealPrice
    const savingsPercent = (savings / dealData.originalPrice) * 100

    await prisma.deal.create({
      data: {
        ...dealData,
        savings: Math.round(savings * 100) / 100,
        savingsPercent: Math.round(savingsPercent * 10) / 10,
        userId: admin.id,
        slug: dealData.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        approvedAt: new Date()
      }
    })
    console.log(`✅ Created: ${dealData.title}`)
  }

  console.log('\n🎉 All 6 sample deals created successfully!')
  console.log('\n📱 Refresh your browser to see them on the homepage!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

