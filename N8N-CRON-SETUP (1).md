# PlugMeNow — n8n Cron Automation Setup

**Ημερομηνία υλοποίησης:** 5 Απριλίου 2026
**Σκοπός:** Αυτόματη ανανέωση `stations.json` κάθε 6 ώρες μέσω n8n στον Contabo server.

---

## 1. Αρχιτεκτονική

```
n8n (Docker container, UID 1000)
  ↓ cron trigger 0 */6 * * *
  ↓ execute command
  node /scripts/refresh-stations.js
  ↓ reads
  /cache/.detail-cache.json (host: /var/data/plugmenow/cache/)
  ↓ writes
  /output/stations.json (host: /var/www/vhosts/viralev.gr/chargegr.viralev.gr/data/)
```

**Γιατί μέσω n8n και όχι system cron:**
- Υπάρχει ήδη n8n instance στον server (zero extra cost)
- Εύκολο UI για monitoring των runs (Executions tab)
- Εύκολο manual trigger όποτε χρειάζεται

**Γιατί native Node (όχι docker-in-docker):**
- Το n8n image έχει ήδη Node.js εγκατεστημένο
- Δεν χρειάζεται να δώσουμε docker.sock access στο n8n (ασφάλεια)
- Πιο γρήγορο execution

---

## 2. Folders & Αρχεία που Δημιουργήθηκαν

### 2.1 `/opt/containers/plugmenow-api/cron/` (host)

Περιέχει τα αρχεία του cron job, μαζί με το API για συνοχή.

| Αρχείο | Owner | Perms | Σκοπός |
|--------|-------|-------|--------|
| `refresh-stations.js` | root | 755 | Production script — fetch ΜΥΦΑΗ + OCM, generate stations.json |
| `refresh.sh` | root | 755 | Wrapper script (για manual runs στον host) |
| `n8n-workflow.json` | root | 644 | Backup του n8n workflow για re-import |

**Mount στο n8n: READ-ONLY (`:ro`)** — το n8n δεν μπορεί να τροποποιήσει τον κώδικα.

### 2.2 `/var/data/plugmenow/cache/` (host)

Ξεχωριστό folder για το cache, κοντά στο `/var/data/plugmenow/photos/`.

| Αρχείο | Owner | Perms | Σκοπός |
|--------|-------|-------|--------|
| `.detail-cache.json` | 1000:1000 | 644 | Cache ~11MB με details ~3900 σταθμών από ΜΥΦΑΗ |

**Mount στο n8n: READ-WRITE** — το script προσθέτει νέα entries όταν εμφανίζονται νέοι σταθμοί.

**UID 1000:** Ίδιο με τον Plesk user (`psaadm` group) και τον n8n `node` user.

### 2.3 `/var/log/plugmenow-refresh.log` (host)

Log file για το `refresh.sh` (manual runs στον host). Δεν χρησιμοποιείται από το n8n — το n8n κρατάει τα δικά του logs στο Executions tab.

---

## 3. Αλλαγές στο n8n

### 3.1 `/opt/containers/n8n/docker-compose.yml`

**Backup:** `/opt/containers/n8n/docker-compose.yml.backup`

**Αλλαγή στο `volumes:` section:**

```yaml
volumes:
  - /opt/containers/n8n/n8n-data:/home/node/.n8n           # existing
  - /opt/containers/plugmenow-api/cron:/scripts:ro         # NEW - read-only
  - /var/data/plugmenow/cache:/cache                       # NEW - read-write
  - /var/www/vhosts/viralev.gr/chargegr.viralev.gr/data:/output  # NEW - read-write
```

**Restart:**
```bash
cd /opt/containers/n8n
docker compose down && docker compose up -d
```

### 3.2 n8n Workflow

**Όνομα:** `PlugMeNow — Refresh Station Data`
**Status:** Active
**Trigger:** Cron `0 */6 * * *` (κάθε 6 ώρες, Europe/Athens)

**Command που εκτελείται:**
```bash
cd /scripts && OUTPUT_PATH=/output/stations.json CACHE_PATH=/cache/.detail-cache.json node refresh-stations.js
```

**Backup workflow JSON:** `/opt/containers/plugmenow-api/cron/n8n-workflow.json`

---

## 4. Αρχεία που ΔΕΝ πρέπει να επανεγγραφούν / σβηστούν

### ΚΡΙΣΙΜΑ (loss of data ή hours of re-processing)

