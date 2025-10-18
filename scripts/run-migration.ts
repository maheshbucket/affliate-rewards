#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Running multi-tenant migration...\n')

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations-manual', 'add_multi_tenancy.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('📝 Executing migration SQL...')
    
    // Execute the SQL
    await prisma.$executeRawUnsafe(sql)

    console.log('✅ Migration completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   - Created Tenant table')
    console.log('   - Created default tenant (subdomain: "default")')
    console.log('   - Migrated existing users to default tenant')
    console.log('   - Migrated existing categories to default tenant')
    console.log('   - Migrated existing deals to default tenant')
    console.log('   - Updated all constraints and indexes')

    console.log('\n🎯 Next steps:')
    console.log('   1. Add to /etc/hosts: 127.0.0.1 default.localhost')
    console.log('   2. Add to .env: DEFAULT_TENANT_SUBDOMAIN=default')
    console.log('   3. Start your app: npm run dev')
    console.log('   4. Visit: http://default.localhost:3000')
    console.log('   5. Create more tenants: npx tsx scripts/create-tenant.ts')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


