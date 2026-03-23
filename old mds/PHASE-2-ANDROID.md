# Phase 2: Android App μέσω TWA (Trusted Web Activity)

## Στόχος
Μετατροπή του PWA σε Android app χωρίς νέο κώδικα.
Δημοσίευση στο Google Play Store.

## Προαπαιτούμενα
- Phase 1 ολοκληρωμένο & deployed στο chargegr.viralev.gr
- HTTPS ενεργοποιημένο (Let's Encrypt)
- Lighthouse PWA score ≥80
- Node.js 18+ στο Kubuntu
- Java JDK 17+
- Google Play Developer account (25$ εφάπαξ)

---

## Task 2.1: Επαλήθευση PWA readiness

**Εντολή στο Claude Code:**
```
Έλεγξε ότι το PWA στο chargegr.viralev.gr πληροί τις
απαιτήσεις Google TWA:
1. manifest.json σωστά ρυθμισμένο (name, icons 512x512, display: standalone)
2. Service worker εγγεγραμμένο
3. HTTPS
4. Τρέξε Lighthouse audit και βεβαιώσου PWA score ≥80
Δώσε μου τα αποτελέσματα και τι πρέπει να φτιάξω.
```

---

## Task 2.2: Δημιουργία app icons

**Εντολή στο Claude Code:**
```
Δημιούργησε τα ακόλουθα icons για το Android app:
- Launcher icon: 512x512 PNG (adaptive icon)
- Maskable icon: 512x512 PNG (safe zone 80%)
- Foreground icon: 512x512 PNG (transparent background)
- Feature graphic: 1024x500 PNG (για Play Store listing)
Χρώμα brand: #1B7B4E (πράσινο), σχέδιο: ⚡ + χάρτης pin
Χρησιμοποίησε SVG → PNG conversion.
```

---

## Task 2.3: Bubblewrap setup & build

**Εντολή στο Claude Code:**
```
Εγκατέστησε Bubblewrap CLI και δημιούργησε TWA Android project
από το PWA στο chargegr.viralev.gr.
Package name: gr.viralev.chargegr
Application name: ChargeGR
Ζήτησε geolocation permission.
Δημιούργησε signing key.
Build release APK + AAB.
```

**Βήματα:**
```bash
# 1. Install Bubblewrap
npm install -g @nicolo-ribaudo/bubblewrap

# 2. Init project — δείχνει στο live PWA
mkdir chargegr-android && cd chargegr-android
bubblewrap init --manifest https://chargegr.viralev.gr/manifest.json

# Bubblewrap θα ρωτήσει:
# - Application name: ChargeGR
# - Short name: ChargeGR
# - Application ID: gr.viralev.chargegr
# - Display mode: standalone
# - Request geolocation: YES
# - Signing key: Δημιούργησε νέο

# 3. Build
bubblewrap build

# Αποτέλεσμα:
# - app-release-bundle.aab  → για Play Store
# - app-release-signed.apk  → για δοκιμή

# 4. Test τοπικά (σε τηλέφωνο/emulator)
bubblewrap install
```

---

## Task 2.4: Digital Asset Links

**Εντολή στο Claude Code:**
```
Δημιούργησε το assetlinks.json αρχείο που πρέπει να ανεβάσω
στο chargegr.viralev.gr/.well-known/assetlinks.json
Χρησιμοποίησε το SHA256 fingerprint από το signing key
που δημιούργησε το Bubblewrap.
```

**Αρχείο:**
```
https://chargegr.viralev.gr/.well-known/assetlinks.json
```

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "gr.viralev.chargegr",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FROM_KEYSTORE"]
  }
}]
```

**Πώς βρίσκεις το SHA256:**
```bash
keytool -list -v -keystore ./android.keystore -alias android | grep SHA256
```

**Ανέβασε στο Plesk:**
- Δημιούργησε φάκελο `.well-known` στο document root
- Βάλε μέσα το `assetlinks.json`
- Βεβαιώσου ότι σερβίρεται ως `application/json`

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
Βασίσου στα features του Phase 1.
```

**Ελληνικά:**
```
Title: ChargeGR - Φόρτιση EV
Short: Βρες σταθμό φόρτισης ηλεκτρικού αυτοκινήτου στην Ελλάδα
```

**Αγγλικά:**
```
Title: ChargeGR - EV Charging GR
Short: Find EV charging stations across Greece
```

**Screenshots needed:**
- Τουλάχιστον 4 screenshots (phone)
- 1024x500 feature graphic
- Phone: 1080x1920 ή 1440x2560

---

## Task 2.6: Play Store Upload

**Χειροκίνητα βήματα (δεν μπορεί Claude Code):**

1. Πήγαινε: https://play.google.com/console
2. Δημιούργησε νέα εφαρμογή → "ChargeGR"
3. Συμπλήρωσε: App content (privacy policy, ads declaration, etc.)
4. Upload AAB στο Internal Testing track πρώτα
5. Δοκίμασε σε 2-3 συσκευές
6. Promote σε Production
7. Αναμονή review (1-3 ημέρες)

**Privacy Policy:**
```
Θα χρειαστείς privacy policy URL.
Πρόσθεσε σελίδα στο viralev.gr/chargegr-privacy
ή στο chargegr.viralev.gr/privacy
```

---

## Task 2.7: Android Auto (Μελλοντικό)

**ΣΗΜΕΙΩΣΗ: Αυτό δεν είναι εφικτό με TWA.**

Android Auto απαιτεί native Android app (Kotlin/Java) με
Android for Cars App Library. Αυτό θα γίνει μόνο αν
η εφαρμογή αποκτήσει σημαντική βάση χρηστών.

Εναλλακτική: η PWA εμφανίζεται σωστά στο Chrome του αυτοκινήτου
αν ο χρήστης ανοίξει τον browser.

---

## Checklist Phase 2

- [ ] Bubblewrap build επιτυχής
- [ ] APK δοκιμασμένο σε φυσική συσκευή
- [ ] assetlinks.json uploaded & verified
- [ ] Δεν εμφανίζεται browser bar (TWA verification OK)
- [ ] Geolocation δουλεύει στο app
- [ ] Play Store listing ολοκληρωμένο
- [ ] Screenshots/feature graphic ανεβασμένα
- [ ] Privacy policy URL ενεργή
- [ ] Internal testing OK
- [ ] Production release submitted
