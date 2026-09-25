import { useState, useRef } from 'react';
import { Listing, ListingCategory, User } from '../types';
import { compressImageClientSide, CompressedImageResult } from '../services/offlineSync';
import { generateFuzzedCoordinates } from '../services/geoService';
import { 
  X, 
  Upload, 
  Camera, 
  MapPin, 
  Lock, 
  Sparkles, 
  Gift, 
  Wrench, 
  HelpCircle, 
  WifiOff, 
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Clock,
  Briefcase,
  AlertTriangle,
  HeartHandshake
} from 'lucide-react';

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  isOffline: boolean;
  defaultCategory?: ListingCategory;
  onCreateListing: (listing: Listing) => void;
}

export function NewListingModal({
  isOpen,
  onClose,
  currentUser,
  isOffline,
  defaultCategory = 'GIFT',
  onCreateListing,
}: NewListingModalProps) {
  const [category, setCategory] = useState<ListingCategory>(defaultCategory);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pickupLocationDescription, setPickupLocationDescription] = useState('Sheltered front porch bin');
  const [imageCompressionInfo, setImageCompressionInfo] = useState<CompressedImageResult | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [use300mFuzzing, setUse300mFuzzing] = useState(true);
  
  // Skill & Service & Need extra fields
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState<number>(60);
  const [relevantExperience, setRelevantExperience] = useState('');
  const [toolsRequired, setToolsRequired] = useState('');
  const [locationType, setLocationType] = useState<'IN_PERSON_DOORSTEP' | 'IN_PERSON_PUBLIC' | 'REMOTE_VIRTUAL'>('IN_PERSON_DOORSTEP');
  const [urgencyLevel, setUrgencyLevel] = useState<'LOW' | 'NORMAL' | 'URGENT'>('NORMAL');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    try {
      const compressed = await compressImageClientSide(file, 1200, 0.75);
      setImageCompressionInfo(compressed);
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Could not compress image on client-side.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const exactCoords = currentUser.homeCoordinates;
    const fuzzedCoords = use300mFuzzing 
      ? generateFuzzedCoordinates(exactCoords)
      : exactCoords;

    const newListing: Listing = {
      id: `listing_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'OFFERED',
      giverId: currentUser.id,
      giverName: currentUser.name,
      giverKarma: currentUser.karmaScore,
      giverNeighborhood: currentUser.neighborhood,
      giverTrustTier: currentUser.trustTier,
      exactLocation: exactCoords,
      fuzzedLocation: fuzzedCoords,
      pickupLocationDescription,
      imageUrl: imageCompressionInfo?.dataUrl,
      imageOriginalBytes: imageCompressionInfo?.originalBytes || 2400000,
      imageCompressedBytes: imageCompressionInfo?.compressedBytes || 110000,
      
      // Extended fields
      estimatedDurationMinutes: (category === 'SKILL' || category === 'SERVICE' || category === 'NEED_HELP') ? estimatedDurationMinutes : undefined,
      relevantExperience: (category === 'SKILL' || category === 'SERVICE') ? relevantExperience : undefined,
      toolsRequired: (category === 'SKILL' || category === 'SERVICE' || category === 'NEED_HELP') ? toolsRequired : undefined,
      locationType: (category === 'SKILL' || category === 'SERVICE' || category === 'NEED_HELP') ? locationType : undefined,
      urgencyLevel: (category === 'NEED_ITEM' || category === 'NEED_HELP') ? urgencyLevel : undefined,

      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      claimRequests: [],
      needOffers: [],
      isOfflineDraft: isOffline,
    };

    onCreateListing(newListing);
    onClose();
  };

  const isNeed = category === 'NEED_ITEM' || category === 'NEED_HELP';
  const isSkillOrService = category === 'SKILL' || category === 'SERVICE';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isNeed ? (
              <HeartHandshake className="w-5 h-5 text-rose-600" />
            ) : isSkillOrService ? (
              <Sparkles className="w-5 h-5 text-amber-600" />
            ) : (
              <Gift className="w-5 h-5 text-emerald-800" />
            )}
            <h2 className="font-display text-base font-bold text-stone-900">
              {isNeed ? 'Post a Mutual Aid Need' : isSkillOrService ? 'Offer Skill or Service Exchange' : 'Share Surplus Item'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Category Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Select Exchange Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: 'GIFT', label: 'Surplus Gift', icon: Gift },
                { id: 'LEND', label: 'Tool Lending', icon: Wrench },
                { id: 'SKILL', label: 'Teach Skill', icon: Sparkles },
                { id: 'SERVICE', label: 'Hands-on Help', icon: Briefcase },
                { id: 'NEED_ITEM', label: 'Need Item', icon: HelpCircle },
                { id: 'NEED_HELP', label: 'Need Help', icon: HeartHandshake },
              ].map(cat => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as ListingCategory)}
                    className={`py-2 px-1 text-center rounded-xl border transition-all text-xs font-medium flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? cat.id.startsWith('NEED')
                          ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-1 ring-rose-600'
                          : 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] truncate w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              {isNeed ? 'What specific item or help are you seeking?' : 'Title'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'SKILL' ? 'e.g. 1-on-1 Sourdough Starter & Proofing Workshop' :
                category === 'SERVICE' ? 'e.g. Porch Snow Shoveling Assistance for Seniors' :
                category === 'NEED_ITEM' ? 'e.g. ISO: Adult Underarm Crutches (Height 5\'10")' :
                category === 'NEED_HELP' ? 'e.g. Need 2 neighbors to help carry sofa downstairs' :
                'e.g. DeWalt Hammer Drill with Masonry Bits'
              }
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Detailed Description & Context
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, context, what to expect, or any special considerations."
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Skill & Service Exchange Specific Inputs */}
          {(isSkillOrService || category === 'NEED_HELP') && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Skill &amp; Task Specifications</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Estimated Time Commitment (Minutes)
                  </label>
                  <select
                    value={estimatedDurationMinutes}
                    onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={90}>1.5 Hours</option>
                    <option value={120}>2 Hours</option>
                    <option value={240}>Half Day (4h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Location Format
                  </label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="IN_PERSON_DOORSTEP">At Doorstep / Porch / Garage</option>
                    <option value="IN_PERSON_PUBLIC">Public Park / Outdoor Cafe</option>
                    <option value="REMOTE_VIRTUAL">Remote / Virtual Video Call</option>
                  </select>
                </div>
              </div>

              {isSkillOrService && (
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Relevant Experience & Background
                  </label>
                  <input
                    type="text"
                    value={relevantExperience}
                    onChange={(e) => setRelevantExperience(e.target.value)}
                    placeholder="e.g. 6 years amateur bike mechanic, built 10+ road bicycles"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  Tools or Equipment Required
                </label>
                <input
                  type="text"
                  value={toolsRequired}
                  onChange={(e) => setToolsRequired(e.target.value)}
                  placeholder="e.g. I bring all wrenches and truing stands. Bring your bike!"
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Urgency for Needs Board */}
          {isNeed && (
            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 text-xs space-y-2">
              <label className="block font-semibold text-rose-950">
                Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'LOW', label: 'Casual / Low' },
                  { id: 'NORMAL', label: 'Normal Need' },
                  { id: 'URGENT', label: 'Urgent Care' },
                ].map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgencyLevel(u.id as any)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold cursor-pointer ${
                      urgencyLevel === u.id
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Fuzzing */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-stone-900">
                  300m Geospatial Location Obfuscation
                </span>
              </div>
              <input
                type="checkbox"
                checked={use300mFuzzing}
                onChange={(e) => setUse300mFuzzing(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Doorstep coordinates remain concealed in a 300m Gaussian circle on public maps. Revealed strictly when match is confirmed.
            </p>
          </div>

          {/* Porch Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Private Doorstep Pickup Note (Unlocked upon match)
            </label>
            <input
              type="text"
              value={pickupLocationDescription}
              onChange={(e) => setPickupLocationDescription(e.target.value)}
              placeholder="e.g. Front porch bench, gray plastic bin behind planters"
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder:text-stone-400"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer ${
              isNeed ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-800 hover:bg-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isOffline ? 'Save Offline Draft' : isNeed ? 'Publish to Needs Board' : 'Publish to Neighbors'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
