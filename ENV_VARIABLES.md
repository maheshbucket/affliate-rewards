# Environment Variables

Copy this to your `.env` file and fill in the values.

## Required Variables

```bash
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/affiliate_rewards?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Multi-Tenant Configuration (REQUIRED)
DEFAULT_TENANT_SUBDOMAIN="default"
```

## Optional Variables

```bash
# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# Main domain (for production subdomain routing)
MAIN_DOMAIN="yoursite.com"

# Redis (for caching - optional)
REDIS_URL=""
```

## Production (Vercel)

When deploying to Vercel, make sure to set these in your project settings:

### Essential for Deployment
- `DATABASE_URL` - Your production PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL (https://yourdomain.com)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `DEFAULT_TENANT_SUBDOMAIN` - Set to "default"

### Optional
- OAuth provider credentials (if using social login)
- `MAIN_DOMAIN` - Your custom domain (if using subdomains)

## Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

## Local Development

For local development with subdomains, add to `/etc/hosts`:

```
127.0.0.1 default.localhost
127.0.0.1 influencer1.localhost
127.0.0.1 influencer2.localhost
```

Then access:
- http://localhost:3000 (uses default tenant)
- http://default.localhost:3000
- http://influencer1.localhost:3000

