# Split — Tinder for Roommates

<p align="center">
  <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" alt="Split Hero Banner" width="100%" style="border-radius: 16px; max-height: 380px; object-fit: cover;" />
</p>

<p align="center">
  <strong>A high-craft, mobile-first roommate matching application designed to eliminate brokerage extortion, societal policing, and dietary friction when finding roommates in India.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK_52-black?style=flat-square&logo=expo" alt="Expo SDK 52" />
  <img src="https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat-square&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Reanimated-v3.16-9900FF?style=flat-square" alt="Reanimated v3" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL_%2B_PostGIS-3ECF8E?style=flat-square&logo=supabase" alt="Supabase PostGIS" />
  <img src="https://img.shields.io/badge/Design-Architectural_Warmth-C25E36?style=flat-square" alt="Architectural Warmth" />
  <img src="https://img.shields.io/badge/Currency-INR_(₹)-success?style=flat-square" alt="Currency INR" />
  <img src="https://img.shields.io/badge/Distance-Metric_(km)-blue?style=flat-square" alt="Metric Distance" />
  <img src="https://img.shields.io/badge/Tests-8%2F8_Passing-2E7D5B?style=flat-square" alt="Tests Passing" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License" />
</p>

---

## India-First Launch: Solving Indian Urban Rental Realities

Finding a compatible roommate in India's booming tech corridors (Bengaluru, Mumbai, Delhi NCR, Pune, Hyderabad) is notoriously broken. Traditional channels like chaotic Flat & Flatmates Facebook groups, brokerage listing sites, and broker WhatsApp circles force young professionals to endure:

1. **1–2 Month Brokerage Extortion**: Brokers extract ₹20,000–₹50,000+ non-refundable commission fees just for a single room lead or flatmate replacement. Split completely eliminates broker middleman fees through peer-to-peer roommate matching.
2. **Restrictive Society & RWA Bachelor Policing**: Resident Welfare Associations (RWAs) and conservative housing societies subject bachelors to curfew restrictions, moral policing, and visitor bans. Split helps vetted professionals band together with co-tenants who understand and navigate these constraints.
3. **Dietary Matching (Pure Veg vs. Non-Veg Disputes)**: Kitchen conflicts between strict vegetarians/Jain food eaters and non-vegetarians are one of the most common causes of Indian roommate fallout. Split introduces mandatory dietary preference filtering (`Pure Veg`, `Vegetarian`, `Eggetarian`, `Non-Veg`, `Jain Food`) directly in swipe cards and lifestyle matrices.
4. **Domestic Maid & Cook Expense Splitting**: Shared household operations—splitting domestic maid salaries, cook fees, grocery allowances, and maintenance bills—frequently cause awkward interpersonal friction. Split aligns habits, hygiene benchmarks, and budget expectations upfront.

### Top Launch Hubs & Tech Corridors

Split is pre-calibrated with spatial radar nodes covering major urban IT and commercial hubs:

| Hub | Key Neighborhoods & Corridors Covered | Coordinates |
| :--- | :--- | :--- |
| **Bengaluru** *(Primary Launch)* | Koramangala, Indiranagar, HSR Layout, Bellandur, Whitefield | `12.9352, 77.6245` |
| **Mumbai** | Bandra West, Andheri West, Powai | `19.0596, 72.8295` |
| **Delhi NCR** | DLF Cyber City (Gurgaon), Sector 62 (Noida), Hauz Khas | `28.4950, 77.0895` |
| **Pune** | Koregaon Park, Viman Nagar, Hinjawadi | `18.5362, 73.8940` |
| **Hyderabad** | Hitec City, Gachibowli, Madhapur, Kondapur | `17.4435, 78.3772` |

---

## The Split Core Architecture

