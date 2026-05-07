# PlugMeNow — Google Play Data Safety Information

Use the following information to fill out the Data Safety form in Google Play Console.

---

## Data Collection

### Personal Information
- **Email address**: Collected — Used for account creation and authentication
- **Name (display name)**: Collected (optional) — Used for displaying user identity in reviews and check-ins
- **Profile photo**: Collected (optional, via Google Sign-In) — Used as user avatar

### Photos and Videos
- **Photos**: Collected — Users upload photos of charging stations; stored on server

### Location
- **Approximate location**: Collected — Used to show nearby charging stations on the map
  - Collected only with user's explicit permission
  - NOT stored on server, used client-side only

### App Activity
- **App interactions**: Collected — Reviews, ratings, check-ins, and favorites for charging stations

---

## Data Sharing

- **Data shared with third parties**: None
- We do not share any user data with third parties

---

## Data Handling

### Security
- **Data encrypted in transit**: Yes (HTTPS/TLS)
- **Passwords**: Encrypted using bcrypt hashing (never stored in plain text)
- **Server location**: EU (Germany) — Contabo hosting

### User Control
- **Users can request data deletion**: Yes
  - Account deletion available through app settings
  - Deletes ALL user data: account info, reviews, photos, check-ins, favorites
  - Contact: dev@aismartly.gr

- **Users can request data export**: Yes
  - Data export available through app settings (JSON format)

### Data Retention
- Data is retained for as long as the user account exists
- Upon account deletion, all data is permanently removed

---

## Data Types Summary (for Play Console form)

| Data type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email address | Yes | No | Account management |
| Name | Yes | No | App functionality (display name) |
| Profile photo | Yes | No | App functionality (avatar) |
| Photos | Yes | No | App functionality (station photos) |
| Approximate location | Yes | No | App functionality (nearby stations) |
| App interactions | Yes | No | App functionality (reviews, check-ins, favorites) |

---

## Additional Notes for Play Console

- **App is free**: No paid features
- **No advertising**: We do not display ads
- **No analytics/tracking**: We do not use Google Analytics, Firebase Analytics, or any tracking SDK
- **No third-party SDKs** that collect data (no Facebook SDK, no AdMob, etc.)
- **Authentication**: Google Sign-In and email/password
- **Minimum age**: 16 years old (GDPR compliance)

---

## Links

- Privacy Policy: https://chargegr.viralev.gr/privacy/
- Terms of Service: https://chargegr.viralev.gr/terms/
- Developer: AiSmartly (brand: ViralEV)
- Developer contact: dev@aismartly.gr
- Developer website: https://viralev.gr
