#!/bin/sh
set -e

echo "=== Reneo SIDesa Services Initializing ==="
echo "Node Version: $(node -v)"
echo "Database Target: ${DATABASE_URL:+configured}"
echo "WAHA Target: ${WAHA_BASE_URL:-not-set}"

PERSISTENT_DATA_DIR="${DATA_DIR:-/app/data}"
PERSISTENT_UPLOADS_DIR="${MEDIA_UPLOAD_DIR:-$PERSISTENT_DATA_DIR/uploads}"
mkdir -p "$PERSISTENT_UPLOADS_DIR"
export MEDIA_UPLOAD_DIR="$PERSISTENT_UPLOADS_DIR"

echo "Starting Fastify SIDesa Backend on port ${PORT:-5000}..."
node /app/backend/dist/server.js &

echo "Starting Nginx HTTP Server on port 80..."
exec nginx -g "daemon off;"
