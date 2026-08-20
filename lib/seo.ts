import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  SITE_URL,
  SITE_NAME,
  LOCALES,
  DEFAULT_LOCALE,
  OG_LOCALE,
  getSeo,
  pageUrl,
  isProductionHost,
  type PageKey,
} from '@/lib/site';

/**
 * Determine the current request host. Used to keep staging (non-corpand.ad)
 * non-indexable while NEVER shipping a global noindex to production.
 */
function getRequestHost(): string | null {
  try {
    const h = headers();
    return h.get('x-forwarded-host') ?? h.get('host');
  } catch {
    return null;
  }
}

/** Should the current environment be indexable? Only the production domain. */
export function isIndexableEnv(): boolean {
  return isProductionHost(getRequestHost());
}

/** Build hreflang alternates map (absolute corpand.ad URLs) for a page. */
function buildLanguages(page: PageKey): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = pageUrl(loc, page);
  }
  languages['x-default'] = pageUrl(DEFAULT_LOCALE, page);
  return languages;
}

/**
 * Build complete per-page Metadata: title, description, canonical (self-referential,
 * always on corpand.ad), hreflang, Open Graph, Twitter, and robots.
 */
export function buildPageMetadata(locale: string, page: PageKey): Metadata {
  const seo = getSeo(page, locale);
  const canonical = pageUrl(locale, page);
  const indexable = isIndexableEnv();

  return {
    title: seo.title,
    description: seo.description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
      languages: buildLanguages(page),
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: SITE_NAME }],
      locale: OG_LOCALE[locale] ?? OG_LOCALE[DEFAULT_LOCALE],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [`${SITE_URL}/og-image.png`],
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      ],
      shortcut: '/favicon.svg',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        }
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}
