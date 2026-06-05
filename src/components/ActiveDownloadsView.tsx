import React from 'react';
import { 
  Pause, 
  Play, 
  X, 
  Folder, 
  Bolt, 
  CheckCircle2, 
  Music,
  DownloadCloud,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { ActiveTask, LibraryItem } from '../types';

interface ActiveDownloadsViewProps {
  tasks: ActiveTask[];
  onPauseTask: (id: string) => void;
  onResumeTask: (id: string) => void;
  onCancelTask: (id: string) => void;
  onDismissTask: (id: string) => void;
  onRetryTask: (id: string) => void;
  completedItems: LibraryItem[];
}

export function ActiveDownloadsView({
  tasks,
  onPauseTask,
  onResumeTask,
  onCancelTask,
  onDismissTask,
  onRetryTask,
  completedItems
}: ActiveDownloadsViewProps) {
  const primaryTask =
    tasks.find((t) => t.status === 'downloading') ||
    tasks.find((t) => !t.isPaused && t.status !== 'error' && t.status !== 'completed') ||
    tasks[0];
  const globalProgress = primaryTask ? Math.round(primaryTask.progress) : 0;
  
  // Simulated overall status variables
  const activeForSpeed = tasks.filter(
    (t) => !t.isPaused && t.status !== 'error' && t.status !== 'completed'
  );
  const globalSpeedLabel =
    activeForSpeed.find((t) => t.speedLabel && t.speedLabel !== '—')?.speedLabel ||
    (activeForSpeed.reduce((acc, t) => acc + t.speed, 0) > 0
      ? `${activeForSpeed.reduce((acc, t) => acc + t.speed, 0).toFixed(1)} MB/s`
      : '0 MB/s');

  // Circular ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (globalProgress / 100) * circumference;

  // Filter recently completed items
  const recentCompleted = completedItems.slice(0, 3);

  return (
    <div className="space-y-10 animate-fade-in text-left">
      {/* Title Section */}
      <div>
        <div className="flex flex-col text-left gap-1 mb-2">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary">Transmission Pipeline</span>
          <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tighter uppercase leading-none">
            Active Downloads
          </h2>
        </div>
        <p className="font-sans text-xs text-white/50 tracking-wide mt-3 uppercase">
          {tasks.length > 0 
            ? `High-speed engine engaged. ${tasks.filter(t => !t.isPaused).length} task(s) active on transmission matrix.`
            : 'All engines idle. No current downloading tasks in sandbox storage.'
          }
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant">
            <DownloadCloud className="w-8 h-8 opacity-40" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-on-surface">No active downloads</h3>
            <p className="font-sans text-sm text-on-surface-variant/80 max-w-sm">
              Head back to the Home tab and paste a video URL path to trigger high-resolution extraction.
            </p>
          </div>
        </div>
      ) : (
        /* Main Download Canvas grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Primary Progress Card (Large Glass Container) - spans 8 cols */}
          <div className="lg:col-span-8 space-y-6">
            {tasks.map((task) => {
              const isError = task.status === 'error';
              const isCompleted = task.status === 'completed';
              return (
              <div 
                key={task.id} 
                className={`glass-card rounded-xl p-6 md:p-8 relative overflow-hidden group transition-all duration-350 border ${
                  isError
                    ? 'border-amber-500/40 hover:border-amber-500/50'
                    : isCompleted
                      ? 'border-secondary/40 hover:border-secondary/50'
                      : 'border-white/10 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(221,183,255,0.05)]'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                  {/* Thumbnail with overlay player badge */}
                  <div className="relative w-full md:w-64 h-40 rounded-xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-slate-950">
                    {task.thumbnailUrl ? (
                      <img 
                        src={task.thumbnailUrl} 
                        alt="Task Preview Thumbnail" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container gap-2">
                        <Music className="w-10 h-10 text-secondary animate-bounce" />
                        <span className="text-xs text-on-surface-variant uppercase font-semibold">Audio Extract</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center text-white bg-black/30 hover:scale-105 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-1" />
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-2 px-2.5 py-1 glass-card border-white/20 rounded text-[10px] font-bold text-white uppercase tracking-wider font-sans">
                      {task.quality}
                    </div>
                  </div>

                  {/* Details & Live slider data */}
                  <div className="flex-1 w-full flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1 max-w-[80%]">
                      <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-secondary leading-none">EXTRACTING STREAM</span>
                      <h3 className="font-display text-lg md:text-xl font-black text-white line-clamp-2 leading-tight uppercase tracking-tight">
                        {task.title}
                      </h3>
                      <p className="font-sans text-xs text-on-surface-variant flex items-center gap-1.5 font-semibold">
                        <Folder className="w-4 h-4 text-primary" />
                        {task.type === 'audio' ? 'MP3' : 'MP4'} &bull;{' '}
                        {task.progress > 0 && task.totalSize !== '—'
                          ? `${Math.floor(task.progress)}%`
                          : task.size}{' '}
                        of {task.totalSize}
                      </p>
                    </div>
                      
                      {/* Speed status tag */}
                      <div className="text-right shrink-0">
                        <span className="block font-display text-lg md:text-2xl font-bold text-primary">
                          {Math.floor(task.progress)}%
                        </span>
                        <span className="font-sans text-xs text-on-surface-variant font-semibold">
                          {task.isPaused
                            ? 'Paused'
                            : task.speedLabel && task.speedLabel !== '—'
                              ? task.speedLabel
                              : task.speed > 0
                                ? `${task.speed} MB/s`
                                : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Linear progress sliders */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className={`font-sans text-xs font-bold uppercase tracking-widest ${
                          isError
                            ? 'text-amber-400'
                            : isCompleted
                              ? 'text-secondary'
                              : 'text-secondary animate-pulse'
                        }`}>
                          {isError
                            ? 'Failed'
                            : isCompleted
                              ? 'Saved to your device'
                              : task.isPaused
                                ? 'Paused...'
                                : task.status === 'pending' && task.progress < 1
                                  ? 'Preparing…'
                                  : 'Downloading…'}
                        </span>
                        <span className="font-sans text-xs text-on-surface-variant font-medium">
                          {task.isPaused
                            ? 'Paused in queue'
                            : task.progress > 0 && task.remainingSeconds > 0
                              ? `Est. ${task.remainingSeconds}s · ${Math.floor(task.progress)}%`
                              : task.status === 'pending'
                                ? 'Fetching video info…'
                                : 'Starting…'}
                        </span>
                      </div>

                      {/* Main track loader */}
                      <div className="h-3 w-full bg-surface-variant rounded-full p-[1px] border border-white/5 shadow-inner relative overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-primary via-secondary to-glow-blue rounded-full relative shadow-[0_0_15px_rgba(221,183,255,0.4)] transition-[width] duration-200 ${
                            task.progress < 2 && task.status !== 'completed' && !task.isPaused
                              ? 'progress-bar-indeterminate min-w-[12%]'
                              : ''
                          }`}
                          style={{
                            width: `${Math.max(task.progress < 2 && task.status !== 'completed' ? 12 : 0, task.progress)}%`,
                          }}
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 blur-sm"></div>
                        </div>
                      </div>

                      {isError && task.errorMessage && (
                        <p className="mt-3 text-xs text-amber-100/90 leading-relaxed font-sans border border-amber-500/20 rounded-lg px-3 py-2 bg-amber-950/40">
                          {task.errorMessage}
                        </p>
                      )}

                      {/* Control buttons */}
                      <div className="flex flex-wrap gap-4 mt-6">
                        {isError ? (
                          <>
                            <button
                              onClick={() => onRetryTask(task.id)}
                              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary font-sans font-semibold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(183,109,255,0.3)] transition-all duration-200 active:scale-95 cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Retry
                            </button>
                            <button
                              onClick={() => onDismissTask(task.id)}
                              className="px-6 py-2.5 rounded-full glass-card text-on-surface-variant hover:text-white border-white/10 font-sans font-semibold text-xs flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              Dismiss
                            </button>
                          </>
                        ) : isCompleted ? (
                          <button
                            onClick={() => onDismissTask(task.id)}
                            className="px-6 py-2.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30 font-sans font-semibold text-xs flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Done
                          </button>
                        ) : task.isPaused ? (
                          <button
                            onClick={() => onResumeTask(task.id)}
                            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary font-sans font-semibold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(183,109,255,0.3)] transition-all duration-200 active:scale-95 cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            Resume Extraction
                          </button>
                        ) : (
                          <button
                            onClick={() => onPauseTask(task.id)}
                            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-primary border border-white/10 font-sans font-semibold text-xs flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer"
                          >
                            <Pause className="w-4 h-4 fill-current text-primary" />
                            Pause Download
                          </button>
                        )}
                        {!isCompleted && (
                          <button
                            onClick={() => onCancelTask(task.id)}
                            className="px-6 py-2.5 rounded-full glass-card text-on-surface-variant hover:text-brand-red border-white/10 hover:border-brand-red/30 font-sans font-semibold text-xs flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          {/* Stats side column - spans 4 cols */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Circular Progress dial indicator */}
            <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-16 h-16 bg-secondary/5 rounded-full blur-xl"></div>
              
              <div className="relative mb-4 flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle 
                    className="text-surface-variant stroke-current" 
                    cx="64" 
                    cy="64" 
                    fill="transparent" 
                    r="54" 
                    strokeWidth="8"
                  ></circle>
                  <circle 
                    className="text-primary stroke-current progress-ring__circle transition-all duration-300" 
                    cx="64" 
                    cy="64" 
                    fill="transparent" 
                    r="54" 
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-2xl font-bold text-on-surface">
                    {globalProgress}%
                  </span>
                </div>
              </div>

              <p className="font-sans font-bold text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                Global Speed
              </p>
              <p className="font-display text-lg font-bold text-secondary flex items-baseline gap-1 animate-pulse">
                {globalSpeedLabel}
              </p>
            </div>

            {/* Pro Tip Card */}
            <div className="glass-card rounded-xl p-6 border-l-4 border-secondary space-y-2">
              <h4 className="font-sans font-bold text-xs text-secondary mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Bolt className="w-4 h-4 fill-current text-secondary" />
                Pro Tip
              </h4>
              <p className="font-sans text-xs text-on-surface leading-normal">
                Enable &ldquo;Multi-thread Processing&rdquo; in settings to increase download speeds by up to 3x on fiber connections.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* History / Recently Completed rolls */}
      <section className="pt-8 space-y-6">
        <h3 className="font-display text-xl font-bold text-on-surface">Recently Completed</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentCompleted.map((item) => (
            <div 
              key={item.id} 
              className="glass-card p-4 rounded-xl flex items-center gap-4 border border-white/5 hover:border-secondary/30 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-900 relative">
                {item.thumbnailUrl ? (
                  <img 
                    src={item.thumbnailUrl} 
                    alt="Completed thumbnail" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container">
                    <Music className="w-6 h-6 text-primary" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary fill-black/60" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <h4 className="font-sans font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-on-surface-variant/80 font-medium mt-1">
                  {item.dateString} &bull; {item.size}
                </p>
              </div>

              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-secondary/10 text-secondary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
