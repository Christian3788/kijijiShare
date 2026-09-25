import { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  Building2, 
  BookOpen, 
  TreePine,
  Navigation
} from 'lucide-react';

interface MapsGroundingFinderProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhood?: string;
}

export function MapsGroundingFinder({
  isOpen,
  onClose,
  neighborhood = 'Harbord Village & Elmwood, Toronto',
}: MapsGroundingFinderProps) {
  const [query, setQuery] = useState('Find safe public library lobbies or park pavilions for neighbor item handoffs');
  const [resultText, setResultText] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim() || isLoading) return;

    setIsLoading(true);
    setResultText(null);
    setGroundingMetadata(null);

    try {
      const response = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          locationContext: neighborhood,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setResultText(data.text);
      setGroundingMetadata(data.groundingMetadata);
    } catch (err: any) {
      console.error('Maps Grounding error:', err);
      setResultText(`Could not retrieve Google Maps data (${err.message}). Please check API connectivity.`);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQueries = [
    'Public libraries with open lobbies nearby',
    'Community recreation centers with daytime parking',
    'Open well-lit public park meeting spots',
    'TTC subway station meeting points near Harbord',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[85vh] flex flex-col justify-between">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-stone-900">
                  Google Maps Safe Spot Finder
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-900 font-semibold px-2 py-0.5 rounded-full font-mono">
                  gemini-3.5-flash + Maps Grounding
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Grounding with live Google Maps data for {neighborhood}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Quick Query Pills */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
              Quick Safe Meetup Queries
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(q);
                    handleSearch(q);
                  }}
                  className="text-xs bg-stone-100 hover:bg-stone-200 border border-stone-200 px-3 py-1.5 rounded-xl text-stone-700 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for safe public spaces, libraries, or park spots..."
              className="flex-1 text-xs p-3 rounded-xl border border-stone-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="px-4 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:bg-stone-300"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Maps</span>
            </button>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-8 text-center text-xs text-stone-500 space-y-2">
              <Sparkles className="w-6 h-6 text-blue-600 mx-auto animate-spin" />
              <p>Grounding with live Google Maps geospatial data...</p>
            </div>
          )}

          {/* Grounded Results Output */}
          {resultText && (
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 border-b border-stone-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified Safe Community Meeting Spaces:</span>
              </div>

              <div className="prose prose-xs max-w-none text-stone-700 leading-relaxed whitespace-pre-wrap">
                {resultText}
              </div>

              {/* Grounding Attribution & Web/Maps Links if provided */}
              {groundingMetadata?.groundingChunks && (
                <div className="mt-3 pt-3 border-t border-stone-200 text-[11px] text-stone-500 space-y-1">
                  <div className="font-semibold text-stone-700">Google Maps Grounding Sources:</div>
                  <div className="flex flex-wrap gap-2">
                    {groundingMetadata.groundingChunks.map((chunk: any, idx: number) => {
                      const title = chunk.web?.title || chunk.maps?.title || `Place Reference #${idx + 1}`;
                      const uri = chunk.web?.uri || chunk.maps?.uri;
                      return uri ? (
                        <a
                          key={idx}
                          href={uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-700 hover:underline bg-white border border-stone-200 px-2 py-0.5 rounded-lg"
                        >
                          <span>{title}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
