#!/bin/bash

echo "🗄️  Database Setup for Affiliate Rewards"
echo ""
echo "You need a PostgreSQL database. Here are your options:"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "OPTION 1: Free Cloud Database (RECOMMENDED - 1 minute)"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Get a FREE PostgreSQL database from Neon:"
echo "1. Visit: https://neon.tech"
echo "2. Click 'Sign Up' (free, no credit card needed)"
echo "3. Create a new project called 'affiliate-rewards'"
echo "4. Copy your connection string"
echo ""
echo "Your connection string looks like:"
echo "postgresql://user:password@ep-xxx.aws.neon.tech/neondb"
echo ""
read -p "Paste your database URL here: " DB_URL

if [ -z "$DB_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

# Create .env file
cat > .env << EOF
DATABASE_URL="$DB_URL"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Affiliate Rewards Hub"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
EOF

echo ""
echo "✅ .env file created!"
echo ""
echo "🔧 Setting up database..."

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy || npx prisma migrate dev --name init

# Seed database
npx prisma db seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🚀 Starting the app..."
npm run dev
EOF

chmod +x setup-database.sh