| Αρχείο/Folder | Γιατί |
|--------------|-------|
| `/var/data/plugmenow/cache/.detail-cache.json` | ~11MB cache με ~3900 entries. Rebuild διαρκεί ώρες λόγω ΜΥΦΑΗ API throttling. |
| `/var/data/plugmenow/photos/` | User-uploaded photos σταθμών. Δεν υπάρχει backup αλλού. |
| `/opt/containers/n8n/n8n-data/` | Όλα τα n8n workflows + credentials. Backups: `n8n-data-backup_*` |

### ΣΗΜΑΝΤΙΚΑ (χρειάζεται re-setup αν σβηστούν)

| Αρχείο/Folder | Γιατί |
|--------------|-------|
| `/opt/containers/plugmenow-api/cron/refresh-stations.js` | Master copy στο dev machine: `/media/eleftheria/DataSSD/Projects/ChargeGr/chargegr/scripts/refresh-stations.js` |
| `/opt/containers/plugmenow-api/cron/n8n-workflow.json` | Backup του workflow για re-import |
| `/opt/containers/n8n/docker-compose.yml` | Backup: `docker-compose.yml.backup` |
| `/opt/containers/plugmenow-api/.env` | Περιέχει DB_PASS, JWT_SECRET, PHOTO_DIR — backup χωριστά! |

### ΑΣΦΑΛΕΣ να σβηστεί (θα ξαναγίνει αυτόματα)

| Αρχείο | Σημείωση |
|--------|----------|
| `/var/www/vhosts/viralev.gr/chargegr.viralev.gr/data/stations.json` | Ανανεώνεται κάθε 6 ώρες από το cron. |
| `/var/log/plugmenow-refresh.log` | Log από manual runs. |

---

## 5. Κρίσιμα Bugs που Βρέθηκαν & Διορθώθηκαν (5 Απριλίου 2026)

### Bug #1: Το `refresh-stations.js` χρησιμοποιούσε παλιά base64 station IDs

**Συμπτώματα:** Μετά το πρώτο run του cron, το frontend εμφάνιζε stations με IDs σαν `myfahi-MkYwN0RDQjcxODg4NkU1NEFDOTI1...` (base64 ΜΥΦΑΗ location_ids). Οι φωτογραφίες & reviews εξαφανίζονταν γιατί τα DB records είχαν coordinate-based IDs από το migration.

**Αιτία:** Στη γραμμή 288 του `refresh-stations.js`:
```javascript
id: `myfahi-${props.location_id}`,  // ΛΑΘΟΣ — unstable base64
```

**Σωστό (όπως στο `fetch-stations.js:324`):**
```javascript
id: `myfahi-${lat.toFixed(5)}_${lng.toFixed(5)}`,  // coordinate-based
```

**WARNING για το μέλλον:** Κάθε αλλαγή στη logic του station ID πρέπει να έρθει μαζί με SQL migration σε:
- `photos.station_id`
- `reviews.station_id`
- `check_ins.station_id`
- `favorites.station_id`

### Bug #2: Το `refresh.sh` είχε λάθος cache path

**Συμπτώματα:** Όταν τρέχαμε το `refresh.sh` manually, το cache αγνοούνταν (`Cache: 0`) και το script προσπαθούσε να ξαναχτίσει από το μηδέν (ώρες λόγω throttling).

**Αιτία:** Το script mount-αρε το cache στο `/opt/containers/plugmenow-api/cron/` ενώ το πραγματικό cache είναι στο `/var/data/plugmenow/cache/`.

**Διόρθωση:** Το `refresh.sh` τώρα χρησιμοποιεί το ίδιο `CACHE_PATH=/cache/.detail-cache.json` με το n8n workflow.

### Bug #3: Το API container είχε λάθος PHOTO_DIR

**Συμπτώματα:** Οι φωτογραφίες που ανέβαιναν γράφονταν σε ephemeral container storage και χάνονταν σε κάθε restart.

**Αιτία:** Το `.env` είχε `PHOTO_DIR=/data/plugmenow/photos` αλλά το volume mount ήταν `/data/photos`.

**Διόρθωση:**
- Άλλαξε σε `PHOTO_DIR=/data/photos` στο `.env`
- `docker compose down && docker compose up -d`

**Απώλεια δεδομένων:** Χάθηκαν 3 φωτογραφίες που είχαν ανέβει πριν τη διόρθωση — τα DB records τους σβήστηκαν.

---

## 6. Μελλοντική Διαχείριση

### Manual trigger
**Από n8n UI:** Workflows → PlugMeNow → Execute workflow
**Από terminal:**
```bash
/opt/containers/plugmenow-api/cron/refresh.sh
```

