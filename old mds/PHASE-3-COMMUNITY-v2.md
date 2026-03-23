# Phase 3: Backend + Community Features (Αναθεωρημένο)

## Στόχος
Πρόσθεσε user accounts, reviews, φωτογραφίες, check-ins,
και reliability scores στο PlugMeNow. Μετάβαση από static σε dynamic app.

## Προαπαιτούμενα
- ✅ Phase 1 & 2 deployed και λειτουργικά
- ✅ Contabo VPS με MariaDB, Redis, n8n, Docker
- ✅ Plesk server για static hosting (chargegr.viralev.gr)
- ✅ 1.321 EV μοντέλα, 74 brands, 3.810 σταθμοί

## Μαθήματα από Phase 1 & 2
- Τα ΜΥΦΑΗ data είναι αξιόπιστα (3.810 σταθμοί, 100% addresses)
- Το OCM API έχει περιοδικά timeouts (HTTP 524) — χρειάζεται fallback
- Τα δεδομένα χρειάζονται normalization (power kW, operator names)
- Bubblewrap TWA δουλεύει — APK + AAB ready
- Vehicle data αναβαθμίστηκε σε 1.321 μοντέλα με cascading selector

---

## Αρχιτεκτονική

### Γιατί self-hosted αντί Supabase
- Ήδη πληρώνουμε τον Contabo VPS — κόστος 0€ extra
- MariaDB, Redis, Docker, n8n ήδη τρέχουν
- Πλήρης έλεγχος δεδομένων
- 12 cores, 47GB RAM, load <0.2 — τεράστια περίσσεια
- Εύκολη μεταφορά αργότερα αν χρειαστεί (SQL export)

### Δομή

```
┌─────────────────────────────────────┐
│  Plesk Server (viralev.gr)          │
│  Static files: chargegr.viralev.gr  │
│  - Next.js static export            │
│  - stations.json, vehicles.json     │
│  - .well-known/assetlinks.json      │
└──────────────┬──────────────────────┘
               │ API calls (HTTPS)
┌──────────────▼──────────────────────┐
│  Contabo VPS                        │
│  ┌─────────────┐ ┌───────────────┐  │
│  │ API (Docker) │ │  MariaDB      │  │
│  │ Node.js      │ │  plugmenow db │  │
│  │ Express/     │ │               │  │
│  │ Fastify      │ │               │  │
│  └──────┬──────┘ └───────────────┘  │
│         │                            │
│  ┌──────▼──────┐ ┌───────────────┐  │
│  │ n8n          │ │  Redis        │  │
│  │ Automation   │ │  Sessions +   │  │
│  │              │ │  Cache        │  │
│  └─────────────┘ └───────────────┘  │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ Photo Storage (filesystem)      │ │
│  │ /var/data/plugmenow/photos/     │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### API Subdomain
- URL: `api.plugmenow.gr` ή `plugmenow-api.viralev.gr`
- Reverse proxy μέσω nginx στον Contabo
- SSL μέσω Let's Encrypt
- CORS: allow chargegr.viralev.gr

---

## Task 3.1: MariaDB Schema Setup

**Εντολή στο Claude Code:**
```
Διάβασε τα README.md και PHASE-3-COMMUNITY.md.
Δημιούργησε SQL schema file (scripts/db-schema.sql) για MariaDB
με τα παρακάτω tables. ΠΡΟΣΟΧΗ: MariaDB syntax, όχι PostgreSQL.
```

**Database: plugmenow**
```sql
CREATE DATABASE IF NOT EXISTS plugmenow
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE plugmenow;

-- Users (Google Sign-In)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  google_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  selected_vehicle_id VARCHAR(100),
  preferred_language ENUM('el', 'en') DEFAULT 'el',
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  was_working BOOLEAN,
  wait_time_minutes SMALLINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_station (station_id),
  INDEX idx_user (user_id),
  INDEX idx_created (created_at DESC)
);

-- Photos
CREATE TABLE photos (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  thumbnail_filename VARCHAR(255),
  caption VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_station (station_id)
);

