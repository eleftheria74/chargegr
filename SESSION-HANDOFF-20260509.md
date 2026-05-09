# PlugMeNow — Session Handoff Document
**Ημερομηνία:** 9 Μαΐου 2026
**Σκοπός:** Πλήρες context για νέο Claude session

---

## 1. Τι είναι το PlugMeNow

Ελληνική εφαρμογή εύρεσης σταθμών φόρτισης EV. PWA + Android TWA.
- **Live:** https://chargegr.viralev.gr
- **Developer:** AiSmartly (aismartly.gr)
- **Brand:** ViralEV (viralev.gr)
- **Contact:** dev@aismartly.gr
- **Monetization:** 100% FREE, χωρίς ads

### Tech Stack
- Frontend: Next.js 14 static export, MapLibre, Tailwind, Zustand
- Backend: Node.js Express σε Docker (port 3002)
- DB: MariaDB (Contabo host)
- Hosting: Contabo VPS (194.60.87.107), Plesk
- Android: Bubblewrap TWA (package: gr.viralev.plugmenow)
- Automation: n8n cron (station refresh κάθε 6h)

### Paths
- Frontend: `/media/eleftheria/DataSSD/Projects/ChargeGr/chargegr`
- Backend: `/media/eleftheria/DataSSD/Projects/ChargeGr/plugmenow-api`
- Specs: `/media/eleftheria/DataSSD/Projects/ChargeGr/` (parent)
- TWA: `/media/eleftheria/DataSSD/Projects/ChargeGr/` (root — Bubblewrap setup)
- GitHub: `eleftheria74/chargegr`, `eleftheria74/plugmenow-api`

### Server (Contabo)
- API container: `plugmenow-api-plugmenow-api-1` (port 3002)
- n8n container: `n8n` (port 5678, localhost only)
- Photos: `/var/data/plugmenow/photos/` → container `/data/photos`
- Cache: `/var/data/plugmenow/cache/.detail-cache.json` (~11MB, ~3900 entries)
- Cron scripts: `/opt/containers/plugmenow-api/cron/`
- Frontend: `/var/www/vhosts/viralev.gr/chargegr.viralev.gr/`
- DB user `plugmenow`: grants μόνο από `172.17.0.1`, από host χρησιμοποίησε `root`

---

## 2. Τι ολοκληρώθηκε (πλήρες ιστορικό)

### Phase 1 ✅ — PWA
~4.000+ σταθμοί (ΜΥΦΑΗ + OCM), 1.321 EV μοντέλα, 74 brands, i18n EL/EN

### Phase 2 ✅ — Android TWA
Bubblewrap build, signing key, assetlinks.json.

### Phase 3 ✅ — Community
Sprint 1: API + DB + Docker deploy
Sprint 2: Google auth, email auth, reviews, check-ins, favorites, reliability scores
Sprint 3+4: Photos, vehicle suggest, admin HTML panel

### GDPR Sprint ✅
Privacy policy, terms, account deletion, data export, consent flow

### n8n Cron Automation ✅ (5 Απριλίου 2026)
- Auto-refresh stations.json κάθε 6 ώρες μέσω n8n
- Script: `/opt/containers/plugmenow-api/cron/refresh-stations.js`
- Wrapper: `/opt/containers/plugmenow-api/cron/refresh.sh`
- n8n mounts: `/scripts:ro`, `/cache:rw`, `/output:rw`
- Documentation: `N8N-CRON-SETUP.md`
- **n8n cron fixed** (8 Μαΐου): refresh-stations.js re-uploaded μετά από accidental deletion

### Mobile UI Fixes ✅ (5 Απριλίου 2026)
- Station card X overlap, search bar overflow, vehicle dropdown, map attribution, filter panel fixes

### Admin Dashboard Phase 1 ✅ (10 Απριλίου 2026)
- DB Migrations 005 + 006 applied
- Backend: isAdmin middleware, split admin routes, audit logging, user management, content moderation
- Frontend: `/dashboard` route, sidebar layout, all pages functional, i18n EL/EN
- Admin users: eleftheria.oikonomou@gmail.com, admin@aismartly.gr

### Play Store Submission ✅ (7-9 Μαΐου 2026)

