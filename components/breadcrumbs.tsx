import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createTranslator } from '@/lib/i18n';
import { getLocalePath } from '@/lib/locale-link';
import { pageUrl, PAGE_PATHS, type PageKey } from '@/lib/site';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/structured-data';

const PAGE_TO_NAV: Partial<Record<PageKey, string>> = {
  'vendre-empresa': 'vendre',
  'comprar-empresa': 'comprar',
  valoracio: 'valoracio',
  'perfil-inversor': 'perfilInversor',
  oportunitats: 'oportunitats',
  metode: 'metode',
  corpand: 'corpand',
  contacte: 'contacte',
  privacitat: 'privacitat',
  'avis-legal': 'avisLegal',
  cookies: 'cookies',
};

/**
 * Subtle breadcrumb trail for inner pages + matching BreadcrumbList JSON-LD.
 * Home page does not render breadcrumbs.
 */
export function Breadcrumbs({ locale, page }: { locale: string; page: PageKey }) {
  if (page === 'home') return null;
  const t = createTranslator(locale, 'nav');
  const homeLabel = t('inici');
  const navKey = PAGE_TO_NAV[page];
  const pageLabel = navKey ? t(navKey) : '';

  const homeHref = getLocalePath(locale, '/');
  const pageHref = getLocalePath(locale, PAGE_PATHS[page]);

  const schema = breadcrumbSchema([
    { name: homeLabel, url: pageUrl(locale, 'home') },
    { name: pageLabel, url: pageUrl(locale, page) },
  ]);

  return (
    <nav aria-label="Breadcrumb" className="bg-offwhite border-b border-charcoal/5">
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        <ol className="flex items-center gap-2 text-[11px] font-light tracking-[0.15em] uppercase text-charcoal/50">
          <li>
            <Link href={homeHref} className="hover:text-gold transition-colors">
              {homeLabel}
            </Link>
          </li>
          <li aria-hidden="true" className="flex items-center">
            <ChevronRight size={12} className="text-charcoal/30" />
          </li>
          <li aria-current="page" className="text-gold">
            {pageLabel}
          </li>
        </ol>
      </div>
      <JsonLd data={schema} />
    </nav>
  );
}
