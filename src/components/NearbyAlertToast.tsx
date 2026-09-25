import { useEffect, useState } from 'react';
import { NearbyNotification } from '../services/nearbyAlertService';
import { formatDistance } from '../services/geoService';
import { 
  Radio, 
  X, 
  MapPin, 
  Gift, 
  Wrench, 
  Sparkles, 
  HeartHandshake, 
  ArrowRight,
  Volume2,
  VolumeX,
  BellRing
} from 'lucide-react';

interface NearbyAlertToastProps {
  notification: NearbyNotification | null;
  onClose: () => void;
  onViewListing: (listingId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function NearbyAlertToast({
  notification,
  onClose,
  onViewListing,
  soundEnabled,
  onToggleSound,
}: NearbyAlertToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification) return;
    setProgress(100);

    const duration = 8000; // 8 seconds
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const isNeed = notification.category === 'NEED_ITEM' || notification.category === 'NEED_HELP';

  const getCategoryIcon = () => {
    switch (notification.category) {
      case 'GIFT':
        return <Gift className="w-4 h-4 text-emerald-600" />;
      case 'LEND':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'SKILL':
      case 'SERVICE':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'NEED_ITEM':
      case 'NEED_HELP':
        return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      default:
        return <Gift className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getCategoryLabel = () => {
    switch (notification.category) {
      case 'GIFT': return 'Surplus Gift';
      case 'LEND': return 'Tool Loan';
      case 'SKILL': return 'Skill Share';
      case 'SERVICE': return 'Service Help';
      case 'NEED_ITEM': return 'Need: Item';
      case 'NEED_HELP': return 'Need: Assistance';
      default: return 'Listing';
    }
  };

  const walkMinutes = Math.max(1, Math.round(notification.distanceMeters / 80));

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300 drop-shadow-2xl">
      <div className={`rounded-2xl border ${
        isNeed 
          ? 'bg-rose-950/95 border-rose-700/80 text-white' 
          : 'bg-stone-900/95 border-emerald-500/50 text-white'
      } backdrop-blur-md p-4 shadow-2xl overflow-hidden relative transition-all`}>
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isNeed ? 'bg-rose-400' : 'bg-emerald-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isNeed ? 'bg-rose-500' : 'bg-emerald-500'
              }`} />
            </span>
            <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-emerald-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              1km Hyperlocal Alert
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-300">
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Chime sound is enabled' : 'Chime sound is muted'}
              className="p-1 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-300" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
            </button>
            <button
              onClick={onClose}
              title="Dismiss toast"
              className="p-1 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-white/10 shrink-0 border border-white/10 flex items-center justify-center">
            {getCategoryIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                isNeed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {getCategoryLabel()}
              </span>

              <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                <MapPin className="w-3 h-3 text-amber-400" />
                {formatDistance(notification.distanceMeters)} away ({walkMinutes}m walk)
              </span>
            </div>

            <h4 className="font-display font-bold text-sm sm:text-base text-white tracking-tight leading-snug line-clamp-1">
              {notification.title}
            </h4>

            <p className="text-xs text-stone-300 mt-0.5 line-clamp-1">
              Posted by <span className="font-semibold text-white">{notification.giverName}</span> in {notification.giverNeighborhood}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 pt-2.5 flex items-center justify-between gap-3 border-t border-white/10">
          <div className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
            <BellRing className="w-3 h-3 text-emerald-400" />
            <span>Instant 1km mesh push</span>
          </div>

          <button
            onClick={() => {
              onViewListing(notification.listingId);
              onClose();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isNeed 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
            }`}
          >
            <span>{isNeed ? 'Review Need' : 'View Item'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className={`h-full transition-all ease-linear ${isNeed ? 'bg-rose-400' : 'bg-emerald-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
