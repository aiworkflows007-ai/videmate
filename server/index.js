import express from 'express';
import cors from 'cors';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const JOBS_DIR = process.env.JOBS_DIR || path.join(__dirname, '../.data/jobs');
const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

/** @type {Map<string, object>} */
const jobs = new Map();

await fsp.mkdir(JOBS_DIR, { recursive: true });

function formatSelector(type, quality) {
  if (type === 'audio') {
    return ['-x', '--audio-format', 'mp3', '-f', 'bestaudio/best'];
  }
  const height =
    quality === '4K' ? 2160 : quality === '720P' ? 720 : quality === '1080P' ? 1080 : 1080;
  return ['-f', `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`];
}

function runYtDlp(args, onProgress) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      const m = text.match(/\[download\]\s+(\d+\.?\d*)%/);
      if (m && onProgress) onProgress(parseFloat(m[1]));
    });
    proc.on('error', (err) => reject(err));
    proc.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error((stderr || stdout).slice(-800) || `yt-dlp exited ${code}`));
    });
  });
}

async function fetchMeta(url) {
  const { stdout } = await runYtDlp(['--dump-single-json', '--no-download', '--no-warnings', url]);
  return JSON.parse(stdout.trim().split('\n').pop());
}

function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes('youtube') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('instagram')) return 'instagram';
  if (u.includes('tiktok')) return 'tiktok';
  if (u.includes('twitter') || u.includes('x.com')) return 'twitter';
  if (u.includes('facebook') || u.includes('fb.watch')) return 'facebook';
  if (u.includes('vimeo')) return 'vimeo';
  return 'other';
}

async function runJob(job) {
  const jobDir = path.join(JOBS_DIR, job.id);
  await fsp.mkdir(jobDir, { recursive: true });
  const outTemplate = path.join(jobDir, '%(title).200B.%(ext)s');

  job.status = 'downloading';
  job.progress = 0;

  try {
    const formatArgs = formatSelector(job.type, job.quality);
    const args = [
      '--no-playlist',
      '--no-warnings',
      '-o',
      outTemplate,
      ...formatArgs,
      ...(job.type === 'video' ? ['--merge-output-format', 'mp4'] : []),
      job.url,
    ];
    await runYtDlp(args, (pct) => {
      job.progress = Math.min(99, pct);
    });

    const files = await fsp.readdir(jobDir);
    const media = files.find((f) => !f.endsWith('.part') && !f.endsWith('.json'));
    if (!media) throw new Error('Download finished but file not found');

    const filePath = path.join(jobDir, media);
    const stat = await fsp.stat(filePath);
    job.status = 'ready';
    job.progress = 100;
    job.filename = media;
    job.filePath = filePath;
    job.totalSize = formatBytes(stat.size);
    job.size = job.totalSize;
  } catch (err) {
    job.status = 'error';
    job.error = err.message || String(err);
  }
}

function formatBytes(n) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

app.get('/api/health', async (_req, res) => {
  try {
    const { stdout } = await runYtDlp(['--version']);
    res.json({ ok: true, ytdlp: true, version: stdout.trim() });
  } catch {
    res.status(503).json({ ok: false, ytdlp: false, message: 'yt-dlp not installed on server' });
  }
});

app.post('/api/jobs', async (req, res) => {
  const { url, type = 'video', quality = '1080P' } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const id = randomUUID();
  const job = {
    id,
    url: url.trim(),
    type: type === 'audio' ? 'audio' : 'video',
    quality,
    status: 'pending',
    progress: 0,
    title: 'Preparing download…',
    platform: detectPlatform(url),
    thumbnailUrl: '',
    filename: null,
    filePath: null,
    error: null,
    totalSize: '—',
    size: '0 MB',
  };

  jobs.set(id, job);

  try {
    const meta = await fetchMeta(job.url);
    job.title = meta.title || job.title;
    job.thumbnailUrl = meta.thumbnail || meta.thumbnails?.[0]?.url || '';
    if (meta.duration) {
      const m = Math.floor(meta.duration / 60);
      const s = Math.floor(meta.duration % 60);
      job.duration = `${m}:${String(s).padStart(2, '0')}`;
    }
  } catch {
    job.title = 'Media download';
  }

  res.json({
    jobId: id,
    title: job.title,
    thumbnailUrl: job.thumbnailUrl,
    platform: job.platform,
    duration: job.duration,
  });

  runJob(job);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    title: job.title,
    thumbnailUrl: job.thumbnailUrl,
    platform: job.platform,
    type: job.type,
    quality: job.quality,
    totalSize: job.totalSize,
    size: job.size,
    filename: job.filename,
    error: job.error,
    duration: job.duration,
  });
});

app.get('/api/jobs/:id/file', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job || job.status !== 'ready' || !job.filePath) {
    return res.status(404).json({ error: 'File not ready' });
  }
  res.download(job.filePath, job.filename, async (err) => {
    if (err) return;
    try {
      await fsp.rm(path.join(JOBS_DIR, job.id), { recursive: true, force: true });
      jobs.delete(job.id);
    } catch {
      /* ignore cleanup errors */
    }
  });
});

app.delete('/api/jobs/:id', async (req, res) => {
  const job = jobs.get(req.params.id);
  if (job) {
    try {
      await fsp.rm(path.join(JOBS_DIR, job.id), { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    jobs.delete(job.id);
  }
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Vidmate API listening on http://127.0.0.1:${PORT}`);
});
