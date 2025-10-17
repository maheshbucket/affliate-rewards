# Affiliate Rewards App - Setup Guide

Complete guide to get your Affiliate Rewards platform up and running.

## Prerequisites

Before you begin, ensure you have:

- Node.js 18 or higher installed
- PostgreSQL database (local or cloud)
- Redis (optional, for caching)
- Git installed

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd rewards

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/affiliate_rewards?schema=public"

# NextAuth - Generate a secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Facebook OAuth (optional)
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Affiliate Rewards Hub"
```

### 3. Set Up the Database

Run database migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Seed the database with initial data:

```bash
npx prisma db seed
```

This creates:
- Admin user: `admin@example.com` / `admin123456`
- Default categories (Electronics, Fashion, etc.)
- System settings

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## OAuth Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `http://localhost:3000/api/auth/callback/facebook`
5. Copy App ID and Secret to `.env`

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker

Build and run with Docker:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Redis cache
- Next.js application

## Database Management

### View data with Prisma Studio

```bash
npx prisma studio
```

### Create a migration

```bash
npx prisma migrate dev --name your_migration_name
```

### Reset database (⚠️ Development only)

```bash
npx prisma migrate reset
```

## Testing

### Test the application

1. Sign up as a new user at `/auth/signup`
2. Submit a deal at `/deals/submit`
3. Login as admin: `admin@example.com` / `admin123456`
4. Approve deals at `/admin`
5. Check leaderboard at `/leaderboard`

## Common Issues

### Database Connection Error

- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate
```

## Next Steps

1. **Customize branding**: Update colors in `tailwind.config.js`
2. **Add categories**: Create categories relevant to your niche
3. **Configure affiliate networks**: Add your affiliate IDs
4. **Set up email**: Configure SendGrid for notifications
5. **Add analytics**: Install Google Analytics
6. **Enable caching**: Set up Redis for better performance

## Support

- Documentation: Check README.md
- Issues: Open a GitHub issue
- Community: Join our Discord (link TBD)

## Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Review security headers
- [ ] Enable database backups
- [ ] Set up monitoring (Sentry, etc.)

## Performance Optimization

- Enable Redis caching
- Configure CDN for images
- Set up database connection pooling
- Enable Next.js image optimization
- Implement lazy loading

Happy building! 🚀

