# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Step 1: Get Free Database (2 minutes)

1. Go to **https://neon.tech**
2. Click **"Sign Up"** (free, no credit card)
3. Click **"Create Project"**
4. Name: `affiliate-rewards`
5. **Copy the connection string** (looks like):
   ```
   postgresql://user:pass@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb
   ```

### Step 2: Push to GitHub (1 minute)

```bash
cd /Users/mpathipati/Workspace/rewards

# Initialize git (if not already done)
git init
git add .
git commit -m "Deploy affiliate rewards app"

# Create a new repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/affiliate-rewards.git
git push -u origin main
```

### Step 3: Deploy to Vercel (2 minutes)

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Connect your GitHub account
4. Select **`affiliate-rewards`** repo
5. Configure environment variables:

```env
DATABASE_URL=postgresql://your-neon-connection-string-here
NEXTAUTH_SECRET=run-this-command-to-generate: openssl rand -base64 32
NEXTAUTH_URL=https://your-app.vercel.app (will update after deploy)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

6. Click **"Deploy"**
7. Wait 2-3 minutes ⏳
8. **Copy your live URL** (e.g., `https://affiliate-rewards-xyz.vercel.app`)
9. Go back to **Settings** → **Environment Variables**
10. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` with your actual URL
11. **Redeploy** from the Deployments tab

### Step 4: Set Up Database (1 minute)

Your app is live but needs database tables!

**Option A: Via Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

**Option B: Via GitHub Action** (automatic)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Database
on:
  push:
    branches: [main]
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx prisma migrate deploy
      - run: npx prisma db seed
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

Add `DATABASE_URL` to GitHub Secrets.

**Option C: Manual** (easiest for now)

Run this locally with your production database URL:
```bash
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
DATABASE_URL="your-production-db-url" npx prisma db seed
```

### ✅ Done! Your App is Live!

Visit your URL and login:
- Email: `admin@example.com`
- Password: `admin123456`

---

## Alternative: Deploy to Railway

### One-Click Deploy

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub"**
4. Select your repo
5. Click **"Add PostgreSQL"**
6. Railway auto-configures everything!
7. Your app will be live at `your-app.up.railway.app`

Railway automatically:
- ✅ Creates database
- ✅ Runs migrations
- ✅ Seeds data
- ✅ Sets environment variables

---

## Alternative: Deploy to Render

1. Go to **https://render.com**
2. Click **"New +"** → **"Blueprint"**
3. Connect GitHub
4. Select your repo
5. Render uses `render.yaml` (already configured!)
6. Click **"Apply"**
7. Your app will be live at `your-app.onrender.com`

**Note:** Free tier has ~30s cold start on first request.

---

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., `deals.yoursite.com`)
3. Add DNS records as shown
4. SSL auto-configured!

### Railway
1. Go to Settings → Domains
2. Add custom domain
3. Point CNAME to Railway

### Render
1. Go to Settings → Custom Domain
2. Add domain
3. Update DNS

---

## Post-Deployment Checklist

- [ ] Change admin password
- [ ] Update `NEXTAUTH_SECRET` to a secure value
- [ ] Configure OAuth (Google/Facebook) if needed
- [ ] Set up custom domain
- [ ] Configure email service (SendGrid)
- [ ] Set up Bitly for URL shortening
- [ ] Add Google Analytics
- [ ] Submit sitemap to Google Search Console
- [ ] Test all features
- [ ] Add your actual affiliate links

---

## Monitoring

### Vercel
- Built-in analytics at: **https://vercel.com/your-project/analytics**
- Real User Monitoring included
- Function logs available

### Railway
- Metrics at project dashboard
- View logs in real-time
- Set up usage alerts

### Render
- Metrics and logs in dashboard
- Email alerts for errors
- Health checks available

---

## Updating Your App

All platforms support auto-deploy from GitHub:

```bash
git add .
git commit -m "Update feature"
git push
```

Your app redeploys automatically! 🎉

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for status
- Ensure IP allowlist includes 0.0.0.0/0

### Build Failures
```bash
# Test build locally first
npm run build
```

### Migration Issues
```bash
# Reset and re-run migrations
npx prisma migrate reset
npx prisma migrate deploy
npx prisma db seed
```

### Environment Variables Not Working
- Redeploy after changing env vars
- Check spelling and format
- Ensure no trailing spaces

---

## Free Tier Limits

### Vercel
- ✅ 100 GB bandwidth/month
- ✅ Unlimited projects
- ✅ Unlimited builds
- ✅ Global CDN

### Railway (with trial)
- ✅ $5 credit/month
- ✅ ~500 hours runtime
- ✅ 1GB database

### Render
- ✅ 750 hours/month
- ✅ 100GB bandwidth
- ✅ Database expires after 90 days (renewable)

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs

---

## Scaling Later

When you're ready to upgrade:
- **Vercel Pro**: $20/month (1TB bandwidth, analytics)
- **Railway Hobby**: $5/month
- **Render**: $7-19/month

All platforms scale automatically! 🚀

