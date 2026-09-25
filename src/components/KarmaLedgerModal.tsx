import { User, KarmaEvent } from '../types';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  Eye, 
  Layers, 
  CheckCircle, 
  AlertTriangle,
  History,
  Lock
} from 'lucide-react';

interface KarmaLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export function KarmaLedgerModal({
  isOpen,
  onClose,
  currentUser,
}: KarmaLedgerModalProps) {
  if (!isOpen) return null;

  const history = currentUser.karmaHistory || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-800" />
            <h2 className="font-display text-base font-bold text-stone-900">
              Community Karma & Trust Ledger
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Karma Profile Card */}
          <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-800/80 border-2 border-emerald-400 text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-inner">
                {currentUser.karmaScore}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-white">
                    {currentUser.name}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {currentUser.trustTier.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {currentUser.neighborhood} · {currentUser.vouchCount} Peer Vouches Earned
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-stone-800 pt-3 sm:pt-0 sm:pl-4 text-center">
              <div>
                <div className="font-mono text-lg font-bold text-emerald-400">{currentUser.giftsGivenCount}</div>
                <div className="text-[10px] text-stone-400 uppercase">Gifts Given</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-blue-400">{currentUser.needsFulfilledCount}</div>
                <div className="text-[10px] text-stone-400 uppercase">Needs Met</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-amber-400">{currentUser.vouchCount}</div>
                <div className="text-[10px] text-stone-400 uppercase">Vouches</div>
              </div>
            </div>
          </div>

          {/* How Karma Influences Platform Mechanics */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>How Karma Influences Your Platform Experience</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>1. Listing Visibility</span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Neighbors with Karma &ge; 90 earn the <strong>Pillar of Neighborhood</strong> badge, elevating their offers to nearby neighbors in feed algorithms.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-700" />
                  <span>2. Claim Reliability Match</span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  In Giver & Seeker selection drawers, accounts with high karma &amp; verified vouches are highlighted as <strong>High Reliability Matches</strong> to deter flakes.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                  <span>3. Anti-Hoarding Capacity</span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Higher tiers expand concurrent active claims (from 2 to 4 or 6) and dynamic rolling 7-day allowances without monetary fees.
                </p>
              </div>
            </div>
          </div>

          {/* Karma Point System Rules */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-2">
            <h4 className="font-display text-sm font-bold text-stone-900">
              Point Allocation & Penalty Rules
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="bg-white p-2 rounded-lg border border-stone-200 flex justify-between">
                <span>Fulfilling a Need:</span>
                <strong className="text-emerald-700">+5 pts</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-stone-200 flex justify-between">
                <span>Sharing a Skill:</span>
                <strong className="text-emerald-700">+4 pts</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-stone-200 flex justify-between">
                <span>Giving Surplus:</span>
                <strong className="text-emerald-700">+3 pts</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-stone-200 flex justify-between">
                <span>Peer Vouch Badge:</span>
                <strong className="text-emerald-700">+5 pts</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-stone-200 flex justify-between">
                <span>Punctual Pickup:</span>
                <strong className="text-emerald-700">+1 pt</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-stone-200 flex justify-between">
                <span>Reported No-Show:</span>
                <strong className="text-rose-700">-25 pts</strong>
              </div>
            </div>
          </div>

          {/* Transaction Ledger Audit Trail */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-stone-500" />
              <span>Recent Karma Activity & Endorsements</span>
            </h4>

            {history.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs bg-stone-50 rounded-xl">
                No recorded transactions yet. Complete gift pickups or meet neighbor needs to earn karma!
              </div>
            ) : (
              <div className="space-y-2">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-stone-900 flex items-center gap-2">
                        <span>{item.description}</span>
                        {item.badgeAwarded && (
                          <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded font-sans">
                            {item.badgeAwarded}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        With <strong>{item.partnerName}</strong> · {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div className={`font-mono font-bold text-sm ${item.points > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {item.points > 0 ? `+${item.points}` : item.points} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
