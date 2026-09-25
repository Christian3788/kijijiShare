import { useState } from 'react';
import { Listing, User, ListingCategory } from '../types';
import { calculateDistanceMeters, formatDistance } from '../services/geoService';
import { 
  Heart, 
  Trash2, 
  Gift, 
  Wrench, 
  Sparkles, 
  Briefcase, 
  Package, 
  HelpCircle, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Award,
  Compass,
  Search,
  BookmarkCheck
} from 'lucide-react';

interface MySavedListingsProps {
  savedListingIds: string[];
  allListings: Listing[];
  currentUser: User;
  onToggleSaveListing: (listingId: string) => void;
  onClearAllSaved: () => void;
  onExpressInterest: (listing: Listing) => void;
  onOpenSelectionDrawer: (listing: Listing) => void;
  onOpenPickupCoordinator: (listing: Listing) => void;
  onOpenOfferHelpModal: (need: Listing) => void;
  onOpenReviewOffersDrawer: (need: Listing) => void;
  onNavigateToTab: (tab: 'feed' | 'needs' | 'map') => void;
}

export function MySavedListings({
  savedListingIds,
  allListings,
  currentUser,
  onToggleSaveListing,
  onClearAllSaved,
  onExpressInterest,
  onOpenSelectionDrawer,
  onOpenPickupCoordinator,
  onOpenOfferHelpModal,
  onOpenReviewOffersDrawer,
  onNavigateToTab,
}: MySavedListingsProps) {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Retrieve full listing objects for all saved IDs
  const savedItems = savedListingIds
    .map(id => allListings.find(l => l.id === id))
    .filter((l): l is Listing => Boolean(l))
    .map(listing => {
      const distanceMeters = calculateDistanceMeters(currentUser.homeCoordinates, listing.fuzzedLocation);
      return {
        ...listing,
        distanceMeters,
      };
    });

  const within1kmCount = savedItems.filter(item => item.distanceMeters <= 1000).length;

  const filteredItems = savedItems.filter(item => {
    if (filterCategory === 'GIFTS' && item.category !== 'GIFT' && item.category !== 'LEND') return false;
    if (filterCategory === 'SKILLS' && item.category !== 'SKILL' && item.category !== 'SERVICE') return false;
    if (filterCategory === 'NEEDS' && item.category !== 'NEED_ITEM' && item.category !== 'NEED_HELP') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchGiver = item.giverName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchGiver) return false;
    }
    return true;
  });

  const getCategoryIcon = (category: ListingCategory) => {
    switch (category) {
      case 'GIFT': return <Gift className="w-4 h-4 text-emerald-700" />;
      case 'LEND': return <Wrench className="w-4 h-4 text-blue-700" />;
      case 'SKILL': return <Sparkles className="w-4 h-4 text-amber-700" />;
      case 'SERVICE': return <Briefcase className="w-4 h-4 text-purple-700" />;
      case 'NEED_ITEM': return <Package className="w-4 h-4 text-rose-700" />;
      case 'NEED_HELP': return <HelpCircle className="w-4 h-4 text-rose-700" />;
    }
  };

  const getStatusBadge = (listing: Listing) => {
    switch (listing.status) {
      case 'OFFERED':
        return <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Open</span>;
      case 'INTEREST_EXPRESSED':
        return <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{listing.claimRequests.length} Interested</span>;
      case 'GIVER_SELECTED':
        return <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Match Chosen</span>;
      case 'PICKUP_SCHEDULED':
        return <span className="text-[10px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">Pickup Set</span>;
      case 'FULFILLED':
        return <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">Fulfilled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-400 mb-1 font-mono">
              <BookmarkCheck className="w-4 h-4" />
              <span>SAVED ITEMS &amp; BOOKMARKS</span>
              <span>·</span>
              <span>HYPERLOCAL SHORTLIST</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>My Saved Listings</span>
              {savedItems.length > 0 && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {savedItems.length} Saved
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
              Items and mutual-aid requests you've bookmarked for thoughtful review, tool planning, and quick doorstep coordination.
            </p>
          </div>

          {/* Quick Stats & Clear All Button */}
          {savedItems.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-stone-800/80 px-3 py-2 rounded-xl border border-stone-700/80 text-xs text-right">
                <div className="font-bold text-emerald-400 font-mono">{within1kmCount} within 1km</div>
                <div className="text-[11px] text-stone-400">Immediate walking zone</div>
              </div>

              <button
                onClick={onClearAllSaved}
                className="px-3 py-2 bg-stone-800 hover:bg-rose-950/80 hover:text-rose-300 border border-stone-700 hover:border-rose-800 text-stone-300 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Clear all saved bookmarks"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Chips & Search Bar */}
        {savedItems.length > 0 && (
          <div className="mt-5 pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-stone-800 rounded-lg overflow-x-auto text-xs">
              {[
                { id: 'ALL', label: `All (${savedItems.length})` },
                { id: 'GIFTS', label: 'Gifts & Tools' },
                { id: 'SKILLS', label: 'Skills & Help' },
                { id: 'NEEDS', label: 'Mutual Aid Needs' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    filterCategory === tab.id
                      ? 'bg-rose-600 text-white font-semibold shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved items..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Content */}
      {savedItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 sm:p-16 text-center border border-stone-200 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
            <Heart className="w-8 h-8 fill-rose-100 text-rose-400" />
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="font-display font-bold text-stone-900 text-lg">
              No saved items yet
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 leading-relaxed">
              Whenever you spot a gift, a borrowed tool, or a mutual aid request you'd like to revisit, tap the heart icon on any listing card to keep it handy here.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateToTab('feed')}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Browse Surplus Feed
            </button>
            <button
              onClick={() => onNavigateToTab('needs')}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Explore Needs Board
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500 text-xs">
          No saved listings match the "{filterCategory}" filter or search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const isNeed = item.category === 'NEED_ITEM' || item.category === 'NEED_HELP';
            const isGiver = item.giverId === currentUser.id;
            const isSelectedRecipient = item.selectedRecipientId === currentUser.id;
            const hasRequested = item.claimRequests.some(r => r.requesterId === currentUser.id);
            const walkMinutes = Math.max(1, Math.round((item.distanceMeters || 0) / 80));

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden relative"
              >
                <div>
                  {/* Top card header */}
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

                      {/* Heart Toggle Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveListing(item.id);
                        }}
                        title="Remove from Saved"
                        className="p-1.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all cursor-pointer hover:scale-110"
                      >
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      </button>
                    </div>

                    {/* Status & Donor Info */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {getStatusBadge(item)}
                      <span className="text-[11px] text-stone-400 font-mono">
                        ~{walkMinutes}m walk
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-stone-900 leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-stone-600 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Skill/Tool metadata if present */}
                    {(item.estimatedDurationMinutes || item.relevantExperience) && (
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
                            <span className="line-clamp-1 truncate">Exp: {item.relevantExperience}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-3 border-t border-stone-100 bg-stone-50/50 mt-2 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-stone-800">{item.giverName}</span>
                      <span className="text-stone-400">·</span>
                      <span className="font-mono text-emerald-700 font-bold">{item.giverKarma} Karma</span>
                    </div>

                    <button
                      onClick={() => onNavigateToTab('map')}
                      title="View on Geospatial Radar Map"
                      className="text-stone-400 hover:text-emerald-700 flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Map</span>
                    </button>
                  </div>

                  {/* Primary Action Button */}
                  {isNeed ? (
                    <div className="flex gap-2">
                      {isGiver ? (
                        <button
                          onClick={() => onOpenReviewOffersDrawer(item)}
                          className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Review Offers ({item.needOffers?.length || 0})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenOfferHelpModal(item)}
                          className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <span>I Can Help With This</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {isGiver ? (
                        <button
                          onClick={() => onOpenSelectionDrawer(item)}
                          className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Manage Giver Selection ({item.claimRequests.length})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : isSelectedRecipient || item.status === 'GIVER_SELECTED' ? (
                        <button
                          onClick={() => onOpenPickupCoordinator(item)}
                          className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <span>Coordinate Pickup Handshake</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : hasRequested ? (
                        <button
                          disabled
                          className="w-full py-2 px-3 bg-stone-100 text-stone-500 text-xs font-medium rounded-xl text-center"
                        >
                          Note Sent · Awaiting Thoughtful Selection
                        </button>
                      ) : (
                        <button
                          onClick={() => onExpressInterest(item)}
                          className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <span>Express Interest</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
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
