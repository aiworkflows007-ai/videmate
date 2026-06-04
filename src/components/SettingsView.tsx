import React, { useState } from 'react';
import { 
  Palette, 
  Download, 
  ShieldCheck, 
  Folder, 
  Trash2, 
  Search, 
  Check, 
  Settings,
  Sparkles,
  Info
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export function SettingsView({ settings, onUpdateSettings }: SettingsViewProps) {
  const [activeSidebarTab, setActiveSidebarTab] = useState<'general' | 'downloads' | 'storage' | 'privacy'>('general');
  const [cleaningStatus, setCleaningStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [freedSpace, setFreedSpace] = useState(0);
  const [cleanProgress, setCleanProgress] = useState(0);

  // Simulated smart cleanup scanning
  const runCleanup = () => {
    setCleaningStatus('scanning');
    setCleanProgress(0);
    
    const interval = setInterval(() => {
      setCleanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setCleaningStatus('done');
          // Update storage statistics to simulate real cleanup
          const spaceFreed = 14.2; // in GB
          setFreedSpace(spaceFreed);
          onUpdateSettings({
            systemStorageUsed: Math.max(10, settings.systemStorageUsed - spaceFreed)
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleQualityChange = (quality: string) => {
    onUpdateSettings({ downloadQuality: quality });
  };

  const handleMaxDownloadsUpdate = (offset: number) => {
    const updated = Math.min(10, Math.max(1, settings.maxDownloads + offset));
    onUpdateSettings({ maxDownloads: updated });
  };

  // Calculations for storage layout
  const storagePercentage = Math.round((settings.systemStorageUsed / settings.systemStorageTotal) * 100);

  return (
    <div className="space-y-10 animate-fade-in text-left">
      {/* Page Title */}
      <div>
        <div className="flex flex-col text-left gap-1 mb-2">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary">System Configurations</span>
          <h2 className="font-display font-black text-3xl md:text-5.5xl text-white tracking-tighter uppercase leading-none">
            Settings
          </h2>
        </div>
        <p className="font-sans text-xs text-white/50 tracking-wide mt-3 uppercase">
          Configure your downloading properties and interface preferences for Vidmate Premium.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-xl p-4 space-y-1 sticky top-28">
            <button
              onClick={() => setActiveSidebarTab('general')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg font-sans text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'general'
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-white/5'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('downloads')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg font-sans text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'downloads'
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-white/5'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Downloads</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('storage')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg font-sans text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'storage'
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Storage Usage</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('privacy')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg font-sans text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'privacy'
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy Guard</span>
            </button>
          </div>
        </div>

        {/* Configurations Forms */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Subsection: Appearance (General) */}
          {(activeSidebarTab === 'general') && (
            <section className="glass-card rounded-xl p-6 md:p-8 space-y-6 animate-fade-in">
              <h3 className="font-display text-lg md:text-xl font-bold flex items-center gap-2 mb-2 text-on-surface">
                <Palette className="text-secondary w-5 h-5" />
                Appearance
              </h3>
              
              <div className="divide-y divide-white/5">
                {/* Switch for Dark Mode */}
                <div className="flex items-center justify-between py-5">
                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-sm text-on-surface">Dark Mode</h4>
                    <p className="font-sans text-xs text-on-surface-variant max-w-md">
                      Toggle high-contrast obsidian dark themes and light schemes.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => onUpdateSettings({ darkMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>

                {/* Switch for glass filters */}
                <div className="flex items-center justify-between py-5">
                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-sm text-on-surface">Glass Effects</h4>
                    <p className="font-sans text-xs text-on-surface-variant max-w-md">
                      Enable beautiful frosted blurs and fine visual glow frames.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.glassEffects}
                      onChange={(e) => onUpdateSettings({ glassEffects: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Subsection: Downloads properties */}
          {(activeSidebarTab === 'downloads') && (
            <section className="glass-card rounded-xl p-6 md:p-8 space-y-6 animate-fade-in">
              <h3 className="font-display text-lg md:text-xl font-bold flex items-center gap-2 mb-2 text-on-surface">
                <Download className="text-secondary w-5 h-5" />
                Download Properties
              </h3>
              
              <div className="space-y-6 divide-y divide-white/5">
                {/* Preferred qualities triggers */}
                <div className="py-4">
                  <h4 className="font-sans font-bold text-sm text-on-surface mb-1">
                    Default Download Quality
                  </h4>
                  <p className="font-sans text-xs text-on-surface-variant mb-4">
                    Preferred resolution selected automatically on video link analysis.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    {['4K Ultra HD', '1440p (QHD)', '1080p (FHD)', '720p (HD)'].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => handleQualityChange(quality)}
                        className={`px-5 py-2.5 rounded-full font-sans text-xs font-semibold border transition-all cursor-pointer ${
                          settings.downloadQuality === quality
                            ? 'border-secondary bg-secondary/15 text-secondary shadow-[0_0_15px_rgba(137,206,255,0.15)]'
                            : 'border-white/10 text-on-surface-variant hover:bg-white/5'
                        }`}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Path display box */}
                <div className="py-5">
                  <h4 className="font-sans font-bold text-sm text-on-surface mb-1">
                    Path Storage Folder
                  </h4>
                  <p className="font-sans text-xs text-on-surface-variant mb-4">
                    Directory path where premium video downloads are filed.
                  </p>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow flex items-center gap-3 p-3.5 bg-black/30 border border-white/10 rounded-xl">
                      <Folder className="w-5 h-5 text-on-surface-variant" />
                      <span className="font-mono text-xs text-on-surface truncate">
                        {settings.storagePath}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const nextPath = prompt("Enter storage folder path:", settings.storagePath);
                        if (nextPath) onUpdateSettings({ storagePath: nextPath });
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-on-primary font-sans font-bold text-xs rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 shrink-0 cursor-pointer"
                    >
                      Change Path
                    </button>
                  </div>
                </div>

                {/* Simulated simultaneous max concurrency clickers */}
                <div className="flex items-center justify-between py-5">
                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-sm text-on-surface">Max Concurrent Downloads</h4>
                    <p className="font-sans text-xs text-on-surface-variant max-w-sm">
                      Maximum quantity of extractions executing simultaneously.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleMaxDownloadsUpdate(-1)}
                      disabled={settings.maxDownloads <= 1}
                      className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-on-surface hover:bg-white/5 active:scale-90 transition-all disabled:opacity-40"
                    >
                      <span className="font-bold text-base">-</span>
                    </button>
                    <span className="font-display font-bold text-2xl w-6 text-center text-primary">
                      {settings.maxDownloads}
                    </span>
                    <button
                      onClick={() => handleMaxDownloadsUpdate(1)}
                      disabled={settings.maxDownloads >= 10}
                      className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-on-surface hover:bg-white/5 active:scale-90 transition-all disabled:opacity-40"
                    >
                      <span className="font-bold text-base">+</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Subsection: Storage cleanup and progress ratios */}
          {(activeSidebarTab === 'storage') && (
            <section className="space-y-6 animate-fade-in text-left">
              <div className="glass-card rounded-xl p-6 md:p-8 space-y-6">
                <h3 className="font-display text-lg md:text-xl font-bold flex items-center gap-2 mb-2 text-on-surface">
                  <Settings className="text-secondary w-5 h-5" />
                  System Storage Tracker
                </h3>
                
                {/* Stats and ratio display */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-sans font-bold text-xs text-on-surface">Local Drive Storage</span>
                    <span className="text-secondary text-xs font-bold font-mono">
                      {storagePercentage}% Full
                    </span>
                  </div>
                  
                  {/* Linear storage progress ratio bar */}
                  <div className="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-in-out shadow-[0_0_12px_rgba(137,206,255,0.4)]"
                      style={{ width: `${storagePercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>{settings.systemStorageUsed.toFixed(1)} GB occupied</span>
                    <span>{settings.systemStorageTotal} GB Total SSD</span>
                  </div>
                </div>

                {/* Dynamic Smart Cleanup Action Block */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-sm text-on-surface">Smart Cache Sweep</h4>
                    <p className="font-sans text-xs text-on-surface-variant max-w-sm">
                      Erase download chunks, partial caches, and corrupted logs to clear local drive space.
                    </p>
                  </div>
                  
                  <button
                    onClick={runCleanup}
                    disabled={cleaningStatus === 'scanning'}
                    className="px-5 py-3 rounded-lg border border-secondary text-secondary hover:bg-secondary/10 bg-secondary/5 font-sans text-xs font-semibold disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {cleaningStatus === 'scanning' ? 'Sweeping...' : 'Run Cache Sweep'}
                  </button>
                </div>

                {/* Animated status scanning overlay bar */}
                {cleaningStatus === 'scanning' && (
                  <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20 space-y-2 animate-pulse text-xs text-secondary font-semibold font-mono">
                    <div className="flex justify-between">
                      <span>Analyzing temp sectors...</span>
                      <span>{cleanProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: `${cleanProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {/* Completed Clean notice banner */}
                {cleaningStatus === 'done' && (
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 animate-fade-in text-xs text-green-400">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold">Cleanup Execution Completed Successfully!</p>
                      <p className="text-on-surface-variant">Drive index cleared. Recycled <span className="font-bold text-green-400 font-mono">{freedSpace} GB</span> of stale cached files.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Subsection: Privacy Guards */}
          {(activeSidebarTab === 'privacy') && (
            <section className="glass-card rounded-xl p-6 md:p-8 space-y-6 animate-fade-in">
              <h3 className="font-display text-lg md:text-xl font-bold flex items-center gap-2 mb-2 text-on-surface">
                <ShieldCheck className="text-primary w-5 h-5" />
                Privacy Safeguards
              </h3>
              
              <div className="space-y-4 text-sm leading-relaxed text-on-surface-variant/90">
                <p>
                  Vidmate Downloader operates with a <strong>Zero-Logs commitment</strong>. Extracting high-resolution links and tracks occurs purely inside ephemeral sandbox memory pipelines.
                </p>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-3 text-xs text-on-surface">
                  <Info className="w-5 h-5 text-secondary shrink-0" />
                  <p>
                    Storage directories reside client-side on your matching web container storage volume. Browser cookies or download catalog metadata entries are persistent but purely offline.
                  </p>
                </div>
                <p>
                  We are integrated with advanced cryptographic certificates to route requests securely. Media headers will be stripped of tracking telemetry tokens before file files are downloaded, ensuring completely untraceable offline tracking.
                </p>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
