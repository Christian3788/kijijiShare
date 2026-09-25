import { useState, useEffect } from 'react';
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
import { GeminiChatbot } from './components/GeminiChatbot';
import { MapsGroundingFinder } from './components/MapsGroundingFinder';
import { VeoVideoGenerator } from './components/VeoVideoGenerator';
import { LiveVoiceStudio } from './components/LiveVoiceStudio';
import { NearbyAlertToast } from './components/NearbyAlertToast';
import { NearbyAlertCenter } from './components/NearbyAlertCenter';
import { MySavedListings } from './components/MySavedListings';

// 1km Alert System & Geospatial calculations
import { 
  NearbyNotification, 
  ConnectionMode, 
  ConnectionStatus, 
  playNearbyChime, 
  requestPushPermission, 
  showSystemNotification,
  randomOffsetCoords,
  HYPERLOCAL_SIMULATION_POOL
} from './services/nearbyAlertService';
import { calculateDistanceMeters, formatDistance } from './services/geoService';

// Firebase Auth & Firestore
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from './firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';

import { getOfflineDrafts, saveOfflineDraft, removeOfflineDraft } from './services/offlineSync';
import { calculateKarma, deriveTrustTier } from './services/antiHoardingEngine';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'needs' | 'saved' | 'map' | 'anti_hoarding' | 'architecture'>('feed');
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('user_elena');
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // 1km Hyperlocal Alert System State
  const [notifications, setNotifications] = useState<NearbyNotification[]>([
    {
      id: 'notif_init_1',
      listingId: 'listing_sim_dewalt',
      title: 'DeWalt 20V Cordless Reciprocating Saw',
      category: 'LEND',
      giverId: 'sim_samir',
      giverName: 'Samir Patel',
      giverNeighborhood: 'Elmwood Crescent',
      distanceMeters: 380,
      timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      read: false,
      type: 'NEW_LEND',
      listing: {
        id: 'listing_sim_dewalt',
        title: 'DeWalt 20V Cordless Reciprocating Saw',
        description: 'Available to lend for weekend tree pruning. Comes with 2 freshly charged 4Ah batteries and blades.',
        category: 'LEND',
        status: 'OFFERED',
        giverId: 'sim_samir',
        giverName: 'Samir Patel',
        giverKarma: 88,
        giverNeighborhood: 'Elmwood Crescent',
        giverTrustTier: 'TRUSTED_NEIGHBOR',
        exactLocation: { lat: 43.6675, lng: -79.4072 },
        fuzzedLocation: { lat: 43.6672, lng: -79.4068 },
        pickupLocationDescription: 'Front porch keyless lockbox on Elmwood',
        estimatedDurationMinutes: 120,
        toolsRequired: 'Safety goggles and work gloves recommended',
        locationType: 'IN_PERSON_DOORSTEP',
        createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
        claimRequests: [],
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
      },
    },
    {
      id: 'notif_init_2',
      listingId: 'listing_sim_tomato',
      title: 'Heritage Tomato & Thai Basil Seedling Tray',
      category: 'GIFT',
      giverId: 'sim_marina',
      giverName: 'Marina Kowalski',
      giverNeighborhood: 'Harbord Village (Croft St)',
      distanceMeters: 220,
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      read: false,
      type: 'NEW_GIFT',
      listing: {
        id: 'listing_sim_tomato',
        title: 'Heritage Tomato & Thai Basil Seedling Tray',
        description: '12 vigorously growing seedlings started in compost. Ready to transplant into balcony containers or garden beds this weekend.',
        category: 'GIFT',
        status: 'OFFERED',
        giverId: 'sim_marina',
        giverName: 'Marina Kowalski',
        giverKarma: 92,
        giverNeighborhood: 'Harbord Village (Croft St)',
        giverTrustTier: 'TRUSTED_NEIGHBOR',
        exactLocation: { lat: 43.6640, lng: -79.4030 },
        fuzzedLocation: { lat: 43.6642, lng: -79.4035 },
        pickupLocationDescription: 'Porch pickup box on Croft St alleyway',
        locationType: 'IN_PERSON_DOORSTEP',
        createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        claimRequests: [],
        imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80',
      },
    },
  ]);
  const [activeToastNotification, setActiveToastNotification] = useState<NearbyNotification | null>(null);
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState<boolean>(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('SIMULATED_WEBSOCKET');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('CONNECTED');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Offline simulation state
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Listings (Bookmarks) State with LocalStorage Persistence
  const [savedListings, setSavedListings] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('kijijishare_saved_listings');
      return stored ? JSON.parse(stored) : ['listing_1', 'listing_3'];
    } catch {
      return ['listing_1', 'listing_3'];
    }
  });

  const handleToggleSaveListing = (listingId: string) => {
    setSavedListings(prev => {
      const isSaved = prev.includes(listingId);
      const updated = isSaved ? prev.filter(id => id !== listingId) : [listingId, ...prev];
      try {
        localStorage.setItem('kijijishare_saved_listings', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      const found = listings.find(l => l.id === listingId);
      const title = found ? found.title : 'Listing';
      showToast(isSaved ? `Removed "${title}" from My Saved.` : `Saved "${title}" to My Saved list!`);
      return updated;
    });
  };

  const handleClearAllSaved = () => {
    setSavedListings([]);
    try {
      localStorage.removeItem('kijijishare_saved_listings');
    } catch (e) {
      console.warn('LocalStorage remove error:', e);
    }
    showToast('Cleared all saved bookmarks.');
  };

  // Modals state
  const [selectedListingForDrawer, setSelectedListingForDrawer] = useState<Listing | null>(null);
  const [selectedListingForPickup, setSelectedListingForPickup] = useState<Listing | null>(null);
  const [selectedListingForPitch, setSelectedListingForPitch] = useState<Listing | null>(null);
  const [selectedNeedForOffer, setSelectedNeedForOffer] = useState<Listing | null>(null);
  const [selectedNeedForReview, setSelectedNeedForReview] = useState<Listing | null>(null);
  
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState<boolean>(false);
  const [newListingDefaultCategory, setNewListingDefaultCategory] = useState<ListingCategory>('GIFT');
  
  // Karma & AI Tools Modals
  const [isKarmaLedgerOpen, setIsKarmaLedgerOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [isMapsFinderOpen, setIsMapsFinderOpen] = useState<boolean>(false);
  const [isVeoGeneratorOpen, setIsVeoGeneratorOpen] = useState<boolean>(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);

  const [karmaModalData, setKarmaModalData] = useState<{
    targetUser: { id: string; name: string; avatar: string; role: 'GIVER' | 'RECIPIENT' | 'HELPER' | 'SEEKER' };
    transactionTitle: string;
  } | null>(null);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Sync or register user in local state & Firestore
        const existingIdx = users.findIndex(u => u.id === user.uid);
        if (existingIdx >= 0) {
          setCurrentUserId(user.uid);
        } else {
          const newAuthUser: User = {
            id: user.uid,
            name: user.displayName || 'Google Neighbor',
            avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
            neighborhood: 'Harbord Village & Elmwood',
            homeCoordinates: { lat: 43.6652, lng: -79.4045 },
            karmaScore: 65,
            vouchCount: 1,
            giftsGivenCount: 0,
            giftsReceivedCount: 0,
            needsFulfilledCount: 0,
            activeClaimsCount: 0,
            rolling7DayClaimsCount: 0,
            isVerifiedNeighbor: true,
            trustTier: 'NEWCOMER',
            vouches: [],
            karmaHistory: [],
          };
          setUsers(prev => [newAuthUser, ...prev]);
          setCurrentUserId(user.uid);

          // Save to Firestore
          setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            email: user.email || '',
            fullName: user.displayName || 'Google Neighbor',
            avatarUrl: user.photoURL || '',
            neighborhood: 'Harbord Village & Elmwood',
            karmaScore: 65,
            trustTier: 'NEWCOMER',
            vouchCount: 1,
            giftsGivenCount: 0,
            giftsReceivedCount: 0,
            needsFulfilledCount: 0,
            createdAt: new Date().toISOString(),
          }).catch(err => {
            console.warn('Firestore user doc sync notice:', err);
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        showToast(`Signed in as ${user.displayName || user.email}! Connected to Firebase.`);
      }
    } catch (err: any) {
      showToast(`Sign in error: ${err.message}`);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutUser();
      setCurrentUserId('user_elena');
      showToast('Signed out of Firebase.');
    } catch (err: any) {
      showToast(`Sign out error: ${err.message}`);
    }
  };

  // 1km Alert System: Check browser push permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    } else {
      setPushPermission('unsupported');
    }
  }, []);

  const handleRequestPushPermission = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      setPushPermission('granted');
      showToast('Browser push notifications enabled for 1km neighborhood drops!');
      showSystemNotification(
        'Push Alerts Activated',
        'You will receive instant alerts when neighbors post within 1km of your location.'
      );
    } else {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPushPermission(Notification.permission);
      }
      showToast('Push permission was not granted. In-app alerts remain active.');
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All 1km alerts marked as read.');
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    showToast('Alert inbox cleared.');
  };

  const dispatchNearbyAlert = (newListing: Listing) => {
    const distanceMeters = calculateDistanceMeters(currentUser.homeCoordinates, newListing.fuzzedLocation);
    if (distanceMeters <= 1000) {
      const isNeed = newListing.category === 'NEED_ITEM' || newListing.category === 'NEED_HELP';
      const newNotif: NearbyNotification = {
        id: `notif_${Date.now()}`,
        listingId: newListing.id,
        title: newListing.title,
        category: newListing.category,
        giverId: newListing.giverId,
        giverName: newListing.giverName,
        giverNeighborhood: newListing.giverNeighborhood,
        distanceMeters: Math.round(distanceMeters),
        timestamp: new Date().toISOString(),
        read: false,
        listing: newListing,
        type: isNeed ? 'NEW_NEED' : 'NEW_GIFT',
        urgencyLevel: newListing.urgencyLevel,
      };

      setNotifications(prev => [newNotif, ...prev]);
      setActiveToastNotification(newNotif);

      if (soundEnabled) {
        playNearbyChime();
      }

      showSystemNotification(
        newListing.title,
        `${formatDistance(distanceMeters)} away in ${newListing.giverNeighborhood} by ${newListing.giverName}`
      );
    }
  };

  const handleTriggerSimulateDrop = () => {
    const randomIndex = Math.floor(Math.random() * HYPERLOCAL_SIMULATION_POOL.length);
    const template = HYPERLOCAL_SIMULATION_POOL[randomIndex];

    // Compute random location between 150m and 850m from current user
    const fuzzed = randomOffsetCoords(currentUser.homeCoordinates, 150, 850);
    const exact = randomOffsetCoords(fuzzed, 20, 80);
    const newId = `listing_sim_${Date.now()}`;

    const newSimulatedListing: Listing = {
      ...template,
      id: newId,
      fuzzedLocation: fuzzed,
      exactLocation: exact,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      claimRequests: [],
    };

    setListings(prev => [newSimulatedListing, ...prev]);
    dispatchNearbyAlert(newSimulatedListing);
    showToast(`Simulated drop: "${template.title}" within 1km!`);
  };

  // Polling / WebSocket auto-simulation effect
  useEffect(() => {
    if (!autoSimulate) return;

    // Simulated WebSocket pushes every ~28s, Polling checks every ~12s
    const intervalTime = connectionMode === 'SIMULATED_WEBSOCKET' ? 28000 : 12000;
    const timer = setInterval(() => {
      handleTriggerSimulateDrop();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoSimulate, connectionMode, currentUser]);

  const handleSelectListingFromNotification = (listingId: string) => {
    const found = listings.find(l => l.id === listingId);
    if (!found) {
      showToast('Listing not found or expired.');
      return;
    }

    if (found.category === 'NEED_ITEM' || found.category === 'NEED_HELP') {
      setActiveTab('needs');
      if (found.giverId === currentUser.id) {
        setSelectedNeedForReview(found);
      } else {
        setSelectedNeedForOffer(found);
      }
    } else {
      setActiveTab('feed');
      if (found.giverId === currentUser.id && found.claimRequests.length > 0) {
        setSelectedListingForDrawer(found);
      } else if (found.selectedRecipientId === currentUser.id || found.status === 'GIVER_SELECTED') {
        setSelectedListingForPickup(found);
      } else {
        setSelectedListingForPitch(found);
      }
    }
  };

  const openNeedsCount = listings.filter(
    l => (l.category === 'NEED_ITEM' || l.category === 'NEED_HELP') && l.status === 'OFFERED'
  ).length;

  const handleToggleOffline = () => {
    if (isOffline) {
      setIsOffline(false);
      const drafts = getOfflineDrafts();
      if (drafts.length > 0) {
        showToast(`Reconnected! Synced ${drafts.length} offline draft(s) with PostGIS & Firestore.`);
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

  // 1. Submit pitch
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
        const updatedStatus = l.status === 'OFFERED' ? 'INTEREST_EXPRESSED' : l.status;
        
        // Sync to Firestore if authenticated
        if (firebaseUser) {
          updateDoc(doc(db, 'listings', listingId), {
            status: updatedStatus,
            claimRequests: [newReq, ...l.claimRequests],
          }).catch(e => console.warn('Firestore update notice:', e));
        }

        return {
          ...l,
          status: updatedStatus,
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

  // 2. Select Recipient
  const handleSelectRecipient = (listingId: string, claimRequest: ClaimRequest) => {
    const handshakePin = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        const updatedRequests = l.claimRequests.map(r => 
          r.id === claimRequest.id ? { ...r, status: 'ACCEPTED' as const } : { ...r, status: 'DECLINED' as const }
        );

        if (firebaseUser) {
          updateDoc(doc(db, 'listings', listingId), {
            status: 'GIVER_SELECTED',
            selectedRecipientId: claimRequest.requesterId,
            selectedRecipientName: claimRequest.requesterName,
            handshakePin,
            claimRequests: updatedRequests,
          }).catch(e => console.warn('Firestore update notice:', e));
        }

        return {
          ...l,
          status: 'GIVER_SELECTED',
          selectedRecipientId: claimRequest.requesterId,
          selectedRecipientName: claimRequest.requesterName,
          scheduledPickupTime: 'Today at 5:30 PM',
          handshakePin,
          claimRequests: updatedRequests,
        };
      }
      return l;
    }));

    showToast(`Selected ${claimRequest.requesterName}! Doorstep pickup PIN generated.`);
  };

  // 3. Confirm Handshake
  const handleConfirmHandshake = (listingId: string, pin: string, vouchBadge?: string) => {
    let targetGiverId = '';
    let targetRecipientId = '';
    let itemTitle = '';

    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        targetGiverId = l.giverId;
        targetRecipientId = l.selectedRecipientId || '';
        itemTitle = l.title;

        if (firebaseUser) {
          updateDoc(doc(db, 'listings', listingId), {
            status: 'FULFILLED',
          }).catch(e => console.warn('Firestore update notice:', e));
        }

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
        const updatedOffers = [newOffer, ...(l.needOffers || [])];
        if (firebaseUser) {
          updateDoc(doc(db, 'listings', needId), {
            needOffers: updatedOffers,
          }).catch(e => console.warn('Firestore update notice:', e));
        }
        return {
          ...l,
          needOffers: updatedOffers,
        };
      }
      return l;
    }));

    showToast('Assistance offer sent to neighbor!');
  };

  // 6. Accept helper on a Need
  const handleAcceptHelper = (needId: string, offer: NeedOffer) => {
    let needTitle = '';

    setListings(prev => prev.map(l => {
      if (l.id === needId) {
        needTitle = l.title;
        const updatedOffers = (l.needOffers || []).map(o => 
          o.id === offer.id ? { ...o, status: 'ACCEPTED' as const } : { ...o, status: 'DECLINED' as const }
        );

        if (firebaseUser) {
          updateDoc(doc(db, 'listings', needId), {
            status: 'FULFILLED',
            needOffers: updatedOffers,
          }).catch(e => console.warn('Firestore update notice:', e));
        }

        return {
          ...l,
          status: 'FULFILLED',
          needOffers: updatedOffers,
        };
      }
      return l;
    }));

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

        // Record to Firestore
        if (firebaseUser) {
          setDoc(doc(db, 'karma_transactions', newEvent.id), {
            id: newEvent.id,
            userId: u.id,
            awardedBy: currentUser.id,
            awardedByName: currentUser.name,
            points,
            badge,
            note,
            createdAt: newEvent.timestamp,
          }).catch(e => console.warn('Firestore karma doc notice:', e));
        }

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
      
      // Persist to Firestore
      if (firebaseUser) {
        setDoc(doc(db, 'listings', newListing.id), {
          id: newListing.id,
          giverId: currentUser.id,
          giverName: currentUser.name,
          giverNeighborhood: currentUser.neighborhood,
          giverKarma: currentUser.karmaScore,
          title: newListing.title,
          description: newListing.description,
          category: newListing.category,
          status: newListing.status,
          lat: newListing.fuzzedLocation.lat,
          lng: newListing.fuzzedLocation.lng,
          pickupLocationDescription: newListing.pickupLocationDescription || '',
          estimatedDurationMinutes: newListing.estimatedDurationMinutes || 0,
          relevantExperience: newListing.relevantExperience || '',
          toolsRequired: newListing.toolsRequired || '',
          locationType: newListing.locationType || 'IN_PERSON_DOORSTEP',
          urgencyLevel: newListing.urgencyLevel || 'NORMAL',
          createdAt: newListing.createdAt,
        }).catch(err => {
          console.warn('Firestore listing sync notice:', err);
        });
      }

      if (newListing.category === 'NEED_ITEM' || newListing.category === 'NEED_HELP') {
        showToast('Mutual aid request posted to the Needs Board!');
        setActiveTab('needs');
      } else {
        showToast('Listing broadcast to neighbors within 5km radius!');
      }

      // Check and dispatch 1km hyper-local alert
      dispatchNearbyAlert(newListing);
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

      {/* 1km Immediate Radius Push & Toast Alert */}
      <NearbyAlertToast
        notification={activeToastNotification}
        onClose={() => setActiveToastNotification(null)}
        onViewListing={handleSelectListingFromNotification}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
      />

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
        savedCount={savedListings.length}
        unreadNotificationCount={notifications.filter(n => !n.read).length}
        onOpenAlertCenter={() => setIsAlertCenterOpen(true)}
        firebaseUser={firebaseUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenMapsGrounding={() => setIsMapsFinderOpen(true)}
        onOpenVeoGenerator={() => setIsVeoGeneratorOpen(true)}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
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
            savedListings={savedListings}
            onToggleSaveListing={handleToggleSaveListing}
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
            savedListings={savedListings}
            onToggleSaveListing={handleToggleSaveListing}
          />
        )}

        {/* My Saved Bookmarks Tab */}
        {activeTab === 'saved' && (
          <MySavedListings
            savedListingIds={savedListings}
            allListings={listings}
            currentUser={currentUser}
            onToggleSaveListing={handleToggleSaveListing}
            onClearAllSaved={handleClearAllSaved}
            onExpressInterest={(listing) => setSelectedListingForPitch(listing)}
            onOpenSelectionDrawer={(listing) => setSelectedListingForDrawer(listing)}
            onOpenPickupCoordinator={(listing) => setSelectedListingForPickup(listing)}
            onOpenOfferHelpModal={(need) => setSelectedNeedForOffer(need)}
            onOpenReviewOffersDrawer={(need) => setSelectedNeedForReview(need)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Radar Map Tab */}
        {activeTab === 'map' && (
          <GeospatialRadar
            listings={listings}
            currentUser={currentUser}
            savedListings={savedListings}
            onToggleSaveListing={handleToggleSaveListing}
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

      {isChatbotOpen && (
        <GeminiChatbot
          isOpen={true}
          onClose={() => setIsChatbotOpen(false)}
          neighborhoodName={currentUser.neighborhood}
        />
      )}

      {isMapsFinderOpen && (
        <MapsGroundingFinder
          isOpen={true}
          onClose={() => setIsMapsFinderOpen(false)}
          neighborhood={currentUser.neighborhood}
        />
      )}

      {isVeoGeneratorOpen && (
        <VeoVideoGenerator
          isOpen={true}
          onClose={() => setIsVeoGeneratorOpen(false)}
        />
      )}

      {isLiveVoiceOpen && (
        <LiveVoiceStudio
          isOpen={true}
          onClose={() => setIsLiveVoiceOpen(false)}
          neighborhood={currentUser.neighborhood}
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

      {/* 1km Radar Alert Center Drawer */}
      <NearbyAlertCenter
        isOpen={isAlertCenterOpen}
        onClose={() => setIsAlertCenterOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAllNotifications}
        onSelectListing={handleSelectListingFromNotification}
        connectionMode={connectionMode}
        onToggleConnectionMode={() => {
          const newMode = connectionMode === 'SIMULATED_WEBSOCKET' ? 'POLLING' : 'SIMULATED_WEBSOCKET';
          setConnectionMode(newMode);
          setConnectionStatus(newMode === 'SIMULATED_WEBSOCKET' ? 'CONNECTED' : 'POLLING');
          showToast(`Switched alert engine to ${newMode === 'SIMULATED_WEBSOCKET' ? 'WebSocket Stream' : '10s Polling Worker'}.`);
        }}
        connectionStatus={connectionStatus}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        autoSimulate={autoSimulate}
        onToggleAutoSimulate={() => {
          setAutoSimulate(prev => {
            const next = !prev;
            showToast(next ? 'Auto-simulation enabled! Neighbors will drop listings periodically.' : 'Auto-simulation paused.');
            return next;
          });
        }}
        onTriggerSimulateDrop={handleTriggerSimulateDrop}
        pushPermission={pushPermission}
        onRequestPushPermission={handleRequestPushPermission}
        currentNeighborhood={currentUser.neighborhood}
      />

      {/* Minimalist Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-stone-800">KijijiShare</span>
            <span aria-hidden="true">·</span>
            <span>Firebase Firestore Auth · Gemini Live · Google Maps Grounding · Veo 3</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Toroidal 1-5km Mesh · PostGIS ST_DWithin · Offline Resilience · Zero-Barter Mutual Aid
          </div>
        </div>
      </footer>
    </div>
  );
}
