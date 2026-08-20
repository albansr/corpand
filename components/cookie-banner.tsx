'use client';

import { useConsent } from '@/components/consent-provider';
import { useTranslations, useLocale } from '@/components/i18n-provider';
import { getLocalePath } from '@/lib/locale-link';
import Link from 'next/link';

/**
 * First-layer cookie banner. Only shown when optional (consent-requiring)
 * cookies exist AND no decision has been recorded yet. Accept / Reject /
 * Configure are given comparable visual weight (no dark patterns).
 */
export function CookieBanner() {
  const { showBanner, ready, acceptAll, rejectAll, openSettings } = useConsent();
  const t = useTranslations('cookies');
  const locale = useLocale();

  if (!ready || !showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label={t('banner.title')}
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="max-w-[1100px] mx-auto bg-navy text-offwhite border border-white/10 rounded-lg shadow-2xl">
        <div className="p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-[640px]">
              <p className="text-sm font-normal tracking-wide text-offwhite mb-1.5">{t('banner.title')}</p>
              <p className="text-xs font-light leading-relaxed text-stone">
                {t('banner.body')}{' '}
                <Link href={getLocalePath(locale, '/cookies')} className="text-gold hover:underline">
                  {t('banner.policyLink')}
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={rejectAll}
                className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase rounded border border-stone/40 text-offwhite hover:border-gold hover:text-gold transition-colors"
              >
                {t('banner.reject')}
              </button>
              <button
                type="button"
                onClick={openSettings}
                className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase rounded border border-stone/40 text-offwhite hover:border-gold hover:text-gold transition-colors"
              >
                {t('banner.configure')}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase rounded bg-gold text-navy hover:bg-gold/90 transition-colors"
              >
                {t('banner.accept')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
