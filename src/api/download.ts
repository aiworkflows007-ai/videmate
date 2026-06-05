import { ActiveTask } from '../types';

const API = '/api';

export interface CreateJobResponse {
  jobId: string;
  title: string;
  thumbnailUrl?: string;
  platform?: ActiveTask['platform'];
  duration?: string;
}

export interface JobStatusResponse {
  id: string;
  status: 'pending' | 'downloading' | 'ready' | 'error';
  progress: number;
  title: string;
  thumbnailUrl?: string;
  platform?: ActiveTask['platform'];
  type: 'video' | 'audio';
  quality: string;
  totalSize: string;
  size: string;
  filename?: string;
  error?: string;
  duration?: string;
  speedLabel?: string;
  etaSeconds?: number | null;
  downloadedLabel?: string;
}

export async function createDownloadJob(
  url: string,
  quality: string,
  type: 'video' | 'audio'
): Promise<CreateJobResponse> {
  const res = await fetch(`${API}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, quality, type }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Server error (${res.status})`);
  }
  return data;
}

/** Live progress via Server-Sent Events (updates on every yt-dlp progress line). */
export function subscribeToJobStream(
  jobId: string,
  onStatus: (status: JobStatusResponse) => void
): () => void {
  const es = new EventSource(`${API}/jobs/${jobId}/stream`);
  es.onmessage = (event) => {
    try {
      onStatus(JSON.parse(event.data) as JobStatusResponse);
    } catch {
      /* ignore malformed events */
    }
  };
  return () => es.close();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API}/jobs/${jobId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to get status');
  return data;
}

/** Saves file to the user's device (Downloads folder). */
export async function saveJobFileToDevice(jobId: string, filename: string): Promise<void> {
  const res = await fetch(`${API}/jobs/${jobId}/file`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Download failed');
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename || 'download';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function cancelJob(jobId: string): Promise<void> {
  await fetch(`${API}/jobs/${jobId}`, { method: 'DELETE' });
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    return res.ok && data.ok === true;
  } catch {
    return false;
  }
}
