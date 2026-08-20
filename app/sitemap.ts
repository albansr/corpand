import type { MetadataRoute } from 'next';
import {
  INDEXABLE_PAGES,
  SITEMAP_META,
  LOCALES,
  DEFAULT_LOCALE,
  pageUrl,
} from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * Dynamic sitemap.xml.
 * Lists every indexable page in every locale using absolute corpand.ad URLs,
 * with hreflang alternates (languages) so search engines see the equivalents.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const page of INDEXABLE_PAGES) {
    const meta = SITEMAP_META[page];
    const languages: Record<string, string> = {};
    for (const l of LOCALES) languages[l] = pageUrl(l, page);
    languages['x-default'] = pageUrl(DEFAULT_LOCALE, page);

    for (const locale of LOCALES) {
      entries.push({
        url: pageUrl(locale, page),
        lastModified: now,
        changeFrequency: meta.changeFrequency,
        priority: meta.priority,
        alternates: { languages },
      });
    }
  }

  return entries;
}