**Preparation (Claude Code):**
- Privacy/Terms: branding updated ViralEV → AiSmartly (deployed live)
- Store listing texts: EL + EN finalized (`playstore-el.md`, `playstore-en.md`)
- Feature graphic: 1024×500 SVG→PNG (`playstore-assets/feature-graphic.png`)
- Data Safety mapping: `playstore-assets/DATA-SAFETY.md`
- Content Rating mapping: `playstore-assets/CONTENT-RATING.md`
- Screenshot guide: `playstore-assets/SCREENSHOT-GUIDE.md`
- Upload checklist: `playstore-assets/UPLOAD-CHECKLIST.md`
- Git commits: 51e5dae (branding) + 59ae08a (assets)

**Play Console (Eleftheria):**
- App created: AiSmartly organization, dev@aismartly.gr
- Forms completed: App access, Ads (no), Content Rating (PEGI 3), Target audience (18+), Data Safety
- Store listing: EN (default) + EL translation, icon 512×512, feature graphic, phone screenshots
- AAB uploaded (1.5MB, v1.0.0) → Internal Testing → Production
- Play App Signing enabled
- AssetLinks updated με δύο SHA-256 fingerprints:
  - Upload key: `F2:22:7F:1A:C2:9C:1E:B5:70:3D:EA:A3:56:65:18:1B:24:B9:68:2F:1E:A8:82:C0:78:DB:DA:50:69:34:5C:86`
  - Google signing: `8D:EC:64:06:23:95:93:25:DB:1C:E0:4D:F0:1C:FF:77:2C:FA:08:6F:E9:8A:5F:1A:AD:E5:AF:30:9E:14:7A:40`
- **Status:** ΣΕ ΕΛΕΓΧΟ (submitted to Production, αναμονή Google review)

### Bug Fixes ✅ (9 Μαΐου 2026)
- Photo upload mobile: camera-only → δύο κουμπιά (Camera + Files)
- Photo max size: 5MB → 15MB (frontend + backend + nginx vhost)
- Share App button: μετακινήθηκε από StationCard → header
- Photo upload prompt text: "Πρόσθεσε φωτογραφία από τον σταθμό"
- nginx client_max_body_size: 5M → 20M στο vhost config
- n8n cron: refresh-stations.js re-uploaded μετά accidental deletion
- TWA browser bar: resolved (assetlinks + cache clear)

---

## 3. Τι εκκρεμεί ΤΩΡΑ

### 🟡 Play Store — αναμονή Google review
- Status: submitted to Production
- Αναμονή 1-7 μέρες
- Μετά approval: verify Play Store install, update README με link

### 🟢 Backlog (μελλοντικά, ανάλογα με επιτυχία/προώθηση)
- **WordPress embed plugin** — prompt ready: `wordpress-plugin-sprint-prompt.txt`
- **Admin Dashboard Phase 2** — station overrides, vehicles management
- **EV models update** — `eu_ev_models_open_ev_data.xlsx` available
- **Analytics (Umami)** — deferred
- **Phase 4** — Route planning, premium features, EU expansion

---

## 4. Κρίσιμα αρχεία & paths στον Contabo

### ΜΗΝ σβήσεις / overwrite
| Path | Γιατί |
|------|-------|
| `/var/data/plugmenow/cache/.detail-cache.json` | Rebuild = ώρες |
| `/var/data/plugmenow/photos/` | User data |
| `/opt/containers/plugmenow-api/.env` | Credentials |
| `/opt/containers/n8n/n8n-data/` | Workflows |
| `/var/www/vhosts/viralev.gr/chargegr.viralev.gr/.well-known/assetlinks.json` | TWA verification |

### n8n Docker volumes (docker-compose.yml)
```yaml
volumes:
  - /opt/containers/n8n/n8n-data:/home/node/.n8n
  - /opt/containers/plugmenow-api/cron:/scripts:ro
  - /var/data/plugmenow/cache:/cache
  - /var/www/vhosts/viralev.gr/chargegr.viralev.gr/data:/output
```

### n8n workflow command
```bash
cd /scripts && OUTPUT_PATH=/output/stations.json CACHE_PATH=/cache/.detail-cache.json node refresh-stations.js
```

