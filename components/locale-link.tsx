'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { ComponentProps } from 'react';

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const locale = useLocale();
  const localizedHref = locale === 'ca' || !locale ? href : `/${locale}${href}`;
  return <Link href={localizedHref} {...props} />;
}
