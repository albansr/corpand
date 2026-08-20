import { createTranslator } from '@/lib/i18n';
import { HeroSection } from '@/components/hero-section';
import { GoldDivider } from '@/components/gold-divider';
import { ContactForm } from '@/components/contact-form';
import { Mail, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { contactPageSchema } from '@/lib/structured-data';

const HERO_IMG = '/hero-contacte.jpg';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'contacte');
}

export default function ContactePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = createTranslator(locale, 'contacte');

  return (
    <>
      <JsonLd data={contactPageSchema(locale)} />
      <HeroSection imageUrl={HERO_IMG} title={t('heroTitle')} subtitle={t('heroSubtitle')} compact />
      <Breadcrumbs locale={locale} page="contacte" />

      <section className="bg-offwhite py-24">
        <div className="max-w-[700px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide text-center">{t('introTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-6" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed text-center mb-12">{t('introDesc')}</p>
          <ContactForm />
        </div>
      </section>

      {/* Email + digital philosophy */}
      <section className="bg-navy py-20">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <Mail className="text-gold mx-auto mb-5" size={32} strokeWidth={1.5} />
          <a
            href="mailto:contacte@corpand.ad"
            className="text-xl md:text-2xl font-light text-offwhite tracking-wide hover:text-gold transition-colors"
          >
            <span suppressHydrationWarning>contacte@corpand.ad</span>
          </a>
          <GoldDivider className="mx-auto mt-8 mb-8" />
          <h3 className="text-lg md:text-xl font-light text-offwhite tracking-wide mb-4">{t('digitalTitle')}</h3>
          <p className="text-sm font-light text-stone leading-relaxed">{t('digitalDesc')}</p>
          <p className="mt-6 text-xs tracking-[0.2em] uppercase text-gold/80">{t('digitalTagline')}</p>
        </div>
      </section>
    </>
  );
}