### Deploy commands
**Frontend:**
```bash
cd /media/eleftheria/DataSSD/Projects/ChargeGr/chargegr
rm -rf .next && npm run build
rsync -avz --delete --exclude='.well-known' --exclude='data/stations.json' out/ root@194.60.87.107:/var/www/vhosts/viralev.gr/chargegr.viralev.gr/
```

**Backend:**
```bash
# Στον Contabo
cd /opt/containers/plugmenow-api
git config --global --add safe.directory /opt/containers/plugmenow-api
git pull
docker compose down && docker compose up -d --build
```

---

## 5. Production Safety Rules

- ΠΟΤΕ δεν αγγίζουμε υπάρχοντα databases χωρίς backup
- ΠΑΝΤΑ backup πριν schema changes
- ΠΑΝΤΑ step-by-step με confirmation
- Νέα containers σε ξεχωριστούς φακέλους + ports
- Bind σε 127.0.0.1 (όχι 0.0.0.0)
- DB user plugmenow: grants μόνο από 172.17.0.1
- Ο Contabo τρέχει πολλά services — isolation critical

---

## 6. Known Issues / Gotchas

1. **Station IDs πρέπει ΠΑΝΤΑ να είναι coordinate-based** (`myfahi-{lat}_{lng}`). Τα ΜΥΦΑΗ location_ids (base64) αλλάζουν μεταξύ fetches.
2. **Google OAuth δεν δουλεύει σε localhost** (origin_mismatch). Test με email login ή deploy first.
3. **`.detail-cache.json` ΠΟΤΕ δεν σβήνεται** — rebuild διαρκεί ώρες λόγω API throttling.
4. **git pull στον Contabo** χρειάζεται `git config --global --add safe.directory` πρώτα.
5. **Cron folder (`/opt/containers/plugmenow-api/cron/`)** μπορεί να αδειάσει κατά git operations — verify μετά κάθε deploy.
6. **PHOTO_DIR** στο API .env πρέπει να είναι `/data/photos` (ΟΧΙ `/data/plugmenow/photos`).
7. **Keystore password** του TWA signing key δεν είναι γνωστό — **δεν είναι blocking**, Play App Signing είναι ενεργό. Νέο keystore αν χρειαστεί rebuild.
8. **Frontend deploy rsync** πρέπει να κάνει exclude `.well-known` (assetlinks) ΚΑΙ `data/stations.json` (n8n cron output).
9. **AssetLinks** πρέπει να περιέχει ΔΥΟ SHA-256 fingerprints (original keystore + Google Play signing key).
10. **nginx vhost `client_max_body_size`** πρέπει να είναι ≥20M (αλλιώς photo uploads >1MB σπάνε με 413). Plesk panel → Domain → Apache & nginx settings → Additional nginx directives.

---

## 7. Play Store Reference

### Console
- URL: https://play.google.com/console
- Account: AiSmartly (organization)
- Email: dev@aismartly.gr
- App package: `gr.viralev.plugmenow`

### Signing keys
- Upload key (local keystore): `F2:22:7F:1A:C2:9C:1E:B5:70:3D:EA:A3:56:65:18:1B:24:B9:68:2F:1E:A8:82:C0:78:DB:DA:50:69:34:5C:86`
- App signing key (Google): `8D:EC:64:06:23:95:93:25:DB:1C:E0:4D:F0:1C:FF:77:2C:FA:08:6F:E9:8A:5F:1A:AD:E5:AF:30:9E:14:7A:40`

### Versioning (για future updates)
```bash
cd /media/eleftheria/DataSSD/Projects/ChargeGr
# Edit twa-manifest.json: appVersionCode ++ (must be monotonically increasing)
bubblewrap update && bubblewrap build
# Upload new AAB to Play Console
```

### Files
- AAB: `/media/eleftheria/DataSSD/Projects/ChargeGr/app-release-bundle.aab`
- APK (sideload): `/media/eleftheria/DataSSD/Projects/ChargeGr/app-release-signed.apk`
- Keystore: `/media/eleftheria/DataSSD/Projects/ChargeGr/android.keystore` (alias: android, password: UNKNOWN)
- TWA manifest: `/media/eleftheria/DataSSD/Projects/ChargeGr/twa-manifest.json`
- Store assets: `/media/eleftheria/DataSSD/Projects/ChargeGr/playstore-assets/`
