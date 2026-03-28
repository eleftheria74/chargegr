#!/bin/bash
# Refresh station data and deploy to Plesk server
# Run from Contabo via cron or n8n
#
# Prerequisites:
#   - SSH key access to Plesk server
#   - Node.js installed on Contabo
#
# Environment variables:
#   PLESK_USER     — SSH user (default: plugmenow)
#   PLESK_HOST     — Plesk server hostname (default: viralev.gr)
#   PLESK_PATH     — Remote path for data files
#   PROJECT_DIR    — Local project directory

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/plugmenow/chargegr}"
PLESK_USER="${PLESK_USER:-plugmenow}"
PLESK_HOST="${PLESK_HOST:-viralev.gr}"
PLESK_PATH="${PLESK_PATH:-/var/www/vhosts/viralev.gr/chargegr.viralev.gr/data}"

LOG_FILE="/var/log/plugmenow-refresh.log"

echo "$(date -Iseconds) — Starting station data refresh" | tee -a "$LOG_FILE"

# Refresh stations data
cd "$PROJECT_DIR"
node scripts/refresh-stations.js 2>&1 | tee -a "$LOG_FILE"

if [ $? -ne 0 ]; then
  echo "$(date -Iseconds) — ERROR: refresh-stations.js failed" | tee -a "$LOG_FILE"
  exit 1
fi

# Deploy to Plesk
echo "Deploying stations.json to Plesk..." | tee -a "$LOG_FILE"
rsync -avz --timeout=30 \
  "$PROJECT_DIR/public/data/stations.json" \
  "${PLESK_USER}@${PLESK_HOST}:${PLESK_PATH}/stations.json"

if [ $? -eq 0 ]; then
  echo "$(date -Iseconds) — Deploy successful" | tee -a "$LOG_FILE"
else
  echo "$(date -Iseconds) — ERROR: rsync failed" | tee -a "$LOG_FILE"
  exit 1
fi
