# Phase 3: Backend + Community Features

## Στόχος
Πρόσθεσε user accounts, reviews, φωτογραφίες, check-ins,
και reliability scores. Μετάβαση από static app σε dynamic.

## Προαπαιτούμενα
- Phase 1 & 2 deployed και λειτουργικά
- Τουλάχιστον 100+ ενεργοί χρήστες (validation ζήτησης)
- Supabase account (δωρεάν) ή VPS budget (~10-20€/μήνα)

## Backend Strategy: Supabase

**Γιατί Supabase αντί custom backend:**
- Free tier αρκεί για αρχή (50.000 requests/μήνα, 500MB database)
- Built-in Auth (Google, email)
- PostgreSQL + PostGIS (geospatial queries)
- Storage για φωτογραφίες (1GB free)
- Real-time subscriptions
- REST + GraphQL APIs αυτόματα
- Δεν χρειάζεται να διαχειρίζεσαι server

**Εναλλακτική (αν χρειαστεί):** Self-hosted Supabase σε Hetzner VPS (5€/μήνα)
ή Contabo VPS. Μπορεί να γίνει με docker compose.

---

## Task 3.1: Supabase Project Setup

**Εντολή στο Claude Code:**
```
Ρύθμισε Supabase project για ChargeGR.
1. Δημιούργησε SQL schema για:
   - users (profile info, selected vehicle)
   - reviews (rating 1-5, text, station_id, user_id)
   - photos (station_id, user_id, url, caption)
   - check_ins (station_id, user_id, timestamp, was_working, connector_used)
   - favorites (user_id, station_id)
   - station_corrections (user_id, station_id, field, suggested_value)
2. Enable PostGIS extension
3. Create Row Level Security policies
4. Enable Google Auth provider
```

**Database Schema:**
```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  selected_vehicle_id TEXT,    -- References vehicle from local DB
  preferred_language TEXT DEFAULT 'el',
  show_on_leaderboard BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,         -- ID from ΜΥΦΑΗ or OCM
  station_source TEXT NOT NULL,     -- 'myfahi' or 'ocm'
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  was_working BOOLEAN,              -- Λειτουργούσε;
  wait_time_minutes SMALLINT,       -- Χρόνος αναμονής
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Photos
CREATE TABLE public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  station_source TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  storage_path TEXT NOT NULL,        -- Supabase storage path
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Check-ins (lightweight — "ήμουν εδώ")
CREATE TABLE public.check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  station_source TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  was_working BOOLEAN NOT NULL,
  connector_used TEXT,               -- connector type
  charging_speed_kw REAL,            -- actual measured speed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favorites
CREATE TABLE public.favorites (
  user_id UUID REFERENCES auth.users(id),
  station_id TEXT NOT NULL,
  station_source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, station_id, station_source)
);

-- Station corrections (crowdsourced data fixes)
CREATE TABLE public.station_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  station_source TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  field_name TEXT NOT NULL,          -- π.χ. 'is_operational', 'has_type2', 'is_free'
  suggested_value TEXT NOT NULL,
  status TEXT DEFAULT 'pending',     -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_reviews_station ON reviews(station_id, station_source);
CREATE INDEX idx_photos_station ON photos(station_id, station_source);
CREATE INDEX idx_checkins_station ON check_ins(station_id, station_source);
CREATE INDEX idx_checkins_recent ON check_ins(created_at DESC);

-- View: Station reliability score
CREATE VIEW public.station_reliability AS
SELECT
  station_id,
  station_source,
  COUNT(*) as total_checkins,
  COUNT(*) FILTER (WHERE was_working = true) as working_count,
  ROUND(
    COUNT(*) FILTER (WHERE was_working = true)::numeric /
    NULLIF(COUNT(*), 0) * 100
  ) as reliability_pct,
  AVG(r.rating) as avg_rating,
  COUNT(DISTINCT r.id) as review_count,
  MAX(ci.created_at) as last_checkin
FROM check_ins ci
LEFT JOIN reviews r ON r.station_id = ci.station_id
  AND r.station_source = ci.station_source
WHERE ci.created_at > now() - INTERVAL '90 days'
GROUP BY ci.station_id, ci.station_source;

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_corrections ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read all, write own
CREATE POLICY "Public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users write own" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users edit own" ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public read" ON photos FOR SELECT USING (true);
CREATE POLICY "Users write own" ON photos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read" ON check_ins FOR SELECT USING (true);
CREATE POLICY "Users write own" ON check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users write own" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own" ON favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read own" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users edit own" ON profiles FOR UPDATE USING (auth.uid() = id);
```

---

## Task 3.2: Supabase Client Integration

**Εντολή στο Claude Code:**
```
Εγκατέστησε @supabase/supabase-js.
Δημιούργησε Supabase client στο src/lib/supabase.ts.
Δημιούργησε hooks:
- useAuth() — login/logout/user state
- useReviews(stationId) — fetch & add reviews
- usePhotos(stationId) — fetch & upload photos
- useCheckIn() — quick check-in action
- useFavorites() — add/remove/list favorites
- useStationScore(stationId) — reliability + rating
Environment variables σε .env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).
```

