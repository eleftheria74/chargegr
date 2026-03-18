#!/bin/bash
cd /media/eleftheria/DataSSD/Projects/ChargeGr/chargegr
RUN=1
while true; do
  echo "======== RUN $RUN ($(date '+%H:%M:%S')) ========"
  node scripts/fetch-stations.js 2>&1
  # Check if all details are cached (no "Run again" message)
  REMAINING=$(node -e "
    const c = JSON.parse(require('fs').readFileSync('scripts/.detail-cache.json','utf8'));
    const s = JSON.parse(require('fs').readFileSync('public/data/stations.json','utf8'));
    const myfahi = s.filter(x => x.source === 'myfahi');
    const without = myfahi.filter(x => !x.address).length;
    console.log(without);
  ")
  echo "Remaining without address: $REMAINING"
  if [ "$REMAINING" -eq 0 ] 2>/dev/null; then
    echo "=== ALL DONE ==="
    break
  fi
  RUN=$((RUN + 1))
  echo "Sleeping 60s..."
  sleep 60
done
