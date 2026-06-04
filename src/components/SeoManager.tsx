import { useEffect } from 'react';
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  googleSiteVerification,
} from '../config/site';

export type SeoPage = 'home' | 'privacy' | 'terms';

const PAGE_META: Record<SeoPage, { title: string; description: string; path: string }> = {
  home: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    path: '/',
  },
  privacy: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `Privacy policy for ${SITE_NAME}. How we handle data, cookies, and Google AdSense on our video downloader.`,
    path: '/privacy',
  },
  terms: {
    title: `Terms of Service | ${SITE_NAME}`,
    description: `Terms of use for ${SITE_NAME}. User responsibilities, acceptable use, and copyright notice.`,
    path: '/terms',
  },
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

interface SeoManagerProps {
  page: SeoPage;
}

export function SeoManager({ page }: SeoManagerProps) {
  useEffect(() => {
    const meta = PAGE_META[page];
    const canonical = SITE_URL ? `${SITE_URL}${meta.path}` : meta.path;

    document.title = meta.title;
    document.documentElement.lang = 'en';

    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'keywords', SITE_KEYWORDS);
    upsertMeta('name', 'robots', 'index, follow');
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);

    if (googleSiteVerification) {
      upsertMeta('name', 'google-site-verification', googleSiteVerification);
    }

    upsertLink('canonical', canonical);

    if (page === 'home' && SITE_URL) {
      upsertJsonLd('vidmate-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      });
    }
  }, [page]);

  return null;
}
