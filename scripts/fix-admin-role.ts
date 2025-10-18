#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAdminRole() {
  try {
    console.log('🔍 Checking admin user role...\n')
    
    // Find the admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@example.com',
      },
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found!')
      console.log('   Create one with: npm run seed')
      return
    }
    
    console.log(`📋 Current admin user:`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   Name: ${adminUser.name}`)
    
    if (adminUser.role === 'ADMIN') {
      console.log('\n✅ Admin user already has ADMIN role!')
      console.log('\n💡 If you still can\'t access /admin/tenants:')
      console.log('   1. Sign out completely')
      console.log('   2. Clear browser cookies')
      console.log('   3. Sign in again with: admin@example.com / admin123456')
    } else {
      console.log(`\n⚠️  Admin user has role: ${adminUser.role}`)
      console.log('   Fixing...')
      
      const updated = await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'ADMIN' },
      })
      
      console.log('\n✅ Updated admin user role to ADMIN!')
      console.log('\n💡 Next steps:')
      console.log('   1. Sign out completely')
      console.log('   2. Clear browser cookies')  
      console.log('   3. Sign in again with: admin@example.com / admin123456')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminRole()

