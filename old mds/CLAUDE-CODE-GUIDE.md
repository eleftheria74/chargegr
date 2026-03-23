# Οδηγός Χρήσης με Claude Code CLI

## Πώς να δουλεύεις με αυτά τα specs

### Βασικές αρχές

1. **Ένα task τη φορά.** Μην ζητάς "κάνε ολόκληρο το Phase 1".
   Ζήτα "Task 1.1: Project Setup" και περίμενε να ολοκληρωθεί.

2. **Δοκίμασε πριν προχωρήσεις.** Κάθε task έχει "Επαλήθευση".
   Τρέξε τον κώδικα, δες αν δουλεύει. Αν όχι, πες στο Claude Code
   τι ακριβώς δεν δουλεύει.

3. **Κράτα context.** Όταν ξεκινάς νέο session, πες στο Claude Code:
   "Δουλεύω στο ChargeGR project. Διάβασε το README.md και το
   PHASE-1-MVP.md. Είμαι στο Task 1.X."

4. **Commit συχνά.** Μετά κάθε task, κάνε git commit.

### Setup στο Kubuntu

```bash
# 1. Δημιούργησε project folder
mkdir ~/projects/chargegr
cd ~/projects/chargegr

# 2. Αντίγραψε τα spec files
cp -r /path/to/chargegr-specs/* .

# 3. Init git
git init
git add *.md
git commit -m "Initial specs"

# 4. Ξεκίνα Claude Code
claude
```

### Παραδείγματα εντολών

**Ξεκίνημα Phase 1:**
```
Διάβασε τα αρχεία README.md και PHASE-1-MVP.md.
Εκτέλεσε το Task 1.1: Project Setup.
Δημιούργησε το Next.js project με static export,
TypeScript, Tailwind CSS, και τα dependencies
που αναφέρονται στο spec.
```

**Μετά από error:**
```
Το npm run build αποτυγχάνει με error: [paste error].
Κοίτα τον κώδικα στο src/components/Map/MapContainer.tsx
και φτιάξε το.
```

**Για UI polish:**
```
Κοίτα το StationCard component. Θέλω:
1. Πιο στρογγυλεμένες γωνίες
2. Μεγαλύτερα κουμπιά (touch-friendly)
3. Dark mode support
4. Animation κατά το άνοιγμα (slide up)
```

**Για debugging:**
```
Όταν πατάω ένα marker στο χάρτη, δεν εμφανίζεται
το bottom sheet. Console δείχνει: [paste error].
Ο χάρτης χρησιμοποιεί MapLibre GL JS με GeoJSON source.
Κοίτα τον click handler στο MapContainer.tsx.
```

### Ροή εργασίας ημέρας

```
1. Άνοιξε terminal: cd ~/projects/chargegr
2. Start dev server: npm run dev
3. Άνοιξε Claude Code: claude
4. Πες: "Συνεχίζω με Task 1.X. Αυτό είναι το current state: [περιγραφή]"
5. Δούλεψε σε 1-2 tasks
6. Test σε browser (http://localhost:3000) + mobile (Chrome DevTools → Device mode)
7. Git commit: git add -A && git commit -m "Task 1.X complete"
8. Αν είναι ready: npm run build && deploy στο Plesk
```

### Αντιμετώπιση CORS problems

Τα APIs (ΜΥΦΑΗ, OCM) μπορεί να μπλοκάρουν browser requests.
Λύσεις κατά σειρά:

```
1. ΔΟΚΙΜΑΣΕ ΠΡΩΤΑ: Μήπως δουλεύει απευθείας;
   Δοκίμασε fetch στο browser console.

2. CORS PROXY (δωρεάν):
   Cloudflare Worker — 100.000 requests/day δωρεάν
   Δημιούργησε worker στο dash.cloudflare.com

3. BUILD-TIME FETCH:
   Αντί να κάνεις fetch runtime, φέρε δεδομένα στο build:
   - n8n workflow: fetch APIs → αποθήκευση JSON
   - Next.js getStaticProps (αν δεν κάνουμε full static)
   - Cron job: κάθε 6 ώρες → update public/data/stations.json

4. NGINX PROXY (στο Plesk):
   Πρόσθεσε reverse proxy rule στο Plesk:
   /api/myfahi/* → https://api.electrokinisi.yme.gov.gr/*
```

### Σημαντικές αποφάσεις

**Q: MapLibre ή Leaflet;**
A: MapLibre. Πιο γρήγορο (WebGL), vector tiles, clustering built-in.
   Leaflet είναι πιο απλό αλλά raster tiles = αργό + κόστος.

**Q: Next.js ή plain React;**
A: Next.js static export. Δίνει file-based routing, build-time
   optimization, και μελλοντική ευελιξία (SSR αν χρειαστεί).

**Q: Zustand ή Redux ή Context;**
A: Zustand. Minimal boilerplate, τέλειο για Claude Code,
   δεν χρειάζεται providers/wrappers.

**Q: Supabase ή Firebase;**
A: Supabase. PostgreSQL (real SQL), PostGIS, self-host option,
   better free tier, European servers. Firebase = Google lock-in.

**Q: Τι γίνεται αν αλλάξει το ΜΥΦΑΗ API;**
A: Fallback: static JSON + n8n refresh workflow.
   Τα δεδομένα φόρτισης δεν αλλάζουν κάθε λεπτό.
   Weekly refresh αρκεί για MVP.

### Git branching strategy

```bash
main          # Production — αυτό ανεβαίνει στο Plesk
├── dev       # Development — τρέχουσα εργασία
├── feat/map  # Feature branch — ένα feature τη φορά
└── fix/xyz   # Bugfix branch
```

### Χρήσιμες εντολές

```bash
# Τοπική ανάπτυξη
npm run dev                 # Start dev server
npm run build               # Build static site
npx serve out               # Test static build

# Deploy
rsync -avz ./out/ user@server:/path/to/chargegr.viralev.gr/

# Android
cd chargegr-android
bubblewrap build            # Build APK
bubblewrap install          # Test on device

# Git
git log --oneline -10       # Τελευταία commits
git diff                    # Τι άλλαξε
git stash                   # Αποθήκευσε προσωρινά changes
```
