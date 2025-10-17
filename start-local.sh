#!/bin/bash

echo "🚀 Starting Affiliate Rewards App..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please create a .env file with at least:"
    echo "DATABASE_URL=\"your-database-url\""
    echo "NEXTAUTH_URL=\"http://localhost:3000\""
    echo "NEXTAUTH_SECRET=\"your-secret-key\""
    echo "NEXT_PUBLIC_SITE_URL=\"http://localhost:3000\""
    echo ""
    echo "See .env.example for a complete template"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Migrations failed. Trying to create database..."
    npx prisma migrate dev --name init
fi

echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🌱 Seeding database with initial data..."
npx prisma db seed

echo ""
echo "✨ Starting development server..."
echo "📱 App will be available at: http://localhost:3000"
echo ""
echo "Default admin login:"
echo "  Email: admin@example.com"
echo "  Password: admin123456"
echo ""

npm run dev

