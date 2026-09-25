import { useState } from 'react';
import { Listing, ListingCategory, User } from '../types';
import { calculateDistanceMeters, formatDistance } from '../services/geoService';
import { checkClaimEligibility } from '../services/antiHoardingEngine';
import { 
  Gift, 
  Wrench, 
  Sparkles, 
  Briefcase, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Users, 
  ChevronRight, 
  AlertCircle,
  Lock,
  ArrowRight,
  Package,
  Award,
  Heart
} from 'lucide-react';

interface NeighborhoodPulseProps {
  listings: Listing[];
  currentUser: User;
  onExpressInterest: (listing: Listing) => void;
  onOpenSelectionDrawer: (listing: Listing) => void;
  onOpenPickupCoordinator: (listing: Listing) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  savedListings: string[];
  onToggleSaveListing: (listingId: string) => void;
}

export function NeighborhoodPulse({
  listings,
  currentUser,
  onExpressInterest,
  onOpenSelectionDrawer,
  onOpenPickupCoordinator,
  radiusKm,
  setRadiusKm,
  selectedCategory,
  setSelectedCategory,
  savedListings,
  onToggleSaveListing,
}: NeighborhoodPulseProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Exclude direct Needs from the surplus pulse feed (since they belong on the Needs Board)
  // unless user selected ALL
  const surplusListings = listings.filter(
    item => item.category !== 'NEED_ITEM' && item.category !== 'NEED_HELP'
  );

  const listingsWithDistance = surplusListings.map(listing => {
    const distMeters = calculateDistanceMeters(currentUser.homeCoordinates, listing.fuzzedLocation);
    return {
      ...listing,
      distanceMeters: distMeters,
    };
  });

  const filteredListings = listingsWithDistance
    .filter(item => {
      if (item.distanceMeters > radiusKm * 1000) return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesGiver = item.giverName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesGiver) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Visibility boost: Pillars of Community slightly elevated if nearby
      const aIsPillar = a.giverKarma >= 90 ? 1 : 0;
      const bIsPillar = b.giverKarma >= 90 ? 1 : 0;
      if (aIsPillar !== bIsPillar) return bIsPillar - aIsPillar;
      return a.distanceMeters - b.distanceMeters;
    });

  const eligibility = checkClaimEligibility(currentUser);

  const getCategoryIcon = (category: ListingCategory) => {
    switch (category) {
      case 'GIFT': return <Gift className="w-4 h-4 text-emerald-700" />;
      case 'LEND': return <Wrench className="w-4 h-4 text-blue-700" />;
      case 'SKILL': return <Sparkles className="w-4 h-4 text-amber-700" />;
      case 'SERVICE': return <Briefcase className="w-4 h-4 text-indigo-700" />;
      case 'NEED_ITEM': return <Package className="w-4 h-4 text-rose-700" />;
      case 'NEED_HELP': return <HelpCircle className="w-4 h-4 text-rose-700" />;
    }
  };

  const getStatusDisplay = (listing: Listing) => {
    switch (listing.status) {
      case 'OFFERED':
        return { text: 'Open to Neighbors', color: 'text-emerald-700 font-medium' };
      case 'INTEREST_EXPRESSED':
        return { text: `${listing.claimRequests.length} neighbor(s) interested`, color: 'text-amber-800 font-medium' };
      case 'GIVER_SELECTED':
        return { text: `Recipient chosen · Awaiting pickup setup`, color: 'text-blue-800 font-medium' };
      case 'PICKUP_SCHEDULED':
        return { text: `Pickup scheduled · Coordinate active`, color: 'text-indigo-800 font-medium' };
      case 'FULFILLED':
        return { text: 'Fulfilled & Handshake complete', color: 'text-stone-500 line-through' };
      case 'CLOSED':
        return { text: 'Closed', color: 'text-stone-400' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Radius & Status Banner */}
      <div className="bg-stone-100/80 rounded-2xl p-4 sm:p-5 border border-stone-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span>Hyperlocal Surplus Mesh</span>
              <span aria-hidden="true">·</span>
              <span>Toroidal Geospatial Filter</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-800 font-medium">Safe Porch & Lobby Distance</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Neighborhood Surplus &amp; Skill Feed
            </h1>
            <p className="text-sm text-stone-600 mt-0.5">
              Gifts, tool borrows, and practical skills shared freely without monetary transactions.
            </p>
          </div>

          {/* User's Anti-Hoarding & Fair Share Status Quota */}
          <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-xs flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-display font-bold text-base shrink-0">
              {currentUser.karmaScore}
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                <span>{currentUser.name}</span>
                <span className="text-[11px] font-normal text-stone-500 font-mono">
                  ({currentUser.trustTier.replace(/_/g, ' ')})
                </span>
              </div>
              <div className="text-stone-500 flex items-center gap-2 mt-0.5">
                <span>Active Claims: <strong className="font-mono text-stone-800">{currentUser.activeClaimsCount}/{eligibility.maxActiveClaims}</strong></span>
                <span aria-hidden="true">·</span>
                <span>7-Day: <strong className="font-mono text-stone-800">{currentUser.rolling7DayClaimsCount}/{eligibility.rolling7DayLimit}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          {/* Category Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg overflow-x-auto max-w-full">
            {[
              { id: 'ALL', label: 'All Surplus' },
              { id: 'GIFT', label: 'Gifts' },
              { id: 'LEND', label: 'Tool Lending' },
              { id: 'SKILL', label: 'Skill Mentorship' },
              { id: 'SERVICE', label: 'Hands-on Help' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Radius Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Radius:</span>
            <div className="flex items-center gap-1 p-0.5 bg-stone-200/70 rounded-lg">
              {[1, 3, 5].map(r => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                    radiusKm === r
                      ? 'bg-emerald-900 text-white shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fair Share Warning if in cooldown or maxed out */}
      {!eligibility.allowed && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Fair-Share Anti-Hoarding Protection Active</p>
            <p className="mt-0.5 text-amber-800">{eligibility.reason}</p>
          </div>
        </div>
      )}

      {/* Listings Feed Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <Gift className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-stone-800 text-base">No listings in this radius</h3>
          <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
            Try expanding your search radius to 3km or 5km, or be the first to share an unused tool or surplus item with your neighbors!
          </p>
          <button
            onClick={() => setRadiusKm(5)}
            className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg cursor-pointer transition-colors"
          >
            Expand to 5km radius
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map(item => {
            const isGiver = item.giverId === currentUser.id;
            const isSelectedRecipient = item.selectedRecipientId === currentUser.id;
            const hasRequested = item.claimRequests.some(r => r.requesterId === currentUser.id);
            const statusInfo = getStatusDisplay(item);
            const isPillar = item.giverKarma >= 90;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Card Header metadata */}
                  <div className="p-4 pb-2">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                      <div className="flex items-center gap-1.5 font-medium flex-wrap">
                        {getCategoryIcon(item.category)}
                        <span className="font-semibold text-stone-800">{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-emerald-800 font-medium">
                          {formatDistance(item.distanceMeters || 0)}
                        </span>
                        {item.distanceMeters <= 1000 && (
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded-md">
                            ⚡ 1km
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Pillar badge if donor has top tier karma */}
                        {isPillar ? (
                          <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            Pillar
                          </span>
                        ) : (
                          <div className="text-[11px] text-stone-400">
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )}

                        {/* Saved Heart Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaveListing(item.id);
                          }}
                          title={savedListings.includes(item.id) ? 'Remove from Saved' : 'Save item for quick access'}
                          className={`p-1.5 rounded-full transition-all cursor-pointer ${
                            savedListings.includes(item.id)
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 scale-105'
                              : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100 hover:scale-110'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${savedListings.includes(item.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <h2 className="font-display text-base font-bold text-stone-900 leading-snug line-clamp-2">
                      {item.title}
                    </h2>
                    
                    <p className="text-stone-600 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Skill / Service Exchange Metadata (Duration, Experience, Tools) */}
                    {(item.estimatedDurationMinutes || item.relevantExperience || item.toolsRequired) && (
                      <div className="mt-3 bg-stone-50 rounded-xl p-2.5 border border-stone-100 text-[11px] text-stone-600 space-y-1">
                        {item.estimatedDurationMinutes && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>Duration: <strong className="text-stone-800 font-mono">{item.estimatedDurationMinutes} mins</strong></span>
                          </div>
                        )}
                        {item.relevantExperience && (
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="line-clamp-1">Experience: {item.relevantExperience}</span>
                          </div>
                        )}
                        {item.toolsRequired && (
                          <div className="flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="line-clamp-1">{item.toolsRequired}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Privacy & Fuzzed Location Indicator */}
                  <div className="px-4 py-2 bg-stone-50/70 border-t border-b border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-stone-400" />
                      <span>Location: Obfuscated 300m circle</span>
                    </div>
                    <span className="font-mono">{item.giverNeighborhood}</span>
                  </div>

                  {/* Status row */}
                  <div className="p-4 pt-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Status:</span>
                      <span className={statusInfo.color}>{statusInfo.text}</span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                      <span>Shared by:</span>
                      <span className="font-medium text-stone-800">
                        {item.giverName} {isGiver && '(You)'} · Karma {item.giverKarma}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 pt-2 border-t border-stone-100 bg-stone-50/40">
                  {isGiver ? (
                    <div className="space-y-2">
                      {item.status === 'INTEREST_EXPRESSED' && (
                        <button
                          onClick={() => onOpenSelectionDrawer(item)}
                          className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Review {item.claimRequests.length} Neighbor Stories</span>
                        </button>
                      )}
                      {(item.status === 'GIVER_SELECTED' || item.status === 'PICKUP_SCHEDULED') && (
                        <button
                          onClick={() => onOpenPickupCoordinator(item)}
                          className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Manage Pickup Coordination</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {item.status === 'OFFERED' && (
                        <div className="text-center py-1 text-xs text-stone-500">
                          Waiting for nearby neighbors to express interest...
                        </div>
                      )}
                      {item.status === 'FULFILLED' && (
                        <div className="flex items-center justify-center gap-1.5 py-1 text-xs text-emerald-800 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Successfully gifted to neighbor</span>
                        </div>
                      )}
                    </div>
                  ) : isSelectedRecipient ? (
                    <button
                      onClick={() => onOpenPickupCoordinator(item)}
                      className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>You Were Selected! View Pickup Details</span>
                    </button>
                  ) : hasRequested ? (
                    <div className="py-2 px-3 bg-stone-100 text-stone-600 text-xs font-medium rounded-xl text-center flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Your story was sent to {item.giverName}</span>
                    </div>
                  ) : item.status === 'OFFERED' || item.status === 'INTEREST_EXPRESSED' ? (
                    <button
                      onClick={() => onExpressInterest(item)}
                      disabled={!eligibility.allowed}
                      className={`w-full py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        eligibility.allowed
                          ? 'bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Express Interest</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="py-2 text-center text-xs text-stone-400 font-medium">
                      {item.status === 'FULFILLED' ? 'Item gifted' : 'Recipient already coordinated'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
