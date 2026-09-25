# KijijiShare — Hyperlocal Gift Economy & Mutual Aid Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-orange.svg)](https://firebase.google.com/)
[![Google GenAI](https://img.shields.io/badge/Google_GenAI-Gemini_%26_Veo_3-8E75C4.svg)](https://ai.google.dev/)

**KijijiShare** is a production-grade, offline-resilient hyperlocal gift economy and mutual aid web application designed for tightly knit urban neighborhoods. It enables residents within walking distance (1–5 km) to lend tools, gift surplus items, share practical skills, and organize mutual aid—all free of charge, with zero monetary exchange or barter pressure.

---

## 🌟 Table of Contents

- [Core Principles](#-core-principles)
- [Architecture & Platform Features](#-architecture--platform-features)
  - [1. Geospatial Radar & Coordinate Fuzzing](#1-geospatial-radar--coordinate-fuzzing)
  - [2. Algorithmic Anti-Hoarding Engine](#2-algorithmic-anti-hoarding-engine)
  - [3. Community Karma & Peer Verification Protocol](#3-community-karma--peer-verification-protocol)
  - [4. Hyperlocal 1km Real-Time Alert System](#4-hyperlocal-1km-real-time-alert-system)
  - [5. Mutual Aid Needs Board](#5-mutual-aid-needs-board)
  - [6. My Saved Shortlist](#6-my-saved-shortlist)
  - [7. Offline Mesh Resilience & Safe Doorstep Handshakes](#7-offline-mesh-resilience--safe-doorstep-handshakes)
  - [8. Gemini & Veo 3 Multi-Modal AI Suite](#8-gemini--veo-3-multi-modal-ai-suite)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database & Security Rules](#-database--security-rules)
- [Scripts](#-scripts)

---

## 🍃 Core Principles

1. **Pure Gift & Mutual Aid Economy**: No fiat transactions, subscription fees, or tit-for-tat barter expectations.
2. **Hyperlocal Proximity**: Prioritizes exchanges within an immediate 1 km walking zone (~10–15 min stroll) to minimize transit emissions and strengthen block-level community bonds.
3. **Anti-Hoarding & Fair Distribution**: Mathematical claim caps, rolling 7-day allowances, and cool-off pauses prevent bad-faith hoarding and resale arbitrage.
4. **Privacy-Preserving Coordinate Fuzzing**: Protects exact household locations with 300m randomized Gaussian offsets until mutual trust and a scheduled pickup are established.
5. **Decentralized Trust via Peer Vouches**: Replaces predatory ratings with verified neighbor endorsements and transparency ledgers.

---

## 🛠 Architecture & Platform Features

### 1. Geospatial Radar & Coordinate Fuzzing
- **Interactive Geospatial Radar (`GeospatialRadar.tsx`)**: Canvas-rendered radar simulating PostGIS `ST_DWithin` spatial queries, responsive to radius sweeps from 1 km to 5 km.
- **Dynamic Cluster Aggregation**: Automatically clusters dense items with density callouts and individual drill-down inspectors.
- **Coordinate Obfuscation**: Public listings expose an obfuscated location ring ($\pm 300\text{ m}$) until the donor thoughtful selects a recipient and confirms pickup.

### 2. Algorithmic Anti-Hoarding Engine
- **Fair-Share Cap Enforcement (`antiHoardingEngine.ts`, `AntiHoardingLab.tsx`)**:
  - **Concurrent Active Claims**: 2 for Newcomers, 4 for Trusted Neighbors, 6 for Pillars of the Community.
  - **Dynamic Rolling 7-Day Window**:
    $$\text{Limit} = \min\left(8, \left\lfloor 0.5 \times (\text{GiftsGiven} + \text{NeedsMet}) \right\rfloor + 4\right)$$
  - **Sprint Cooldown**: Automatically imposes a 24-hour pause when an account rapidly consumes community surplus without contributing back.
- **Interactive Simulator**: An Anti-Hoarding Lab allows testing scenarios (hoarding attempts, fairness boundaries, tier unlocks) with real-time mathematical validation.

### 3. Community Karma & Peer Verification Protocol
- **Karma Score Formula**:
  $$K = \text{clamp}(0, 100, 50 + 5V + 3G + 5N + 1R - 25P)$$
  *(where $V = \text{Vouches}$, $G = \text{Gifts Given}$, $N = \text{Needs Met}$, $R = \text{Gifts Received}$, $P = \text{No-Shows})$*
- **User Profile Modal & 'Vouch for Neighbor' Flow (`UserProfileModal.tsx`)**:
  - Displays user karma, trust tiers (`NEWCOMER`, `TRUSTED_NEIGHBOR`, `PILLAR_OF_COMMUNITY`, `PROBATION`), and activity stats.
  - **'Verified Neighbor' Badge**: Granted upon receiving peer endorsements.
  - **Vouch Confirmation**: Neighbors submit a mandatory confirmation note and badge endorsement (*Reliable Neighbor*, *Known Neighbor*, *Generous Giver*, *Punctual Pickup*, *Tool Caretaker*, *Skilled Helper*), immediately incrementing the neighbor's vouch score, awarding $+5$ Karma, and updating the public ledger.

### 4. Hyperlocal 1km Real-Time Alert System
- **Real-Time Mesh Dispatcher (`nearbyAlertService.ts`, `NearbyAlertCenter.tsx`)**:
  - Dual connection modes: Simulated low-latency WebSocket mesh and periodic 10-second polling worker.
  - Generates ambient spatial alerts for any new surplus items or urgent mutual aid posted within $\le 1\text{ km}$.
  - Supports browser **Web Push Notifications** (via Notification API) and spatial audio cues (Web Audio API synth).
  - Background simulation pool injects realistic neighbor drops from nearby residents (*Samir Patel, Marina Kowalski, Tariq Al-Mansoor*).

### 5. Mutual Aid Needs Board
- **Community Requests (`NeedsBoard.tsx`)**:
  - Dedicated channels for urgently needed physical items (*e.g., crutches, sewing machines, baby strollers*) and hands-on help (*e.g., senior snow shoveling, heavy garden lifting*).
  - Multi-party volunteer coordination via `OfferHelpModal` and `ReviewOffersDrawer`.

### 6. My Saved Shortlist
- **Persistent Bookmarks (`MySavedListings.tsx`)**:
  - One-tap heart toggle on feed cards, needs, and radar inspectors.
  - LocalStorage-backed state survives reloads and offline sessions.
  - Quick sub-filters for *Gifts & Tools*, *Skills & Help*, and *Mutual Aid Needs* with walk-time calculations.

### 7. Offline Mesh Resilience & Safe Doorstep Handshakes
- **Simulated Offline Mesh Mode**:
  - Allows offline browsing, pitch drafting, and listing generation.
  - Mutations are queued to a pending synchronization queue and synced to Firestore once connection restores.
- **Pickup Coordinator (`PickupCoordinatorModal.tsx`)**:
  - Doorstep handshake protocol with agreed pickup time windows, porch notes, and mutual completion confirmation.

### 8. Gemini & Veo 3 Multi-Modal AI Suite
Integrated through server-side proxy routes in `server.ts` utilizing the official `@google/genai` SDK:
- **Community Concierge (`GeminiChatbot.tsx`)**: Multi-turn mediator powered by `gemini-3.5-flash`, `gemini-3.1-pro-preview`, or `gemini-3.1-flash-lite`.
- **Google Maps Grounding Safe Meetup Finder (`MapsGroundingFinder.tsx`)**: Finds well-lit public transit hubs, libraries, and park pavilions for safe exchanges via `gemini-3.5-flash` with Google Maps tool grounding.
- **Veo 3 Video Generator (`VeoVideoGenerator.tsx`)**: Generates community stories and neighborly showcase clips via `veo-3.1-fast-generate-preview` in 16:9 or 9:16 aspect ratios.
- **Live Voice Studio (`LiveVoiceStudio.tsx`)**: Conversational spoken aid and listing assistant powered by `gemini-3.8-live`.

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion |
| **Backend** | Node.js, Express, TSX, Vite Middlewares |
| **Database & Auth** | Google Firebase Authentication, Cloud Firestore |
| **AI / Machine Learning** | Google GenAI SDK (`@google/genai`), Gemini 3.5 Flash, Gemini 3.1 Pro, Veo 3.1, Gemini Live |
| **Geospatial & Storage** | Haversine formula distance calculations, LocalStorage persistence, Web Audio API, Web Push API |

---

## 📂 Project Structure

```
├── .env.example                  # Environment configuration template
├── firebase-applet-config.json   # Provisioned Firebase app configuration
├── firebase-blueprint.json       # Firestore database schema & collections
├── firestore.rules               # Firestore security rules
├── metadata.json                 # AI Studio applet metadata & capabilities
├── package.json                  # Dependencies and scripts
├── server.ts                     # Full-stack Express server & Gemini API proxy routes
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build configuration with Tailwind CSS v4
└── src/
    ├── App.tsx                   # Main state container and application shell
    ├── main.tsx                  # React DOM mount point
    ├── index.css                 # Global styles and Tailwind CSS v4 imports
    ├── types/
    │   └── index.ts              # Core domain models (User, Listing, Vouch, KarmaEvent)
    ├── data/
    │   └── seedData.ts           # Hyperlocal seed listings, users, and geographic centers
    ├── services/
    │   ├── antiHoardingEngine.ts # Fairness rules, claim caps, and karma algorithms
    │   ├── geoService.ts         # Haversine distance, walk times, coordinate formatting
    │   └── nearbyAlertService.ts # 1km notification engine, audio chimes, simulation pool
    ├── firebase/
    │   └── config.ts             # Firebase Auth & Firestore client setup and helpers
    └── components/
        ├── TopNav.tsx                 # Header navigation, persona switcher, alert count
        ├── NeighborhoodPulse.tsx      # Surplus gifts, lending, and skill feed
        ├── NeedsBoard.tsx             # Mutual aid requests and volunteer coordination
        ├── MySavedListings.tsx        # Bookmarked shortlist with category filters
        ├── GeospatialRadar.tsx        # Canvas radar map and 1-5km radius inspector
        ├── UserProfileModal.tsx       # Profile view, verified badge, and 'Vouch for Neighbor'
        ├── KarmaLedgerModal.tsx       # Community karma ledger and audit history
        ├── KarmaModal.tsx             # Post-transaction karma & badge award modal
        ├── PickupCoordinatorModal.tsx # Doorstep handshake and pickup scheduler
        ├── ExpressionSelectionDrawer.tsx # Giver review drawer for interested seekers
        ├── ReviewOffersDrawer.tsx     # Seeker review drawer for mutual aid helpers
        ├── ExpressInterestModal.tsx   # Seeker pitch submission modal
        ├── OfferHelpModal.tsx         # Volunteer response to mutual aid needs
        ├── NewListingModal.tsx        # Multi-category listing creation modal
        ├── AntiHoardingLab.tsx        # Interactive mathematical fairness simulator
        ├── ArchitectureSpec.tsx       # System architecture documentation tab
        ├── NearbyAlertToast.tsx       # Floating 1km proximity alert banner
        ├── NearbyAlertCenter.tsx      # Drawer for notification history & push settings
        ├── GeminiChatbot.tsx          # Multi-turn concierge AI chat
        ├── MapsGroundingFinder.tsx    # Google Maps grounded safe meetup locator
        ├── VeoVideoGenerator.tsx      # Veo 3 video generator with status polling
        └── LiveVoiceStudio.tsx        # Gemini Live voice conversation studio
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- NPM or Bun package manager
- Google Gemini API Key (for AI capabilities)

### Installation

1. **Clone or open the repository**:
   ```bash
   git clone <repo-url>
   cd kijijishare
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🔑 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key for server-side endpoints | Required for AI features |
| `PORT` | Local server port for Express and Vite | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |

---

## 🔒 Database & Security Rules

Firestore security rules (`firestore.rules`) enforce user role isolation and anti-tamper permissions:
- **`users` Collection**: Publicly readable; profile data writable only by authenticated owners, with vouch updates guarded by peer verification.
- **`listings` Collection**: Publicly readable for active items; modifications restricted to original authors (`giverId`).
- **`claimRequests` & `vouches`**: Sub-collections validated against caller identity and trust constraints.

---

## 📜 Available Scripts

- `npm run dev`: Runs the full-stack Express server with Vite middleware on port 3000.
- `npm run build`: Compiles TypeScript and generates production frontend assets via Vite.
- `npm run start`: Runs the production server (`tsx server.ts`).
- `npm run lint`: Performs strict TypeScript static analysis without emitting files (`tsc --noEmit`).
- `npm run clean`: Cleans up the `dist` build directory.

---

## 🤝 Community Guidelines & Mutual Aid Agreement

1. **Never Charge Money**: All items, lending, tools, and assistance offered on KijijiShare are 100% free gifts.
2. **Be Punctual**: Arrive on time for agreed porch pickups or notify the giver promptly to preserve karma standing.
3. **Respect Privacy**: Never share a neighbor's door code, private address, or personal contact info outside the platform.
4. **Vouch Honestly**: Endorse neighbors whose reliability and care you have directly observed.
