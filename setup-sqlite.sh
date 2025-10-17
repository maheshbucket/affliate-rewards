#!/bin/bash

echo "🚀 Setting up Affiliate Rewards with SQLite (Local Development)..."
echo ""

# Backup original schema if it exists
if [ -f prisma/schema.prisma ]; then
    cp prisma/schema.prisma prisma/schema.prisma.backup
    echo "✅ Backed up original schema"
fi

# Update schema to use SQLite
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum UserRole {
  VISITOR
  USER
  MODERATOR
  ADMIN
}

enum DealStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}

enum AffiliateNetwork {
  AMAZON
  COMMISSION_JUNCTION
  RAKUTEN
  SHAREASALE
  IMPACT
  CUSTOM
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          UserRole  @default(USER)
  bio           String?
  points        Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  banned        Boolean   @default(false)

  accounts      Account[]
  sessions      Session[]
  deals         Deal[]
  votes         Vote[]
  comments      Comment[]
  pointHistory  PointHistory[]
  redemptions   Redemption[]
  preferences   UserPreference?
  activities    UserActivity[]
  shares        Share[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  icon        String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  deals Deal[]
}

model Deal {
  id              String          @id @default(cuid())
  title           String
  slug            String          @unique
  description     String
  originalPrice   Float
  dealPrice       Float
  savings         Float
  savingsPercent  Float
  affiliateUrl    String
  affiliateNetwork AffiliateNetwork
  imageUrl        String?
  videoUrl        String?
  status          DealStatus      @default(PENDING)
  expiresAt       DateTime?
  featured        Boolean         @default(false)
  featuredOrder   Int?
  
  metaTitle       String?
  metaDescription String?
  
  views           Int             @default(0)
  clicks          Int             @default(0)
  conversions     Int             @default(0)
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  approvedAt      DateTime?
  
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  categoryId      String
  category        Category        @relation(fields: [categoryId], references: [id])
  
  tags            Tag[]
  votes           Vote[]
  comments        Comment[]
  auditLogs       AuditLog[]
  shares          Share[]
  analytics       DealAnalytics[]
}

model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  deals     Deal[]
  createdAt DateTime @default(now())
}

model Vote {
  id        String   @id @default(cuid())
  value     Int
  createdAt DateTime @default(now())
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  dealId    String
  deal      Deal     @relation(fields: [dealId], references: [id], onDelete: Cascade)

  @@unique([userId, dealId])
}

model Comment {
  id        String    @id @default(cuid())
  content   String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  dealId    String
  deal      Deal      @relation(fields: [dealId], references: [id], onDelete: Cascade)
  
  parentId  String?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  replies   Comment[] @relation("CommentReplies")
}

model PointHistory {
  id          String   @id @default(cuid())
  points      Int
  reason      String
  description String?
  createdAt   DateTime @default(now())
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RewardTier {
  id          String   @id @default(cuid())
  name        String
  description String?
  pointsRequired Int
  benefits    String
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  redemptions Redemption[]
}

model Redemption {
  id          String      @id @default(cuid())
  pointsSpent Int
  status      String      @default("pending")
  createdAt   DateTime    @default(now())
  completedAt DateTime?
  
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  tierId      String
  tier        RewardTier  @relation(fields: [tierId], references: [id])
}

model UserPreference {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  emailNotifications    Boolean  @default(true)
  pushNotifications     Boolean  @default(true)
  dealApprovals         Boolean  @default(true)
  pointUpdates          Boolean  @default(true)
  
  favoriteCategories    String   @default("[]")
  preferredNetworks     String   @default("[]")
  showOnLeaderboard     Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model UserActivity {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  action      String
  targetType  String
  targetId    String?
  metadata    String?
  
  createdAt   DateTime @default(now())
}

model Share {
  id          String   @id @default(cuid())
  shortUrl    String   @unique
  originalUrl String
  platform    String
  
  utmSource   String?
  utmMedium   String?
  utmCampaign String?
  
  clicks      Int      @default(0)
  createdAt   DateTime @default(now())
  
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  dealId      String?
  deal        Deal?    @relation(fields: [dealId], references: [id])
}

model DealAnalytics {
  id          String   @id @default(cuid())
  dealId      String
  deal        Deal     @relation(fields: [dealId], references: [id], onDelete: Cascade)
  
  date        DateTime @default(now())
  views       Int      @default(0)
  clicks      Int      @default(0)
  conversions Int      @default(0)
  
  referralSource String?
  
  @@unique([dealId, date, referralSource])
}

model AuditLog {
  id          String   @id @default(cuid())
  action      String
  entity      String
  entityId    String
  changes     String
  performedBy String
  createdAt   DateTime @default(now())
  
  deal        Deal?    @relation(fields: [entityId], references: [id])
}

model SystemSettings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}
EOF

echo "✅ Schema updated for SQLite"
echo ""

# Create .env file for SQLite
cat > .env << 'EOF'
# SQLite Database (local file)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production"

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Affiliate Rewards Hub"

# Optional OAuth (leave empty for email/password only)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
EOF

echo "✅ Created .env file for SQLite"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Create database and run migrations
echo "📦 Creating database..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Start the app with: npm run dev"
echo "📱 Visit: http://localhost:3000"
echo ""
echo "👤 Default admin login:"
echo "   Email: admin@example.com"
echo "   Password: admin123456"
echo ""
echo "Note: SQLite database is stored in prisma/dev.db"
echo "To restore PostgreSQL schema: mv prisma/schema.prisma.backup prisma/schema.prisma"

