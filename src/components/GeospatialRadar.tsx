import { useState } from 'react';
import { Listing, User, ListingCategory } from '../types';
import { calculateDistanceMeters, formatDistance } from '../services/geoService';
import { 
  Gift, 
  Wrench, 
  Sparkles, 
  HelpCircle, 
  MapPin, 
  ShieldCheck, 
  Eye, 
  Lock, 
  CheckCircle2, 
  Info,
  Navigation
} from 'lucide-react';

interface GeospatialRadarProps {
  listings: Listing[];
  currentUser: User;
  onSelectListing: (listing: Listing) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
}

export function GeospatialRadar({
  listings,
  currentUser,
  onSelectListing,
  radiusKm,
  setRadiusKm,
}: GeospatialRadarProps) {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(listings[0]?.id || null);
  const [showFuzzedRadiusOverlay, setShowFuzzedRadiusOverlay] = useState(true);

  // Center of view is currentUser's home coordinate
  const centerLat = currentUser.homeCoordinates.lat;
  const centerLng = currentUser.homeCoordinates.lng;

  // Visual map bounds projection to SVG viewBox (600 x 600)
  // 1 degree lat approx 111km -> 1km = 0.0090 degrees
  // Radius range: maxRadius is 5.5km
  const viewRadiusKm = Math.max(radiusKm * 1.25, 2.5);
  const latDelta = (viewRadiusKm / 111);
  const lngDelta = (viewRadiusKm / (111 * Math.cos((centerLat * Math.PI) / 180)));

  const mapWidth = 600;
  const mapHeight = 600;

  // Projection helper: lat/lng -> SVG X/Y
  const project = (lat: number, lng: number) => {
    const x = ((lng - (centerLng - lngDelta)) / (2 * lngDelta)) * mapWidth;
    // Invert Y for SVG coordinates
    const y = ((centerLat + latDelta - lat) / (2 * latDelta)) * mapHeight;
    return { x, y };
  };

  // Convert distance in meters to SVG pixel radius
  const metersToPixels = (meters: number) => {
    const km = meters / 1000;
    const latSpanKm = 2 * viewRadiusKm;
    return (km / latSpanKm) * mapHeight;
  };

  const centerProjected = project(centerLat, centerLng);
  const selectedListing = listings.find(l => l.id === selectedListingId);

  const getCategoryIcon = (category: ListingCategory) => {
    switch (category) {
      case 'GIFT': return <Gift className="w-3.5 h-3.5" />;
      case 'LEND': return <Wrench className="w-3.5 h-3.5" />;
      case 'SKILL': return <Sparkles className="w-3.5 h-3.5" />;
      case 'SERVICE': return <Wrench className="w-3.5 h-3.5" />;
      case 'NEED_ITEM': return <HelpCircle className="w-3.5 h-3.5" />;
      case 'NEED_HELP': return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Radar Map Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>POSTGIS SPATIAL RADAR (ST_DWithin)</span>
              <span>·</span>
              <span>300m PRIVACY FUZZING</span>
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Geospatial Mesh Navigator
            </h2>
            <p className="text-xs text-stone-400 mt-1 max-w-xl">
              Demonstrating privacy-preserving spatial indexing. Exact residential addresses remain hidden in 300m randomized Gaussian circles until donor approves matching handshake.
            </p>
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-lg text-xs">
              <span className="text-stone-400 px-2 font-medium">Radius:</span>
              {[1, 3, 5].map(r => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-3 py-1 font-mono font-medium rounded-md transition-colors cursor-pointer ${
                    radiusKm === r ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFuzzedRadiusOverlay(!showFuzzedRadiusOverlay)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                showFuzzedRadiusOverlay 
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300' 
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title="Toggle 300m Privacy Obfuscation Circles"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">300m Privacy Rings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Selected Listing Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-8 bg-stone-950 rounded-2xl p-4 border border-stone-800 relative overflow-hidden flex items-center justify-center">
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full max-w-[620px] aspect-square rounded-xl select-none"
          >
            {/* Subtle Grid Lines simulating neighborhood blocks */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Concentric PostGIS Query Boundary Rings (1km, 3km, 5km) */}
            {[1000, 3000, 5000].map((distMeters, idx) => {
              const rPx = metersToPixels(distMeters);
              const isSelectedBoundary = distMeters === radiusKm * 1000;
              return (
                <g key={distMeters}>
                  <circle
                    cx={centerProjected.x}
                    cy={centerProjected.y}
                    r={rPx}
                    fill={isSelectedBoundary ? 'rgba(16, 185, 129, 0.04)' : 'none'}
                    stroke={isSelectedBoundary ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth={isSelectedBoundary ? '1.5' : '1'}
                    strokeDasharray={isSelectedBoundary ? '4,4' : '2,2'}
                  />
                  <text
                    x={centerProjected.x + 6}
                    y={centerProjected.y - rPx + 14}
                    fill={isSelectedBoundary ? '#34d399' : '#78716c'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {idx + 1 === 1 ? '1km radius' : idx + 1 === 2 ? '3km radius' : '5km boundary'}
                  </text>
                </g>
              );
            })}

            {/* 300m Privacy Obfuscation Zones around Listings */}
            {showFuzzedRadiusOverlay && listings.map(item => {
              const pt = project(item.fuzzedLocation.lat, item.fuzzedLocation.lng);
              const r300 = metersToPixels(300);
              const isSelected = item.id === selectedListingId;
              return (
                <g key={`fuzz-${item.id}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={r300}
                    fill={isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.05)'}
                    stroke={isSelected ? '#f59e0b' : 'rgba(52, 211, 153, 0.25)'}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                </g>
              );
            })}

            {/* User Center Point ("You are here") */}
            <g transform={`translate(${centerProjected.x}, ${centerProjected.y})`}>
              <circle r="14" fill="rgba(16, 185, 129, 0.2)" className="animate-ping" />
              <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <text y="20" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                {currentUser.name.split(' ')[0]} (You)
              </text>
            </g>

            {/* Listing Pins */}
            {listings.map(item => {
              const pt = project(item.fuzzedLocation.lat, item.fuzzedLocation.lng);
              const isSelected = item.id === selectedListingId;
              const dist = calculateDistanceMeters(currentUser.homeCoordinates, item.fuzzedLocation);
              const isOutsideSelectedRadius = dist > radiusKm * 1000;

              return (
                <g
                  key={item.id}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  onClick={() => setSelectedListingId(item.id)}
                  className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  opacity={isOutsideSelectedRadius ? 0.35 : 1}
                >
                  {/* Pin Circle */}
                  <circle
                    r={isSelected ? '14' : '10'}
                    fill={
                      item.category === 'GIFT' ? '#059669' :
                      item.category === 'LEND' ? '#2563eb' :
                      item.category === 'SKILL' ? '#d97706' : '#e11d48'
                    }
                    stroke={isSelected ? '#fef08a' : '#ffffff'}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                  />
                  {/* Category initial */}
                  <text
                    y="3.5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {item.category[0]}
                  </text>

                  {/* Selected label */}
                  {isSelected && (
                    <g transform="translate(0, -18)">
                      <rect
                        x="-50"
                        y="-16"
                        width="100"
                        height="18"
                        rx="4"
                        fill="#1c1917"
                        stroke="#f59e0b"
                        strokeWidth="1"
                      />
                      <text
                        y="-4"
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize="9"
                        fontWeight="600"
                      >
                        {formatDistance(dist)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Map Overlay Badge */}
          <div className="absolute bottom-6 left-6 bg-stone-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-stone-800 text-[11px] text-stone-300 font-mono space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>GIFT</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block ml-2"></span>
              <span>LEND</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ml-2"></span>
              <span>SKILL</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block ml-2"></span>
              <span>ASK</span>
            </div>
            <div className="text-stone-400">
              Center: {currentUser.neighborhood} ({centerLat.toFixed(4)}, {centerLng.toFixed(4)})
            </div>
          </div>
        </div>

        {/* Selected Listing Inspector Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          {selectedListing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  {getCategoryIcon(selectedListing.category)}
                  {selectedListing.category}
                </span>
                <span className="font-mono text-emerald-800 font-bold">
                  {formatDistance(calculateDistanceMeters(currentUser.homeCoordinates, selectedListing.fuzzedLocation))}
                </span>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-stone-900 leading-snug">
                  {selectedListing.title}
                </h3>
                <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                  {selectedListing.description}
                </p>
              </div>

              {/* Spatial Privacy Explainer Card */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Geospatial Privacy Obfuscation</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-normal">
                  The pin on the map is intentionally offset by ~220m from the donor's actual doorstep.
                  Exact address is unlocked solely after mutual match confirmation.
                </p>
              </div>

              {/* Metadata list */}
              <div className="border-t border-stone-100 pt-3 text-xs space-y-1.5 text-stone-600">
                <div className="flex justify-between">
                  <span className="text-stone-400">Donor:</span>
                  <span className="font-medium text-stone-800">{selectedListing.giverName} (Karma {selectedListing.giverKarma})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Neighborhood:</span>
                  <span className="font-medium text-stone-800">{selectedListing.giverNeighborhood}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Status:</span>
                  <span className="font-medium text-stone-800">{selectedListing.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Interested Neighbors:</span>
                  <span className="font-mono font-medium text-stone-800">{selectedListing.claimRequests.length}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectListing(selectedListing)}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Inspect Workflow & Actions
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-stone-400 text-xs">
              Click any pin on the radar map to inspect the listing and obfuscation zone.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
