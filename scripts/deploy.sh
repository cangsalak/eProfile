#!/usr/bin/env bash
set -Eeuo pipefail

# ==============================================================================
# eProfile Automated Deployment Script
# Usage:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

echo "=================================================="
echo "🚀 Starting eProfile deployment..."
echo "📍 Working Directory: ${PROJECT_ROOT}"
echo "⏰ Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=================================================="

# 1. Pull latest code
echo "📥 1/6: Pulling latest changes from Git..."
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "   Current branch: ${CURRENT_BRANCH}"
git fetch origin "${CURRENT_BRANCH}"
git pull --rebase origin "${CURRENT_BRANCH}"

# 2. Install dependencies if changed
echo "📦 2/6: Installing/Verifying dependencies..."
if [ -f package-lock.json ]; then
  npm ci --prefer-offline --no-audit || npm install --prefer-offline --no-audit
else
  npm install --prefer-offline --no-audit
fi

# 3. Synchronize Modular System Registries
echo "🧩 3/6: Syncing modules (registry & views)..."
npm run module:sync

# 4. Database Schema Merge & Safe Push / Generate
echo "🗄️  4/6: Merging database schema & generating Prisma clients..."
# Merges multi-module schema & generates SQLite / MySQL / Postgres schemas
npm run db:generate

# Safe push: Update database schema without dropping tables / data loss
echo "   Applying database schema changes (Safe Push)..."
npx prisma db push

# 5. Build Next.js Application
echo "🏗️  5/6: Building Next.js production bundle..."
npm run build

# 6. Reload PM2 service gracefully
echo "🔄 6/6: Reloading PM2 process..."
if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe eprofile >/dev/null 2>&1; then
    echo "   Reloading running eprofile instance..."
    pm2 reload ecosystem.config.js --update-env || pm2 restart ecosystem.config.js --update-env
  else
    echo "   Starting eprofile instance for the first time..."
    pm2 start ecosystem.config.js
  fi
  pm2 save
else
  echo "⚠️ PM2 not found in PATH. Please restart your Node.js process manually."
fi

echo "=================================================="
echo "✅ Deployment completed successfully!"
echo "⏰ Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=================================================="
