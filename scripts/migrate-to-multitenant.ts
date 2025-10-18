#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting multi-tenant migration...\n')

  try {
    // Step 1: Create TenantStatus enum if it doesn't exist
    console.log('1️⃣ Creating enum types...')
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    console.log('   ✅ Enum types ready\n')

    // Step 2: Create Tenant table
    console.log('2️⃣ Creating Tenant table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Tenant" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "subdomain" TEXT NOT NULL,
        "customDomain" TEXT,
        "brandName" TEXT NOT NULL,
        "logo" TEXT,
        "favicon" TEXT,
        "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
        "secondaryColor" TEXT NOT NULL DEFAULT '#1e40af',
        "accentColor" TEXT NOT NULL DEFAULT '#10b981',
        "tagline" TEXT,
        "description" TEXT,
        "metaTitle" TEXT,
        "metaDescription" TEXT,
        "timezone" TEXT NOT NULL DEFAULT 'UTC',
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "language" TEXT NOT NULL DEFAULT 'en',
        "features" TEXT NOT NULL DEFAULT '[]',
        "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
        "maxUsers" INTEGER NOT NULL DEFAULT 1000,
        "maxDeals" INTEGER NOT NULL DEFAULT 500,
        "ownerName" TEXT,
        "ownerEmail" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('   ✅ Tenant table created\n')

    // Step 3: Create indexes
    console.log('3️⃣ Creating indexes...')
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_subdomain_key" ON "Tenant"("subdomain");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_customDomain_key" ON "Tenant"("customDomain");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Tenant_subdomain_idx" ON "Tenant"("subdomain");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Tenant_status_idx" ON "Tenant"("status");
    `)
    console.log('   ✅ Indexes created\n')

    // Step 4: Check if default tenant exists
    console.log('4️⃣ Creating default tenant...')
    const existingTenant = await prisma.$queryRaw<any[]>`
      SELECT id FROM "Tenant" WHERE subdomain = 'default' LIMIT 1
    `
    
    let defaultTenantId: string
    
    if (existingTenant.length > 0) {
      defaultTenantId = existingTenant[0].id
      console.log(`   ℹ️  Default tenant already exists: ${defaultTenantId}\n`)
    } else {
      const newTenantId = `tenant_${Date.now()}`
      await prisma.$executeRawUnsafe(`
        INSERT INTO "Tenant" ("id", "name", "subdomain", "brandName", "ownerEmail", "createdAt", "updatedAt")
        VALUES ('${newTenantId}', 'Default Organization', 'default', 'Affiliate Rewards', 'admin@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      defaultTenantId = newTenantId
      console.log(`   ✅ Created default tenant: ${defaultTenantId}\n`)
    }

    // Step 5: Add tenantId to User table
    console.log('5️⃣ Migrating User table...')
    
    // Add column if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `)
    
    // Update existing users
    const usersUpdated = await prisma.$executeRawUnsafe(`
      UPDATE "User" SET "tenantId" = '${defaultTenantId}' WHERE "tenantId" IS NULL
    `)
    
    // Make it NOT NULL
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ALTER COLUMN "tenantId" SET NOT NULL
    `)
    
    // Drop old constraint if exists
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_email_key"
    `)
    
    // Add new unique constraint
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "User" ADD CONSTRAINT "User_email_tenantId_key" UNIQUE ("email", "tenantId");
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `)
    
    // Add foreign key
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    
    // Add index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "User_tenantId_idx" ON "User"("tenantId")
    `)
    
    console.log(`   ✅ Migrated User table (${usersUpdated} users)\n`)

    // Step 6: Add tenantId to Category table
    console.log('6️⃣ Migrating Category table...')
    
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `)
    
    const categoriesUpdated = await prisma.$executeRawUnsafe(`
      UPDATE "Category" SET "tenantId" = '${defaultTenantId}' WHERE "tenantId" IS NULL
    `)
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Category" ALTER COLUMN "tenantId" SET NOT NULL
    `)
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_slug_key"
    `)
    
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "Category" ADD CONSTRAINT "Category_slug_tenantId_key" UNIQUE ("slug", "tenantId");
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `)
    
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Category_tenantId_idx" ON "Category"("tenantId")
    `)
    
    console.log(`   ✅ Migrated Category table (${categoriesUpdated} categories)\n`)

    // Step 7: Add tenantId to Deal table
    console.log('7️⃣ Migrating Deal table...')
    
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `)
    
    const dealsUpdated = await prisma.$executeRawUnsafe(`
      UPDATE "Deal" SET "tenantId" = '${defaultTenantId}' WHERE "tenantId" IS NULL
    `)
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Deal" ALTER COLUMN "tenantId" SET NOT NULL
    `)
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Deal" DROP CONSTRAINT IF EXISTS "Deal_slug_key"
    `)
    
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "Deal" ADD CONSTRAINT "Deal_slug_tenantId_key" UNIQUE ("slug", "tenantId");
      EXCEPTION
        WHEN duplicate_table THEN null;
      END $$;
    `)
    
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "Deal" ADD CONSTRAINT "Deal_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Deal_tenantId_idx" ON "Deal"("tenantId")
    `)
    
    console.log(`   ✅ Migrated Deal table (${dealsUpdated} deals)\n`)

    // Step 8: Add tenantId to Share table if it exists
    console.log('8️⃣ Migrating Share table...')
    
    const shareTableExists = await prisma.$queryRaw<any[]>`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'Share'
    `
    
    if (shareTableExists.length > 0) {
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "Share" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END $$;
      `)
      
      const sharesUpdated = await prisma.$executeRawUnsafe(`
        UPDATE "Share" SET "tenantId" = '${defaultTenantId}' WHERE "tenantId" IS NULL
      `)
      
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Share" ALTER COLUMN "tenantId" SET NOT NULL
      `)
      
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Share" DROP CONSTRAINT IF EXISTS "Share_shortUrl_key"
      `)
      
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "Share" ADD CONSTRAINT "Share_shortUrl_tenantId_key" UNIQUE ("shortUrl", "tenantId");
        EXCEPTION
          WHEN duplicate_table THEN null;
        END $$;
      `)
      
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "Share" ADD CONSTRAINT "Share_tenantId_fkey" 
          FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `)
      
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Share_tenantId_idx" ON "Share"("tenantId")
      `)
      
      console.log(`   ✅ Migrated Share table (${sharesUpdated} shares)\n`)
    } else {
      console.log(`   ℹ️  Share table doesn't exist yet\n`)
    }

    console.log('✅ Migration completed successfully!\n')
    console.log('📊 Summary:')
    console.log(`   - Default tenant ID: ${defaultTenantId}`)
    console.log(`   - Subdomain: default`)
    console.log(`   - All existing data migrated to default tenant`)
    
    console.log('\n🎯 Next steps:')
    console.log('   1. Update your .env file:')
    console.log('      DEFAULT_TENANT_SUBDOMAIN=default')
    console.log('')
    console.log('   2. Add to /etc/hosts (Mac/Linux):')
    console.log('      sudo nano /etc/hosts')
    console.log('      Add: 127.0.0.1 default.localhost')
    console.log('')
    console.log('   3. Start your app:')
    console.log('      npm run dev')
    console.log('')
    console.log('   4. Visit:')
    console.log('      http://default.localhost:3000')
    console.log('      or http://localhost:3000 (will use default tenant)')
    console.log('')
    console.log('   5. Create more tenants:')
    console.log('      npx tsx scripts/create-tenant.ts')
    console.log('')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.error('\nIf you see constraint errors, the migration may have partially completed.')
    console.error('You can run this script again - it handles existing structures.')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

