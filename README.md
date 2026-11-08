# Split — Tinder for Roommates

Split is a cross-platform (iOS, Android, Web) mobile-first application designed to match potential roommates to split rent.

Built with **Expo SDK 52**, **Expo Router v4**, **TypeScript**, **NativeWind v4 / Tailwind CSS**, **React Native Reanimated v3**, **React Native Gesture Handler**, and **Supabase (PostgreSQL + PostGIS)**.

---

## Key Features

1. **Pure Tinder Swipe Deck**:
   - 60fps gesture-driven card deck with rotation physics and snap springs.
   - Animated stamp badges: Subdued Sage (`#2E7D5B`) for LIKE, Muted Brick (`#A8443B`) for NOPE, and Terracotta (`#C25E36`) for SUPERLIKE.
   - Programmatic action bar: Rewind (Undo), Pass, Superlike, Like, and Info.

2. **Dual-Mode Roommate Pairing**:
   - **"I have a room to fill"**: Showcase room photos, rent split amount, deposit, private bath, in-unit laundry, and parking amenities.
   - **"Looking to team up"**: Filter for compatible co-tenants to sign a fresh 2BR/3BR lease together.

3. **Split Photo Card**:
   - For users offering a room, cards feature a split toggle ("Person" vs "Room") to inspect both the roommate and their actual apartment interior.

4. **Side-by-Side Habit Split Comparison**:
   - Tapping any card slides open a detailed comparison sheet comparing **"Your Habits" vs "Their Habits"** across sleep schedule, cleanliness rating (1-5), work setup (WFH/Office/Hybrid), pets, smoking, and guest policy.

5. **Dual Vicinity & Location Engine**:
   - Real-time GPS location via `expo-location` with geodesic distance calculations (Haversine formula).
   - Target relocation city picker with presets: Seattle WA, Manhattan NY, Brooklyn NY, San Francisco CA, Austin TX, Chicago IL.
   - Distance radius slider (5 to 50 miles).

6. **Instant Mutual Match Celebration & Chat**:
   - Swiping right on a reciprocal candidate triggers the full-screen "It's a Match!" celebration modal.
   - 1-on-1 real-time messaging with message bubbles, read receipts, and auto-reply simulation in mock mode.

7. **Trust & Safety Moderation**:
   - Roommate safety principles sheet (meeting in public, lease verification, avoiding upfront wire transfers).
   - In-app reporting and blocking: instantly purges offending profiles from your feed and matches.

8. **Zero-Config Offline Mock Engine**:
   - Ships with 12 pre-seeded, realistic roommate profiles with high-resolution photography.
   - Fully interactive out of the box without requiring Supabase cloud credentials.
   - Drop-in switch to cloud Supabase by setting `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

---

## Design System: Architectural Warmth

- **Light Canvas**: Warm Oat / Linen (`#FBF9F5`)
- **Dark Canvas**: Deep Roasted Espresso (`#191614`)
- **Signature Accent**: Muted Terracotta (`#C25E36`)
- **Action Stamps**: Subdued Sage (`#2E7D5B`) & Muted Brick (`#A8443B`)
- **Brand Mark**: Pure Geometric Split Doorway (two balanced pillars divided by a hairline negative space gap)
- **Typography**: `Plus Jakarta Sans` headings + `Inter` body + tabular numerals (`tabular-nums`) for rent metrics.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run on Web
```bash
npx expo start --web
```
Press `w` in terminal or open `http://localhost:8081` in your browser.

### 3. Run on Mobile (iOS / Android)
```bash
npx expo start
```
Scan the QR code with **Expo Go** on iOS or Android.

### 4. Run Test Suite
```bash
npm test
```

---

## Supabase Database Deployment

To deploy to your own Supabase project:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run `supabase/migrations/20261109000000_init_split.sql`.
4. Copy your project URL and anon public key into a `.env` file:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart the Expo app (`npx expo start`). The app automatically connects to your live Supabase database with PostGIS spatial radius queries and real-time WebSockets!

