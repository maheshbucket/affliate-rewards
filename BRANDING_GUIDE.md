# 🎨 Branding Guide - Deals Platform

## Overview

The platform uses a **"SubdomainDeals"** naming format that automatically transforms subdomains into branded names.

## Naming Format

### How It Works

- **Subdomain:** `pm` → **Display Name:** `PM Deals`
- **Subdomain:** `tech` → **Display Name:** `Tech Deals`
- **Subdomain:** `fashion` → **Display Name:** `Fashion Deals`
- **Subdomain:** `default` → **Display Name:** `Deals`

### Multi-Word Subdomains

For multi-word subdomains (using hyphens):
- **Subdomain:** `tech-guru` → **Display Name:** `Tech Guru Deals`
- **Subdomain:** `best-beauty` → **Display Name:** `Best Beauty Deals`
- **Subdomain:** `pm-tech` → **Display Name:** `PM Tech Deals`

## Creating a New Branded Instance

### For Influencers/Partners

When creating a new tenant for an influencer, follow this format:

1. **Choose a subdomain** (their brand name, initials, or niche)
   - Example: `pm`, `techguru`, `fashionista`, etc.

2. **Set the display name automatically**
   - The system automatically formats it as "{Subdomain} Deals"
   - Each word is capitalized
   - Hyphens become spaces

3. **Customize further** (optional)
   - Logo
   - Brand colors
   - Custom tagline
   - Custom domain

### Examples

#### Example 1: PM (Product Manager) Deals
```javascript
{
  subdomain: 'pm',
  // Automatically displays as: "PM Deals"
  logo: '/logos/pm.png',
  primaryColor: '#3b82f6',
  tagline: 'Best product management tools & resources'
}
```

#### Example 2: Tech Guru Deals
```javascript
{
  subdomain: 'tech-guru',
  // Automatically displays as: "Tech Guru Deals"
  logo: '/logos/techguru.png',
  primaryColor: '#10b981',
  tagline: 'Curated tech deals for professionals'
}
```

#### Example 3: Fashion Deals
```javascript
{
  subdomain: 'fashion',
  // Automatically displays as: "Fashion Deals"
  logo: '/logos/fashion.png',
  primaryColor: '#ec4899',
  tagline: 'Latest fashion trends at unbeatable prices'
}
```

## Where Branding Appears

The branded name (`{Subdomain} Deals`) automatically appears in:

✅ **Header** - Logo and site name  
✅ **Footer** - Copyright and branding  
✅ **Page Titles** - Browser tabs and SEO  
✅ **Meta Tags** - Social sharing  
✅ **Email Templates** - Notifications  
✅ **API Responses** - Tenant information  

## Creating a New Tenant via Admin Panel

1. Go to `/admin/tenants`
2. Click "Create New Tenant"
3. Enter:
   - **Subdomain**: `pm` (lowercase, no spaces)
   - **Name**: Can be anything (system will format display name)
   - **Brand Name**: Can be anything (system will format display name)
   - **Owner Email**: Contact email
   - **Logo** (optional): URL to logo image
   - **Colors** (optional): Primary, secondary, accent
   - **Tagline** (optional): Custom tagline

4. Save and the tenant is live at: `pm.yourdomain.com`

## Creating a New Tenant via Script

```bash
npm run create-tenant

# Follow the prompts:
# Subdomain: pm
# Name: PM Deals (auto-formatted)
# Owner Email: pm@example.com
# Brand Name: PM Deals (auto-formatted)
```

## Custom Domain Setup (Optional)

Instead of `pm.yourdomain.com`, you can use:
- `pmdeals.com`
- `deals.pm.com`
- Any custom domain

1. Add custom domain in tenant settings
2. Configure DNS CNAME to point to your Vercel deployment
3. Add domain in Vercel project settings

## Brand Consistency

The platform maintains consistency across all tenants:

| Element | Default | Per-Tenant Override |
|---------|---------|-------------------|
| **Naming Format** | "{Subdomain} Deals" | ❌ Auto-generated |
| **Logo** | Trophy icon | ✅ Custom logo URL |
| **Colors** | Blue theme | ✅ Custom colors |
| **Tagline** | "Best deals..." | ✅ Custom tagline |
| **Description** | Generic | ✅ Custom description |

## SEO & Metadata

Each tenant gets automatic SEO optimization:

```typescript
{
  title: "PM Deals - Best Curated Deals",
  description: "Find the best PM deals...",
  ogTitle: "PM Deals",
  ogDescription: "Curated deals for product managers",
  siteName: "PM Deals"
}
```

## Testing Locally

To test different subdomains locally:

1. Edit your `/etc/hosts`:
   ```
   127.0.0.1 pm.localhost
   127.0.0.1 tech.localhost
   127.0.0.1 fashion.localhost
   ```

2. Visit:
   - `http://pm.localhost:3000` → See "PM Deals"
   - `http://tech.localhost:3000` → See "Tech Deals"
   - `http://localhost:3000` → See "Deals" (default)

## Tips

✅ **DO:**
- Use short, memorable subdomains
- Use lowercase only
- Use hyphens for multi-word names
- Keep subdomains under 20 characters

❌ **DON'T:**
- Use special characters (except hyphens)
- Use spaces or underscores
- Use numbers as the first character
- Use profanity or offensive terms

## Questions?

- Check `/admin/tenants` to see all active tenants
- Use `npm run create-tenant` for guided setup
- See `MULTI_TENANT_SETUP.md` for technical details

