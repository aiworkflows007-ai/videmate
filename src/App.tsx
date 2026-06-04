import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Home, 
  PlaySquare, 
  Settings as SettingsIcon, 
  Search, 
  Compass,
  CheckCircle,
  Sparkles,
  X,
  Plus
} from 'lucide-react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ActiveDownloadsView } from './components/ActiveDownloadsView';
import { LibraryView } from './components/LibraryView';
import { SettingsView } from './components/SettingsView';
import { SeoManager, SeoPage } from './components/SeoManager';
import { PrivacyPolicyPage } from './components/legal/PrivacyPolicyPage';
import { TermsPage } from './components/legal/TermsPage';
import { LibraryItem, ActiveTask, AppSettings } from './types';
import { INITIAL_LIBRARY_ITEMS, INITIAL_ACTIVE_TASKS } from './data';

type LegalPage = 'privacy' | 'terms' | null;

function legalFromPath(path: string): LegalPage {
  const p = path.replace(/\/$/, '') || '/';
  if (p === '/privacy') return 'privacy';
  if (p === '/terms') return 'terms';
  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'active' | 'settings'>('home');
  const [legalPage, setLegalPage] = useState<LegalPage>(() =>
    typeof window !== 'undefined' ? legalFromPath(window.location.pathname) : null
  );
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(INITIAL_LIBRARY_ITEMS);
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>(INITIAL_ACTIVE_TASKS);
  
  // Custom toast notification states
  const [toast, setToast] = useState<{ message: string; sub: string; type: 'success' | 'info' } | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    darkMode: true,
    glassEffects: true,
    downloadQuality: '4K Ultra HD',
    storagePath: '/Users/PremiumUser/Movies/Vidmate_Downloads/HighRes',
    maxDownloads: 4,
    systemStorageUsed: 342.5,
    systemStorageTotal: 512,
  });

  // Track cursor position to shift ambient glows subtly for premium hardware feel
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 35,
        y: (e.clientY / window.innerHeight - 0.5) * 35,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Sync legal routes with browser back/forward
  useEffect(() => {
    const onPopState = () => setLegalPage(legalFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openLegal = (page: 'privacy' | 'terms') => {
    setLegalPage(page);
    window.history.pushState({}, '', `/${page}`);
    window.scrollTo(0, 0);
  };

  const closeLegal = () => {
    setLegalPage(null);
    window.history.pushState({}, '', '/');
    setActiveTab('home');
  };

  const seoPage: SeoPage = legalPage ?? 'home';

  // Sync dark class on document root based on settings
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#0a0a0a';
    }
  }, [settings.darkMode]);

  // Handle active downloads progresses simulated timer ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTasks((prevTasks) => {
        if (prevTasks.length === 0) return prevTasks;

        const updatedTasks: ActiveTask[] = [];
        
        prevTasks.forEach((task) => {
          if (task.isPaused) {
            updatedTasks.push(task);
            return;
          }

          // Progress increments based on speed
          const increment = (task.speed / 5) * (Math.random() * 1.5 + 0.5);
          const nextProgress = task.progress + increment;

          if (nextProgress >= 100) {
            // Task finishes extraction! Add to library completed catalog list
            const completedId = `lib-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const newItem: LibraryItem = {
              id: completedId,
              title: task.title,
              type: task.type,
              size: task.totalSize,
              duration: task.type === 'video' ? '03:45' : '02:50',
              dateString: 'Just now',
              quality: task.quality,
              platform: task.platform,
              thumbnailUrl: task.thumbnailUrl,
              category: task.type === 'video' ? 'Videos / Downloaded' : 'Audio / Extract',
            };

            setLibraryItems((prevLib) => [newItem, ...prevLib]);
            
            // Increment local storage occupied metric slightly
            setSettings((prevSet) => {
              const fileWeight = task.type === 'video' ? 0.45 : 0.01; // file weight approximation
              return {
                ...prevSet,
                systemStorageUsed: Math.min(prevSet.systemStorageTotal, prevSet.systemStorageUsed + fileWeight),
              };
            });

            // Trigger beautiful completion Toast notice!
            triggerToast(
              `Extraction complete!`,
               task.title,
              'success'
            );
          } else {
            // Task continues downloading
            updatedTasks.push({
              ...task,
              progress: nextProgress,
              remainingSeconds: Math.max(1, Math.round((task.totalSize.includes('GB') ? 1000 : 50) * (100 - nextProgress) / (task.speed * 10))),
            });
          }
        });

        return updatedTasks;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTasks]);

  const triggerToast = (message: string, sub: string, type: 'success' | 'info') => {
    setToast({ message, sub, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Start new download task
  const handleStartDownload = (urlString: string, selectedQuality: string, selectedType: 'video' | 'audio') => {
    // Recognize host platform based on link
    let recognizedPlatform: ActiveTask['platform'] = 'other';
    let thumbnailPlaceholder = '';

    const lowerUrl = urlString.toLowerCase();
    if (lowerUrl.includes('youtube') || lowerUrl.includes('youtu.be')) {
      recognizedPlatform = 'youtube';
      thumbnailPlaceholder = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAv1GepoSFlkBlNXgrXeYQNKxnYODap9ChSTbSCfnGcCCDElFqEA83mVTL0p0G1J4h3fA-WhaHQbUV09SxWj3wqRMKT8ENZStQONBlfDElM44qnH9Dlju4SOkSJDDdpa_cgBxeUvoB4frU_EU-NcZMzl9rL0xKr-wGbkmSQeikpFGQQ5m9fLv5i_JcnjVVAB0QgAjUHhYOVGUAmknrhSmCcZHSu-gKQ69EzOSg97PFLt-c5xRnhWNepkcWq3pegDN3WtKfwi8JwTRE';
    } else if (lowerUrl.includes('vimeo')) {
      recognizedPlatform = 'vimeo';
      thumbnailPlaceholder = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQRhPvmPDuaMPJVwYE-Q31IpEd0pRpM-XDt4yeTkfosVY91OZzCiIFDHDVtVRuAt75iEkHXRfQmWxjvN-ZsIvHk_TgkUGUJTySNC3mqyCsFVz4Yw3f9hGJXqiFNZZeB1aq6lIcQPGBC9cR-UcagcH0faQVQ4JOG-2dq-dcLDovPh-njmEDOilZ3x-qQSsPCcn4WZPerP2t2AgBKEtlfVKOdMitWW-WlOQ585oV8mGmg38YwsunuRjLGo1YbRl7S4NVWF3rNR4D_4Y';
    } else if (lowerUrl.includes('instagram')) {
      recognizedPlatform = 'instagram';
    } else if (lowerUrl.includes('tiktok')) {
      recognizedPlatform = 'tiktok';
    } else if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) {
      recognizedPlatform = 'twitter';
    } else if (lowerUrl.includes('facebook') || lowerUrl.includes('fb.watch')) {
      recognizedPlatform = 'facebook';
    }

    // Give a beautiful, realistic title to the downloading stream
    const linkDomain = recognizedPlatform !== 'other' 
      ? recognizedPlatform.charAt(0).toUpperCase() + recognizedPlatform.slice(1)
      : 'Media Web';
    const cleanTitle = `${linkDomain} Track - High Fidelity Session ${selectedQuality}`;

    const newTask: ActiveTask = {
      id: `task-${Date.now()}`,
      title: cleanTitle,
      size: '0 MB',
      totalSize: selectedType === 'video' ? '410 MB' : '12 MB',
      progress: 0,
      speed: parseFloat((Math.random() * 15 + 11).toFixed(1)),
      remainingSeconds: 32,
      isPaused: false,
      quality: selectedType === 'video' ? `${selectedQuality} UHD` : selectedQuality,
      platform: recognizedPlatform,
      type: selectedType,
      thumbnailUrl: thumbnailPlaceholder,
    };

    setActiveTasks((prev) => [newTask, ...prev]);
    
    // Automatically navigate to 'active' task view so the progress slide is instantly visible
    setActiveTab('active');
    triggerToast(
      'Download initiated',
       cleanTitle,
      'info'
    );
  };

  const handlePauseTask = (id: string) => {
    setActiveTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPaused: true } : t))
    );
  };

  const handleResumeTask = (id: string) => {
    setActiveTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPaused: false } : t))
    );
  };

  const handleCancelTask = (id: string) => {
    setActiveTasks((prev) => prev.filter((t) => t.id !== id));
    triggerToast(
      'Download canceled',
      'The extraction pipeline has been terminated.',
      'info'
    );
  };

  const handleDeleteLibraryItem = (id: string) => {
    const deletedItem = libraryItems.find(item => item.id === id);
    setLibraryItems((prev) => prev.filter((t) => t.id !== id));
    if (deletedItem) {
      triggerToast(
        'File deleted from Library',
        deletedItem.title,
        'info'
      );
    }
  };

  const handleSettingsUpdate = (updatedSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updatedSettings }));
  };

  return (
    <div className={`min-h-screen text-on-surface transition-colors duration-300 relative select-none ${settings.darkMode ? 'bg-surface' : 'bg-light-bg'}`}>
      <SeoManager page={seoPage} />

      {/* Background Animated Glowing Blobs (Shift on desktop cursor movement) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute w-[45vw] h-[45vw] rounded-full filter blur-[120px] transition-transform duration-300 pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(circle, #002bff 0%, transparent 70%)',
            top: '-15%',
            left: '-15%',
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
          }}
        />
        <div 
          className="absolute w-[50vw] h-[50vw] rounded-full filter blur-[150px] transition-transform duration-300 pointer-events-none opacity-15"
          style={{
            background: 'radial-gradient(circle, #00d2ff 0%, transparent 70%)',
            bottom: '-15%',
            right: '-15%',
            transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)`
          }}
        />
      </div>

      {/* Main Bar Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeCount={activeTasks.length} 
      />

      {/* Primary Page Canvas */}
      <main className="relative z-10 pt-28 pb-32 px-6 md:px-20 max-w-7xl mx-auto w-full min-h-[calc(100vh-64px)]">
        {legalPage === 'privacy' && <PrivacyPolicyPage onBack={closeLegal} />}
        {legalPage === 'terms' && <TermsPage onBack={closeLegal} />}

        {!legalPage && activeTab === 'home' && (
          <HomeView onStartDownload={handleStartDownload} />
        )}

        {!legalPage && activeTab === 'active' && (
          <ActiveDownloadsView 
            tasks={activeTasks}
            onPauseTask={handlePauseTask}
            onResumeTask={handleResumeTask}
            onCancelTask={handleCancelTask}
            completedItems={libraryItems}
          />
        )}

        {!legalPage && activeTab === 'library' && (
          <LibraryView 
            items={libraryItems} 
            onDeleteItem={handleDeleteLibraryItem}
          />
        )}

        {!legalPage && activeTab === 'settings' && (
          <SettingsView 
            settings={settings} 
            onUpdateSettings={handleSettingsUpdate}
          />
        )}
      </main>

      {/* Bottom Navigation (Responsive Mobile view) */}
      <nav className={`md:hidden fixed bottom-0 w-full z-50 backdrop-blur-xl bg-glass-surface/90 border-t border-white/10 shadow-[0_-4px_25px_rgba(0,0,0,0.3)] transition-colors ${settings.darkMode ? 'bg-glass-surface' : 'bg-white/80'}`}>
        <div className="flex justify-around items-center h-16 w-full px-2">
          {/* Home action */}
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center relative cursor-pointer active:scale-90 transition-transform ${
              activeTab === 'home' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="font-sans font-semibold text-[10px] tracking-wide">Home</span>
            {activeTab === 'home' && (
              <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>

          {/* Library action */}
          <button 
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center justify-center relative cursor-pointer active:scale-90 transition-transform ${
              activeTab === 'library' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <PlaySquare className="w-5 h-5 mb-1" />
            <span className="font-sans font-semibold text-[10px] tracking-wide font-medium">Library</span>
            {activeTab === 'library' && (
              <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>

          {/* Active progress */}
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex flex-col items-center justify-center relative cursor-pointer active:scale-90 transition-transform ${
              activeTab === 'active' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <div className="relative">
              <Download className="w-5 h-5 mb-1" />
              {activeTasks.length > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-secondary text-on-secondary text-[8px] font-bold flex items-center justify-center">
                  {activeTasks.length}
                </span>
              )}
            </div>
            <span className="font-sans font-semibold text-[10px] tracking-wide">Active</span>
            {activeTab === 'active' && (
              <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>

          {/* Settings Properties */}
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center relative cursor-pointer active:scale-90 transition-transform ${
              activeTab === 'settings' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <SettingsIcon className="w-5 h-5 mb-1" />
            <span className="font-sans font-semibold text-[10px] tracking-wide">Settings</span>
            {activeTab === 'settings' && (
              <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>

      {/* Footer support desk (shown on desktop width) */}
      <footer className="hidden md:block w-full py-6 border-t border-white/5 bg-slate-950/20 text-xs">
        <div className="flex flex-col md:flex-row justify-between items-center px-20 gap-4 max-w-7xl mx-auto text-on-surface-variant">
          <p className="font-sans">&copy; 2026 Vidmate Downloader. Engineered for Premium Performance.</p>
          <div className="flex gap-6 font-semibold">
            <button
              type="button"
              onClick={() => openLegal('privacy')}
              className="hover:text-secondary underline underline-offset-4 decoration-white/10 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => openLegal('terms')}
              className="hover:text-secondary underline underline-offset-4 decoration-white/10 transition-colors"
            >
              Terms of Service
            </button>
            <a
              href="mailto:support@ai-workflows.cloud"
              className="hover:text-secondary underline underline-offset-4 decoration-white/10 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </footer>

      {/* Beautiful floating banner Toast messages */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 animate-slide-up flex items-center gap-3 glass-card border-white/20 p-4 rounded-xl shadow-2xl max-w-md bg-slate-950/95 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary"></div>
          
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="w-4 h-4 text-glow-purple" />
          </div>

          <div className="min-w-0 flex-grow text-left">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              {toast.message}
            </p>
            <p className="text-xs text-on-surface-variant/80 truncate mt-0.5">
              {toast.sub}
            </p>
          </div>

          <button 
            onClick={() => setToast(null)}
            className="text-on-surface-variant hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
