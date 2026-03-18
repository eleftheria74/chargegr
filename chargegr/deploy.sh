#!/bin/bash
# ChargeGR — Deploy script for Plesk (chargegr.viralev.gr)
# Usage: ./deploy.sh [user@server]
#
# Example: ./deploy.sh admin@viralev.gr

set -e

# Configuration
REMOTE_USER_HOST="${1:-}"
REMOTE_PATH="/var/www/vhosts/viralev.gr/chargegr.viralev.gr"

echo "=== ChargeGR Build & Deploy ==="

# 1. Build
echo ""
echo "[1/3] Building production bundle..."
npm run build

# Verify /out exists
if [ ! -d "out" ]; then
  echo "ERROR: /out folder not found. Build failed."
  exit 1
fi

OUT_SIZE=$(du -sh out/ | cut -f1)
FILE_COUNT=$(find out -type f | wc -l)
echo "  Build complete: $FILE_COUNT files, $OUT_SIZE"

# 2. Deploy
if [ -z "$REMOTE_USER_HOST" ]; then
  echo ""
  echo "[2/3] No remote host specified. Skipping upload."
  echo ""
  echo "To deploy manually, run:"
  echo "  rsync -avz --delete ./out/ user@server:$REMOTE_PATH/"
  echo ""
  echo "Or specify host as argument:"
  echo "  ./deploy.sh admin@viralev.gr"
else
  echo ""
  echo "[2/3] Deploying to $REMOTE_USER_HOST:$REMOTE_PATH ..."
  rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    ./out/ "$REMOTE_USER_HOST:$REMOTE_PATH/"
  echo "  Upload complete."
fi

# 3. Done
echo ""
echo "[3/3] Done!"
echo ""
echo "Post-deploy checklist:"
echo "  [ ] SSL: Verify Let's Encrypt is active for chargegr.viralev.gr"
echo "  [ ] Open https://chargegr.viralev.gr and test"
echo "  [ ] Check PWA install prompt in Chrome"
echo "  [ ] Run Lighthouse audit"
