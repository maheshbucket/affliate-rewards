#!/bin/bash

echo "🚀 Setting up Production Database..."
echo ""

# Check if DATABASE_URL is provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide your Neon database URL"
  echo ""
  echo "Usage: ./setup-production-db.sh 'postgresql://user:pass@host/db'"
  echo ""
  echo "Get your URL from: https://console.neon.tech"
  exit 1
fi

DATABASE_URL="$1"

echo "📦 Running database migrations..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

echo ""
echo "🌱 Seeding database with initial data..."
DATABASE_URL="$DATABASE_URL" npm run prisma:seed

echo ""
echo "✅ Production database setup complete!"
echo ""
echo "🎉 Your app is ready! Visit your Vercel URL to see it live!"
echo ""
echo "👤 Admin login:"
echo "   Email: admin@example.com"
echo "   Password: admin123456"
echo ""
echo "⚠️  IMPORTANT: Change the admin password after first login!"


