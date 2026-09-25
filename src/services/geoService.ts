import { Coordinates, Listing } from '../types';

/**
 * Earth radius in meters
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * Computes great-circle distance between two coordinates using the Haversine formula
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Formats distance in meters into human-readable neighborly format
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m away`;
  }
  return `${(meters / 1000).toFixed(1)} km away`;
}

/**
 * Generates an obfuscated (fuzzed) coordinate within a randomized 150m-300m radius
 * to preserve donor privacy on public feeds before a safe pickup is confirmed.
 */
export function generateFuzzedCoordinates(origin: Coordinates): Coordinates {
  // Random angle in radians
  const angle = Math.random() * 2 * Math.PI;
  // Distance between 120m and 300m
  const distance = 120 + Math.random() * 180;

  // Convert distance to coordinate offsets
  const dLat = (distance * Math.cos(angle)) / 111139;
  const dLng = (distance * Math.sin(angle)) / (111139 * Math.cos((origin.lat * Math.PI) / 180));

  return {
    lat: Number((origin.lat + dLat).toFixed(6)),
    lng: Number((origin.lng + dLng).toFixed(6)),
  };
}

/**
 * Client-side simulation of PostGIS ST_DWithin(geom, user_geom, radius_meters)
 */
export function filterListingsByRadius(
  listings: Listing[],
  userLocation: Coordinates,
  radiusMeters: number
): (Listing & { computedDistance: number })[] {
  return listings
    .map(listing => {
      const dist = calculateDistanceMeters(userLocation, listing.fuzzedLocation);
      return {
        ...listing,
        computedDistance: dist,
      };
    })
    .filter(item => item.computedDistance <= radiusMeters)
    .sort((a, b) => a.computedDistance - b.computedDistance);
}