```
                                      +---------------------------------------------+
                                      |            SPLIT CLIENT APPLICATION         |
                                      |  (Expo SDK 52 - iOS / Android / Web)        |
                                      +---------------------------------------------+
                                                             |
                                           [IRoommateService Abstraction]
                                                             |
                       +-------------------------------------+-------------------------------------+
                       |                                                                           |
                       v                                                                           v
         +----------------------------+                                              +----------------------------+
         |     MockRoommateService    |                                              |   SupabaseRoommateService  |
         |  - In-memory Indian seeds  |                                              |  - PostGIS Spatial RPC     |
         |  - AsyncStorage cache (v2) |                                              |  - PostgreSQL Triggers     |
         |  - Auto-reply simulation   |                                              |  - Row Level Security (RLS)|
         |  - Zero-config offline     |                                              |  - Realtime WebSockets     |
         +----------------------------+                                              +----------------------------+
                       |                                                                           |
                       +-------------------------------------+-------------------------------------+
                                                             |
                                                             v
                                              +-----------------------------+
                                              |      Zustand Store Engine   |
                                              |  (Reactive Feed & Messages) |
                                              +-----------------------------+
```

---

## Signature Features

### 1. 60fps Tinder-Style Pan Physics
- Full-card gesture tracking via `react-native-gesture-handler` and `react-native-reanimated` v3.
- Sub-pixel rotation and spring interpolation (`damping: 18, stiffness: 200`).
- Stamp overlays tuned to architectural tokens:
  - **LIKE**: Subdued Sage (`#2E7D5B`)
  - **NOPE**: Muted Brick (`#A8443B`)
  - **SUPERLIKE**: Muted Terracotta (`#C25E36`)
- Programmatic bottom controls: 44px tactile Rewind (Undo), Pass, Superlike, Like, and Info.

### 2. Dual-Mode Pairing Engine
| Mode | Perspective | Key Data Captured |
| :--- | :--- | :--- |
| **"Offers Room"** (`have_room`) | User has an apartment flat in a gated society with an open private bedroom. | Monthly rent split (₹/mo), security deposit, private bath, in-unit laundry, parking, room photos, masked address. |
| **"Looking to Team Up"** (`need_room`) | User is seeking a flatmate to co-lease a 2BHK or 3BHK flat together. | Target budget ceiling (₹/mo), lease duration, move-in window, target relocation tech corridor. |

### 3. Split Photo Card (Person vs Room)
Users offering a room feature an interactive split segmented toggle floating on the card portrait:
- **Person View**: High-resolution profile photography, age, profession, verification badge.
- **Room View**: Instant transition to actual bedroom interior photos, showing natural light, floor plan, and space.

### 4. Side-by-Side Habit Split Matrix
Tapping any profile card opens a full sheet detailing direct lifestyle compatibility:

```
+-----------------------------------------------------------------------+
|  LIVING HABITS SPLIT COMPARISON                     [✓ Compatibility] |
+-----------------------------------------------------------------------+
|  Habit                  | You                     | Roommate Candidate|
+-------------------------+-------------------------+-------------------+
|  Cleanliness            | 4/5 (Clean & Tidy)      | 4/5 (Clean & Tidy)|
|  Dietary Preference     | Vegetarian              | Pure Veg          |
|  Sleep Schedule         | Flexible                | Night Owl         |
|  Work Style             | Hybrid                  | Hybrid            |
|  Pet Policy             | Pet-friendly            | Has Pets (Cat)    |
|  Smoking Policy         | Non-smoker              | Non-smoker        |
|  Guest Policy           | Weekends only           | Rarely            |
+-----------------------------------------------------------------------+
```

### 5. Dual Vicinity & Spatial Radar Engine
- **Live GPS Mode**: Requests foreground permissions via `expo-location` and queries candidates using PostGIS `ST_DWithin` (or client Haversine geodesic calculations).
- **Target Tech Corridors**: Pre-calibrated coordinates for Indian metropolitan nodes (Koramangala, Indiranagar, HSR, Bandra, Cyber City, Hitec City).
- **Dynamic Distance Radius Slider**: Calibrated in metric units (3 km, 5 km, 10 km, 15 km, 25 km, 40 km) with auto-updating candidate distance badges (`5.4 km away`).

### 6. Reciprocal Match Celebration & Real-Time Chat
- Swiping right on a reciprocal candidate automatically triggers the full-screen **"It's a Match!"** celebration modal.
- 1-on-1 messaging screen with optimistic client append, unread status indicators, and simulated auto-replies in offline mode.
- Header banner displays monthly rent split formatted in Indian numbering (`₹18,000/mo split • Indiranagar, Bengaluru`).
- Top-shelf horizontal new match carousel with unread pulse rings.

