import { createTranslator } from '@/lib/i18n';
import { getLocalePath } from '@/lib/locale-link';
import { HeroSection } from '@/components/hero-section';
import { GoldDivider } from '@/components/gold-divider';
import Link from 'next/link';
import { Building2, Search, MapPin, Lightbulb, ShieldCheck, Filter, Users, Mountain } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { webPageSchema } from '@/lib/structured-data';

const HERO_IMG = '/hero-home.jpg';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'home');
}

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = createTranslator(locale);
  const lp = (p: string) => getLocalePath(locale, p);

  return (
    <>
      <JsonLd data={webPageSchema(locale, 'home')} />
      {/* Hero */}
      <HeroSection imageUrl={HERO_IMG} title={t('hero.title')} subtitle={t('hero.subtitle')}>
        <p className="text-sm md:text-base text-stone/90 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
          {t('hero.approach')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={lp('/vendre-empresa')}
            className="px-7 py-3 border border-gold text-gold text-sm font-normal tracking-wider uppercase rounded hover:bg-gold hover:text-navy transition-all duration-200"
          >
            {t('hero.cta1')}
          </Link>
          <Link
            href={lp('/comprar-empresa')}
            className="px-7 py-3 border border-gold text-gold text-sm font-normal tracking-wider uppercase rounded hover:bg-gold hover:text-navy transition-all duration-200"
          >
            {t('hero.cta2')}
          </Link>
          <Link
            href={lp('/oportunitats')}
            className="px-7 py-3 bg-gold text-navy text-sm font-medium tracking-wider uppercase rounded hover:bg-gold/90 transition-all duration-200"
          >
            {t('hero.cta3')}
          </Link>
        </div>
        <p className="mt-10 text-xs md:text-sm font-normal tracking-[0.25em] uppercase text-gold">
          {t('hero.tagline')}
        </p>
      </HeroSection>

      {/* Positioning */}
      <section className="bg-offwhite py-24 md:py-32">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide leading-relaxed">
            {t('positioning.title')}
          </h2>
          <GoldDivider className="mx-auto mt-8 mb-8" />
          <p className="text-base md:text-lg font-light text-charcoal/70 leading-relaxed">
            {t('positioning.description')}
          </p>
          <p className="mt-8 text-sm font-normal tracking-[0.2em] uppercase text-gold">
            {t('positioning.tagline')}
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="bg-navy py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-offwhite tracking-wide text-center">
            {t('services.title')}
          </h2>
          <GoldDivider className="mx-auto mt-6 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Building2, title: t('services.s1title'), desc: t('services.s1desc') },
              { icon: Search, title: t('services.s2title'), desc: t('services.s2desc') },
              { icon: MapPin, title: t('services.s3title'), desc: t('services.s3desc') },
              { icon: Lightbulb, title: t('services.s4title'), desc: t('services.s4desc') },
            ].map((s, i) => (
              <div
                key={i}
                className="p-8 rounded bg-white/5 hover:bg-white/[0.08] transition-colors duration-200"
              >
                <s.icon className="text-gold mb-4" size={28} strokeWidth={1.5} />
                <h3 className="text-lg font-normal text-offwhite mb-3">
                  {s.title}
                </h3>
                <p className="text-sm font-light text-stone leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CORPAND */}
      <section className="bg-offwhite py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-charcoal tracking-wide text-center">
            {t('whyCorpand.title')}
          </h2>
          <GoldDivider className="mx-auto mt-6 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: t('whyCorpand.r1title'), desc: t('whyCorpand.r1desc') },
              { icon: Filter, title: t('whyCorpand.r2title'), desc: t('whyCorpand.r2desc') },
              { icon: Users, title: t('whyCorpand.r3title'), desc: t('whyCorpand.r3desc') },
              { icon: Mountain, title: t('whyCorpand.r4title'), desc: t('whyCorpand.r4desc') },
            ].map((r, i) => (
              <div key={i} className="text-center">
                <r.icon className="text-gold mx-auto mb-4" size={32} strokeWidth={1.5} />
                <h3 className="text-base font-medium text-charcoal mb-3">
                  {r.title}
                </h3>
                <p className="text-sm font-light text-charcoal/60 leading-relaxed">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-20 md:py-28">
        <img
          src="/hero-vendre.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-navy/80" />
        <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-offwhite tracking-wide">
            {t('ctaBanner.title')}
          </h2>
          <p className="mt-4 text-base text-stone font-light">
            {t('ctaBanner.subtitle')}
          </p>
          <Link
            href={lp('/contacte')}
            className="inline-block mt-8 px-8 py-3 bg-gold text-navy text-sm font-medium tracking-wider uppercase rounded hover:bg-gold/90 transition-colors duration-200"
          >
            {t('ctaBanner.button')}
          </Link>
        </div>
      </section>
    </>
  );
}
