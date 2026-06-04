import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Folder, 
  Play, 
  Share2, 
  Trash2, 
  Music, 
  Video, 
  X, 
  ExternalLink,
  Check,
  CheckCircle,
  Volume2,
  Minimize2
} from 'lucide-react';
import { LibraryItem } from '../types';

interface LibraryViewProps {
  items: LibraryItem[];
  onDeleteItem: (id: string) => void;
}

export function LibraryView({ items, onDeleteItem }: LibraryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio'>('all');
  
  // Interactive theater media player modal states
  const [playingItem, setPlayingItem] = useState<LibraryItem | null>(null);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [playerVolume, setPlayerVolume] = useState(80);

  // Sharing states
  const [sharingItem, setSharingItem] = useState<LibraryItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Playback timer effects for the theater components
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playingItem && isMediaPlaying) {
      interval = setInterval(() => {
        setPlayProgress((prev) => {
          if (prev >= 100) {
            setIsMediaPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playingItem, isMediaPlaying]);

  const handlePlayClick = (item: LibraryItem) => {
    setPlayingItem(item);
    setIsMediaPlaying(true);
    setPlayProgress(0);
  };

  const handleShareClick = (item: LibraryItem) => {
    setSharingItem(item);
    setCopied(false);
  };

  const copyShareLink = () => {
    if (!sharingItem) return;
    const dummyLink = `https://vidmate.premium-downloader.app/file/shared_${sharingItem.id}`;
    navigator.clipboard.writeText(dummyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter strategy
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Search & Header Tab Options */}
      <section>
        <div className="flex flex-col text-left gap-1 mb-6">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary">Media Cache Archive</span>
          <h1 className="font-display font-black text-3xl md:text-5.5xl text-white tracking-tighter uppercase leading-none">
            Asset Library
          </h1>
        </div>
        
        <div className="relative flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-glow-blue transition-colors w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your downloads by title..."
              className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 font-sans text-sm text-on-surface placeholder-on-surface-variant/40 backdrop-blur-md transition-all"
            />
          </div>
          
          <div className="flex gap-2 shrink-0">
            {['all', 'video', 'audio'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-sans text-xs font-semibold transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-primary/25 border border-primary/50 text-primary'
                    : 'glass-card border-white/10 text-on-surface-variant hover:bg-white/5'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="capitalize">{type === 'all' ? 'All Files' : `${type}s`}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid of Catalog Cards */}
      {filteredItems.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4">
          <Folder className="w-16 h-16 text-on-surface-variant/40 animate-pulse" />
          <h3 className="font-display text-lg font-bold text-on-surface">No storage matches found</h3>
          <p className="font-sans text-sm text-on-surface-variant/80 max-w-sm">
            Try revising your query or download new high-fidelity assets.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="glass-card rounded-xl overflow-hidden group border border-white/10 hover:border-primary/30 hover:shadow-[0_0_25px_rgba(221,183,255,0.1)] transition-all duration-300 flex flex-col h-full bg-slate-950/20"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-video bg-slate-900 group-hover:opacity-95 transition-all overflow-hidden shrink-0">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center shadow-lg shadow-secondary/5">
                      <Music className="w-8 h-8 text-secondary" />
                    </div>
                  </div>
                )}
                
                {/* Length Overlay Badge */}
                <span className="absolute bottom-2.5 right-2.5 bg-black/80 px-2 py-0.5 rounded text-[11px] font-bold text-white font-sans">
                  {item.duration}
                </span>

                {/* Instant Action Play Hover Overlay */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                  <button
                    onClick={() => handlePlayClick(item)}
                    className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center scale-75 group-hover:scale-100 transition-transform shadow-lg shadow-primary/30 cursor-pointer hover:bg-white hover:text-black duration-300"
                  >
                    <Play className="w-5 h-5 fill-current ml-1" />
                  </button>
                </div>
              </div>

              {/* Information Body */}
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-display font-black text-sm text-white line-clamp-1 hover:text-primary transition-colors cursor-pointer uppercase tracking-tight" onClick={() => handlePlayClick(item)}>
                      {item.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-[9px] font-bold text-secondary uppercase border border-secondary/20 tracking-wider">
                      {item.quality}
                    </span>
                  </div>
                  
                  <p className="font-sans text-xs text-on-surface-variant flex items-center gap-1.5 font-semibold">
                    <Folder className="w-4 h-4 text-primary" />
                    {item.category}
                  </p>
                </div>

                {/* Lower Action bar */}
                <div className="flex justify-between items-center pt-4 mt-6 border-t border-white/5 shrink-0">
                  <span className="text-[11px] text-on-surface-variant/80 font-medium">
                    {item.dateString} &bull; {item.size}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShareClick(item)}
                      aria-label="Share Link"
                      className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-white/5"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      aria-label="Delete File"
                      className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-error hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Theater Mediaplayer Modal */}
      {playingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-3xl rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 flex flex-col">
            {/* Aspect Display Container */}
            <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
              {playingItem.thumbnailUrl ? (
                <img
                  src={playingItem.thumbnailUrl}
                  alt={playingItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center shadow-inner animate-pulse">
                    <Music className="w-12 h-12 text-secondary" />
                  </div>
                  <span className="font-sans text-xs text-on-surface-variant uppercase tracking-widest block">
                    Synth audio extractor stream
                  </span>
                </div>
              )}

              {/* Floating playback screen cover */}
              {isMediaPlaying && (
                <div className="absolute inset-0 bg-transparent flex items-center justify-center md:opacity-0 hover:opacity-100 transition-opacity bg-black/20 duration-300">
                  <div className="px-4 py-2 border border-white/10 bg-black/60 rounded-full text-xs font-sans text-secondary flex items-center gap-1.5 shadow-md">
                    <Play className="w-3.5 h-3.5 fill-current animate-ping" />
                    Theater Play Active
                  </div>
                </div>
              )}
            </div>

            {/* Micro-interaction interactive timeline bar */}
            <div className="relative w-full h-1.5 bg-white/10 hover:h-2 transition-all cursor-pointer">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary to-secondary transition-all"
                style={{ width: `${playProgress}%` }}
              ></div>
            </div>

            {/* Control Bar Panel */}
            <div className="p-6 bg-surface-container flex flex-col md:flex-row gap-4 justify-between items-center text-left">
              <div className="space-y-1 w-full md:max-w-md">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block">
                  Media Theater System
                </span>
                <h3 className="font-display font-bold text-lg text-on-surface truncate">
                  {playingItem.title}
                </h3>
                <p className="font-sans text-xs text-on-surface-variant font-medium">
                  Resolution: {playingItem.quality} &bull; Stream Type: {playingItem.category}
                </p>
              </div>

              {/* Center controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMediaPlaying(!isMediaPlaying)}
                  className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:shadow-primary/30 transition-transform active:scale-95 cursor-pointer"
                >
                  {isMediaPlaying ? (
                    <span className="inline-block w-4 h-4 bg-on-primary rounded-[2px]" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-1" />
                  )}
                </button>
                
                <div className="flex items-center gap-2 border border-white/5 bg-white/5 rounded-lg px-3 py-1.5 shrink-0">
                  <Volume2 className="w-4 h-4 text-on-surface-variant" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={playerVolume}
                    onChange={(e) => setPlayerVolume(Number(e.target.value))}
                    className="w-16 md:w-20 accent-primary h-1 bg-surface-variant rounded-full cursor-pointer"
                  />
                </div>
              </div>

              {/* Close Button actions */}
              <div className="flex gap-2 font-sans text-xs">
                <button
                  onClick={() => setPlayingItem(null)}
                  className="px-5 py-3 rounded-xl hover:bg-white/5 border border-white/10 text-on-surface font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Exit Theater</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sharing overlay modal */}
      {sharingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative overflow-hidden text-left shadow-2xl border border-white/15">
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              Share Extracted Output
            </h3>
            <p className="font-sans text-xs text-on-surface-variant/80 mb-6">
              Generate a high-speed direct extraction URL link copy to share online.
            </p>

            <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-4">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block">
                Sharing Item Properties
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-surface border border-white/10 flex items-center justify-center shrink-0">
                  {sharingItem.type === 'video' ? <Video className="w-5 h-5 text-primary" /> : <Music className="w-5 h-5 text-secondary" />}
                </div>
                <div className="min-w-0">
                  <h4 className="font-sans font-bold text-sm text-on-surface truncate">
                    {sharingItem.title}
                  </h4>
                  <span className="text-[11px] text-on-surface-variant block">Size: {sharingItem.size}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-900 border border-white/15 rounded-lg">
                <span className="text-xs text-on-surface-variant truncate flex-grow">
                  https://vidmate.premium-downloader.app/file/shared_{sharingItem.id}
                </span>
                <button
                  onClick={copyShareLink}
                  className={`px-4 py-2 rounded-md font-sans text-xs font-bold transition-all shrink-0 ${
                    copied 
                      ? 'bg-secondary text-on-secondary' 
                      : 'bg-primary text-on-primary hover:opacity-90'
                  }`}
                >
                  {copied ? (
                    <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                  ) : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSharingItem(null)}
                className="px-5 py-2.5 rounded-lg border border-white/10 text-on-surface-variant hover:text-on-surface font-sans text-xs font-semibold transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
