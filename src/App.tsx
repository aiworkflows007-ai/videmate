import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import {
  createDownloadJob,
  getJobStatus,
  saveJobFileToDevice,
  cancelJob,
  checkApiHealth,
  subscribeToJobStream,
  type JobStatusResponse,
} from './api/download';

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
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

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

  useEffect(() => {
    checkApiHealth().then(setApiOnline).catch(() => setApiOnline(false));
  }, []);

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

  const savedToDeviceRef = useRef<Set<string>>(new Set());
  const activeTasksRef = useRef(activeTasks);
  activeTasksRef.current = activeTasks;

  const pollJobIdsKey = activeTasks
    .map((t) => t.jobId)
    .filter(Boolean)
    .join(',');

  const triggerToast = (message: string, sub: string, type: 'success' | 'info') => {
    setToast({ message, sub, type });
    setTimeout(() => setToast(null), 4000);
  };

  const parseSpeedToMbps = (label?: string): number => {
    if (!label || /measuring/i.test(label)) return 0;
    const m = label.match(/([\d.]+)\s*(KiB|MiB|GiB)\/s/i);
    if (!m) return 0;
    const n = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    const mib = unit === 'gib' ? n * 1024 : unit === 'kib' ? n / 1024 : n;
    return Math.round(mib * 10) / 10;
  };

  const mergeStatusIntoTask = (item: ActiveTask, status: JobStatusResponse): ActiveTask => {
    const serverProgress = Number(status.progress) || 0;
    const progress = Math.max(item.progress, serverProgress);
    const eta =
      status.etaSeconds != null && status.etaSeconds > 0
        ? status.etaSeconds
        : progress > 0
          ? Math.max(5, Math.round(((100 - progress) / Math.max(progress, 1)) * 3))
          : item.remainingSeconds;
    const speedLabel =
      status.speedLabel && status.speedLabel !== '—' ? status.speedLabel : item.speedLabel;
    return {
      ...item,
      status:
        status.status === 'downloading'
          ? 'downloading'
          : status.status === 'ready'
            ? 'completed'
            : status.status === 'error'
              ? 'error'
              : 'pending',
      errorMessage: status.status === 'error' ? status.error || 'Download failed' : undefined,
      title: status.title || item.title,
      progress: status.status === 'ready' ? 100 : progress,
      totalSize: status.totalSize && status.totalSize !== '—' ? status.totalSize : item.totalSize,
      size: status.downloadedLabel || status.size || item.size,
      thumbnailUrl: status.thumbnailUrl || item.thumbnailUrl,
      duration: status.duration || item.duration,
      speedLabel: status.status === 'ready' ? 'Done' : speedLabel,
      speed: parseSpeedToMbps(speedLabel) || item.speed,
      remainingSeconds: status.status === 'ready' ? 0 : eta,
    };
  };

  const finishJobDownload = useCallback(
    async (jobId: string, status: JobStatusResponse) => {
      if (!status.filename || savedToDeviceRef.current.has(jobId)) return;
      savedToDeviceRef.current.add(jobId);

      const snapshot = activeTasksRef.current.find((t) => t.jobId === jobId);
      try {
        await saveJobFileToDevice(jobId, status.filename);
      } catch (err) {
        savedToDeviceRef.current.delete(jobId);
        const message = err instanceof Error ? err.message : 'Save failed';
        setActiveTasks((prev) =>
          prev.map((t) =>
            t.jobId === jobId ? { ...t, status: 'error', errorMessage: message } : t
          )
        );
        return;
      }

      setActiveTasks((prev) => {
        const task = prev.find((t) => t.jobId === jobId);
        if (!task) return prev;

        const newItem: LibraryItem = {
          id: `lib-${Date.now()}`,
          title: status.title || task.title,
          type: task.type,
          size: status.totalSize || task.totalSize,
          duration: status.duration || '—',
          dateString: 'Just now',
          quality: task.quality,
          platform: (status.platform as LibraryItem['platform']) || task.platform,
          thumbnailUrl: status.thumbnailUrl || task.thumbnailUrl,
          category: task.type === 'video' ? 'Videos / Downloaded' : 'Audio / Extract',
        };

        setLibraryItems((prevLib) => [newItem, ...prevLib]);
        setSettings((prevSet) => {
          const fileWeight = task.type === 'video' ? 0.45 : 0.01;
          return {
            ...prevSet,
            systemStorageUsed: Math.min(
              prevSet.systemStorageTotal,
              prevSet.systemStorageUsed + fileWeight
            ),
          };
        });
        triggerToast('Saved to your device', status.title || task.title, 'success');

        return prev.map((t) =>
          t.jobId === jobId ? mergeStatusIntoTask(t, { ...status, status: 'ready', progress: 100 }) : t
        );
      });

      window.setTimeout(() => {
        setActiveTasks((prev) => prev.filter((t) => t.jobId !== jobId));
      }, 8000);
    },
    []
  );

  const handleJobStatusUpdate = useCallback(
    (jobId: string, status: JobStatusResponse) => {
      const snapshot = activeTasksRef.current.find((t) => t.jobId === jobId);
      if (!snapshot || snapshot.isPaused) return;
      if (snapshot.status === 'completed' || snapshot.status === 'error') return;

      if (status.status === 'error') {
        setActiveTasks((prev) =>
          prev.map((t) => (t.jobId === jobId ? mergeStatusIntoTask(t, status) : t))
        );
        triggerToast('Download failed', status.error || snapshot.title, 'info');
        return;
      }

      if (status.status === 'ready') {
        setActiveTasks((prev) =>
          prev.map((t) => (t.jobId === jobId ? mergeStatusIntoTask(t, status) : t))
        );
        void finishJobDownload(jobId, status);
        return;
      }

      setActiveTasks((prev) =>
        prev.map((t) => (t.jobId === jobId ? mergeStatusIntoTask(t, status) : t))
      );
    },
    [finishJobDownload]
  );

  // Live progress stream (pushes every yt-dlp progress line)
  useEffect(() => {
    const jobIds = pollJobIdsKey ? pollJobIdsKey.split(',') : [];
    if (jobIds.length === 0) return;
    const unsubs = jobIds.map((jobId) =>
      subscribeToJobStream(jobId, (status) => handleJobStatusUpdate(jobId, status))
    );
    return () => unsubs.forEach((u) => u());
  }, [pollJobIdsKey, handleJobStatusUpdate]);

  // Fallback poll if SSE disconnects
  useEffect(() => {
    const jobIds = pollJobIdsKey ? pollJobIdsKey.split(',') : [];
    if (jobIds.length === 0) return;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      for (const jobId of jobIds) {
        if (savedToDeviceRef.current.has(jobId)) continue;
        const snap = activeTasksRef.current.find((t) => t.jobId === jobId);
        if (!snap || snap.isPaused || snap.status === 'completed' || snap.status === 'error') continue;
        try {
          const status = await getJobStatus(jobId);
          handleJobStatusUpdate(jobId, status);
        } catch {
          /* ignore */
        }
      }
    };
    const interval = setInterval(tick, 2000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [pollJobIdsKey, handleJobStatusUpdate]);

  const detectPlatform = (urlString: string): ActiveTask['platform'] => {
    const lowerUrl = urlString.toLowerCase();
    if (lowerUrl.includes('youtube') || lowerUrl.includes('youtu.be')) return 'youtube';
    if (lowerUrl.includes('vimeo')) return 'vimeo';
    if (lowerUrl.includes('instagram')) return 'instagram';
    if (lowerUrl.includes('tiktok')) return 'tiktok';
    if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) return 'twitter';
    if (lowerUrl.includes('facebook') || lowerUrl.includes('fb.watch')) return 'facebook';
    return 'other';
  };

  const handleStartDownload = async (
    urlString: string,
    selectedQuality: string,
    selectedType: 'video' | 'audio'
  ) => {
    const platform = detectPlatform(urlString);
    const qualityForJob = selectedType === 'audio' ? 'MP3' : selectedQuality;
    const placeholderId = `task-${Date.now()}`;

    const placeholder: ActiveTask = {
      id: placeholderId,
      sourceUrl: urlString,
      status: 'pending',
      title: 'Connecting to server…',
      size: '0 B',
      totalSize: '…',
      progress: 0,
      speed: 0,
      speedLabel: '—',
      remainingSeconds: 0,
      isPaused: false,
      quality: qualityForJob,
      platform,
      type: selectedType,
      thumbnailUrl: '',
    };

    setActiveTasks((prev) => [placeholder, ...prev]);
    setActiveTab('active');

    try {
      const created = await createDownloadJob(urlString, qualityForJob, selectedType);

      setActiveTasks((prev) =>
        prev.map((t) =>
          t.id === placeholderId
            ? {
                ...t,
                jobId: created.jobId,
                status: 'pending',
                title: created.title || 'Preparing download…',
                thumbnailUrl: created.thumbnailUrl || t.thumbnailUrl,
                platform: created.platform || platform,
                duration: created.duration,
                progress: 0,
                speedLabel: '—',
              }
            : t
        )
      );
      triggerToast('Download started', created.title, 'info');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start download';
      setActiveTasks((prev) =>
        prev.map((t) =>
          t.id === placeholderId
            ? { ...t, status: 'error', errorMessage: message, progress: 0, speed: 0, speedLabel: '—' }
            : t
        )
      );
      triggerToast('Download failed', message, 'info');
    }
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
    const task = activeTasks.find((t) => t.id === id);
    if (task?.jobId) {
      savedToDeviceRef.current.delete(task.jobId);
      cancelJob(task.jobId).catch(() => undefined);
    }
    setActiveTasks((prev) => prev.filter((t) => t.id !== id));
    triggerToast('Download canceled', 'Stopped on server.', 'info');
  };

  const handleDismissTask = (id: string) => {
    const task = activeTasks.find((t) => t.id === id);
    if (task?.jobId) savedToDeviceRef.current.delete(task.jobId);
    setActiveTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRetryTask = async (id: string) => {
    const task = activeTasks.find((t) => t.id === id);
    if (!task?.sourceUrl) return;
    const quality =
      task.type === 'audio'
        ? 'MP3'
        : ['4K', '1080P', '720P'].includes(task.quality)
          ? task.quality
          : '720P';
    handleDismissTask(id);
    await handleStartDownload(task.sourceUrl, quality, task.type);
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

      {apiOnline === false && !legalPage && (
        <div className="fixed top-20 left-0 right-0 z-[60] px-4 pointer-events-none">
          <div className="max-w-3xl mx-auto glass-card border-amber-500/40 bg-amber-950/90 px-4 py-3 text-center pointer-events-auto">
            <p className="text-sm font-semibold text-amber-100">
              Download server not connected (404). Ask your host to enable the API — see deploy/fix-api-404 steps.
            </p>
          </div>
        </div>
      )}

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
            onDismissTask={handleDismissTask}
            onRetryTask={handleRetryTask}
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
