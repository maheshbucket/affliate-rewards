# 🚀 Production Migration Guide

## Current Issue
Your Vercel deployment is failing because the production database doesn't have the multi-tenancy schema yet.

**Error:**
```
The column `Deal.tenantId` does not exist in the current database.
```

## Quick Fix (Option 1: Using Vercel CLI)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Pull Environment Variables
```bash
vercel env pull .env.production
```

### Step 4: Run Migration
```bash
# Load production DATABASE_URL
export $(cat .env.production | xargs)

# Run migration
./scripts/deploy-migration.sh
```

### Step 5: Add Environment Variable in Vercel
Go to your Vercel dashboard → Settings → Environment Variables and add:
```
DEFAULT_TENANT_SUBDOMAIN=default
```

### Step 6: Trigger Redeploy
```bash
vercel --prod
```

---

## Manual Fix (Option 2: Direct Database Access)

### Step 1: Get Your Production Database URL
From Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Find `DATABASE_URL` and copy it

### Step 2: Run Migration Locally Against Production
```bash
# Set production database URL
export DATABASE_URL='your-production-database-url-here'

# Generate Prisma Client
npx prisma generate

# Deploy migration
npx prisma migrate deploy
```

### Step 3: Add Environment Variable
In Vercel dashboard, add:
```
DEFAULT_TENANT_SUBDOMAIN=default
```

### Step 4: Redeploy
Push any change to trigger a new deployment, or use Vercel dashboard to redeploy.

---

## What the Migration Does

1. **Creates `Tenant` table** with branding and configuration
2. **Adds `tenantId` column** to `User`, `Category`, `Deal`, and `Share` tables
3. **Creates a default tenant** named "Affiliate Rewards"
4. **Associates all existing data** with the default tenant
5. **Updates unique constraints** to be compound (e.g., `email_tenantId`, `slug_tenantId`)

---

## Verification

After migration, verify it worked:

```bash
# Check tenant table
psql $DATABASE_URL -c "SELECT * FROM \"Tenant\";"

# Check that data has tenantId
psql $DATABASE_URL -c "SELECT id, title, \"tenantId\" FROM \"Deal\" LIMIT 5;"
```

---

## Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
# This will undo the last migration
npx prisma migrate resolve --rolled-back 20251018000000_add_multi_tenancy
```

Then manually drop the Tenant table and remove tenantId columns:

```sql
-- Drop foreign keys
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_tenantId_fkey";
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_tenantId_fkey";
ALTER TABLE "Deal" DROP CONSTRAINT IF EXISTS "Deal_tenantId_fkey";
ALTER TABLE "Share" DROP CONSTRAINT IF EXISTS "Share_tenantId_fkey";

-- Remove tenantId columns
ALTER TABLE "User" DROP COLUMN IF EXISTS "tenantId";
ALTER TABLE "Category" DROP COLUMN IF EXISTS "tenantId";
ALTER TABLE "Deal" DROP COLUMN IF EXISTS "tenantId";
ALTER TABLE "Share" DROP COLUMN IF EXISTS "tenantId";

-- Drop Tenant table
DROP TABLE IF EXISTS "Tenant";
DROP TYPE IF EXISTS "TenantStatus";

-- Restore original unique constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Deal_slug_key" ON "Deal"("slug");
CREATE UNIQUE INDEX "Share_shortUrl_key" ON "Share"("shortUrl");
```

---

## Need Help?

If you run into issues:
1. Check that `DATABASE_URL` is correctly set
2. Verify you're connected to the production database
3. Check Vercel logs for detailed error messages
4. Ensure Node.js version is 22.x in `package.json`

---

## After Successful Migration

Once the migration succeeds:
1. ✅ Your app will be multi-tenant ready
2. ✅ Default tenant will be "Affiliate Rewards" (subdomain: "default")
3. ✅ All existing data will be associated with the default tenant
4. ✅ You can create new tenants via `/admin/tenants` or `npm run create-tenant`

🎉 **Ready to add more influencers with their own subdomains!**

