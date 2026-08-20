'use client';

import { useTranslations, useLocale } from '@/components/i18n-provider';
import { getLocalePath } from '@/lib/locale-link';
import Link from 'next/link';
import { Info } from 'lucide-react';

type Props = {
  privacyChecked: boolean;
  onPrivacyChange: (v: boolean) => void;
  commercialChecked: boolean;
  onCommercialChange: (v: boolean) => void;
};

/**
 * Shared first-layer data-protection block + mandatory privacy consent and
 * (separate, optional) commercial-communications consent. Reused by every
 * public form so the wording and legal basis stay consistent.
 *
 * - Privacy checkbox: REQUIRED, not pre-checked, links to the privacy policy.
 * - Commercial checkbox: OPTIONAL, independent, never blocks submission and is
 *   recorded separately.
 */
/** Just the first-layer data-protection info block + sensitive-docs note. */
export function FormLegalNotice() {
  const t = useTranslations('formLegal');
  const locale = useLocale();
  const privacyHref = getLocalePath(locale, '/privacitat');

  const rows: Array<{ k: string; v: string }> = [
    { k: t('notice.responsableLabel'), v: t('notice.responsable') },
    { k: t('notice.finalitatLabel'), v: t('notice.finalitat') },
    { k: t('notice.legitimacioLabel'), v: t('notice.legitimacio') },
    { k: t('notice.destinatarisLabel'), v: t('notice.destinataris') },
    { k: t('notice.dretsLabel'), v: t('notice.drets') },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded border border-stone/25 bg-offwhite/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-gold" />
          <p className="text-xs font-medium tracking-wider uppercase text-charcoal/70">{t('notice.title')}</p>
        </div>
        <dl className="space-y-1.5">
          {rows.map((r, i) => (
            <div key={i} className="text-xs font-light leading-relaxed text-charcoal/70">
              <dt className="inline font-normal text-charcoal/80">{r.k}: </dt>
              <dd className="inline">{r.v}</dd>
            </div>
          ))}
          <p className="text-xs font-light leading-relaxed text-charcoal/70 pt-1">
            {t('notice.mesInfoLabel')}:{' '}
            <Link href={privacyHref} target="_blank" className="text-gold hover:underline">
              {t('notice.privacyLink')}
            </Link>
            .
          </p>
        </dl>
      </div>
      <p className="text-xs font-light leading-relaxed text-charcoal/50">{t('sensitiveNote')}</p>
    </div>
  );
}

export function FormLegal({ privacyChecked, onPrivacyChange, commercialChecked, onCommercialChange }: Props) {
  const t = useTranslations('formLegal');
  const locale = useLocale();
  const privacyHref = getLocalePath(locale, '/privacitat');

  return (
    <div className="space-y-5">
      <FormLegalNotice />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="consentPrivacitat"
          checked={privacyChecked}
          onChange={(e) => onPrivacyChange(e.target.checked)}
          required
          className="mt-1 accent-gold"
        />
        <span className="text-sm font-light text-charcoal/70 leading-relaxed">
          {t('privacyConsent')}{' '}
          <Link href={privacyHref} target="_blank" className="text-gold hover:underline">
            {t('notice.privacyLink')}
          </Link>
          .
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="consentComercial"
          checked={commercialChecked}
          onChange={(e) => onCommercialChange(e.target.checked)}
          className="mt-1 accent-gold"
        />
        <span className="text-sm font-light text-charcoal/70 leading-relaxed">{t('commercialConsent')}</span>
      </label>
    </div>
  );
}