### Επαλήθευση ότι τρέχει
```bash
# Τελευταίο modified time του stations.json
ls -la /var/www/vhosts/viralev.gr/chargegr.viralev.gr/data/stations.json

# Έλεγχος format των station IDs (πρέπει να είναι coordinate-based!)
head -c 500 /var/www/vhosts/viralev.gr/chargegr.viralev.gr/data/stations.json | grep -oP '"id":"[^"]*"' | head -5
# Αναμενόμενο: "id":"myfahi-37.83628_23.76697"
# ΛΑΘΟΣ: "id":"myfahi-MkYwN0RDQjcx..." (base64)

# n8n logs
docker logs n8n --tail 50

# Manual run logs
tail -50 /var/log/plugmenow-refresh.log
```

### Update του refresh-stations.js
```bash
# Από dev machine
cd /media/eleftheria/DataSSD/Projects/ChargeGr/chargegr
scp scripts/refresh-stations.js root@194.60.87.107:/opt/containers/plugmenow-api/cron/
```

**Δεν χρειάζεται restart** του n8n — το script διαβάζεται κάθε φορά που τρέχει.

### Backup του cache (συστήνεται μηνιαία)
```bash
cp /var/data/plugmenow/cache/.detail-cache.json \
   /var/data/plugmenow/cache/.detail-cache.json.backup-$(date +%Y%m%d)
```

### DB Queries (Troubleshooting)
```bash
# Ο user plugmenow έχει grant ΜΟΝΟ από Docker gateway (172.17.0.1)
# Από host: χρησιμοποίησε root user
mysql -u root -p plugmenow -e "SELECT COUNT(*) FROM photos;"

# Εύρεση orphan photos (με παλιό base64 station_id)
mysql -u root -p plugmenow -e "
SELECT id, station_id, filename, created_at FROM photos
WHERE station_id LIKE 'myfahi-%'
  AND station_id NOT REGEXP '^myfahi-[0-9]+\\\\.[0-9]+_[0-9]+\\\\.[0-9]+\$'
ORDER BY created_at DESC;
"
```

### Μεταφορά σε άλλο server

1. **Νέος server:** Εγκατάστησε Docker + n8n με το ίδιο volume structure
2. **Αντίγραψε αρχεία:**
   ```bash
   scp -r /opt/containers/plugmenow-api/cron newserver:/opt/containers/plugmenow-api/
   scp -r /var/data/plugmenow/cache newserver:/var/data/plugmenow/
   chown -R 1000:1000 /var/data/plugmenow/cache
   ```
3. **Ενημέρωσε docker-compose.yml** του n8n με τα 3 mounts
4. **Restart n8n:** `docker compose down && docker compose up -d`
5. **Import workflow** από το `n8n-workflow.json`
6. **Activate** το workflow

### Troubleshooting

| Πρόβλημα | Λύση |
|----------|------|
| `EACCES: permission denied` | `chown -R 1000:1000 /var/data/plugmenow/cache` |
| `EROFS: read-only file system` | Ξέχασες να βγάλεις το `:ro` από κάποιο mount |
| n8n δεν βλέπει mounts | `docker compose down && docker compose up -d` (όχι restart) |
| `Access denied for user 'plugmenow'@'localhost'` | User grant μόνο από 172.17.0.1. Χρησιμοποίησε root user. |
| ΜΥΦΑΗ API throttle | Σταματάει στα 30 consecutive fails, σώζει cache. Τρέξε ξανά αργότερα. |
| OCM API timeout (HTTP 524) | Auto fallback: κρατάει OCM-only stations από προηγούμενο run |
| Station IDs σε base64 format μετά refresh | Έλεγξε ότι το refresh-stations.js έχει coord-based IDs (γραμμή 288) |
| Φωτογραφίες χάνονται μετά restart | Έλεγξε ότι PHOTO_DIR=/data/photos στο .env του API |

---

## 7. Χρονοδιάγραμμα Cron

| Ώρα (Europe/Athens) | Run |
|---------------------|-----|
| 00:00, 06:00, 12:00, 18:00 | Αυτόματο refresh |

**Διάρκεια:** ~1.5-3.5s αν cache πλήρες.

---

## 8. Metrics (από την τελευταία εκτέλεση)

- **3.842** ΜΥΦΑΗ locations
- **287** OCM POIs
- **136** ΜΥΦΑΗ enriched από OCM
- **151** OCM-only added
- **3.993** total stations
- **3.776** operational (94.6%)
- **1.61 MB** stations.json size
- **1.4s** execution time (cached)
