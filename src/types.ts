export interface LibraryItem {
  id: string;
  title: string;
  type: 'video' | 'audio';
  size: string;
  duration: string;
  dateString: string;
  quality: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'vimeo' | 'other';
  thumbnailUrl: string;
  category: string;
}

export type ActiveTaskStatus = 'pending' | 'downloading' | 'ready' | 'error' | 'completed';

export interface ActiveTask {
  id: string;
  /** Server job id when using real downloads */
  jobId?: string;
  sourceUrl?: string;
  status?: ActiveTaskStatus;
  errorMessage?: string;
  title: string;
  size: string;
  totalSize: string;
  progress: number;
  speed: number;
  /** Live label from yt-dlp e.g. "2.5 MiB/s" */
  speedLabel?: string;
  remainingSeconds: number;
  isPaused: boolean;
  quality: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'vimeo' | 'other';
  type: 'video' | 'audio';
  thumbnailUrl: string;
  duration?: string;
  filename?: string;
}

export interface AppSettings {
  darkMode: boolean;
  glassEffects: boolean;
  downloadQuality: string;
  storagePath: string;
  maxDownloads: number;
  systemStorageUsed: number;
  systemStorageTotal: number;
}
