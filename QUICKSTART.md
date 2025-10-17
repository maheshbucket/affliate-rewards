# 🚀 Quick Start Guide

Get your Affiliate Rewards platform running in 5 minutes!

## Instant Setup

### Option 1: Automated Setup (Recommended)

```bash
# Make setup script executable
chmod +x scripts/setup.sh

# Run setup
./scripts/setup.sh
```

The script will:
1. Copy `.env.example` to `.env`
2. Install dependencies
3. Set up the database
4. Seed initial data

### Option 2: Manual Setup

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Set up database
npx prisma migrate dev
npx prisma generate
npx prisma db seed

# 4. Start development server
npm run dev
```

## Quick Configuration

Edit `.env` file with minimal setup:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/affiliate_rewards"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Default Credentials

After seeding, you can login with:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123456`

⚠️ **Change this password immediately in production!**

## First Steps

1. **Visit** [http://localhost:3000](http://localhost:3000)
2. **Sign up** as a regular user or login as admin
3. **Submit your first deal** at `/deals/submit`
4. **Approve deals** in the admin panel at `/admin`
5. **Share deals** and generate short links

## Common Tasks

### Add a Category

Go to Admin Panel → Categories (or use Prisma Studio)

```bash
npx prisma studio
```

### View Database

```bash
npx prisma studio
```

### Reset Everything

```bash
npx prisma migrate reset
```

## Features to Try

### 🎯 For Users
- Browse deals on homepage
- Submit new deals with affiliate links
- Vote on deals (upvote/downvote)
- Share deals on social media
- Earn points for activities
- Check your rank on leaderboard

### 👨‍💼 For Admins
- Approve/reject pending deals
- View analytics dashboard
- Manage users and content
- Feature deals on homepage
- Generate promotion reports

### 🔗 For Promoters
- Generate short links for deals
- Create QR codes for offline campaigns
- Track UTM parameters
- Monitor share analytics
- Promote entire site or specific deals

## Troubleshooting

### Port 3000 already in use?

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database connection error?

1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in `.env`
3. Try: `pg_isready` to verify PostgreSQL status

### Module not found?

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Checklist

Before deploying:

- [ ] Change default admin password
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Configure OAuth providers (Google, Facebook)
- [ ] Set up production database
- [ ] Add email service (SendGrid)
- [ ] Enable Redis for caching
- [ ] Configure domain and SSL
- [ ] Set up monitoring

## Deploy in 1 Click

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/rewards)

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## What's Next?

- 📖 Read the full [README.md](README.md)
- 🛠️ Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed configuration
- 🏗️ Review the [Requirements Document](REQUIREMENTS.md)

## Need Help?

- 📚 Documentation: See README.md
- 🐛 Found a bug? Open an issue on GitHub
- 💬 Questions? Check the discussions

---

Built with ❤️ using Next.js, Prisma, and TypeScript

Happy deal hunting! 🎉