---

## Task 3.3: Auth UI

**Εντολή στο Claude Code:**
```
Δημιούργησε Auth components:
1. LoginButton — εμφανίζεται στο header
2. LoginModal — Google sign-in + email/password
3. UserMenu — avatar, settings, logout
4. Χρησιμοποίησε Supabase Auth UI ή custom form
5. Redirect μετά login στο χάρτη
6. Profile page: αλλαγή ονόματος, αλλαγή οχήματος
```

---

## Task 3.4: Review Component

**Εντολή στο Claude Code:**
```
Πρόσθεσε στο StationCard:
1. Μέση βαθμολογία (αστέρια 1-5) + αριθμός reviews
2. "Γράψε κριτική" button (μόνο για logged-in users)
3. ReviewForm: rating stars + textarea + "Λειτουργούσε;" toggle
4. ReviewList: λίστα κριτικών με avatar, date, rating
5. Sort by: newest / highest / lowest
```

---

## Task 3.5: Photo Upload

**Εντολή στο Claude Code:**
```
Πρόσθεσε στο StationCard:
1. Φωτογραφίες gallery (horizontal scroll)
2. "Προσθήκη φωτογραφίας" button (camera + gallery picker)
3. Upload σε Supabase Storage (bucket: station-photos)
4. Auto-resize: max 1200px πλάτος, JPEG 80% quality
5. Thumbnail generation: 200px
6. Moderation: νέες φωτό εμφανίζονται αμέσως αλλά
   μπορούν να αναφερθούν (report button)
```

---

## Task 3.6: Check-in System

**Εντολή στο Claude Code:**
```
Δημιούργησε quick check-in:
1. FAB button "Φόρτιζα εδώ" εμφανίζεται κοντά σε σταθμό
   (απόσταση <200m από geolocation)
2. Quick form: "Λειτουργούσε;" (✓/✗) + connector type + speed
3. Μετά check-in: confetti animation + "Ευχαριστούμε!"
4. Εμφάνιση τελευταίου check-in στο station card:
   "Τελευταίος έλεγχος: πριν 2 ώρες — Λειτουργούσε ✓"
5. Reliability badge βάσει check-ins τελευταίων 90 ημερών
```

---

## Task 3.7: Favorites System

**Εντολή στο Claude Code:**
```
Πρόσθεσε favorites:
1. Καρδιά icon σε κάθε station card (toggle)
2. Favorites list: accessible από το menu
3. Τα favorites εμφανίζονται στο χάρτη με ξεχωριστό icon (★)
4. Push notification αν ένα favorite station αλλάξει
   κατάσταση (π.χ. γίνει offline) — ΜΕΛΛΟΝΤΙΚΟ
```

---

## Task 3.8: Reliability Scores

**Εντολή στο Claude Code:**
```
Υπολόγισε reliability score ανά σταθμό:
1. Βάσει check-ins τελευταίων 90 ημερών
2. Σκορ: % φορές που λειτουργούσε
3. Visual: πράσινο (>80%), κίτρινο (50-80%), κόκκινο (<50%)
4. Εμφάνισε στο station card + ως attribute στα markers
5. Ενεργοποίησε φίλτρο "Μόνο αξιόπιστοι (>80%)"
```

---

## Task 3.9: Data Refresh with n8n

**Εντολή στο Claude Code:**
```
Δημιούργησε n8n workflow specification:
1. Κάθε 6 ώρες: fetch ΜΥΦΑΗ + OCM data
2. Merge & deduplicate
3. Σύγκρινε με cached version
4. Push updated JSON σε Supabase Storage ή webhook
5. Trigger PWA cache invalidation
Δώσε μου το workflow JSON για import στο n8n.
```

---

## Task 3.10: Embed στο viralev.gr

**Εντολή στο Claude Code:**
```
Δημιούργησε WordPress embed strategy:
1. iframe embed: <iframe src="https://chargegr.viralev.gr" ...>
2. Ή: WordPress page με custom template + responsive iframe
3. Shortcode [chargegr] που εμφανίζει το iframe
4. Mobile: full-screen iframe
5. Desktop: iframe μέσα σε WordPress layout
Δημιούργησε μικρό WordPress plugin chargegr-embed.
```

---

## Checklist Phase 3

- [ ] Supabase project configured
- [ ] Auth working (Google + email)
- [ ] Reviews: write, read, display avg rating
- [ ] Photos: upload, gallery, thumbnails
- [ ] Check-ins: submit, display last check-in
- [ ] Reliability scores calculated and displayed
- [ ] Favorites: add, remove, list, map icons
- [ ] n8n data refresh workflow running
- [ ] WordPress embed functional
- [ ] Mobile performance: <100ms interaction delay
- [ ] Supabase free tier limits monitored
