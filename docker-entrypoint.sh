#!/bin/sh
set -e

# Default DB Path
DB_DIR="/app/data"

# If DATABASE_URL is SQLite file, ensure directory exists and seed if fresh volume
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -q "^file:"; then
  TARGET_PATH=$(echo "$DATABASE_URL" | sed 's|^file:||')
  TARGET_DIR=$(dirname "$TARGET_PATH")
  mkdir -p "$TARGET_DIR" 2>/dev/null || true
  chmod -R 777 "$TARGET_DIR" 2>/dev/null || true
  
  # If DB file does not exist yet or is empty/corrupted (< 10KB), populate from template
  FILE_SIZE=$(wc -c < "$TARGET_PATH" 2>/dev/null || echo 0)
  if [ ! -f "$TARGET_PATH" ] || [ "$FILE_SIZE" -lt 10240 ]; then
    if [ -f "/app/prisma/dev.template.db" ]; then
      echo "📦 Initializing SQLite database from pre-seeded template to $TARGET_PATH..."
      cp -f /app/prisma/dev.template.db "$TARGET_PATH" || true
    elif [ -f "/app/prisma/dev.db" ]; then
      echo "📦 Initializing SQLite database to $TARGET_PATH..."
      cp -f /app/prisma/dev.db "$TARGET_PATH" || true
    fi
  fi
  chmod 666 "$TARGET_PATH" 2>/dev/null || true
fi

# Ensure uploads directory exists and is writable
mkdir -p /app/public/uploads 2>/dev/null || true
chmod -R 777 /app/public/uploads 2>/dev/null || true

echo "🚀 Starting eProfile system on port ${PORT:-3000} (Hostname: ${HOSTNAME:-0.0.0.0})..."
exec "$@"
