export type ListingCategory = 
  | 'GIFT'          // Physical items given away permanently
  | 'LEND'          // Tools/appliances borrowed temporarily
  | 'SKILL'         // Teaching or mentorship shared
  | 'SERVICE'       // Hands-on physical help, repair, or chores
  | 'NEED_ITEM'     // Mutual aid: looking for a physical item
  | 'NEED_HELP';    // Mutual aid: looking for hands-on help or skill

export type ListingStatus = 
  | 'OFFERED'
  | 'INTEREST_EXPRESSED'
  | 'GIVER_SELECTED'
  | 'PICKUP_SCHEDULED'
  | 'FULFILLED'
  | 'CLOSED';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  neighborhood: string;
  homeCoordinates: Coordinates;
  karmaScore: number; // 0 - 100
  vouchCount: number;
  giftsGivenCount: number;
  giftsReceivedCount: number;
  needsFulfilledCount: number;
  activeClaimsCount: number;
  rolling7DayClaimsCount: number;
  lastClaimFulfilledAt?: string;
  isVerifiedNeighbor: boolean;
  trustTier: 'NEWCOMER' | 'TRUSTED_NEIGHBOR' | 'PILLAR_OF_COMMUNITY' | 'PROBATION';
  cooldownUntil?: string;
  vouches: Vouch[];
  karmaHistory?: KarmaEvent[];
}

export interface Vouch {
  id: string;
  voucherId: string;
  voucherName: string;
  voucherNeighborhood: string;
  recipientId: string;
  badge: 'Punctual Pickup' | 'Generous Giver' | 'Tool Caretaker' | 'Known Neighbor' | 'Skilled Helper' | 'Reliable Neighbor';
  comment: string;
  createdAt: string;
}

export interface KarmaEvent {
  id: string;
  userId: string;
  type: 'GIFT_GIVEN' | 'NEED_FULFILLED' | 'SKILL_SHARED' | 'PUNCTUAL_PICKUP' | 'PEER_VOUCH' | 'NO_SHOW_PENALTY';
  points: number;
  description: string;
  partnerId: string;
  partnerName: string;
  badgeAwarded?: string;
  timestamp: string;
}

export interface ClaimRequest {
  id: string;
  listingId: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterKarma: number;
  requesterDistanceMeters: number;
  requesterVouches: string[];
  pitch: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';
  createdAt: string;
}

export interface NeedOffer {
  id: string;
  listingId: string;
  helperId: string;
  helperName: string;
  helperAvatar: string;
  helperKarma: number;
  helperDistanceMeters: number;
  helperVouches: string[];
  offerType: 'ITEM' | 'SKILL' | 'HANDS_ON_HELP';
  message: string;
  availability: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  status: ListingStatus;
  giverId: string;
  giverName: string;
  giverKarma: number;
  giverNeighborhood: string;
  giverTrustTier?: User['trustTier'];
  
  // Exact private coordinates (only revealed when GIVER_SELECTED & safe agreement reached)
  exactLocation: Coordinates;
  // Fuzzed coordinates (300m randomized offset for public feed/map)
  fuzzedLocation: Coordinates;
  pickupLocationDescription?: string; // Revealed only to selected recipient
  distanceMeters?: number; // Calculated relative to current viewer
  
  // Media & optimization
  imageUrl?: string;
  imageCompressedBytes?: number;
  imageOriginalBytes?: number;
  
  // Skill & Service exchange metadata
  estimatedDurationMinutes?: number; // e.g. 60, 120
  relevantExperience?: string;       // e.g. "5 yrs bicycle mechanics", "Licensed electrician", "Self-taught baker"
  toolsRequired?: string;            // e.g. "I bring drill and bits", "Ladder needed on site"
  locationType?: 'IN_PERSON_DOORSTEP' | 'IN_PERSON_PUBLIC' | 'REMOTE_VIRTUAL';
  urgencyLevel?: 'LOW' | 'NORMAL' | 'URGENT'; // for Needs Board
  
  createdAt: string;
  expiresAt: string;
  
  // Matching & Handshake coordination
  selectedRecipientId?: string;
  selectedRecipientName?: string;
  scheduledPickupTime?: string;
  handshakePin?: string; // 6-digit one-time confirmation code
  isOfflineDraft?: boolean;
  
  // Inbound responses
  claimRequests: ClaimRequest[];
  needOffers?: NeedOffer[];
}

export interface TransferLog {
  id: string;
  listingId: string;
  giverId: string;
  recipientId: string;
  giverConfirmed: boolean;
  recipientConfirmed: boolean;
  handshakePinEntered: string;
  completedAt: string;
  karmaAwardedGiver: number;
  karmaAwardedRecipient: number;
  vouchAwarded?: string;
  mutualFeedback?: {
    punctual: boolean;
    pleasant: boolean;
    comment: string;
  };
}

export interface AntiHoardingRules {
  maxActiveClaims: number;
  rolling7DayLimit: number;
  minGiveToReceiveRatio: number;
  cooldownHoursPostClaim: number;
}
