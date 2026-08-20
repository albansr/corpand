/**
 * JSON-LD structured-data builders for CORPAND.
 *
 * RULE: no invented data. Only facts that are real and justifiable are included
 * (name, Andorra as the served country, contact email, available languages).
 * Street address, phone, social profiles (sameAs), founders and team are
 * intentionally omitted until confirmed — see PENDING items in the report.
 */
import {
  SITE_URL,
  SITE_NAME,
  CONTACT_EMAIL,
  LOCALES,
  pageUrl,
  getSeo,
  type PageKey,
} from '@/lib/site';

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    image: `${SITE_URL}/og-image.png`,
    description:
      "Boutique andorrana d'operacions corporatives: venda i adquisició d'empreses i implantació a Andorra.",
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AD',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Andorra',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: CONTACT_EMAIL,
      contactType: 'customer service',
      availableLanguage: ['ca', 'en', 'fr', 'de', 'pt'],
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: [...LOCALES],
    publisher: { '@id': ORG_ID },
  };
}

export function webPageSchema(locale: string, page: PageKey) {
  const seo = getSeo(page, locale);
  const url = pageUrl(locale, page);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: seo.title,
    description: seo.description,
    inLanguage: locale,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    url: opts.url,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Andorra' },
  };
}

export function contactPageSchema(locale: string) {
  const url = pageUrl(locale, 'contacte');
  const seo = getSeo('contacte', locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${url}#webpage`,
    url,
    name: seo.title,
    description: seo.description,
    inLanguage: locale,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
  };
}

export function aboutPageSchema(locale: string) {
  const url = pageUrl(locale, 'corpand');
  const seo = getSeo('corpand', locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${url}#webpage`,
    url,
    name: seo.title,
    description: seo.description,
    inLanguage: locale,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
  };
}
