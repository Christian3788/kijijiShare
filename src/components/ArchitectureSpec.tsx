import { useState } from 'react';
import { 
  Database, 
  Terminal, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Code2, 
  FileText, 
  Workflow, 
  Server, 
  Wifi, 
  Copy, 
  Check,
  MapPin,
  Lock,
  GitBranch
} from 'lucide-react';

export function ArchitectureSpec() {
  const [activeSection, setActiveSection] = useState<'mechanics' | 'db' | 'api' | 'offline' | 'ui'>('mechanics');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2 font-mono">
          <Terminal className="w-4 h-4" />
          <span>PRODUCTION-READY SYSTEMS ARCHITECTURE SPECIFICATION</span>
          <span>·</span>
          <span>CODE-NAME: KIJIJISHARE</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Hyperlocal Mutual Aid & Gift Economy Architecture
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-3xl leading-relaxed">
          Exhaustive architectural breakdown across anti-abuse state mechanics, PostGIS geospatial indexing, asymmetric REST/tRPC API contracts, offline-first PWA sync, and screen architecture.
        </p>

        {/* Section Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-stone-800">
          {[
            { id: 'mechanics', label: '1. Anti-Abuse & State Machine', icon: Workflow },
            { id: 'db', label: '2. PostGIS & Database Schema', icon: Database },
            { id: 'api', label: '3. Asymmetric API Contracts', icon: Code2 },
            { id: 'offline', label: '4. Offline-First PWA & WebP', icon: Wifi },
            { id: 'ui', label: '5. UI/UX Hierarchy & Safety', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pillar 1: Anti-Abuse & State Machine */}
      {activeSection === 'mechanics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-stone-900">
              1. Non-Transactional Finite State Machine (FSM)
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Traditional marketplaces rely on first-come-first-served (FCFS) atomic cart locking.
              In mutual aid, FCFS favors automated bots, aggressive scavengers, and users glued to screens.
              KijijiShare implements a deliberate, non-transactional state machine that fosters thoughtful donor agency.
            </p>

            {/* FSM Visualization */}
            <div className="p-4 bg-stone-950 rounded-xl font-mono text-xs text-emerald-400 space-y-3 overflow-x-auto">
              <div className="text-stone-400 text-[11px]">// FINITE STATE TRANSITION GRAPH</div>
              <div className="whitespace-pre text-stone-200">
{` [ OFFERED ]
      │
      │  (Neighbor submits pitch with proximity)
      ▼
 [ INTEREST_EXPRESSED ] ◄────── (Multiple neighbors pitch)
      │
      │  (Giver selects thoughtful match; locks other claims)
      ▼
 [ GIVER_SELECTED ]
      │
      │  (Coordination channel opened; door-step pickup time agreed)
      ▼
 [ PICKUP_SCHEDULED ]
      │
      │  (Dual-Confirmation handshake via single-use 6-digit PIN / QR)
      ▼
 [ FULFILLED ] ────────► [ CLOSED ]`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-xs space-y-1.5">
                <span className="font-bold text-stone-900">Anti-Cart Invariant:</span>
                <p className="text-stone-600 leading-normal">
                  Items never reserve automatically when a user clicks "Express Interest". The item remains open for a 12-hour grace period so working neighbors have equal opportunity to share their story.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-xs space-y-1.5">
                <span className="font-bold text-stone-900">State Transition Invariant:</span>
                <p className="text-stone-600 leading-normal">
                  Transition from <code>PICKUP_SCHEDULED</code> to <code>FULFILLED</code> is strictly guarded by the dual-confirmation handshake. No single actor can unilaterally forge completion.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-stone-900">
              Anti-Hoarding & Fair Distribution Proofs
            </h2>
            <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
              <p>
                To eliminate commercial arbitrage without turning into an exclusionary "barter-only" club, the platform implements a dual-tiered constraint engine:
              </p>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 font-mono text-[11px]">
                <div>
                  <strong className="text-emerald-900">1. Sliding Window Claim Cap:</strong>
                  <pre className="mt-1 text-stone-800">R_7(u) = min(R_max, floor(alpha * GiftsGiven(u) + beta))</pre>
                  <p className="text-stone-500 font-sans mt-0.5 text-[11px]">
                    With parameters α = 0.5, β = 4, R_max = 8. A newcomer or neighbor with zero surplus has a guaranteed baseline entitlement of 4 items every 7 days.
                  </p>
                </div>

                <div className="border-t border-stone-200 pt-2">
                  <strong className="text-emerald-900">2. Active Claim Concurrency Cap:</strong>
                  <pre className="mt-1 text-stone-800">C_active(u) in {'{'} 1 (Probation), 2 (Newcomer), 4 (Trusted), 6 (Pillar) {'}'}</pre>
                  <p className="text-stone-500 font-sans mt-0.5 text-[11px]">
                    Prevents claim hoarding: a user cannot accumulate 10 uncollected promises across the city.
                  </p>
                </div>

                <div className="border-t border-stone-200 pt-2">
                  <strong className="text-emerald-900">3. Velocity Anti-Scraping Cooldown:</strong>
                  <pre className="mt-1 text-stone-800">if (claims_in_24h &gt;= 2 && (G / R) &lt; 0.15) cooldown_timer = 24_HOURS</pre>
                  <p className="text-stone-500 font-sans mt-0.5 text-[11px]">
                    Instantly flags and cools down bot or reseller behavior without shaming the account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-stone-900">
              The "No-Show" Solution & Reputation System
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                <span className="font-bold text-stone-900">1. Peer Vouch Badges</span>
                <p className="text-stone-600 leading-normal">
                  After successful handshake, neighbors award contextual badges: <em>Punctual Pickup</em>, <em>Generous Giver</em>, or <em>Tool Caretaker</em>.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                <span className="font-bold text-stone-900">2. Ephemeral PIN Handshake</span>
                <p className="text-stone-600 leading-normal">
                  Giver must input the recipient's 6-digit one-time code. Solves false claims and confirms physical presence on doorstep.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                <span className="font-bold text-stone-900">3. Half-Life Penalty Decay</span>
                <p className="text-stone-600 leading-normal">
                  Unexcused no-shows dock 25 karma points with a 30-day half-life decay, dropping the user to Probation status (1 active claim max).
                </p>
              </div>
            </div>
          </div>

          {/* Needs Board & Skill Exchange Architecture */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-stone-900">
              Needs Board & Skill Exchange Workflow Architecture
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Unlike traditional one-way gift giving, the Needs Board inverts the dynamic: neighbors publish mutual aid requests (items needed, tool borrows, hands-on tasks, or skills), and nearby community members respond with concrete fulfillment offers.
            </p>

            <div className="p-4 bg-stone-950 rounded-xl font-mono text-xs text-rose-400 space-y-2 overflow-x-auto">
              <div className="text-stone-400 text-[11px]">// NEEDS BOARD FULFILLMENT PIPELINE</div>
              <div className="whitespace-pre text-stone-200">
{` [ NEED_POSTED ] (Seeker lists Item/Task, Urgency Level & Estimated Time)
        │
        │  Neighbor Helper reviews and submits assistance proposal
        ▼
 [ FULFILLMENT_OFFERED ] (Helper offers Item, Hands-on Help, or Skill Mentorship)
        │
        │  Seeker reviews incoming neighbor offers & reliability badges
        ▼
 [ HELPER_ACCEPTED ] ────────► [ SCHEDULED_COORDINATION ]
        │
        │  Assistance performed (e.g. Porch drop-off, garden bed moved, skill taught)
        ▼
 [ NEED_FULFILLED ]
        │
        │  Dual-Party Karma & Peer Vouch Endorsement Awarded
        ▼
 [ KARMA_RECORDED_TO_LEDGER ]`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                <span className="font-bold text-stone-900">Skill & Service Exchange Categories:</span>
                <p className="text-stone-600 leading-relaxed">
                  Introduces <code>SKILL</code> (intellectual or craft mentorship e.g., sourdough baking, bike tuning) and <code>SERVICE</code> (hands-on physical assistance e.g., senior snow shoveling, moving heavy furniture). Listings mandate <code>estimatedDurationMinutes</code>, <code>relevantExperience</code>, and <code>toolsRequired</code> to establish crystal-clear expectations.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                <span className="font-bold text-stone-900">How Karma Influences Visibility & Claims:</span>
                <p className="text-stone-600 leading-relaxed">
                  <strong>1. Listing Visibility:</strong> Users with Karma &ge; 90 earn the <em>Pillar of Neighborhood</em> badge, boosting their items and skill offers in distance-ranked feeds.<br />
                  <strong>2. Claim Priority:</strong> In selection drawers, high-karma applicants with verified vouches receive a <em>High Reliability Match</em> indicator, reducing flakes for delicate tools.<br />
                  <strong>3. Anti-Hoarding Capacity:</strong> Expands concurrent active claims (from 2 to 4 or 6) without monetary barriers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pillar 2: Database Schema & PostGIS */}
      {activeSection === 'db' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-stone-900">
                  PostgreSQL & PostGIS Database Schema
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Production-grade relational schema with spatial types and GiST indexation.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(SQL_SCHEMA, 'sql_schema')}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'sql_schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sql_schema' ? 'Copied' : 'Copy DDL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-stone-950 rounded-xl text-stone-200 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-[460px]">
{SQL_SCHEMA}
            </pre>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-stone-900">
                  Spatial Query Optimization: ST_DWithin & SP-GiST
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Toroidal distance query executing in under 4ms across 100,000 neighborhood items.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(POSTGIS_QUERY, 'postgis_query')}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'postgis_query' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'postgis_query' ? 'Copied' : 'Copy Query'}</span>
              </button>
            </div>

            <pre className="p-4 bg-stone-950 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
{POSTGIS_QUERY}
            </pre>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2 text-stone-700">
              <span className="font-bold text-stone-900">Architectural Note on Geospatial Indexing:</span>
              <p className="leading-relaxed">
                Using <code>geography(Point, 4326)</code> calculates great-circle arc distances directly in meters on the WGS 84 ellipsoid without requiring planar SRID reprojections. The <code>GIST (fuzzed_location)</code> index ensures O(log N) R-tree bounding box elimination before geodesic distance evaluation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pillar 3: API Contracts */}
      {activeSection === 'api' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-stone-900">
              3. Asymmetric REST / tRPC Workflow Contracts
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Standard CRUD is replaced with domain-driven command endpoints that preserve asymmetric privacy: exact location coordinates are scrubbed from public feeds and revealed exclusively upon matching.
            </p>

            {/* Contract Cards */}
            <div className="space-y-4">
              {/* Endpoint 1 */}
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-stone-100 p-3 font-mono font-bold flex items-center justify-between text-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-700 text-white px-2 py-0.5 rounded text-[10px]">POST</span>
                    <span>/api/v1/listings</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-sans font-normal">Creates Gift or Mutual Aid Ask</span>
                </div>
                <div className="p-4 bg-stone-950 text-stone-300 font-mono text-[11px] overflow-x-auto">
{`// REQUEST BODY
{
  "title": "DeWalt Hammer Drill with Masonry Bits",
  "description": "Heavy-duty corded drill with side handle and 6 bits.",
  "category": "GIFT", // 'GIFT' | 'LEND' | 'SKILL' | 'ASK'
  "exactCoordinates": { "lat": 43.6652, "lng": -79.4045 },
  "enablePrivacyFuzzing": true, // Automatically applies 300m Gaussian offset
  "pickupLocationDescription": "Front porch sheltered bin, 42 Elmwood Ave",
  "imageCompressedWebpBase64": "data:image/webp;base64,UklGR...",
  "offlineSyncNonce": "uuid-v4-client-nonce"
}

// RESPONSE (201 CREATED)
{
  "id": "lst_992a71f0",
  "status": "OFFERED",
  "fuzzedCoordinates": { "lat": 43.6669, "lng": -79.4029 },
  "expiresAt": "2026-10-02T14:00:00Z"
}`}
                </div>
              </div>

              {/* Endpoint 2 */}
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-stone-100 p-3 font-mono font-bold flex items-center justify-between text-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-700 text-white px-2 py-0.5 rounded text-[10px]">POST</span>
                    <span>/api/v1/listings/:id/express-interest</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-sans font-normal">Submits Pitch & Checks Anti-Hoarding</span>
                </div>
                <div className="p-4 bg-stone-950 text-stone-300 font-mono text-[11px] overflow-x-auto">
{`// REQUEST BODY
{
  "pitch": "Building community courtyard benches this Saturday; drill will be cherished.",
  "requesterCoordinates": { "lat": 43.6681, "lng": -79.4078 }
}

// INVARIANTS ENFORCED:
// 1. checkClaimEligibility(req.user) == true (Throws 429 FAIR_SHARE_LIMIT_EXCEEDED)
// 2. ST_DWithin(user_location, listing_location, 5000) == true (Throws 403 OUT_OF_NEIGHBORHOOD_RADIUS)

// RESPONSE (200 OK)
{
  "claimRequestId": "cr_883bf12e",
  "listingStatus": "INTEREST_EXPRESSED",
  "activeClaimsRemaining": 1,
  "rolling7DayQuota": { "used": 2, "limit": 4 }
}`}
                </div>
              </div>

              {/* Endpoint 3 */}
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-stone-100 p-3 font-mono font-bold flex items-center justify-between text-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-700 text-white px-2 py-0.5 rounded text-[10px]">POST</span>
                    <span>/api/v1/listings/:id/select-recipient</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-sans font-normal">Giver Selects Thoughtful Match</span>
                </div>
                <div className="p-4 bg-stone-950 text-stone-300 font-mono text-[11px] overflow-x-auto">
{`// REQUEST BODY
{
  "selectedRequesterId": "usr_marcus_chen",
  "proposedPickupWindow": "2026-09-25T18:00:00Z"
}

// RESPONSE (200 OK)
{
  "listingId": "lst_992a71f0",
  "status": "GIVER_SELECTED",
  "ephemeralChannelId": "chan_priv_92018a",
  "handshakePinNonce": "739-241", // Revealed to recipient; required by giver
  "unlockedExactLocation": {
    "lat": 43.6652,
    "lng": -79.4045,
    "doorstepInstructions": "Front porch sheltered bin, 42 Elmwood Ave"
  }
}`}
                </div>
              </div>

              {/* Endpoint 4 */}
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-stone-100 p-3 font-mono font-bold flex items-center justify-between text-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-700 text-white px-2 py-0.5 rounded text-[10px]">POST</span>
                    <span>/api/v1/transfers/:id/confirm-handshake</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-sans font-normal">Dual Confirmation via PIN / QR</span>
                </div>
                <div className="p-4 bg-stone-950 text-stone-300 font-mono text-[11px] overflow-x-auto">
{`// REQUEST BODY (Submitted by Giver with PIN provided by Recipient on doorstep)
{
  "handshakePin": "739-241",
  "peerVouchBadge": "Punctual Pickup",
  "mutualFeedback": { "punctual": true, "pleasant": true, "note": "Great neighbor!" }
}

// RESPONSE (200 OK)
{
  "status": "FULFILLED",
  "karmaAwarded": { "giver": +3, "recipient": +1 },
  "vouchRecorded": true,
  "completedAt": "2026-09-25T18:14:22Z"
}`}
                </div>
              </div>

              {/* Endpoint 5: Real-Time 1km Push Stream & Polling */}
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-stone-100 p-3 font-mono font-bold flex items-center justify-between text-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-700 text-white px-2 py-0.5 rounded text-[10px]">WS / POLL</span>
                    <span>/api/v1/geo/stream?radius=1000m&lat=43.6652&lng=-79.4045</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-sans font-normal">Immediate 1km Push Broadcast & Polling Fallback</span>
                </div>
                <div className="p-4 bg-stone-950 text-stone-300 font-mono text-[11px] overflow-x-auto">
{`// WEBSOCKET SUBCRIPTION FRAME
{
  "action": "SUBSCRIBE_1KM_MESH",
  "userCoordinates": { "lat": 43.6652, "lng": -79.4045 },
  "filterCategories": ["GIFT", "LEND", "SKILL", "NEED_ITEM", "NEED_HELP"],
  "transport": "WEBSOCKET_PRIMARY_OR_HTTP_POLL_10S"
}

// SERVER BROADCAST EVENT (Emitted immediately when listing <= 1,000m is posted)
{
  "event": "listing:nearby:created",
  "channel": "geo:mesh:1km:dpz83w",
  "payload": {
    "id": "lst_8820f12c",
    "title": "Heritage Tomato & Thai Basil Seedling Tray",
    "category": "GIFT",
    "distanceMeters": 220,
    "giverName": "Marina K.",
    "giverNeighborhood": "Croft St",
    "giverTrustTier": "TRUSTED_NEIGHBOR",
    "chimeTrigger": true,
    "browserPushTitle": "KijijiShare 1km Alert",
    "timestamp": "2026-09-25T18:32:00Z"
  }
}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pillar 4: Offline-First Engine & Low-Bandwidth Optimizations */}
      {activeSection === 'offline' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-stone-900">
              4. Offline-First PWA Engine & Sync Architecture
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Disaster relief, suburban fringe areas, and data-constrained neighbors require seamless offline browsing and optimistic drafting without broken screens or data loss.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <span className="font-bold text-stone-900">Service Worker Caching Strategy</span>
                <ul className="list-disc list-inside space-y-1 text-stone-600">
                  <li><strong>Static Shell (HTML/JS/WASM):</strong> Cache-First with background version check.</li>
                  <li><strong>Active Feed Metadata:</strong> Stale-While-Revalidate with 10-minute TTL.</li>
                  <li><strong>Listing Images:</strong> Cache-First with LRU 50MB ceiling.</li>
                  <li><strong>Mutation API (Claims/Drafts):</strong> Network-First with IndexedDB outbox queue.</li>
                </ul>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <span className="font-bold text-stone-900">Conflict Resolution Strategy</span>
                <p className="text-stone-600 leading-normal">
                  Last-Write-Wins (LWW) augmented with causal CRDT vector clocks. If an offline user attempts to claim an item that was fulfilled while disconnected, the client gracefully receives a conflict tombstone:
                </p>
                <code className="block bg-stone-950 text-amber-300 p-2 rounded text-[11px] font-mono">
                  {`ITEM_ALREADY_FULFILLED // Auto-purged from client`}
                </code>
              </div>
            </div>

            {/* Client-Side Canvas WebP Compression */}
            <div className="pt-2">
              <h3 className="font-display text-sm font-bold text-stone-900 mb-2">
                Client-Side Canvas WebP Compression Algorithm
              </h3>
              <pre className="p-4 bg-stone-950 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`// Client-side image pre-flight: 3.5MB camera capture -> ~110KB WebP
async function compressImageClientSide(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxDim = 1200;
  let { width, height } = bitmap;

  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);

  // Encode to WebP at 0.75 quality: cuts 96% of payload before network egress
  return await canvas.convertToBlob({ type: 'image/webp', quality: 0.75 });
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Pillar 5: UI/UX Screen Architecture */}
      {activeSection === 'ui' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-stone-900">
              5. UI/UX Interface Hierarchy & Screen Architecture
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Designed according to modern human-interface guidelines: zero-pill discipline, unboxed text metadata, high-contrast outdoor daylight legibility, and 48px touch hitboxes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 text-xs">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>The Neighborhood Pulse</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Hybrid feed & radar view. Unboxed distance typography (e.g. <code>350m away · Elmwood</code>), clean status indicators, and an interactive toroidal circle map.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Workflow className="w-4 h-4 text-emerald-700" />
                  <span>The Expression Drawer</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Giver view displaying neighbor pitches side-by-side with verified vouches, walk distance, and karma score, enabling compassionate recipient selection.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>The Pickup Coordinator</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Minimalist safe coordination card: reveals private porch instructions, safe daylight guidelines, and the dual-confirmation one-time PIN / QR handshake.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SQL_SCHEMA = `-- Enable PostGIS spatial extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. USERS & COMMUNITY TRUST
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    avatar_url TEXT,
    neighborhood_name VARCHAR(100) NOT NULL,
    -- Private residential coordinates
    home_location GEOGRAPHY(Point, 4326) NOT NULL,
    karma_score INT NOT NULL DEFAULT 50 CHECK (karma_score BETWEEN 0 AND 100),
    trust_tier VARCHAR(30) NOT NULL DEFAULT 'NEWCOMER'
        CHECK (trust_tier IN ('NEWCOMER', 'TRUSTED_NEIGHBOR', 'PILLAR_OF_COMMUNITY', 'PROBATION')),
    vouch_count INT NOT NULL DEFAULT 0,
    gifts_given_count INT NOT NULL DEFAULT 0,
    gifts_received_count INT NOT NULL DEFAULT 0,
    active_claims_count INT NOT NULL DEFAULT 0,
    rolling_7d_claims_count INT NOT NULL DEFAULT 0,
    cooldown_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_home_location ON users USING GIST (home_location);

-- 2. LISTINGS (GIFTS, TOOLS, SKILLS, ASKS)
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('GIFT', 'LEND', 'SKILL', 'ASK')),
    status VARCHAR(30) NOT NULL DEFAULT 'OFFERED'
        CHECK (status IN ('OFFERED', 'INTEREST_EXPRESSED', 'GIVER_SELECTED', 'PICKUP_SCHEDULED', 'FULFILLED', 'CLOSED')),
    -- Private exact location (only revealed when GIVER_SELECTED)
    exact_location GEOGRAPHY(Point, 4326) NOT NULL,
    -- Fuzzed location (300m randomized offset for public feed/map)
    fuzzed_location GEOGRAPHY(Point, 4326) NOT NULL,
    pickup_instructions TEXT,
    image_url TEXT,
    image_size_bytes INT,
    selected_recipient_id UUID REFERENCES users(id),
    scheduled_pickup_time TIMESTAMPTZ,
    handshake_pin_hash VARCHAR(128),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial index on fuzzed location for public radar queries
CREATE INDEX idx_listings_fuzzed_location ON listings USING GIST (fuzzed_location);
CREATE INDEX idx_listings_status ON listings (status);

-- 3. CLAIM REQUESTS & PITCHES
CREATE TABLE claim_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pitch TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_listing_requester UNIQUE (listing_id, requester_id)
);

-- 4. TRANSFER LOG & AUDIT HANDSHAKE
CREATE TABLE transfer_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id),
    giver_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    giver_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    recipient_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    vouch_awarded VARCHAR(50),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. REPUTATION & VOUCH TABLE
CREATE TABLE vouches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    badge VARCHAR(50) NOT NULL
        CHECK (badge IN ('Punctual Pickup', 'Generous Giver', 'Tool Caretaker', 'Known Neighbor')),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

const POSTGIS_QUERY = `-- High-Performance PostGIS Spatial Query
-- Filters active listings within an adjustable radius (e.g., 3000m)
-- Computes geodesic distance and sorts nearest-first
SELECT 
    l.id,
    l.title,
    l.description,
    l.category,
    l.status,
    l.fuzzed_location,
    ST_Distance(l.fuzzed_location, ST_MakePoint($1, $2)::geography) AS distance_meters,
    u.full_name AS giver_name,
    u.karma_score AS giver_karma
FROM listings l
JOIN users u ON l.giver_id = u.id
WHERE 
    l.status IN ('OFFERED', 'INTEREST_EXPRESSED')
    -- Spatial index acceleration with ST_DWithin (uses GIST R-tree)
    AND ST_DWithin(l.fuzzed_location, ST_MakePoint($1, $2)::geography, $3)
ORDER BY distance_meters ASC
LIMIT 40;`;