### 7. Trust, Safety & Anti-Scam Shield
- In-app reporting flow with structured categories: *Scam / Fake Listing*, *Harassment*, *Inappropriate Photos*, *Spam*.
- **1-Tap Block & Purge**: Blocks instantly sever mutual matches, purge conversations, and permanently exclude candidate IDs from future discovery feeds.
- Built-in Safety Guidelines drawer detailing lease verification, visiting gated societies during daylight, avoiding token advance payments to unverified accounts, and verifying landlord agreements.

---

## Design System: Architectural Warmth

Split deliberately rejects the generic "AI startup" visual tropes — **zero purple/violet gradients, zero glowing blob halos, zero gradient text, zero emoji labels**.

The aesthetic draws inspiration from mid-century editorial design and architectural material palettes:

```
  LIGHT MODE (Warm Oat & Paper)            DARK MODE (Roasted Espresso)
  +-------------------------------+        +-------------------------------+
  | Canvas:      #F4EFE6 (Oat)    |        | Canvas:      #191614 (Espresso)|
  | Surface:     #FCFAF5 (Ivory)  |        | Surface:     #231F1C (Stone)   |
  | Subtle:      #E9E2D5 (Biscuit)|        | Subtle:      #2E2925 (Subtle)  |
  | Ink:         #2B231D (Ink)    |        | Text:        #F4F0EB (Bone)    |
  | Accent:      #C25E36 (Terrac.)|        | Accent:      #C25E36 (Terrac.) |
  +-------------------------------+        +-------------------------------+
```

