import { useState } from 'react';
import { Listing, User } from '../types';
import { checkClaimEligibility } from '../services/antiHoardingEngine';
import { calculateDistanceMeters, formatDistance } from '../services/geoService';
import { X, Send, Heart, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ExpressInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  currentUser: User;
  onSubmitPitch: (listingId: string, pitch: string) => void;
}

export function ExpressInterestModal({
  isOpen,
  onClose,
  listing,
  currentUser,
  onSubmitPitch,
}: ExpressInterestModalProps) {
  const [pitch, setPitch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const eligibility = checkClaimEligibility(currentUser);
  const distance = calculateDistanceMeters(currentUser.homeCoordinates, listing.fuzzedLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim() || !eligibility.allowed) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitPitch(listing.id, pitch.trim());
      setIsSubmitting(false);
      setPitch('');
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-800" />
            <h2 className="font-display text-base font-bold text-stone-900">
              Express Neighborly Interest
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Item Summary */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="font-semibold text-stone-800">{listing.category}</span>
              <span className="font-mono text-emerald-800 font-bold">{formatDistance(distance)}</span>
            </div>
            <h3 className="font-display text-sm font-bold text-stone-900">
              {listing.title}
            </h3>
            <p className="text-stone-500 text-[11px]">
              Offered by {listing.giverName} · {listing.giverNeighborhood}
            </p>
          </div>

          {/* Thoughtful note prompt */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Your Message & Pickup Availability
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Share how this will be used or when you can safely pick it up. In a gift economy, personal neighborly notes build community trust.
            </p>
            <textarea
              required
              rows={4}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="e.g., Hi Elena! I'm rebuilding our backyard garden planter this weekend and could pick this up between 5-7pm today. Thank you so much!"
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Anti-Hoarding & Fair Share Status Quota */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-[11px] text-stone-600 space-y-1">
            <div className="flex items-center justify-between">
              <span>Your Active Claims Quota:</span>
              <span className="font-mono font-bold text-stone-800">
                {currentUser.activeClaimsCount} / {eligibility.maxActiveClaims}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>7-Day Rolling Claim Cap:</span>
              <span className="font-mono font-bold text-stone-800">
                {currentUser.rolling7DayClaimsCount} / {eligibility.rolling7DayLimit}
              </span>
            </div>
          </div>

          {/* Buttons */}
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
              disabled={!pitch.trim() || isSubmitting || !eligibility.allowed}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
