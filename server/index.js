import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { matchPlatform, SUPPORTED_PLATFORMS, supportedPlatformsHint } from './platforms.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });
const PORT = Number(process.env.PORT || 3001);
const JOBS_DIR = process.env.JOBS_DIR || path.join(__dirname, '../.data/jobs');
const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';
const COOKIES_FILE = process.env.YTDLP_COOKIES_FILE || '';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

/** @type {Map<string, object>} */
const jobs = new Map();

/** @type {Map<string, Set<import('http').ServerResponse>>} */
const jobStreams = new Map();

await fsp.mkdir(JOBS_DIR, { recursive: true });

function jobStatusPayload(job) {
  return {
    id: job.id,
    status: job.status,
    progress: Number(job.progress) || 0,
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
    speedLabel: job.speedLabel || '—',
    etaSeconds: job.etaSeconds ?? null,
    downloadedLabel: job.downloadedLabel || job.size,
  };
}

function broadcastJob(job) {
  const subs = jobStreams.get(job.id);
  if (!subs?.size) return;
  const line = `data: ${JSON.stringify(jobStatusPayload(job))}\n\n`;
  for (const res of subs) {
    try {
      res.write(line);
    } catch {
      subs.delete(res);
    }
  }
}

function applyJobProgress(job, u) {
  if (u.progress != null) {
    job.progress = Math.max(job.progress || 0, Math.min(99, u.progress));
  }
  if (u.speedLabel) job.speedLabel = u.speedLabel;
  if (u.downloadedLabel) {
    job.size = u.downloadedLabel;
    job.downloadedLabel = u.downloadedLabel;
  }
  if (u.totalSize) job.totalSize = u.totalSize;
  if (u.etaSeconds != null) job.etaSeconds = u.etaSeconds;
  if (job.status === 'pending') job.status = 'downloading';
  broadcastJob(job);
}

function parseMaxHeight(quality) {
  const q = String(quality || '').toUpperCase();
  if (q.includes('4K') || q.includes('2160') || q.includes('ULTRA')) return 2160;
  if (q.includes('1440') || q.includes('QHD')) return 1440;
  if (q.includes('720')) return 720;
  if (q.includes('480')) return 480;
  return 1080;
}

/** Ordered yt-dlp format attempts (retried when a format is unavailable). */
function formatAttempts(type, quality) {
  if (type === 'audio') {
    return [
      ['-f', 'ba/b/bestaudio[ext=m4a]/bestaudio/best/b', '-x', '--audio-format', 'mp3', '--audio-quality', '0'],
      ['-f', 'best/b', '-x', '--audio-format', 'mp3', '--audio-quality', '0'],
      ['-f', 'b', '-x', '--audio-format', 'mp3'],
    ];
  }
  const height = parseMaxHeight(quality);
  const videoMerge = ['--merge-output-format', 'mp4'];
  return [
    [
      '-f',
      [
        `bestvideo[height<=${height}]+bestaudio`,
        `best[height<=${height}]`,
        'bestvideo+bestaudio',
        'best',
      ].join('/'),
      ...videoMerge,
    ],
    ['-f', 'bestvideo+bestaudio/best', ...videoMerge],
    ['-f', 'best', ...videoMerge],
  ];
}

function isFormatUnavailableError(message) {
  const msg = message || '';
  return msg.includes('format is not available') || msg.includes('Requested format is not available');
}

function parseYtDlpProgress(text) {
  const updates = {};
  const line = text.trim();
  if (!line.includes('[download]') || !line.includes('%')) return updates;

  const pct = line.match(/(\d+\.?\d*)%/);
  if (pct) updates.progress = Math.min(99, parseFloat(pct[1]));

  const speed = line.match(/at\s+([\d.]+\s*(?:KiB|MiB|GiB|B)\/s|Unknown\s+B\/s)/i);
  if (speed) {
    const label = speed[1].trim();
    updates.speedLabel = /unknown/i.test(label) ? 'Measuring…' : label;
  }

  const total = line.match(/of\s+(?:~\s*)?([\d.]+\s*(?:KiB|MiB|GiB))/i);
  if (total) {
    updates.totalSize = total[1].trim();
    updates.downloadedLabel = total[1].trim();
  }

  const eta = line.match(/ETA\s+(\d{1,2}):(\d{2})/);
  if (eta) updates.etaSeconds = parseInt(eta[1], 10) * 60 + parseInt(eta[2], 10);

  return updates;
}

function feedYtDlpOutput(chunk, onProgress, acc) {
  acc.buffer += chunk;
  const parts = acc.buffer.split(/\r|\n/);
  acc.buffer = parts.pop() || '';
  for (const part of parts) {
    const line = part.trim();
    if (!line) continue;
    const u = parseYtDlpProgress(line);
    if (Object.keys(u).length && onProgress) onProgress(u);
  }
}

function runYtDlp(args, onProgress) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const acc = { buffer: '' };

    const onChunk = (chunk, isErr) => {
      const text = chunk.toString();
      if (isErr) stderr += text;
      else stdout += text;
      feedYtDlpOutput(text, onProgress, acc);
    };

    proc.stdout?.on('data', (c) => onChunk(c, false));
    proc.stderr?.on('data', (c) => onChunk(c, true));

    proc.on('error', (err) => reject(err));
    proc.on('close', (code) => {
      if (acc.buffer.trim()) feedYtDlpOutput(`${acc.buffer}\n`, onProgress, { buffer: '' });
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error((stderr || stdout).slice(-800) || `yt-dlp exited ${code}`));
    });
  });
}

