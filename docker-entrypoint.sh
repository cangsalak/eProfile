#!/bin/sh
set -e

# Default DB Path
DB_DIR="/app/data"

# Check if persistent .env contains DATABASE_URL or other runtime config
if [ -f "/app/data/.env" ]; then
  set -a
  . /app/data/.env 2>/dev/null || true
  set +a
elif [ -f "/app/.env" ]; then
  set -a
  . /app/.env 2>/dev/null || true
  set +a
fi

# If DATABASE_URL is SQLite file, ensure directory exists and seed if fresh volume
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -q "^file:"; then
  TARGET_PATH=$(echo "$DATABASE_URL" | sed 's|^file:||')
  TARGET_DIR=$(dirname "$TARGET_PATH")
  mkdir -p "$TARGET_DIR" 2>/dev/null || true
  chmod -R 777 "$TARGET_DIR" 2>/dev/null || true
  
  # Always ensure SQLite schema tables are pushed if prisma CLI is available
  if [ -f "/app/node_modules/prisma/build/index.js" ]; then
    echo "📦 Ensuring SQLite tables exist in $TARGET_PATH..."
    node /app/node_modules/prisma/build/index.js db push --schema=/app/prisma/schema.prisma --accept-data-loss --skip-generate 2>/dev/null || true
  elif [ -f "/app/prisma/dev.template.db" ] && [ ! -f "$TARGET_PATH" ]; then
    echo "📦 Initializing SQLite database from pre-seeded template to $TARGET_PATH..."
    cp -f /app/prisma/dev.template.db "$TARGET_PATH" || true
  elif [ -f "/app/prisma/dev.db" ] && [ ! -f "$TARGET_PATH" ]; then
    echo "📦 Initializing SQLite database to $TARGET_PATH..."
    cp -f /app/prisma/dev.db "$TARGET_PATH" || true
  fi
  chmod 666 "$TARGET_PATH" 2>/dev/null || true
elif [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -qE "^(mysql|postgres|postgresql):"; then
  SAFE_URL=$(echo "$DATABASE_URL" | sed 's|://.*@|://***:***@|')
  echo "📡 Configured for external database: $SAFE_URL"
  if echo "$DATABASE_URL" | grep -q "^mysql:"; then
    node /app/node_modules/prisma/build/index.js db push --schema=/app/prisma/schema.mysql.prisma --accept-data-loss --skip-generate 2>/dev/null || true
  elif echo "$DATABASE_URL" | grep -qE "^postgres(ql)?:"; then
    node /app/node_modules/prisma/build/index.js db push --schema=/app/prisma/schema.postgresql.prisma --accept-data-loss --skip-generate 2>/dev/null || true
  fi
fi

# Ensure uploads directory exists and is writable
mkdir -p /app/public/uploads 2>/dev/null || true
chmod -R 777 /app/public/uploads 2>/dev/null || true

echo "🚀 Starting eProfile system on port ${PORT:-3000} (Hostname: ${HOSTNAME:-0.0.0.0})..."
exec "$@"
