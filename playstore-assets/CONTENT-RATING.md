# PlugMeNow — Content Rating Questionnaire (IARC)

Απαντήσεις για το **Google Play Console → App content → Content ratings**.

---

## App category

**Primary category:** Maps & Navigation
**Secondary category (αν επιτρέπεται):** Travel & Local

---

## IARC Questionnaire — απαντήσεις

### 1. Violence
- Does the app contain or reference violence? **NO**
- Realistic / fantasy violence? **NO**
- Sexual violence? **NO**

### 2. Sexuality
- Sexual content / nudity / suggestive references? **NO**

### 3. Language
- Profanity / crude humor? **NO** (UGC is moderated — βλ. Section 7)

### 4. Controlled substances
- Reference to alcohol / tobacco / drugs? **NO**

### 5. Gambling / Simulated gambling
- Gambling / casino content? **NO**
- Simulated gambling (loot boxes, etc.)? **NO**

### 6. Horror / Fear
- Horror / scary content? **NO**

### 7. User interaction & user-generated content (UGC)
- **Users can interact with each other?** YES (αλλά μόνο ασύγχρονα μέσω reviews/photos/check-ins — **όχι DM, όχι chat, όχι real-time**)
- **Users can share content publicly?** YES (reviews, station photos, check-ins are visible to all app users)
- **Users can communicate directly?** **NO** (no messaging, no chat, no comments-on-comments, no friend system)
- **Is UGC moderated?** **YES** — admin dashboard με moderation queues (reviews, photos, check-ins, favorites)
- **User location shared?** **NO** (η τοποθεσία χρήστη δεν δημοσιοποιείται — μόνο τοποθεσίες σταθμών)

### 8. Personal info / Digital purchases
- **Collects user location?** YES (μόνο approximate, με user consent — βλ. DATA-SAFETY.md)
- **Shares user-provided personal info?** **NO**
- **In-app purchases?** **NO** (FREE app, no IAP)
- **Digital purchases?** **NO**

### 9. Mature themes / Crude humor / Discrimination
- All: **NO**

---

## Expected rating result

Με τις παραπάνω απαντήσεις, το αναμενόμενο rating:

- **IARC: 3+** (Everyone / All ages — κατάλληλο για όλους)
- **ESRB: Everyone** (E)
- **PEGI: 3** (suitable for all)
- **USK: 0** (alle altersfreigegeben)

---

## Target audience & content

**Στο Play Console → App content → Target audience and content:**

| Question | Answer |
|---|---|
| Target age group | **18 and over** (Adults) |
| Could the app appeal to children? | **NO** (functional EV charging utility) |
| Is your app primarily for children? | **NO** |
| Does your app meet COPPA requirements? | **N/A** (not a children's app) |
| Designed for Families program? | **NO** (NOT enrolling) |

**Justification (αν χρειαστεί κείμενο):**
> "PlugMeNow είναι utility app για οδηγούς ηλεκτρικών αυτοκινήτων. Απαιτεί άδεια οδήγησης (18+) για να έχει νόημα. Δεν περιέχει elements σχεδιασμένα για παιδιά (cartoonish characters, kid-friendly UI, εκπαιδευτικό περιεχόμενο για μικρές ηλικίες). Η εφαρμογή είναι υπηρεσία τεχνικής φύσης."

---

## Ads declaration

**Στο Play Console → App content → Ads:**

| Question | Answer |
|---|---|
| Does your app contain ads? | **NO** |

> "Η εφαρμογή είναι 100% δωρεάν και ΔΕΝ εμφανίζει διαφημίσεις. Δεν υπάρχουν ad SDKs (no AdMob, no Facebook Audience Network, no IronSource κλπ)."

---

## App access

**Στο Play Console → App content → App access:**

| Question | Answer |
|---|---|
| All functionality available without restrictions? | **NO** |
| Some features require login? | **YES** (reviews, photos, check-ins, favorites) |

**Test credentials για το Google review team:**
- Provide test account: `playreview@aismartly.gr` (TODO: create test account πριν submission)
- Password: (TBD)
- Instructions: "Login με αυτό το account για να δεις full functionality (κριτικές, check-ins, αγαπημένα). Read-only χάρτης + station details είναι διαθέσιμα και χωρίς login."

---

## Government apps & News

| Question | Answer |
|---|---|
| Government app? | **NO** |
| News app? | **NO** |

---

## COVID-19 / Health-related?

**NO** — η εφαρμογή ΔΕΝ είναι health-related.

---

## Final declarations

- **Δεν εμφανίζει ads:** ✅
- **Δεν έχει IAP / subscriptions:** ✅
- **Δεν έχει tracking SDKs:** ✅
- **Δεν στοχεύει παιδιά:** ✅
- **UGC είναι moderated:** ✅ (admin dashboard στο [`/dashboard`](https://chargegr.viralev.gr/dashboard/))
