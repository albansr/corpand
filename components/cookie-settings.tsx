'use client';

import { useEffect, useState } from 'react';
import { useConsent } from '@/components/consent-provider';
import { useTranslations, useLocale } from '@/components/i18n-provider';
import { getLocalePath } from '@/lib/locale-link';
import Link from 'next/link';
import { X } from 'lucide-react';

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-gold' : 'bg-stone/40'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/**
 * Granular cookie-preference manager. Necessary cookies are always on and
 * cannot be toggled; optional categories default to OFF (opt-out).
 * Reachable any time from the footer “Configurar cookies” control (§13).
 */
export function CookieSettings() {
  const { showSettings, closeSettings, consent, save, rejectAll, acceptAll } = useConsent();
  const t = useTranslations('cookies');
  const locale = useLocale();

  const [analitiques, setAnalitiques] = useState(false);
  const [marqueting, setMarqueting] = useState(false);

  useEffect(() => {
    if (showSettings) {
      setAnalitiques(consent?.categories.analitiques ?? false);
      setMarqueting(consent?.categories.marqueting ?? false);
    }
  }, [showSettings, consent]);

  if (!showSettings) return null;

  const categories = [
    { key: 'necessaries', on: true, locked: true },
    { key: 'analitiques', on: analitiques, locked: false, set: setAnalitiques },
    { key: 'marqueting', on: marqueting, locked: false, set: setMarqueting },
  ] as const;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-navy/70 backdrop-blur-sm" onClick={closeSettings} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('settings.title')}
        className="relative w-full sm:max-w-[560px] max-h-[90vh] overflow-y-auto bg-offwhite rounded-t-2xl sm:rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal/10">
          <h2 className="text-base font-normal tracking-wide text-charcoal">{t('settings.title')}</h2>
          <button type="button" onClick={closeSettings} aria-label={t('settings.close')} className="text-charcoal/50 hover:text-charcoal">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-xs font-light leading-relaxed text-charcoal/70">
            {t('settings.intro')}{' '}
            <Link href={getLocalePath(locale, '/cookies')} className="text-gold hover:underline">
              {t('settings.policyLink')}
            </Link>
            .
          </p>

          <div className="mt-6 space-y-5">
            {categories.map((c) => (
              <div key={c.key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-normal text-charcoal">{t(`settings.cat.${c.key}.name`)}</p>
                  <p className="text-xs font-light leading-relaxed text-charcoal/60 mt-0.5">
                    {t(`settings.cat.${c.key}.desc`)}
                  </p>
                </div>
                {c.locked ? (
                  <span className="text-[10px] font-medium tracking-wider uppercase text-gold mt-1 shrink-0">
                    {t('settings.always')}
                  </span>
                ) : (
                  <Toggle checked={c.on} onChange={c.set} label={t(`settings.cat.${c.key}.name`)} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-6 py-5 border-t border-charcoal/10">
          <button
            type="button"
            onClick={rejectAll}
            className="flex-1 px-4 py-2.5 text-xs font-medium tracking-wider uppercase rounded border border-charcoal/20 text-charcoal hover:border-gold hover:text-gold transition-colors"
          >
            {t('settings.rejectAll')}
          </button>
          <button
            type="button"
            onClick={() => save({ necessaries: true, analitiques, marqueting })}
            className="flex-1 px-4 py-2.5 text-xs font-medium tracking-wider uppercase rounded border border-charcoal/20 text-charcoal hover:border-gold hover:text-gold transition-colors"
          >
            {t('settings.save')}
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="flex-1 px-4 py-2.5 text-xs font-medium tracking-wider uppercase rounded bg-gold text-navy hover:bg-gold/90 transition-colors"
          >
            {t('settings.acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
