import { useState } from 'react';
import { Listing, User, NeedOffer } from '../types';
import { calculateDistanceMeters, formatDistance } from '../services/geoService';
import { isHighReliabilityMatch } from '../services/antiHoardingEngine';
import { 
  HeartHandshake, 
  HelpCircle, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  Wrench, 
  Package, 
  ArrowRight,
  ShieldCheck,
  Send,
  Plus,
  Heart
} from 'lucide-react';

interface NeedsBoardProps {
  listings: Listing[];
  currentUser: User;
  onOpenOfferHelpModal: (need: Listing) => void;
  onOpenReviewOffersDrawer: (need: Listing) => void;
  onOpenNewNeedModal: () => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  savedListings: string[];
  onToggleSaveListing: (listingId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export function NeedsBoard({
  listings,
  currentUser,
  onOpenOfferHelpModal,
  onOpenReviewOffersDrawer,
  onOpenNewNeedModal,
  radiusKm,
  setRadiusKm,
  savedListings,
  onToggleSaveListing,
  onViewProfile,
}: NeedsBoardProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'NEED_ITEM' | 'NEED_HELP' | 'URGENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all Needs from listings
  const needsListings = listings
    .filter(item => item.category === 'NEED_ITEM' || item.category === 'NEED_HELP')
    .map(need => {
      const dist = calculateDistanceMeters(currentUser.homeCoordinates, need.fuzzedLocation);
      return { ...need, distanceMeters: dist };
    })
    .filter(need => {
      if ((need.distanceMeters || 0) > radiusKm * 1000) return false;
      if (filterType === 'NEED_ITEM' && need.category !== 'NEED_ITEM') return false;
      if (filterType === 'NEED_HELP' && need.category !== 'NEED_HELP') return false;
      if (filterType === 'URGENT' && need.urgencyLevel !== 'URGENT') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          need.title.toLowerCase().includes(q) ||
          need.description.toLowerCase().includes(q) ||
          need.giverName.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Prioritize urgent requests, then by distance
      if (a.urgencyLevel === 'URGENT' && b.urgencyLevel !== 'URGENT') return -1;
      if (b.urgencyLevel === 'URGENT' && a.urgencyLevel !== 'URGENT') return 1;
      return (a.distanceMeters || 0) - (b.distanceMeters || 0);
    });

  return (
    <div className="space-y-6">
      {/* Needs Board Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-400 mb-1 font-mono">
              <HeartHandshake className="w-4 h-4" />
              <span>COMMUNITY MUTUAL AID DIRECTORY</span>
              <span>·</span>
              <span>DIRECT ASKS & NEIGHBOR HELP</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
              The Neighborhood Needs Board
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Have surplus tools, extra hands, or practical skills? See what your immediate neighbors are searching for or post your own mutual aid request without monetary exchange or barter demands.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewNeedModal}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Need or Ask</span>
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-stone-800 rounded-lg overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Requests' },
              { id: 'NEED_ITEM', label: 'Items Needed' },
              { id: 'NEED_HELP', label: 'Hands-on Help & Skills' },
              { id: 'URGENT', label: 'Urgent Care' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Radius:</span>
            <div className="flex items-center gap-1 p-0.5 bg-stone-800 rounded-lg">
              {[1, 3, 5].map(r => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                    radiusKm === r
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Needs Board Grid */}
      {needsListings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <HelpCircle className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-stone-800 text-base">No active needs in this radius</h3>
          <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
            Try expanding your search radius to 3km or 5km, or post a request if you are seeking a specific item, tool, or hands-on assistance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {needsListings.map(need => {
            const isSeeker = need.giverId === currentUser.id;
            const offers = need.needOffers || [];
            const hasCurrentUserOffered = offers.some(o => o.helperId === currentUser.id);

            return (
              <div
                key={need.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 pb-3">
                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <div className="flex items-center gap-1.5 font-medium">
                      {need.category === 'NEED_ITEM' ? (
                        <Package className="w-4 h-4 text-rose-700" />
                      ) : (
                        <Wrench className="w-4 h-4 text-blue-700" />
                      )}
                      <span className="font-semibold text-stone-800">
                        {need.category === 'NEED_ITEM' ? 'Item Needed' : 'Hands-on Assistance'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-emerald-800 font-medium">
                        {formatDistance(need.distanceMeters || 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Urgency Badge */}
                      {need.urgencyLevel === 'URGENT' ? (
                        <span className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Urgent Need
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">
                          {new Date(need.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}

                      {/* Saved Heart Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveListing(need.id);
                        }}
                        title={savedListings.includes(need.id) ? 'Remove from Saved' : 'Save need for quick access'}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${
                          savedListings.includes(need.id)
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 scale-105'
                            : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100 hover:scale-110'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${savedListings.includes(need.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="font-display text-base font-bold text-stone-900 leading-snug">
                    {need.title}
                  </h2>
                  <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                    {need.description}
                  </p>

                  {/* Task Metadata (Duration, Tools, Location) */}
                  {(need.estimatedDurationMinutes || need.toolsRequired || need.locationType) && (
                    <div className="mt-3 bg-stone-50 rounded-xl p-3 border border-stone-100 text-[11px] text-stone-600 space-y-1">
                      {need.estimatedDurationMinutes && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>Estimated Time Commitment: <strong className="text-stone-800 font-mono">{need.estimatedDurationMinutes} mins</strong></span>
                        </div>
                      )}
                      {need.toolsRequired && (
                        <div className="flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>Equipment: {need.toolsRequired}</span>
                        </div>
                      )}
                      {need.locationType && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>Location Format: {need.locationType.replace(/_/g, ' ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Neighbor info */}
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-1">
                      <span>Requested by: </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProfile?.(need.giverId);
                        }}
                        title={`View ${need.giverName}'s profile & vouches`}
                        className="text-stone-800 font-semibold hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{need.giverName} {isSeeker && '(You)'}</span>
                      </button>
                      <span className="text-[11px] font-mono text-emerald-800 ml-1">· Karma {need.giverKarma}</span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {need.giverNeighborhood}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-2 border-t border-stone-100 bg-stone-50/50">
                  {isSeeker ? (
                    // Current user posted this need
                    <div className="space-y-2">
                      <button
                        onClick={() => onOpenReviewOffersDrawer(need)}
                        className="w-full py-2.5 px-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Review {offers.length} Neighbor Offer(s)</span>
                      </button>
                    </div>
                  ) : hasCurrentUserOffered ? (
                    // Current user already offered help
                    <div className="py-2.5 px-3 bg-stone-100 text-stone-600 text-xs font-medium rounded-xl text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>You offered to help · Awaiting neighbor's response</span>
                    </div>
                  ) : (
                    // Neighbor can offer to fulfill
                    <button
                      onClick={() => onOpenOfferHelpModal(need)}
                      className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <HeartHandshake className="w-4 h-4" />
                      <span>I Can Help With This</span>
                    </button>
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
