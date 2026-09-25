import { Coordinates, Listing, ListingCategory } from '../types';
import { calculateDistanceMeters, formatDistance } from './geoService';

export interface NearbyNotification {
  id: string;
  listingId: string;
  title: string;
  category: ListingCategory;
  giverId: string;
  giverName: string;
  giverNeighborhood: string;
  distanceMeters: number;
  timestamp: string;
  read: boolean;
  listing: Listing;
  type: 'NEW_GIFT' | 'NEW_LEND' | 'NEW_SKILL' | 'NEW_NEED';
  urgencyLevel?: 'LOW' | 'NORMAL' | 'URGENT';
}

export type ConnectionMode = 'SIMULATED_WEBSOCKET' | 'POLLING';
export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'POLLING' | 'DISCONNECTED';

export interface ChannelStats {
  channelName: string;
  latencyMs: number;
  lastPing: string;
  connectedSince: string;
  activeWatchers: number;
}

/**
 * Play a friendly two-tone warm chime using Web Audio API
 */
export function playNearbyChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Tone 2 (slight harmonic delay)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (err) {
    console.warn('Audio chime notice:', err);
  }
}

/**
 * Check if a listing is within the immediate 1km boundary
 */
export function isWithin1Km(userCoords: Coordinates, listingCoords: Coordinates): { within1km: boolean; distanceMeters: number } {
  const distanceMeters = calculateDistanceMeters(userCoords, listingCoords);
  return {
    within1km: distanceMeters <= 1000,
    distanceMeters,
  };
}

/**
 * Request browser push notification permission
 */
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Send a native browser push notification
 */
export function showSystemNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(`KijijiShare 1km Alert: ${title}`, {
        body,
        icon: '/favicon.ico',
        tag: 'kijijishare-1km-alert',
      });
    } catch (e) {
      console.warn('System notification error:', e);
    }
  }
}

/**
 * Helper to compute random offset coordinates within min and max meters
 */
export function randomOffsetCoords(center: Coordinates, minMeters: number, maxMeters: number): Coordinates {
  const radiusMeters = minMeters + Math.random() * (maxMeters - minMeters);
  const angle = Math.random() * 2 * Math.PI;

  const latOffset = (radiusMeters * Math.cos(angle)) / 111320;
  const lngOffset = (radiusMeters * Math.sin(angle)) / (111320 * Math.cos(center.lat * (Math.PI / 180)));

  return {
    lat: Number((center.lat + latOffset).toFixed(6)),
    lng: Number((center.lng + lngOffset).toFixed(6)),
  };
}

/**
 * Curated seed of hyper-local neighborhood drops within 1km
 */
export const HYPERLOCAL_SIMULATION_POOL: Array<Omit<Listing, 'id' | 'createdAt' | 'expiresAt' | 'exactLocation' | 'fuzzedLocation' | 'claimRequests'>> = [
  {
    title: 'Heritage Tomato & Thai Basil Seedling Tray',
    description: '12 vigorously growing seedlings started in compost. Ready to transplant into balcony containers or garden beds this weekend.',
    category: 'GIFT',
    status: 'OFFERED',
    giverId: 'sim_marina',
    giverName: 'Marina Kowalski',
    giverKarma: 92,
    giverNeighborhood: 'Harbord Village (Croft St)',
    giverTrustTier: 'TRUSTED_NEIGHBOR',
    pickupLocationDescription: 'Porch pickup box on Croft St alleyway',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80',
    locationType: 'IN_PERSON_DOORSTEP',
  },
  {
    title: 'DeWalt 20V Cordless Reciprocating Saw',
    description: 'Available to lend for weekend tree pruning or small demolition work. Comes with 2 freshly charged 4Ah batteries and multi-material blades.',
    category: 'LEND',
    status: 'OFFERED',
    giverId: 'sim_samir',
    giverName: 'Samir Patel',
    giverKarma: 88,
    giverNeighborhood: 'Elmwood Crescent',
    giverTrustTier: 'TRUSTED_NEIGHBOR',
    pickupLocationDescription: 'Front porch pickup with keypad lockbox',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
    estimatedDurationMinutes: 120,
    toolsRequired: 'Safety goggles and work gloves recommended',
    locationType: 'IN_PERSON_DOORSTEP',
  },
  {
    title: 'Urgent: Aluminum Youth Underarm Crutches',
    description: 'My 11-year-old daughter sprained her ankle at recess. Doctor advised non-weight bearing for 5 days. Needed immediately if anyone has a spare pair in the closet!',
    category: 'NEED_ITEM',
    status: 'OFFERED',
    giverId: 'sim_clara',
    giverName: 'Clara Dubois',
    giverKarma: 72,
    giverNeighborhood: 'Robert St & Sussex',
    giverTrustTier: 'NEWCOMER',
    urgencyLevel: 'URGENT',
    locationType: 'IN_PERSON_PUBLIC',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: '12-Speed Bicycle Derailleur Tuning & Chain Care',
    description: 'Offering 45-minute neighborhood tune-ups at the community bike stand. Can index gears, adjust brakes, and lube chains.',
    category: 'SKILL',
    status: 'OFFERED',
    giverId: 'sim_tariq',
    giverName: 'Tariq Al-Mansoor',
    giverKarma: 95,
    giverNeighborhood: 'Borden St Community Garden',
    giverTrustTier: 'PILLAR_OF_COMMUNITY',
    estimatedDurationMinutes: 45,
    relevantExperience: '10 years community bike co-op volunteer',
    toolsRequired: 'I provide portable repair stand and Park Tool kit',
    locationType: 'IN_PERSON_PUBLIC',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Active Sourdough Starter ("Bessie", 5 yrs old) + Glass Jar',
    description: '150g established active levain fed with organic rye flour. Bubbling and happy. Includes feeding instructions and foolproof country loaf recipe.',
    category: 'GIFT',
    status: 'OFFERED',
    giverId: 'sim_hannah',
    giverName: 'Hannah Lindqvist',
    giverKarma: 90,
    giverNeighborhood: 'Albany Ave & Barton',
    giverTrustTier: 'TRUSTED_NEIGHBOR',
    pickupLocationDescription: 'Insulated cooler bag on front porch',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    locationType: 'IN_PERSON_DOORSTEP',
  },
  {
    title: 'Need Help: Moving 2 Heavy Cedar Planters',
    description: 'Need a second pair of hands for 15 minutes to carry two soil-filled planters from driveway to back patio. Can share cold sparkling cider!',
    category: 'NEED_HELP',
    status: 'OFFERED',
    giverId: 'sim_gordon',
    giverName: 'Gordon MacIntyre',
    giverKarma: 84,
    giverNeighborhood: 'Spadina & Sussex',
    giverTrustTier: 'TRUSTED_NEIGHBOR',
    urgencyLevel: 'NORMAL',
    estimatedDurationMinutes: 20,
    toolsRequired: 'Heavy lifting gloves provided',
    locationType: 'IN_PERSON_DOORSTEP',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Lodge 10.25" Pre-Seasoned Cast Iron Skillet',
    description: 'Downsizing our cookware. Well seasoned with grapeseed oil, ready to cook eggs or sear vegetables. Free to a good home.',
    category: 'GIFT',
    status: 'OFFERED',
    giverId: 'sim_sophie',
    giverName: 'Sophie Bouchard',
    giverKarma: 86,
    giverNeighborhood: 'Brunswick Ave',
    giverTrustTier: 'TRUSTED_NEIGHBOR',
    pickupLocationDescription: 'Step table by front vestibule door',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    locationType: 'IN_PERSON_DOORSTEP',
  },
];
