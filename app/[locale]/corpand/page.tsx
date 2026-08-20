import { createTranslator } from '@/lib/i18n';
import { HeroSection } from '@/components/hero-section';
import { GoldDivider } from '@/components/gold-divider';
import { Target, ShieldCheck, Ruler, Eye, UsersRound } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { aboutPageSchema } from '@/lib/structured-data';

const HERO_IMG = 'https://s7g10.scene7.com/is/image/andorraturisme/grr_20130612__esglesia_sant_esteve_exterior-compressed';

const valueIcons = [Target, ShieldCheck, Ruler, Eye];

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'corpand');
}

export default function CORPANDPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = createTranslator(locale, 'about');
  const values = (t.raw('values') ?? []) as Array<{ title: string; desc: string }>;

  return (
    <>
      <JsonLd data={aboutPageSchema(locale)} />
      <HeroSection imageUrl={HERO_IMG} title={t('heroTitle')} subtitle={t('heroSubtitle')} compact />
      <Breadcrumbs locale={locale} page="corpand" />

      <section className="bg-offwhite py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide">{t('identityTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed">{t('identityDesc')}</p>
        </div>
      </section>

      <section className="bg-navy py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-xl font-light text-offwhite tracking-wide">{t('positioningTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <blockquote className="text-2xl md:text-3xl font-light text-gold tracking-wide leading-relaxed">
            &ldquo;{t('positioningQuote')}&rdquo;
          </blockquote>
          <p className="mt-8 text-base font-light text-stone leading-relaxed">{t('positioningDesc')}</p>
        </div>
      </section>

      <section className="bg-offwhite py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide text-center">{t('valuesTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {(values ?? []).map((v: any, i: number) => {
              const Icon = valueIcons[i] ?? Target;
              return (
                <div key={i} className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Icon className="text-gold" size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-charcoal mb-2">{v?.title ?? ''}</h3>
                    <p className="text-sm font-light text-charcoal/60 leading-relaxed">{v?.desc ?? ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-navy py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <UsersRound className="text-gold mx-auto mb-4" size={36} strokeWidth={1.5} />
          <h2 className="text-2xl font-light text-offwhite tracking-wide">{t('teamTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-stone leading-relaxed">{t('teamDesc')}</p>
        </div>
      </section>
    </>
  );
}
