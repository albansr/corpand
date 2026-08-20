/**
 * Build a locale-aware path. Default locale (ca) has no prefix.
 */
export function getLocalePath(locale: string, path: string): string {
  if (!path?.startsWith('/')) path = `/${path ?? ''}`;
  if (locale === 'ca' || !locale) return path;
  return `/${locale}${path}`;
}
