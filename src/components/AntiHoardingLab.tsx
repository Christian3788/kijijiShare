import { useState } from 'react';
import { User } from '../types';
import { checkClaimEligibility, calculateKarma } from '../services/antiHoardingEngine';
import { 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  UserX, 
  Sparkles, 
  RefreshCw,
  Heart,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

export function AntiHoardingLab() {
  // Configurable simulation state
  const [giftsGiven, setGiftsGiven] = useState(1);
  const [giftsReceived, setGiftsReceived] = useState(2);
  const [needsFulfilled, setNeedsFulfilled] = useState(1);
  const [activeClaims, setActiveClaims] = useState(1);
  const [rollingClaims, setRollingClaims] = useState(2);
  const [vouches, setVouches] = useState(2);
  const [noShows, setNoShows] = useState(0);
  const [inCooldown, setInCooldown] = useState(false);
  const [trustTier, setTrustTier] = useState<User['trustTier']>('TRUSTED_NEIGHBOR');

  // Synthesize simulated user
  const simulatedUser: User = {
    id: 'sim_user',
    name: 'Simulation Subject',
    avatar: '',
    neighborhood: 'Simulation District',
    homeCoordinates: { lat: 43.6652, lng: -79.4045 },
    karmaScore: calculateKarma(vouches, giftsGiven, needsFulfilled, giftsReceived, noShows),
    vouchCount: vouches,
    giftsGivenCount: giftsGiven,
    giftsReceivedCount: giftsReceived,
    needsFulfilledCount: needsFulfilled,
    activeClaimsCount: activeClaims,
    rolling7DayClaimsCount: rollingClaims,
    isVerifiedNeighbor: true,
    trustTier,
    cooldownUntil: inCooldown ? new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString() : undefined,
    vouches: [],
  };

  const result = checkClaimEligibility(simulatedUser);

  // Presets
  const applyPreset = (preset: 'need' | 'pillar' | 'hoarder' | 'balanced') => {
    switch (preset) {
      case 'need':
        setGiftsGiven(0);
        setGiftsReceived(3);
        setActiveClaims(1);
        setRollingClaims(1);
        setVouches(1);
        setNoShows(0);
        setInCooldown(false);
        setTrustTier('NEWCOMER');
        break;
      case 'pillar':
        setGiftsGiven(18);
        setGiftsReceived(4);
        setActiveClaims(0);
        setRollingClaims(2);
        setVouches(12);
        setNoShows(0);
        setInCooldown(false);
        setTrustTier('PILLAR_OF_COMMUNITY');
        break;
      case 'hoarder':
        setGiftsGiven(0);
        setGiftsReceived(14);
        setActiveClaims(3);
        setRollingClaims(6);
        setVouches(0);
        setNoShows(2);
        setInCooldown(true);
        setTrustTier('PROBATION');
        break;
      case 'balanced':
        setGiftsGiven(5);
        setGiftsReceived(6);
        setActiveClaims(1);
        setRollingClaims(3);
        setVouches(4);
        setNoShows(0);
        setInCooldown(false);
        setTrustTier('TRUSTED_NEIGHBOR');
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 font-mono">
              <Scale className="w-4 h-4" />
              <span>DYNAMIC ANTI-HOARDING & FAIR DISTRIBUTION ENGINE</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
              Algorithmic Anti-Abuse Laboratory
            </h1>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
              In commercial e-commerce, money acts as the rationing mechanism. In a mutual aid gift economy,
              mathematical and trust-based guardrails prevent resellers from vacuuming goods while preserving a baseline entitlement for neighbors in genuine vulnerability.
            </p>
          </div>

          {/* Archetype Quick Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-800 p-1.5 rounded-xl text-xs">
            <span className="text-stone-400 px-2 font-medium">Test Archetype:</span>
            <button
              onClick={() => applyPreset('need')}
              className="px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg cursor-pointer"
            >
              Neighbor in Need
            </button>
            <button
              onClick={() => applyPreset('balanced')}
              className="px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg cursor-pointer"
            >
              Active Swapper
            </button>
            <button
              onClick={() => applyPreset('pillar')}
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
            >
              Community Pillar
            </button>
            <button
              onClick={() => applyPreset('hoarder')}
              className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg cursor-pointer"
            >
              Reseller / Hoarder
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Evaluation & Math on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Sliders & Variables */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
          <h2 className="font-display text-base font-bold text-stone-900 flex items-center gap-2">
            <span>User Profile Parameters</span>
          </h2>

          {/* Trust Tier Select */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Community Trust Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {(['NEWCOMER', 'TRUSTED_NEIGHBOR', 'PILLAR_OF_COMMUNITY', 'PROBATION'] as const).map(tier => (
                <button
                  key={tier}
                  onClick={() => setTrustTier(tier)}
                  className={`py-2 px-1 text-center rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    trustTier === tier
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {tier.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-stone-700">Surplus Gifts Given (G):</span>
                <span className="font-mono font-bold text-emerald-800">{giftsGiven}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={giftsGiven}
                onChange={(e) => setGiftsGiven(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-stone-700">Gifts Received (R):</span>
                <span className="font-mono font-bold text-stone-800">{giftsReceived}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={giftsReceived}
                onChange={(e) => setGiftsReceived(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-stone-700">Active Pending Claims:</span>
                <span className="font-mono font-bold text-stone-800">{activeClaims}</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                value={activeClaims}
                onChange={(e) => setActiveClaims(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-stone-700">Rolling 7-Day Claims:</span>
                <span className="font-mono font-bold text-stone-800">{rollingClaims}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={rollingClaims}
                onChange={(e) => setRollingClaims(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-stone-700">Peer Community Vouches (V):</span>
                <span className="font-mono font-bold text-amber-700">{vouches}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={vouches}
                onChange={(e) => setVouches(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-stone-700">Reported Pickup No-Shows (N):</span>
                <span className="font-mono font-bold text-rose-700">{noShows}</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={noShows}
                onChange={(e) => setNoShows(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">
                Trigger Velocity Spike Cooldown Timer
              </label>
              <input
                type="checkbox"
                checked={inCooldown}
                onChange={(e) => setInCooldown(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Engine Evaluation Output & Mathematical Proofs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Eligibility Verdict Card */}
          <div className={`p-6 rounded-2xl border transition-all ${
            result.allowed
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/70 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display font-bold text-base">
                {result.allowed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-700" />
                )}
                <span>
                  {result.allowed ? 'Eligible to Express Interest' : 'Claim Request Blocked by Anti-Abuse Rules'}
                </span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-md font-mono font-bold ${
                result.allowed ? 'bg-emerald-200/80 text-emerald-900' : 'bg-rose-200/80 text-rose-900'
              }`}>
                {result.allowed ? 'STATUS: PERMITTED' : 'STATUS: RATE-LIMITED'}
              </span>
            </div>

            {!result.allowed && (
              <p className="mt-2 text-xs text-rose-900 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-rose-200">
                {result.reason}
              </p>
            )}

            {/* Scorecard metrics */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-200/60">
              <div className="bg-white/80 p-3 rounded-xl text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold">Karma Score</div>
                <div className="font-display font-bold text-lg text-emerald-900 mt-0.5">
                  {simulatedUser.karmaScore}
                  <span className="text-xs text-stone-400 font-normal">/100</span>
                </div>
              </div>
              <div className="bg-white/80 p-3 rounded-xl text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold">Active Quota</div>
                <div className="font-mono font-bold text-lg text-stone-900 mt-0.5">
                  {result.activeClaimsCount}/{result.maxActiveClaims}
                </div>
              </div>
              <div className="bg-white/80 p-3 rounded-xl text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold">7-Day Cap</div>
                <div className="font-mono font-bold text-lg text-stone-900 mt-0.5">
                  {result.rolling7DayClaimsCount}/{result.rolling7DayLimit}
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Specification Breakdown */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-xs space-y-4">
            <h3 className="font-display text-sm font-bold text-stone-900">
              Formal Rule & Mathematical Invariants
            </h3>

            <div className="space-y-3 font-mono text-[11px] text-stone-700 bg-white p-4 rounded-xl border border-stone-200">
              <div>
                <span className="text-emerald-800 font-bold">1. Rolling 7-Day Sliding Window Formula:</span>
                <div className="text-stone-600 mt-0.5">
                  R_7(u) = min(8, floor(0.5 · G(u) + 4))
                </div>
                <div className="text-stone-400 text-[10px] mt-0.5">
                  Guarantee: Base entitlement = 4 items/week even if G=0. Scaled up to 8 max for active contributors.
                </div>
              </div>

              <div className="border-t border-stone-100 pt-2">
                <span className="text-emerald-800 font-bold">2. Reputation & Trust Karma Formula:</span>
                <div className="text-stone-600 mt-0.5">
                  K(u) = clamp(0, 100, 50 + 5·V + 3·G + 1·R_success - 25·N_noshow)
                </div>
                <div className="text-stone-400 text-[10px] mt-0.5">
                  Penalty: A verified no-show inflicts severe (-25) trust penalty to protect neighbors' time.
                </div>
              </div>

              <div className="border-t border-stone-100 pt-2">
                <span className="text-emerald-800 font-bold">3. Velocity Anti-Hoarding Cooldown:</span>
                <div className="text-stone-600 mt-0.5">
                  If claims_in_24h &gt; 2 and (G / R) &lt; 0.15 → Cooldown = 24h
                </div>
                <div className="text-stone-400 text-[10px] mt-0.5">
                  Prevents automated scrapers and resale hoarders from claiming dozens of items in quick succession.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
