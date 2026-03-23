# Phase 3: Backend + Community Features

## Στόχος
Πρόσθεσε user accounts, reviews, φωτογραφίες, check-ins,
και reliability scores στο PlugMeNow. Μετάβαση από static σε dynamic app.

## Προαπαιτούμενα
- Phase 1 & 2 deployed και λειτουργικά
- Τουλάχιστον 100+ ενεργοί χρήστες (validation ζήτησης)
- Supabase account (δωρεάν) ή VPS budget (~10-20€/μήνα)

## Μαθήματα από Phase 1
- Τα ΜΥΦΑΗ data είναι αξιόπιστα (3.810 σταθμοί, 100% addresses)
- Το OCM API έχει περιοδικά timeouts (HTTP 524) — χρειάζεται fallback
- Τα δεδομένα χρειάζονται normalization (power kW, operator names)
- Dark mode σε Firefox χρειάζεται προσοχή (system preference conflicts)
- Mobile top bar χρειάζεται adaptive layout <640px

## Backend Strategy: Supabase

**Γιατί Supabase:**
- Free tier αρκεί για αρχή (50.000 requests/μήνα, 500MB database)
- Built-in Auth (Google, email)
- PostgreSQL + PostGIS (geospatial queries)
- Storage για φωτογραφίες (1GB free)
- Real-time subscriptions
- REST APIs αυτόματα
- Δεν χρειάζεται server management

**Εναλλακτική:** Self-hosted Supabase σε Hetzner VPS (5€/μήνα)

---

## Task 3.1: Supabase Project Setup

**Εντολή στο Claude Code:**
```
Διάβασε τα README.md και PHASE-3-COMMUNITY.md.
Ρύθμισε Supabase project για PlugMeNow.
1. Δημιούργησε SQL schema για:
   - profiles (user info, selected vehicle)
   - reviews (rating 1-5, text, station_id, user_id)
   - photos (station_id, user_id, url, caption)
   - check_ins (station_id, user_id, was_working, connector_used)
   - favorites (user_id, station_id)
   - station_corrections (crowdsourced data fixes)
2. Enable PostGIS extension
3. Create Row Level Security policies
4. Enable Google Auth provider
```

**Database Schema:**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  selected_vehicle_id TEXT,
  preferred_language TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  was_working BOOLEAN,
  wait_time_minutes SMALLINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Photos
CREATE TABLE public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  storage_path TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Check-ins
CREATE TABLE public.check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  was_working BOOLEAN NOT NULL,
  connector_used TEXT,
  charging_speed_kw REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favorites
CREATE TABLE public.favorites (
  user_id UUID REFERENCES auth.users(id),
  station_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, station_id)
);

-- Station corrections
CREATE TABLE public.station_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  field_name TEXT NOT NULL,
  suggested_value TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_reviews_station ON reviews(station_id);
CREATE INDEX idx_checkins_station ON check_ins(station_id);
CREATE INDEX idx_checkins_recent ON check_ins(created_at DESC);

-- Reliability view
CREATE VIEW public.station_reliability AS
SELECT
  station_id,
  COUNT(*) as total_checkins,
  COUNT(*) FILTER (WHERE was_working) as working_count,
  ROUND(COUNT(*) FILTER (WHERE was_working)::numeric / NULLIF(COUNT(*), 0) * 100) as reliability_pct,
  MAX(created_at) as last_checkin
FROM check_ins
WHERE created_at > now() - INTERVAL '90 days'
GROUP BY station_id;

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users write own" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read" ON check_ins FOR SELECT USING (true);
CREATE POLICY "Users write own" ON check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users write own" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own" ON favorites FOR DELETE USING (auth.uid() = user_id);
```

---

## Task 3.2: Supabase Client Integration

**Εντολή στο Claude Code:**
```
Εγκατέστησε @supabase/supabase-js.
Δημιούργησε Supabase client στο src/lib/supabase.ts.
Δημιούργησε hooks: useAuth, useReviews, usePhotos, useCheckIn,
useFavorites, useStationScore.
Environment variables σε .env.local.
```

---

## Task 3.3: Auth UI

**Εντολή στο Claude Code:**
```
Δημιούργησε Auth components:
LoginButton στο header, LoginModal (Google + email),
UserMenu (avatar, settings, logout), Profile page.
```

---

## Task 3.4: Reviews + Task 3.5: Photos + Task 3.6: Check-ins

**Εντολή στο Claude Code (μπορούν μαζί):**
```
Πρόσθεσε στο StationCard:
1. Reviews: αστέρια 1-5, σχόλιο, "Λειτουργούσε;" toggle
2. Photos: gallery horizontal scroll, upload με auto-resize
3. Check-ins: FAB "Φόρτιζα εδώ" κοντά σε σταθμό (<200m),
   quick form + confetti animation
4. Εμφάνιση τελευταίου check-in: "πριν 2 ώρες — Λειτουργούσε ✓"
```

---

## Task 3.7: Favorites

**Εντολή στο Claude Code:**
```
Πρόσθεσε favorites: καρδιά icon toggle, favorites list
στο menu, ξεχωριστό ★ icon στο χάρτη.
```

---

## Task 3.8: Reliability Scores

**Εντολή στο Claude Code:**
```
Υπολόγισε reliability score (check-ins 90 ημερών):
πράσινο >80%, κίτρινο 50-80%, κόκκινο <50%.
Εμφάνισε στο station card + marker attribute.
Φίλτρο "Μόνο αξιόπιστοι (>80%)".
```

---

## Task 3.9: Automated Data Refresh (n8n)

**Εντολή στο Claude Code:**
```
Δημιούργησε n8n workflow JSON:
1. Cron: κάθε 6 ώρες
2. Execute: node scripts/fetch-stations.js
3. Build: npm run build
4. Deploy: FTP upload /out/* στο Plesk
Δώσε μου JSON για import στο n8n.
```

**ΣΗΜΕΙΩΣΗ:** Ήδη υπάρχει n8n instance.
Fallback αν OCM API αποτύχει: κράτα OCM-only σταθμούς
από προηγούμενο stations.json (ήδη υλοποιημένο).

---

## Task 3.10: WordPress Embed (viralev.gr)

**Εντολή στο Claude Code:**
```
Δημιούργησε WordPress plugin plugmenow-embed:
Shortcode [plugmenow] → responsive iframe.
Mobile: full-screen, Desktop: iframe σε WordPress layout.
```

---

## Checklist Phase 3

- [ ] Supabase project configured
- [ ] Auth working (Google + email)
- [ ] Reviews: write, read, display avg rating
- [ ] Photos: upload, gallery, thumbnails
- [ ] Check-ins: submit, display last check-in
- [ ] Reliability scores displayed
- [ ] Favorites: add, remove, list, map icons
- [ ] n8n data refresh running κάθε 6 ώρες
- [ ] WordPress embed functional
- [ ] Supabase free tier limits monitored
