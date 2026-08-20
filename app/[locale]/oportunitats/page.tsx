import { createTranslator } from '@/lib/i18n';
import { getLocalePath } from '@/lib/locale-link';
import { HeroSection } from '@/components/hero-section';
import { GoldDivider } from '@/components/gold-divider';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { webPageSchema } from '@/lib/structured-data';

const HERO_IMG = 'https://actividadesenandorra.com/nextImageExportOptimizer/tristaina-panoramica.9fe32698-opt-1920.WEBP';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'oportunitats');
}

export default function OportunitatsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = createTranslator(locale, 'oportunitats');
  const lp = (p: string) => getLocalePath(locale, p);

  return (
    <>
      <JsonLd data={webPageSchema(locale, 'oportunitats')} />
      <HeroSection imageUrl={HERO_IMG} title={t('heroTitle')} subtitle={t('heroSubtitle')} compact />
      <Breadcrumbs locale={locale} page="oportunitats" />

      <section className="bg-offwhite py-24 md:py-32">
        <div className="max-w-[760px] mx-auto px-6 text-center">
          <Lock className="text-gold mx-auto mb-6" size={36} strokeWidth={1.5} />
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide">{t('privateTitle')}</h2>
          <GoldDivider className="mx-auto mt-6 mb-8" />
          <p className="text-base font-light text-charcoal/70 leading-relaxed">{t('privateDesc')}</p>
          <Link
            href={lp('/contacte')}
            className="inline-block mt-10 px-8 py-3 bg-navy text-offwhite text-sm font-medium tracking-wider uppercase rounded hover:bg-navy/90 transition-colors duration-200"
          >
            {t('cta')}
          </Link>
        </div>
      </section>
    </>
  );
}
