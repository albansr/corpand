import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SITE_URL, isProductionHost } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * Dynamic robots.txt.
 * - On any non-production host (e.g. the staging *.abacusai.app preview) the whole
 *   site is disallowed so it stays out of search indexes before launch.
 * - On the production domain (corpand.ad) crawling is allowed (except /api) and the
 *   sitemap is referenced with its absolute corpand.ad URL.
 */
export default function robots(): MetadataRoute.Robots {
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');

  if (!isProductionHost(host)) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
