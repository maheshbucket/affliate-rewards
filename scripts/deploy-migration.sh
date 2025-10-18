#!/bin/bash
set -e

echo "🚀 Deploying Multi-Tenancy Migration to Production"
echo ""
echo "⚠️  IMPORTANT: Make sure you have your production DATABASE_URL set"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "To set it, run:"
    echo "  export DATABASE_URL='your-production-database-url'"
    echo ""
    echo "Or create a .env.production file with:"
    echo "  DATABASE_URL='your-production-database-url'"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""
echo "📋 Migration steps:"
echo "  1. Generate Prisma Client"
echo "  2. Deploy migration to database"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🔄 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🔄 Deploying migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "  1. Set DEFAULT_TENANT_SUBDOMAIN=default in Vercel"
echo "  2. Trigger a new deployment"
echo ""

