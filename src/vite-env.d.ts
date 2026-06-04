/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_ADSENSE_CLIENT: string;
  readonly VITE_ADSENSE_SLOT_HOME: string;
  readonly VITE_ADSENSE_SLOT_SIDEBAR: string;
  readonly VITE_GOOGLE_SITE_VERIFICATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  adsbygoogle?: Record<string, unknown>[];
}
