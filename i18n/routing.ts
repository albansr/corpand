import { defineRouting } from 'next-intl/routing';

export const locales = ['ca', 'es', 'en', 'fr', 'de', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'ca',
  localePrefix: 'as-needed',
});
