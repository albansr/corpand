import { Montserrat } from 'next/font/google';
import { I18nProvider } from '@/components/i18n-provider';
import { getMessages } from '@/lib/i18n';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
import { JsonLd } from '@/components/json-ld';
import { organizationSchema, websiteSchema } from '@/lib/structured-data';
import { Analytics } from '@/components/analytics';
import { ConsentProvider } from '@/components/consent-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { CookieSettings } from '@/components/cookie-settings';
import { buildPageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

// Default (home) metadata; individual pages override with their own generateMetadata.
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildPageMetadata(params.locale, 'home');
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  // Merge Catalan as a base so any namespace not yet translated in another
  // locale falls back to Catalan instead of showing raw keys (merge is at the
  // namespace level, so fully-translated namespaces still override completely).
  const messages =
    locale === 'ca'
      ? getMessages('ca')
      : { ...getMessages('ca'), ...getMessages(locale) };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0B1D2D" />
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased bg-offwhite text-charcoal`}>
        <I18nProvider locale={locale} messages={messages}>
          <ConsentProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster />
            <ChunkLoadErrorHandler />
            <Analytics />
            <CookieBanner />
            <CookieSettings />
          </ConsentProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
