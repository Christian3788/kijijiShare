import { useState } from 'react';
import { NearbyNotification, ConnectionMode, ConnectionStatus } from '../services/nearbyAlertService';
import { formatDistance } from '../services/geoService';
import { 
  X, 
  Radio, 
  RefreshCw, 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Gift, 
  Wrench, 
  HeartHandshake, 
  MapPin, 
  CheckCheck, 
  Trash2, 
  ArrowRight, 
  Clock, 
  Zap, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface NearbyAlertCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NearbyNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectListing: (listingId: string) => void;
  // Connection and Simulation controls
  connectionMode: ConnectionMode;
  onToggleConnectionMode: () => void;
  connectionStatus: ConnectionStatus;
  soundEnabled: boolean;
  onToggleSound: () => void;
  autoSimulate: boolean;
  onToggleAutoSimulate: () => void;
  onTriggerSimulateDrop: () => void;
  pushPermission: NotificationPermission | 'unsupported';
  onRequestPushPermission: () => void;
  currentNeighborhood: string;
}

export function NearbyAlertCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectListing,
  connectionMode,
  onToggleConnectionMode,
  connectionStatus,
  soundEnabled,
  onToggleSound,
  autoSimulate,
  onToggleAutoSimulate,
  onTriggerSimulateDrop,
  pushPermission,
  onRequestPushPermission,
  currentNeighborhood,
}: NearbyAlertCenterProps) {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'GIFTS' | 'NEEDS'>('ALL');

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'GIFTS') return n.category === 'GIFT' || n.category === 'LEND';
    if (filter === 'NEEDS') return n.category === 'NEED_ITEM' || n.category === 'NEED_HELP';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'GIFT': return <Gift className="w-4 h-4 text-emerald-600" />;
      case 'LEND': return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'SKILL':
      case 'SERVICE': return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'NEED_ITEM':
      case 'NEED_HELP': return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      default: return <Gift className="w-4 h-4 text-emerald-600" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-stone-50 h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-stone-200 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
                  <span>1km Alert Radar</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone-500">
                  Real-time push for drops in {currentNeighborhood}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Connection Status & Mode Banner */}
          <div className="p-3 bg-stone-900 text-white rounded-xl text-xs space-y-2 border border-stone-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    connectionStatus === 'CONNECTED' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                </span>
                <span className="font-mono font-bold text-[11px] text-emerald-300 uppercase tracking-wide">
                  {connectionMode === 'SIMULATED_WEBSOCKET' ? 'WebSocket Stream' : 'Polling Worker'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-400">
                <span>{connectionMode === 'SIMULATED_WEBSOCKET' ? 'Latency: ~18ms' : 'Interval: 10s'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
              <span className="text-stone-300">Channel: <code className="text-emerald-400 font-mono">geo:mesh:1km</code></span>
              <button
                onClick={onToggleConnectionMode}
                className="text-stone-400 hover:text-white underline cursor-pointer transition-colors"
              >
                Switch to {connectionMode === 'SIMULATED_WEBSOCKET' ? 'Polling Mode' : 'WebSocket Mode'}
              </button>
            </div>
          </div>

          {/* Quick Simulation & Audio Toggles */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <button
              onClick={onTriggerSimulateDrop}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate 1km Drop</span>
            </button>

            <button
              onClick={onToggleAutoSimulate}
              className={`px-3 py-2 border rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                autoSimulate 
                  ? 'bg-amber-50 border-amber-300 text-amber-900' 
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoSimulate ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
              <span>{autoSimulate ? 'Auto-Drops: ON' : 'Auto-Drops: OFF'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-xs">
            {/* Sound Chime Toggle */}
            <button
              onClick={onToggleSound}
              className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Chime Sound: On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-stone-400" />
                  <span className="font-medium text-stone-500">Chime: Muted</span>
                </>
              )}
            </button>

            {/* Native Browser Push Permission */}
            {pushPermission === 'granted' ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Push Active
              </span>
            ) : pushPermission === 'denied' ? (
              <span className="flex items-center gap-1 text-[11px] text-stone-400">
                <BellOff className="w-3 h-3" />
                Push Blocked
              </span>
            ) : (
              <button
                onClick={onRequestPushPermission}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                <Bell className="w-3 h-3 text-blue-600" />
                Enable Web Push
              </button>
            )}
          </div>
        </div>

        {/* Filter Navigation & Batch Actions */}
        <div className="px-4 py-2 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filter === 'ALL' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filter === 'UNREAD' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('GIFTS')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filter === 'GIFTS' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Gifts & Tools
            </button>
            <button
              onClick={() => setFilter('NEEDS')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filter === 'NEEDS' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Needs
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                title="Mark all as read"
                className="text-stone-500 hover:text-stone-800 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Read all</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                title="Clear all alerts"
                className="text-stone-400 hover:text-rose-600 text-[11px] p-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-500 space-y-3">
              <div className="p-3 bg-stone-200/80 rounded-full text-stone-400">
                <BellOff className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-stone-700 text-sm">No 1km alerts in this view</p>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Whenever a neighbor within 1,000 meters posts a gift, tool loan, or urgent need, an instant alert will appear here.
                </p>
              </div>
              <button
                onClick={onTriggerSimulateDrop}
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                <span>Simulate a nearby listing now</span>
              </button>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isNeed = notif.category === 'NEED_ITEM' || notif.category === 'NEED_HELP';
              const walkMinutes = Math.max(1, Math.round(notif.distanceMeters / 80));

              return (
                <div
                  key={notif.id}
                  onClick={() => onMarkAsRead(notif.id)}
                  className={`p-3.5 rounded-xl border transition-all text-xs relative ${
                    !notif.read 
                      ? 'bg-white border-emerald-200 shadow-xs' 
                      : 'bg-stone-50/80 border-stone-200 opacity-90'
                  } hover:border-emerald-400`}
                >
                  {/* Unread Indicator Dot */}
                  {!notif.read && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}

                  {/* Header metadata */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="p-1 rounded-md bg-stone-100 shrink-0">
                      {getCategoryIcon(notif.category)}
                    </span>

                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isNeed ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {notif.category}
                    </span>

                    <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      {formatDistance(notif.distanceMeters)} (~{walkMinutes}m walk)
                    </span>

                    <span className="text-[10px] text-stone-400 flex items-center gap-1 ml-auto font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(notif.timestamp)}
                    </span>
                  </div>

                  {/* Title & Giver info */}
                  <h4 className="font-display font-bold text-stone-900 text-sm leading-snug">
                    {notif.title}
                  </h4>

                  <p className="text-stone-500 text-[11px] mt-1 line-clamp-2">
                    {notif.listing.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 text-stone-600 text-[11px]">
                      <span className="font-semibold text-stone-800">{notif.giverName}</span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-500 truncate max-w-[120px]">{notif.giverNeighborhood}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectListing(notif.listingId);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 text-center text-[11px] text-stone-500">
          <p>
            Hyperlocal mesh automatically filters for listings within <strong>1,000 meters</strong> of your active location.
          </p>
        </div>
      </div>
    </div>
  );
}
