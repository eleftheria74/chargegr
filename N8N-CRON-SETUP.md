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
- Error notifications δυνατές στο μέλλον

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
| `refresh.sh` | root | 755 | Wrapper script (για manual runs στον host, εναλλακτικό του n8n) |
| `n8n-workflow.json` | root | 644 | Backup του n8n workflow για re-import σε άλλο server |

**⚠️ Mount στο n8n: READ-ONLY (`:ro`)**
Το n8n δεν μπορεί να τροποποιήσει τον κώδικα — ασφάλεια.

### 2.2 `/var/data/plugmenow/cache/` (host)

Ξεχωριστό folder για το cache, **κοντά στο `/var/data/plugmenow/photos/`** για συνοχή.

| Αρχείο | Owner | Perms | Σκοπός |
|--------|-------|-------|--------|
| `.detail-cache.json` | 1000:1000 | 644 | Cache ~11MB με details ~3900 σταθμών από ΜΥΦΑΗ |

**⚠️ Mount στο n8n: READ-WRITE** — το script προσθέτει νέα entries όταν εμφανίζονται νέοι σταθμοί.

**UID 1000:** Ίδιο με τον Plesk user (`psaadm` group) και τον n8n `node` user — όλα ευθυγραμμισμένα.

### 2.3 `/var/log/plugmenow-refresh.log` (host)

Log file για το `refresh.sh` (manual runs στον host). **Δεν χρησιμοποιείται από το n8n** — το n8n κρατάει τα δικά του logs στο Executions tab.

---

## 3. Αλλαγές στο n8n

### 3.1 `/opt/containers/n8n/docker-compose.yml`

**Backup πριν τις αλλαγές:** `/opt/containers/n8n/docker-compose.yml.backup`

**Αλλαγή στο `volumes:` section:**

```yaml
volumes:
  - /opt/containers/n8n/n8n-data:/home/node/.n8n           # existing
  - /opt/containers/plugmenow-api/cron:/scripts:ro         # NEW - read-only
  - /var/data/plugmenow/cache:/cache                       # NEW - read-write
  - /var/www/vhosts/viralev.gr/chargegr.viralev.gr/data:/output  # NEW - read-write
```

**Restart command:**
```bash
cd /opt/containers/n8n
docker compose down && docker compose up -d
```

### 3.2 n8n Workflow

**Όνομα:** `PlugMeNow — Refresh Station Data`
**Status:** Active
**Trigger:** Cron `0 */6 * * *` (κάθε 6 ώρες, Europe/Athens)
**Nodes:**
1. **Every 6 Hours** (scheduleTrigger)
2. **Refresh Stations** (executeCommand)
3. **Check Error** (if node)
4. **Success** (noOp)

**Command που εκτελείται:**
```bash
cd /scripts && OUTPUT_PATH=/output/stations.json CACHE_PATH=/cache/.detail-cache.json node refresh-stations.js
```

**Backup workflow JSON:** `/opt/containers/plugmenow-api/cron/n8n-workflow.json`

---

## 4. 🚫 Αρχεία που ΔΕΝ πρέπει να επανεγγραφούν / σβηστούν

### ΚΡΙΣΙΜΑ (loss of data ή hours of re-processing)

| Αρχείο/Folder | Γιατί |
|--------------|-------|
| `/var/data/plugmenow/cache/.detail-cache.json` | ~11MB cache με ~3900 entries. Rebuild διαρκεί **ώρες** λόγω API throttling (BATCH_SIZE=3, 200ms delay, 30 fails = stop). Αν σβηστεί, θα χρειαστούν πολλά runs για να ξαναγεμίσει. |
| `/var/data/plugmenow/photos/` | User-uploaded photos σταθμών. Δεν υπάρχει backup αλλού. |
| `/opt/containers/n8n/n8n-data/` | Όλα τα n8n workflows + credentials. **Ήδη υπάρχουν backups:** `n8n-data-backup_20250525`, `n8n-data-backup_20250611`. |

### ΣΗΜΑΝΤΙΚΑ (χρειάζεται re-setup αν σβηστούν)

| Αρχείο/Folder | Γιατί |
|--------------|-------|
| `/opt/containers/plugmenow-api/cron/refresh-stations.js` | Production script. Master copy στο dev machine: `/media/eleftheria/DataSSD/Projects/ChargeGr/chargegr/scripts/refresh-stations.js` |
| `/opt/containers/plugmenow-api/cron/n8n-workflow.json` | Backup του workflow για re-import σε άλλο server. |
| `/opt/containers/n8n/docker-compose.yml` | Περιέχει τα mounts που χρειάζεται το cron. Backup: `docker-compose.yml.backup` |