function buildYtDlpArgs(url, extraArgs) {
  const platform = matchPlatform(url);
  const args = [
    '--no-playlist',
    '--no-warnings',
    '--newline',
    '--progress',
    '--extractor-retries',
    '3',
    '--socket-timeout',
    '30',
    '--geo-bypass',
    ...extraArgs,
  ];

  if (platform === 'instagram') {
    args.push('--add-header', 'Referer:https://www.instagram.com/');
  }
  if (platform === 'facebook') {
    args.push('--add-header', 'Referer:https://www.facebook.com/');
  }
  if (platform === 'tiktok') {
    args.push('--add-header', 'Referer:https://www.tiktok.com/');
  }
  if (platform === 'youtube') {
    args.push('--extractor-args', 'youtube:player_client=android,web,mweb');
  }

  if (COOKIES_FILE && fs.existsSync(COOKIES_FILE)) {
    args.push('--cookies', COOKIES_FILE);
  }

  args.push(url);
  return args;
}

async function fetchMeta(url) {
  const { stdout } = await runYtDlp(
    buildYtDlpArgs(url, ['--dump-single-json', '--no-download'])
  );
  return JSON.parse(stdout.trim().split('\n').pop());
}

function friendlyError(platform, raw, type = 'video') {
  const msg = raw || '';
  if (platform === 'youtube' && (msg.includes('not a bot') || msg.includes('Sign in'))) {
    return 'YouTube blocked this server (bot check). Upload browser cookies to the server (cookies.txt) or try Instagram/TikTok/Vimeo links.';
  }
  if (isFormatUnavailableError(msg)) {
    if (type === 'audio') {
      return 'Could not extract audio from this link. Try another video or a different platform (Vimeo/TikTok often work).';
    }
    return 'That video quality is not available. Try 720P or switch to Audio only.';
  }
  if (
    (platform === 'instagram' || platform === 'facebook') &&
    (msg.includes('login') || msg.includes('cookie') || msg.includes('Private'))
  ) {
    return `${msg.slice(0, 200)} — Tip: Instagram/Facebook often need a cookies.txt file on the server (ask support).`;
  }
  return msg.slice(0, 500);
}

async function runJob(job) {
  const jobDir = path.join(JOBS_DIR, job.id);
  await fsp.mkdir(jobDir, { recursive: true });
  const outTemplate = path.join(jobDir, '%(title).200B.%(ext)s');

  job.status = 'downloading';
  job.progress = 0;
  job.speedLabel = 'Starting…';
  broadcastJob(job);

  try {
    const attempts = formatAttempts(job.type, job.quality);
    let lastErr = null;
    for (const formatArgs of attempts) {
      try {
        const args = buildYtDlpArgs(job.url, ['-o', outTemplate, ...formatArgs]);
    await runYtDlp(args, (u) => applyJobProgress(job, u));
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        if (!isFormatUnavailableError(err.message)) throw err;
      }
    }
    if (lastErr) throw lastErr;

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
    job.speedLabel = 'Done';
    broadcastJob(job);
  } catch (err) {
    job.status = 'error';
    job.error = friendlyError(job.platform, err.message || String(err), job.type);
    broadcastJob(job);
  }
}

function formatBytes(n) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

app.get('/api/platforms', (_req, res) => {
  res.json({ platforms: SUPPORTED_PLATFORMS });
});

app.get('/api/health', async (_req, res) => {
  try {
    const { stdout } = await runYtDlp(['--version']);
    res.json({
      ok: true,
      ytdlp: true,
      version: stdout.trim(),
      platforms: SUPPORTED_PLATFORMS.map((p) => p.id),
      cookiesConfigured: Boolean(COOKIES_FILE && fs.existsSync(COOKIES_FILE)),
    });
  } catch {
    res.status(503).json({ ok: false, ytdlp: false, message: 'yt-dlp not installed on server' });
  }
});

app.post('/api/jobs', async (req, res) => {
  const { url, type = 'video', quality = '1080P' } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const trimmed = url.trim();
  const platform = matchPlatform(trimmed);
  if (!platform) {
    return res.status(400).json({
      error: `This link is not from a supported site. Supported: ${supportedPlatformsHint()}`,
    });
  }

  const id = randomUUID();
  const job = {
    id,
    url: trimmed,
    type: type === 'audio' ? 'audio' : 'video',
    quality,
    status: 'pending',
    progress: 0,
    title: 'Preparing download…',
    platform,
    thumbnailUrl: '',
    filename: null,
    filePath: null,
    error: null,
    totalSize: '—',
    size: '0 B',
    speedLabel: '—',
    etaSeconds: null,
    downloadedLabel: '0 B',
  };

  jobs.set(id, job);

  res.json({
    jobId: id,
    title: job.title,
    thumbnailUrl: job.thumbnailUrl,
    platform: job.platform,
    duration: job.duration,
  });

  fetchMeta(job.url)
    .then((meta) => {
      job.title = meta.title || job.title;
      job.thumbnailUrl = meta.thumbnail || meta.thumbnails?.[0]?.url || '';
      if (meta.duration) {
        const m = Math.floor(meta.duration / 60);
        const s = Math.floor(meta.duration % 60);
        job.duration = `${m}:${String(s).padStart(2, '0')}`;
      }
      broadcastJob(job);
    })
    .catch(() => {
      if (job.title === 'Preparing download…') job.title = 'Media download';
      broadcastJob(job);
    });

  runJob(job).catch(() => undefined);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(jobStatusPayload(job));
});

app.get('/api/jobs/:id/stream', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  if (!jobStreams.has(job.id)) jobStreams.set(job.id, new Set());
  jobStreams.get(job.id).add(res);

  res.write(`data: ${JSON.stringify(jobStatusPayload(job))}\n\n`);

  req.on('close', () => {
    jobStreams.get(job.id)?.delete(res);
    if (jobStreams.get(job.id)?.size === 0) jobStreams.delete(job.id);
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
