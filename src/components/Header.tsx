import { Download, User } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'library' | 'active' | 'settings';
  setActiveTab: (tab: 'home' | 'library' | 'active' | 'settings') => void;
  activeCount: number;
}

export function Header({ activeTab, setActiveTab, activeCount }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-glass-surface border-b border-white/5 transition-colors">
      <div className="flex justify-between items-center px-6 md:px-20 py-4 w-full max-w-7xl mx-auto">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('home')} 
          className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,43,255,0.6)]">
            <Download className="w-5 h-5 text-white fill-current" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[8px] uppercase tracking-[0.35em] font-bold text-white/40 leading-none mb-0.5">Media Downloader</span>
            <h1 className="font-display text-xl font-black text-white hover:text-primary transition-colors tracking-tight leading-none">
              Vidmate
            </h1>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`font-sans font-medium text-sm transition-all duration-200 relative py-1 hover:text-secondary ${
              activeTab === 'home'
                ? 'text-primary'
                : 'text-on-surface-variant'
            }`}
          >
            Home
            {activeTab === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`font-sans font-medium text-sm transition-all duration-200 relative py-1 hover:text-secondary ${
              activeTab === 'library'
                ? 'text-primary'
                : 'text-on-surface-variant'
            }`}
          >
            Library
            {activeTab === 'library' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`font-sans font-medium text-sm transition-all duration-200 relative py-1 hover:text-secondary flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'text-primary'
                : 'text-on-surface-variant'
            }`}
          >
            Active Downloads
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-secondary-container/50 text-secondary text-[10px] font-bold">
                {activeCount}
              </span>
            )}
            {activeTab === 'active' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`font-sans font-medium text-sm transition-all duration-200 relative py-1 hover:text-secondary ${
              activeTab === 'settings'
                ? 'text-primary'
                : 'text-on-surface-variant'
            }`}
          >
            Settings
            {activeTab === 'settings' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </nav>

        {/* Profile / Right action */}
        <div className="flex items-center gap-4">
          <button 
            aria-label="Profile" 
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-secondary transition-all active:scale-95"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
