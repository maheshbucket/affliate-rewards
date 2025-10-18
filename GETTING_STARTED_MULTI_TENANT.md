# 🎉 Multi-Tenant Platform - Getting Started

Your platform has been successfully transformed into a **multi-tenant SaaS application**! Different influencers can now have their own branded sites with unique subdomains.

## 🌟 What Can You Do Now?

Each influencer/brand gets:
- 🎨 **Custom Branding**: Logo, colors, brand name
- 🌐 **Unique Subdomain**: `influencer1.yoursite.com`
- 🔒 **Isolated Data**: Their own users, deals, and categories
- 💎 **Optional Custom Domain**: `deals.influencer.com`

## 🚀 Quick Start (5 Steps)

### Step 1: Run Database Migration

```bash
# Generate Prisma client with new schema
npx prisma generate

# Run the migration
npx prisma migrate dev --name add_multi_tenancy
```

### Step 2: Migrate Existing Data (If Any)

If you have existing users/deals/categories:

```bash
npx tsx scripts/migrate-existing-data.ts
```

This will:
- Create a "default" tenant
- Show you SQL commands to associate existing data with this tenant

### Step 3: Create Your First Influencer Tenant

**Easy way** - Interactive CLI:
```bash
npx tsx scripts/create-tenant.ts
```

Just answer the prompts:
- Company Name: `Influencer Inc`
- Subdomain: `influencer1` (lowercase, no spaces)
- Brand Name: `Influencer Deals`
- Owner Email: `owner@influencer.com`
- Colors: (press Enter for defaults or choose custom)

**Alternative** - Via Admin UI:
1. Start your app: `npm run dev`
2. Sign in as an admin
3. Visit: `http://localhost:3000/admin/tenants`
4. Click "Create Tenant"

### Step 4: Set Up Local Development

To test subdomains locally, edit your hosts file:

**Mac/Linux:**
```bash
sudo nano /etc/hosts
```

**Windows:**
```
notepad C:\Windows\System32\drivers\etc\hosts
```

Add these lines:
```
127.0.0.1 default.localhost
127.0.0.1 influencer1.localhost
127.0.0.1 influencer2.localhost
```

### Step 5: Test Your Tenants

Start your app and visit:
- `http://default.localhost:3000` - Default tenant
- `http://influencer1.localhost:3000` - Influencer 1's branded site
- `http://influencer2.localhost:3000` - Influencer 2's branded site

## 🎨 Customizing Tenant Branding

### Via Admin UI

1. Go to `/admin/tenants`
2. Click the edit icon next to a tenant
3. Customize:
   - **Brand Name**: Displayed in header
   - **Logo**: URL to logo image (shown in header)
   - **Colors**: Primary, secondary, and accent colors
   - **Tagline**: Catchy phrase for your influencer
   - **Custom Domain**: Optional (e.g., `deals.influencer.com`)

### Via API

```bash
curl -X PATCH http://localhost:3000/api/tenants/TENANT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "Updated Brand Name",
    "primaryColor": "#ff6b6b",
    "logo": "https://example.com/logo.png"
  }'
```

## 👥 User Management

### How Users Work Now

- Users register on a specific tenant's subdomain
- Email addresses are **tenant-specific**
  - `john@example.com` on `influencer1` is different from `john@example.com` on `influencer2`
- Users can only log in on their tenant's subdomain
- Data is completely isolated between tenants

### Creating Users

Users register normally through `/auth/signup` on any subdomain:

```
http://influencer1.localhost:3000/auth/signup
```

They'll automatically be associated with that tenant.

## 📊 Managing Multiple Tenants

### Admin Dashboard

Visit `/admin/tenants` to:
- ✅ View all tenants and their stats
- ✅ Create new tenants
- ✅ Edit tenant settings
- ✅ View user/deal counts per tenant
- ✅ Activate/deactivate tenants
- ✅ Delete tenants

### Tenant Statistics

Each tenant shows:
- Number of users
- Number of deals
- Number of categories
- Status (Active/Inactive/Suspended)
- Creation date

## 🌐 Production Deployment

### DNS Configuration

#### For Subdomains

Add a **wildcard A record** to your DNS:

```
Type: A
Name: *
Value: YOUR_SERVER_IP
TTL: 3600
```

This allows any subdomain to work: `influencer1.yoursite.com`, `influencer2.yoursite.com`, etc.

#### For Custom Domains

If an influencer wants their own domain:

1. They add a CNAME record:
   ```
   Type: CNAME
   Name: deals (or @)
   Value: yoursite.com
   ```

2. Update their tenant with the custom domain:
   ```bash
   # Via admin UI at /admin/tenants
   # Or via API
   ```

### Environment Variables

