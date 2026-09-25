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
  AlertCircle
} from 'lucide-react';

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  isOffline: boolean;
  onCreateListing: (listing: Listing) => void;
}

export function NewListingModal({
  isOpen,
  onClose,
  currentUser,
  isOffline,
  onCreateListing,
}: NewListingModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ListingCategory>('GIFT');
  const [pickupLocationDescription, setPickupLocationDescription] = useState('Sheltered front porch bin');
  const [imageCompressionInfo, setImageCompressionInfo] = useState<CompressedImageResult | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [use300mFuzzing, setUse300mFuzzing] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    try {
      // Run client-side canvas WebP downscaling to 1200px max dimension
      const compressed = await compressImageClientSide(file, 1200, 0.75);
      setImageCompressionInfo(compressed);
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Could not compress image on client-side. Please try another image.');
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
      exactLocation: exactCoords,
      fuzzedLocation: fuzzedCoords,
      pickupLocationDescription,
      imageUrl: imageCompressionInfo?.dataUrl,
      imageOriginalBytes: imageCompressionInfo?.originalBytes || 2400000,
      imageCompressedBytes: imageCompressionInfo?.compressedBytes || 110000,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      claimRequests: [],
      isOfflineDraft: isOffline,
    };

    onCreateListing(newListing);
    onClose();
  };

  const formatKB = (bytes: number) => {
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-800" />
            <h2 className="font-display text-base font-bold text-stone-900">
              {category === 'ASK' ? 'Post Mutual Aid Request' : 'Share Surplus With Neighbors'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline indicator if active */}
        {isOffline && (
          <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900 font-medium">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Offline Mesh Active: Listing will be cached locally in IndexedDB and automatically synced when reconnected.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'GIFT', label: 'Give Surplus', icon: Gift },
                { id: 'LEND', label: 'Lend Tool', icon: Wrench },
                { id: 'SKILL', label: 'Teach Skill', icon: Sparkles },
                { id: 'ASK', label: 'Ask For Help', icon: HelpCircle },
              ].map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as ListingCategory)}
                    className={`py-2 px-1 text-center rounded-xl border transition-all text-xs font-medium flex flex-col items-center gap-1 cursor-pointer ${
                      category === cat.id
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] truncate w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bosch Jigsaw with Blades or Fresh Balcony Mint Cuttings"
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Item Details & Condition
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Condition, accessories included, clean state, or duration if lending."
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Client-Side Image Compression Module */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Photo (Client-Side WebP Compression)
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {imageCompressionInfo ? (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden border border-emerald-200 shrink-0">
                    <img
                      src={imageCompressionInfo.dataUrl}
                      alt="Compressed preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      <span>Canvas WebP Downscaled</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-mono">
                      {formatKB(imageCompressionInfo.originalBytes)} → {formatKB(imageCompressionInfo.compressedBytes)} ({imageCompressionInfo.compressionRatioPercent}% saved)
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-stone-600 hover:text-stone-900 text-xs underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="w-full py-3 px-4 border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl flex items-center justify-center gap-2 text-xs text-stone-600 hover:text-emerald-800 transition-colors cursor-pointer bg-stone-50/50"
              >
                <Camera className="w-4 h-4" />
                <span>
                  {isProcessingImage ? 'Compressing on Canvas...' : 'Snap Photo / Upload (Auto-compressed to WebP)'}
                </span>
              </button>
            )}
          </div>

          {/* Privacy Fuzzing Toggle */}
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
              When checked, your exact doorstep coordinates are randomized within a 300-meter Gaussian ring on public maps. Your private street address is revealed strictly after you choose a recipient.
            </p>
          </div>

          {/* Private Porch Instructions */}
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

          {/* Footer Actions */}
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
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isOffline ? 'Save Offline Draft' : 'Publish to Neighbors'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
