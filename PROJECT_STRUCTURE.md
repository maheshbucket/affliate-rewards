# 📁 Project Structure

Complete directory structure of the Affiliate Rewards Web App.

```
rewards/
│
├── 📂 app/                                 # Next.js 14 App Router
│   ├── 📂 api/                            # Backend API Routes
│   │   ├── 📂 auth/                       # Authentication
│   │   │   ├── 📂 [...nextauth]/         
│   │   │   │   └── route.ts              # NextAuth handler
│   │   │   └── 📂 register/
│   │   │       └── route.ts              # User registration
│   │   │
│   │   ├── 📂 deals/                      # Deal management
│   │   │   ├── 📂 [slug]/
│   │   │   │   ├── 📂 click/
│   │   │   │   │   └── route.ts          # Track deal clicks
│   │   │   │   ├── 📂 vote/
│   │   │   │   │   └── route.ts          # Vote on deals
│   │   │   │   └── route.ts              # Get/update/delete deal
│   │   │   └── route.ts                   # List/create deals
│   │   │
│   │   ├── 📂 admin/                      # Admin operations
│   │   │   ├── 📂 analytics/
│   │   │   │   └── route.ts              # Platform analytics
│   │   │   └── 📂 deals/
│   │   │       └── 📂 approve/
│   │   │           └── route.ts          # Approve/reject deals
│   │   │
│   │   ├── 📂 categories/
│   │   │   └── route.ts                   # Category CRUD
│   │   ├── 📂 shares/
│   │   │   └── route.ts                   # URL shortening
│   │   ├── 📂 qrcode/
│   │   │   └── route.ts                   # QR code generation
│   │   ├── 📂 leaderboard/
│   │   │   └── route.ts                   # Points leaderboard
│   │   └── 📂 user/
│   │       └── 📂 points/
│   │           └── route.ts               # User points & history
│   │
│   ├── 📂 auth/                           # Authentication pages
│   │   ├── 📂 signin/
│   │   │   └── page.tsx                   # Sign in page
│   │   └── 📂 signup/
│   │       └── page.tsx                   # Registration page
│   │
│   ├── 📂 deals/                          # Deal pages
│   │   ├── 📂 [slug]/
│   │   │   └── page.tsx                   # Deal detail page
│   │   ├── 📂 submit/
│   │   │   └── page.tsx                   # Submit deal form
│   │   └── page.tsx                       # All deals listing
│   │
│   ├── 📂 category/                       # Category pages
│   │   └── 📂 [slug]/
│   │       └── page.tsx                   # Category deals page
│   │
│   ├── 📂 dashboard/                      # User dashboard
│   │   └── page.tsx                       # User dashboard
│   │
│   ├── 📂 admin/                          # Admin panel
│   │   └── page.tsx                       # Admin dashboard
│   │
│   ├── 📂 leaderboard/                    # Leaderboard
│   │   └── page.tsx                       # Points leaderboard
│   │
│   ├── 📂 s/                              # Short URL redirects
│   │   └── 📂 [code]/
│   │       └── route.ts                   # Redirect handler
│   │
│   ├── layout.tsx                         # Root layout with nav
│   ├── page.tsx                           # Homepage
│   ├── providers.tsx                      # Context providers
│   ├── globals.css                        # Global styles
│   ├── loading.tsx                        # Loading fallback
│   ├── error.tsx                          # Error boundary
│   ├── not-found.tsx                      # 404 page
│   ├── sitemap.ts                         # Dynamic sitemap
│   └── robots.ts                          # Robots.txt
│
├── 📂 components/                         # React Components
│   ├── DealCard.tsx                       # Deal display card
│   ├── ShareButton.tsx                    # Social share widget
│   ├── Header.tsx                         # Site header/nav
│   ├── Footer.tsx                         # Site footer
│   └── CategoryNav.tsx                    # Category navigation
│
├── 📂 lib/                                # Utility Libraries
│   ├── prisma.ts                          # Database client
│   ├── auth.ts                            # NextAuth config
│   ├── utils.ts                           # Helper functions
│   ├── points.ts                          # Points system
│   ├── shortener.ts                       # URL shortening
│   └── qrcode.ts                          # QR code generation
│
├── 📂 prisma/                             # Database
│   ├── schema.prisma                      # Database schema
│   └── seed.ts                            # Seed data script
│
├── 📂 types/                              # TypeScript types
│   └── next-auth.d.ts                     # NextAuth types
│
├── 📂 scripts/                            # Utility scripts
│   └── setup.sh                           # Setup automation
│
├── 📂 public/                             # Static assets
│   └── (images, icons, etc.)
│
├── 📄 Configuration Files
│   ├── package.json                       # Dependencies
│   ├── tsconfig.json                      # TypeScript config
│   ├── next.config.js                     # Next.js config
│   ├── tailwind.config.js                 # Tailwind config
│   ├── postcss.config.js                  # PostCSS config
│   ├── .eslintrc.json                     # ESLint rules
│   ├── .gitignore                         # Git ignore rules
│   ├── middleware.ts                      # Route protection
│   ├── Dockerfile                         # Docker image
│   ├── docker-compose.yml                 # Docker services
│   └── .dockerignore                      # Docker ignore
│
└── 📄 Documentation
    ├── README.md                          # Main documentation
    ├── QUICKSTART.md                      # 5-min setup guide
    ├── SETUP_GUIDE.md                     # Detailed setup
    ├── FEATURES.md                        # Feature list
    ├── PROJECT_SUMMARY.md                 # Project overview
    ├── PROJECT_STRUCTURE.md               # This file
    └── DEPLOYMENT_CHECKLIST.md            # Launch checklist
```

