# Phase 2: Android App μέσω TWA (Trusted Web Activity)

## Στόχος
Μετατροπή του PlugMeNow PWA σε Android app χωρίς νέο κώδικα.
Δημοσίευση στο Google Play Store.

## Προαπαιτούμενα
- ✅ Phase 1 ολοκληρωμένο & deployed στο chargegr.viralev.gr
- ✅ HTTPS ενεργοποιημένο (Let's Encrypt)
- ✅ PWA manifest, service worker, icons
- ⬜ Lighthouse PWA score ≥80 (πρέπει να ελεγχθεί)
- ⬜ Google Play Developer account (25$ εφάπαξ)
- Node.js 20+, Java JDK 17+ στο Kubuntu

---

## Task 2.1: Επαλήθευση PWA readiness

**Εντολή στο Claude Code:**
```
Διάβασε τα README.md και PHASE-2-ANDROID.md.
Έλεγξε ότι το PWA στο chargegr.viralev.gr πληροί τις
απαιτήσεις Google TWA:
1. manifest.json: name "PlugMeNow", icons 512x512, display: standalone
2. Service worker εγγεγραμμένο και ενεργό
3. HTTPS ενεργό
4. Τρέξε Lighthouse audit στο deployed URL
Δώσε μου τα αποτελέσματα και τι πρέπει να φτιάξω.
```

---

## Task 2.2: Δημιουργία app icons

**Εντολή στο Claude Code:**
```
Δημιούργησε icons για το Android app "PlugMeNow":
- Launcher icon: 512x512 PNG (adaptive icon)
- Maskable icon: 512x512 PNG (safe zone 80%)
- Foreground icon: 512x512 PNG (transparent background)
- Feature graphic: 1024x500 PNG (για Play Store listing)
Χρώμα brand: #1B7B4E (πράσινο), σχέδιο: ⚡ + βύσμα/plug
Tagline στο feature graphic: "Βρες φορτιστή, τώρα!"
Χρησιμοποίησε SVG → PNG conversion.
```

---

## Task 2.3: Bubblewrap setup & build

**Εντολή στο Claude Code:**
```
Εγκατέστησε Bubblewrap CLI και δημιούργησε TWA Android project
από το PWA στο chargegr.viralev.gr.
Package name: gr.viralev.plugmenow
Application name: PlugMeNow
Ζήτησε geolocation permission.
Δημιούργησε signing key.
Build release APK + AAB.
```

**Βήματα:**
```bash
# 1. Install Bubblewrap
npm install -g @nicolo-ribaudo/bubblewrap

# 2. Init project
mkdir plugmenow-android && cd plugmenow-android
bubblewrap init --manifest https://chargegr.viralev.gr/manifest.json

# Bubblewrap θα ρωτήσει:
# - Application name: PlugMeNow
# - Short name: PlugMeNow
# - Application ID: gr.viralev.plugmenow
# - Display mode: standalone
# - Request geolocation: YES
# - Signing key: Δημιούργησε νέο

# 3. Build
bubblewrap build

# Αποτέλεσμα:
# - app-release-bundle.aab  → για Play Store
# - app-release-signed.apk  → για δοκιμή

# 4. Test τοπικά
bubblewrap install
```

---

## Task 2.4: Digital Asset Links

**Εντολή στο Claude Code:**
```
Δημιούργησε το assetlinks.json αρχείο για
chargegr.viralev.gr/.well-known/assetlinks.json
με το SHA256 fingerprint από το signing key του Bubblewrap.
```

**Αρχείο:**
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "gr.viralev.plugmenow",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FROM_KEYSTORE"]
  }
}]
```

**SHA256 fingerprint:**
```bash
keytool -list -v -keystore ./android.keystore -alias android | grep SHA256
```

**Upload στο Plesk:**
- Δημιούργησε φάκελο `.well-known` στο document root
- Βάλε μέσα το `assetlinks.json`
- Content-Type: `application/json`

---

## Task 2.5: Play Store Listing

**Εντολή στο Claude Code:**
```
Γράψε τα κείμενα για το Google Play Store listing
στα Ελληνικά και Αγγλικά:
- Title (≤30 χαρακτήρες)
- Short description (≤80 χαρακτήρες)
- Full description (≤4000 χαρακτήρες)
- Category: Maps & Navigation
- Tags/keywords
App name: PlugMeNow. Tagline: "Βρες φορτιστή, τώρα!"
Features: 3.810 σταθμοί, 16 δίκτυα, 119 μοντέλα EV,
φίλτρα, vehicle compatibility, εκτίμηση χρόνου, πλοήγηση.
```

**Ελληνικά:**
```
Title: PlugMeNow - Φόρτιση EV
Short: Βρες σταθμό φόρτισης ηλεκτρικού αυτοκινήτου στην Ελλάδα
```

**Αγγλικά:**
```
Title: PlugMeNow - EV Charging GR
Short: Find EV charging stations across Greece — all networks in one app
```

**Screenshots needed:**
- Τουλάχιστον 4 screenshots (phone 1080x1920)
- 1 feature graphic (1024x500)

---

## Task 2.6: Play Store Upload

**Χειροκίνητα βήματα (δεν γίνονται μέσω Claude Code):**

1. Πήγαινε: https://play.google.com/console
2. Πλήρωσε 25$ για developer account
3. Δημιούργησε νέα εφαρμογή → "PlugMeNow"
4. Συμπλήρωσε: App content (privacy policy, ads, target audience)
5. Upload AAB στο **Internal Testing** track πρώτα
6. Δοκίμασε σε 2-3 συσκευές
7. Promote σε Production
8. Αναμονή review (1-3 ημέρες)

**Privacy Policy:**
```
Χρειάζεσαι privacy policy URL.
Δημιούργησε σελίδα στο viralev.gr/plugmenow-privacy
```

**Εντολή στο Claude Code:**
```
Δημιούργησε privacy policy page σε HTML για το PlugMeNow.
Η εφαρμογή συλλέγει: geolocation (μόνο αν ο χρήστης δώσει permission),
selected vehicle (localStorage), language preference (localStorage).
ΔΕΝ συλλέγει: personal data, email, cookies tracking.
Δημιούργησε public/privacy/index.html με responsive design.
```

---

## Task 2.7: Screenshots για Play Store

**Εντολή στο Claude Code:**
```
Δώσε μου οδηγίες πώς να πάρω screenshots για το Play Store:
1. Χρησιμοποίησε Chrome DevTools Device Mode
2. Pixel 7 (1080x2400) ή iPhone 14 (1170x2532)
3. Πάρε screenshots:
   - Χάρτης με clusters (zoom out)
   - Χάρτης με markers (zoom in σε Αθήνα)
   - Station detail card ανοιχτό
   - Filter panel ανοιχτό
   - Vehicle selector ανοιχτό
   - Search με αποτελέσματα
