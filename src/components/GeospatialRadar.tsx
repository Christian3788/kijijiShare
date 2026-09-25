import { useState, useMemo } from 'react';
import { Listing, User, ListingCategory } from '../types';
import { calculateDistanceMeters, formatDistance } from '../services/geoService';
import { 
  Gift, 
  Wrench, 
  Sparkles, 
  HelpCircle, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  Layers,
  ChevronRight,
  Package,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  Heart
} from 'lucide-react';

interface GeospatialRadarProps {
  listings: Listing[];
  currentUser: User;
  onSelectListing: (listing: Listing) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  savedListings?: string[];
  onToggleSaveListing?: (listingId: string) => void;
}

interface MapCluster {
  id: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  listings: Listing[];
  isCluster: boolean;
  minDistanceMeters: number;
  categoryCounts: Partial<Record<ListingCategory, number>>;
}

export function GeospatialRadar({
  listings,
  currentUser,
  onSelectListing,
  radiusKm,
  setRadiusKm,
  savedListings,
  onToggleSaveListing,
}: GeospatialRadarProps) {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(listings[0]?.id || null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [showFuzzedRadiusOverlay, setShowFuzzedRadiusOverlay] = useState<boolean>(true);
  const [enableClustering, setEnableClustering] = useState<boolean>(true);

  // Center of view is currentUser's home coordinate
  const centerLat = currentUser.homeCoordinates.lat;
  const centerLng = currentUser.homeCoordinates.lng;

  // Visual map bounds projection to SVG viewBox (600 x 600)
  // 1 degree lat approx 111km -> 1km = 0.0090 degrees
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

  // Compute clusters based on SVG pixel proximity
  const clusters: MapCluster[] = useMemo(() => {
    // Projected items with distance
    const projectedItems = listings.map(item => {
      const pt = project(item.fuzzedLocation.lat, item.fuzzedLocation.lng);
      const dist = calculateDistanceMeters(currentUser.homeCoordinates, item.fuzzedLocation);
      return { item, pt, dist };
    });

    if (!enableClustering) {
      // Return 1 cluster per item
      return projectedItems.map(({ item, pt, dist }) => ({
        id: `single-${item.id}`,
        x: pt.x,
        y: pt.y,
        lat: item.fuzzedLocation.lat,
        lng: item.fuzzedLocation.lng,
        listings: [item],
        isCluster: false,
        minDistanceMeters: dist,
        categoryCounts: { [item.category]: 1 },
      }));
    }

    const clusterList: MapCluster[] = [];
    // Cluster radius threshold in SVG pixels (approx 40px represents ~250m-350m at 3km view)
    const clusterPixelThreshold = 38;

    projectedItems.forEach(({ item, pt, dist }) => {
      // Find an existing cluster within pixel threshold
      let matchedCluster = clusterList.find(c => {
        const dx = c.x - pt.x;
        const dy = c.y - pt.y;
        return Math.sqrt(dx * dx + dy * dy) <= clusterPixelThreshold;
      });

      if (matchedCluster) {
        matchedCluster.listings.push(item);
        matchedCluster.isCluster = true;
        matchedCluster.minDistanceMeters = Math.min(matchedCluster.minDistanceMeters, dist);
        matchedCluster.categoryCounts[item.category] = (matchedCluster.categoryCounts[item.category] || 0) + 1;
        // Recalculate centroid in SVG space
        const total = matchedCluster.listings.length;
        const allPts = matchedCluster.listings.map(l => project(l.fuzzedLocation.lat, l.fuzzedLocation.lng));
        matchedCluster.x = allPts.reduce((acc, p) => acc + p.x, 0) / total;
        matchedCluster.y = allPts.reduce((acc, p) => acc + p.y, 0) / total;
      } else {
        clusterList.push({
          id: `cluster-${item.id}`,
          x: pt.x,
          y: pt.y,
          lat: item.fuzzedLocation.lat,
          lng: item.fuzzedLocation.lng,
          listings: [item],
          isCluster: false,
          minDistanceMeters: dist,
          categoryCounts: { [item.category]: 1 },
        });
      }
    });

    return clusterList;
  }, [listings, enableClustering, radiusKm, centerLat, centerLng]);

  // Active selected cluster & selected listing
  const activeCluster = clusters.find(c => 
    c.id === selectedClusterId || c.listings.some(l => l.id === selectedListingId)
  ) || clusters[0];

  const selectedListing = listings.find(l => l.id === selectedListingId) || activeCluster?.listings[0];

  const getCategoryIcon = (category: ListingCategory) => {
    switch (category) {
      case 'GIFT': return <Gift className="w-3.5 h-3.5" />;
      case 'LEND': return <Wrench className="w-3.5 h-3.5" />;
      case 'SKILL': return <Sparkles className="w-3.5 h-3.5" />;
      case 'SERVICE': return <Wrench className="w-3.5 h-3.5" />;
      case 'NEED_ITEM': return <Package className="w-3.5 h-3.5" />;
      case 'NEED_HELP': return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryColor = (category: ListingCategory) => {
    switch (category) {
      case 'GIFT': return '#059669';
      case 'LEND': return '#2563eb';
      case 'SKILL': return '#d97706';
      case 'SERVICE': return '#7c3aed';
      case 'NEED_ITEM': return '#e11d48';
      case 'NEED_HELP': return '#e11d48';
      default: return '#059669';
    }
  };

  // Spiderfy coordinates generation for an expanded cluster
  const getSpiderfyOffsets = (count: number) => {
    if (count <= 1) return [{ x: 0, y: 0 }];
    const spiderRadius = 36; // radius of spider circle
    const offsets = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      offsets.push({
        x: Math.cos(angle) * spiderRadius,
        y: Math.sin(angle) * spiderRadius,
      });
    }
    return offsets;
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
              <span>DYNAMIC PIN CLUSTERING</span>
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Geospatial Mesh Navigator</span>
              {enableClustering && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  {clusters.filter(c => c.isCluster).length} Clusters Active
                </span>
              )}
            </h2>
            <p className="text-xs text-stone-400 mt-1 max-w-xl">
              High-density neighbor items automatically cluster into aggregated pins with fanout inspection. Exact doorstep addresses remain protected in 300m randomized Gaussian zones.
            </p>
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Radius Switcher */}
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

            {/* Clustering Toggle */}
            <button
              onClick={() => setEnableClustering(!enableClustering)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                enableClustering 
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-semibold' 
                  : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
              }`}
              title="Toggle Cluster Map Pins for High Density Areas"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{enableClustering ? 'Clustering: ON' : 'Clustering: OFF'}</span>
            </button>

            {/* Privacy Rings Toggle */}
            <button
              onClick={() => setShowFuzzedRadiusOverlay(!showFuzzedRadiusOverlay)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                showFuzzedRadiusOverlay 
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300' 
                  : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
              }`}
              title="Toggle 300m Privacy Obfuscation Circles"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">300m Privacy Rings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Selected Listing / Cluster Inspector */}
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

              {/* Gradient for cluster halo */}
              <radialGradient id="clusterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </radialGradient>
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
                    stroke={isSelected ? '#f59e0b' : 'rgba(52, 211, 153, 0.22)'}
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

            {/* Clustered & Single Map Pins */}
            {clusters.map(cluster => {
              const isSelectedCluster = cluster.id === activeCluster?.id;
              const isOutsideSelectedRadius = cluster.minDistanceMeters > radiusKm * 1000;
              const spiderOffsets = getSpiderfyOffsets(cluster.listings.length);

              // 1. Clustered Pin (Multiple listings in close proximity)
              if (cluster.isCluster) {
                const count = cluster.listings.length;
                return (
                  <g
                    key={cluster.id}
                    transform={`translate(${cluster.x}, ${cluster.y})`}
                    opacity={isOutsideSelectedRadius ? 0.35 : 1}
                    className="cursor-pointer"
                  >
                    {/* Spiderfy Fanout Lines when cluster is actively selected */}
                    {isSelectedCluster && count <= 5 && (
                      <g>
                        {cluster.listings.map((item, idx) => {
                          const off = spiderOffsets[idx];
                          const isItemActive = item.id === selectedListingId;
                          return (
                            <g key={`spider-${item.id}`}>
                              {/* Connector line */}
                              <line
                                x1="0"
                                y1="0"
                                x2={off.x}
                                y2={off.y}
                                stroke="#f59e0b"
                                strokeWidth="1.5"
                                strokeDasharray="2,2"
                              />
                              {/* Sub-pin node */}
                              <g 
                                transform={`translate(${off.x}, ${off.y})`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedListingId(item.id);
                                }}
                                className="transition-transform hover:scale-125"
                              >
                                <circle
                                  r={isItemActive ? 12 : 9}
                                  fill={getCategoryColor(item.category)}
                                  stroke={isItemActive ? '#fef08a' : '#ffffff'}
                                  strokeWidth={isItemActive ? 2.5 : 1.5}
                                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
                                />
                                <text
                                  y="3"
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize="8"
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                >
                                  {item.category[0]}
                                </text>
                              </g>
                            </g>
                          );
                        })}
                      </g>
                    )}

                    {/* Central Cluster Bubble */}
                    <g 
                      onClick={() => {
                        setSelectedClusterId(cluster.id);
                        setSelectedListingId(cluster.listings[0].id);
                      }}
                      className="transition-transform duration-200 hover:scale-110"
                    >
                      {/* Outer pulse aura */}
                      <circle 
                        r="24" 
                        fill="url(#clusterGlow)" 
                        className={isSelectedCluster ? 'animate-pulse' : ''} 
                      />

                      {/* Main Cluster Circle */}
                      <circle
                        r={isSelectedCluster ? '18' : '15'}
                        fill="#064e3b"
                        stroke={isSelectedCluster ? '#f59e0b' : '#34d399'}
                        strokeWidth={isSelectedCluster ? '2.5' : '2'}
                        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))"
                      />

                      {/* Cluster Density Badge Count */}
                      <text
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={count > 9 ? '11' : '12'}
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {count}
                      </text>

                      {/* Small cluster icon indicator */}
                      <g transform="translate(8, -12)">
                        <circle r="6" fill="#f59e0b" stroke="#1c1917" strokeWidth="1" />
                        <text
                          y="2.5"
                          textAnchor="middle"
                          fill="#1c1917"
                          fontSize="7"
                          fontWeight="bold"
                        >
                          +
                        </text>
                      </g>

                      {/* Cluster Label on Hover / Selected */}
                      <g transform="translate(0, -24)">
                        <rect
                          x="-42"
                          y="-15"
                          width="84"
                          height="16"
                          rx="4"
                          fill="#1c1917"
                          stroke={isSelectedCluster ? '#f59e0b' : '#10b981'}
                          strokeWidth="1"
                        />
                        <text
                          y="-3.5"
                          textAnchor="middle"
                          fill={isSelectedCluster ? '#fef08a' : '#34d399'}
                          fontSize="8.5"
                          fontWeight="600"
                          fontFamily="monospace"
                        >
                          {count} in {formatDistance(cluster.minDistanceMeters)}
                        </text>
                      </g>
                    </g>
                  </g>
                );
              }

              // 2. Single Pin (Single isolated listing)
              const singleItem = cluster.listings[0];
              const isSelected = singleItem.id === selectedListingId;

              return (
                <g
                  key={singleItem.id}
                  transform={`translate(${cluster.x}, ${cluster.y})`}
                  onClick={() => {
                    setSelectedClusterId(cluster.id);
                    setSelectedListingId(singleItem.id);
                  }}
                  className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  opacity={isOutsideSelectedRadius ? 0.35 : 1}
                >
                  {/* Pin Circle */}
                  <circle
                    r={isSelected ? '14' : '10'}
                    fill={getCategoryColor(singleItem.category)}
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
                    {singleItem.category[0]}
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
                        {formatDistance(cluster.minDistanceMeters)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Map Overlay Badge & Legend */}
          <div className="absolute bottom-6 left-6 bg-stone-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-stone-800 text-[11px] text-stone-300 font-mono space-y-1.5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>GIFT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <span>LEND</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>SKILL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span>NEED</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-stone-400 text-[10px] pt-1 border-t border-white/10">
              <span>Center: {currentUser.neighborhood}</span>
              <span className="text-emerald-400 font-semibold">
                {enableClustering ? 'Dense Pins Clustered' : 'All Pins Dispersed'}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Cluster / Listing Inspector Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          {/* Cluster Header if active cluster has multiple listings */}
          {activeCluster && activeCluster.isCluster && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-mono font-bold text-xs flex items-center justify-center">
                    {activeCluster.listings.length}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-emerald-950 uppercase tracking-wide">
                      High-Density Cluster
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      {formatDistance(activeCluster.minDistanceMeters)} from you
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {Object.entries(activeCluster.categoryCounts).map(([cat, count]) => (
                    <span 
                      key={cat}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-emerald-900 border border-emerald-300 font-bold"
                    >
                      {count} {cat[0]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Items Carousel / List within Cluster */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-emerald-900">Items in this cluster:</p>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {activeCluster.listings.map((item) => {
                    const isItemSelected = item.id === selectedListing?.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedListingId(item.id)}
                        className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isItemSelected
                            ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                            : 'bg-white hover:bg-emerald-100/70 text-stone-800 border border-emerald-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0">{getCategoryIcon(item.category)}</span>
                          <span className="truncate">{item.title}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isItemSelected ? 'text-white' : 'text-stone-400'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Active Listing Details Inspector */}
          {selectedListing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  {getCategoryIcon(selectedListing.category)}
                  {selectedListing.category}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-800 font-bold">
                    {formatDistance(calculateDistanceMeters(currentUser.homeCoordinates, selectedListing.fuzzedLocation))}
                  </span>

                  {onToggleSaveListing && (
                    <button
                      onClick={() => onToggleSaveListing(selectedListing.id)}
                      title={savedListings?.includes(selectedListing.id) ? 'Remove from Saved' : 'Save item'}
                      className={`p-1.5 rounded-full transition-all cursor-pointer ${
                        savedListings?.includes(selectedListing.id)
                          ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 scale-105'
                          : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100 hover:scale-110'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${savedListings?.includes(selectedListing.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  )}
                </div>
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
                  The pin location is intentionally offset by ~220m from the donor's actual doorstep.
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
              Click any pin or cluster on the radar map to inspect the listing and obfuscation zone.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
