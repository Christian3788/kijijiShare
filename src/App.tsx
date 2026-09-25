import { useState } from 'react';
import { User, Listing, ClaimRequest, NeedOffer, ListingCategory, KarmaEvent } from './types';
import { SEED_USERS, INITIAL_LISTINGS } from './data/seedData';
import { TopNav } from './components/TopNav';
import { NeighborhoodPulse } from './components/NeighborhoodPulse';
import { NeedsBoard } from './components/NeedsBoard';
import { GeospatialRadar } from './components/GeospatialRadar';
import { AntiHoardingLab } from './components/AntiHoardingLab';
import { ArchitectureSpec } from './components/ArchitectureSpec';
import { ExpressionSelectionDrawer } from './components/ExpressionSelectionDrawer';
import { PickupCoordinatorModal } from './components/PickupCoordinatorModal';
import { ExpressInterestModal } from './components/ExpressInterestModal';
import { NewListingModal } from './components/NewListingModal';
import { OfferHelpModal } from './components/OfferHelpModal';
import { ReviewOffersDrawer } from './components/ReviewOffersDrawer';
import { KarmaModal } from './components/KarmaModal';
import { KarmaLedgerModal } from './components/KarmaLedgerModal';
import { getOfflineDrafts, saveOfflineDraft, removeOfflineDraft } from './services/offlineSync';
import { calculateKarma, deriveTrustTier } from './services/antiHoardingEngine';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'needs' | 'map' | 'anti_hoarding' | 'architecture'>('feed');
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('user_elena');
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Offline simulation state
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal active states
  const [selectedListingForDrawer, setSelectedListingForDrawer] = useState<Listing | null>(null);
  const [selectedListingForPickup, setSelectedListingForPickup] = useState<Listing | null>(null);
  const [selectedListingForPitch, setSelectedListingForPitch] = useState<Listing | null>(null);
  const [selectedNeedForOffer, setSelectedNeedForOffer] = useState<Listing | null>(null);
  const [selectedNeedForReview, setSelectedNeedForReview] = useState<Listing | null>(null);
  
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState<boolean>(false);
  const [newListingDefaultCategory, setNewListingDefaultCategory] = useState<ListingCategory>('GIFT');
  
  // Karma Modals
  const [isKarmaLedgerOpen, setIsKarmaLedgerOpen] = useState<boolean>(false);
  const [karmaModalData, setKarmaModalData] = useState<{
    targetUser: { id: string; name: string; avatar: string; role: 'GIVER' | 'RECIPIENT' | 'HELPER' | 'SEEKER' };
    transactionTitle: string;
  } | null>(null);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open needs count
  const openNeedsCount = listings.filter(
    l => (l.category === 'NEED_ITEM' || l.category === 'NEED_HELP') && l.status === 'OFFERED'
  ).length;

  // Toggle offline simulator
  const handleToggleOffline = () => {
    if (isOffline) {
      setIsOffline(false);
      const drafts = getOfflineDrafts();
      if (drafts.length > 0) {
        showToast(`Reconnected! Synced ${drafts.length} offline draft(s) with PostGIS cluster.`);
        drafts.forEach(d => removeOfflineDraft(d.id));
        setPendingSyncCount(0);
      } else {
        showToast('Online connection restored.');
      }
    } else {
      setIsOffline(true);
      showToast('Switched to Offline Mesh. Local actions will persist to IndexedDB.');
    }
  };

  // 1. Submit pitch (Express Interest in a gift/tool)
  const handleSubmitPitch = (listingId: string, pitch: string) => {
    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        const newReq: ClaimRequest = {
          id: `cr_${Date.now()}`,
          listingId,
          requesterId: currentUser.id,
          requesterName: currentUser.name,
          requesterAvatar: currentUser.avatar,
          requesterKarma: currentUser.karmaScore,
          requesterDistanceMeters: 380,
          requesterVouches: currentUser.vouches.map(v => v.badge),
          pitch,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        return {
          ...l,
          status: l.status === 'OFFERED' ? 'INTEREST_EXPRESSED' : l.status,
          claimRequests: [newReq, ...l.claimRequests],
        };
      }
      return l;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          activeClaimsCount: u.activeClaimsCount + 1,
          rolling7DayClaimsCount: u.rolling7DayClaimsCount + 1,
        };
      }
      return u;
    }));

    showToast('Your neighborly note was sent! Giver will thoughtfully review.');
  };

  // 2. Select Recipient (Giver matching)
  const handleSelectRecipient = (listingId: string, claimRequest: ClaimRequest) => {
    const handshakePin = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        return {
          ...l,
          status: 'GIVER_SELECTED',
          selectedRecipientId: claimRequest.requesterId,
          selectedRecipientName: claimRequest.requesterName,
          scheduledPickupTime: 'Today at 5:30 PM',
          handshakePin,
          claimRequests: l.claimRequests.map(r => 
            r.id === claimRequest.id ? { ...r, status: 'ACCEPTED' } : { ...r, status: 'DECLINED' }
          ),
        };
      }
      return l;
    }));

    showToast(`Selected ${claimRequest.requesterName}! Doorstep pickup PIN generated.`);
  };

  // 3. Confirm Handshake (One-time PIN completion)
  const handleConfirmHandshake = (listingId: string, pin: string, vouchBadge?: string) => {
    let targetGiverId = '';
    let targetRecipientId = '';
    let itemTitle = '';

    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        targetGiverId = l.giverId;
        targetRecipientId = l.selectedRecipientId || '';
        itemTitle = l.title;
        return { ...l, status: 'FULFILLED' };
      }
      return l;
    }));

    // Update community stats & vouches
    setUsers(prev => prev.map(u => {
      if (u.id === targetGiverId) {
        const updatedGives = u.giftsGivenCount + 1;
        const updatedKarma = calculateKarma(u.vouchCount, updatedGives, u.needsFulfilledCount, u.giftsReceivedCount, 0);
        return {
          ...u,
          giftsGivenCount: updatedGives,
          karmaScore: updatedKarma,
          trustTier: deriveTrustTier(updatedKarma),
        };
      }
      if (u.id === targetRecipientId) {
        const updatedReceives = u.giftsReceivedCount + 1;
        const updatedActive = Math.max(0, u.activeClaimsCount - 1);
        const updatedVouchCount = vouchBadge ? u.vouchCount + 1 : u.vouchCount;
        const updatedKarma = calculateKarma(updatedVouchCount, u.giftsGivenCount, u.needsFulfilledCount, updatedReceives, 0);
        return {
          ...u,
          giftsReceivedCount: updatedReceives,
          activeClaimsCount: updatedActive,
          vouchCount: updatedVouchCount,
          karmaScore: updatedKarma,
          trustTier: deriveTrustTier(updatedKarma),
        };
      }
      return u;
    }));

    showToast('Dual Handshake Verified! Exchange completed.');

    // Prompt Karma Modal for current user to award karma to their exchange partner
    const otherUserId = currentUser.id === targetGiverId ? targetRecipientId : targetGiverId;
    const otherUser = users.find(u => u.id === otherUserId);
    if (otherUser) {
      setKarmaModalData({
        targetUser: {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar,
          role: currentUser.id === targetGiverId ? 'RECIPIENT' : 'GIVER',
        },
        transactionTitle: itemTitle,
      });
    }
  };

  // 4. Update scheduled pickup time
  const handleUpdatePickupTime = (listingId: string, time: string) => {
    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        return { ...l, scheduledPickupTime: time, status: 'PICKUP_SCHEDULED' };
      }
      return l;
    }));
    showToast('Pickup window updated.');
  };

  // 5. Submit offer to help with a Need
  const handleSubmitNeedOffer = (needId: string, offerData: Omit<NeedOffer, 'id' | 'createdAt' | 'status'>) => {
    const newOffer: NeedOffer = {
      ...offerData,
      id: `no_${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setListings(prev => prev.map(l => {
      if (l.id === needId) {
        return {
          ...l,
          needOffers: [newOffer, ...(l.needOffers || [])],
        };
      }
      return l;
    }));

    showToast('Assistance offer sent to neighbor!');
  };

  // 6. Accept helper on a Need
  const handleAcceptHelper = (needId: string, offer: NeedOffer) => {
    let needTitle = '';
    let seekerName = '';

    setListings(prev => prev.map(l => {
      if (l.id === needId) {
        needTitle = l.title;
        seekerName = l.giverName;
        return {
          ...l,
          status: 'FULFILLED',
          needOffers: (l.needOffers || []).map(o => 
            o.id === offer.id ? { ...o, status: 'ACCEPTED' } : { ...o, status: 'DECLINED' }
          ),
        };
      }
      return l;
    }));

    // Update helper's completed needs count
    setUsers(prev => prev.map(u => {
      if (u.id === offer.helperId) {
        const updatedFulfilled = u.needsFulfilledCount + 1;
        const updatedKarma = calculateKarma(u.vouchCount, u.giftsGivenCount, updatedFulfilled, u.giftsReceivedCount, 0);
        return {
          ...u,
          needsFulfilledCount: updatedFulfilled,
          karmaScore: updatedKarma,
          trustTier: deriveTrustTier(updatedKarma),
        };
      }
      return u;
    }));

    showToast(`Accepted ${offer.helperName}'s offer! Mutual aid fulfilled.`);

    // Prompt Seeker to award Karma to the helper
    const helperUser = users.find(u => u.id === offer.helperId);
    if (helperUser) {
      setKarmaModalData({
        targetUser: {
          id: helperUser.id,
          name: helperUser.name,
          avatar: helperUser.avatar,
          role: 'HELPER',
        },
        transactionTitle: needTitle,
      });
    }
  };

  // 7. Award Karma handler
  const handleAwardKarma = (points: number, badge: string, note: string) => {
    if (!karmaModalData) return;
    const { targetUser, transactionTitle } = karmaModalData;

    setUsers(prev => prev.map(u => {
      if (u.id === targetUser.id) {
        const newScore = Math.min(100, u.karmaScore + points);
        const newVouchCount = u.vouchCount + 1;
        const newEvent: KarmaEvent = {
          id: `kh_${Date.now()}`,
          userId: u.id,
          type: targetUser.role === 'HELPER' ? 'NEED_FULFILLED' : targetUser.role === 'GIVER' ? 'GIFT_GIVEN' : 'PUNCTUAL_PICKUP',
          points,
          description: `${note} (${transactionTitle})`,
          partnerId: currentUser.id,
          partnerName: currentUser.name,
          badgeAwarded: badge,
          timestamp: new Date().toISOString(),
        };

        return {
          ...u,
          karmaScore: newScore,
          vouchCount: newVouchCount,
          trustTier: deriveTrustTier(newScore),
          karmaHistory: [newEvent, ...(u.karmaHistory || [])],
        };
      }
      return u;
    }));

    showToast(`Awarded +${points} Karma & "${badge}" badge to ${targetUser.name}!`);
    setKarmaModalData(null);
  };

  // 8. Create new listing
  const handleCreateListing = (newListing: Listing) => {
    if (isOffline) {
      saveOfflineDraft(newListing);
      setPendingSyncCount(prev => prev + 1);
      setListings(prev => [newListing, ...prev]);
      showToast('Saved to Offline IndexedDB. Will sync when reconnected.');
    } else {
      setListings(prev => [newListing, ...prev]);
      if (newListing.category === 'NEED_ITEM' || newListing.category === 'NEED_HELP') {
        showToast('Mutual aid request posted to the Needs Board!');
        setActiveTab('needs');
      } else {
        showToast('Listing broadcast to neighbors within 5km radius!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={(u) => setCurrentUserId(u.id)}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        onOpenNewListing={() => {
          setNewListingDefaultCategory('GIFT');
          setIsNewListingModalOpen(true);
        }}
        onOpenKarmaLedger={() => setIsKarmaLedgerOpen(true)}
        pendingSyncCount={pendingSyncCount}
        openNeedsCount={openNeedsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Surplus Feed Tab */}
        {activeTab === 'feed' && (
          <NeighborhoodPulse
            listings={listings}
            currentUser={currentUser}
            onExpressInterest={(listing) => setSelectedListingForPitch(listing)}
            onOpenSelectionDrawer={(listing) => setSelectedListingForDrawer(listing)}
            onOpenPickupCoordinator={(listing) => setSelectedListingForPickup(listing)}
            radiusKm={radiusKm}
            setRadiusKm={setRadiusKm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {/* Needs Board Tab */}
        {activeTab === 'needs' && (
          <NeedsBoard
            listings={listings}
            currentUser={currentUser}
            onOpenOfferHelpModal={(need) => setSelectedNeedForOffer(need)}
            onOpenReviewOffersDrawer={(need) => setSelectedNeedForReview(need)}
            onOpenNewNeedModal={() => {
              setNewListingDefaultCategory('NEED_ITEM');
              setIsNewListingModalOpen(true);
            }}
            radiusKm={radiusKm}
            setRadiusKm={setRadiusKm}
          />
        )}

        {/* Radar Map Tab */}
        {activeTab === 'map' && (
          <GeospatialRadar
            listings={listings}
            currentUser={currentUser}
            onSelectListing={(listing) => {
              if (listing.category === 'NEED_ITEM' || listing.category === 'NEED_HELP') {
                if (listing.giverId === currentUser.id) {
                  setSelectedNeedForReview(listing);
                } else {
                  setSelectedNeedForOffer(listing);
                }
              } else if (listing.giverId === currentUser.id && listing.claimRequests.length > 0) {
                setSelectedListingForDrawer(listing);
              } else if (listing.selectedRecipientId === currentUser.id || listing.status === 'GIVER_SELECTED') {
                setSelectedListingForPickup(listing);
              } else {
                setSelectedListingForPitch(listing);
              }
            }}
            radiusKm={radiusKm}
            setRadiusKm={setRadiusKm}
          />
        )}

        {/* Anti-Hoarding Lab Tab */}
        {activeTab === 'anti_hoarding' && (
          <AntiHoardingLab />
        )}

        {/* Architecture Spec Tab */}
        {activeTab === 'architecture' && (
          <ArchitectureSpec />
        )}
      </main>

      {/* Modals & Drawers */}
      {selectedListingForDrawer && (
        <ExpressionSelectionDrawer
          isOpen={true}
          onClose={() => setSelectedListingForDrawer(null)}
          listing={selectedListingForDrawer}
          currentUser={currentUser}
          onSelectRecipient={handleSelectRecipient}
        />
      )}

      {selectedListingForPickup && (
        <PickupCoordinatorModal
          isOpen={true}
          onClose={() => setSelectedListingForPickup(null)}
          listing={selectedListingForPickup}
          currentUser={currentUser}
          onConfirmHandshake={handleConfirmHandshake}
          onUpdatePickupTime={handleUpdatePickupTime}
        />
      )}

      {selectedListingForPitch && (
        <ExpressInterestModal
          isOpen={true}
          onClose={() => setSelectedListingForPitch(null)}
          listing={selectedListingForPitch}
          currentUser={currentUser}
          onSubmitPitch={handleSubmitPitch}
        />
      )}

      {selectedNeedForOffer && (
        <OfferHelpModal
          isOpen={true}
          onClose={() => setSelectedNeedForOffer(null)}
          need={selectedNeedForOffer}
          currentUser={currentUser}
          onSubmitOffer={handleSubmitNeedOffer}
        />
      )}

      {selectedNeedForReview && (
        <ReviewOffersDrawer
          isOpen={true}
          onClose={() => setSelectedNeedForReview(null)}
          need={selectedNeedForReview}
          currentUser={currentUser}
          onAcceptHelper={handleAcceptHelper}
        />
      )}

      {karmaModalData && (
        <KarmaModal
          isOpen={true}
          onClose={() => setKarmaModalData(null)}
          targetUser={karmaModalData.targetUser}
          transactionTitle={karmaModalData.transactionTitle}
          onAwardKarma={handleAwardKarma}
        />
      )}

      {isKarmaLedgerOpen && (
        <KarmaLedgerModal
          isOpen={true}
          onClose={() => setIsKarmaLedgerOpen(false)}
          currentUser={currentUser}
        />
      )}

      {isNewListingModalOpen && (
        <NewListingModal
          isOpen={true}
          onClose={() => setIsNewListingModalOpen(false)}
          currentUser={currentUser}
          isOffline={isOffline}
          defaultCategory={newListingDefaultCategory}
          onCreateListing={handleCreateListing}
        />
      )}

      {/* Minimalist Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-stone-800">KijijiShare</span>
            <span aria-hidden="true">·</span>
            <span>Needs Board · Skill Exchanges · Community Karma Trust Mesh</span>
          </div>
          <div className="text-[11px] text-stone-400">
            PostGIS ST_DWithin Indexing · 300m Privacy Obfuscation · Zero-Barter Mutual Aid
          </div>
        </div>
      </footer>
    </div>
  );
}
