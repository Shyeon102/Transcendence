#!/usr/bin/env bash

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
COMPOSE="${COMPOSE:-docker compose}"

TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
BACKUP_FILE="${BACKUP_DIR}/postgres_${TIMESTAMP}.dump"

mkdir -p "$BACKUP_DIR"

echo "[backup] Starting PostgreSQL backup..."
echo "[backup] Output: ${BACKUP_FILE}"

$COMPOSE exec -T db sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > "$BACKUP_FILE"

if [ ! -s "$BACKUP_FILE" ]; then
  echo "[backup] Error: backup file is empty."
  rm -f "$BACKUP_FILE"
  exit 1
fi

echo "[backup] Backup created successfully:"
ls -lh "$BACKUP_FILE"

echo "[backup] Removing backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -type f -name "postgres_*.dump" -mtime +"$RETENTION_DAYS" -delete

echo "[backup] Done."