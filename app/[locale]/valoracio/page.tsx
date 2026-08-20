import { createTranslator } from '@/lib/i18n';
import { HeroSection } from '@/components/hero-section';
import { GoldDivider } from '@/components/gold-divider';
import { ValuationWizard } from '@/components/valuation-wizard';
import { Calculator, LineChart, ShieldCheck, Lock, BarChart3 } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { webPageSchema, serviceSchema } from '@/lib/structured-data';
import { getSeo, pageUrl } from '@/lib/site';

const HERO_IMG = '/hero-valoracio.jpg';

const HOW_ICONS = [Calculator, LineChart, ShieldCheck];

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'valoracio');
}

export default function ValoracioPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = createTranslator(locale, 'valoracio');
  const seo = getSeo('valoracio', locale);

  const how = (t.raw('page.how') as Array<{ title: string; desc: string }>) ?? [];

  return (
    <>
      <JsonLd
        data={[
          webPageSchema(locale, 'valoracio'),
          serviceSchema({
            name: seo.title,
            description: seo.description,
            url: pageUrl(locale, 'valoracio'),
            serviceType: 'Business valuation (M&A)',
          }),
        ]}
      />
      <HeroSection imageUrl={HERO_IMG} title={t('page.heroTitle')} subtitle={t('page.heroSubtitle')} compact />
      <Breadcrumbs locale={locale} page="valoracio" />

      <section className="bg-offwhite py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide">{t('page.introTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed">{t('page.introDesc')}</p>
        </div>
      </section>

      <section className="bg-navy py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-offwhite tracking-wide text-center">{t('page.howTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {how.map((s, i) => {
              const Icon = HOW_ICONS[i] ?? Calculator;
              return (
                <div key={i} className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-5">
                    <Icon className="text-gold" size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-normal text-offwhite mb-3">{s.title}</h3>
                  <p className="text-sm font-light text-stone leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <BarChart3 className="text-gold mx-auto mb-4" size={36} strokeWidth={1.5} />
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide">{t('page.methodTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed">{t('page.methodDesc')}</p>
        </div>
      </section>

      <section className="bg-offwhite py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <Lock className="text-gold mx-auto mb-4" size={36} strokeWidth={1.5} />
          <h2 className="text-2xl font-light text-charcoal tracking-wide">{t('page.securityTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed">{t('page.securityDesc')}</p>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-[880px] mx-auto px-6">
          <div className="text-center">
            <h2 className="text-2xl font-light text-charcoal tracking-wide">{t('page.startTitle')}</h2>
            <p className="mt-3 text-sm text-charcoal/60 font-light">{t('page.startDesc')}</p>
            <GoldDivider className="mx-auto mt-6 mb-10" />
          </div>
          <ValuationWizard />
        </div>
      </section>
    </>
  );
}
