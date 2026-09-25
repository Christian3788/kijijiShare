import { useState } from 'react';
import { User } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  Wifi, 
  WifiOff, 
  Plus, 
  ShieldCheck, 
  MapPin, 
  HeartHandshake, 
  Sparkles, 
  Bot, 
  Film, 
  Radio, 
  LogIn, 
  LogOut, 
  ChevronDown,
  Bell,
  Heart
} from 'lucide-react';

interface TopNavProps {
  activeTab: 'feed' | 'needs' | 'saved' | 'map' | 'anti_hoarding' | 'architecture';
  setActiveTab: (tab: 'feed' | 'needs' | 'saved' | 'map' | 'anti_hoarding' | 'architecture') => void;
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenNewListing: () => void;
  onOpenKarmaLedger: () => void;
  pendingSyncCount: number;
  openNeedsCount: number;
  savedCount: number;
  // 1km Alert System
  unreadNotificationCount: number;
  onOpenAlertCenter: () => void;
  // Firebase Auth
  firebaseUser: FirebaseUser | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  // AI Tools
  onOpenChatbot: () => void;
  onOpenMapsGrounding: () => void;
  onOpenVeoGenerator: () => void;
  onOpenLiveVoice: () => void;
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
  savedCount,
  unreadNotificationCount,
  onOpenAlertCenter,
  firebaseUser,
  onGoogleSignIn,
  onGoogleSignOut,
  onOpenChatbot,
  onOpenMapsGrounding,
  onOpenVeoGenerator,
  onOpenLiveVoice,
}: TopNavProps) {
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);

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
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-stone-500 pl-3 border-l border-stone-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium text-stone-700">Harbord & Elmwood</span>
            <span aria-hidden="true">·</span>
            <span>1–5 km Mesh</span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
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
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${savedCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
            <span>My Saved</span>
            {savedCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'saved' ? 'bg-rose-100 text-rose-800' : 'bg-stone-200 text-stone-700'
              }`}>
                {savedCount}
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

        {/* Zone 3: Actions, AI Menu, Auth, Karma & Persona */}
        <div className="flex items-center gap-2">
          {/* AI Tools Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span className="hidden sm:inline">AI Studio Tools</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isAiMenuOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 p-1.5 z-50 text-xs space-y-1 animate-in fade-in"
                onClick={() => setIsAiMenuOpen(false)}
              >
                <button
                  onClick={onOpenChatbot}
                  className="w-full text-left p-2 hover:bg-stone-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-900">Gemini Chatbot</div>
                    <div className="text-[10px] text-stone-400">Pro 3.1 · 3.5 Flash · Lite</div>
                  </div>
                </button>

                <button
                  onClick={onOpenMapsGrounding}
                  className="w-full text-left p-2 hover:bg-stone-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-900">Google Maps Grounding</div>
                    <div className="text-[10px] text-stone-400">Safe Meetup Spot Finder</div>
                  </div>
                </button>

                <button
                  onClick={onOpenLiveVoice}
                  className="w-full text-left p-2 hover:bg-stone-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-rose-700 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-900">Live Voice API</div>
                    <div className="text-[10px] text-stone-400">gemini-3.8-live Audio</div>
                  </div>
                </button>

                <button
                  onClick={onOpenVeoGenerator}
                  className="w-full text-left p-2 hover:bg-stone-50 rounded-xl flex items-center gap-2.5 cursor-pointer"
                >
                  <Film className="w-4 h-4 text-purple-700 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-900">Veo 3 Video Generator</div>
                    <div className="text-[10px] text-stone-400">veo-3.1-fast-generate-preview</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Karma Score Chip */}
          <button
            onClick={onOpenKarmaLedger}
            title="Click to view Karma Score & Trust Ledger"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-mono font-bold text-emerald-900">{currentUser.karmaScore}</span>
            <span className="hidden xl:inline text-stone-500 font-sans text-[11px]">Karma</span>
          </button>

          {/* 1km Radar Alert Center Bell */}
          <button
            onClick={onOpenAlertCenter}
            title="1km Hyperlocal Alert Radar & Stream"
            className={`relative p-2 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
              unreadNotificationCount > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs hover:bg-emerald-100'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
            }`}
          >
            <Bell className={`w-4 h-4 ${unreadNotificationCount > 0 ? 'text-emerald-700 animate-wiggle' : 'text-stone-600'}`} />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] shadow-sm animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Firebase Google Auth Button */}
          {firebaseUser ? (
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg">
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'Google User'}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center">
                  {(firebaseUser.displayName || 'G')[0]}
                </div>
              )}
              <span className="text-xs font-semibold text-stone-800 max-w-[80px] truncate hidden sm:inline">
                {firebaseUser.displayName?.split(' ')[0]}
              </span>
              <button
                onClick={onGoogleSignOut}
                title="Sign out of Firebase"
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Google Sign In</span>
              <span className="md:hidden">Sign In</span>
            </button>
          )}

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
      <div className="lg:hidden flex items-center justify-around border-t border-stone-200 bg-stone-50 px-2 py-1.5">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-2 py-1 text-xs font-medium rounded ${activeTab === 'feed' ? 'bg-white text-emerald-950 font-bold shadow-xs' : 'text-stone-600'}`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('needs')}
          className={`px-2 py-1 text-xs font-medium rounded ${activeTab === 'needs' ? 'bg-rose-600 text-white font-bold' : 'text-stone-600'}`}
        >
          Needs ({openNeedsCount})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${activeTab === 'saved' ? 'bg-white text-rose-700 font-bold shadow-xs' : 'text-stone-600'}`}
        >
          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
          <span>Saved ({savedCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-2 py-1 text-xs font-medium rounded ${activeTab === 'map' ? 'bg-white text-emerald-950 font-bold shadow-xs' : 'text-stone-600'}`}
        >
          Radar
        </button>
        <button
          onClick={() => setActiveTab('anti_hoarding')}
          className={`px-2 py-1 text-xs font-medium rounded ${activeTab === 'anti_hoarding' ? 'bg-white text-emerald-950 font-bold shadow-xs' : 'text-stone-600'}`}
        >
          Fair Share
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-2 py-1 text-xs font-medium rounded ${activeTab === 'architecture' ? 'bg-emerald-900 text-white font-bold' : 'text-stone-600'}`}
        >
          Spec
        </button>
      </div>
    </header>
  );
}
