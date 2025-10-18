# Multi-Tenant Setup Guide

This platform now supports multi-tenancy, allowing different influencers/brands to have their own branded experience with unique subdomains.

## Overview

Each tenant (influencer/brand) gets:
- **Unique subdomain** (e.g., `influencer1.yoursite.com`)
- **Custom branding** (logo, colors, name)
- **Isolated data** (users, deals, categories are tenant-specific)
- **Optional custom domain** (e.g., `deals.influencer.com`)

## Environment Variables

Add these to your `.env` file:

```bash
# Multi-Tenant Configuration

# Default tenant subdomain for development (optional)
# If set, requests without a subdomain will use this tenant
DEFAULT_TENANT_SUBDOMAIN=default

# Your main domain (for subdomain generation)
MAIN_DOMAIN=yoursite.com

# For local development, you can use localhost subdomains
# Add entries to /etc/hosts:
# 127.0.0.1 influencer1.localhost
# 127.0.0.1 influencer2.localhost
```

## Database Migration

After pulling the changes, run the migration:

```bash
# Generate Prisma client with new schema
npx prisma generate

# Run migration
npx prisma migrate dev --name add_multi_tenancy

# Or for production
npx prisma migrate deploy
```

## Creating Your First Tenant

### Option 1: Via Admin UI

1. Sign in as an admin user
2. Navigate to `/admin/tenants`
3. Click "Create Tenant"
4. Fill in the required information:
   - Company Name
   - Subdomain (lowercase, alphanumeric with hyphens)
   - Brand Name (display name)
   - Owner Email
   - Colors (primary, secondary, accent)
   - Optional: Logo URL, Favicon URL, Tagline

### Option 2: Via API

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Influencer Inc",
    "subdomain": "influencer1",
    "brandName": "Influencer Deals",
    "ownerEmail": "owner@influencer.com",
    "ownerName": "John Doe",
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af",
    "accentColor": "#10b981",
    "description": "Best deals curated by Influencer",
    "tagline": "Save big on your favorite products"
  }'
```

### Option 3: Via Database Seed

Create a seed script in `prisma/seed-tenants.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a default tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Default',
      subdomain: 'default',
      brandName: 'Affiliate Rewards',
      ownerEmail: 'admin@example.com',
      ownerName: 'Admin',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#10b981',
      status: 'ACTIVE',
    },
  })

  console.log('Created tenant:', tenant)

  // Create default categories for the tenant
  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: '📱', order: 1 },
    { name: 'Fashion', slug: 'fashion', icon: '👔', order: 2 },
    { name: 'Home & Garden', slug: 'home-garden', icon: '🏡', order: 3 },
  ]

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        ...cat,
        tenantId: tenant.id,
      },
    })
  }

  console.log('Created categories')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Run: `npx tsx prisma/seed-tenants.ts`

## Local Development with Subdomains

### Method 1: Using /etc/hosts (Mac/Linux)

1. Edit your hosts file:
```bash
sudo nano /etc/hosts
```

2. Add entries:
```
127.0.0.1 influencer1.localhost
127.0.0.1 influencer2.localhost
127.0.0.1 default.localhost
```

3. Access your app at:
   - `http://influencer1.localhost:3000`
   - `http://influencer2.localhost:3000`

### Method 2: Using a tunneling service

Use tools like ngrok or localtunnel for testing with real subdomains:

```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm run dev

# In another terminal, create tunnel
ngrok http 3000

# You'll get a URL like: https://abc123.ngrok.io
# Configure your tenant subdomains to use: influencer1.abc123.ngrok.io
```

## DNS Configuration for Production

### Subdomain Setup

Add a wildcard DNS record:

```
Type: A
Name: *
Value: YOUR_SERVER_IP
TTL: 3600
```

This allows any subdomain (influencer1, influencer2, etc.) to point to your server.

### Custom Domain Setup

If a tenant wants to use their own domain:

1. They add a CNAME record:
```
Type: CNAME
Name: deals (or @)
Value: yoursite.com
```

2. Update their tenant in admin:
   - Set `customDomain` to `deals.influencer.com`

