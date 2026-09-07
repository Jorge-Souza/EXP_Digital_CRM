#!/usr/bin/env bash
# Roda DENTRO da VPS, chamado pela GitHub Action a cada push em main.
set -euo pipefail

APP_DIR="/opt/exp-crm"
IMAGE="exp-crm"
CONTAINER="exp-crm-app"
PORT="3001"

cd "$APP_DIR"
git pull origin main

# NEXT_PUBLIC_* precisam existir no momento do build (o Next.js embute no bundle),
# não adianta só passar no `docker run --env-file`.
NEXT_PUBLIC_SUPABASE_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.production | cut -d= -f2-)
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.production | cut -d= -f2-)

docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -t "$IMAGE" .

docker stop "$CONTAINER" 2>/dev/null || true
docker rm "$CONTAINER" 2>/dev/null || true

docker run -d \
  --name "$CONTAINER" \
  --env-file "$APP_DIR/.env.production" \
  -p "127.0.0.1:${PORT}:3000" \
  --restart unless-stopped \
  "$IMAGE"

echo "Deploy concluído: $(date)"
