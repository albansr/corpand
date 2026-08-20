'use client';

import { useTranslations, useLocale } from '@/components/i18n-provider';
import Link from 'next/link';
import { LogoMark } from './logo-mark';
import { useConsent } from '@/components/consent-provider';

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const { openSettings } = useConsent();
  const year = new Date().getFullYear();
  const prefix = locale === 'ca' ? '' : `/${locale}`;
  const lh = (p: string) => `${prefix}${p}`;

  return (
    <footer className="bg-navy text-offwhite">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <LogoMark className="items-start text-offwhite" />
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href={lh('/')} className="text-xs font-light tracking-wider uppercase text-stone hover:text-gold transition-colors">
              {t('nav.inici')}
            </Link>
            <Link href={lh('/vendre-empresa')} className="text-xs font-light tracking-wider uppercase text-stone hover:text-gold transition-colors">
              {t('nav.vendre')}
            </Link>
            <Link href={lh('/comprar-empresa')} className="text-xs font-light tracking-wider uppercase text-stone hover:text-gold transition-colors">
              {t('nav.comprar')}
            </Link>
            <Link href={lh('/valoracio')} className="text-xs font-light tracking-wider uppercase text-stone hover:text-gold transition-colors">
              {t('nav.valoracio')}
            </Link>
            <Link href={lh('/contacte')} className="text-xs font-light tracking-wider uppercase text-stone hover:text-gold transition-colors">
              {t('nav.contacte')}
            </Link>
          </nav>
        </div>
        <div className="w-full h-px bg-white/10 my-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-xs font-light text-stone/60 order-2 md:order-1">
            {t('footer.rights', { year: String(year) })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 order-1 md:order-2">
            <Link href={lh('/avis-legal')} className="text-xs font-light text-stone/60 hover:text-gold transition-colors">
              {t('nav.avisLegal')}
            </Link>
            <Link href={lh('/privacitat')} className="text-xs font-light text-stone/60 hover:text-gold transition-colors">
              {t('nav.privacitat')}
            </Link>
            <Link href={lh('/cookies')} className="text-xs font-light text-stone/60 hover:text-gold transition-colors">
              {t('nav.cookies')}
            </Link>
            <button
              type="button"
              onClick={openSettings}
              className="text-xs font-light text-stone/60 hover:text-gold transition-colors"
            >
              {t('nav.configurarCookies')}
            </button>
          </div>
        </div>
        <p className="mt-6 text-xs font-light text-stone/40 text-center md:text-left">
          {t('footer.confidentiality')}
        </p>
      </div>
    </footer>
  );
}