### Mobile Ergonomics & Redline Standards
- **Touch Target Parity**: All interactive buttons, icon pills, and controls adhere strictly to `>= 44x44px` physical touch targets (Apple HIG / W3C).
- **iOS Viewport Zoom Defense**: All `<TextInput>` fields enforce `fontSize >= 16px` to prevent Mobile Safari from forcing disruptive auto-zoom on input focus.
- **Tabular Numerals**: Rupee amounts (`₹18,000/mo split`) and distance metrics (`5.4 km away`) use `fontMono` tabular formatting to eliminate layout reflow.
- **Brand Mark**: Pure geometric split doorway SVG in [SplitLogo.tsx](file:///d:/Projects/Tinder%20for%20Roomates/src/components/brand/SplitLogo.tsx) representing two balanced pillars divided by hairline negative space.

---

## Database Architecture (Supabase / PostgreSQL + PostGIS)

The production migration lives at `supabase/migrations/20261109000000_init_split.sql`.

### Core Tables & Relations
- `profiles`: Primary account details, budget bounds in INR, dietary preferences, lifestyle attributes, and `target_location` (`GEOMETRY(Point, 4326)`).
- `rooms`: Sub-table enforcing `uq_rooms_owner_id UNIQUE(owner_id)` for 1-to-1 room listings with rent metrics and spatial coordinates.
- `swipes`: User actions (`like`, `pass`, `superlike`) with unique constraint on `(swiper_id, target_id)`.
- `matches`: Canonical ordering `CHECK (user_a < user_b)` preventing duplicate reciprocal match rows.
- `messages`: 1-on-1 chat history scoped strictly to match participants.
- `user_reports`: Safety flags and permanent block records.

### Automated Triggers
- `on_swipe_upserted`: When a like/superlike is submitted, checks for reciprocal swipe; if found, automatically inserts canonical match into `public.matches`.
- `on_swipe_deleted`: When a user triggers Rewind (Undo), automatically cleans up the reciprocal match.
- `on_user_blocked`: Immediately deletes active match and conversation history when a block is issued.

### Security Hardening (Production-Grade RLS)
- **Search Path Isolation**: All 5 `SECURITY DEFINER` functions explicitly declare `SET search_path = public, extensions, pg_temp;` to prevent search path hijacking.
- **Identity Spoofing Prevention**: Spatial RPC `get_roommate_feed()` strictly validates `auth.uid() IS NOT NULL` and asserts `current_user_id IS NOT DISTINCT FROM auth.uid()`.
- **PostgREST Injection Defense**: Client validates all IDs against strict RFC 4122 v1-v5 UUID regex before dispatching queries.
- **Row Level Security**: All 6 tables enabled with RLS. Swipes, messages, and room edits cannot be accessed or mutated outside authenticated ownership.

---

## Directory Structure

```
split/
├── app/                                # Expo Router v4 File-Based Routing
│   ├── _layout.tsx                     # Root font gates, theme context, safe areas
│   ├── (tabs)/                         # Bottom Tab Navigation Group
│   │   ├── _layout.tsx                 # Tab bar styling & icons
│   │   ├── index.tsx                   # Discover Screen (Tinder card deck & header)
│   │   ├── matches.tsx                 # Matches Carousel & Chat Inbox
│   │   └── profile.tsx                 # User Profile & Public Card Preview
│   ├── chat/
│   │   └── [id].tsx                    # 1-on-1 Realtime Chat Screen
│   └── profile/
│       └── edit.tsx                    # Profile, Lifestyle & Room Editor Screen
│
├── src/
│   ├── components/
│   │   ├── brand/                      # SplitLogo geometric doorway SVG
│   │   ├── chat/                       # ChatBubble, ChatInput (16px zoom defense)
│   │   ├── filters/                    # FilterModal (INR budget, mode, radius in km)
│   │   ├── location/                   # LocationPickerModal (GPS + Indian City presets)
│   │   ├── match/                      # MatchCelebrationModal ("It's a Match!")
│   │   ├── profile/                    # LifestyleSelector questionnaire
│   │   ├── room/                       # RoomEditor listing & amenity form
│   │   ├── safety/                     # ReportUserModal & SafetyGuidelinesModal
│   │   └── swipe/                      # SwipeCard, CardDeck, ActionButtons, EmptyDeckView
│   │
│   ├── services/
│   │   ├── IRoommateService.ts         # Standardized repository interface
│   │   ├── mockData.ts                 # 12 diverse, high-res pre-seeded Indian profiles
│   │   ├── mockRoommateService.ts      # Zero-config offline mock engine (v2 cache)
│   │   ├── supabaseRoommateService.ts  # Cloud Supabase + PostGIS metric RPC client
│   │   ├── roommateService.ts          # Environmental factory provider
│   │   ├── locationService.ts          # Haversine metric (km) distance & Expo GPS provider
│   │   └── safetyService.ts            # Local report persistence & audit logger
│   │
│   ├── store/
│   │   └── useAppStore.ts              # Zustand global application state (INR + km)
│   │
│   ├── theme/
│   │   ├── tokens.ts                   # Architectural Warmth tokens (light/dark)
│   │   └── useAppTheme.ts              # Theme hook with system preference support
│   │
│   └── utils/
│       └── security.ts                 # RFC 4122 UUID validation & injection defense
│
├── supabase/
│   └── migrations/
│       └── 20261109000000_init_split.sql # Complete PostgreSQL DDL + PostGIS metric RPC
│
├── __tests__/                          # Jest Unit & Integration Test Suites
│   ├── store.test.ts                   # Zustand swipe, rewind, filter tests
│   └── security.test.ts                # UUID validation & injection defense tests
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- (Optional) Expo Go on your physical iOS or Android device

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/TEA-21/Split.git
cd Split
npm install --legacy-peer-deps
```

### 2. Launch Development Server
```bash
# Start Expo development server
npx expo start
```

- **Run in Browser**: Press `w` in your terminal or navigate to `http://localhost:8081`.
- **Run on Android**: Press `a` (requires Android Studio Emulator running).
- **Run on iOS**: Press `i` (requires Xcode Simulator on macOS).
- **Run on Physical Device**: Scan the terminal QR code using the **Expo Go** app.

### 3. Run Automated Tests
```bash
# Run Jest test suites
npm test

# Type-check TypeScript codebase
npx tsc --noEmit

# Test production Web bundle export
npx expo export --platform web
```

---

## Supabase Cloud Deployment

Split works out of the box with zero configuration via its offline mock engine. To connect to a live cloud Supabase database:

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Paste and execute the contents of [20261109000000_init_split.sql](file:///d:/Projects/Tinder%20for%20Roomates/supabase/migrations/20261109000000_init_split.sql).
4. Create a `.env` file in the project root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Restart Expo (`npx expo start -c`). The application automatically switches to cloud mode, executing real PostGIS radius queries and real-time message sync!

---

## Contributing & License

Contributions, bug reports, and suggestions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Distributed under the **MIT License**. See `LICENSE` for details.

Developed with care by **TEA-21** (`taanushabrahm@gmail.com`).
