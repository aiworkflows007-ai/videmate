import React, { useState } from 'react';
import {
  Link2,
  Youtube,
  Instagram,
  Music,
  Twitter,
  Facebook,
  Video,
  Bolt,
  Tv,
  ShieldCheck,
  Sparkles,
  Download,
  ClipboardPaste,
  Zap,
  Layers,
  ArrowRight,
  Play,
  Headphones,
  X,
} from 'lucide-react';
import { SUPPORTED_PLATFORMS } from '../data';
import { AdSenseSlot } from './AdSenseSlot';
import { ADSENSE_SLOTS } from '../config/site';

interface HomeViewProps {
  onStartDownload: (url: string, quality: string, type: 'video' | 'audio') => void;
}

const HERO_STATS = [
  { label: 'Max quality', value: '8K HDR', icon: Tv },
  { label: 'Platforms', value: '6+', icon: Layers },
  { label: 'Avg. speed', value: '12 MB/s', icon: Zap },
] as const;

const STEPS = [
  { step: '01', title: 'Paste link', desc: 'Drop any public video or reel URL from a supported host.' },
  { step: '02', title: 'Pick format', desc: 'Choose video resolution or extract crisp MP3 audio.' },
  { step: '03', title: 'Save locally', desc: 'Track progress live, then find files in your library.' },
] as const;

