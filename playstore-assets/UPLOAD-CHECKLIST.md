# PlugMeNow — Play Store Upload Checklist

Step-by-step για το πρώτο submission στο Google Play Console.

**App package:** `gr.viralev.plugmenow`
**Developer:** AiSmartly
**App name:** PlugMeNow

---

## A. Files ready (current state)

### Build artifacts (στο [`/`](../))
- [x] `app-release-bundle.aab` — TWA build (1.5MB, signed, Mar 2026)
- [x] `app-release-signed.apk` — sideload-able for testing (1.4MB)
- [x] `android.keystore` — signing key ⚠️ **ΠΟΤΕ στο git, ΠΟΤΕ μην ξαναδημιουργηθεί**
- [x] `assetlinks.json` — deployed στο `https://chargegr.viralev.gr/.well-known/assetlinks.json` ✅ verified

### Store listing assets (στο [`playstore-assets/`](../playstore-assets/))
- [x] `feature-graphic.png` — 1024×500
- [ ] `screenshots/screenshot-01..04.png` — **TODO Eleftheria** (βλ. [SCREENSHOT-GUIDE.md](SCREENSHOT-GUIDE.md))
- [x] `../store_icon.png` — 512×512 hi-res icon (already στη ρίζα)

### Documentation
- [x] [`playstore-el.md`](../playstore-el.md) — Greek listing texts
- [x] [`playstore-en.md`](../playstore-en.md) — English listing texts
- [x] [`DATA-SAFETY.md`](DATA-SAFETY.md) — form-mapped answers
- [x] [`CONTENT-RATING.md`](CONTENT-RATING.md) — IARC questionnaire answers
- [x] [`SCREENSHOT-GUIDE.md`](SCREENSHOT-GUIDE.md) — manual screenshot instructions

### Live website (chargegr.viralev.gr)
- [x] Privacy Policy: https://chargegr.viralev.gr/privacy/ ✅ AiSmartly branding live
- [x] Terms of Service: https://chargegr.viralev.gr/terms/ ✅ AiSmartly branding live
- [x] AssetLinks: https://chargegr.viralev.gr/.well-known/assetlinks.json ✅ matches keystore SHA

---

## B. Pre-submission gates

- [ ] Test account created (`playreview@aismartly.gr`) με demo data — για το Play review team
- [ ] Screenshots taken και saved στο `playstore-assets/screenshots/` (min 2, ideal 4–6)
- [ ] **Test device installation:**
  ```bash
  adb install /media/eleftheria/DataSSD/Projects/ChargeGr/app-release-signed.apk
  ```
  Ή: στείλε APK σε κινητό → άνοιξε → install → "Allow unknown sources"
- [ ] **TWA test on device:**
  - [ ] App ανοίγει χωρίς μαύρη οθόνη
  - [ ] Χάρτης φορτώνει με stations
  - [ ] **ΔΕΝ εμφανίζεται browser address bar** (TWA verification successful)
  - [ ] Geolocation prompt εμφανίζεται και λειτουργεί
  - [ ] Google Sign-In δουλεύει (signature mismatch errors → keystore problem)
  - [ ] Search bar δουλεύει
  - [ ] Station card opens, navigation button → Google Maps
  - [ ] Reviews/photos visible
  - [ ] App κλείνει cleanly (back button → exits to home)

---

## C. Play Console — βήμα-βήμα

### 1. Δημιουργία εφαρμογής
- Login: https://play.google.com/console (Developer account: AiSmartly)
- Click **Create app**
  - App name: **PlugMeNow**
  - Default language: **Ελληνικά (Greece) – el-GR**
  - App or game: **App**
  - Free or paid: **Free**
  - Declarations: ✅ Developer Program Policies, ✅ US export laws

### 2. Set up your app (sidebar tasks)

#### App access
- All functionality available without restrictions: **NO**
- Some features need credentials → provide test account (βλ. CONTENT-RATING.md → App access)

#### Ads
- Does your app contain ads? **NO**

#### Content rating
- Open questionnaire → fill σύμφωνα με [CONTENT-RATING.md](CONTENT-RATING.md)
- Submit → IARC issues rating (αναμενόμενο: PEGI 3 / Everyone)

#### Target audience and content
- Target age group: **18 and over**
- Children appeal: **NO**
- Confirm declarations

#### News app
- **NO**

#### COVID-19 contact tracing / status app
- **NO**

#### Data safety
- Open form → fill σύμφωνα με [DATA-SAFETY.md](DATA-SAFETY.md)
- Privacy policy URL: `https://chargegr.viralev.gr/privacy/`

#### Government apps
- **NO**

#### Financial features
- **NO**

#### Health
- **NO**

### 3. Store listing

**Main store listing → Greek (el-GR):**
- App name: `PlugMeNow - Φόρτιση EV` (≤30 chars ✅)
- Short description: from [playstore-el.md](../playstore-el.md) → **Short Description** section (≤80 chars)
- Full description: from [playstore-el.md](../playstore-el.md) → **Full Description** section (≤4000 chars)
- App icon: upload `../store_icon.png` (512×512)
- Feature graphic: upload `feature-graphic.png` (1024×500)
- Phone screenshots: upload `screenshots/*.png` (min 2, max 8)
- Video (YouTube): **skip** (optional)

**Add translation → English (en-US):**
- Title: `PlugMeNow - EV Charging GR`
- Short + Full description: from [playstore-en.md](../playstore-en.md)
- Reuse same icon/feature graphic
- Optionally upload EN screenshots (αν τραβήχτηκε `screenshot-06-map-overview-en.png`)

