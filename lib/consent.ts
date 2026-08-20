/**
 * Cookie-consent model for CORPAND.
 *
 * Only technically-necessary cookies (e.g. NEXT_LOCALE, the consent cookie
 * itself) run without consent. Any consent-requiring integration (currently
 * only Google Analytics / GTM, and ONLY when its NEXT_PUBLIC_* id is set) must
 * be gated behind the corresponding category below (prior blocking).
 *
 * IMPORTANT: bump POLICY_VERSION whenever the cookie or privacy policy text
 * changes materially, so previously-recorded consents can be distinguished.
 */

export const POLICY_VERSION = '2026-08-20';

export const CONSENT_COOKIE = 'corpand_consent';
// 180 days — after this the banner reappears to re-confirm consent.
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

export type ConsentCategories = {
  /** Always true — strictly necessary cookies cannot be disabled. */
  necessaries: true;
  analitiques: boolean;
  marqueting: boolean;
};

export type ConsentState = {
  version: string;
  /** ISO timestamp of when consent was given/updated. */
  date: string;
  categories: ConsentCategories;
};

export const DENY_ALL: ConsentCategories = {
  necessaries: true,
  analitiques: false,
  marqueting: false,
};

export const ACCEPT_ALL: ConsentCategories = {
  necessaries: true,
  analitiques: true,
  marqueting: true,
};

/**
 * Whether the site currently ships ANY consent-requiring cookie/script.
 * Reads NEXT_PUBLIC_* ids (inlined at build). If nothing optional is
 * configured, the banner never appears (honest: only necessary cookies),
 * but the preference manager stays reachable from the footer.
 */
export function hasOptionalCookies(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GTM_ID
  );
}

export function parseConsent(raw: string | undefined | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as ConsentState;
    if (!parsed || typeof parsed !== 'object' || !parsed.categories) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readConsentCookie(): ConsentState | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  return parseConsent(match.split('=').slice(1).join('='));
}

export function writeConsentCookie(categories: ConsentCategories): ConsentState {
  const state: ConsentState = {
    version: POLICY_VERSION,
    date: new Date().toISOString(),
    categories,
  };
  if (typeof document !== 'undefined') {
    const value = encodeURIComponent(JSON.stringify(state));
    document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax`;
    try {
      window.localStorage.setItem(CONSENT_COOKIE, JSON.stringify(state));
    } catch {
      /* ignore storage errors */
    }
  }
  return state;
}
