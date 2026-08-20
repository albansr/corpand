'use client';

import { useConsent } from '@/components/consent-provider';

/**
 * Inline control to (re)open the cookie preference manager from within a page
 * (used on the cookie policy page). Withdrawal / change of consent (§13).
 */
export function CookieSettingsButton({ label }: { label: string }) {
  const { openSettings } = useConsent();
  return (
    <button
      type="button"
      onClick={openSettings}
      className="inline-flex items-center px-6 py-3 border border-navy/20 text-navy text-xs font-medium tracking-wider uppercase rounded hover:border-gold hover:text-gold transition-colors"
    >
      {label}
    </button>
  );
}
