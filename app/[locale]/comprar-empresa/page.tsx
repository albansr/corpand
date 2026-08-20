import { createTranslator } from '@/lib/i18n';
import { HeroSection } from '@/components/hero-section';
import { GoldDivider } from '@/components/gold-divider';
import { ContactForm } from '@/components/contact-form';
import { Building, Rocket, Gem } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { webPageSchema, serviceSchema } from '@/lib/structured-data';
import { getSeo, pageUrl } from '@/lib/site';

const HERO_IMG = '/hero-comprar.jpg';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'comprar-empresa');
}

export default function ComprarPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = createTranslator(locale, 'comprar');
  const seo = getSeo('comprar-empresa', locale);

  const criteria = [
    { icon: Building, title: t('c1title'), desc: t('c1desc') },
    { icon: Rocket, title: t('c2title'), desc: t('c2desc') },
    { icon: Gem, title: t('c3title'), desc: t('c3desc') },
  ];

  const processSteps = [t('p1'), t('p2'), t('p3'), t('p4')];

  return (
    <>
      <JsonLd
        data={[
          webPageSchema(locale, 'comprar-empresa'),
          serviceSchema({
            name: seo.title,
            description: seo.description,
            url: pageUrl(locale, 'comprar-empresa'),
            serviceType: 'Company acquisition advisory (M&A buy-side)',
          }),
        ]}
      />
      <HeroSection imageUrl={HERO_IMG} title={t('heroTitle')} subtitle={t('heroSubtitle')} compact />
      <Breadcrumbs locale={locale} page="comprar-empresa" />

      <section className="bg-offwhite py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide">{t('introTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed">{t('introDesc')}</p>
        </div>
      </section>

      <section className="bg-navy py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-offwhite tracking-wide text-center">{t('criteriaTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {criteria.map((c, i) => (
              <div key={i} className="p-8 rounded bg-white/5 text-center">
                <c.icon className="text-gold mx-auto mb-4" size={32} strokeWidth={1.5} />
                <h3 className="text-base font-normal text-offwhite mb-3">{c.title}</h3>
                <p className="text-sm font-light text-stone leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-offwhite py-24">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide text-center">{t('processTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-16" />
          <div className="space-y-6">
            {processSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-sm font-medium">{i + 1}</div>
                <p className="text-base font-light text-charcoal/70 leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-[700px] mx-auto px-6">
          <h2 className="text-2xl font-light text-charcoal tracking-wide text-center">{t('formTitle')}</h2>
          <p className="mt-3 text-sm text-charcoal/60 font-light text-center">{t('formSubtitle')}</p>
          <GoldDivider className="mx-auto mt-6 mb-10" />
          <ContactForm defaultTipus="comprar" />
        </div>
      </section>
    </>
  );
}
