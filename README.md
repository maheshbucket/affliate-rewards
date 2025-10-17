# Affiliate Rewards Web App

A comprehensive affiliate marketing platform for curating and showcasing the best deals, built with Next.js 14, TypeScript, and Prisma.

## Features

### Core Functionality
- **User Authentication**: Email/password and social login (Google, Facebook)
- **Deal Management**: Submit, browse, and manage affiliate deals
- **Rewards System**: Earn points for submissions, votes, shares, and conversions
- **Search & Discovery**: Advanced filtering, sorting, and personalized recommendations
- **Social Sharing**: Built-in short link generation with UTM tracking
- **Admin Dashboard**: Comprehensive analytics and moderation tools

### Promotion Features
- **Short URL Generator**: Create trackable links for campaigns
- **QR Code Generator**: Generate QR codes for any deal or the homepage
- **UTM Parameter Tracking**: Track traffic sources and conversions
- **Homepage Curation**: Feature your best deals prominently
- **Share Analytics**: Monitor performance across social platforms

### User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Real-time Updates**: Instant feedback on votes and submissions
- **Leaderboard**: Gamification with top contributors ranking
- **Points System**: Earn rewards for engagement

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Caching**: Redis (optional)
- **Deployment**: Vercel recommended

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis (optional, for caching)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rewards
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- Database URL
- NextAuth secret and providers
- API keys for affiliate networks
- Email service credentials
- URL shortener API key

4. Initialize the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Seed the database with categories (optional):
```bash
npx prisma db seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Schema

The app uses Prisma with PostgreSQL. Key models include:

- **User**: Authentication and profile management
- **Deal**: Product deals with affiliate links
- **Vote**: User voting on deals
- **Comment**: Threaded comments on deals
- **PointHistory**: Track user point earnings
- **Share**: Short URL tracking for shares
- **Category**: Organize deals by category
- **Tag**: Tag deals for better discovery

## API Routes

### Public Routes
- `GET /api/deals` - List deals with filters
- `GET /api/deals/[slug]` - Get deal details
- `GET /api/categories` - List categories
- `GET /api/leaderboard` - Get points leaderboard

### Protected Routes
- `POST /api/deals` - Submit a new deal
- `POST /api/deals/[slug]/vote` - Vote on a deal
- `POST /api/shares` - Create short URL
- `GET /api/user/points` - Get user points

### Admin Routes
- `GET /api/admin/analytics` - Platform analytics
- `POST /api/admin/deals/approve` - Approve/reject deals

## Points System

Users earn points for various actions:
- **+10 points**: Approved deal submission
- **+1 point**: Vote on a deal
- **+5 points**: Share a deal
- **+20 points**: Generate a conversion
- **+2 points**: Comment on a deal

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t affiliate-rewards .
docker run -p 3000:3000 affiliate-rewards
```

## Environment Variables

Required environment variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

See `.env.example` for the complete list.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered deal recommendations
- [ ] Multi-language support
- [ ] Cryptocurrency rewards
- [ ] Browser extension for deal discovery

## Acknowledgments

Built with modern web technologies and best practices for affiliate marketing optimization.

