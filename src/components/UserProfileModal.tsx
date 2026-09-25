import { useState } from 'react';
import { User, Vouch } from '../types';
import { 
  X, 
  ShieldCheck, 
  Shield, 
  HeartHandshake, 
  Sparkles, 
  Award, 
  Gift, 
  Heart, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  MessageSquare,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currentUser: User;
  onVouchForNeighbor: (targetUserId: string, confirmationNote: string, badge: Vouch['badge']) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  currentUser,
  onVouchForNeighbor,
}: UserProfileModalProps) {
  const [isVouching, setIsVouching] = useState<boolean>(false);
  const [confirmationNote, setConfirmationNote] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<Vouch['badge']>('Reliable Neighbor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [justVouched, setJustVouched] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  const isSelf = user.id === currentUser.id;
  const hasAlreadyVouched = user.vouches?.some(v => v.voucherId === currentUser.id);

  const availableBadges: Array<{ badge: Vouch['badge']; label: string; desc: string }> = [
    { badge: 'Reliable Neighbor', label: 'Reliable Neighbor', desc: 'Trustworthy, communicative, and dependable' },
    { badge: 'Known Neighbor', label: 'Known Neighbor', desc: 'Recognized resident on our local street/block' },
    { badge: 'Generous Giver', label: 'Generous Giver', desc: 'Shares high-quality surplus with care' },
    { badge: 'Punctual Pickup', label: 'Punctual Pickup', desc: 'Respects agreed pickup times and porch guidelines' },
    { badge: 'Tool Caretaker', label: 'Tool Caretaker', desc: 'Returns borrowed equipment clean and undamaged' },
    { badge: 'Skilled Helper', label: 'Skilled Helper', desc: 'Offers generous hands-on practical assistance' },
  ];

  const handleStartVouching = () => {
    setIsVouching(true);
    setErrorMsg(null);
    setJustVouched(false);
  };

  const handleCancelVouching = () => {
    setIsVouching(false);
    setConfirmationNote('');
    setErrorMsg(null);
  };

  const handleSubmitVouch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationNote.trim()) {
      setErrorMsg('Please enter a short confirmation note describing your neighborly experience.');
      return;
    }

    if (confirmationNote.trim().length < 5) {
      setErrorMsg('Confirmation note must be at least 5 characters long.');
      return;
    }

    onVouchForNeighbor(user.id, confirmationNote.trim(), selectedBadge);
    setIsVouching(false);
    setConfirmationNote('');
    setErrorMsg(null);
    setJustVouched(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <h2 className="font-display text-base font-bold text-stone-900">
              Neighbor Profile &amp; Trust Standing
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* User Hero Banner */}
          <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-18 h-18 rounded-full object-cover border-3 border-emerald-400 shadow-md"
                  referrerPolicy="no-referrer"
                />
                {user.isVerifiedNeighbor && (
                  <span 
                    title="Verified Neighbor" 
                    className="absolute -bottom-1 -right-1 bg-emerald-500 text-stone-950 p-1 rounded-full shadow-md border-2 border-stone-900"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-display font-bold text-xl text-white">
                    {user.name}
                  </h3>

                  {/* PROMINENT 'VERIFIED' BADGE */}
                  {user.isVerifiedNeighbor ? (
                    <span 
                      data-testid="verified-neighbor-badge"
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-xs animate-in fade-in"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified Neighbor</span>
                    </span>
                  ) : (
                    <span 
                      data-testid="unverified-neighbor-badge"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-xs font-medium"
                    >
                      <Shield className="w-3 h-3 text-stone-500" />
                      <span>Awaiting Peer Vouch</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-stone-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    {user.neighborhood}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {user.trustTier.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Karma Gauge */}
              <div className="flex sm:flex-col items-center justify-center bg-stone-800/90 px-4 py-2 rounded-xl border border-stone-700/80 shrink-0">
                <span className="font-mono font-extrabold text-2xl text-emerald-400 leading-none">
                  {user.karmaScore}
                </span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono mt-0.5">
                  Karma
                </span>
              </div>
            </div>
          </div>

          {/* Just Vouched Confirmation Alert */}
          {justVouched && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950">
                <p className="font-bold text-sm text-emerald-900">
                  Vouch Confirmed! Verified Badge Awarded.
                </p>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">
                  Thank you for confirming your neighborly relationship with <strong>{user.name}</strong>. Their vouch count has increased to <strong>{user.vouchCount}</strong> and their profile now displays the official <strong>Verified Neighbor</strong> badge.
                </p>
              </div>
            </div>
          )}

          {/* Trust Standing & Community Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <div className="text-[10px] text-stone-500 uppercase font-mono">Peer Vouches</div>
              <div className="font-mono font-bold text-lg text-emerald-800 mt-0.5 flex items-center justify-center gap-1">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>{user.vouchCount}</span>
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Confirmed neighbors</div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <div className="text-[10px] text-stone-500 uppercase font-mono">Gifts Given</div>
              <div className="font-mono font-bold text-lg text-stone-900 mt-0.5 flex items-center justify-center gap-1">
                <Gift className="w-4 h-4 text-emerald-700" />
                <span>{user.giftsGivenCount}</span>
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Free items shared</div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <div className="text-[10px] text-stone-500 uppercase font-mono">Needs Met</div>
              <div className="font-mono font-bold text-lg text-stone-900 mt-0.5 flex items-center justify-center gap-1">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                <span>{user.needsFulfilledCount}</span>
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Mutual aid fulfilled</div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <div className="text-[10px] text-stone-500 uppercase font-mono">Active Claims</div>
              <div className="font-mono font-bold text-lg text-stone-900 mt-0.5">
                {user.activeClaimsCount}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Concurrent requests</div>
            </div>
          </div>

          {/* VOUCH FOR NEIGHBOR SECTION */}
          {!isSelf ? (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3">
              {!isVouching ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-display font-bold text-sm text-stone-900 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-emerald-700" />
                      <span>Peer Neighbor Verification</span>
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                      {user.isVerifiedNeighbor 
                        ? `Add your peer endorsement to strengthen ${user.name.split(' ')[0]}'s neighborhood standing.` 
                        : `Vouching grants ${user.name.split(' ')[0]} the official 'Verified' badge and increments their vouch score.`}
                    </p>
                  </div>

                  {/* VOUCH FOR NEIGHBOR BUTTON */}
                  <button
                    onClick={handleStartVouching}
                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Vouch for {user.name.split(' ')[0]}</span>
                  </button>
                </div>
              ) : (
                /* Vouch Confirmation Form with Required Short Confirmation Note */
                <form onSubmit={handleSubmitVouch} className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-emerald-700" />
                      <h4 className="font-display font-bold text-sm text-stone-900">
                        Vouch for {user.name}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelVouching}
                      className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    By submitting this vouch, you certify that you know or have had a positive mutual aid/borrow experience with <strong>{user.name}</strong>. This will increment their vouch count by 1 and grant them a <strong>Verified Neighbor</strong> badge.
                  </p>

                  {/* Badge Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                      Select Vouch Endorsement Badge
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableBadges.map(({ badge, label }) => (
                        <button
                          key={badge}
                          type="button"
                          onClick={() => setSelectedBadge(badge)}
                          className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            selectedBadge === badge
                              ? 'bg-emerald-50 border-emerald-700 text-emerald-950 font-bold ring-1 ring-emerald-700'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <div className="truncate">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Required Confirmation Note Textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Confirmation Note <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <textarea
                      value={confirmationNote}
                      onChange={(e) => {
                        setConfirmationNote(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder={`e.g. ${user.name.split(' ')[0]} has been our neighbor on ${user.neighborhood} for over a year. Punctual, kind, and always takes great care of borrowed items...`}
                      rows={3}
                      className={`w-full p-3 rounded-xl border text-xs text-stone-900 focus:outline-none focus:ring-1 ${
                        errorMsg 
                          ? 'border-rose-400 ring-rose-400 bg-rose-50/20' 
                          : 'border-stone-300 focus:ring-emerald-700 focus:border-emerald-700'
                      }`}
                    />
                    {errorMsg && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-700 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    <span className="text-[11px] text-stone-400 block mt-1">
                      A short confirmation note is required to maintain transparency and trust in the community ledger.
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelVouching}
                      className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Confirm Vouch &amp; Verify</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-600 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="font-semibold text-stone-800">Viewing Your Public Neighbor Profile</p>
                <p className="text-stone-500 mt-0.5 text-[11px]">
                  Other neighbors can vouch for your punctuality, care, and trustworthiness from this page.
                </p>
              </div>
            </div>
          )}

          {/* Peer Vouches & Endorsements List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-800" />
                <span>Community Vouches &amp; Endorsements ({user.vouches?.length || 0})</span>
              </h4>
              <span className="text-[11px] text-stone-500 font-mono">
                {user.vouchCount} Verified {user.vouchCount === 1 ? 'Vouch' : 'Vouches'}
              </span>
            </div>

            {!user.vouches || user.vouches.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 rounded-2xl border border-stone-200 text-stone-400 text-xs space-y-2">
                <Shield className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="font-medium text-stone-600">No peer vouches yet</p>
                <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                  Be the first neighbor to vouch for {user.name.split(' ')[0]} to grant them their Verified Neighbor badge!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {user.vouches.map((vouch) => (
                  <div
                    key={vouch.id}
                    className="p-3.5 bg-white rounded-xl border border-stone-200 text-xs space-y-2 shadow-2xs hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900">{vouch.voucherName}</span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-500 text-[11px]">{vouch.voucherNeighborhood}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold font-mono">
                          {vouch.badge}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(vouch.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Vouch Confirmation Note Quote */}
                    <div className="bg-stone-50/80 rounded-lg p-2.5 border border-stone-100 text-stone-700 italic text-[11px] leading-relaxed">
                      "{vouch.comment}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0 text-xs">
          <div className="text-stone-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>KijijiShare Peer Verification Protocol</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