-- Check-ins
CREATE TABLE check_ins (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  was_working BOOLEAN NOT NULL,
  connector_used VARCHAR(50),
  charging_speed_kw DECIMAL(6,1),
  comment VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_station (station_id),
  INDEX idx_recent (created_at DESC)
);

-- Favorites
CREATE TABLE favorites (
  user_id VARCHAR(36) NOT NULL,
  station_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, station_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Station corrections (crowdsourced fixes)
CREATE TABLE station_corrections (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  field_name VARCHAR(50) NOT NULL,
  suggested_value TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  reviewed_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Vehicle suggestions (community)
CREATE TABLE vehicle_suggestions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  battery_kwh DECIMAL(5,1),
  max_charging_kw DECIMAL(5,1),
  connector_type VARCHAR(50),
  source_url VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reliability view (MariaDB syntax)
CREATE OR REPLACE VIEW station_reliability AS
SELECT
  station_id,
  COUNT(*) as total_checkins,
  SUM(CASE WHEN was_working THEN 1 ELSE 0 END) as working_count,
  ROUND(SUM(CASE WHEN was_working THEN 1 ELSE 0 END) / COUNT(*) * 100) as reliability_pct,
  MAX(created_at) as last_checkin
FROM check_ins
WHERE created_at > DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY station_id;

-- Average ratings view
CREATE OR REPLACE VIEW station_ratings AS
SELECT
  station_id,
  COUNT(*) as total_reviews,
  ROUND(AVG(rating), 1) as avg_rating,
  SUM(CASE WHEN was_working THEN 1 ELSE 0 END) as working_reports,
  SUM(CASE WHEN was_working = FALSE THEN 1 ELSE 0 END) as not_working_reports
FROM reviews
GROUP BY station_id;
```

---

## Task 3.2: API Setup (Docker)

**Εντολή στο Claude Code:**
```
Δημιούργησε Node.js API project σε φάκελο plugmenow-api/:
1. Express ή Fastify (lightweight)
2. Endpoints:
   - POST /auth/google — Google Sign-In verify + JWT
   - GET /auth/me — current user
   - GET /stations/:id/reviews — λίστα reviews
   - POST /stations/:id/reviews — νέο review (auth required)
   - GET /stations/:id/checkins — λίστα check-ins
   - POST /stations/:id/checkins — νέο check-in (auth required)
   - GET /stations/:id/photos — λίστα photos
   - POST /stations/:id/photos — upload photo (auth required)
   - GET /user/favorites — λίστα favorites (auth required)
   - POST /user/favorites/:stationId — toggle favorite (auth required)
   - DELETE /user/favorites/:stationId — remove favorite (auth required)
   - GET /stations/:id/score — reliability + rating
3. JWT middleware για auth
4. Rate limiting με Redis
5. CORS config για chargegr.viralev.gr
6. Photo upload: multer + sharp (resize, thumbnail)
7. Dockerfile + docker-compose.yml
8. Environment variables σε .env
```

**docker-compose.yml (στον Contabo):**
```yaml
version: '3.8'
services:
  plugmenow-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=host.docker.internal
      - DB_NAME=plugmenow
      - DB_USER=plugmenow
      - DB_PASS=${DB_PASS}
      - REDIS_URL=redis://host.docker.internal:6379
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - PHOTO_DIR=/data/photos
    volumes:
      - /var/data/plugmenow/photos:/data/photos
    restart: unless-stopped
```

---

## Task 3.3: Google Sign-In

**Εντολή στο Claude Code:**
```
Πρόσθεσε Google Sign-In στο frontend:
1. Google Identity Services (GSI) library
2. Κουμπί "Σύνδεση με Google" στο header
3. Μετά το login: JWT token αποθηκεύεται σε localStorage
4. UserMenu component: avatar, "Τα αγαπημένα μου", logout
5. Auth context/store σε Zustand
6. i18n: "Σύνδεση"/"Sign in", "Αποσύνδεση"/"Sign out"

ΣΗΜΑΝΤΙΚΟ: Χρειάζεται Google Cloud Console project + OAuth client ID.
Θα δώσω εγώ τα credentials αργότερα — χρησιμοποίησε placeholder
GOOGLE_CLIENT_ID στο .env.local.
```

**Google Cloud Console setup (χειροκίνητα):**
1. https://console.cloud.google.com → New Project "PlugMeNow"
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Authorized origins: https://chargegr.viralev.gr
4. Authorized redirects: https://chargegr.viralev.gr
5. Αντέγραψε Client ID στο .env.local

---

## Task 3.4: Reviews

**Εντολή στο Claude Code:**
```
Πρόσθεσε reviews στο StationCard:
1. Εμφάνιση: μέσος όρος αστεριών + αριθμός reviews
2. Λίστα reviews: avatar, όνομα, αστέρια, σχόλιο, ημερομηνία
3. "Γράψε κριτική" button (μόνο logged in)
4. Review form: αστέρια 1-5 (tap), σχόλιο (textarea),
   "Λειτουργούσε;" toggle, "Χρόνος αναμονής" (optional)
5. Ένα review ανά χρήστη ανά σταθμό (μπορεί να ενημερώσει)
6. i18n σε όλα τα νέα texts
```

---

## Task 3.5: Check-ins

**Εντολή στο Claude Code:**
```
Πρόσθεσε check-in system:
1. FAB button "Φόρτιζα εδώ" (μόνο αν ο χρήστης είναι
   κοντά σε σταθμό <500m — χρησιμοποίησε geolocation)
2. Quick form: "Λειτουργούσε;" (Yes/No), connector, σχόλιο
3. Εμφάνιση στο station card: τελευταίο check-in
   "πριν 2 ώρες — Λειτουργούσε ✓ (CCS2)"
4. Confetti animation μετά submit (fun UX)
5. Max 1 check-in ανά χρήστη ανά σταθμό ανά 4 ώρες
6. i18n
```

---

## Task 3.6: Photos

**Εντολή στο Claude Code:**
```
Πρόσθεσε photo upload + gallery:
1. Στο station card: horizontal photo gallery (scroll)
2. "Πρόσθεσε φωτογραφία" button (μόνο logged in)
3. Upload: accept image/*, max 5MB
4. Server-side: resize σε max 1200px width, thumbnail 300px
5. Storage: filesystem στο /var/data/plugmenow/photos/
6. URL pattern: /api/photos/{station_id}/{filename}
7. Lightbox για full-size view
8. Max 5 photos ανά χρήστη ανά σταθμό
```

---

## Task 3.7: Favorites

**Εντολή στο Claude Code:**
```
Πρόσθεσε favorites system:
1. Καρδιά icon (♡/♥) toggle στο station card header
2. Στο menu: "Τα αγαπημένα μου" → λίστα favorites
3. Στο χάρτη: ξεχωριστό ★ icon για favorite stations
4. Sync με server (POST/DELETE /user/favorites)
5. Offline fallback: localStorage cache
6. i18n: "Αγαπημένα"/"Favorites"
```

---

## Task 3.8: Reliability Scores

**Εντολή στο Claude Code:**
```
Υπολόγισε reliability score από check-ins (90 ημερών):
1. API endpoint: GET /stations/:id/score
   → { reliability_pct, total_checkins, avg_rating, total_reviews }
2. Frontend badge στο station card:
   - Πράσινο >80%: "Αξιόπιστος"
   - Κίτρινο 50-80%: "Μέτριος"
   - Κόκκινο <50%: "Προβληματικός"
   - Γκρι: "Χωρίς δεδομένα" (<3 check-ins)
3. Φίλτρο στο FilterPanel: "Μόνο αξιόπιστοι (>80%)"
4. Στο marker tooltip: mini badge
```

---

## Task 3.9: Automated Data Refresh (n8n)

**Εντολή στο Claude Code:**
```
Δημιούργησε n8n workflow JSON:
1. Cron trigger: κάθε 6 ώρες (0 */6 * * *)
2. SSH στο Kubuntu ή HTTP webhook:
   - node scripts/fetch-stations.js
   - npm run build
3. SFTP/rsync upload /out/* στο Plesk
4. Notification: email αν αποτύχει
Δώσε μου JSON για import στο n8n.
```

**ΣΗΜΕΙΩΣΗ:** Το n8n τρέχει ήδη στον Contabo.
Ο fetch-stations.js τρέχει στο Kubuntu (dev machine).
Εναλλακτικά: μεταφορά του script στον Contabo.

---

## Task 3.10: Vehicle Admin Panel

**Εντολή στο Claude Code:**
```
Δημιούργησε admin panel (μόνο για role='admin'):
1. Endpoint: GET /admin/vehicles — λίστα vehicles
2. Endpoint: POST /admin/vehicles — add vehicle
3. Endpoint: PUT /admin/vehicles/:id — edit vehicle
4. Endpoint: DELETE /admin/vehicles/:id — delete vehicle
5. Endpoint: GET /admin/suggestions — pending vehicle suggestions
6. Endpoint: POST /admin/suggestions/:id/approve — approve + add
7. Simple web UI: table, add form, edit form
8. Bulk import from JSON
9. Export to JSON (αντικαθιστά public/data/vehicles.json)
```

---

## Task 3.11: WordPress Embed (viralev.gr)

**Εντολή στο Claude Code:**
```
Δημιούργησε WordPress plugin plugmenow-embed:
Shortcode [plugmenow] → responsive iframe.
Mobile: full-screen, Desktop: iframe σε WordPress layout.
URL: https://chargegr.viralev.gr
```

---

## Σειρά Υλοποίησης (προτεινόμενη)

### Sprint 1: Backend Foundation (1-2 εβδομάδες)
1. Task 3.1: MariaDB schema
2. Task 3.2: API setup (Docker)
3. Task 3.3: Google Sign-In

### Sprint 2: Community Features (2-3 εβδομάδες)
4. Task 3.7: Favorites (απλούστερο, ξεκινάμε με αυτό)
5. Task 3.4: Reviews
6. Task 3.5: Check-ins
7. Task 3.8: Reliability scores

### Sprint 3: Media + Automation (1-2 εβδομάδες)
8. Task 3.6: Photos
9. Task 3.9: n8n automation
10. Task 3.10: Vehicle admin panel

### Sprint 4: Integration (1 εβδομάδα)
11. Task 3.11: WordPress embed
12. Bug fixes, performance, testing

---

## Κόστος Phase 3

| Στοιχείο | Κόστος |
|----------|--------|
| Contabo VPS | 0€ (ήδη πληρώνεται) |
| MariaDB | 0€ (ήδη τρέχει) |
| Redis | 0€ (ήδη τρέχει) |
| n8n | 0€ (ήδη τρέχει) |
| Google Sign-In | 0€ (δωρεάν) |
| Photo storage | 0€ (filesystem) |
| SSL | 0€ (Let's Encrypt) |
| **Σύνολο** | **0€/μήνα** |

---

## Migration Path (αν χρειαστεί)

Αν η εφαρμογή αποκτήσει >10.000 χρήστες:
1. **Database:** MariaDB → managed MySQL (Hetzner/DigitalOcean) ή PostgreSQL
2. **API:** Docker container → Kubernetes ή managed platform
3. **Photos:** Filesystem → S3-compatible storage (Backblaze B2, Cloudflare R2)
4. **CDN:** Cloudflare δωρεάν tier μπροστά από Plesk

Η μεταφορά είναι εύκολη γιατί:
- SQL schema μεταφέρεται απευθείας
- API είναι stateless (JWT)
- Photos είναι static files

---

## Checklist Phase 3

- [ ] MariaDB schema deployed στον Contabo
- [ ] API running σε Docker container
- [ ] Google Sign-In working
- [ ] Auth: login, logout, JWT tokens
- [ ] Favorites: add, remove, list, map icons
- [ ] Reviews: write, read, display avg rating
- [ ] Check-ins: submit, display last check-in
- [ ] Photos: upload, gallery, thumbnails
- [ ] Reliability scores displayed
- [ ] n8n data refresh running κάθε 6 ώρες
- [ ] Vehicle admin panel functional
- [ ] WordPress embed working
- [ ] CORS + rate limiting configured
- [ ] All new text has i18n (EL + EN)
