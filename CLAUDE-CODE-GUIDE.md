# Οδηγός Χρήσης με Claude Code CLI — PlugMeNow

## Μαθήματα από Phase 1 (πραγματική εμπειρία)

### Τι δούλεψε καλά
- Claude Code δημιούργησε ολόκληρο Next.js project σε ~2 λεπτά
- MapLibre + OpenFreeMap τέλειο combo — μηδέν κόστος, μηδέν API keys
- Τα ΜΥΦΑΗ data είναι πλήρη (3.810 σταθμοί) και αξιόπιστα
- Ο vehicles.json approach (external JSON) ήταν σωστή επιλογή

### Τι χρειάστηκε προσοχή
- **Μεγάλα prompts:** Τα multi-line paste δεν δουλεύουν εύκολα στο terminal.
  Αποθήκευσε σε αρχείο (nano fix-prompt.txt) και δώσε "Διάβασε το fix-prompt.txt"
- **CORS/API timeouts:** Το OCM API πέφτει περιοδικά (HTTP 524).
  Πάντα fallback strategy.
- **Webpack cache:** Μετά από πολλές αλλαγές κάνε `rm -rf .next` πριν build
- **Dark mode Firefox:** System dark mode + λευκό card background = αόρατο κείμενο.
  Προτίμησε σταθερά χρώματα μέχρι να υλοποιηθεί proper dark mode toggle.
- **Data normalization:** Τα raw API data χρειάζονται cleaning (22.079→22 kW)
- **Address fetching:** Τα ΜΥΦΑΗ detail endpoints κάνουν throttle (~90/run).
  Χρησιμοποίησε address-cache.json για σωρευτικό γέμισμα.
- **Σωστός φάκελος:** Πάντα cd στο `chargegr` (μικρά) πριν npm εντολές.
  Ο parent `ChargeGr` (κεφαλαία) έχει τα specs, το `chargegr` τον κώδικα.

### Βασικές αρχές

1. **Ένα task τη φορά.** Μην ζητάς "κάνε ολόκληρο το Phase".
2. **Δοκίμασε πριν προχωρήσεις.** Κάθε task έχει "Επαλήθευση".
3. **Κράτα context.** "Διάβασε τα README.md και PHASE-X-YYY.md"
4. **Commit συχνά.** Git commit μετά κάθε task.
5. **Μεγάλα prompts σε αρχείο.** nano → "Διάβασε και εκτέλεσε"

### Setup στο Kubuntu

```bash
# Project folder
cd /media/eleftheria/DataSSD/Projects/ChargeGr/chargegr

# Claude Code
claude

# Μοντέλο (αν χρειάζεται)
/login
/model claude-opus-4-6
```

### Παραδείγματα εντολών

**Ξεκίνημα task:**
```
Διάβασε τα αρχεία README.md και PHASE-2-ANDROID.md.
Εκτέλεσε το Task 2.1: Επαλήθευση PWA readiness.
```

**Μεγάλο prompt μέσω αρχείο:**
```bash
# Σε terminal
nano fix-prompt.txt
# paste κείμενο, Ctrl+O, Enter, Ctrl+X

# Στο Claude Code
Διάβασε το αρχείο fix-prompt.txt και εκτέλεσε τις οδηγίες
```

**Μετά από error:**
```
Το npm run build αποτυγχάνει με error: [paste error].
Φτιάξε το.
```

**Webpack cache πρόβλημα:**
```
rm -rf .next node_modules/.cache
npm run build
```

### Ροή εργασίας

```
1. cd /media/eleftheria/DataSSD/Projects/ChargeGr/chargegr
2. npm run dev (σε ξεχωριστό terminal tab)
3. claude (Claude Code)
4. Δώσε task
5. Test στο browser + mobile (Chrome DevTools → Device mode)
6. npm run build
7. Upload /out/* στο Plesk
8. git add -A && git commit -m "..." && git push
```

### Αντιμετώπιση CORS

```
1. ΔΟΚΙΜΑΣΕ ΠΡΩΤΑ απευθείας fetch
2. CORS PROXY: Cloudflare Worker (100.000 requests/day δωρεάν)
3. BUILD-TIME FETCH: n8n workflow → JSON → static
4. NGINX PROXY στο Plesk
```

### Τεχνικές αποφάσεις

| Ερώτηση | Απάντηση | Γιατί |
|---------|----------|-------|
| Maps | MapLibre + OpenFreeMap | Δωρεάν, WebGL, vector tiles |
| Framework | Next.js 14 static | File routing, SSG, Plesk compatible |
| State | Zustand | Minimal, Claude Code friendly |
| Data | ΜΥΦΑΗ primary + OCM secondary | Επίσημα > crowdsourced |
| Vehicles | External JSON (runtime load) | Ανανέωση χωρίς rebuild |
| Backend | Supabase (Phase 3) | Free tier, PostGIS, auth built-in |
| Android | Bubblewrap TWA | Ίδιο PWA, 0 extra code |
| Dark mode | Απενεργοποιημένο (Phase 3) | Firefox system preference bugs |

### Git

```bash
cd /media/eleftheria/DataSSD/Projects/ChargeGr
git add -A
git commit -m "Περιγραφή"
git push

# ΠΡΟΣΟΧΗ: Μη γίνει push αρχείο με API keys!
# Βεβαιώσου ότι .env.local είναι στο .gitignore
```

### Χρήσιμες εντολές

```bash
# Check addresses
cat chargegr/public/data/stations.json | python3 -c "
import sys,json
s=json.load(sys.stdin)
a=sum(1 for x in s if x.get('address','').strip())
print(f'Addresses: {a}/{len(s)}')
"

# Update stations
cd chargegr && node scripts/fetch-stations.js

# Check vehicles count
cat chargegr/public/data/vehicles.json | python3 -c "
import sys,json; print(len(json.load(sys.stdin)),'vehicles')
"
```
