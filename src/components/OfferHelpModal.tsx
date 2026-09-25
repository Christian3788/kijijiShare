import { useState } from 'react';
import { Listing, User, NeedOffer } from '../types';
import { calculateDistanceMeters, formatDistance } from '../services/geoService';
import { X, HeartHandshake, Package, Wrench, Sparkles, Send, Clock, MapPin } from 'lucide-react';

interface OfferHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  need: Listing;
  currentUser: User;
  onSubmitOffer: (needId: string, offer: Omit<NeedOffer, 'id' | 'createdAt' | 'status'>) => void;
}

export function OfferHelpModal({
  isOpen,
  onClose,
  need,
  currentUser,
  onSubmitOffer,
}: OfferHelpModalProps) {
  const [offerType, setOfferType] = useState<'ITEM' | 'SKILL' | 'HANDS_ON_HELP'>(
    need.category === 'NEED_ITEM' ? 'ITEM' : 'HANDS_ON_HELP'
  );
  const [message, setMessage] = useState('');
  const [availability, setAvailability] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const distance = calculateDistanceMeters(currentUser.homeCoordinates, need.fuzzedLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !availability.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitOffer(need.id, {
        listingId: need.id,
        helperId: currentUser.id,
        helperName: currentUser.name,
        helperAvatar: currentUser.avatar,
        helperKarma: currentUser.karmaScore,
        helperDistanceMeters: distance,
        helperVouches: currentUser.vouches.map(v => v.badge),
        offerType,
        message: message.trim(),
        availability: availability.trim(),
      });
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-600" />
            <h2 className="font-display text-base font-bold text-stone-900">
              Offer Assistance to Neighbor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Need summary */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="font-semibold text-stone-800">
                {need.category === 'NEED_ITEM' ? 'Physical Item Request' : 'Mutual Aid Task'}
              </span>
              <span className="font-mono text-emerald-800 font-bold">{formatDistance(distance)}</span>
            </div>
            <h3 className="font-display text-sm font-bold text-stone-900">
              {need.title}
            </h3>
            <p className="text-stone-500 text-[11px]">
              Requested by {need.giverName} · {need.giverNeighborhood}
            </p>
          </div>

          {/* Offer type toggle */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              What kind of assistance are you offering?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ITEM', label: 'Have this Item', icon: Package },
                { id: 'HANDS_ON_HELP', label: 'Physical Help', icon: Wrench },
                { id: 'SKILL', label: 'Teach Skill', icon: Sparkles },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOfferType(opt.id as any)}
                    className={`py-2 px-1 text-center rounded-xl border transition-all text-xs font-medium flex flex-col items-center gap-1 cursor-pointer ${
                      offerType === opt.id
                        ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-1 ring-rose-600'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] truncate w-full">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Your Message & Context
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Hi Clara! I have adjustable crutches in my garage with clean rubber grips that you are welcome to borrow or keep."
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Your Availability / Proposed Time
            </label>
            <input
              type="text"
              required
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g. Free this afternoon between 3-6 PM, or can leave on porch"
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Helper trust preview */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
            <div>
              <span>Your Community Standing:</span>
              <strong className="text-emerald-800 font-mono ml-1.5">Karma {currentUser.karmaScore}/100</strong>
            </div>
            <span className="text-stone-400 font-mono">{currentUser.trustTier.replace(/_/g, ' ')}</span>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim() || !availability.trim()}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Assistance Offer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
