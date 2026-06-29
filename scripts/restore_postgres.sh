#!/usr/bin/env bash
set -euo pipefail

COMPOSE="${COMPOSE:-docker compose}"

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 backups/postgres_YYYYmmdd_HHMMSS.dump"
  exit 1
fi

DUMP_FILE="$1"

if [ ! -f "$DUMP_FILE" ]; then
  echo "[restore] Error: dump file not found: $DUMP_FILE"
  exit 1
fi

if [ ! -s "$DUMP_FILE" ]; then
  echo "[restore] Error: dump file is empty: $DUMP_FILE"
  exit 1
fi

if [ "${CONFIRM_RESTORE:-}" != "YES" ]; then
  echo "[restore] This will overwrite data in the configured PostgreSQL database."
  echo "[restore] Re-run with CONFIRM_RESTORE=YES to continue."
  echo "[restore] Example:"
  echo "  CONFIRM_RESTORE=YES $0 $DUMP_FILE"
  exit 1
fi

echo "[restore] Restoring PostgreSQL database from:"
echo "[restore] $DUMP_FILE"

cat "$DUMP_FILE" | $COMPOSE exec -T db sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" pg_restore -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner'

echo "[restore] Restore completed."
echo "[restore] Check service health with:"
echo "  curl https://localhost/health/"