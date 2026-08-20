import { createTranslator } from '@/lib/i18n';
import { HeroSection } from '@/components/hero-section';
import { GoldDivider } from '@/components/gold-divider';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { webPageSchema } from '@/lib/structured-data';
import { CookieSettingsButton } from '@/components/cookie-settings-button';

const HERO_IMG = '/hero-privacitat.jpg';

type CookieRow = {
  name: string;
  provider: string;
  purpose: string;
  category: string;
  duration: string;
  type: string;
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'cookies');
}

export default function CookiesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = createTranslator(locale, 'cookies');

  const sections = (t.raw('sections') as Array<{ title: string; body: string }>) ?? [];
  const rows = (t.raw('table') as CookieRow[]) ?? [];
  const cols = (t.raw('tableCols') as Record<string, string>) ?? {};

  return (
    <>
      <JsonLd data={webPageSchema(locale, 'cookies')} />
      <HeroSection imageUrl={HERO_IMG} title={t('heroTitle')} subtitle={t('heroSubtitle')} compact />
      <Breadcrumbs locale={locale} page="cookies" />

      <section className="bg-offwhite py-24">
        <div className="max-w-[900px] mx-auto px-6">
          <p className="text-base font-light text-charcoal/70 leading-relaxed text-center max-w-[720px] mx-auto">
            {t('intro')}
          </p>
          <GoldDivider className="mx-auto mt-10 mb-4" />

          {/* Cookie inventory table (from the real audit — no invented services) */}
          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-charcoal/15">
                  <th className="py-3 pr-4 text-[11px] font-medium tracking-wider uppercase text-charcoal/60">{cols.name}</th>
                  <th className="py-3 pr-4 text-[11px] font-medium tracking-wider uppercase text-charcoal/60">{cols.provider}</th>
                  <th className="py-3 pr-4 text-[11px] font-medium tracking-wider uppercase text-charcoal/60">{cols.purpose}</th>
                  <th className="py-3 pr-4 text-[11px] font-medium tracking-wider uppercase text-charcoal/60">{cols.category}</th>
                  <th className="py-3 pr-4 text-[11px] font-medium tracking-wider uppercase text-charcoal/60">{cols.duration}</th>
                  <th className="py-3 text-[11px] font-medium tracking-wider uppercase text-charcoal/60">{cols.type}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-charcoal/10 align-top">
                    <td className="py-3 pr-4 text-sm font-normal text-charcoal">{r.name}</td>
                    <td className="py-3 pr-4 text-sm font-light text-charcoal/70">{r.provider}</td>
                    <td className="py-3 pr-4 text-sm font-light text-charcoal/70">{r.purpose}</td>
                    <td className="py-3 pr-4 text-sm font-light text-charcoal/70">{r.category}</td>
                    <td className="py-3 pr-4 text-sm font-light text-charcoal/70">{r.duration}</td>
                    <td className="py-3 text-sm font-light text-charcoal/70">{r.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-14 space-y-12">
            {sections.map((s, i) => (
              <div key={i}>
                <h2 className="text-lg md:text-xl font-normal text-charcoal tracking-wide mb-3">{s.title}</h2>
                <p className="text-sm font-light text-charcoal/70 leading-relaxed whitespace-pre-line">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="text-sm font-light text-charcoal/70 mb-5">{t('manageIntro')}</p>
            <CookieSettingsButton label={t('manageButton')} />
          </div>

          <div className="mt-16 pt-8 border-t border-charcoal/10">
            <p className="text-sm font-light text-charcoal/60 leading-relaxed text-center">{t('contactNote')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
