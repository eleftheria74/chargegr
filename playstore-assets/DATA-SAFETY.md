# PlugMeNow — Data Safety Form (Play Console)

Form-mapped απαντήσεις για το **Google Play Console → App content → Data safety**.
Η αναλυτική τεκμηρίωση βρίσκεται στο [`../playstore-data-safety.md`](../playstore-data-safety.md).

---

## Section 1: Data collection and security (overview)

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **YES** |
| Is all of the user data collected by your app encrypted in transit? | **YES** (HTTPS/TLS) |
| Do you provide a way for users to request that their data be deleted? | **YES** (in-app account settings + email to dev@aismartly.gr) |

---

## Section 2: Data types

Για κάθε data type: **Collected** (yes/no), **Shared** (yes/no), **Required** (yes/no), **Purpose**, **Ephemeral**.

### Personal info

#### Email address
- Collected: **YES**
- Shared: **NO**
- Optional/Required: **Optional** (app works χωρίς login για read-only χρήση)
- Ephemeral processing: **NO**
- Purposes: **Account management, App functionality**

#### Name (display name)
- Collected: **YES** (μέσω Google Sign-In ή manual signup)
- Shared: **NO** (αλλά είναι publicly visible μέσα στην εφαρμογή σε reviews/check-ins)
- Optional/Required: **Optional**
- Ephemeral processing: **NO**
- Purposes: **App functionality** (display στις κριτικές)

#### User IDs
- Collected: **YES** (internal user ID για auth)
- Shared: **NO**
- Optional/Required: **Required** (for logged-in users)
- Ephemeral: **NO**
- Purposes: **Account management**

### Photos and videos

#### Photos
- Collected: **YES** (user-uploaded station photos)
- Shared: **NO** (δεν τα στέλνουμε σε third parties — αλλά είναι publicly visible σε άλλους χρήστες)
- Optional/Required: **Optional**
- Ephemeral: **NO**
- Purposes: **App functionality** (community contributions)

### Location

#### Approximate location
- Collected: **YES** (μόνο με user permission)
- Shared: **NO**
- Optional/Required: **Optional** (app λειτουργεί χωρίς location permission)
- Ephemeral processing: **YES** ⚠️ (δεν αποθηκεύεται στον server — μόνο client-side για map centering)
- Purposes: **App functionality** (find nearby stations)

#### Precise location
- Collected: **NO**

### App activity

#### Other user-generated content
- Collected: **YES** (reviews, ratings, check-ins, favorites)
- Shared: **NO** (αλλά reviews/check-ins είναι publicly visible)
- Optional/Required: **Optional**
- Ephemeral: **NO**
- Purposes: **App functionality**

#### App interactions / In-app search history
- Collected: **NO**

### App info and performance
- Crash logs: **NO**
- Diagnostics: **NO**
- Other app performance data: **NO**

### Device or other IDs
- Collected: **NO**

---

## Section 3: Data NOT collected (declare explicitly NO)

- Financial info ❌
- Health & fitness ❌
- Messages ❌
- Audio files ❌
- Files & docs ❌
- Calendar ❌
- Contacts ❌
- Web browsing history ❌
- Installed apps ❌
- Other personal info (race, political, religious, sexual orientation, etc.) ❌
- Device or other IDs (advertising ID, IMEI, MAC) ❌

---

## Section 4: Security practices

| Question | Answer |
|---|---|
| Is your data encrypted in transit? | **YES** — HTTPS/TLS for all client-server communication |
| Do you provide a way for users to request that their data be deleted? | **YES** — in-app self-service deletion + email request to dev@aismartly.gr |
| Have you committed to follow the Play Families Policy? | **N/A** (not a children's app) |
| Has your app been independently validated against a global security standard? | **NO** |

---

## Section 5: Why we collect each data type (κείμενο για το form)

> "Account email/name: για authentication και να εμφανίζεται το ψευδώνυμο στις κριτικές που υποβάλλει ο χρήστης. Photos: για community contributions (φωτογραφίες σταθμών φόρτισης από χρήστες). Approximate location: μόνο για να εμφανίσουμε κοντινούς σταθμούς στον χάρτη — δεν αποθηκεύεται στον server. App interactions (reviews/check-ins/favorites): basic εφαρμογής για ανταλλαγή πληροφοριών μεταξύ χρηστών."

---

## Section 6: Third-party data sharing

**ΟΧΙ third-party data sharing.** Η εφαρμογή ΔΕΝ:
- στέλνει δεδομένα σε analytics SDKs (no Google Analytics, Firebase Analytics, Mixpanel, Amplitude)
- στέλνει δεδομένα σε ad networks (no AdMob, Facebook Audience Network)
- χρησιμοποιεί third-party login pixels (πέρα από το Google Sign-In, που είναι direct OAuth — όχι data sharing)
- διαβάζει contacts/calendar/photos device-wide (μόνο user-selected files via file picker)

---

## Quick-fill cheatsheet (για τη φόρμα)

**Στην ερώτηση "What user data does your app collect or share?":**

✅ Personal info → Email address, Name, User IDs
✅ Photos and videos → Photos
✅ Location → Approximate location (ephemeral)
✅ App activity → Other user-generated content

**Όλα τα υπόλοιπα: NO**

---

## Links για το Play Console

- Privacy Policy URL: `https://chargegr.viralev.gr/privacy/`
- Account deletion URL: `https://chargegr.viralev.gr/privacy/#section-5` (ή link στο "Account → Delete account" της εφαρμογής)
- Developer contact email: `dev@aismartly.gr`
- Server location: EU (Germany — Contabo VPS)
