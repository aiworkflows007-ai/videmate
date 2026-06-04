/** Platforms shown on the website — yt-dlp handles these extractors. */
export const SUPPORTED_PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    hosts: ['youtube.com', 'youtu.be', 'm.youtube.com', 'music.youtube.com'],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    hosts: ['instagram.com', 'instagr.am'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    hosts: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    hosts: ['twitter.com', 'x.com', 'mobile.twitter.com'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    hosts: ['facebook.com', 'fb.watch', 'fb.com', 'm.facebook.com', 'web.facebook.com'],
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    hosts: ['vimeo.com', 'player.vimeo.com'],
  },
];

export function matchPlatform(urlString) {
  let hostname = '';
  try {
    hostname = new URL(urlString.trim()).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }

  for (const platform of SUPPORTED_PLATFORMS) {
    const hit = platform.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
    if (hit) return platform.id;
  }
  return null;
}

export function supportedPlatformsHint() {
  return SUPPORTED_PLATFORMS.map((p) => p.name).join(', ');
}
