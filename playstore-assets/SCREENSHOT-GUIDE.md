# PlugMeNow — Screenshot Guide for Play Store

Οδηγίες για χειροκίνητη λήψη screenshots για το Google Play Store listing.

## Play Store specs (2026)

- **Format:** PNG ή JPEG (PNG προτιμάται)
- **Aspect ratio:** 9:16 (portrait) ή 16:9 (landscape) — phone screenshots
- **Min:** 320px στη μικρότερη πλευρά | **Max:** 3840px
- **Recommended:** **1080×2400** (Pixel-style portrait) ή **1080×1920**
- **Quantity:** min 2, **max 8** per category (phone)
- **Tablet 7"/10":** προαιρετικά separate screenshots (όχι required)

## Setup (Chrome DevTools method)

1. Άνοιξε `https://chargegr.viralev.gr` σε Chrome
2. F12 → DevTools → toggle Device Toolbar (Ctrl+Shift+M)
3. Επέλεξε **Custom dimensions: 1080 × 2400** (DPR 1.0)
4. Στο dropdown "Throttling" κράτα No throttling
5. Πάτα `Ctrl+Shift+P` → "Capture full size screenshot" ή "Capture screenshot" (visible area only)
6. Save ως PNG στο `playstore-assets/screenshots/screenshot-NN.png`

**Tip:** Για clean shots, ενεργοποίησε mobile UA spoofing (Network conditions → User Agent → custom Pixel 7).

## Screenshots needed (στόχος: 4–6)

### 1. Map Overview — Greece
- **Zoom:** Όλη η Ελλάδα (zoom ~6)
- **Visible:** clusters, header με icons (login, search, filters)
- **Language:** EL
- **Filename:** `screenshot-01-map-overview-el.png`

### 2. Station Detail
- **Zoom:** περιοχή Αθήνας (zoom ~13)
- **Action:** ταπ σε σταθμό για να ανοίξει η κάρτα
- **Choose:** ΔΕΗ Blue ή NRG με 2+ connectors, status badges visible
- **Show:** connectors, ισχύς, status, navigation button
- **Language:** EL
- **Filename:** `screenshot-02-station-detail-el.png`

### 3. Filters Panel
- **State:** filters drawer open
- **Active:** 2-3 filters (π.χ. Tύπος βύσματος = CCS2, Ισχύς = Fast)
- **Show:** badge με αριθμό φίλτρων στο header
- **Language:** EL
- **Filename:** `screenshot-03-filters-el.png`

### 4. Vehicle Selector
- **State:** vehicle picker dropdown open
- **Visible:** brands list (Audi, BMW, Hyundai, Kia, Tesla, VW κλπ)
- **Show:** "1.300+ μοντέλα" hint αν εμφανίζεται
- **Language:** EL
- **Filename:** `screenshot-04-vehicles-el.png`

### 5. Reviews & Photos (optional)
- **State:** station card scrolled για να φαίνονται reviews
- **Show:** rating αστέρια, αξιολόγηση κειμένου, user photo
- **Choose:** σταθμός με ≥1 review και ≥1 photo
- **Language:** EL
- **Filename:** `screenshot-05-reviews-photos-el.png`

### 6. English version (optional)
- Screenshot 1 (map overview) σε γλώσσα EN
- **Filename:** `screenshot-06-map-overview-en.png`

## Tips

- **Crop status bar:** αν θες clean shots, κρύψε το browser status bar (DevTools fullscreen mode)
- **Καθαρή κατάσταση:** βγάλε console (F12 → close), κλείσε notifications
- **Μη βάζεις** δικό σου location pin εμφανές
- **Zoom:** 100% (Ctrl+0)
- **Δοκίμασε mock GPS** σε Athens center για consistent positioning
- **Save lossless:** PNG, όχι JPEG (Play Store κάνει re-encode όπως θέλει)

## Folder structure

```
playstore-assets/
├── feature-graphic.png         (1024×500 — DONE)
└── screenshots/
    ├── screenshot-01-map-overview-el.png
    ├── screenshot-02-station-detail-el.png
    ├── screenshot-03-filters-el.png
    ├── screenshot-04-vehicles-el.png
    ├── screenshot-05-reviews-photos-el.png   (optional)
    └── screenshot-06-map-overview-en.png     (optional)
```

## Verification

Πριν upload, τρέξε:

```bash
cd /media/eleftheria/DataSSD/Projects/ChargeGr/playstore-assets/screenshots
for f in *.png; do
  python3 -c "from PIL import Image; im=Image.open('$f'); print('$f', im.size)"
done
```

Όλες οι διαστάσεις πρέπει να είναι ≥1080 στη μικρότερη πλευρά και 9:16 ή close to it.
