/** Public site config — set values in .env.local (see .env.example). */

export const SITE_NAME = 'Vidmate';
export const SITE_TAGLINE = 'Premium Media Downloader';
export const SITE_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

/** Production URL with no trailing slash, e.g. https://vidmate.example.com */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || '';

export const SITE_DESCRIPTION =
  'Download videos and audio from YouTube, Instagram, TikTok, Twitter, Facebook, and Vimeo. Fast, private, and free for personal use.';

export const SITE_KEYWORDS =
  'video downloader, youtube downloader, instagram video download, tiktok downloader, save video online, mp3 extractor, vidmate';

/** Google AdSense publisher ID: ca-pub-XXXXXXXXXXXXXXXX */
export const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined)?.trim() || '';

/** Optional ad unit slot IDs from AdSense → Ads → By ad unit */
export const ADSENSE_SLOTS = {
  homeBanner: (import.meta.env.VITE_ADSENSE_SLOT_HOME as string | undefined)?.trim() || '',
  sidebar: (import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR as string | undefined)?.trim() || '',
} as const;

export const isAdSenseEnabled = Boolean(ADSENSE_CLIENT);

export const googleSiteVerification =
  (import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string | undefined)?.trim() || '';
