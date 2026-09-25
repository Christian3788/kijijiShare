import { User } from '../types';
import { Wifi, WifiOff, Plus, ShieldCheck, MapPin, HeartHandshake, Sparkles } from 'lucide-react';

interface TopNavProps {
  activeTab: 'feed' | 'needs' | 'map' | 'anti_hoarding' | 'architecture';
  setActiveTab: (tab: 'feed' | 'needs' | 'map' | 'anti_hoarding' | 'architecture') => void;
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenNewListing: () => void;
  onOpenKarmaLedger: () => void;
  pendingSyncCount: number;
  openNeedsCount: number;
}

export function TopNav({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSelectUser,
  isOffline,
  onToggleOffline,
  onOpenNewListing,
  onOpenKarmaLedger,
  pendingSyncCount,
  openNeedsCount,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('feed')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="font-display text-xl font-bold tracking-tight text-emerald-950 group-hover:text-emerald-800 transition-colors">
              KijijiShare
            </span>
          </button>
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-500 pl-3 border-l border-stone-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium text-stone-700">Harbord & Elmwood</span>
            <span aria-hidden="true">·</span>
            <span>1–5 km Mesh</span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Surplus Feed
          </button>

          <button
            onClick={() => setActiveTab('needs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'needs'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Needs Board</span>
            {openNeedsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'needs' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-800'
              }`}>
                {openNeedsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'map'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Radar Map
          </button>

          <button
            onClick={() => setActiveTab('anti_hoarding')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'anti_hoarding'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Fair Share
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-emerald-900 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            System Spec
          </button>
        </nav>

        {/* Zone 3: Actions, Karma Chip, & Persona Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Karma Score Chip (Clickable for Ledger) */}
          <button
            onClick={onOpenKarmaLedger}
            title="Click to view Karma Score & Trust Ledger"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-mono font-bold text-emerald-900">{currentUser.karmaScore}</span>
            <span className="hidden xl:inline text-stone-500 font-sans text-[11px]">Karma</span>
          </button>

          {/* Offline Mesh Toggle */}
          <button
            onClick={onToggleOffline}
            title={isOffline ? 'Offline mode active (Click to simulate reconnect)' : 'Online mode (Click to simulate offline mesh)'}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 border transition-colors cursor-pointer ${
              isOffline
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold animate-pulse'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Offline</span>
                {pendingSyncCount > 0 && (
                  <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {pendingSyncCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Online</span>
              </>
            )}
          </button>

          {/* Persona Switcher */}
          <div className="relative group">
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = allUsers.find(u => u.id === e.target.value);
                if (found) onSelectUser(found);
              }}
              aria-label="Active Persona"
              className="text-xs bg-stone-100 hover:bg-stone-200 border-none font-medium text-stone-800 py-1.5 pl-2.5 pr-7 rounded-lg cursor-pointer focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name.split(' ')[0]} ({user.id === 'user_elena' ? 'Giver' : user.id === 'user_marcus' ? 'Recipient' : user.trustTier})
                </option>
              ))}
            </select>
          </div>

          {/* New Share / Need CTA */}
          <button
            onClick={onOpenNewListing}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Post Share or Need</span>
            <span className="sm:hidden">Post</span>
          </button>
        </div>
      </div>

      {/* Mobile Subnav */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200 bg-stone-50 px-2 py-1.5">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${activeTab === 'feed' ? 'bg-white text-emerald-950 font-bold shadow-xs' : 'text-stone-600'}`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('needs')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${activeTab === 'needs' ? 'bg-rose-600 text-white font-bold' : 'text-stone-600'}`}
        >
          Needs ({openNeedsCount})
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${activeTab === 'map' ? 'bg-white text-emerald-950 font-bold shadow-xs' : 'text-stone-600'}`}
        >
          Radar
        </button>
        <button
          onClick={() => setActiveTab('anti_hoarding')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${activeTab === 'anti_hoarding' ? 'bg-white text-emerald-950 font-bold shadow-xs' : 'text-stone-600'}`}
        >
          Fair Share
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${activeTab === 'architecture' ? 'bg-emerald-900 text-white font-bold' : 'text-stone-600'}`}
        >
          Spec
        </button>
      </div>
    </header>
  );
}
