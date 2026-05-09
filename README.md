# PlugMeNow - Βρες φορτιστή, τώρα!

## Σύνοψη Project

Ελληνική cross-network εφαρμογή εύρεσης σταθμών φόρτισης ηλεκτρικών αυτοκινήτων.
PWA-first, deployed στο `chargegr.viralev.gr`, με μετατροπή σε Android app μέσω TWA.

**Live:** https://chargegr.viralev.gr
**GitHub:** https://github.com/eleftheria74/chargegr
**Developer:** AiSmartly (dev@aismartly.gr) — brand: ViralEV
**Play Store:** `gr.viralev.plugmenow` — submitted to Production, pending Google review

## Τρέχουσα Κατάσταση (Μάιος 2026)

| Μετρική | Τιμή |
|---------|------|
| Σταθμοί φόρτισης | ~4.000 (ΜΥΦΑΗ + OCM) |
| Μοντέλα EV | 1.321 από 74 brands |
| Δίκτυα | 16 (NRG, DEI Blue, Blink, Joltie...) |
| Γλώσσες | Ελληνικά + Αγγλικά |
| Platforms | PWA + Android TWA |

## Tech Stack

| Layer | Τεχνολογία | Λόγος |
|-------|-----------|-------|
| Framework | Next.js 14 (static export) | SSG, γρήγορο, Claude Code friendly |
| Maps | MapLibre GL JS + OpenFreeMap tiles | 100% δωρεάν, χωρίς API keys |
| Data | ΜΥΦΑΗ API + OpenChargeMap API | Δωρεάν, ανοιχτά δεδομένα |
| Styling | Tailwind CSS | Utility-first, responsive |
| Icons | Lucide React | Ελαφρύ, consistent |
| State | Zustand | Minimal, χωρίς boilerplate |
| i18n | Custom I18nProvider | EL/EN support, localStorage |
| Hosting | Plesk (static files) | Ήδη υπάρχει για viralev.gr |
| Android | Bubblewrap (TWA) | Ίδιο PWA → Play Store |
| Backend (Phase 3) | Supabase | Free tier, auth, PostgreSQL, storage |

## Φάσεις Ανάπτυξης

| Φάση | Αρχείο | Κατάσταση | Κόστος |
|------|--------|-----------|--------|
| Phase 1 MVP | [PHASE-1-MVP.md](./PHASE-1-MVP.md) | ✅ Ολοκληρώθηκε | 0€ |
| Phase 1 Status | [PHASE-1-STATUS.md](./PHASE-1-STATUS.md) | 📋 Αναφορά | - |
| Phase 2 Android | [PHASE-2-ANDROID.md](./PHASE-2-ANDROID.md) | ✅ Ολοκληρώθηκε (Play Store submitted, pending review) | 25$ |
| Phase 3 Community | [PHASE-3-COMMUNITY.md](./PHASE-3-COMMUNITY.md) | ⏳ Μελλοντικό | 10-20€/μήνα |
| Phase 4 Scale | [PHASE-4-SCALE.md](./PHASE-4-SCALE.md) | ⏳ Μελλοντικό | Variable |

## Οδηγίες Claude Code

Βλέπε [CLAUDE-CODE-GUIDE.md](./CLAUDE-CODE-GUIDE.md) για αναλυτικές οδηγίες.

```bash
# Πάντα δίνε context στο Claude Code
claude "Διάβασε τα αρχεία README.md και PHASE-X-YYY.md. Εκτέλεσε το Task X.Y"

# Για μεγάλα prompts αποθήκευσε σε αρχείο
nano fix-prompt.txt
# Στο Claude Code: "Διάβασε το fix-prompt.txt και εκτέλεσε τις οδηγίες"
```

## Quick Commands

```bash
# Development
cd /media/eleftheria/DataSSD/Projects/ChargeGr/chargegr
npm run dev

# Update data
node scripts/fetch-stations.js

# Build & deploy frontend
npm run build
rsync -avz --delete --exclude='.well-known' --exclude='data/stations.json' \
  out/ root@194.60.87.107:/var/www/vhosts/viralev.gr/chargegr.viralev.gr/

# Git
cd /media/eleftheria/DataSSD/Projects/ChargeGr
git add <specific-files> && git commit -m "message" && git push
```

## Project Structure

```
ChargeGr/                          # Root folder
├── *.md                            # Spec files
└── chargegr/                       # Next.js project
    ├── public/data/stations.json   # 3.810 σταθμοί (1.77 MB)
    ├── public/data/vehicles.json   # 119 μοντέλα EV
    ├── scripts/fetch-stations.js   # Data fetcher (ΜΥΦΑΗ + OCM)
    ├── src/components/             # React components
    ├── src/lib/                    # Types, utils, i18n
    └── src/store/appStore.ts       # Zustand state
```
