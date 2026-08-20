import { createTranslator } from '@/lib/i18n';
import { HeroSection } from '@/components/hero-section';
import { GoldDivider } from '@/components/gold-divider';
import { ContactForm } from '@/components/contact-form';
import { ClipboardCheck, FileText, UserCheck, Handshake, Lock } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { webPageSchema, serviceSchema } from '@/lib/structured-data';
import { getSeo, pageUrl } from '@/lib/site';

const HERO_IMG = '/hero-vendre.jpg';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'vendre-empresa');
}

export default function VendrePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = createTranslator(locale, 'vendre');
  const seo = getSeo('vendre-empresa', locale);

  const steps = [
    { icon: ClipboardCheck, title: t('step1title'), desc: t('step1desc') },
    { icon: FileText, title: t('step2title'), desc: t('step2desc') },
    { icon: UserCheck, title: t('step3title'), desc: t('step3desc') },
    { icon: Handshake, title: t('step4title'), desc: t('step4desc') },
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageSchema(locale, 'vendre-empresa'),
          serviceSchema({
            name: seo.title,
            description: seo.description,
            url: pageUrl(locale, 'vendre-empresa'),
            serviceType: 'Company sale advisory (M&A sell-side)',
          }),
        ]}
      />
      <HeroSection imageUrl={HERO_IMG} title={t('heroTitle')} subtitle={t('heroSubtitle')} compact />
      <Breadcrumbs locale={locale} page="vendre-empresa" />

      <section className="bg-offwhite py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide">{t('introTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed">{t('introDesc')}</p>
        </div>
      </section>

      <section className="bg-navy py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-offwhite tracking-wide text-center">{t('processTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <s.icon className="text-gold" size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-normal text-offwhite mb-2">{`${i + 1}. ${s.title}`}</h3>
                  <p className="text-sm font-light text-stone leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-offwhite py-24">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <Lock className="text-gold mx-auto mb-4" size={36} strokeWidth={1.5} />
          <h2 className="text-2xl font-light text-charcoal tracking-wide">{t('confidTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed">{t('confidDesc')}</p>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-[700px] mx-auto px-6">
          <h2 className="text-2xl font-light text-charcoal tracking-wide text-center">{t('formTitle')}</h2>
          <p className="mt-3 text-sm text-charcoal/60 font-light text-center">{t('formSubtitle')}</p>
          <GoldDivider className="mx-auto mt-6 mb-10" />
          <ContactForm defaultTipus="vendre" />
        </div>
      </section>
    </>
  );
}
