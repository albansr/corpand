'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ACCEPT_ALL,
  DENY_ALL,
  hasOptionalCookies,
  readConsentCookie,
  writeConsentCookie,
  type ConsentCategories,
  type ConsentState,
} from '@/lib/consent';

type ConsentContextValue = {
  /** Null until the user has decided (or on first server render). */
  consent: ConsentState | null;
  /** True once the client has read the stored cookie (avoids SSR mismatch). */
  ready: boolean;
  /** Whether the site ships any consent-requiring cookie at all. */
  hasOptional: boolean;
  showBanner: boolean;
  showSettings: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (categories: ConsentCategories) => void;
  openSettings: () => void;
  closeSettings: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const hasOptional = hasOptionalCookies();

  useEffect(() => {
    const stored = readConsentCookie();
    setConsent(stored);
    setReady(true);
    // Banner only when there ARE optional cookies AND no decision recorded yet.
    if (hasOptional && !stored) setShowBanner(true);
  }, [hasOptional]);

  const persist = useCallback((categories: ConsentCategories) => {
    const state = writeConsentCookie(categories);
    setConsent(state);
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  const acceptAll = useCallback(() => persist(ACCEPT_ALL), [persist]);
  const rejectAll = useCallback(() => persist(DENY_ALL), [persist]);
  const save = useCallback((c: ConsentCategories) => persist({ ...c, necessaries: true }), [persist]);
  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);

  return (
    <ConsentContext.Provider
      value={{
        consent,
        ready,
        hasOptional,
        showBanner,
        showSettings,
        acceptAll,
        rejectAll,
        save,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    // Safe fallback if used outside provider (should not happen).
    return {
      consent: null,
      ready: false,
      hasOptional: false,
      showBanner: false,
      showSettings: false,
      acceptAll: () => {},
      rejectAll: () => {},
      save: () => {},
      openSettings: () => {},
      closeSettings: () => {},
    };
  }
  return ctx;
}
