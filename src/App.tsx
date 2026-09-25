import { useState, useEffect } from 'react';
import { User, Listing, ClaimRequest, ListingCategory } from './types';
import { SEED_USERS, INITIAL_LISTINGS } from './data/seedData';
import { TopNav } from './components/TopNav';
import { NeighborhoodPulse } from './components/NeighborhoodPulse';
import { GeospatialRadar } from './components/GeospatialRadar';
import { AntiHoardingLab } from './components/AntiHoardingLab';
import { ArchitectureSpec } from './components/ArchitectureSpec';
import { ExpressionSelectionDrawer } from './components/ExpressionSelectionDrawer';
import { PickupCoordinatorModal } from './components/PickupCoordinatorModal';
import { ExpressInterestModal } from './components/ExpressInterestModal';
import { NewListingModal } from './components/NewListingModal';
import { getOfflineDrafts, saveOfflineDraft, removeOfflineDraft } from './services/offlineSync';
import { calculateKarma } from './services/antiHoardingEngine';
import { CheckCircle2, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'anti_hoarding' | 'architecture'>('feed');
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
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState<boolean>(false);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle offline simulator
  const handleToggleOffline = () => {
    if (isOffline) {
      // Reconnecting to network: sync offline queue
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

  // 1. Submit pitch (Express Interest)
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

    // Increment current user's active claims count
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

    showToast(`Selected ${claimRequest.requesterName}! Pickup handshake PIN generated.`);
  };

  // 3. Confirm Handshake (One-time PIN completion)
  const handleConfirmHandshake = (listingId: string, pin: string, vouchBadge?: string) => {
    let targetGiverId = '';
    let targetRecipientId = '';

    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        targetGiverId = l.giverId;
        targetRecipientId = l.selectedRecipientId || '';
        return {
          ...l,
          status: 'FULFILLED',
        };
      }
      return l;
    }));

    // Update community stats & vouches
    setUsers(prev => prev.map(u => {
      if (u.id === targetGiverId) {
        const updatedGives = u.giftsGivenCount + 1;
        const updatedKarma = calculateKarma(u.vouchCount, updatedGives, u.giftsReceivedCount, 0);
        return {
          ...u,
          giftsGivenCount: updatedGives,
          karmaScore: updatedKarma,
        };
      }
      if (u.id === targetRecipientId) {
        const updatedReceives = u.giftsReceivedCount + 1;
        const updatedActive = Math.max(0, u.activeClaimsCount - 1);
        const updatedVouchCount = vouchBadge ? u.vouchCount + 1 : u.vouchCount;
        const updatedKarma = calculateKarma(updatedVouchCount, u.giftsGivenCount, updatedReceives, 0);
        return {
          ...u,
          giftsReceivedCount: updatedReceives,
          activeClaimsCount: updatedActive,
          vouchCount: updatedVouchCount,
          karmaScore: updatedKarma,
        };
      }
      return u;
    }));

    showToast('Dual Handshake Verified! Item marked as Fulfilled.');
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

  // 5. Create new listing
  const handleCreateListing = (newListing: Listing) => {
    if (isOffline) {
      saveOfflineDraft(newListing);
      setPendingSyncCount(prev => prev + 1);
      setListings(prev => [newListing, ...prev]);
      showToast('Saved to Offline IndexedDB. Will sync when reconnected.');
    } else {
      setListings(prev => [newListing, ...prev]);
      showToast('Listing broadcast to neighbors within 5km radius!');
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
        onOpenNewListing={() => setIsNewListingModalOpen(true)}
        pendingSyncCount={pendingSyncCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
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

        {activeTab === 'map' && (
          <GeospatialRadar
            listings={listings}
            currentUser={currentUser}
            onSelectListing={(listing) => {
              if (listing.giverId === currentUser.id && listing.claimRequests.length > 0) {
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

        {activeTab === 'anti_hoarding' && (
          <AntiHoardingLab />
        )}

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

      {isNewListingModalOpen && (
        <NewListingModal
          isOpen={true}
          onClose={() => setIsNewListingModalOpen(false)}
          currentUser={currentUser}
          isOffline={isOffline}
          onCreateListing={handleCreateListing}
        />
      )}

      {/* Subtle Minimalist Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-stone-800">KijijiShare</span>
            <span aria-hidden="true">·</span>
            <span>Offline-Resilient Hyperlocal Gift Economy</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Toroidal PostGIS ST_DWithin Indexing · 300m Privacy Obfuscation · Zero-Barter Mutual Aid
          </div>
        </div>
      </footer>
    </div>
  );
}
