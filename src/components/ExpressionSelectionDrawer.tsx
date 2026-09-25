import { useState } from 'react';
import { Listing, ClaimRequest, User } from '../types';
import { formatDistance } from '../services/geoService';
import { 
  X, 
  CheckCircle, 
  ShieldCheck, 
  MapPin, 
  HeartHandshake, 
  Clock, 
  AlertCircle,
  Award
} from 'lucide-react';

interface ExpressionSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  currentUser: User;
  onSelectRecipient: (listingId: string, claimRequest: ClaimRequest) => void;
}

export function ExpressionSelectionDrawer({
  isOpen,
  onClose,
  listing,
  currentUser,
  onSelectRecipient,
}: ExpressionSelectionDrawerProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [confirmingSelection, setConfirmingSelection] = useState(false);

  if (!isOpen) return null;

  const isGiver = listing.giverId === currentUser.id;

  const handleConfirm = () => {
    if (!selectedRequestId) return;
    const req = listing.claimRequests.find(r => r.id === selectedRequestId);
    if (req) {
      onSelectRecipient(listing.id, req);
      setConfirmingSelection(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-800">
              <HeartHandshake className="w-4 h-4" />
              <span>GIVER RECIPIENT SELECTION DRAWER</span>
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
              {listing.title}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Thoughtful matching: Unlike e-commerce carts, gifts are not first-come-first-served.
              Choose based on genuine neighborly context, proximity, and vouches.
            </p>
          </div>
        </div>

        {/* Interested Neighbors List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-stone-500 pb-1">
            <span className="font-semibold text-stone-800">
              {listing.claimRequests.length} Neighbors Expressed Interest
            </span>
            <span>Sorted by Story & Proximity</span>
          </div>

          {listing.claimRequests.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              No neighbors have expressed interest in this item yet.
            </div>
          ) : (
            listing.claimRequests.map(req => {
              const isSelected = selectedRequestId === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  {/* Requester Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden shrink-0">
                        <img
                          src={req.requesterAvatar}
                          alt={req.requesterName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-stone-900">
                            {req.requesterName}
                          </span>
                          <span className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {formatDistance(req.requesterDistanceMeters)}
                          </span>
                        </div>
                        {/* Karma & Community Standing */}
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                          <span className="text-emerald-800 font-semibold font-mono">
                            Karma: {req.requesterKarma}/100
                          </span>
                          {req.requesterKarma >= 80 && req.requesterVouches.length >= 1 && (
                            <span className="text-[10px] text-emerald-900 bg-emerald-100/90 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-700" />
                              High Reliability Match
                            </span>
                          )}
                          <span aria-hidden="true">·</span>
                          <span>{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Radio indicator */}
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300'
                    }`}>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Requester Story / Pitch */}
                  <div className="mt-3 bg-stone-50 rounded-xl p-3 text-xs text-stone-700 leading-relaxed border border-stone-100">
                    <p className="italic">"{req.pitch}"</p>
                  </div>

                  {/* Community Vouch Tags */}
                  {req.requesterVouches.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-2 text-[11px] text-stone-600">
                      <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-stone-400">Vouched as:</span>
                      <span className="font-medium text-stone-700">
                        {req.requesterVouches.join(' · ')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="p-6 border-t border-stone-200 bg-stone-50/90 space-y-3">
          {confirmingSelection ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 space-y-2">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Confirm Recipient Selection?</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                This will trigger the state transition to <strong>GIVER_SELECTED</strong>, notify the neighbor, 
                and generate a private coordination channel with a 6-digit one-time handshake PIN.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors"
                >
                  Yes, Select Neighbor
                </button>
                <button
                  onClick={() => setConfirmingSelection(false)}
                  className="px-3 py-2 bg-white border border-stone-200 text-stone-700 text-xs font-medium rounded-lg cursor-pointer hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                disabled={!selectedRequestId || !isGiver}
                onClick={() => setConfirmingSelection(true)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer ${
                  selectedRequestId && isGiver
                    ? 'bg-emerald-800 hover:bg-emerald-700 shadow-sm'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                {!isGiver ? 'Only listing creator can select' : 'Choose This Neighbor'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
