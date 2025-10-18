-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED');

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");

-- CreateIndex
CREATE INDEX "Tenant_subdomain_idx" ON "Tenant"("subdomain");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- AlterTable
ALTER TABLE "User" ADD COLUMN "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Share" ADD COLUMN "tenantId" TEXT;

-- Insert default tenant
INSERT INTO "Tenant" ("id", "name", "subdomain", "brandName", "ownerEmail", "updatedAt")
VALUES ('default-tenant-id', 'Affiliate Rewards', 'default', 'Affiliate Rewards', 'admin@example.com', NOW());

-- Associate existing data with default tenant
UPDATE "User" SET "tenantId" = 'default-tenant-id' WHERE "tenantId" IS NULL;
UPDATE "Category" SET "tenantId" = 'default-tenant-id' WHERE "tenantId" IS NULL;
UPDATE "Deal" SET "tenantId" = 'default-tenant-id' WHERE "tenantId" IS NULL;
UPDATE "Share" SET "tenantId" = 'default-tenant-id' WHERE "tenantId" IS NULL;

-- Make tenantId required
ALTER TABLE "User" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Category" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Deal" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Share" ALTER COLUMN "tenantId" SET NOT NULL;

-- Drop old unique constraints
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_email_key";
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_slug_key";
ALTER TABLE "Deal" DROP CONSTRAINT IF EXISTS "Deal_slug_key";
ALTER TABLE "Share" DROP CONSTRAINT IF EXISTS "Share_shortUrl_key";

-- Create compound unique constraints
CREATE UNIQUE INDEX "User_email_tenantId_key" ON "User"("email", "tenantId");
CREATE UNIQUE INDEX "Category_slug_tenantId_key" ON "Category"("slug", "tenantId");
CREATE UNIQUE INDEX "Deal_slug_tenantId_key" ON "Deal"("slug", "tenantId");
CREATE UNIQUE INDEX "Share_shortUrl_tenantId_key" ON "Share"("shortUrl", "tenantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