## Key Directory Explanations

### 📂 `/app`
Next.js 14 App Router structure. Each folder represents a route.
- **Server Components by default** for better performance
- **Client Components** marked with `'use client'`

### 📂 `/app/api`
Backend API routes following RESTful conventions:
- `GET` - Retrieve data
- `POST` - Create data
- `PATCH` - Update data
- `DELETE` - Remove data

### 📂 `/components`
Reusable React components:
- Self-contained
- TypeScript typed
- Tailwind styled
- Props documented

### 📂 `/lib`
Business logic and utilities:
- Database operations
- Authentication logic
- Helper functions
- Third-party integrations

### 📂 `/prisma`
Database management:
- Schema definition
- Migrations (auto-generated)
- Seed scripts
- Type generation

## File Naming Conventions

| Pattern | Purpose | Example |
|---------|---------|---------|
| `page.tsx` | Route page component | `/app/page.tsx` → `/` |
| `layout.tsx` | Route layout wrapper | `/app/layout.tsx` |
| `route.ts` | API endpoint | `/app/api/deals/route.ts` |
| `loading.tsx` | Loading state | `/app/loading.tsx` |
| `error.tsx` | Error boundary | `/app/error.tsx` |
| `not-found.tsx` | 404 handler | `/app/not-found.tsx` |
| `[param]` | Dynamic route | `/app/deals/[slug]/page.tsx` |
| `[...catch]` | Catch-all route | `/app/api/auth/[...nextauth]/route.ts` |

## Component Architecture

```
┌─────────────────────────────────────┐
│          Root Layout                │
│  (Header, Footer, Providers)        │
├─────────────────────────────────────┤
│     ┌────────────────────┐          │
│     │   Category Nav     │          │
│     └────────────────────┘          │
│     ┌────────────────────┐          │
│     │   Page Content     │          │
│     │                    │          │
│     │  ┌──────────────┐  │          │
│     │  │  DealCard    │  │          │
│     │  └──────────────┘  │          │
│     │  ┌──────────────┐  │          │
│     │  │ ShareButton  │  │          │
│     │  └──────────────┘  │          │
│     └────────────────────┘          │
└─────────────────────────────────────┘
```

## Data Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │─────▶│   API    │─────▶│ Database │
│ (React)  │      │ Routes   │      │(Postgres)│
└──────────┘      └──────────┘      └──────────┘
     │                  │                  │
     │                  ▼                  │
     │            ┌──────────┐            │
     └───────────▶│   Lib    │◀───────────┘
                  │(Business)│
                  │  Logic   │
                  └──────────┘
```

## API Route Structure

```
/api
├── /auth               - Authentication
│   ├── [...nextauth]   - NextAuth endpoints
│   └── /register       - User registration
│
├── /deals              - Deal operations
│   ├── GET  /          - List deals
│   ├── POST /          - Create deal
│   └── /[slug]         - Single deal
│       ├── GET         - Get deal
│       ├── PATCH       - Update deal
│       ├── DELETE      - Delete deal
│       ├── /vote       - Vote on deal
│       └── /click      - Track click
│
├── /admin              - Admin only
│   ├── /analytics      - Stats & metrics
│   └── /deals
│       └── /approve    - Moderate deals
│
├── /shares             - URL shortening
├── /qrcode             - QR generation
├── /categories         - Categories
├── /leaderboard        - Top users
└── /user
    └── /points         - User points
```

## Database Schema Overview

```
┌─────────┐     ┌─────────┐     ┌──────────┐
│  User   │────▶│  Deal   │◀────│ Category │
└─────────┘     └─────────┘     └──────────┘
     │               │
     │               ├─────▶ Vote
     │               ├─────▶ Comment
     │               └─────▶ Share
     │
     ├─────▶ PointHistory
     └─────▶ UserPreference
```

## State Management

- **Server State**: React Server Components
- **Client State**: React hooks (useState, useEffect)
- **Session State**: NextAuth (JWT)
- **Form State**: Controlled components
- **Cache**: SWR for client-side (optional)

## Styling System

- **Framework**: Tailwind CSS
- **Responsive**: Mobile-first
- **Components**: Utility classes
- **Customization**: `tailwind.config.js`
- **Global**: `globals.css`

## Security Layers

```
┌────────────────────────────────┐
│    Middleware (Route Guard)    │
├────────────────────────────────┤
│    NextAuth (Session)          │
├────────────────────────────────┤
│    API Validation (Zod)        │
├────────────────────────────────┤
│    Prisma (SQL Prevention)     │
├────────────────────────────────┤
│    bcrypt (Password Hash)      │
└────────────────────────────────┘
```

## Performance Optimizations

- ✅ Server-side rendering (SSR)
- ✅ Static generation (SSG) where possible
- ✅ Automatic code splitting
- ✅ Image optimization (next/image)
- ✅ Font optimization (next/font)
- ✅ Database query optimization
- ✅ Redis caching ready

## Deployment Structure

### Development
```
npm run dev → http://localhost:3000
```

### Production
```
npm run build → .next/ (optimized)
npm start     → Production server
```

### Docker
```
docker-compose up → Full stack
                    (app + db + redis)
```

---

This structure follows Next.js 14 best practices and is designed for:
- **Scalability**: Easy to add features
- **Maintainability**: Clear separation of concerns
- **Performance**: Optimized bundle and rendering
- **Developer Experience**: TypeScript + auto-complete

🎯 **Result**: Production-ready, enterprise-grade architecture

