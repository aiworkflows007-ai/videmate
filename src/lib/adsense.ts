import { ADSENSE_CLIENT, isAdSenseEnabled } from '../config/site';

let scriptLoaded = false;

/** Loads the AdSense script once (production / when client ID is set). */
export function initAdSense(): void {
  if (!isAdSenseEnabled || scriptLoaded || typeof document === 'undefined') return;

  const existing = document.querySelector('script[data-adsense-client]');
  if (existing) {
    scriptLoaded = true;
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-adsense-client', ADSENSE_CLIENT);
  document.head.appendChild(script);
  scriptLoaded = true;
}

/** Pushes a new ad slot render (call after <ins> is in the DOM). */
export function pushAdSlot(): void {
  if (!isAdSenseEnabled) return;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    /* Ad blockers or script not ready */
  }
}
