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

export interface ActiveTask {
  id: string;
  title: string;
  size: string;
  totalSize: string;
  progress: number;
  speed: number; // in MB/s
  remainingSeconds: number;
  isPaused: boolean;
  quality: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'vimeo' | 'other';
  type: 'video' | 'audio';
  thumbnailUrl: string;
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
