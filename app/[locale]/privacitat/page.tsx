import { createTranslator } from '@/lib/i18n';
import { HeroSection } from '@/components/hero-section';
import { GoldDivider } from '@/components/gold-divider';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { webPageSchema } from '@/lib/structured-data';

const HERO_IMG = '/hero-privacitat.jpg';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'privacitat');
}

export default function PrivacitatPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = createTranslator(locale, 'privacitat');

  const sections = (t.raw('sections') as Array<{ title: string; body: string }>) ?? [];
  const reviewNote = (t.raw('reviewNote') as string) || '';

  return (
    <>
      <JsonLd data={webPageSchema(locale, 'privacitat')} />
      <HeroSection imageUrl={HERO_IMG} title={t('heroTitle')} subtitle={t('heroSubtitle')} compact />
      <Breadcrumbs locale={locale} page="privacitat" />

      <section className="bg-offwhite py-24">
        <div className="max-w-[820px] mx-auto px-6">
          {reviewNote && (
            <p className="mb-8 text-xs font-light text-charcoal/60 leading-relaxed text-center italic border border-stone/30 rounded px-4 py-3 bg-white/60">{reviewNote}</p>
          )}
          <p className="text-base font-light text-charcoal/70 leading-relaxed text-center">{t('intro')}</p>
          <GoldDivider className="mx-auto mt-10 mb-4" />
          <div className="mt-8 space-y-12">
            {sections.map((s, i) => (
              <div key={i}>
                <h2 className="text-lg md:text-xl font-normal text-charcoal tracking-wide mb-3">{s.title}</h2>
                <p className="text-sm font-light text-charcoal/70 leading-relaxed whitespace-pre-line">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-charcoal/10">
            <p className="text-sm font-light text-charcoal/60 leading-relaxed text-center">{t('contactNote')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
