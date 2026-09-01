#!/bin/bash
# eProfile Scheduled Backup Script
# Usage: Add to crontab: 0 1 * * * /path/to/eprofile/scripts/backup.sh
# This creates a daily backup at 01:00 AM and keeps 30 days of backups.

set -euo pipefail

# --- Configuration ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DB_PATH="$PROJECT_DIR/prisma/dev.db"
BACKUP_DIR="$PROJECT_DIR/prisma/backups"
MAX_BACKUPS=30
LOG_FILE="$PROJECT_DIR/logs/backup.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/eprofile_backup_$TIMESTAMP.db"

# --- Setup ---
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

echo "[$TIMESTAMP] Starting backup..." | tee -a "$LOG_FILE"

# --- Check source ---
if [ ! -f "$DB_PATH" ]; then
  echo "[$TIMESTAMP] ERROR: Database not found at $DB_PATH" | tee -a "$LOG_FILE"
  exit 1
fi

# --- Copy DB ---
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "[$TIMESTAMP] Backup created: $BACKUP_FILE ($(du -sh "$BACKUP_FILE" | cut -f1))" | tee -a "$LOG_FILE"
else
  echo "[$TIMESTAMP] ERROR: Backup failed!" | tee -a "$LOG_FILE"
  exit 1
fi

# --- Retention: keep only last MAX_BACKUPS ---
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.db 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
  DELETE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
  ls -1t "$BACKUP_DIR"/*.db | tail -n "$DELETE_COUNT" | xargs rm -f
  echo "[$TIMESTAMP] Retention: deleted $DELETE_COUNT old backups (keeping $MAX_BACKUPS)" | tee -a "$LOG_FILE"
fi

echo "[$TIMESTAMP] Backup complete. Total backups: $(ls -1 "$BACKUP_DIR"/*.db 2>/dev/null | wc -l)" | tee -a "$LOG_FILE"