export function HomeView({ onStartDownload }: HomeViewProps) {
  const [url, setUrl] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080P');
  const [selectedType, setSelectedType] = useState<'video' | 'audio'>('video');
  const [errorMessage, setErrorMessage] = useState('');
  const [quickType, setQuickType] = useState<'video' | 'audio'>('video');

  const handlePlatformClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setErrorMessage('');
  };

  const handleDownloadClick = () => {
    if (!url.trim()) {
      setErrorMessage('Paste a video or reel link to get started.');
      return;
    }
    setErrorMessage('');
    setSelectedType(quickType);
    setSelectedQuality(quickType === 'video' ? '1080P' : 'MP3');
    setShowConfigModal(true);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setUrl(text.trim());
        setErrorMessage('');
      }
    } catch {
      setErrorMessage('Allow clipboard access or paste manually (Ctrl+V).');
    }
  };

  const confirmDownload = () => {
    onStartDownload(url, selectedQuality, selectedType);
    setUrl('');
    setShowConfigModal(false);
  };

  const getPlatformIcon = (iconName: string) => {
    switch (iconName) {
      case 'Youtube':
        return <Youtube className="w-7 h-7 opacity-80 group-hover:opacity-100 group-hover:text-brand-red transition-all" />;
      case 'Instagram':
        return <Instagram className="w-7 h-7 opacity-80 group-hover:opacity-100 group-hover:text-pink-400 transition-all" />;
      case 'Music':
        return <Music className="w-7 h-7 opacity-80 group-hover:opacity-100 group-hover:text-glow-blue transition-all" />;
      case 'TwitterIcon':
        return <Twitter className="w-7 h-7 opacity-80 group-hover:opacity-100 group-hover:text-white transition-all" />;
      case 'Facebook':
        return <Facebook className="w-7 h-7 opacity-80 group-hover:opacity-100 group-hover:text-blue-400 transition-all" />;
      default:
        return <Video className="w-7 h-7 opacity-80 group-hover:opacity-100 group-hover:text-glow-blue transition-all" />;
    }
  };

  return (
    <div className="space-y-20 md:space-y-28 pb-8">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 hero-grid pointer-events-none -top-12" aria-hidden />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,640px)] h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none opacity-50" aria-hidden />

        <div className="relative flex flex-col items-center text-center max-w-4xl mx-auto pt-4 md:pt-10">
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 border border-white/15 rounded-full bg-white/5 backdrop-blur-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70">
              Multi-platform · No account required
            </span>
          </div>

          <h2 className="animate-fade-in-delay-1 font-display text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-4">
            <span className="block text-white uppercase">Download any</span>
            <span className="block text-gradient-hero uppercase mt-1">video in seconds</span>
          </h2>

          <p className="animate-fade-in-delay-2 font-sans text-sm md:text-base text-on-surface-variant max-w-xl leading-relaxed mb-10 px-2">
            Paste a link from YouTube, Instagram, TikTok, and more. Choose quality, track progress, and
            build your personal media library — all in one sleek dashboard.
          </p>

          {/* Format quick pick */}
          <div className="animate-fade-in-delay-2 flex gap-2 mb-4 p-1 rounded-full bg-surface-container border border-white/10">
            <button
              type="button"
              onClick={() => setQuickType('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                quickType === 'video'
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,43,255,0.35)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Video
            </button>
            <button
              type="button"
              onClick={() => setQuickType('audio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                quickType === 'audio'
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,43,255,0.35)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              Audio only
            </button>
          </div>

          {/* URL input */}
          <div className="animate-fade-in-delay-3 w-full max-w-2xl">
            <div className="relative group rounded-2xl p-[1px] bg-gradient-to-r from-primary/40 via-white/10 to-secondary/40 shadow-[0_0_40px_rgba(0,43,255,0.12)]">
              <div className="rounded-2xl bg-surface-container/95 backdrop-blur-xl p-2 md:p-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                  <div className="flex-1 flex items-center gap-3 px-3 py-2 min-h-[52px]">
                    <Link2 className="text-secondary w-5 h-5 shrink-0" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleDownloadClick()}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full bg-transparent border-none focus:outline-none text-white font-sans text-sm md:text-base placeholder:text-white/30"
                      aria-label="Media URL"
                    />
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-semibold text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors shrink-0"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      Paste
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadClick}
                    className="btn-shimmer flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-sans font-bold text-sm uppercase tracking-wide active:scale-[0.98] transition-transform shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download
                    <ArrowRight className="w-4 h-4 opacity-80" />
                  </button>
                </div>
              </div>
            </div>
            {errorMessage && (
              <p className="text-error font-sans text-sm mt-3 text-center" role="alert">
                {errorMessage}
              </p>
            )}
            <p className="text-[11px] text-on-surface-variant/60 mt-3 font-medium">
              Free for personal use · Files stay on your device
            </p>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-delay-3 grid grid-cols-3 gap-3 md:gap-6 w-full max-w-lg mt-12">
            {HERO_STATS.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="glass-card glass-card-hover rounded-xl px-3 py-4 md:px-5 md:py-5 text-center transition-all"
              >
                <Icon className="w-4 h-4 text-secondary mx-auto mb-2 opacity-90" />
                <p className="font-display text-lg md:text-xl font-black text-white">{value}</p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <AdSenseSlot
            slotId={ADSENSE_SLOTS.homeBanner}
            format="horizontal"
            className="mt-10 max-w-2xl mx-auto"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.35em] font-bold text-secondary">Workflow</span>
          <h3 className="font-display text-2xl md:text-3xl font-black text-white mt-2">How it works</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {STEPS.map(({ step, title, desc }, i) => (
            <div
              key={step}
              className="glass-card glass-card-hover rounded-2xl p-6 md:p-8 relative overflow-hidden group"
            >
              <span className="font-display text-5xl font-black text-white/[0.06] absolute top-4 right-5 group-hover:text-primary/10 transition-colors">
                {step}
              </span>
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm mb-4">
                {i + 1}
              </div>
              <h4 className="font-display text-lg font-bold text-white mb-2">{title}</h4>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">{desc}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="space-y-8">
        <div className="text-center">
          <h3 className="font-display text-xl md:text-2xl font-black text-white">Works with your favorite sites</h3>
          <p className="font-sans text-sm text-on-surface-variant mt-2">Tap a platform to try a sample link</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SUPPORTED_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => handlePlatformClick(platform.exampleUrl)}
              className="glass-card glass-card-hover flex flex-col items-center justify-center p-5 md:p-6 rounded-2xl active:scale-[0.97] transition-all duration-300 group text-left"
              style={{ ['--platform-glow' as string]: platform.color }}
            >
              <div
                className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all group-hover:shadow-[0_0_24px_color-mix(in_srgb,var(--platform-glow)_35%,transparent)]"
              >
                {getPlatformIcon(platform.icon)}
              </div>
              <span className="font-sans font-semibold text-sm text-on-surface group-hover:text-white transition-colors">
                {platform.name}
              </span>
              <span className="text-[10px] text-on-surface-variant/50 mt-1">Sample URL</span>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-[0.35em] font-bold text-primary">Why Vidmate</span>
          <h3 className="font-display text-2xl md:text-3xl font-black text-white mt-2">Built for speed and privacy</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card glass-card-hover p-8 rounded-2xl md:col-span-2 flex flex-col justify-end min-h-[240px] relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-white/[0.04] group-hover:text-primary/10 transition-all duration-500 animate-float">
              <Bolt className="w-32 h-32 md:w-40 md:h-40" />
            </div>
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary">Performance</span>
              <h4 className="font-display text-2xl md:text-3xl font-black text-white">Blazing fast downloads</h4>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed max-w-lg">
                Parallel chunks use your full bandwidth so large 4K files finish while you browse the rest of your library.
              </p>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col justify-between min-h-[240px] bg-gradient-to-br from-primary/10 to-transparent">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
              <Tv className="w-5 h-5" />
            </div>
            <div className="space-y-2 mt-6">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Quality</span>
              <h4 className="font-display text-xl font-black text-white">Up to 8K & HDR</h4>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Pick the resolution that fits your screen — no surprise re-encoding.
              </p>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col justify-between min-h-[220px]">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-2 mt-6">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary">Privacy</span>
              <h4 className="font-display text-xl font-black text-white">Local & private</h4>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                No cloud uploads. Your links and files never leave your machine.
              </p>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-6 md:p-8 rounded-2xl md:col-span-2 flex flex-col md:flex-row gap-6 md:gap-10 items-center bg-gradient-to-r from-secondary/5 via-transparent to-primary/5 group">
            <div className="w-full md:w-[42%] aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS4dD0EuIAZ9yoJFZ8RJg1FSMP4gWz7TYCKUgNK9uVnrqA-u7IPxgQfD7kMG9fwQQqRqgKZsxLldL3AvMIDzNtFzP9kocD-CbYUw_K6JGT6_TYrXY_iC-IuajtuCfVbJGKO2q_8J93dUfO-BIzY248hV6faf7yGAmgZ1WIwyqe1YP7JCCfhEtP2QX2w8DM8cEiJNbDL4gOFfiFfOd3PtzbfdLx-E8oPVgDngN-BcWyPcjfjSmM7IDzoJvwLj2r4ksBvqhPfsEs8SM"
                alt="Vidmate library dashboard preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
            <div className="space-y-2 text-left flex-1">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Library</span>
              <h4 className="font-display text-2xl font-black text-white">Smart media library</h4>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Auto-sort by platform, date, and format. Delete, replay, and manage everything from one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="max-w-3xl mx-auto">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 via-surface-container to-secondary/10 p-8 md:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,43,255,0.2),transparent_50%)] pointer-events-none" />
          <Sparkles className="w-8 h-8 text-secondary mx-auto mb-4 relative" />
          <h4 className="font-display text-xl md:text-2xl font-black text-white relative">Ready to save your first clip?</h4>
          <p className="font-sans text-sm text-on-surface-variant mt-2 mb-6 relative max-w-md mx-auto">
            Paste a link above or tap any platform card to load a demo URL.
          </p>
          <button
            type="button"
            onClick={() => document.querySelector<HTMLInputElement>('input[type="url"]')?.focus()}
            className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-surface font-bold text-sm hover:bg-white/90 transition-colors active:scale-95"
          >
            Go to download bar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Config modal */}
      {showConfigModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="download-modal-title"
        >
          <div className="glass-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 sm:p-7 relative shadow-2xl border border-white/15 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 id="download-modal-title" className="font-display text-xl font-bold text-white mb-1 flex items-center gap-2 pr-10">
              <Sparkles className="text-secondary w-5 h-5 shrink-0" />
              Download settings
            </h3>
            <p className="font-sans text-sm text-on-surface-variant mb-6">
              Confirm format and quality before starting.
            </p>

            <div className="space-y-5">
              <div>
                <label className="font-sans text-xs text-on-surface-variant uppercase tracking-wider block mb-2">
                  Format
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType('video');
                      setSelectedQuality('1080P');
                    }}
                    className={`font-sans text-sm py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      selectedType === 'video'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    Video
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType('audio');
                      setSelectedQuality('MP3');
                    }}
                    className={`font-sans text-sm py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      selectedType === 'audio'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Headphones className="w-4 h-4" />
                    Audio
                  </button>
                </div>
              </div>

              {selectedType === 'video' ? (
                <div>
                  <label className="font-sans text-xs text-on-surface-variant uppercase tracking-wider block mb-2">
                    Resolution
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['4K', '1080P', '720P'].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setSelectedQuality(q)}
                        className={`font-sans text-xs py-3 rounded-xl border font-semibold transition-all ${
                          selectedQuality === q
                            ? 'border-secondary bg-secondary/15 text-secondary'
                            : 'border-white/10 text-on-surface-variant hover:bg-white/5'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-sans text-xs text-on-surface-variant uppercase tracking-wider block mb-2">
                    Audio quality
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['320kbps MP3', 'Hi-Res Lossless'].map((ab) => (
                      <button
                        key={ab}
                        type="button"
                        onClick={() => setSelectedQuality(ab)}
                        className={`font-sans text-xs py-3 rounded-xl border font-semibold transition-all ${
                          selectedQuality === ab
                            ? 'border-secondary bg-secondary/15 text-secondary'
                            : 'border-white/10 text-on-surface-variant hover:bg-white/5'
                        }`}
                      >
                        {ab}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Source URL</span>
                <p className="text-xs text-on-surface-variant mt-1 break-all line-clamp-2">{url}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 font-sans text-sm py-3.5 rounded-xl hover:bg-white/5 border border-white/10 text-on-surface font-semibold transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDownload}
                className="flex-1 font-sans text-sm py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/25 hover:opacity-95 transition-all active:scale-[0.98]"
              >
                Start download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