Add to production `.env`:

```bash
# Your main domain
MAIN_DOMAIN=yoursite.com

# Optional: Default tenant for non-subdomain requests
DEFAULT_TENANT_SUBDOMAIN=default

# Existing environment variables remain the same
DATABASE_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yoursite.com
```

### SSL Certificates

Most modern hosting platforms (Vercel, Railway, Netlify, Heroku) automatically provision SSL certificates for subdomains and custom domains.

## 💻 Development Tips

### Testing Different Tenants

```bash
# Terminal 1 - Start your app
npm run dev

# Terminal 2 - Create tenants
npx tsx scripts/create-tenant.ts

# Visit in browser
open http://influencer1.localhost:3000
```

### Accessing Tenant Info in Code

```typescript
// In API routes
import { getCurrentTenant } from '@/lib/tenant'

export async function GET(request: Request) {
  const tenant = await getCurrentTenant()
  console.log(tenant.brandName) // "Influencer Deals"
  // ...
}

// In React components
import { useTenant } from '@/components/TenantProvider'

function MyComponent() {
  const { tenant, isLoading } = useTenant()
  return <h1>{tenant?.brandName}</h1>
}
```

### Debugging

If you see "No tenant found":
1. Check that the tenant exists: `npx prisma studio`
2. Verify the subdomain in your hosts file
3. Set `DEFAULT_TENANT_SUBDOMAIN=default` in `.env`
4. Restart your dev server

## 📚 Documentation

- **Full Setup Guide**: [`MULTI_TENANT_SETUP.md`](./MULTI_TENANT_SETUP.md)
- **Changes Summary**: [`MULTI_TENANT_CHANGES.md`](./MULTI_TENANT_CHANGES.md)
- **Database Schema**: [`prisma/schema.prisma`](./prisma/schema.prisma)

## 🎯 Example Use Cases

### Use Case 1: Multiple Influencers
- Create a tenant for each influencer
- Each gets their own subdomain and branding
- They manage their own deals and audience
- You get a commission on all sales

### Use Case 2: White-Label Solution
- Create tenants for different clients
- Each client gets their own branded site
- Charge per tenant or per feature
- Centralized management through super admin

### Use Case 3: Regional Sites
- Create tenants for different regions/countries
- Customize branding per region
- Different deals and categories per market
- Unified backend management

## 🆘 Common Issues

### Issue: Can't access subdomain locally
**Solution**: Add subdomain to `/etc/hosts` file (see Step 4)

### Issue: "No tenant found" error
**Solution**: 
- Set `DEFAULT_TENANT_SUBDOMAIN=default` in `.env`
- Or access via configured subdomain

### Issue: Existing users can't log in
**Solution**: Run the migration script to associate them with a tenant

### Issue: Changes not applying
**Solution**: 
- Restart your dev server
- Clear browser cache
- Check Prisma schema is up to date: `npx prisma generate`

## 🎓 Learning Resources

### Key Files to Understand

1. **`lib/tenant.ts`** - Tenant utility functions
2. **`middleware.ts`** - Subdomain detection
3. **`components/TenantProvider.tsx`** - React context for tenant
4. **`app/api/tenants/`** - Tenant management APIs

### How It Works

1. User visits `influencer1.yoursite.com`
2. Middleware detects subdomain → finds tenant in database
3. Sets tenant headers (`x-tenant-id`, etc.)
4. All API routes filter data by this tenant ID
5. Frontend fetches tenant info and applies branding
6. Everything is scoped to that tenant automatically

## 🚀 Next Steps

Now that you have multi-tenancy set up:

1. ✅ Test creating and accessing multiple tenants
2. ⬜ Customize branding for each tenant
3. ⬜ Set up DNS for production
4. ⬜ Configure SSL certificates
5. ⬜ Add more tenants
6. ⬜ Set up monitoring per tenant
7. ⬜ Implement tenant-specific analytics
8. ⬜ Add billing per tenant (if needed)

## 💡 Pro Tips

- **Test Locally First**: Use `.localhost` domains before going to production
- **Default Tenant**: Set up a default tenant for testing
- **Admin Access**: Only ADMIN role users can manage tenants
- **Backup Data**: Always backup before running migrations
- **Start Small**: Create 2-3 test tenants first

## 🎉 You're Ready!

Your platform is now a fully functional multi-tenant SaaS application. Each influencer can have their own branded experience, and you maintain centralized control.

Questions? Check the detailed docs:
- [`MULTI_TENANT_SETUP.md`](./MULTI_TENANT_SETUP.md) - Comprehensive setup guide
- [`MULTI_TENANT_CHANGES.md`](./MULTI_TENANT_CHANGES.md) - Technical changes

Happy building! 🚀

