#!/bin/bash
# Production Database Migration Script

echo "🚀 Deploying migrations to production database..."
echo ""
echo "⚠️  WARNING: This will run migrations on your PRODUCTION database!"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted"
    exit 1
fi

# Pull production environment variables from Vercel
echo "📥 Pulling production environment variables..."
npx vercel env pull .env.production

# Run migrations
echo "🔄 Running database migrations..."
NODE_ENV=production npm run db:migrate

echo ""
echo "✅ Migrations complete!"
echo ""
echo "Next steps:"
echo "1. Verify with: npm run db:health"
echo "2. Deploy to Vercel: git push or npx vercel --prod"
