export type ListingCategory = 'GIFT' | 'LEND' | 'SKILL' | 'ASK';

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
  activeClaimsCount: number;
  rolling7DayClaimsCount: number;
  lastClaimFulfilledAt?: string;
  isVerifiedNeighbor: boolean;
  trustTier: 'NEWCOMER' | 'TRUSTED_NEIGHBOR' | 'PILLAR_OF_COMMUNITY' | 'PROBATION';
  cooldownUntil?: string;
  vouches: Vouch[];
}

export interface Vouch {
  id: string;
  voucherId: string;
  voucherName: string;
  voucherNeighborhood: string;
  recipientId: string;
  badge: 'Punctual Pickup' | 'Generous Giver' | 'Tool Caretaker' | 'Known Neighbor';
  comment: string;
  createdAt: string;
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
  // Exact private coordinates (only revealed when GIVER_SELECTED & safe agreement reached)
  exactLocation: Coordinates;
  // Fuzzed coordinates (300m randomized offset for public feed/map)
  fuzzedLocation: Coordinates;
  pickupLocationDescription?: string; // Revealed only to selected recipient
  distanceMeters?: number; // Calculated relative to current viewer
  imageUrl?: string;
  imageCompressedBytes?: number;
  imageOriginalBytes?: number;
  createdAt: string;
  expiresAt: string;
  selectedRecipientId?: string;
  selectedRecipientName?: string;
  scheduledPickupTime?: string;
  handshakePin?: string; // 6-digit one-time confirmation code
  isOfflineDraft?: boolean;
  claimRequests: ClaimRequest[];
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
  mutualFeedback?: {
    punctual: boolean;
    pleasant: boolean;
    comment: string;
  };
}

export interface AntiHoardingRules {
  maxActiveClaims: number; // e.g. 2 for newcomers, 4 for trusted
  rolling7DayLimit: number; // e.g. 5 items per rolling 7 days
  minGiveToReceiveRatio: number; // e.g. 0.33 (1 give per 3 receives)
  cooldownHoursPostClaim: number; // e.g. 24h cooldown after 2 fast claims
}
