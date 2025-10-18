-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable: Tenant
CREATE TABLE "Tenant" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant"("subdomain");
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");
CREATE INDEX "Tenant_subdomain_idx" ON "Tenant"("subdomain");
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- Insert default tenant for existing data
INSERT INTO "Tenant" ("id", "name", "subdomain", "brandName", "ownerEmail", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'Default Organization',
    'default',
    'Affiliate Rewards',
    'admin@example.com',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Store the default tenant ID for later use
DO $$
DECLARE
    default_tenant_id TEXT;
BEGIN
    SELECT id INTO default_tenant_id FROM "Tenant" WHERE subdomain = 'default';

    -- Add tenantId column to User (nullable first)
    ALTER TABLE "User" ADD COLUMN "tenantId" TEXT;
    
    -- Update existing users with default tenant
    UPDATE "User" SET "tenantId" = default_tenant_id WHERE "tenantId" IS NULL;
    
    -- Make tenantId required
    ALTER TABLE "User" ALTER COLUMN "tenantId" SET NOT NULL;
    
    -- Drop old unique constraint on email
    ALTER TABLE "User" DROP CONSTRAINT "User_email_key";
    
    -- Add new unique constraint on email + tenantId
    ALTER TABLE "User" ADD CONSTRAINT "User_email_tenantId_key" UNIQUE ("email", "tenantId");
    
    -- Add foreign key
    ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
    -- Add index
    CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

    -- Add tenantId column to Category
    ALTER TABLE "Category" ADD COLUMN "tenantId" TEXT;
    
    -- Update existing categories with default tenant
    UPDATE "Category" SET "tenantId" = default_tenant_id WHERE "tenantId" IS NULL;
    
    -- Make tenantId required
    ALTER TABLE "Category" ALTER COLUMN "tenantId" SET NOT NULL;
    
    -- Drop old unique constraint on slug
    ALTER TABLE "Category" DROP CONSTRAINT "Category_slug_key";
    
    -- Add new unique constraint on slug + tenantId
    ALTER TABLE "Category" ADD CONSTRAINT "Category_slug_tenantId_key" UNIQUE ("slug", "tenantId");
    
    -- Add foreign key
    ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
    -- Add index
    CREATE INDEX "Category_tenantId_idx" ON "Category"("tenantId");

    -- Add tenantId column to Deal
    ALTER TABLE "Deal" ADD COLUMN "tenantId" TEXT;
    
    -- Update existing deals with default tenant
    UPDATE "Deal" SET "tenantId" = default_tenant_id WHERE "tenantId" IS NULL;
    
    -- Make tenantId required
    ALTER TABLE "Deal" ALTER COLUMN "tenantId" SET NOT NULL;
    
    -- Drop old unique constraint on slug
    ALTER TABLE "Deal" DROP CONSTRAINT "Deal_slug_key";
    
    -- Add new unique constraint on slug + tenantId
    ALTER TABLE "Deal" ADD CONSTRAINT "Deal_slug_tenantId_key" UNIQUE ("slug", "tenantId");
    
    -- Add foreign key
    ALTER TABLE "Deal" ADD CONSTRAINT "Deal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
    -- Add index
    CREATE INDEX "Deal_tenantId_idx" ON "Deal"("tenantId");

    -- Add tenantId column to Share (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Share') THEN
        ALTER TABLE "Share" ADD COLUMN "tenantId" TEXT;
        
        -- Update existing shares with default tenant
        UPDATE "Share" SET "tenantId" = default_tenant_id WHERE "tenantId" IS NULL;
        
        -- Make tenantId required
        ALTER TABLE "Share" ALTER COLUMN "tenantId" SET NOT NULL;
        
        -- Drop old unique constraint on shortUrl
        ALTER TABLE "Share" DROP CONSTRAINT IF EXISTS "Share_shortUrl_key";
        
        -- Add new unique constraint on shortUrl + tenantId
        ALTER TABLE "Share" ADD CONSTRAINT "Share_shortUrl_tenantId_key" UNIQUE ("shortUrl", "tenantId");
        
        -- Add foreign key
        ALTER TABLE "Share" ADD CONSTRAINT "Share_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        -- Add index
        CREATE INDEX "Share_tenantId_idx" ON "Share"("tenantId");
    END IF;

END $$;