3. Add SSL certificate for the custom domain (if using a service like Vercel/Railway, this is automatic)

## User Registration & Authentication

Users are now tenant-scoped:

1. When a user registers, they're automatically associated with the current tenant (based on subdomain)
2. Email addresses can be reused across tenants (john@example.com on tenant1 is different from john@example.com on tenant2)
3. Users can only log in on their tenant's subdomain

To log in:
```javascript
// The signIn will automatically include tenantId based on the current subdomain
signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
})
```

## API Routes and Data Isolation

All API routes automatically filter data by tenant:

- `/api/deals` - Only returns deals for the current tenant
- `/api/categories` - Only returns categories for the current tenant
- `/api/users` - Scoped to current tenant

The middleware detects the tenant from:
1. Subdomain (e.g., `influencer1.yoursite.com`)
2. Custom domain (if configured)
3. Fallback to `DEFAULT_TENANT_SUBDOMAIN` for development

## Frontend Branding

The frontend automatically applies tenant branding:

1. **Colors**: Applied as CSS variables
   - `--color-primary`
   - `--color-secondary`
   - `--color-accent`

2. **Logo**: Displayed in header
3. **Favicon**: Updated dynamically
4. **Brand Name**: Used throughout the UI

Access tenant information in components:

```typescript
import { useTenant } from '@/components/TenantProvider'

function MyComponent() {
  const { tenant, isLoading } = useTenant()
  
  return (
    <div>
      <h1>{tenant?.name}</h1>
      <p style={{ color: tenant?.colors.primary }}>
        {tenant?.tagline}
      </p>
    </div>
  )
}
```

## Tenant Management

### Admin Dashboard

Navigate to `/admin/tenants` to:
- View all tenants
- Create new tenants
- Edit tenant settings
- View tenant statistics (users, deals, categories)
- Suspend/activate tenants
- Delete tenants

### Tenant Limits

Configure limits per tenant:
- `maxUsers`: Maximum number of users (default: 1000)
- `maxDeals`: Maximum number of deals (default: 500)

These can be adjusted per tenant in the admin UI.

## Migration from Single-Tenant

If you have existing data:

1. Create a "default" tenant
2. Update existing records to associate with this tenant:

```sql
-- Get your default tenant ID
SELECT id FROM "Tenant" WHERE subdomain = 'default';

-- Update existing users
UPDATE "User" SET "tenantId" = 'YOUR_TENANT_ID';

-- Update existing categories
UPDATE "Category" SET "tenantId" = 'YOUR_TENANT_ID';

-- Update existing deals
UPDATE "Deal" SET "tenantId" = 'YOUR_TENANT_ID';

-- Update existing shares
UPDATE "Share" SET "tenantId" = 'YOUR_TENANT_ID';
```

## Troubleshooting

### "No tenant found" error

**Cause**: The middleware couldn't detect a tenant from the request.

**Solutions**:
1. Set `DEFAULT_TENANT_SUBDOMAIN` in `.env`
2. Ensure you're accessing via a configured subdomain
3. Check that the tenant exists in the database and is ACTIVE

### Can't log in after migration

**Cause**: Existing users don't have a `tenantId`.

**Solution**: Run the migration SQL above to associate users with a tenant.

### Subdomain not working locally

**Cause**: DNS resolution for localhost subdomains.

**Solutions**:
1. Add entries to `/etc/hosts` as shown above
2. Use a tunneling service like ngrok
3. Set `DEFAULT_TENANT_SUBDOMAIN` and access via `localhost:3000`

## Security Considerations

1. **Data Isolation**: All queries are automatically filtered by tenant - verify this in your custom queries
2. **Cross-Tenant Access**: Ensure admin users can't accidentally access another tenant's data
3. **Subdomain Validation**: Subdomains are validated to prevent injection attacks
4. **Rate Limiting**: Consider per-tenant rate limiting for API endpoints

## Next Steps

1. Create your first tenant
2. Configure DNS for your domain
3. Test user registration and login on different subdomains
4. Customize branding per tenant
5. Set up monitoring for tenant-specific metrics

