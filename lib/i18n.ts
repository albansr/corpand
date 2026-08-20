import caMessages from '@/messages/ca.json';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';
import frMessages from '@/messages/fr.json';
import deMessages from '@/messages/de.json';
import ptMessages from '@/messages/pt.json';

const allMessages: Record<string, Record<string, any>> = {
  ca: caMessages,
  es: esMessages,
  en: enMessages,
  fr: frMessages,
  de: deMessages,
  pt: ptMessages,
};

export function getMessages(locale: string): Record<string, any> {
  return allMessages[locale] ?? allMessages.ca ?? {};
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

export function createTranslator(locale: string, namespace?: string) {
  const msgs = getMessages(locale);
  const fallbackMsgs = getMessages('ca');
  const baseObj = namespace ? getNestedValue(msgs, namespace) : msgs;
  const fallbackBase = namespace ? getNestedValue(fallbackMsgs, namespace) : fallbackMsgs;

  const t = (key: string, params?: Record<string, string>): string => {
    let val = getNestedValue(baseObj, key);
    if (val == null) val = getNestedValue(fallbackBase, key);
    if (val == null) val = key;
    if (typeof val !== 'string') return String(val ?? key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = (val as string).replace(`{${k}}`, v);
      });
    }
    return val as string;
  };

  t.raw = (key: string): any => {
    const v = getNestedValue(baseObj, key);
    return v != null ? v : getNestedValue(fallbackBase, key);
  };

  return t;
}
