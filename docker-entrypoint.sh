#!/bin/sh
set -e

# Default DB Path
DB_DIR="/app/data"

# If DATABASE_URL is SQLite file, ensure directory exists and seed if fresh volume
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -q "^file:"; then
  TARGET_PATH=$(echo "$DATABASE_URL" | sed 's|^file:||')
  TARGET_DIR=$(dirname "$TARGET_PATH")
  mkdir -p "$TARGET_DIR" 2>/dev/null || true
  
  # If DB file does not exist yet in the mounted volume, populate from template
  if [ ! -f "$TARGET_PATH" ]; then
    if [ -f "/app/prisma/dev.template.db" ]; then
      echo "📦 Initializing SQLite database from pre-seeded template to $TARGET_PATH..."
      cp /app/prisma/dev.template.db "$TARGET_PATH"
    elif [ -f "/app/prisma/dev.db" ]; then
      echo "📦 Initializing SQLite database to $TARGET_PATH..."
      cp /app/prisma/dev.db "$TARGET_PATH"
    fi
  fi
fi

# Ensure uploads directory exists
mkdir -p /app/public/uploads 2>/dev/null || true

echo "🚀 Starting eProfile system on port ${PORT:-3000} (Hostname: ${HOSTNAME:-0.0.0.0})..."
exec "$@"