4. Μέγεθος: min 1080x1920
```

---

## Task 2.8: Android Auto (Μελλοντικό)

**ΣΗΜΕΙΩΣΗ: ΔΕΝ είναι εφικτό με TWA.**

Android Auto απαιτεί native Android app (Kotlin/Java) με
Android for Cars App Library. Θα γίνει μόνο αν η εφαρμογή
αποκτήσει σημαντική βάση χρηστών (Phase 4+).

Εναλλακτική: η PWA εμφανίζεται στο Chrome του αυτοκινήτου.

---

## Checklist Phase 2

- [x] Branding updated σε "PlugMeNow" παντού ✅
- [x] Bubblewrap build επιτυχής ✅
- [x] APK δοκιμασμένο σε φυσική συσκευή ✅
- [x] assetlinks.json uploaded & verified ✅ (+ προστέθηκε στο Next.js project)
- [x] Δεν εμφανίζεται browser bar (TWA verification OK) ✅
- [x] Geolocation δουλεύει στο app ✅
- [x] Play Store listing ολοκληρωμένο (EL + EN) ✅
- [x] Privacy policy URL ενεργή ✅ (public/privacy/index.html)
- [ ] Lighthouse PWA score ≥80
- [ ] Screenshots ανεβασμένα (min 4)
- [ ] Feature graphic 1024x500
- [ ] Google Play Developer account (25$)
- [ ] Internal testing OK σε 2+ συσκευές
- [ ] Production release submitted