### ΑΣΦΑΛΕΣ να σβηστεί (θα ξαναγίνει αυτόματα)

| Αρχείο | Σημείωση |
|--------|----------|
| `/var/www/vhosts/viralev.gr/chargegr.viralev.gr/data/stations.json` | Ανανεώνεται κάθε 6 ώρες από το cron. |
| `/var/log/plugmenow-refresh.log` | Log από manual runs. |

---

## 5. Μελλοντική Διαχείριση

### Manual trigger
**Από n8n UI:** Workflows → PlugMeNow → Execute workflow
**Από terminal (χωρίς n8n):**
```bash
/opt/containers/plugmenow-api/cron/refresh.sh
```

### Επαλήθευση ότι τρέχει
```bash
# Δες τελευταίο modified time του stations.json
ls -la /var/www/vhosts/viralev.gr/chargegr.viralev.gr/data/stations.json

# Δες n8n logs
docker logs n8n --tail 50

# Δες manual run logs
tail -50 /var/log/plugmenow-refresh.log
```

### Update του refresh-stations.js
Αν αλλάξει ο κώδικας στο dev machine:
```bash
# Από dev machine
cd /media/eleftheria/DataSSD/Projects/ChargeGr/chargegr
scp scripts/refresh-stations.js root@194.60.87.107:/opt/containers/plugmenow-api/cron/
```

**Δεν χρειάζεται restart** του n8n — το script διαβάζεται κάθε φορά που τρέχει.

### Backup του cache (συστήνεται)
```bash
# Κάθε μήνα ή πριν από μεγάλες αλλαγές
cp /var/data/plugmenow/cache/.detail-cache.json \
   /var/data/plugmenow/cache/.detail-cache.json.backup-$(date +%Y%m%d)
```

### Μεταφορά σε άλλο server

Σε περίπτωση μετακόμισης, ακολούθησε αυτήν τη σειρά:

1. **Νέος server:** Εγκατάστησε Docker + n8n με το ίδιο volume structure
2. **Αντίγραψε αρχεία:**
   ```bash
   # Από παλιό σε νέο server:
   scp -r /opt/containers/plugmenow-api/cron newserver:/opt/containers/plugmenow-api/
   scp -r /var/data/plugmenow/cache newserver:/var/data/plugmenow/
   chown -R 1000:1000 /var/data/plugmenow/cache  # στον νέο server
   ```
3. **Ενημέρωσε το docker-compose.yml** του n8n στον νέο server με τα 3 mounts
4. **Restart n8n:** `docker compose down && docker compose up -d`
5. **Import workflow:** από το `/opt/containers/plugmenow-api/cron/n8n-workflow.json`
6. **Activate** το workflow

### Troubleshooting

| Πρόβλημα | Λύση |
|----------|------|
| `EACCES: permission denied` | Έλεγξε ότι το cache folder ανήκει σε UID 1000: `chown -R 1000:1000 /var/data/plugmenow/cache` |
| `EROFS: read-only file system` | Ξέχασες να βγάλεις το `:ro` από κάποιο mount που χρειάζεται write |
| n8n δεν βλέπει τα mounts | Πρέπει `docker compose down && docker compose up -d`, όχι restart |
| ΜΥΦΑΗ API throttle | Το script σταματάει στα 30 consecutive fails και σώζει το cache — τρέξε ξανά αργότερα |
| OCM API timeout (HTTP 524) | Αυτόματο fallback: κρατάει OCM-only stations από προηγούμενο run |

---

## 6. Χρονοδιάγραμμα Cron

| Ώρα (Europe/Athens) | Run |
|---------------------|-----|
| 00:00 | Πρώτο της ημέρας |
| 06:00 | Πρωί |
| 12:00 | Μεσημέρι |
| 18:00 | Απόγευμα |

**Διάρκεια:** ~1.5-3.5s αν το cache είναι πλήρες. Έως μερικά λεπτά αν υπάρχουν πολλά νέα stations στο ΜΥΦΑΗ.

---

## 7. Metrics (από την πρώτη εκτέλεση)

- **3.840** ΜΥΦΑΗ locations
- **287** OCM POIs
- **136** ΜΥΦΑΗ enriched από OCM
- **151** OCM-only added
- **3.991** total stations
- **3.774** operational (94.6%)
- **1.84 MB** stations.json size
- **1.5s** execution time (cached)