**Categorization:**
- App category: **Maps & Navigation**
- Tags: charging, electric vehicle, EV, map, Greece (max 5)

**Contact details:**
- Email: `dev@aismartly.gr`
- Website: `https://viralev.gr`
- Phone: (optional, leave blank)

**Privacy policy:**
- URL: `https://chargegr.viralev.gr/privacy/`

### 4. Production release (αλλά πρώτα Internal Testing!)

**4a. Internal Testing (ΞΕΚΙΝΑ ΑΠΟ ΕΔΩ):**
- Sidebar → **Testing → Internal testing → Create new release**
- Upload `/media/eleftheria/DataSSD/Projects/ChargeGr/app-release-bundle.aab`
- Release name: `1.0.0-internal`
- Release notes (EL): `Πρώτη έκδοση testing — εύρεση σταθμών φόρτισης EV στην Ελλάδα.`
- Save → **Review release**
- Add testers: tab "Testers" → create email list με 2-3 emails (eleftheria + 1-2 friends)
- Save → **Roll out to internal testing**
- Wait ~10–30 mins, install via Play Store invite link, test
- ✅ Verify TWA mode (no browser bar) on Play-installed app

**4b. Production:**
- Όταν Internal Testing είναι OK → sidebar → **Production → Create new release**
- Promote from internal testing OR upload AAB ξανά
- Release notes ξανά
- **Review and rollout to production**
- Wait for review (συνήθως 1-7 days την πρώτη φορά)

---

## D. Post-review checklist

- [ ] App live στο Play Store: `https://play.google.com/store/apps/details?id=gr.viralev.plugmenow`
- [ ] Install από Play Store σε φυσική συσκευή (όχι internal testing)
- [ ] **Verify TWA verified:** no browser bar (signature match between Play Store install και assetlinks.json)
- [ ] Google Sign-In works on Play install (αν spotted διαφορά SHA, fix το assetlinks.json)
- [ ] Update [`README.md`](../README.md) ή [`CLAUDE-CODE-GUIDE.md`](../CLAUDE-CODE-GUIDE.md) με Play Store link
- [ ] Marketing: post στο social με τον link

---

## E. Common gotchas / pitfalls

1. **Signature mismatch errors** → πρέπει το SHA-256 του keystore που υπογράφει το AAB να ταιριάζει με το `assetlinks.json` που είναι deployed. Αν δεν ταιριάζει, ο TWA θα εμφανίζει browser bar.
   - Verify: `keytool -list -v -keystore android.keystore -alias android | grep SHA256`
   - Compare: `curl https://chargegr.viralev.gr/.well-known/assetlinks.json`
   - Current SHA (verified ✅): `F2:22:7F:1A:C2:9C:1E:B5:70:3D:EA:A3:56:65:18:1B:24:B9:68:2F:1E:A8:82:C0:78:DB:DA:50:69:34:5C:86`

2. **Play App Signing** — αν το Play Console προτείνει "Use Play App Signing" στο upload, ΔΕΧΣΟΥ. Αυτό σημαίνει ότι Google θα ξαναϋπογράψει το AAB με δικό του key. **MUST**: μετά το upload, copy το **App signing key certificate SHA-256** από το Play Console και πρόσθεσέ το ως δεύτερο fingerprint στο `assetlinks.json`. Αλλιώς ο TWA θα σπάσει στις installs από Play Store.

3. **Keystore loss** = death sentence. Backup σε:
   - 1Password / Bitwarden vault
   - Encrypted USB drive
   - **ΟΧΙ git, ΟΧΙ Drive χωρίς encryption**

4. **Privacy policy 404** → Play review will reject. Verify πριν submission: `curl -I https://chargegr.viralev.gr/privacy/` πρέπει να επιστρέφει 200.

5. **Screenshots not 9:16** → some get auto-cropped weirdly. Stick to 1080×2400 ή 1080×1920 portrait.

6. **Maximum AAB size** = 200MB. Είμαστε στα 1.5MB ✅.

---

## F. Versioning για future updates

Αν χρειαστεί rebuild (π.χ. bump version, change package metadata):

```bash
cd /media/eleftheria/DataSSD/Projects/ChargeGr
# Edit twa-manifest.json:
#   "appVersionName": "1.0.1"
#   "appVersionCode": 2     <-- MUST increment monotonically
bubblewrap update      # regenerate from manifest
bubblewrap build       # produces new AAB
# Upload new AAB to Play Console → Production → Create new release
```

**Rules:**
- `appVersionCode` πρέπει πάντα να αυξάνεται (1 → 2 → 3 …)
- `appVersionName` είναι ελεύθερο ("1.0.0", "1.0.1-beta" κλπ)
- Δεν μπορείς να ξανανεβάσεις AAB με ίδιο `versionCode`

---

## G. Status σήμερα

| Item | Status |
|---|---|
| AAB built & signed | ✅ |
| AssetLinks deployed & verified | ✅ |
| Privacy/Terms live with AiSmartly branding | ✅ |
| Store listing texts (EL + EN) | ✅ |
| Feature graphic 1024×500 | ✅ |
| App icon 512×512 | ✅ |
| Data Safety form mapping | ✅ |
| Content Rating questionnaire mapping | ✅ |
| Screenshots | ⏳ TODO (manual — Eleftheria) |
| Test account για review team | ⏳ TODO |
| Play Console app creation | ⏳ TODO |
| Internal Testing rollout | ⏳ TODO |
| Production submission | ⏳ TODO |
