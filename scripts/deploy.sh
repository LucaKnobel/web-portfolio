#!/bin/bash
set -Eeuo pipefail

# Astro 5+ SSR Portfolio Deploy Script
# DSG/DSGVO-compliant deployment for Infomaniak hosting

# Load environment variables from server .env
ENV_FILE="/home/client/sites/lucaknobel.ch/app/.env"
if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ Environment file not found: $ENV_FILE"
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

# Required environment variables check
for var in DEPLOY_SECRET GITHUB_TOKEN REPO BRANCH DB_PATH SITE_ROOT APP_NAME; do
    if [[ -z "${!var:-}" ]]; then
        echo "❌ Required environment variable missing: $var"
        exit 1
    fi
done

# Configuration from environment
TS=$(date +%Y%m%d-%H%M%S)
APP_ROOT="$SITE_ROOT"
RELEASES_DIR="${RELEASES_DIR:-$APP_ROOT/releases}"
CURRENT_LINK="$APP_ROOT/current"
LOG_FILE="${DEPLOY_LOG:-$APP_ROOT/logs/deploy-$TS.log}"
MAX_RELEASES="${MAX_RELEASES:-5}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Ensure we're in the correct directory
cd "$APP_ROOT"

# Logging function (no secrets logged)
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🚀 Starting Astro 5+ SSR deployment: $TS"
log "📍 Target directory: $RELEASES_DIR/$TS/$APP_NAME"

# Create release directory
mkdir -p "$RELEASES_DIR/$TS"
cd "$RELEASES_DIR/$TS"

# Clone repository with GitHub token (HTTPS)
log "📡 Cloning repository..."
git init "$APP_NAME"
cd "$APP_NAME"

# Configure git for this clone
git remote add origin "$REPO"
git config user.email "deploy@lucaknobel.ch"
git config user.name "Deploy Bot"

# Fetch with token authentication (header-based, secure)
log "📥 Fetching latest code from $BRANCH..."
git -c http.extraHeader="Authorization: Bearer $GITHUB_TOKEN" \
    fetch --depth=1 origin "$BRANCH"

git reset --hard FETCH_HEAD

# Verify we have the expected files
if [[ ! -f "package.json" ]] || [[ ! -f "astro.config.mjs" ]]; then
    log "❌ Essential files missing in repository"
    exit 1
fi

log "✅ Repository cloned successfully"

# Install dependencies (production only)
log "📦 Installing dependencies..."
npm ci --omit=dev

# TypeScript check (non-blocking for portfolio)
log "🔍 TypeScript validation..."
if ! npm run typecheck; then
    log "⚠️ TypeScript warnings found, continuing deployment"
fi

# Build Astro SSR
log "🏗️ Building Astro 5+ SSR..."
npm run build

# Verify build output
if [[ ! -d "dist" ]] || [[ ! -f "dist/server/entry.mjs" ]]; then
    log "❌ Build failed - dist/ directory or SSR entry missing"
    exit 1
fi

log "✅ Build completed successfully"

# Create symlinks to persistent data (DSG-compliant)
log "🔧 Linking persistent data..."
ln -sf "$APP_ROOT/.env" .env
ln -sf "$APP_ROOT/data" data

# Database migration (if drizzle available)
log "🗃️ Database migration..."
if grep -q "drizzle-kit" package.json; then
    npx drizzle-kit push || log "⚠️ No database migrations to run"
fi

# Atomic switch to new release
log "🔄 Switching to new release (atomic)..."
ln -sfn "$RELEASES_DIR/$TS/$APP_NAME" "$CURRENT_LINK"

# PM2 graceful reload
log "♻️ Reloading application..."
cd "$CURRENT_LINK"

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    pm2 reload "$APP_NAME"
    log "✅ Application reloaded via PM2"
else
    pm2 start npm --name "$APP_NAME" -- start
    log "✅ Application started via PM2"
fi

# Cleanup old releases (keep last N)
log "🧹 Cleaning up old releases (keeping last $MAX_RELEASES)..."
cd "$RELEASES_DIR"
find . -maxdepth 1 -type d -name 'deploy-*' | sort | head -n -"$MAX_RELEASES" | xargs -r rm -rf

# Final status
log "🎉 Deployment completed successfully!"
log "📊 Status:"
log "  Release: $TS"
log "  Current: $(readlink $CURRENT_LINK)"
log "  Environment: ${NODE_ENV:-production}"

# PM2 status
pm2 show "$APP_NAME" --watch=false | head -5 | while read line; do
    log "  PM2: $line"
done

log "✅ Deployment log: $LOG_FILE"