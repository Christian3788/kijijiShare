import { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  Sparkles, 
  Award, 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  Star,
  ThumbsUp
} from 'lucide-react';

interface KarmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: { id: string; name: string; avatar: string; role: 'GIVER' | 'RECIPIENT' | 'HELPER' | 'SEEKER' };
  transactionTitle: string;
  onAwardKarma: (points: number, badge: string, note: string) => void;
}

export function KarmaModal({
  isOpen,
  onClose,
  targetUser,
  transactionTitle,
  onAwardKarma,
}: KarmaModalProps) {
  const [points, setPoints] = useState<number>(targetUser.role === 'HELPER' ? 5 : 3);
  const [selectedBadge, setSelectedBadge] = useState<string>('Reliable Neighbor');
  const [gratitudeNote, setGratitudeNote] = useState('');

  if (!isOpen) return null;

  const badges = [
    { name: 'Punctual Pickup', desc: 'Arrived right on time' },
    { name: 'Generous Giver', desc: 'Item was immaculate' },
    { name: 'Skilled Helper', desc: 'Patient, skilled assistance' },
    { name: 'Reliable Neighbor', desc: 'Warm & communicative' },
    { name: 'Tool Caretaker', desc: 'Cared for borrowed items' },
    { name: 'Community Champion', desc: 'Went above and beyond' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAwardKarma(points, selectedBadge, gratitudeNote.trim() || 'Wonderful neighborly interaction.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="font-display text-base font-bold text-stone-900">
              Award Community Karma
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
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Successful Exchange
            </span>
            <h3 className="font-display text-sm font-bold text-stone-900">
              {transactionTitle}
            </h3>
            <p className="text-stone-600 text-xs">
              Thanking <strong>{targetUser.name}</strong> for their neighborly care.
            </p>
          </div>

          {/* Karma Points selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Select Karma Points to Award
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { pts: 3, label: '+3 Standard', sub: 'Smooth pickup' },
                { pts: 5, label: '+5 Exceptional', sub: 'Extremely helpful' },
                { pts: 7, label: '+7 Pillar', sub: 'Above and beyond' },
              ].map(item => (
                <button
                  key={item.pts}
                  type="button"
                  onClick={() => setPoints(item.pts)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    points === item.pts
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="font-mono text-sm font-bold text-emerald-800">{item.label}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Community Vouch Badge Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Select a Community Vouch Endorsement
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {badges.map(b => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setSelectedBadge(b.name)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedBadge === b.name
                      ? 'border-amber-600 bg-amber-50 text-amber-950 font-semibold ring-1 ring-amber-600'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="font-medium text-stone-900">{b.name}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Personal Note of Gratitude (Optional)
            </label>
            <textarea
              rows={2}
              value={gratitudeNote}
              onChange={(e) => setGratitudeNote(e.target.value)}
              placeholder="e.g., Thank you so much for the quick help and friendly chat! The drill works beautifully."
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* How Karma Influences the System */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-[11px] text-stone-500 space-y-1">
            <div className="font-semibold text-stone-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>How your karma influences the platform</span>
            </div>
            <p>
              Karma points elevate neighbor visibility on feeds, unlock "High Reliability Match" priority in claim drawers, and expand active claim limits without monetary transactions.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              Skip
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Award Karma Points</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
