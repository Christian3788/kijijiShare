import { useState } from 'react';
import { Listing, NeedOffer, User } from '../types';
import { formatDistance } from '../services/geoService';
import { isHighReliabilityMatch } from '../services/antiHoardingEngine';
import { 
  X, 
  CheckCircle, 
  HeartHandshake, 
  MapPin, 
  Clock, 
  Award, 
  Package, 
  Wrench, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ReviewOffersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  need: Listing;
  currentUser: User;
  onAcceptHelper: (needId: string, offer: NeedOffer) => void;
  onViewProfile?: (userId: string) => void;
}

export function ReviewOffersDrawer({
  isOpen,
  onClose,
  need,
  currentUser,
  onAcceptHelper,
  onViewProfile,
}: ReviewOffersDrawerProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  if (!isOpen) return null;

  const offers = need.needOffers || [];

  const handleConfirm = () => {
    const offer = offers.find(o => o.id === selectedOfferId);
    if (offer) {
      onAcceptHelper(need.id, offer);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-700 font-semibold">
              <HeartHandshake className="w-4 h-4" />
              <span>MUTUAL AID FULFILLMENT DRAWER</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2">
            <h2 className="font-display text-lg font-bold text-stone-900 leading-snug">
              {need.title}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Review generous neighbor offers. Select the helper that best matches your scheduling window.
            </p>
          </div>
        </div>

        {/* Offers List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-stone-500 pb-1">
            <span className="font-semibold text-stone-800">
              {offers.length} Neighbor Offer(s) Received
            </span>
            <span>Sorted by Reliability & Proximity</span>
          </div>

          {offers.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              No neighbors have offered to fulfill this need yet. Check back soon!
            </div>
          ) : (
            offers.map(offer => {
              const isSelected = selectedOfferId === offer.id;
              const isReliable = isHighReliabilityMatch(offer.helperKarma, offer.helperVouches.length);

              return (
                <div
                  key={offer.id}
                  onClick={() => setSelectedOfferId(offer.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-600 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  {/* Helper row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden shrink-0">
                        <img
                          src={offer.helperAvatar}
                          alt={offer.helperName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewProfile?.(offer.helperId);
                            }}
                            title={`View ${offer.helperName}'s profile & vouches`}
                            className="font-display font-bold text-sm text-stone-900 hover:text-rose-700 hover:underline cursor-pointer text-left"
                          >
                            {offer.helperName}
                          </button>
                          <span className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {formatDistance(offer.helperDistanceMeters)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                          <span className="text-emerald-800 font-semibold font-mono">
                            Karma: {offer.helperKarma}/100
                          </span>
                          {isReliable && (
                            <span className="text-[10px] text-emerald-900 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-700" />
                              High Reliability Match
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-stone-300'
                    }`}>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mt-3 bg-stone-50 rounded-xl p-3 text-xs text-stone-700 leading-relaxed border border-stone-100">
                    <p className="font-medium text-stone-900 mb-1">
                      Offer Type: {offer.offerType.replace(/_/g, ' ')}
                    </p>
                    <p className="italic">"{offer.message}"</p>
                    <div className="mt-2 text-[11px] text-stone-500 flex items-center gap-1.5 pt-1.5 border-t border-stone-200">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Availability: <strong>{offer.availability}</strong></span>
                    </div>
                  </div>

                  {/* Vouch badges */}
                  {offer.helperVouches.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-2 text-[11px] text-stone-600">
                      <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-stone-400">Endorsements:</span>
                      <span className="font-medium text-stone-700">
                        {offer.helperVouches.join(' · ')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            Close
          </button>
          <button
            disabled={!selectedOfferId}
            onClick={handleConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer ${
              selectedOfferId
                ? 'bg-rose-600 hover:bg-rose-500 shadow-sm'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            Accept This Neighbor's Help
          </button>
        </div>
      </div>
    </div>
  );
}
