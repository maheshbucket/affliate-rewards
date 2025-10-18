# Vercel Deployment Guide - Multi-Tenant Setup

## 🚀 Quick Deploy to Vercel

This guide will help you deploy the multi-tenant platform to Vercel.

## Prerequisites

- Vercel account connected to your GitHub repository
- PostgreSQL database (Vercel Postgres, Supabase, Railway, or Neon)

## Step 1: Database Setup

### Option A: Use Vercel Postgres

1. In your Vercel project dashboard, go to **Storage**
2. Create a new **Postgres** database
3. Vercel will automatically add `DATABASE_URL` to your environment variables

### Option B: Use External Database

Add your database connection string as `DATABASE_URL` in Vercel environment variables.

## Step 2: Required Environment Variables

In your Vercel project settings, add these environment variables:

### Essential Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Multi-Tenant (NEW - REQUIRED)
DEFAULT_TENANT_SUBDOMAIN=default

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 3: Database Migration

**IMPORTANT**: Before your first deployment or after pulling multi-tenant changes, you need to run the migration.

### For New Database

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### For Existing Database with Data

If you already have users/deals/categories in production:

```bash
# Run the multi-tenant migration script
npx tsx scripts/migrate-to-multitenant.ts
```

This will:
- Create the Tenant table
- Create a "default" tenant
- Migrate all existing data to the default tenant
- Update all constraints and indexes

## Step 4: Configure Vercel Build Settings

In your `vercel.json` or project settings:

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

Or add to `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && next build"
  }
}
```

## Step 5: Subdomain Configuration

### For Development/Testing

Use Vercel's preview deployments:
- `main-branch.vercel.app` → Default tenant
- Access via `localhost` for development

### For Production with Subdomains

1. **Add Custom Domain** to your Vercel project
2. **Configure DNS** with wildcard A record:
   ```
   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   ```
3. **Add Domains in Vercel**:
   - `yourdomain.com` → Main site
   - `*.yourdomain.com` → Wildcard for all subdomains
   - `influencer1.yourdomain.com` → Specific tenant

4. Vercel automatically handles SSL certificates for subdomains

## Step 6: Deploy

```bash
# Push to git (triggers auto-deployment)
git add .
git commit -m "Add multi-tenant support"
git push origin main
```

Vercel will automatically:
1. Install dependencies
2. Generate Prisma client
3. Build the Next.js app
4. Deploy to production

## Step 7: Post-Deployment Setup

### 1. Run Migration (First Time Only)

Connect to your database and run:

```bash
# If you have existing data
npx tsx scripts/migrate-to-multitenant.ts

# Verify the default tenant was created
npx prisma studio
```

### 2. Create Your First Tenant

Option A - Via Script:
```bash
npx tsx scripts/create-tenant.ts
```

Option B - Via Admin UI:
1. Visit `https://your-domain.vercel.app/admin/tenants`
2. Sign in as admin
3. Create new tenants

## DNS Configuration Examples

### Vercel with Custom Domain

```
# Main domain
yourdomain.com          → CNAME → cname.vercel-dns.com

# Wildcard for all subdomains
*.yourdomain.com        → CNAME → cname.vercel-dns.com
```

### Testing Subdomains

After deploying:
- `https://yourdomain.com` → Uses default tenant
- `https://influencer1.yourdomain.com` → Influencer 1's branded site
- `https://influencer2.yourdomain.com` → Influencer 2's branded site

## Troubleshooting

### Issue: "No tenant found" error

**Solution**: Make sure `DEFAULT_TENANT_SUBDOMAIN=default` is set in Vercel environment variables.

### Issue: Database connection errors

**Solution**: 
1. Check `DATABASE_URL` is correct
2. Ensure `?sslmode=require` is in the connection string
3. Verify database is accessible from Vercel's IP ranges

### Issue: Prisma client errors

**Solution**: Ensure build command includes `prisma generate`:
```bash
"build": "prisma generate && next build"
```

### Issue: Migration not applied

**Solution**: Run migrations manually via Vercel CLI:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

Or connect to your database directly and run the migration script.

## Environment Variables Checklist

Before deploying, ensure these are set in Vercel:

- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `DEFAULT_TENANT_SUBDOMAIN` (NEW - set to "default")
- ✅ OAuth credentials (if using Google/Facebook login)

## Monitoring

After deployment:

1. **Check Logs**: Vercel Dashboard → Deployments → Logs
2. **Test Endpoints**:
   - `https://your-domain.vercel.app/api/tenants/current`
   - `https://your-domain.vercel.app/api/deals`
3. **Verify Tenant**: Sign in and check that branding works

## Production Checklist

Before going live:

- [ ] Database migrated successfully
- [ ] Default tenant created
- [ ] Environment variables configured
- [ ] DNS configured (if using custom domains)
- [ ] SSL certificates active (automatic on Vercel)
- [ ] Test tenant creation via admin UI
- [ ] Test subdomain routing
- [ ] Verify data isolation between tenants
- [ ] Set up monitoring/alerts

## Scaling Considerations

- **Database**: Use connection pooling (Vercel Postgres includes this)
- **Caching**: Consider adding Redis for tenant lookups
- **CDN**: Vercel's Edge Network handles this automatically
- **Monitoring**: Set up Vercel Analytics or custom monitoring

## Support

For issues specific to:
- **Multi-tenancy**: See `MULTI_TENANT_SETUP.md`
- **Development**: See `GETTING_STARTED_MULTI_TENANT.md`
- **Changes**: See `MULTI_TENANT_CHANGES.md`

## Quick Commands

```bash
# Connect to production database
vercel env pull .env.production
npx prisma studio

# Run migrations
npx prisma migrate deploy

# Create new tenant
npx tsx scripts/create-tenant.ts

# Check deployment logs
vercel logs
```

---

**Note**: The first deployment after adding multi-tenancy may take longer due to database migrations. Subsequent deployments will be faster.

