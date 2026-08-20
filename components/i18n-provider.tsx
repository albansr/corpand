'use client';

import { createContext, useContext, type ReactNode } from 'react';

type Messages = Record<string, any>;

interface I18nContextValue {
  locale: string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'ca',
  messages: {},
});

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Messages;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLocale(): string {
  return useContext(I18nContext).locale;
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

export function useTranslations(namespace?: string) {
  const { messages } = useContext(I18nContext);
  const baseObj = namespace ? getNestedValue(messages, namespace) : messages;

  const t = (key: string, params?: Record<string, string>): string => {
    let val = getNestedValue(baseObj ?? {}, key);
    if (val == null) val = key;
    if (typeof val !== 'string') return String(val ?? key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = (val as string).replace(`{${k}}`, v);
      });
    }
    return val as string;
  };

  (t as any).raw = (key: string): any => getNestedValue(baseObj ?? {}, key);

  return t as typeof t & { raw: (key: string) => any };
}
