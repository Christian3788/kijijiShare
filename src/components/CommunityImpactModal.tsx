import { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  Leaf, 
  TreePine, 
  DollarSign, 
  Scale, 
  Sparkles, 
  HeartHandshake, 
  Award, 
  TrendingUp, 
  Car, 
  Recycle,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface CommunityImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onPledgeEcoKarma?: (points: number) => void;
}

export function CommunityImpactModal({
  isOpen,
  onClose,
  currentUser,
  onPledgeEcoKarma,
}: CommunityImpactModalProps) {
  const [borrowFrequency, setBorrowFrequency] = useState<number>(3);
  const [pledged, setPledged] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculators based on circular economy environmental standards:
  // Average power tool / gear manufacture emits ~28kg CO2 and costs ~$135 CAD new
  const userAnnualCo2Saved = Math.round(borrowFrequency * 12 * 26.5);
  const userAnnualCadSaved = Math.round(borrowFrequency * 12 * 85);
  const equivalentKmNotDriven = Math.round(userAnnualCo2Saved * 4.2);
  const treesEquivalent = (userAnnualCo2Saved / 22).toFixed(1);

  const handleTakePledge = () => {
    setPledged(true);
    if (onPledgeEcoKarma) {
      onPledgeEcoKarma(5);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 border border-emerald-700 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold">
                Neighborhood Circular Economy &amp; Carbon Ledger
              </h2>
              <p className="text-[11px] text-emerald-200 font-mono">
                Harbord Village &amp; Elmwood Green Micro-Grid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Top Macro Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> Collective Environmental Dividend
                </span>
                <h3 className="font-display text-xl font-extrabold text-stone-900 mt-1">
                  1,485 kg CO₂e Prevented
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed max-w-md">
                  By lending drills, sharing snow blowers, and gifting baby gear instead of buying new, our 1km community has diverted tons of industrial manufacturing emissions and landfill waste.
                </p>
              </div>

              <div className="flex sm:flex-col items-center justify-center bg-white px-4 py-3 rounded-xl border border-emerald-200 shadow-xs shrink-0 text-center">
                <span className="text-[10px] text-stone-500 font-mono uppercase">Local Dollars Saved</span>
                <span className="font-mono font-extrabold text-2xl text-emerald-800 leading-tight">
                  $4,850+
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">kept in neighbor pockets</span>
              </div>
            </div>
          </div>

          {/* Environmental Equivalencies Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
              <TreePine className="w-5 h-5 text-emerald-700 mx-auto mb-1.5" />
              <div className="font-mono font-bold text-lg text-stone-900">68</div>
              <div className="text-[10px] text-stone-500 font-medium">Urban Trees Grown for 10 Yrs</div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
              <Car className="w-5 h-5 text-blue-700 mx-auto mb-1.5" />
              <div className="font-mono font-bold text-lg text-stone-900">6,240 km</div>
              <div className="text-[10px] text-stone-500 font-medium">Avoided Gasoline Driving</div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
              <Scale className="w-5 h-5 text-amber-700 mx-auto mb-1.5" />
              <div className="font-mono font-bold text-lg text-stone-900">342 kg</div>
              <div className="text-[10px] text-stone-500 font-medium">Landfill Waste Diverted</div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
              <Recycle className="w-5 h-5 text-teal-700 mx-auto mb-1.5" />
              <div className="font-mono font-bold text-lg text-stone-900">100%</div>
              <div className="text-[10px] text-stone-500 font-medium">Zero-Barter Gift Flow</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-stone-900 flex items-center justify-between">
              <span>Embodied Carbon Diverted by Category</span>
              <span className="text-xs font-mono text-emerald-800">Harbord &amp; Elmwood Total</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-stone-700">Power &amp; Woodworking Tools (Hammer drills, carpet cleaners, saws)</span>
                  <span className="font-mono font-bold text-emerald-800">640 kg CO₂ (43%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: '43%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-stone-700">Baby, Nursery &amp; Children's Gear (Strollers, cribs, high chairs)</span>
                  <span className="font-mono font-bold text-emerald-800">420 kg CO₂ (28%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-stone-700">Home Repair, Seasonal Gardening &amp; Insulation</span>
                  <span className="font-mono font-bold text-emerald-800">275 kg CO₂ (19%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '19%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-stone-700">Mutual Aid Hands-On Help &amp; Bike Repair Skill-Sharing</span>
                  <span className="font-mono font-bold text-emerald-800">150 kg CO₂ (10%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Household Circular Calculator */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-stone-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>Personal Household Circular Estimator</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Estimate your annual ecological &amp; pocketbook savings by sharing on KijijiShare.
                </p>
              </div>
              <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full">
                {borrowFrequency} exchanges / month
              </span>
            </div>

            <div>
              <input
                type="range"
                min="1"
                max="10"
                value={borrowFrequency}
                onChange={(e) => setBorrowFrequency(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
                <span>1 item/mo (Casual Borrower)</span>
                <span>5 items/mo (Active Sharer)</span>
                <span>10 items/mo (Community Pillar)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-mono">Your CO₂ Offset</div>
                <div className="font-mono font-bold text-lg text-emerald-800 mt-0.5">
                  ~{userAnnualCo2Saved} kg
                </div>
                <div className="text-[10px] text-stone-400">per year</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-mono">Retail Savings</div>
                <div className="font-mono font-bold text-lg text-emerald-800 mt-0.5">
                  ${userAnnualCadSaved} CAD
                </div>
                <div className="text-[10px] text-stone-400">staying in budget</div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 bg-white rounded-xl border border-stone-200 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-mono">Tree Equivalent</div>
                <div className="font-mono font-bold text-lg text-emerald-800 mt-0.5">
                  ~{treesEquivalent} trees
                </div>
                <div className="text-[10px] text-stone-400">absorbing carbon</div>
              </div>
            </div>

            {/* Circular Pledge Action */}
            <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-stone-600">
                {pledged ? (
                  <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Pledge Active! +5 Community Karma awarded to your profile.
                  </span>
                ) : (
                  <span>Commit to borrow or gift at least 1 item before buying new this season.</span>
                )}
              </div>

              {!pledged && (
                <button
                  onClick={handleTakePledge}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Take Circular Neighbor Pledge</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0 text-xs">
          <div className="text-stone-500 flex items-center gap-1">
            <Recycle className="w-4 h-4 text-emerald-700" />
            <span>UN Sustainable Cities &amp; Responsible Consumption Protocol</span>
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
