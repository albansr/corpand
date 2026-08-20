import { createTranslator } from '@/lib/i18n';
import { HeroSection } from '@/components/hero-section';
import { GoldDivider } from '@/components/gold-divider';
import { Search, Filter, Layers, Users, CheckCircle2, Network, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { webPageSchema } from '@/lib/structured-data';

const HERO_IMG = 'https://s7g10.scene7.com/is/image/andorraturisme/andorraworld-desantis-carolina-2024-2024--Andorra-la-Vella--Carolina-De-Santis--Casa-de-la-Vall--horitzontal--nit-DSC00799';

const stepIcons = [Search, Filter, Layers, Users, CheckCircle2];

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'metode');
}

export default function MetodePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = createTranslator(locale, 'metode');
  const steps = (t.raw('steps') ?? []) as Array<{ title: string; desc: string }>;

  return (
    <>
      <JsonLd data={webPageSchema(locale, 'metode')} />
      <HeroSection imageUrl={HERO_IMG} title={t('heroTitle')} subtitle={t('heroSubtitle')} compact />
      <Breadcrumbs locale={locale} page="metode" />

      <section className="bg-offwhite py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide">{t('introTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed">{t('introDesc')}</p>
        </div>
      </section>

      <section className="bg-navy py-24">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="space-y-10">
            {(steps ?? []).map((step: any, i: number) => {
              const Icon = stepIcons[i] ?? Search;
              return (
                <div key={i} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <Icon className="text-gold" size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-normal text-offwhite mb-2">
                      <span className="text-gold mr-2">{`0${i + 1}`}</span>{step?.title ?? ''}
                    </h3>
                    <p className="text-sm font-light text-stone leading-relaxed">{step?.desc ?? ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-offwhite py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <Network className="text-gold mx-auto mb-4" size={36} strokeWidth={1.5} />
          <h2 className="text-2xl font-light text-charcoal tracking-wide">{t('networkTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed">{t('networkDesc')}</p>
        </div>
      </section>

      <section className="bg-navy py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <ShieldCheck className="text-gold mx-auto mb-4" size={36} strokeWidth={1.5} />
          <h2 className="text-2xl font-light text-offwhite tracking-wide">{t('discretionTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-stone leading-relaxed">{t('discretionDesc')}</p>
        </div>
      </section>
    </>
  );
}
